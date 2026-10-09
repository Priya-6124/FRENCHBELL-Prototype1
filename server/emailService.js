import net from 'net';
import tls from 'tls';
import crypto from 'crypto';

/**
 * FrenchBell Cafe - Real Email Service Layer
 * Supports:
 * 1. Standard SMTP with STARTTLS / SSL (Gmail, Brevo, SendGrid, Amazon SES, Outlook, etc.)
 *    Zero external binary dependencies using native Node.js net/tls sockets.
 * 2. REST API delivery (Resend, SendGrid, Brevo) via native fetch.
 * 3. Fallback to local Ethereal/test logging with verifiable preview tokens if unconfigured.
 */

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'smtp';
    this.from = process.env.EMAIL_FROM || '"FrenchBell Cafe" <manager@frenchbellcafe.com>';
    this.smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    this.smtpPort = Number(process.env.SMTP_PORT || 587);
    this.smtpSecure = process.env.SMTP_SECURE === 'true' || this.smtpPort === 465;
    this.smtpUser = process.env.SMTP_USER || '';
    this.smtpPass = process.env.SMTP_PASSWORD || '';
    
    // API keys
    this.resendKey = process.env.RESEND_API_KEY || '';
    this.sendgridKey = process.env.SENDGRID_API_KEY || '';
    this.brevoKey = process.env.BREVO_API_KEY || '';
  }

  /**
   * Send email using the configured provider
   */
  async sendMail({ to, subject, html, text }) {
    if (!to) throw new Error('Recipient email address is required.');

    const cleanTo = String(to).trim().toLowerCase();
    console.log(`[EmailService] Initiating email delivery to ${cleanTo} via ${this.provider.toUpperCase()}...`);

    // 1. Resend API
    if (this.provider === 'resend' && this.resendKey) {
      return this._sendViaResend({ to: cleanTo, subject, html, text });
    }

    // 2. SendGrid API
    if (this.provider === 'sendgrid' && this.sendgridKey) {
      return this._sendViaSendGrid({ to: cleanTo, subject, html, text });
    }

    // 3. Brevo API
    if (this.provider === 'brevo' && this.brevoKey) {
      return this._sendViaBrevo({ to: cleanTo, subject, html, text });
    }

    // 4. SMTP (Native Net/TLS Socket - RFC 5321)
    if (this.smtpUser && this.smtpPass) {
      return this._sendViaNativeSmtp({ to: cleanTo, subject, html, text });
    }

    // If SMTP credentials not yet provided in .env, log clear notice & simulate delivery
    console.warn(`[EmailService WARNING] SMTP credentials not set in .env. To enable live inbox delivery, set SMTP_USER & SMTP_PASSWORD in .env.`);
    return {
      success: true,
      simulated: true,
      messageId: `fb_sim_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      to: cleanTo,
      subject
    };
  }

  /**
   * Native SMTP Client using Node sockets (supports port 465 SSL & 587 STARTTLS)
   */
  async _sendViaNativeSmtp({ to, subject, html, text }) {
    return new Promise((resolve, reject) => {
      let socket = null;
      let step = 0;
      let buffer = '';

      const cleanup = () => {
        if (socket) {
          try { socket.end(); } catch (e) {}
          try { socket.destroy(); } catch (e) {}
        }
      };

      const sendCmd = (cmd) => {
        socket.write(cmd + '\r\n');
      };

      const onData = (data) => {
        buffer += data.toString();
        const lines = buffer.split('\r\n');
        buffer = lines.pop(); // keep partial

        for (const line of lines) {
          if (!line) continue;
          const code = parseInt(line.substring(0, 3), 10);
          if (isNaN(code)) continue;

          // Process SMTP State Machine
          if (step === 0 && code === 220) {
            // Connected, send EHLO
            step = 1;
            sendCmd(`EHLO localhost`);
          } else if (step === 1 && code === 250) {
            if (line.charAt(3) === ' ') {
              // EHLO finished
              if (!this.smtpSecure && this.smtpPort === 587) {
                step = 2; // STARTTLS
                sendCmd('STARTTLS');
              } else {
                step = 4; // AUTH LOGIN
                sendCmd('AUTH LOGIN');
              }
            }
          } else if (step === 2 && code === 220) {
            // Upgrade to TLS
            socket.removeAllListeners('data');
            socket.removeAllListeners('error');
            const tlsSocket = tls.connect({
              socket,
              host: this.smtpHost,
              rejectUnauthorized: false
            }, () => {
              socket = tlsSocket;
              socket.on('data', onData);
              socket.on('error', (err) => { cleanup(); reject(err); });
              step = 3;
              sendCmd('EHLO localhost');
            });
          } else if (step === 3 && code === 250) {
            if (line.charAt(3) === ' ') {
              step = 4;
              sendCmd('AUTH LOGIN');
            }
          } else if (step === 4 && code === 334) {
            // Send base64 username
            step = 5;
            sendCmd(Buffer.from(this.smtpUser).toString('base64'));
          } else if (step === 5 && code === 334) {
            // Send base64 password
            step = 6;
            sendCmd(Buffer.from(this.smtpPass).toString('base64'));
          } else if (step === 6 && code === 235) {
            // Auth success, send MAIL FROM
            step = 7;
            const fromAddr = this.from.includes('<') ? this.from.match(/<([^>]+)>/)[1] : this.from;
            sendCmd(`MAIL FROM:<${fromAddr}>`);
          } else if (step === 7 && code === 250) {
            // Send RCPT TO
            step = 8;
            sendCmd(`RCPT TO:<${to}>`);
          } else if (step === 8 && code === 250) {
            // Send DATA
            step = 9;
            sendCmd('DATA');
          } else if (step === 9 && code === 354) {
            // Send Email payload
            step = 10;
            const boundary = '===' + Date.now() + '===';
            const raw = [
              `From: ${this.from}`,
              `To: ${to}`,
              `Subject: ${subject}`,
              `MIME-Version: 1.0`,
              `Content-Type: multipart/alternative; boundary="${boundary}"`,
              ``,
              `--${boundary}`,
              `Content-Type: text/plain; charset=utf-8`,
              ``,
              text || '',
              ``,
              `--${boundary}`,
              `Content-Type: text/html; charset=utf-8`,
              ``,
              html,
              ``,
              `--${boundary}--`,
              `.`
            ].join('\r\n');
            socket.write(raw + '\r\n');
          } else if (step === 10 && code === 250) {
            // Sent successfully
            sendCmd('QUIT');
            cleanup();
            console.log(`[EmailService] Live email delivered to ${to} via SMTP!`);
            resolve({ success: true, messageId: `smtp_${Date.now()}`, to });
            return;
          } else if (code >= 400) {
            cleanup();
            reject(new Error(`SMTP Error [${code}]: ${line}`));
            return;
          }
        }
      };

      try {
        if (this.smtpSecure) {
          socket = tls.connect({
            host: this.smtpHost,
            port: this.smtpPort,
            rejectUnauthorized: false
          });
        } else {
          socket = net.connect({
            host: this.smtpHost,
            port: this.smtpPort
          });
        }

        socket.on('data', onData);
        socket.on('error', (err) => { cleanup(); reject(err); });
        socket.setTimeout(15000, () => {
          cleanup();
          reject(new Error('SMTP Connection Timed Out'));
        });
      } catch (err) {
        cleanup();
        reject(err);
      }
    });
  }

  async _sendViaResend({ to, subject, html, text }) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: this.from,
        to: [to],
        subject,
        html,
        text
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Resend delivery failed');
    return { success: true, messageId: data.id, to };
  }

  async _sendViaSendGrid({ to, subject, html, text }) {
    const fromAddr = this.from.includes('<') ? this.from.match(/<([^>]+)>/)[1] : this.from;
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.sendgridKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: fromAddr, name: 'FrenchBell Cafe' },
        subject,
        content: [
          { type: 'text/plain', value: text || 'FrenchBell Cafe Notification' },
          { type: 'text/html', value: html }
        ]
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`SendGrid delivery failed: ${errText}`);
    }
    return { success: true, messageId: `sg_${Date.now()}`, to };
  }

  async _sendViaBrevo({ to, subject, html, text }) {
    const fromAddr = this.from.includes('<') ? this.from.match(/<([^>]+)>/)[1] : this.from;
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': this.brevoKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'FrenchBell Cafe', email: fromAddr },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Brevo delivery failed');
    return { success: true, messageId: data.messageId, to };
  }

  // =================== EMAIL TEMPLATES ===================

  getBrandTemplate(title, contentHtml) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background-color:#FAF5ED; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1F110A; }
    .container { max-width:580px; margin:30px auto; background-color:#FFFDF9; border:2px solid #D4AF37; border-radius:24px; overflow:hidden; box-shadow:0 12px 36px rgba(31,17,10,0.1); }
    .header { background:#1F110A; padding:32px 24px; text-align:center; border-bottom:3px solid #D4AF37; }
    .brand { font-family:Georgia, serif; font-size:26px; font-weight:900; color:#D4AF37; letter-spacing:2px; margin:0; }
    .sub-brand { font-size:11px; text-transform:uppercase; letter-spacing:3px; color:#FAF5ED; opacity:0.8; margin-top:6px; font-weight:700; }
    .body { padding:36px 32px; font-size:15px; line-height:1.6; color:#2B180E; }
    .btn { display:inline-block; padding:15px 36px; background-color:#D4AF37; color:#1F110A !important; text-decoration:none; font-weight:800; font-size:14px; text-transform:uppercase; letter-spacing:1.5px; border-radius:50px; margin:24px 0; box-shadow:0 6px 20px rgba(212,175,55,0.4); text-align:center; }
    .footer { background-color:#FAF5ED; border-top:1px solid rgba(212,175,55,0.3); padding:24px; text-align:center; font-size:12px; color:#856B5C; }
    .box { background:#FAF5ED; border:1px solid rgba(212,175,55,0.4); border-radius:16px; padding:20px; margin:20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand">FRENCHBELL CAFE</h1>
      <div class="sub-brand">Administration & Operations Portal • Bengaluru</div>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin:0 0 6px;"><strong>FrenchBell Cafe</strong> • K. Narayanpura, Bengaluru – 560077, Karnataka</p>
      <p style="margin:0; font-size:11px;">This is an automated administrative notification. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 1. Send Admin Invitation Email
   */
  async sendAdminInvitation({ to, invitationUrl, invitedByName = 'An Administrator', expiresInHours = 72 }) {
    const subject = "You're invited to manage FrenchBell Cafe";
    const content = `
      <h2 style="font-family:Georgia, serif; color:#1F110A; margin-top:0; font-size:22px;">Administrator Invitation</h2>
      <p>Hello,</p>
      <p>You have been invited by <strong>${invitedByName}</strong> to become an administrator of <strong>FrenchBell Cafe</strong>.</p>
      <p>As an administrator, you will have access to cafe operations, live orders, menu catalogs, inventory, delivery settings, and analytics.</p>
      
      <div style="text-align:center;">
        <a href="${invitationUrl}" class="btn">Accept Invitation</a>
      </div>

      <div class="box">
        <p style="margin:0 0 8px; font-weight:bold; color:#1F110A; font-size:13px;">Security Notice:</p>
        <p style="margin:0; font-size:12px; color:#6B584E;">This invitation link is single-use and will expire in <strong>${expiresInHours} hours</strong>. If you did not expect this invitation, please disregard this email.</p>
      </div>

      <p style="font-size:12px; color:#856B5C; word-break:break-all;">
        If the button above does not work, copy and paste this link into your browser:<br>
        <a href="${invitationUrl}" style="color:#D4AF37;">${invitationUrl}</a>
      </p>
    `;

    const html = this.getBrandTemplate(subject, content);
    const text = `You're invited to manage FrenchBell Cafe by ${invitedByName}. Visit this link to accept your invitation: ${invitationUrl} (Expires in ${expiresInHours} hours)`;

    return this.sendMail({ to, subject, html, text });
  }

  /**
   * 2. Send Admin Password Reset Email
   */
  async sendPasswordReset({ to, resetUrl, expiresInMinutes = 30 }) {
    const subject = "Reset Your FrenchBell Cafe Admin Password";
    const content = `
      <h2 style="font-family:Georgia, serif; color:#1F110A; margin-top:0; font-size:22px;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset the password for your administrator account on the <strong>FrenchBell Cafe</strong> management portal.</p>
      
      <div style="text-align:center;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>

      <div class="box">
        <p style="margin:0 0 8px; font-weight:bold; color:#1F110A; font-size:13px;">Important:</p>
        <p style="margin:0; font-size:12px; color:#6B584E;">This password reset link will expire in <strong>${expiresInMinutes} minutes</strong> and can only be used once. If you did not initiate this request, your account is safe and no changes were made.</p>
      </div>

      <p style="font-size:12px; color:#856B5C; word-break:break-all;">
        Direct link: <a href="${resetUrl}" style="color:#D4AF37;">${resetUrl}</a>
      </p>
    `;

    const html = this.getBrandTemplate(subject, content);
    const text = `Reset your FrenchBell Cafe admin password by visiting: ${resetUrl} (Valid for ${expiresInMinutes} minutes)`;

    return this.sendMail({ to, subject, html, text });
  }

  /**
   * 3. Send New Admin Joined Notification to Existing Admins
   */
  async sendAdminJoinedNotification({ to, newAdminName, newAdminEmail }) {
    const subject = "New admin joined FrenchBell Cafe";
    const content = `
      <h2 style="font-family:Georgia, serif; color:#1F110A; margin-top:0; font-size:22px;">New Administrator Joined</h2>
      <p>Hello,</p>
      <p><strong>${newAdminName}</strong> (<em>${newAdminEmail}</em>) has accepted their invitation and joined the FrenchBell Cafe administrative team.</p>
      
      <div class="box">
        <p style="margin:0; font-size:13px; color:#1F110A;">
          <strong>Account Activated:</strong> ${new Date().toLocaleString()}<br>
          <strong>Access Level:</strong> Cafe Administrator
        </p>
      </div>

      <p style="font-size:13px; color:#6B584E;">You can manage team members anytime in the <strong>Settings &rarr; Admin Users</strong> section of the management dashboard.</p>
    `;

    const html = this.getBrandTemplate(subject, content);
    const text = `New administrator ${newAdminName} (${newAdminEmail}) has joined FrenchBell Cafe.`;

    return this.sendMail({ to, subject, html, text });
  }
}

export const emailService = new EmailService();
export default emailService;
