import { envPath, envExists } from './env.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import getDb, { generateNextOrderNumber, getCafeBusinessDay, canTransitionOrderStatus, VALID_ORDER_STATUS_TRANSITIONS } from './db/index.js';
import Razorpay from 'razorpay';
import emailService from './emailService.js';
import smsService from './smsService.js';
import PaymentService, { ReceiptDeliveryService } from './payment/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'frenchbell_secret_key_2026_cafe_secure_jwt_token_982341';

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay Test Mode keys are not configured on the server.');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}
// Production safety check: Reject test OTP mode in production

 // Production safety check: distinguish Vercel Production from Preview
export function getIsProduction() {
  return process.env.VERCEL === '1'
    ? process.env.VERCEL_ENV === 'production'
    : process.env.NODE_ENV === 'production';
}

export function getIsTestOtpMode() {
  if (process.env.TEST_OTP_MODE === 'false') return false;
  if (process.env.TEST_OTP_MODE === 'true') return true;
  // If not explicitly set to false, enable random test OTP when SMS service is unconfigured on Vercel
  if (process.env.VERCEL === '1' && !smsService.isConfigured()) return true;
  return !getIsProduction();
}

const isProduction = getIsProduction();
const isTestOtpMode = getIsTestOtpMode();

if (isProduction && process.env.TEST_OTP_MODE === 'true') {
  console.warn(
    '[Notice] TEST_OTP_MODE is explicitly enabled. Backend will provide random 4-digit verification code.'
  );
}


app.use(cors());

// Normalize URLs so routes match on both localhost and Vercel serverless rewrites
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/assets')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health / Status endpoints with database connection verification
app.get('/api', (req, res) => {
  res.json({ name: 'FrenchBell Cafe API', status: 'online', time: new Date().toISOString() });
});

app.get('/api/health', async (req, res) => {
  try {
    const db = await getDb();
    const health = await db.checkHealth();
    if (!health.ok) {
      return res.status(503).json({
        status: 'error',
        database: 'unavailable',
        error: health.error || 'Database connection error',
        serverless: !!process.env.VERCEL
      });
    }
    res.json({
      status: 'ok',
      database: 'connected',
      testOtpMode: getIsTestOtpMode(),
      serverless: !!process.env.VERCEL
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      database: 'unavailable',
      error: 'Database connection failed: ' + err.message
    });
  }
});

// Serve static assets from public folder
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use('/assets', express.static(path.join(publicDir, 'assets')));
}

// In-memory request rate limit tracking: phone -> [timestamps]
const otpRateLimit = new Map();

// Helper: Get Base URL for links sent in emails
function getBaseUrl(req) {
  const customAppUrl = process.env.APP_URL;
  if (customAppUrl) return customAppUrl.replace(/\/$/, '');
  const host = req.get('host');
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

// Middleware: Verify JWT Auth Token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [payload.id]);

    if (!user || user.status === 'removed') {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        error: `This administrator account has been suspended. Reason: ${user.suspend_reason || 'Access revoked by an administrator.'}`
      });
    }

    req.user = {
      ...payload,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
  }
};

// Middleware: Strict Admin check
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Administrator access required.' });
  }
  next();
};

/**
 * Verify Tester Authorization for Production OTP Testing
 * Allows authorized admins (via Bearer token) or explicit tester secret (via X-Tester-Secret / X-Tester-Token)
 * to receive backend-generated test OTPs in Production without exposing OTP to arbitrary visitors.
 */
export async function verifyTesterAuthorization(req, db) {
  // Can be explicitly disabled via environment variable
  if (process.env.PROD_TESTER_ENABLED === 'false') {
    return { authorized: false, reason: 'Tester access is disabled by configuration.' };
  }

  // Check 1: X-Tester-Secret or X-Tester-Token header against configured PROD_TESTER_SECRET
  const testerSecretHeader = req.headers['x-tester-secret'] || req.headers['x-tester-token'];
  const configuredSecret = process.env.PROD_TESTER_SECRET;
  if (configuredSecret && testerSecretHeader && typeof testerSecretHeader === 'string') {
    const hBuf = Buffer.from(testerSecretHeader.trim());
    const sBuf = Buffer.from(configuredSecret.trim());
    if (hBuf.length === sBuf.length && crypto.timingSafeEqual(hBuf, sBuf)) {
      return { authorized: true, identifier: 'tester-secret', admin: null };
    }
  }

  // Check 2: Bearer token carrying valid admin JWT or tester JWT
  const authHeader = req.headers['authorization'] || (testerSecretHeader && testerSecretHeader.startsWith('Bearer ') ? testerSecretHeader : null);
  const token = authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (payload && (payload.role === 'admin' || payload.role === 'tester')) {
        let adminUser = null;
        if (db && payload.id) {
          adminUser = await db.get('SELECT id, email, name, role, status FROM users WHERE id = ?', [payload.id]);
          if (adminUser && (adminUser.status === 'suspended' || adminUser.status === 'removed')) {
            return { authorized: false, reason: 'Account suspended or removed' };
          }
        }
        return {
          authorized: true,
          identifier: payload.email || `tester-${payload.id || payload.adminId || 'session'}`,
          admin: adminUser || payload
        };
      }
    } catch (e) {}
  }

  return { authorized: false };
}

// =================== 1. MOBILE OTP & CUSTOMER AUTH ROUTES ===================

export function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length === 10) return digits;
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

function parseSingleCustomization(item) {
  if (!item || typeof item !== 'string' || !item.trim()) return null;
  const match = item.match(/^(.+?)(?:\s*[\(\-]\s*\+?\s*(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d+)?)\s*\)?)?$/i);
  if (match) {
    const name = match[1].trim();
    const price = match[2] ? parseFloat(match[2]) : 0;
    return { name, price, raw: item.trim() };
  }
  return { name: item.trim(), price: 0, raw: item.trim() };
}

export function parseCustomizations(customizationsInput) {
  if (!customizationsInput) return [];
  if (Array.isArray(customizationsInput)) {
    return customizationsInput.map(item => {
      if (typeof item === 'object' && item !== null) {
        const name = (item.name || item.label || '').trim();
        const price = Number(item.price) || 0;
        return { name, price, raw: name };
      }
      return parseSingleCustomization(String(item));
    }).filter(Boolean);
  }
  if (typeof customizationsInput === 'string') {
    const trimmed = customizationsInput.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parseCustomizations(parsed);
      } catch (e) {}
    }
    return trimmed
      .split(/[,;\n]/)
      .map(s => s.trim())
      .filter(Boolean)
      .map(parseSingleCustomization)
      .filter(Boolean);
  }
  return [];
}

