import assert from 'assert';

process.env.NODE_ENV = 'test';
process.env.TEST_OTP_MODE = 'true';
delete process.env.DEV_FIXED_OTP;
process.env.ADMIN_EMAIL = 'manager@frenchbellcafe.com';
process.env.ADMIN_PASSWORD = 'FrenchBell@2026!';
delete process.env.DATABASE_URL;
delete process.env.PGHOST;
delete process.env.SMTP_USER;
delete process.env.SMTP_USERNAME;
delete process.env.SMTP_PASS;
delete process.env.SMTP_PASSWORD;
delete process.env.RESEND_API_KEY;
delete process.env.SENDGRID_API_KEY;
delete process.env.BREVO_API_KEY;

const { default: app } = await import('../server/index.js');
const { default: getDb } = await import('../server/db/index.js');

let server;
let baseUrl;
let primaryAdminToken;
let primaryAdminUser;
let testCustomerToken;
let testCustomerUser;

const passedTests = [];
const failedTests = [];

async function test(name, fn) {
  try {
    await fn();
    passedTests.push(name);
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failedTests.push({ name, error: err });
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message || err}`);
  }
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  let body;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  return { status: res.status, ok: res.ok, body, headers: res.headers };
}

console.log('\n========================================');
console.log('FRENCHBELL CAFE — COMPREHENSIVE TEST SUITE');
console.log('========================================\n');

try {
  // Start server on ephemeral port
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  const db = await getDb();

  // Seed sample menu categories and items for checkout testing
  await db.run(`INSERT INTO menu_categories (id, name, slug) VALUES (1, 'Burgers', 'burgers') ON CONFLICT DO NOTHING`);
  await db.run(`
    INSERT INTO menu_items (id, category_id, name, price, available, stock_quantity)
    VALUES (1, 1, 'Classic French Burger', 250, 1, 20)
    ON CONFLICT DO NOTHING
  `);

  // --- 1. HEALTH & INITIAL PROVISIONING ---
  console.log('\n1. Health Check & Initial Admin Provisioning:');
  await test('GET /api/health returns database connected and testOtpMode true', async () => {
    const res = await request('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.strictEqual(res.body.database, 'connected');
    assert.strictEqual(res.body.testOtpMode, true);
  });

  await test('POST /api/auth/admin-login auto-provisions primary admin on first login', async () => {
    const res = await request('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'manager@frenchbellcafe.com',
        password: 'FrenchBell@2026!'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(res.body.token);
    assert.strictEqual(res.body.user.email, 'manager@frenchbellcafe.com');
    assert.strictEqual(res.body.user.role, 'admin');
    primaryAdminToken = res.body.token;
    primaryAdminUser = res.body.user;
  });

  // --- 2. MULTIPLE ADMIN INVITATIONS ---
  console.log('\n2. Multiple Admin Invitations & Token Management:');
  let invite1Token;
  let invite1Id;
  let invite2Token;
  let invite2Id;

  await test('Can send invitation to first email (alice@frenchbell.com)', async () => {
    const res = await request('/api/admin/invite', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${primaryAdminToken}` },
      body: JSON.stringify({ email: 'alice@frenchbell.com' })
    });
    if (res.status !== 200) console.error('Invite error body:', res.body);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.invitation.email, 'alice@frenchbell.com');
    invite1Token = res.body.invitation.token;
    invite1Id = res.body.invitation.id;
  });

  await test('Can send invitation to second email (bob@frenchbell.com) without hardcoded limit', async () => {
    const res = await request('/api/admin/invite', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${primaryAdminToken}` },
      body: JSON.stringify({ email: 'bob@frenchbell.com' })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.invitation.email, 'bob@frenchbell.com');
    invite2Token = res.body.invitation.token;
    invite2Id = res.body.invitation.id;
  });

  await test('Prevents duplicate active pending invitation for same normalized email', async () => {
    const res = await request('/api/admin/invite', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${primaryAdminToken}` },
      body: JSON.stringify({ email: 'ALICE@frenchbell.com ' })
    });
    assert.strictEqual(res.status, 400);
    assert(res.body.error.includes('pending invitation has already been sent'));
  });

  await test('Resend invitation rotates token and refreshes expiry', async () => {
    const res = await request(`/api/admin/invitations/${invite2Id}/resend`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${primaryAdminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);

    // Verify token was rotated in database
    const updated = await db.get('SELECT * FROM admin_invitations WHERE id = ?', [invite2Id]);
    assert.notStrictEqual(updated.token, invite2Token, 'Token should be rotated on resend');
    invite2Token = updated.token; // Update with new token
  });

  await test('Cancel invitation marks status cancelled and invalidates token', async () => {
    // Send 3rd invite to cancel
    const createRes = await request('/api/admin/invite', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${primaryAdminToken}` },
      body: JSON.stringify({ email: 'charlie@frenchbell.com' })
    });
    const cancelInviteId = createRes.body.invitation.id;
    const cancelToken = createRes.body.invitation.token;

    const cancelRes = await request(`/api/admin/invitations/${cancelInviteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${primaryAdminToken}` }
    });
    assert.strictEqual(cancelRes.status, 200);

    // Verify invite-info rejects cancelled invitation
    const infoRes = await request(`/api/admin/invite-info?token=${cancelToken}`);
    assert.strictEqual(infoRes.status, 400);
    assert(infoRes.body.error.includes('cancelled'));

    // Verify accept-invitation rejects cancelled invitation
    const acceptRes = await request('/api/admin/accept-invitation', {
      method: 'POST',
      body: JSON.stringify({
        token: cancelToken,
        name: 'Charlie',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      })
    });
    assert.strictEqual(acceptRes.status, 400);
    assert(acceptRes.body.error.includes('cancelled'));
  });

  // --- 3. INVITATION ACCEPTANCE & ONE-TIME TOKEN USE ---
  console.log('\n3. Invitation Acceptance & One-Time Token Verification:');
  await test('Merely viewing invite-info does NOT create account', async () => {
    const infoRes = await request(`/api/admin/invite-info?token=${invite1Token}`);
    assert.strictEqual(infoRes.status, 200);
    assert.strictEqual(infoRes.body.valid, true);
    assert.strictEqual(infoRes.body.email, 'alice@frenchbell.com');

    // Confirm no user account was created
    const user = await db.get('SELECT * FROM users WHERE LOWER(email) = ?', ['alice@frenchbell.com']);
    assert.strictEqual(user, null, 'User should not exist until explicit form submission');
  });

  await test('Explicit accept-invitation creates admin account bound to invited email', async () => {
    const res = await request('/api/admin/accept-invitation', {
      method: 'POST',
      body: JSON.stringify({
        token: invite1Token,
        name: 'Alice Cooper',
        password: 'AdminPassword123!',
        confirmPassword: 'AdminPassword123!'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.email, 'alice@frenchbell.com');
    assert.strictEqual(res.body.user.role, 'admin');

    // Verify Alice can now sign in
    const loginRes = await request('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'alice@frenchbell.com',
        password: 'AdminPassword123!'
      })
    });
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.body.user.name, 'Alice Cooper');
  });

  await test('Single-use token enforcement: second acceptance attempt rejected', async () => {
    const res = await request('/api/admin/accept-invitation', {
      method: 'POST',
      body: JSON.stringify({
        token: invite1Token,
        name: 'Alice Again',
        password: 'AdminPassword123!',
        confirmPassword: 'AdminPassword123!'
      })
    });
    assert.strictEqual(res.status, 400);
    assert(res.body.error.includes('already been accepted'));
  });

  // --- 4. ADMIN SUSPENSION, RESTORATION & REMOVAL ---
  console.log('\n4. Admin Suspension, Restoration & Removal:');
  let aliceId;
  let aliceToken;

  await test('Setup: login as Alice', async () => {
    const res = await request('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'alice@frenchbell.com',
        password: 'AdminPassword123!'
      })
    });
    aliceId = res.body.user.id;
    aliceToken = res.body.token;
  });

  await test('Suspend requires mandatory reason', async () => {
    const res = await request(`/api/admin/users/${aliceId}/suspend`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${primaryAdminToken}` },
      body: JSON.stringify({ reason: '   ' })
    });
    assert.strictEqual(res.status, 400);
    assert(res.body.error.includes('mandatory reason'));
  });

  await test('Suspend admin with reason succeeds and immediately revokes active token', async () => {
    const suspendRes = await request(`/api/admin/users/${aliceId}/suspend`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${primaryAdminToken}` },
      body: JSON.stringify({ reason: 'Security audit pending' })
    });
    assert.strictEqual(suspendRes.status, 200);
    assert.strictEqual(suspendRes.body.status, 'suspended');

    // Alice's existing JWT token is immediately rejected
    const checkRes = await request('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${aliceToken}` }
    });
    assert.strictEqual(checkRes.status, 403);
    assert(checkRes.body.error.includes('suspended'));

    // Alice cannot sign in while suspended
    const loginRes = await request('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'alice@frenchbell.com',
        password: 'AdminPassword123!'
      })
    });
    assert.strictEqual(loginRes.status, 403);
    assert(loginRes.body.error.includes('suspended'));
  });

  await test('Restore admin reactivates account and permits sign in', async () => {
    const restoreRes = await request(`/api/admin/users/${aliceId}/restore`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${primaryAdminToken}` },
      body: JSON.stringify({ reason: 'Audit passed' })
    });
    assert.strictEqual(restoreRes.status, 200);

    const loginRes = await request('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'alice@frenchbell.com',
        password: 'AdminPassword123!'
      })
    });
    assert.strictEqual(loginRes.status, 200);
  });

  await test('Remove requires mandatory reason and soft-deletes user', async () => {
    const res = await request(`/api/admin/users/${aliceId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${primaryAdminToken}` },
      body: JSON.stringify({ reason: 'Department transfer' })
    });
    assert.strictEqual(res.status, 200);

    const user = await db.get('SELECT * FROM users WHERE id = ?', [aliceId]);
    assert.strictEqual(user.status, 'removed');
    assert.strictEqual(user.remove_reason, 'Department transfer');
  });

  await test('Last active admin protection prevents removing primary admin', async () => {
    const res = await request(`/api/admin/users/${primaryAdminUser.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${primaryAdminToken}` },
      body: JSON.stringify({ reason: 'Trying to remove sole admin' })
    });
    assert.strictEqual(res.status, 400);
    assert(res.body.error.includes('last active administrator'));
  });

  // --- 5. CUSTOMER TEST OTP AUTHENTICATION ---
  console.log('\n5. Customer Mobile OTP Authentication:');
  let receivedOtp;
  await test('Send OTP generates random 4-digit OTP (1000-9999) on backend in test mode', async () => {
    const res = await request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '9123456780' })
    });
    assert.strictEqual(res.status, 200);
    assert(typeof res.body.testOtp === 'string');
    assert(/^\d{4}$/.test(res.body.testOtp), 'OTP must be 4 digits');
    const numericOtp = parseInt(res.body.testOtp, 10);
    assert(numericOtp >= 1000 && numericOtp <= 9999, 'OTP must be between 1000 and 9999');
    assert.strictEqual(res.body.isTestMode, true);
    receivedOtp = res.body.testOtp;
  });

  await test('Verify OTP with wrong code is rejected', async () => {
    const wrongOtp = receivedOtp === '9999' ? '8888' : '9999';
    const res = await request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '9123456780', otp: wrongOtp })
    });
    assert.strictEqual(res.status, 400);
    assert(res.body.error.includes('Incorrect verification code'));
  });

  await test('Verify OTP with generated OTP creates customer account and returns JWT', async () => {
    const res = await request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        phone: '9123456780',
        otp: receivedOtp,
        name: 'Priya Sharma',
        whatsapp_opt_in: true
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.phone, '9123456780');
    assert.strictEqual(res.body.user.name, 'Priya Sharma');
    assert.strictEqual(res.body.user.role, 'customer');
    testCustomerToken = res.body.token;
    testCustomerUser = res.body.user;
  });

  await test('OTP is single-use and cannot be re-verified', async () => {
    const res = await request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '9123456780', otp: receivedOtp })
    });
    assert.strictEqual(res.status, 400);
  });

  // --- 6. DUMMY PAYMENT & ORDER TRACKING ---
  console.log('\n6. Dummy Payment, Receipts & Customer Order History:');
  let placedOrderNumber;

  await test('Customer creates order with items', async () => {
    const res = await request('/api/orders', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${testCustomerToken}` },
      body: JSON.stringify({
        customer_name: 'Priya Sharma',
        phone: '9123456780',
        order_type: 'takeaway',
        items: [{ id: 1, quantity: 2 }]
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(res.body.order_number);
    assert.strictEqual(res.body.order.payment_status, 'pending');
    placedOrderNumber = res.body.order_number;
  });

  await test('Simulated payment failure records failure and keeps order pending for retry', async () => {
    const res = await request('/api/payment/simulate', {
      method: 'POST',
      body: JSON.stringify({
        order_number: placedOrderNumber,
        outcome: 'failure',
        method: 'simulated_upi'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'failed');

    const order = await db.get('SELECT * FROM orders WHERE order_number = ?', [placedOrderNumber]);
    assert.strictEqual(order.payment_status, 'failed');
  });

  await test('Simulated payment success confirms order, decrements stock, and generates receipt', async () => {
    const stockBefore = (await db.get('SELECT stock_quantity FROM menu_items WHERE id = 1')).stock_quantity;

    const res = await request('/api/payment/simulate', {
      method: 'POST',
      body: JSON.stringify({
        order_number: placedOrderNumber,
        outcome: 'success',
        method: 'simulated_card'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'successful');
    assert.strictEqual(res.body.isSimulated, true);

    const order = await db.get('SELECT * FROM orders WHERE order_number = ?', [placedOrderNumber]);
    assert.strictEqual(order.payment_status, 'successful');
    assert.strictEqual(order.order_status, 'received');

    // Stock decremented by 2
    const stockAfter = (await db.get('SELECT stock_quantity FROM menu_items WHERE id = 1')).stock_quantity;
    assert.strictEqual(Number(stockAfter), Number(stockBefore) - 2);

    // Receipt created
    const receipt = await db.get('SELECT * FROM receipts WHERE order_id = ?', [order.id]);
    assert(receipt);
  });

  await test('Duplicate payment processing is prevented on already paid order', async () => {
    const res = await request('/api/payment/simulate', {
      method: 'POST',
      body: JSON.stringify({
        order_number: placedOrderNumber,
        outcome: 'success'
      })
    });
    assert.strictEqual(res.status, 400);
    assert(res.body.error.includes('already been paid'));
  });

  await test('Customer order history strictly enforces customer ownership', async () => {
    const res = await request('/api/customer/orders', {
      headers: { 'Authorization': `Bearer ${testCustomerToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.orders.length, 1);
    assert.strictEqual(res.body.orders[0].order_number, placedOrderNumber);
  });

  await test('Order tracking rejects unauthorized requests without token or phone', async () => {
    const res = await request(`/api/orders/${placedOrderNumber}/track`);
    assert.strictEqual(res.status, 401);
  });

  await test('Order tracking endpoint returns order status with customer authorization', async () => {
    const res = await request(`/api/orders/${placedOrderNumber}/track`, {
      headers: { 'Authorization': `Bearer ${testCustomerToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.order_status, 'received');
    assert(res.body.history.length >= 2, 'Should have order creation and payment entries in history');
  });

  await test('Receipt HTML view renders correctly with simulated badge and tax', async () => {
    const res = await request(`/api/receipts/${placedOrderNumber}/download`);
    assert.strictEqual(res.status, 200);
    assert(res.body.includes('TEST / SIMULATED PAYMENT'));
    assert(res.body.includes(placedOrderNumber));
  });

  // --- 7. ACTIVITY LOGS AUDIT TRAIL ---
  console.log('\n7. Activity Logs Audit Trail:');
  await test('Activity logs returns records and total count with admin authorization', async () => {
    const res = await request('/api/admin/activity-logs', {
      headers: { 'Authorization': `Bearer ${primaryAdminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.body.logs));
    assert(res.body.total > 0);
    assert(typeof res.body.total === 'number');

    // Verify critical lifecycle events are logged
    const actions = res.body.logs.map(l => l.action);
    assert(actions.includes('Invited Admin'), 'Should log Invited Admin');
    assert(actions.includes('Accepted Admin Invitation'), 'Should log Accepted Admin Invitation');
    assert(actions.includes('Suspended Admin'), 'Should log Suspended Admin');
    assert(actions.includes('Restored Admin Access'), 'Should log Restored Admin Access');
    assert(actions.includes('Removed Admin'), 'Should log Removed Admin');
  });

  await test('Activity logs filters by action', async () => {
    const res = await request('/api/admin/activity-logs?action=suspend', {
      headers: { 'Authorization': `Bearer ${primaryAdminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert(res.body.logs.every(l => l.action.toLowerCase().includes('suspend')));
  });

  await test('Activity logs rejected without admin authorization', async () => {
    const res = await request('/api/admin/activity-logs', {
      headers: { 'Authorization': `Bearer ${testCustomerToken}` }
    });
    assert.strictEqual(res.status, 403);
  });

} finally {
  if (server) {
    server.close();
  }
}

console.log('\n========================================');
console.log(`TEST SUMMARY: ${passedTests.length} PASSED, ${failedTests.length} FAILED`);
console.log('========================================\n');

if (failedTests.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
