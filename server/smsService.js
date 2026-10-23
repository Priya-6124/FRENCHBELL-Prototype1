import './env.js';

/**
 * FrenchBell Cafe — Real SMS OTP Delivery Service
 *
 * Supports production SMS providers:
 * 1. Fast2SMS (India DLT/OTP API)
 * 2. Twilio (Global SMS API)
 * 3. MSG91 (India Transactional/OTP API)
 *
 * Zero external binary dependencies — uses native fetch.
 * Explicitly errors when credentials are not configured (no silent simulated success).
 */

class SmsService {
  constructor() {
    this.reloadConfig();
  }

  reloadConfig() {
    this.provider = (process.env.SMS_PROVIDER || '').trim().toLowerCase();
    
    // Fast2SMS
    this.fast2smsKey = (process.env.FAST2SMS_API_KEY || '').trim();
    
    // Twilio
    this.twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
    this.twilioAuth = (process.env.TWILIO_AUTH_TOKEN || '').trim();
    this.twilioFrom = (process.env.TWILIO_PHONE_NUMBER || '').trim();
    
    // MSG91
    this.msg91Key = (process.env.MSG91_AUTH_KEY || '').trim();
    this.msg91TemplateId = (process.env.MSG91_TEMPLATE_ID || '').trim();
  }

  isConfigured() {
    this.reloadConfig();
    if (this.provider === 'fast2sms' && this.fast2smsKey) return true;
    if (this.provider === 'twilio' && this.twilioSid && this.twilioAuth && this.twilioFrom) return true;
    if (this.provider === 'msg91' && this.msg91Key) return true;
    // Auto-detect provider if keys exist without SMS_PROVIDER set explicitly
    if (this.fast2smsKey) return true;
    if (this.twilioSid && this.twilioAuth && this.twilioFrom) return true;
    if (this.msg91Key) return true;
    return false;
  }

  /**
   * Send SMS OTP to 10-digit Indian mobile number
   * @param {{ phone: string, otp: string }} params
   */
  async sendOtp({ phone, otp }) {
    this.reloadConfig();
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }

    if (!otp) {
      throw new Error('OTP is required.');
    }

    // 1. Fast2SMS
    if (this.provider === 'fast2sms' || (!this.provider && this.fast2smsKey)) {
      if (!this.fast2smsKey) {
        throw new Error('Fast2SMS is selected but FAST2SMS_API_KEY is missing in .env.');
      }
      return this._sendFast2Sms(cleanPhone, otp);
    }

    // 2. Twilio
    if (this.provider === 'twilio' || (!this.provider && this.twilioSid && this.twilioAuth)) {
      if (!this.twilioSid || !this.twilioAuth || !this.twilioFrom) {
        throw new Error('Twilio is selected but TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER is missing in .env.');
      }
      return this._sendTwilio(cleanPhone, otp);
    }

    // 3. MSG91
    if (this.provider === 'msg91' || (!this.provider && this.msg91Key)) {
      if (!this.msg91Key) {
        throw new Error('MSG91 is selected but MSG91_AUTH_KEY is missing in .env.');
      }
      return this._sendMsg91(cleanPhone, otp);
    }

    // Not configured
    throw new Error(
      'SMS provider is not configured. Please configure an SMS provider (fast2sms, twilio, or msg91) in .env to deliver real OTPs to customer phones.'
    );
  }

  async _sendFast2Sms(phone, otp) {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': this.fast2smsKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        variables_values: otp,
        route: 'otp',
        numbers: phone
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.return === false) {
      const msg = data.message ? (Array.isArray(data.message) ? data.message.join(', ') : data.message) : 'Fast2SMS dispatch failed';
      throw new Error(`SMS Provider Error (Fast2SMS): ${msg}`);
    }

    return {
      success: true,
      provider: 'fast2sms',
      messageId: data.request_id || `f2s_${Date.now()}`,
      phone
    };
  }

  async _sendTwilio(phone, otp) {
    const formattedTo = `+91${phone}`;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioSid}/Messages.json`;
    const body = new URLSearchParams({
      To: formattedTo,
      From: this.twilioFrom,
      Body: `Your FrenchBell Cafe verification code is ${otp}. Valid for 5 minutes. Please do not share this OTP with anyone.`
    });

    const basicAuth = Buffer.from(`${this.twilioSid}:${this.twilioAuth}`).toString('base64');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`SMS Provider Error (Twilio): ${data.message || 'Twilio delivery failed'}`);
    }

    return {
      success: true,
      provider: 'twilio',
      messageId: data.sid || `tw_${Date.now()}`,
      phone
    };
  }

  async _sendMsg91(phone, otp) {
    const templateQuery = this.msg91TemplateId ? `&template_id=${encodeURIComponent(this.msg91TemplateId)}` : '';
    const url = `https://control.msg91.com/api/v5/otp?mobile=91${phone}&authkey=${encodeURIComponent(this.msg91Key)}&otp=${encodeURIComponent(otp)}${templateQuery}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.type === 'error') {
      throw new Error(`SMS Provider Error (MSG91): ${data.message || 'MSG91 dispatch failed'}`);
    }

    return {
      success: true,
      provider: 'msg91',
      messageId: data.request_id || `msg91_${Date.now()}`,
      phone
    };
  }
}

export const smsService = new SmsService();
export default smsService;