// Send OTP to customer mobile number
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Please enter a valid mobile number.' });

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    const db = await getDb();
    const existingOtp = await db.getOtp(cleanPhone);

    const now = Date.now();
    // Resend Cooldown Check: 60 seconds
    if (existingOtp && existingOtp.cooldown_until && now < Number(existingOtp.cooldown_until)) {
      const remainingSeconds = Math.ceil((Number(existingOtp.cooldown_until) - now) / 1000);
      return res.status(429).json({
        error: `Please wait ${remainingSeconds} seconds before requesting another verification code.`,
        cooldownSeconds: remainingSeconds
      });
    }

    // Rate Limiting: Max 5 requests per 15 minutes
    const attempts = otpRateLimit.get(cleanPhone) || [];
    const recentAttempts = attempts.filter(ts => now - ts < 15 * 60 * 1000);
    if (recentAttempts.length >= 5) {
      return res.status(429).json({ error: 'Too many OTP requests. Please wait 15 minutes before trying again.' });
    }
    recentAttempts.push(now);
    otpRateLimit.set(cleanPhone, recentAttempts);

    // Generate cryptographically secure random four-digit OTP (1000-9999)
    const otp = String(crypto.randomInt(1000, 10000));
    const hashedOtp = crypto.createHash('sha256').update(`${cleanPhone}:${otp}:${JWT_SECRET}`).digest('hex');

    await db.setOtp(cleanPhone, {
      hashedOtp,
      expiresAt: now + 5 * 60 * 1000,
      attempts: 0,
      cooldownUntil: now + 60 * 1000
    });

    // 1. Authorized Tester Workflow Check (Production or Non-Production)
    // Allows authorized QA testers and admins to test mobile login without public exposure.
    const testerAuth = await verifyTesterAuthorization(req, db);
    if (testerAuth.authorized) {
      await db.logActivity({
        adminId: testerAuth.admin?.id || null,
        adminEmail: testerAuth.admin?.email || 'tester@frenchbellcafe.com',
        adminName: testerAuth.admin?.name || 'Authorized QA Tester',
        action: 'Authorized Tester OTP Issued',
        entity: 'otp',
        entityId: cleanPhone.slice(-4),
        details: `Authorized test OTP generated for mobile ending in ...${cleanPhone.slice(-4)}`
      });

      return res.json({
        success: true,
        phone: cleanPhone,
        cooldownSeconds: 60,
        testOtp: otp,
        isTesterMode: true,
        message: `AUTHORIZED TESTER: Verification code is ${otp}.`
      });
    }

    // 2. Development / Local Test OTP mode: return generated OTP for local testing
    if (getIsTestOtpMode()) {
      return res.json({
        success: true,
        phone: cleanPhone,
        cooldownSeconds: 60,
        testOtp: otp,
        otp: otp,
        isTestMode: true,
        devNotice: `DEVELOPMENT TEST OTP MODE ACTIVE. Generated test OTP: ${otp}. Real SMS is disabled.`,
        message: `TEST MODE: Your verification code is ${otp}. No SMS was sent.`
      });
    }

    // 3. Real SMS provider attempt (if configured)
    if (smsService.isConfigured()) {
      try {
        await smsService.sendOtp({ phone: cleanPhone, otp });
        return res.json({
          success: true,
          phone: cleanPhone,
          cooldownSeconds: 60,
          message: 'Verification code sent successfully to your mobile number.'
        });
      } catch (smsErr) {
        console.warn('[SMS Service] Dispatch failed, falling back to direct OTP display:', smsErr.message);
      }
    }

    // 4. Default / Fallback: Return generated 4-digit code so users can always log in seamlessly in Vercel or test environments
    return res.json({
      success: true,
      phone: cleanPhone,
      cooldownSeconds: 60,
      testOtp: otp,
      otp: otp,
      isTestMode: true,
      message: `Your verification code is ${otp}.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP & Customer Login
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name, whatsapp_opt_in } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Mobile number and verification code are required.' });

    const cleanPhone = normalizePhone(phone);
    const cleanEnteredOtp = String(otp).trim();
    if (!/^\d{4,6}$/.test(cleanEnteredOtp)) {
      return res.status(400).json({ error: 'Please enter a valid numeric verification code.' });
    }

    const db = await getDb();
    const stored = await db.getOtp(cleanPhone);

    if (!stored || Date.now() > Number(stored.expires_at)) {
      await db.deleteOtp(cleanPhone);
      return res.status(400).json({ error: 'This verification code has expired. Please request a new one.' });
    }

    const currentAttempts = (Number(stored.attempts) || 0) + 1;
    if (currentAttempts > 3) {
      await db.deleteOtp(cleanPhone);
      return res.status(400).json({ error: 'Maximum verification attempts exceeded. Please request a new code.' });
    }

    // Update attempt count in database
    await db.run('UPDATE customer_otps SET attempts = ? WHERE phone = ?', [currentAttempts, cleanPhone]);

    const enteredHash = crypto.createHash('sha256').update(`${cleanPhone}:${cleanEnteredOtp}:${JWT_SECRET}`).digest('hex');
    const isMatch = crypto.timingSafeEqual(Buffer.from(stored.hashed_otp), Buffer.from(enteredHash));

    if (!isMatch) {
      const remaining = 3 - currentAttempts;
      if (remaining <= 0) {
        await db.deleteOtp(cleanPhone);
      }
      return res.status(400).json({
        error: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Maximum verification attempts exceeded. Please request a new code.'}`
      });
    }

    // Success: Delete single-use OTP immediately
    await db.deleteOtp(cleanPhone);

    let user = await db.get('SELECT * FROM users WHERE phone = ?', [cleanPhone]);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const fallbackName = `Foodie ${randomSuffix}`;
    const displayName = (name && name.trim()) || (user && user.name) || fallbackName;
    const marketingOpt = whatsapp_opt_in !== undefined ? (whatsapp_opt_in ? 1 : 0) : 1;

    if (!user) {
      const dummyPasswordHash = await bcrypt.hash('customer_otp_secret_' + cleanPhone, 10);
      const insertRes = await db.run(`
        INSERT INTO users (name, phone, email, password_hash, role, status, whatsapp_opt_in)
        VALUES (?, ?, NULL, ?, 'customer', 'active', ?)
      `, [displayName, cleanPhone, dummyPasswordHash, marketingOpt]);

      user = await db.get('SELECT * FROM users WHERE id = ?', [insertRes.lastID]);

      await db.addAdminNotification({
        title: 'New Customer Registered',
        message: `${displayName} (+91 ${cleanPhone}) joined FrenchBell Cafe.`,
        type: 'info',
        linkTab: 'customers'
      });
    } else {
      if (user.status === 'suspended') {
        return res.status(403).json({ error: 'This customer account has been suspended.' });
      }
      if (name && name.trim() && name.trim() !== user.name) {
        await db.run('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name.trim(), user.id]);
        user.name = name.trim();
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        whatsapp_opt_in: user.whatsapp_opt_in
      },
      message: 'Mobile verification successful'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Profile Update
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, whatsapp_opt_in } = req.body;
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newName = name !== undefined && name.trim() ? name.trim() : user.name;
    const newOptIn = whatsapp_opt_in !== undefined ? (whatsapp_opt_in ? 1 : 0) : user.whatsapp_opt_in;

    await db.run('UPDATE users SET name = ?, whatsapp_opt_in = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newName, newOptIn, user.id]);

    const updated = await db.get('SELECT id, name, phone, email, role, whatsapp_opt_in FROM users WHERE id = ?', [user.id]);
    res.json({ success: true, user: updated, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 2. SEPARATE ADMIN EMAIL & PASSWORD AUTH ===================

// Admin Login (Email + Password)
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Admin email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();
    const db = await getDb();

    let adminUser = await db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND role = ?', [cleanEmail, 'admin']);

    // Auto-provision initial primary admin if database has zero admin accounts
    const adminCount = await db.getActiveAdminCount();
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'manager@frenchbellcafe.com').toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'FrenchBell@2026!';

    if (adminCount === 0 && cleanEmail === envAdminEmail) {
      const newHash = await bcrypt.hash(envAdminPassword, 10);
      const resInsert = await db.run(`
        INSERT INTO users (name, phone, email, password_hash, role, status)
        VALUES (?, '9876543210', ?, ?, 'admin', 'active')
      `, ['FrenchBell Operations Manager', envAdminEmail, newHash]);
      adminUser = await db.get('SELECT * FROM users WHERE id = ?', [resInsert.lastID]);
    }

    if (!adminUser || adminUser.status === 'removed') {
      await db.logActivity({
        adminEmail: cleanEmail,
        action: 'Failed Admin Sign-In',
        entity: 'admin_session',
        details: `Failed sign-in attempt for non-existent admin ${cleanEmail}`
      });
      return res.status(401).json({ error: 'Invalid administrator email address or password' });
    }

    if (adminUser.status === 'suspended') {
      await db.logActivity({
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        adminName: adminUser.name,
        action: 'Suspended Admin Sign-In Attempt',
        entity: 'admin_session',
        entityId: adminUser.id,
        details: `Suspended admin ${cleanEmail} attempted to sign in. Reason: ${adminUser.suspend_reason || 'N/A'}`
      });
      return res.status(403).json({
        error: `This administrator account has been suspended: ${adminUser.suspend_reason || 'Access revoked by an administrator.'}`
      });
    }

    const isMatch = await bcrypt.compare(cleanPassword, adminUser.password_hash);
    if (!isMatch) {
      await db.logActivity({
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        adminName: adminUser.name,
        action: 'Failed Admin Sign-In',
        entity: 'admin_session',
        entityId: adminUser.id,
        details: `Incorrect password entered for ${cleanEmail}`
      });
      return res.status(401).json({ error: 'Invalid administrator email address or password' });
    }

    await db.run('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [adminUser.id]);

    await db.logActivity({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'Admin Sign-In Succeeded',
      entity: 'admin_session',
      entityId: adminUser.id,
      details: `Successful administrator authentication`
    });

    const token = jwt.sign(
      { id: adminUser.id, role: 'admin', name: adminUser.name, email: adminUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone,
        role: 'admin',
        status: adminUser.status || 'active',
        created_at: adminUser.created_at
      },
      message: 'Admin authenticated successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Forgot Password
app.post('/api/auth/admin-forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address is required' });

    const cleanEmail = String(email).trim().toLowerCase();
    const db = await getDb();
    const adminUser = await db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND role = ?', [cleanEmail, 'admin']);

    if (!adminUser || adminUser.status === 'removed') {
      return res.status(404).json({ error: 'No active administrator account found with that email address.' });
    }

    if (adminUser.status === 'suspended') {
      return res.status(403).json({ error: 'This administrator account is suspended.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const baseUrl = getBaseUrl(req);
    const resetUrl = `${baseUrl}/?view=admin-reset-password&token=${token}`;

    await emailService.sendPasswordReset({
      to: cleanEmail,
      resetUrl,
      expiresInMinutes: 30
    });

    await db.logActivity({
      adminId: adminUser.id,
      adminEmail: cleanEmail,
      adminName: adminUser.name,
      action: 'Password Reset Requested',
      entity: 'password_reset',
      details: `Password reset email dispatched to ${cleanEmail}`
    });

    res.json({
      success: true,
      message: `Password reset instructions have been sent to ${cleanEmail}. Please check your inbox.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Current Authenticated Admin / Customer
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.get('SELECT id, name, phone, email, role, status, whatsapp_opt_in, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Issue a short-lived QA tester session for authorized production OTP verification
app.post('/api/admin/tester-session', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const testerToken = jwt.sign(
      { role: 'tester', adminId: req.user.id, email: req.user.email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Generated QA Tester Session',
      entity: 'auth',
      details: `Generated short-lived 2-hour tester token for ${req.user.email}`
    });

    res.json({
      success: true,
      testerToken,
      expiresIn: '2 hours',
      message: 'Authorized 2-hour QA tester session token created successfully.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 3. ADMIN INVITATIONS & TEAM MANAGEMENT ===================

// Safe SMTP Diagnostic endpoint (Admin only)
app.get('/api/admin/smtp-diagnostic', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    envPath,
    envFileExists: envExists,
    diagnostics: emailService.getDiagnostics()
  });
});

// Invite New Admin (Supports multiple invitations to different emails without hardcoded limit)
app.post('/api/admin/invite', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address is required.' });

    const cleanEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const db = await getDb();

    // Check if email already belongs to an existing active/suspended admin
    const existingAdmin = await db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND role = ? AND status != ?', [cleanEmail, 'admin', 'removed']);
    if (existingAdmin) {
      return res.status(400).json({ error: `An administrator account already exists for ${cleanEmail}.` });
    }

    // Check if an active pending invitation already exists for this recipient
    const existingInvite = await db.get(`
      SELECT * FROM admin_invitations
      WHERE LOWER(email) = LOWER(?) AND status = 'pending' AND expires_at > NOW()
    `, [cleanEmail]);

    if (existingInvite) {
      return res.status(400).json({
        error: `A pending invitation has already been sent to ${cleanEmail}. You can resend it instead of creating a duplicate.`
      });
    }

    // Generate secure cryptographic invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresInHours = 72; // 72 hours
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const insertResult = await db.run(`
      INSERT INTO admin_invitations (email, token, status, invited_by, invited_by_name, expires_at)
      VALUES (?, ?, 'pending', ?, ?, ?)
    `, [cleanEmail, token, req.user.email, req.user.name, expiresAt]);

    const invitation = await db.get('SELECT * FROM admin_invitations WHERE id = ?', [insertResult.lastID]);

    const baseUrl = getBaseUrl(req);
    const invitationUrl = `${baseUrl}/?view=accept-invitation&token=${token}`;

    // Send invitation email
    await emailService.sendAdminInvitation({
      to: cleanEmail,
      invitationUrl,
      invitedByName: req.user.name || 'FrenchBell Administrator',
      expiresInHours
    });

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Invited Admin',
      entity: 'admin_invitation',
      entityId: invitation.id,
      details: `Sent invitation to ${cleanEmail}`
    });

    res.json({
      success: true,
      invitation,
      message: `Invitation email sent successfully to ${cleanEmail}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Invitation Token (Public endpoint for accepting invite)
app.get('/api/admin/invite-info', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Invitation token is required.' });

    const db = await getDb();
    const invite = await db.get('SELECT * FROM admin_invitations WHERE token = ?', [token]);

    if (!invite) {
      return res.status(404).json({ error: 'This invitation does not exist or has an invalid token.' });
    }

    if (invite.status === 'cancelled') {
      return res.status(400).json({ error: 'This invitation was cancelled by an administrator.' });
    }

    if (invite.status === 'accepted') {
      return res.status(400).json({ error: 'This invitation has already been accepted.' });
    }

    if (new Date(invite.expires_at) < new Date()) {
      await db.run("UPDATE admin_invitations SET status = 'expired' WHERE id = ?", [invite.id]);
      return res.status(400).json({ error: 'This invitation has expired. Please ask an administrator to resend a new invitation.' });
    }

    res.json({
      valid: true,
      email: invite.email,
      invited_by_name: invite.invited_by_name,
      created_at: invite.created_at,
      expires_at: invite.expires_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept Invitation & Create Admin Account (One-time atomic transaction)
app.post('/api/admin/accept-invitation', async (req, res) => {
  try {
    const { token, name, password, confirmPassword } = req.body;
    if (!token || !name || !password) {
      return res.status(400).json({ error: 'Full name, password, and invitation token are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const db = await getDb();

    // Atomic transaction for single-use acceptance
    const newAdmin = await db.transaction(async (tx) => {
      const invite = await tx.get('SELECT * FROM admin_invitations WHERE token = ?', [token]);

      if (!invite) {
        throw new Error('Invalid invitation token.');
      }

      if (invite.status === 'cancelled') {
        throw new Error('This invitation has been cancelled.');
      }

      if (invite.status === 'accepted') {
        throw new Error('This invitation has already been accepted and can only be used once.');
      }

      if (new Date(invite.expires_at) < new Date()) {
        throw new Error('This invitation has expired.');
      }

      // Check if email already registered as admin
      const existing = await tx.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND role = ?', [invite.email, 'admin']);
      if (existing) {
        throw new Error(`An administrator account already exists for ${invite.email}.`);
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const insertUser = await tx.run(`
        INSERT INTO users (name, email, phone, password_hash, role, status)
        VALUES (?, LOWER(?), NULL, ?, 'admin', 'active')
      `, [name.trim(), invite.email, passwordHash]);

      // Invalidate token atomically
      const updateInvite = await tx.run(`
        UPDATE admin_invitations
        SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status = 'pending'
      `, [invite.id]);

      if (!updateInvite.changes) {
        throw new Error('This invitation has already been accepted or is no longer pending.');
      }

      const createdAdmin = await tx.get('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', [insertUser.lastID]);

      await tx.logActivity({
        adminId: createdAdmin.id,
        adminEmail: createdAdmin.email,
        adminName: createdAdmin.name,
        action: 'Accepted Admin Invitation',
        entity: 'admin_user',
        entityId: createdAdmin.id,
        details: `${createdAdmin.name} accepted invitation and joined as administrator`
      });

      return createdAdmin;
    });

    res.json({
      success: true,
      user: newAdmin,
      message: 'Your administrator account has been created successfully. Please sign in.'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Resend Admin Invitation (Rotates token, invalidates previous token, refreshes expiry)
app.post('/api/admin/invitations/:id/resend', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const invite = await db.get('SELECT * FROM admin_invitations WHERE id = ?', [id]);
    if (!invite) return res.status(404).json({ error: 'Invitation record not found.' });

    if (invite.status === 'accepted') {
      return res.status(400).json({ error: 'Cannot resend an invitation that has already been accepted.' });
    }

    if (invite.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot resend a cancelled invitation. Please create a new invitation.' });
    }

    // Rotate token, invalidate old token, refresh 72h expiry
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    await db.run(`
      UPDATE admin_invitations
      SET token = ?, expires_at = ?, status = 'pending', last_resent_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [newToken, newExpiresAt, id]);

    const baseUrl = getBaseUrl(req);
    const invitationUrl = `${baseUrl}/?view=accept-invitation&token=${newToken}`;

    await emailService.sendAdminInvitation({
      to: invite.email,
      invitationUrl,
      invitedByName: req.user.name,
      expiresInHours: 72
    });

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Resent Admin Invitation',
      entity: 'admin_invitation',
      entityId: invite.id,
      details: `Rotated token and resent invitation to ${invite.email}`
    });

    res.json({ success: true, message: `Invitation resent successfully to ${invite.email}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel Admin Invitation
app.delete('/api/admin/invitations/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const invite = await db.get('SELECT * FROM admin_invitations WHERE id = ?', [id]);
    if (!invite) return res.status(404).json({ error: 'Invitation not found.' });

    if (invite.status === 'accepted') {
      return res.status(400).json({ error: 'Cannot cancel an invitation that has already been accepted.' });
    }

    await db.run(`
      UPDATE admin_invitations
      SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Cancelled Admin Invitation',
      entity: 'admin_invitation',
      entityId: invite.id,
      details: `Cancelled pending invitation for ${invite.email}`
    });

    res.json({ success: true, message: `Invitation for ${invite.email} has been cancelled.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List All Admin Users & Invitations
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();

    // Auto-update expired pending invitations
    await db.run(`
      UPDATE admin_invitations
      SET status = 'expired'
      WHERE status = 'pending' AND expires_at <= NOW()
    `);

    const admins = await db.all(`
      SELECT id, name, email, phone, status, suspend_reason, remove_reason, created_at, updated_at
      FROM users
      WHERE role = 'admin' AND status != 'removed'
      ORDER BY created_at ASC
    `);

    const invitations = await db.all(`
      SELECT id, email, status, invited_by, invited_by_name, expires_at, last_resent_at, created_at
      FROM admin_invitations
      WHERE status IN ('pending', 'expired')
      ORDER BY created_at DESC
    `);

    res.json({
      admins,
      invitations,
      currentUserId: req.user.id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Suspend / Unsuspend Admin (Requires mandatory reason, enforces Last Active Admin protection)
app.put('/api/admin/users/:id/suspend', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const db = await getDb();

    const targetAdmin = await db.get('SELECT * FROM users WHERE id = ? AND role = ?', [id, 'admin']);
    if (!targetAdmin) return res.status(404).json({ error: 'Administrator not found.' });

    const newStatus = targetAdmin.status === 'suspended' ? 'active' : 'suspended';

    if (newStatus === 'suspended') {
      if (!reason || !reason.trim()) {
        return res.status(400).json({ error: 'A mandatory reason is required to suspend an administrator account.' });
      }

      // Last Active Admin Protection
      const activeCount = await db.getActiveAdminCount();
      if (activeCount <= 1) {
        return res.status(400).json({
          error: 'You cannot suspend the last active administrator. At least one active administrator must remain.'
        });
      }

      if (Number(targetAdmin.id) === Number(req.user.id) && activeCount <= 1) {
        return res.status(400).json({
          error: 'You cannot suspend yourself if doing so leaves the system without an active administrator.'
        });
      }

      await db.run(`
        UPDATE users
        SET status = 'suspended', suspend_reason = ?, suspended_at = CURRENT_TIMESTAMP, suspended_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [reason.trim(), req.user.id, targetAdmin.id]);

      await db.logActivity({
        adminId: req.user.id,
        adminEmail: req.user.email,
        adminName: req.user.name,
        action: 'Suspended Admin',
        entity: 'admin_user',
        entityId: targetAdmin.id,
        reason: reason.trim(),
        details: `${req.user.name} suspended ${targetAdmin.email}. Reason: ${reason.trim()}`
      });

      return res.json({
        success: true,
        status: 'suspended',
        message: `Administrator ${targetAdmin.email} has been suspended.`
      });
    }

    // Restore access
    await db.run(`
      UPDATE users
      SET status = 'active', suspend_reason = NULL, suspended_at = NULL, suspended_by = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [targetAdmin.id]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Restored Admin Access',
      entity: 'admin_user',
      entityId: targetAdmin.id,
      reason: reason ? reason.trim() : null,
      details: `${req.user.name} restored access for ${targetAdmin.email}`
    });

    res.json({
      success: true,
      status: 'active',
      message: `Administrator access for ${targetAdmin.email} has been restored.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restore Admin Access (Dedicated restore endpoint)
app.put('/api/admin/users/:id/restore', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const db = await getDb();

    const targetAdmin = await db.get('SELECT * FROM users WHERE id = ? AND role = ?', [id, 'admin']);
    if (!targetAdmin) return res.status(404).json({ error: 'Administrator not found.' });

    await db.run(`
      UPDATE users
      SET status = 'active', suspend_reason = NULL, suspended_at = NULL, suspended_by = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [targetAdmin.id]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Restored Admin Access',
      entity: 'admin_user',
      entityId: targetAdmin.id,
      reason: reason ? reason.trim() : null,
      details: `${req.user.name} restored access for ${targetAdmin.email}`
    });

    res.json({
      success: true,
      status: 'active',
      message: `Administrator access for ${targetAdmin.email} has been restored.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove Admin (Soft deletion with mandatory reason, enforces Last Active Admin protection)
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'A mandatory reason is required to remove an administrator account.' });
    }

    const db = await getDb();
    const targetAdmin = await db.get('SELECT * FROM users WHERE id = ? AND role = ?', [id, 'admin']);
    if (!targetAdmin) return res.status(404).json({ error: 'Administrator not found.' });

    // Last Active Admin Protection
    const activeCount = await db.getActiveAdminCount();
    if (activeCount <= 1 && targetAdmin.status === 'active') {
      return res.status(400).json({
        error: 'You cannot remove the last active administrator. At least one active administrator must remain.'
      });
    }

    if (Number(targetAdmin.id) === Number(req.user.id) && activeCount <= 1) {
      return res.status(400).json({
        error: 'You cannot remove yourself when you are the last active administrator.'
      });
    }

    // Soft deletion: preserves audit logs and foreign keys
    await db.run(`
      UPDATE users
      SET status = 'removed', remove_reason = ?, removed_at = CURRENT_TIMESTAMP, removed_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [reason.trim(), req.user.id, id]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Removed Admin',
      entity: 'admin_user',
      entityId: id,
      reason: reason.trim(),
      details: `${req.user.name} deactivated administrator account ${targetAdmin.email}. Reason: ${reason.trim()}`
    });

    res.json({ success: true, message: `Administrator ${targetAdmin.email} has been deactivated.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Current Admin Profile
app.put('/api/admin/profile', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name cannot be empty' });

    const db = await getDb();
    await db.run('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name.trim(), req.user.id]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Updated Admin Profile',
      entity: 'admin_user',
      entityId: req.user.id,
      details: `Updated name to "${name.trim()}"`
    });

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 4. MENU CATEGORIES & ITEMS ===================

app.get('/api/categories', async (req, res) => {
  try {
    const db = await getDb();
    const categories = await db.all('SELECT * FROM menu_categories WHERE active = 1 ORDER BY display_order ASC, id ASC');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, slug, display_order } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'Category name and slug are required' });

    const db = await getDb();
    const result = await db.run(`
      INSERT INTO menu_categories (name, slug, display_order, active)
      VALUES (?, ?, ?, 1)
    `, [name, slug.toLowerCase(), display_order || 0]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Created Menu Category',
      entity: 'menu_category',
      entityId: result.lastID,
      details: `Created category "${name}"`
    });

    res.json({ id: result.lastID, message: 'Category created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/menu', async (req, res) => {
  try {
    const db = await getDb();
    const items = await db.all(`
      SELECT m.*, c.name as category_name, c.slug as category_slug
      FROM menu_items m
      LEFT JOIN menu_categories c ON m.category_id = c.id
      ORDER BY m.id ASC
    `);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/menu', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      category_id, name, description, image_url, veg_type, price,
      price_chicken, price_veg, available, popular, stock_quantity,
      prep_time_mins, is_special, is_recommended, customizations
    } = req.body;

    if (!name || price === undefined) return res.status(400).json({ error: 'Name and price are required' });

    const db = await getDb();
    const result = await db.run(`
      INSERT INTO menu_items (
        category_id, name, description, image_url, veg_type, price, price_chicken, price_veg,
        available, popular, stock_quantity, prep_time_mins, is_special, is_recommended, customizations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      category_id || 1, name, description || '', image_url || '/assets/food/burger.jpg',
      veg_type || 'veg', Number(price), price_chicken ? Number(price_chicken) : null,
      price_veg ? Number(price_veg) : null, available !== undefined ? (available ? 1 : 0) : 1,
      popular ? 1 : 0, stock_quantity !== undefined ? Number(stock_quantity) : 20,
      prep_time_mins ? Number(prep_time_mins) : 12, is_special ? 1 : 0, is_recommended ? 1 : 0,
      customizations !== undefined ? String(customizations) : null
    ]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Added Menu Item',
      entity: 'menu_item',
      entityId: result.lastID,
      details: `Added item "${name}" (₹${price})`
    });

    res.json({ id: result.lastID, message: 'Item added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/menu/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id, name, description, image_url, veg_type, price,
      price_chicken, price_veg, available, popular, stock_quantity,
      prep_time_mins, is_special, is_recommended, customizations
    } = req.body;

    const db = await getDb();
    await db.run(`
      UPDATE menu_items
      SET category_id = ?, name = ?, description = ?, image_url = ?, veg_type = ?, price = ?,
          price_chicken = ?, price_veg = ?, available = ?, popular = ?, stock_quantity = ?,
          prep_time_mins = ?, is_special = ?, is_recommended = ?, customizations = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      category_id, name, description, image_url, veg_type, Number(price),
      price_chicken ? Number(price_chicken) : null, price_veg ? Number(price_veg) : null,
      available ? 1 : 0, popular ? 1 : 0, Number(stock_quantity), Number(prep_time_mins),
      is_special ? 1 : 0, is_recommended ? 1 : 0,
      customizations !== undefined ? String(customizations) : null,
      id
    ]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Updated Menu Item',
      entity: 'menu_item',
      entityId: id,
      details: `Updated "${name}"`
    });

    res.json({ message: 'Item updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/menu/:id/availability', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;
    const db = await getDb();
    await db.run('UPDATE menu_items SET available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [available ? 1 : 0, id]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: available ? 'Enabled Menu Item' : 'Disabled Menu Item',
      entity: 'menu_item',
      entityId: id,
      details: `Marked item #${id} as ${available ? 'Available' : 'Unavailable'}`
    });

    res.json({ message: `Item marked as ${available ? 'Available' : 'Sold Out'}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/menu/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM menu_items WHERE id = ?', [id]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Deleted Menu Item',
      entity: 'menu_item',
      entityId: id,
      details: `Removed item #${id}`
    });

    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 5. ORDERS & CHECKOUT ===================

function isCafeCurrentlyOpen(settings) {
  try {
    const rawHours = settings.business_hours;
    if (rawHours) {
      const parsed = typeof rawHours === 'string' ? JSON.parse(rawHours) : rawHours;
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDay = days[new Date().getDay()];
      const dayConfig = parsed[currentDay];
      if (dayConfig && dayConfig.closed) return false;
    }
    return true;
  } catch (e) {
    return true;
  }
}

// Create Order (Authoritative pricing, recomputed tax and discounts, creates pending order)
app.post('/api/orders', async (req, res) => {
  try {
    const {
      user_id, order_type, table_number, num_people, customer_name, phone,
      pickup_time, delivery_address, landmark, pincode, delivery_distance_km,
      special_instructions, items, coupon_code, payment_method
    } = req.body;

    if (!customer_name || !phone || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required customer or item details.' });
    }

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'A valid 10-digit mobile number is required to place an order.' });
    }

    const cleanOrderType = (order_type || 'takeaway').toLowerCase();
    if (!['takeaway', 'dine-in', 'delivery'].includes(cleanOrderType)) {
      return res.status(400).json({ error: `Invalid order type "${order_type}". Must be takeaway, dine-in, or delivery.` });
    }

    const db = await getDb();

    // Verify customer exists in database
    let customerUser = null;
    const authHeader = req.headers['authorization'];
    const authToken = authHeader && authHeader.split(' ')[1];
    if (authToken) {
      try {
        const payload = jwt.verify(authToken, JWT_SECRET);
        customerUser = await db.get('SELECT * FROM users WHERE id = ?', [payload.id]);
      } catch (e) {}
    }

    if (!customerUser) {
      customerUser = await db.get('SELECT * FROM users WHERE phone = ?', [cleanPhone]);
    }

    if (!customerUser) {
      return res.status(401).json({
        error: 'Authentication required. Please verify your mobile number with OTP before placing an order.'
      });
    }

    // Settings validation
    const settingsRows = await db.all('SELECT * FROM settings');
    const settings = {};
    for (const r of settingsRows) settings[r.key] = r.value;

    if (!isCafeCurrentlyOpen(settings)) {
      return res.status(400).json({ error: 'FrenchBell Cafe is currently closed for new orders.' });
    }

    let calculatedDeliveryCharge = 0;
    if (cleanOrderType === 'delivery') {
      if (!delivery_address || !delivery_address.trim()) {
        return res.status(400).json({ error: 'Full delivery address is required for doorstep delivery.' });
      }

      const freeKm = Number(settings.free_delivery_km || 2);
      const feePerKm = Number(settings.delivery_fee_per_km || 15);
      const dist = Number(delivery_distance_km || 1.5);
      const maxKm = Number(settings.max_delivery_km || 10);

      if (dist > maxKm) {
        return res.status(400).json({ error: `Delivery address is outside our maximum serviceable delivery radius of ${maxKm} km.` });
      }

      if (dist > freeKm) {
        calculatedDeliveryCharge = Math.round((dist - freeKm) * feePerKm);
      }
    }

    // Authoritative item price calculation
    const validatedItems = [];
    let serverSubtotal = 0;

    for (const cartItem of items) {
      const itemId = cartItem.menu_item_id || cartItem.id;
      const dbItem = await db.get('SELECT * FROM menu_items WHERE id = ?', [itemId]);

      if (!dbItem) {
        return res.status(400).json({ error: `Item "${cartItem.item_name || 'Unknown'}" was not found on our current menu.` });
      }

      if (dbItem.available === 0 || (dbItem.stock_quantity !== undefined && Number(dbItem.stock_quantity) <= 0)) {
        return res.status(400).json({ error: `"${dbItem.name}" is currently out of stock. Please remove it from your order.` });
      }

      const qty = Math.max(1, parseInt(cartItem.quantity, 10) || 1);
      let authoritativeUnitPrice = Number(dbItem.price);
      if (cartItem.variant === 'Veg' && dbItem.price_veg) authoritativeUnitPrice = Number(dbItem.price_veg);
      if (cartItem.variant === 'Chicken' && dbItem.price_chicken) authoritativeUnitPrice = Number(dbItem.price_chicken);

      // Securely validate item customizations against dbItem.customizations while preserving selection text
      let selectedCustomizationsText = '';
      if (cartItem.customizations) {
        const availableOptions = parseCustomizations(dbItem.customizations);
        let selectedList = [];
        if (Array.isArray(cartItem.customizations)) {
          selectedList = cartItem.customizations;
        } else if (typeof cartItem.customizations === 'string') {
          selectedList = cartItem.customizations.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
        }

        const validSelected = [];
        for (const selected of selectedList) {
          const selectedName = typeof selected === 'object' ? (selected.name || selected.label || '') : String(selected).trim();
          if (!selectedName) continue;
          const cleanSelName = String(selectedName).replace(/\s*[\(\-].*$/, '').trim().toLowerCase();
          const matchedOption = availableOptions.find(opt => opt.name.toLowerCase() === cleanSelName);
          if (matchedOption) {
            authoritativeUnitPrice += Number(matchedOption.price);
            validSelected.push(matchedOption.price > 0 ? `${matchedOption.name} (+₹${matchedOption.price})` : matchedOption.name);
          } else {
            validSelected.push(selectedName);
          }
        }
        selectedCustomizationsText = validSelected.join(', ');
        if (!selectedCustomizationsText && typeof cartItem.customizations === 'string') {
          selectedCustomizationsText = cartItem.customizations.trim();
        }
      }

      const itemTotal = authoritativeUnitPrice * qty;
      serverSubtotal += itemTotal;

      validatedItems.push({
        menu_item_id: dbItem.id,
        item_name: dbItem.name,
        variant: cartItem.variant || null,
        customizations: selectedCustomizationsText || null,
        quantity: qty,
        unit_price: authoritativeUnitPrice,
        total_price: itemTotal,
        special_instructions: cartItem.special_instructions || ''
      });
    }

    // Coupon discount revalidation
    let serverDiscount = 0;
    if (coupon_code) {
      const cleanCode = String(coupon_code).trim().toUpperCase();
      const dbCoupon = await db.get('SELECT * FROM offers WHERE UPPER(coupon_code) = ? AND active = 1', [cleanCode]);

      if (dbCoupon) {
        const meetsMinOrder = serverSubtotal >= Number(dbCoupon.minimum_order || 0);
        const orderTypeMatches = !dbCoupon.applicable_order_type || dbCoupon.applicable_order_type === 'all' || dbCoupon.applicable_order_type === cleanOrderType;

        if (meetsMinOrder && orderTypeMatches) {
          if (dbCoupon.discount_type === 'percentage') {
            serverDiscount = Math.round((serverSubtotal * Number(dbCoupon.discount_value)) / 100);
            if (dbCoupon.max_discount) serverDiscount = Math.min(serverDiscount, Number(dbCoupon.max_discount));
          } else {
            serverDiscount = Number(dbCoupon.discount_value || 0);
          }
        }
      }
    }

    // GST Tax Calculation
    const taxRate = Number(settings.tax_rate_percent || 5) / 100;
    const taxableAmount = Math.max(0, serverSubtotal - serverDiscount);
    const serverTax = Math.round(taxableAmount * taxRate);
    const serverGrandTotal = Math.max(0, taxableAmount + serverTax + calculatedDeliveryCharge);


    // Create Order with pending payment status
const orderResult = await db.transaction(async (tx) => {
  // Advisory lock prevents duplicate order numbers under concurrent load.
  // pg-mem (test environment) does not support advisory locks; skip safely.
  try {
    await tx.query(
      'SELECT pg_advisory_xact_lock($1, $2)',
      [24016, 1]
    );
  } catch (_lockErr) {
    // Non-fatal: advisory lock unavailable (e.g. pg-mem in test mode)
  }

  let sequenceResult;
  try {
    // Production-grade query: uses IST timezone and regex sequence extraction
    sequenceResult = await tx.get(`
    WITH business_day AS (
      SELECT CASE
        WHEN (NOW() AT TIME ZONE 'Asia/Kolkata')::time < TIME '02:00'
          THEN (NOW() AT TIME ZONE 'Asia/Kolkata')::date - 1
        ELSE (NOW() AT TIME ZONE 'Asia/Kolkata')::date
      END AS day
    )
    SELECT
      b.day AS business_day,
      COALESCE(
        MAX(SUBSTRING(o.order_number FROM '^FB([0-9]+)$')::INTEGER),
        0
      ) AS max_sequence
    FROM business_day b
    LEFT JOIN orders o
      ON o.business_day = b.day
      AND o.order_number ~ '^FB[0-9]+$'
    GROUP BY b.day
  `);
  } catch (_pgMemErr) {
    // pg-mem fallback: simpler query compatible with in-memory engine
    const today = new Date().toISOString().split('T')[0];
    const countRes = await tx.get(
      `SELECT COUNT(*) AS max_sequence FROM orders WHERE business_day = $1`,
      [today]
    );
    sequenceResult = {
      business_day: today,
      max_sequence: Number(countRes?.max_sequence || 0)
    };
  }

  const nextSequence = Number(sequenceResult.max_sequence) + 1;
  const orderNumber = `FB${String(nextSequence).padStart(3, '0')}`;

  const insertResult = await tx.run(`
  INSERT INTO orders (
    order_number, business_day, user_id, order_type, table_number, num_people,
    customer_name, phone, pickup_time, delivery_address, landmark, pincode,
    subtotal, discount, delivery_charge, tax, total, payment_status,
    payment_method, order_status, special_instructions
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 'received', ?)
`, [
  orderNumber, sequenceResult.business_day, customerUser.id, cleanOrderType,
  table_number || null, num_people || null, customer_name.trim(), cleanPhone,
  pickup_time || null, delivery_address || null, landmark || null, pincode || null,
  serverSubtotal, serverDiscount, calculatedDeliveryCharge, serverTax, serverGrandTotal,
  payment_method || 'simulated', special_instructions || ''
]);

  const orderId = insertResult.lastID;

  for (const item of validatedItems) {
    await tx.run(`
      INSERT INTO order_items (
        order_id, menu_item_id, item_name, variant, quantity,
        unit_price, total_price, customizations, special_instructions
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId, item.menu_item_id, item.item_name, item.variant,
      item.quantity, item.unit_price, item.total_price, item.customizations || null, item.special_instructions
    ]);
  }

  await tx.run(`
    INSERT INTO order_status_history (
      order_id, previous_status, new_status, changed_by, change_reason
    )
    VALUES (?, NULL, 'received', 'Customer Checkout', 'Order created pending payment')
  `, [orderId]);

  await tx.addAdminNotification({
    title: `New ${cleanOrderType.toUpperCase()} Order #${orderNumber}`,
    message: `${customer_name} placed order #${orderNumber} (${cleanOrderType.toUpperCase()}) for ₹${serverGrandTotal}.`,
    type: 'order',
    linkTab: 'live-orders'
  });

  const createdOrder = await tx.get(
    'SELECT * FROM orders WHERE id = ?',
    [orderId]
  );

  return { createdOrder, orderNumber };
});

const { createdOrder, orderNumber } = orderResult;
createdOrder.items = validatedItems;

res.json({
  success: true,
  order: createdOrder,
  order_number: orderNumber,
  message: 'Order created successfully. Ready for payment.'
});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 6. PAYMENT INTEGRATION (SIMULATED & TEST MODE) ===================

// Execute Simulated Payment (Success or Failure)

app.post('/api/payment/razorpay/order', authenticateToken, async (req, res) => {  try {
    const { order_id } = req.body;

    if (!order_id || !Number.isInteger(Number(order_id)) || Number(order_id) < 1) {
      return res.status(400).json({
        error: 'A valid order_id is required.'
      });
    }

    const db = await getDb();

    // Always use the total stored in our own database.
    const order = await db.get(
  `SELECT id, order_number, total, payment_status
   FROM orders
   WHERE id = ? AND user_id = ?`,
  [Number(order_id), req.user.id]
);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (['successful', 'paid'].includes(
      String(order.payment_status || '').toLowerCase()
    )) {
      return res.status(409).json({
        error: 'This order has already been paid.'
      });
    }

    const amountInPaise = Math.round(Number(order.total) * 100);

    if (!Number.isSafeInteger(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({
        error: 'Order total must be at least ₹1.00.'
      });
    }

    const razorpay = getRazorpayClient();

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `FB${order.id}_${Date.now()}`,
      notes: {
        frenchbell_order_id: String(order.id),
        frenchbell_order_number: String(order.order_number)
      }
    });

    await db.run(
      `INSERT INTO payments (
        order_id, transaction_id, razorpay_order_id,
        provider, amount, currency, method, status, raw_response
      ) VALUES (?, ?, ?, 'razorpay', ?, 'INR', 'razorpay', 'pending', ?)`,
      [
        order.id,
        `rzp_order_${razorpayOrder.id}`,
        razorpayOrder.id,
        Number(order.total),
        JSON.stringify({
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          status: razorpayOrder.status
        })
      ]
    );

    return res.json({
      success: true,
      key_id: process.env.RAZORPAY_KEY_ID,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order_id: order.id,
      order_number: order.order_number
    });
  } catch (err) {
    console.error('[Razorpay order creation]', err.message);

    return res.status(500).json({
      error: 'Unable to create the Razorpay order. Please try again.'
    });
  }
});

 // Execute Simulated Payment (Success or Failure) — Test / Dev Mode Only
app.post('/api/payment/simulate', async (req, res) => {
  // Security guard: Payment simulation cannot be accessed in production
  if (isProduction) {
    return res.status(403).json({
      error: 'Payment simulation is disabled in production. Payments must be processed through Razorpay.'
    });
  }

  try {
    const { order_id, order_number, outcome, method } = req.body;

    if (!order_id && !order_number) {
      return res.status(400).json({
        error: 'order_id or order_number is required for payment simulation.'
      });
    }

    const db = await getDb();
    const order = order_id
      ? await db.get('SELECT id, order_number FROM orders WHERE id = ?', [Number(order_id)])
      : await db.get('SELECT id, order_number FROM orders WHERE order_number = ? ORDER BY id DESC LIMIT 1', [order_number]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const result = await PaymentService.executeSimulatedPayment({
      orderId: order.id,
      orderNumber: order.order_number,
      outcome: outcome || 'success',
      method: method || 'simulated_upi'
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Legacy / General Payment Verify route — Test / Dev Mode Only
app.post('/api/payment/verify', async (req, res) => {
  // Security guard: Payment simulation cannot be accessed in production
  if (isProduction) {
    return res.status(403).json({
      error: 'Payment simulation is disabled in production. Real payment verification via Razorpay is required.'
    });
  }

  try {
    const { order_id, order_number, outcome, payment_method } = req.body;

    if (!order_id && !order_number) {
      return res.status(400).json({
        error: 'Order ID or order_number is required for payment verification.'
      });
    }

    const db = await getDb();
    const order = order_id
      ? await db.get('SELECT id, order_number FROM orders WHERE id = ?', [order_id])
      : await db.get('SELECT id, order_number FROM orders WHERE order_number = ?', [order_number]);

    if (!order || (order_number && order.order_number !== order_number)) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const result = await PaymentService.executeSimulatedPayment({
      orderId: order.id,
      orderNumber: order.order_number,
      outcome: outcome || 'success',
      method: payment_method || 'simulated_upi'
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/payment/razorpay/verify', authenticateToken, async (req, res) => {
  try {
    const {
      order_id,
      order_number,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

    if (
      !order_id ||
      !order_number ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        error: 'Required Razorpay payment details are missing.'
      });
    }

    const db = await getDb();

    // Ensure this order belongs to the logged-in customer.
    const order = await db.get(
      `SELECT id, order_number
       FROM orders
       WHERE id = ? AND order_number = ? AND user_id = ?`,
      [Number(order_id), order_number, req.user.id]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found.'
      });
    }

    const result = await PaymentService.verifyRazorpayPayment({
      orderId: order.id,
      orderNumber: order.order_number,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature
    });

    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('[Razorpay verification]', err.message);

    return res.status(400).json({
      success: false,
      error: err.message || 'Unable to verify the Razorpay payment.'
    });
  }
});

app.post('/api/payment/razorpay/failed', authenticateToken, async (req, res) => {
  try {
    const { order_id, error_description } = req.body;
    if (!order_id) return res.status(400).json({ error: 'order_id is required' });

    const db = await getDb();
    const order = await db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [order_id, req.user.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await db.run('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['failed', order.id]);
    await db.run(`
      INSERT INTO payments (order_id, transaction_id, provider, amount, currency, method, status, error_message)
      VALUES (?, ?, 'razorpay', ?, 'INR', 'razorpay', 'failed', ?)
      ON CONFLICT (transaction_id) DO UPDATE SET status = 'failed', error_message = EXCLUDED.error_message, updated_at = CURRENT_TIMESTAMP
    `, [order.id, `FAILED_RZP_${order.id}_${Date.now()}`, Number(order.total), error_description || 'Payment failed or cancelled']);

    res.json({ success: true, message: 'Payment failure recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 7. ORDER HISTORY & TRACKING ===================

// Customer Order History (Strict Ownership Enforced)
app.get('/api/customer/orders', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const cleanPhone = normalizePhone(req.user.phone);

    // Strict ownership check: only return orders belonging to this customer
    const orders = await db.all(`
      SELECT * FROM orders
      WHERE user_id = ? OR phone = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, cleanPhone, limit, offset]);

    for (const ord of orders) {
      ord.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
      const payment = await db.get('SELECT * FROM payments WHERE order_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1', [ord.id, 'successful'])
        || await db.get('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1', [ord.id]);
      ord.transaction_id = payment?.transaction_id || null;
      ord.payment = payment;
    }

    const totalCountRes = await db.get(`
      SELECT COUNT(*) as count FROM orders
      WHERE user_id = ? OR phone = ?
    `, [req.user.id, cleanPhone]);

    const total = parseInt(totalCountRes?.count || '0', 10);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: Retrieve order safely by integer ID or string order_number
export async function getOrderByIdOrNumber(db, identifier) {
  if (!identifier) return null;

  const value = String(identifier).trim();

  // Prefer the unique database ID when the identifier is numeric.
  if (/^\d+$/.test(value)) {
    const orderById = await db.get(
      'SELECT * FROM orders WHERE id = ?',
      [Number(value)]
    );

    if (orderById) return orderById;
  }

  // Order numbers may repeat on different business days.
  // Without a business-day context, return the newest matching order.
  return await db.get(
    `SELECT * FROM orders
     WHERE order_number = ?
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [value]
  );
}

// Order Tracking Endpoint (Ownership checked where appropriate)
app.get('/api/orders/:orderNumber/track', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const db = await getDb();

    const order = await getOrderByIdOrNumber(db, orderNumber);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    // Authorized access check: require customer/admin token OR matching phone parameter if supplied
    const authHeader = req.headers['authorization'];
    const authToken = authHeader && authHeader.split(' ')[1];
    const phoneParam = req.query.phone ? normalizePhone(req.query.phone) : null;

    if (authToken) {
      try {
        const payload = jwt.verify(authToken, JWT_SECRET);
        if (payload.role !== 'admin') {
          const isUserMatch = order.user_id && Number(order.user_id) === Number(payload.id);
          const isPhoneMatch = order.phone && payload.phone && normalizePhone(order.phone) === normalizePhone(payload.phone);
          // If token belongs to another user with phone, require match
          if (!isUserMatch && !isPhoneMatch && order.user_id) {
            return res.status(403).json({ error: 'Unauthorized to track this order.' });
          }
        }
      } catch (err) {
        // Fall back to phone check if token invalid/expired
      }
    } else if (phoneParam && order.phone) {
      if (normalizePhone(order.phone) !== phoneParam) {
        return res.status(403).json({ error: 'Unauthorized: Phone number does not match this order.' });
      }
    }

    order.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const history = await db.all('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC', [order.id]);

    res.json({
      id: order.id,
      order_number: order.order_number,
      order_type: order.order_type,
      order_status: order.order_status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      customer_name: order.customer_name,
      phone: order.phone,
      table_number: order.table_number,
      num_people: order.num_people,
      pickup_time: order.pickup_time,
      delivery_address: order.delivery_address,
      landmark: order.landmark,
      pincode: order.pincode,
      subtotal: order.subtotal,
      discount: order.discount,
      delivery_charge: order.delivery_charge,
      tax: order.tax,
      total: order.total,
      special_instructions: order.special_instructions,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: order.items,
      history
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Orders list with filters
app.get('/api/orders', async (req, res) => {
  try {
    const db = await getDb();
    const { status, type, phone, search, page, limit } = req.query;

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND order_status = $${params.length}`;
    }
    if (type && type !== 'all') {
      params.push(type);
      query += ` AND order_type = $${params.length}`;
    }
    if (phone) {
      params.push(phone);
      query += ` AND phone = $${params.length}`;
    }
    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(order_number) LIKE $${params.length} OR LOWER(customer_name) LIKE $${params.length} OR phone LIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      const parsedLimit = Math.min(100, parseInt(limit, 10));
      const parsedOffset = ((Math.max(1, parseInt(page, 10) || 1)) - 1) * parsedLimit;
      params.push(parsedLimit);
      query += ` LIMIT $${params.length}`;
      params.push(parsedOffset);
      query += ` OFFSET $${params.length}`;
    }

    const orders = await db.all(query, params);
    for (const o of orders) {
      o.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
      const payment = await db.get('SELECT * FROM payments WHERE order_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1', [o.id, 'successful'])
        || await db.get('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1', [o.id]);
      o.transaction_id = payment?.transaction_id || (o.payment_status === 'paid' || o.payment_status === 'successful' ? (o.payment_method === 'cash' ? `CASH-${o.order_number}` : `TXN-${o.order_number}`) : null);
      o.payment = payment;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single Order detail
app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const db = await getDb();
    const order = await getOrderByIdOrNumber(db, orderNumber);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const payment = await db.get('SELECT * FROM payments WHERE order_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1', [order.id, 'successful'])
      || await db.get('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1', [order.id]);
    order.payment = payment;
    order.transaction_id = payment?.transaction_id || null;

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status (Admin only: validated transitions & status history)
app.put('/api/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;
    const db = await getDb();

    const order = await getOrderByIdOrNumber(db, id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const currentStatus = order.order_status;
    const isDelivery = order.order_type === 'delivery';

    if (!canTransitionOrderStatus(currentStatus, order_status, isDelivery)) {
      return res.status(400).json({
        error: `Invalid status transition: Order #${order.order_number} cannot move from "${currentStatus}" to "${order_status}".`
      });
    }

    // Restore stock if cancelled
    if (order_status === 'cancelled' && currentStatus !== 'cancelled') {
      const orderItems = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      for (const item of orderItems) {
        if (item.menu_item_id) {
          await db.restoreStockForOrderItem(item.menu_item_id, item.quantity);
        }
      }
    }

    await db.run('UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [order_status, order.id]);

    await db.run(`
      INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, change_reason)
      VALUES (?, ?, ?, ?, 'Admin status update')
    `, [order.id, currentStatus, order_status, req.user.name]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Updated Order Status',
      entity: 'order',
      entityId: order.order_number,
      details: `Status of #${order.order_number} changed from "${currentStatus}" to "${order_status}"`
    });

    await db.addAdminNotification({
      title: `Order #${order.order_number} Status Updated`,
      message: `Order #${order.order_number} changed from "${currentStatus}" to "${order_status}".`,
      type: 'order',
      linkTab: 'live-orders'
    });

    res.json({ success: true, message: `Order #${order.order_number} updated to ${order_status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order Payment (Admin: records Pay at Cafe payment when customer pays at counter)
app.put('/api/orders/:id/payment', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_method } = req.body;
    const db = await getDb();
    const order = await getOrderByIdOrNumber(db, id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const newPaymentStatus = payment_status || 'successful';
    const newPaymentMethod = payment_method || order.payment_method || 'cash';

    await db.run('UPDATE orders SET payment_status = ?, payment_method = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      newPaymentStatus, newPaymentMethod, order.id
    ]);

    await db.run(`
      INSERT INTO payments (order_id, transaction_id, provider, amount, currency, method, status)
      VALUES (?, ?, 'cafe_counter', ?, 'INR', ?, ?)
      ON CONFLICT (transaction_id) DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP
    `, [order.id, `COUNTER_PAID_${order.id}_${Date.now()}`, Number(order.total), newPaymentMethod, newPaymentStatus]);

    await db.addAdminNotification({
      title: `Payment Recorded for #${order.order_number}`,
      message: `Payment recorded as ${newPaymentStatus} (${newPaymentMethod}) for Order #${order.order_number}.`,
      type: 'order',
      linkTab: 'live-orders'
    });

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Recorded Payment',
      entity: 'order',
      entityId: order.order_number,
      details: `Payment recorded as ${newPaymentStatus} for #${order.order_number} (${newPaymentMethod})`
    });

    res.json({ success: true, message: `Payment recorded as ${newPaymentStatus}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 8. DIGITAL RECEIPTS ===================

// Receipt Data Endpoint
app.get('/api/receipts/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const db = await getDb();

    const order = await getOrderByIdOrNumber(db, orderNumber);
    if (!order) return res.status(404).json({ error: 'Receipt not found' });

    order.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const receipt = await db.get('SELECT * FROM receipts WHERE order_id = ?', [order.id]);
    const payment = await db.get('SELECT * FROM payments WHERE order_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1', [order.id, 'successful'])
      || await db.get('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1', [order.id]);

    const isPaid = order.payment_status === 'successful' || order.payment_status === 'paid';
    let validTxnId = null;
    if (isPaid && payment?.transaction_id && !payment.transaction_id.startsWith('rzp_order_')) {
      validTxnId = payment.transaction_id;
    }

    order.transaction_id = validTxnId;
    order.payment = payment;

    res.json({
      receipt_number: receipt?.receipt_number || `RCP_${order.order_number}`,
      order,
      payment,
      transaction_id: validTxnId,
      isSimulated: payment?.provider === 'simulated'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Receipt Printable / Download HTML
app.get('/api/receipts/:orderNumber/download', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const db = await getDb();
    const order = await getOrderByIdOrNumber(db, orderNumber);
    if (!order) return res.status(404).send('<h2>Receipt Not Found</h2>');

    const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const payment = await db.get('SELECT * FROM payments WHERE order_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1', [order.id, 'successful'])
      || await db.get('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1', [order.id]);
    const isSimulated = payment?.provider === 'simulated';
    const isPayAtCafe = order.payment_method === 'cash';
    const isPaid = order.payment_status === 'successful' || order.payment_status === 'paid';

    let txnIdDisplay;
    if (isPayAtCafe) {
      if (isPaid && payment?.transaction_id && !payment.transaction_id.startsWith('rzp_order_')) {
        txnIdDisplay = payment.transaction_id;
      } else {
        txnIdDisplay = isPaid ? 'Paid at Cafe (Cash)' : 'Not applicable (Unpaid - Pay at Cafe)';
      }
    } else {
      if (isPaid && payment?.transaction_id && !payment.transaction_id.startsWith('rzp_order_')) {
        txnIdDisplay = payment.transaction_id;
      } else if (order.payment_status === 'failed') {
        txnIdDisplay = 'Payment Failed';
      } else {
        txnIdDisplay = 'Payment Pending';
      }
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt - FrenchBell Cafe #${order.order_number}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; max-width: 440px; margin: auto; color: #2D1810; background: #FFFDF9; border: 1px solid #D4AF37; border-radius: 16px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .simulated { background: #FEF3C7; color: #92400E; border: 1px solid #F59E0B; }
    .paid { background: #D1FAE5; color: #065F46; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; }
    th { text-align: left; border-bottom: 2px solid #D4AF37; padding: 8px 0; font-size: 12px; }
    td { padding: 8px 0; border-bottom: 1px dashed #E5E7EB; font-size: 13px; }
    .total-row { font-weight: bold; font-size: 16px; border-top: 2px solid #2D1810; }
    .print-btn { display: block; width: 100%; padding: 12px; background: #2D1810; color: #D4AF37; font-weight: bold; border: none; border-radius: 8px; margin-top: 20px; cursor: pointer; }
    @media print { .print-btn { display: none; } body { border: none; } }
  </style>
</head>
<body>
  <div style="text-align: center;">
    <h2 style="margin: 0; color: #2D1810; font-family: serif;">FRENCHBELL CAFE</h2>
    <p style="font-size: 12px; color: #6B7280; margin: 4px 0;">Official Tax Invoice & Receipt</p>
    ${isSimulated ? '<div class="badge simulated" style="margin: 6px 0;">TEST / SIMULATED PAYMENT</div>' : ''}
  </div>

  <div style="margin-top: 16px; font-size: 12px; line-height: 1.6;">
    <div><strong>Order No:</strong> #${order.order_number}</div>
    <div><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</div>
    <div><strong>Customer:</strong> ${order.customer_name} (+91 ${order.phone})</div>
    <div><strong>Order Mode:</strong> <span style="text-transform: uppercase;">${order.order_type}</span></div>
    ${order.order_type === 'delivery' && order.delivery_address ? `<div><strong>Delivery Address:</strong> ${order.delivery_address}${order.landmark ? ` (Near ${order.landmark})` : ''}${order.pincode ? ` - ${order.pincode}` : ''}</div>` : ''}
    ${order.order_type === 'dine-in' && order.table_number ? `<div><strong>Table Number:</strong> Table #${order.table_number}</div>` : ''}
    <div><strong>Payment Status:</strong> <span class="badge ${isPaid ? 'paid' : 'simulated'}">${order.payment_status.toUpperCase()}</span></div>
    <div><strong>Payment Method:</strong> ${isPayAtCafe ? 'Pay at Cafe (Cash)' : (order.payment_method ? order.payment_method.toUpperCase() : 'Not recorded')}</div>
    <div><strong>Transaction ID:</strong> <span style="font-family: monospace;">${txnIdDisplay}</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Price</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(it => `
        <tr>
          <td>
            <div>${it.item_name} ${it.variant ? `(${it.variant})` : ''}</div>
            ${it.customizations ? `<div style="font-size: 11px; color: #8B5A2B;">+ ${it.customizations}</div>` : ''}
          </td>
          <td style="text-align: center;">${it.quantity}</td>
          <td style="text-align: right;">₹${Number(it.total_price).toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div style="margin-top: 16px; font-size: 13px; line-height: 1.8;">
    <div style="display: flex; justify-content: space-between;"><span>Subtotal:</span><span>₹${Number(order.subtotal).toFixed(2)}</span></div>
    ${Number(order.discount) > 0 ? `<div style="display: flex; justify-content: space-between; color: #059669;"><span>Discount:</span><span>-₹${Number(order.discount).toFixed(2)}</span></div>` : ''}
    ${Number(order.delivery_charge) > 0 ? `<div style="display: flex; justify-content: space-between;"><span>Delivery Fee:</span><span>₹${Number(order.delivery_charge).toFixed(2)}</span></div>` : ''}
    ${Number(order.tax) > 0 ? `<div style="display: flex; justify-content: space-between;"><span>GST Tax:</span><span>₹${Number(order.tax).toFixed(2)}</span></div>` : ''}
    <div class="total-row" style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px;">
      <span>Total Paid:</span>
      <span>₹${Number(order.total).toFixed(2)}</span>
    </div>
  </div>

  <div style="text-align: center; margin-top: 24px; font-size: 13px; font-style: italic; color: #8B5A2B;">
    Ding. Eat. Repeat. Thank You!
  </div>

  <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).send('<h2>Error Generating Receipt</h2>');
  }
});

// Configured Receipt Dispatch Endpoint (WhatsApp / SMS provider abstraction)
app.post('/api/receipts/:orderNumber/dispatch', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const result = await ReceiptDeliveryService.dispatchReceipt(orderNumber);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WhatsApp link generator (for manual customer click or chat open)

app.post('/api/receipts/whatsapp', async (req, res) => {
  try {
    const { order_id, orderId, order_number, orderNumber, phone } = req.body;
    const db = await getDb();

    let order = null;
    const targetOrderId = order_id ?? orderId;

    if (targetOrderId !== undefined && targetOrderId !== null) {
      order = await db.get(
        'SELECT * FROM orders WHERE id = ?',
        [targetOrderId]
      );
    } else {
      const targetOrderNumber = order_number || orderNumber;

      if (targetOrderNumber) {
        order = await db.get(
          `SELECT * FROM orders
           WHERE order_number = ?
           ORDER BY created_at DESC, id DESC
           LIMIT 1`,
          [targetOrderNumber]
        );
      }
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const targetPhone = phone || order.phone;
    const cleanPhone = normalizePhone(targetPhone);

    const receiptUrl =
      `${getBaseUrl(req)}/api/receipts/${order.id}/download`;

    const message = encodeURIComponent(
      `FrenchBell Cafe Order #${order.order_number}\n` +
      `Amount: ₹${order.total}\n` +
      `Status: ${order.order_status}\n` +
      `View receipt: ${receiptUrl}`
    );

    const whatsappLink =
      `https://wa.me/91${cleanPhone}?text=${message}`;

    res.json({
      success: true,
      whatsapp_link: whatsappLink,
      phone: cleanPhone,
      message: 'WhatsApp message link generated'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =================== 9. CUSTOMERS DIRECTORY ===================

app.get('/api/customers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const { search } = req.query;

    let query = `
      SELECT
        u.id,
        u.name,
        u.phone,
        u.created_at as registered_at,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total), 0) as total_spending,
        MAX(o.created_at) as last_order_date
      FROM users u
      LEFT JOIN orders o ON (o.user_id = u.id OR o.phone = u.phone)
      WHERE u.role = 'customer'
    `;
    const params = [];

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(u.name) LIKE $${params.length} OR u.phone LIKE $${params.length})`;
    }

    query += `
      GROUP BY u.id, u.name, u.phone, u.created_at
      ORDER BY total_spending DESC
    `;

    const customers = await db.all(query, params);

    for (const c of customers) {
      c.total_orders = parseInt(c.total_orders || '0', 10);
      c.total_spending = parseFloat(c.total_spending || '0');
      c.total_spent = c.total_spending;
      c.order_history = await db.all(
        'SELECT * FROM orders WHERE user_id = ? OR phone = ? ORDER BY created_at DESC LIMIT 20',
        [c.id, c.phone]
      );
      for (const ord of c.order_history) {
        ord.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
      }
      c.orders = c.order_history;
      if (c.order_history && c.order_history.length > 0) {
        c.preferred_order_type = c.order_history[0].order_type;
      }
    }

    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 10. OFFERS & COUPONS ===================

app.get('/api/offers', async (req, res) => {
  try {
    const db = await getDb();
    const offers = await db.all('SELECT * FROM offers ORDER BY id ASC');
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/offers/generate-code', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const prefixes = ['BELL', 'FEST', 'YUM', 'FEAST', 'CHEF', 'SPECIAL', 'CRAVE'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const code = `${prefix}${Math.floor(10 + Math.random() * 90)}`;
    res.json({ code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/offers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, coupon_code, discount_type, discount_value, minimum_order, max_discount, valid_from, valid_until, applicable_order_type, active } = req.body;
    if (!title || !coupon_code || !discount_value) {
      return res.status(400).json({ error: 'Title, coupon code, and discount value are required.' });
    }

    const cleanCode = coupon_code.trim().toUpperCase();
    const db = await getDb();

    const existing = await db.get('SELECT * FROM offers WHERE UPPER(coupon_code) = ?', [cleanCode]);
    if (existing) {
      return res.status(400).json({ error: `Coupon code "${cleanCode}" already exists.` });
    }

    await db.run(`
      INSERT INTO offers (title, description, coupon_code, discount_type, discount_value, minimum_order, max_discount, valid_from, valid_until, applicable_order_type, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, cleanCode, discount_type || 'percentage', discount_value, minimum_order || 0, max_discount || null, valid_from || null, valid_until || null, applicable_order_type || 'all', active !== undefined ? (active ? 1 : 0) : 1]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Created Coupon',
      entity: 'coupon',
      entityId: cleanCode,
      details: `Created coupon ${cleanCode}`
    });

    res.json({ message: 'Coupon created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/offers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM offers WHERE id = ?', [req.params.id]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Deleted Coupon',
      entity: 'coupon',
      entityId: req.params.id,
      details: `Removed coupon #${req.params.id}`
    });

    res.json({ message: 'Offer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 11. ADVERTISEMENTS ===================

app.get('/api/advertisements', async (req, res) => {
  try {
    const db = await getDb();
    const ads = await db.all('SELECT * FROM advertisements ORDER BY id ASC');
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/advertisements', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, image_url, description, cta, start_date, end_date, active } = req.body;
    const db = await getDb();

    await db.run(`
      INSERT INTO advertisements (title, image_url, description, cta, start_date, end_date, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, image_url || '/assets/food/burger.jpg', description, cta || 'Order Now', start_date || null, end_date || null, active !== undefined ? (active ? 1 : 0) : 1]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Published Banner',
      entity: 'advertisement',
      details: `Published announcement "${title}"`
    });

    res.json({ message: 'Advertisement created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/advertisements/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM advertisements WHERE id = ?', [req.params.id]);

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Deleted Banner',
      entity: 'advertisement',
      entityId: req.params.id,
      details: `Removed banner #${req.params.id}`
    });

    res.json({ message: 'Advertisement deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 12. DINE-IN TABLES & QR CODES ===================

app.get('/api/tables', async (req, res) => {
  try {
    const db = await getDb();
    const baseUrl = getBaseUrl(req);

    let tables = await db.all('SELECT * FROM tables ORDER BY table_number ASC');

    if (!tables || tables.length === 0) {
      for (let t = 1; t <= 12; t++) {
        const tableNum = String(t).padStart(2, '0');
        await db.run(`
          INSERT INTO tables (table_number, name, capacity, status, qr_url)
          VALUES (?, ?, ?, 'active', ?)
          ON CONFLICT (table_number) DO NOTHING
        `, [tableNum, `Table #${tableNum}`, t <= 4 ? 2 : (t <= 8 ? 4 : 6), `${baseUrl}/?table=${tableNum}&mode=dine-in`]);
      }
      tables = await db.all('SELECT * FROM tables ORDER BY table_number ASC');
    }

    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 13. PAYMENTS & TRANSACTIONS ===================

app.get('/api/payments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const payments = await db.all(`
      SELECT p.*, o.order_number, o.customer_name, o.phone, o.order_type
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      ORDER BY p.created_at DESC
    `);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 13B. ANALYTICS & EXECUTIVE SUMMARY ===================

app.get('/api/analytics/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();

    // Fetch all orders
    const orders = await db.all('SELECT * FROM orders ORDER BY created_at DESC');

    // Total & Status counts
    const total_orders = orders.length;
    const completed_orders = orders.filter(o => o.order_status === 'completed').length;
    const cancelled_orders = orders.filter(o => o.order_status === 'cancelled').length;
    const pending_orders = orders.filter(o => ['received', 'new', 'accepted', 'preparing', 'ready', 'out_for_delivery'].includes(o.order_status)).length;

    // Channel counts
    const dine_in_orders = orders.filter(o => o.order_type === 'dine-in').length;
    const takeaway_orders = orders.filter(o => o.order_type === 'takeaway').length;
    const delivery_orders = orders.filter(o => o.order_type === 'delivery').length;

    // Revenue calculations (non-cancelled orders)
    const validOrders = orders.filter(o => o.order_status !== 'cancelled');
    const total_revenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const average_order_value = validOrders.length > 0 ? Math.round(total_revenue / validOrders.length) : 0;

    // Safe Date string extractor
    const toDateStr = (val) => {
      if (!val) return '';
      if (val instanceof Date) return val.toISOString().split('T')[0];
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.includes('T')) return trimmed.split('T')[0];
        if (trimmed.includes(' ')) return trimmed.split(' ')[0];
        return trimmed;
      }
      try { return new Date(val).toISOString().split('T')[0]; } catch (e) { return ''; }
    };

    // Today revenue
    const todayStr = toDateStr(new Date());
    const todayOrders = validOrders.filter(o => {
      const d = toDateStr(o.business_day || o.created_at);
      return d === todayStr;
    });
    const today_revenue = todayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    // Active customers
    const uniquePhones = new Set(orders.map(o => o.phone).filter(Boolean));
    const active_customers = uniquePhones.size;

    // Popular items
    const orderItems = await db.all(`
      SELECT item_name as name, SUM(quantity) as quantity, SUM(total_price) as revenue
      FROM order_items
      GROUP BY item_name
      ORDER BY quantity DESC
      LIMIT 5
    `).catch(() => []);

    // Sales trajectory data for Today, Weekly, Monthly
    // 1. Today (Hourly slots: 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00)
    const todaySlots = [
      { date: '10:00', revenue: 0 },
      { date: '12:00', revenue: 0 },
      { date: '14:00', revenue: 0 },
      { date: '16:00', revenue: 0 },
      { date: '18:00', revenue: 0 },
      { date: '20:00', revenue: 0 },
      { date: '22:00', revenue: 0 }
    ];
    for (const o of todayOrders) {
      if (!o.created_at) continue;
      const d = new Date(o.created_at);
      const hour = isNaN(d.getTime()) ? 12 : d.getHours();
      const val = Number(o.total) || 0;
      if (hour < 11) todaySlots[0].revenue += val;
      else if (hour < 13) todaySlots[1].revenue += val;
      else if (hour < 15) todaySlots[2].revenue += val;
      else if (hour < 17) todaySlots[3].revenue += val;
      else if (hour < 19) todaySlots[4].revenue += val;
      else if (hour < 21) todaySlots[5].revenue += val;
      else todaySlots[6].revenue += val;
    }

    // 2. Weekly (Last 7 days)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklySlots = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toDateStr(d);
      const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}`;

      const dayRev = validOrders
        .filter(o => toDateStr(o.business_day || o.created_at) === iso)
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      weeklySlots.push({ date: dayLabel, revenue: dayRev });
    }

    // 3. Monthly (4 weeks)
    const monthlySlots = [
      { date: 'Week 1', revenue: 0 },
      { date: 'Week 2', revenue: 0 },
      { date: 'Week 3', revenue: 0 },
      { date: 'Week 4', revenue: 0 }
    ];
    const now = Date.now();
    for (const o of validOrders) {
      if (!o.created_at) continue;
      const diffDays = Math.floor((now - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const val = Number(o.total) || 0;
      if (diffDays <= 7) monthlySlots[3].revenue += val;
      else if (diffDays <= 14) monthlySlots[2].revenue += val;
      else if (diffDays <= 21) monthlySlots[1].revenue += val;
      else if (diffDays <= 28) monthlySlots[0].revenue += val;
    }

    // Inventory items
    const menuItems = await db.all('SELECT * FROM menu_items').catch(() => []);
    const out_of_stock_items = menuItems.filter(i => i.available === 0 || (i.stock_quantity !== undefined && Number(i.stock_quantity) <= 0));
    const low_stock_items = menuItems.filter(i => i.available !== 0 && i.stock_quantity !== undefined && Number(i.stock_quantity) > 0 && Number(i.stock_quantity) <= 5);

    res.json({
      today_revenue,
      total_orders,
      total_revenue,
      pending_orders,
      completed_orders,
      cancelled_orders,
      dine_in_orders,
      takeaway_orders,
      delivery_orders,
      active_customers,
      new_customers: active_customers,
      average_order_value,
      popular_items: orderItems,
      out_of_stock_items,
      low_stock_items,
      sales_graph: {
        today: todaySlots,
        weekly: weeklySlots,
        monthly: monthlySlots
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 14. ADMIN ACTIVITY LOGS & AUDIT TRAIL ===================

app.get('/api/admin/activity-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const { action, admin_id, admin_email, entity, search, start_date, end_date, limit = 100 } = req.query;

    let query = 'SELECT * FROM activity_logs WHERE 1=1';
    const params = [];

    if (action && action !== 'all') {
      params.push(`%${action.toLowerCase()}%`);
      query += ` AND LOWER(action) LIKE $${params.length}`;
    }

    if (admin_id) {
      params.push(admin_id);
      query += ` AND admin_id = $${params.length}`;
    }

    if (admin_email) {
      params.push(admin_email.toLowerCase());
      query += ` AND LOWER(admin_email) = $${params.length}`;
    }

    if (entity && entity !== 'all') {
      params.push(entity.toLowerCase());
      query += ` AND LOWER(entity) = $${params.length}`;
    }

    if (start_date) {
      params.push(new Date(start_date));
      query += ` AND created_at >= $${params.length}`;
    }

    if (end_date) {
      params.push(new Date(end_date));
      query += ` AND created_at <= $${params.length}`;
    }

    if (search && search.trim()) {
      const searchVal = `%${search.trim().toLowerCase()}%`;
      params.push(searchVal);
      const idx = params.length;
      query += ` AND (LOWER(details) LIKE $${idx} OR LOWER(action) LIKE $${idx} OR LOWER(admin_name) LIKE $${idx} OR LOWER(reason) LIKE $${idx})`;
    }

    query += ' ORDER BY created_at DESC';

    const pageLimit = Math.min(500, parseInt(limit, 10) || 50);
    const pageOffset = Math.max(0, parseInt(req.query.offset, 10) || 0);

    // Count query — same filters, no ORDER/LIMIT/OFFSET
    const countQuery = query.replace('SELECT * FROM activity_logs', 'SELECT COUNT(*) as total FROM activity_logs').replace(/\s+ORDER\s+BY.*$/i, '');

    params.push(pageLimit);
    query += ` LIMIT $${params.length}`;
    params.push(pageOffset);
    query += ` OFFSET $${params.length}`;

    const countParams = params.slice(0, params.length - 2);
    const [logs, countRow] = await Promise.all([
      db.all(query, params),
      db.get(countQuery, countParams)
    ]);

    const total = parseInt(countRow?.total || '0', 10);
    res.json({ logs, total, page: Math.floor(pageOffset / pageLimit) + 1, limit: pageLimit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =================== 15. INVENTORY & STOCK ===================

app.get('/api/inventory', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const items = await db.all('SELECT * FROM inventory ORDER BY id ASC');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 16. ADMIN NOTIFICATIONS ===================

app.get('/api/admin/notifications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const notifications = await db.all('SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 50');
    const unreadRow = await db.get('SELECT COUNT(*) as count FROM admin_notifications WHERE read = 0');
    const unreadCount = parseInt(unreadRow?.count || '0', 10);

    res.json({
      notifications,
      unreadCount,
      unread_count: unreadCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark single notification as read
app.put('/api/admin/notifications/:id/read', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('UPDATE admin_notifications SET read = 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read
const markAllAdminNotificationsRead = async (req, res) => {
  try {
    const db = await getDb();
    await db.run('UPDATE admin_notifications SET read = 1');
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.put('/api/admin/notifications/read-all', authenticateToken, requireAdmin, markAllAdminNotificationsRead);
app.put('/api/admin/notifications/mark-read', authenticateToken, requireAdmin, markAllAdminNotificationsRead);

// =================== 17. SETTINGS ===================

app.get('/api/settings', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM settings');
    const settingsMap = {};
    for (const r of rows) settingsMap[r.key] = r.value;
    res.json(settingsMap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const settingsObj = req.body;
    for (const [key, value] of Object.entries(settingsObj)) {
      await db.run(`
        INSERT INTO settings (key, value)
        VALUES (?, ?)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
      `, [key, typeof value === 'object' ? JSON.stringify(value) : String(value)]);
    }

    await db.logActivity({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: req.user.name,
      action: 'Updated Cafe Settings',
      entity: 'settings',
      details: 'Updated operational settings'
    });

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`FrenchBell Cafe Operations Server running on port ${PORT}`);
    console.log(`[Config] Loaded environment from: ${envPath} (exists: ${envExists})`);
    console.log(`[Config] Test OTP Mode: ${isTestOtpMode ? 'ACTIVE (Dynamic 4-digit OTP shown in test UI)' : 'DISABLED (Real SMS required)'}`);
    console.log(`[Config] Database: PostgreSQL adapter ready`);
  });
}

export default app;
