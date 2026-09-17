/**
 * ====================================================================
 * IEEE IDEATHON 2026 — REGISTRATION & PAYMENT VERIFICATION SYSTEM
 * File: RazorpayService.gs
 * Description: Interacts with the Razorpay REST API using HTTP Basic Auth.
 *              Handles Payment Link generation, Payment details fetching,
 *              and cryptographic signature validation.
 * ====================================================================
 */

const RazorpayService = {
  /**
   * Generates Basic Auth header for Razorpay API.
   * @private
   */
  _getAuthHeader() {
    const config = getScriptConfig();
    if (!config.keyId || !config.keySecret) {
      throw new Error('Razorpay API Keys missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Script Properties.');
    }
    const combined = `${config.keyId}:${config.keySecret}`;
    return 'Basic ' + Utilities.base64Encode(combined);
  },

  /**
   * Creates a standard Razorpay Payment Link.
   * @param {Object} params
   * @param {string} params.registrationId Unique ID (e.g. IDEATHON-2026-00001)
   * @param {string} params.fullName Participant's Name
   * @param {string} params.email Participant's Email
   * @param {string} params.mobile Participant's Phone
   * @param {number} params.amountRupees Amount in INR (e.g. 200 or 300)
   * @param {string} params.participantType Selected category
   * @param {string} params.ieeeTrack Track chosen
   * @param {string} params.domain Innovation domain chosen
   * @return {Object} { id: string, shortUrl: string, status: string }
   */
  createPaymentLink(params) {
    const config = getScriptConfig();
    const url = 'https://api.razorpay.com/v1/payment_links';

    // Amount must be in paise (₹1 = 100 paise)
    const amountInPaise = Math.round(params.amountRupees * 100);

    // Format mobile number
    let cleanMobile = (params.mobile || '').toString().replace(/[^0-9]/g, '');
    if (cleanMobile.length > 10 && cleanMobile.startsWith('91')) {
      cleanMobile = cleanMobile.substring(2);
    }
    if (cleanMobile.length === 10) {
      cleanMobile = '+91' + cleanMobile;
    }

    const payload = {
      amount: amountInPaise,
      currency: CONFIG.CURRENCY,
      accept_partial: false,
      reference_id: params.registrationId,
      description: `Registration for ${CONFIG.EVENT_NAME} - ${params.participantType}`,
      customer: {
        name: params.fullName,
        email: params.email,
        contact: cleanMobile || undefined
      },
      notify: {
        sms: false,
        email: false
      },
      reminder_enable: true,
      notes: {
        registration_id: params.registrationId,
        participant_name: params.fullName,
        participant_type: params.participantType,
        ieee_track: params.ieeeTrack,
        innovation_domain: params.domain,
        event: CONFIG.EVENT_NAME,
        organizer: CONFIG.ORGANIZER_SHORT
      }
    };

    // Attach redirect callback URL if configured
    if (config.webAppUrl) {
      payload.callback_url = `${config.webAppUrl}?source=razorpay_redirect&reg_id=${encodeURIComponent(params.registrationId)}`;
      payload.callback_method = 'get';
    }

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: this._getAuthHeader()
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();
    const json = JSON.parse(responseText);

    if (statusCode >= 200 && statusCode < 300) {
      return {
        id: json.id,
        shortUrl: json.short_url,
        status: json.status
      };
    } else {
      const errorMsg = json.error ? json.error.description : responseText;
      throw new Error(`Razorpay API Error (${statusCode}): ${errorMsg}`);
    }
  },

  /**
   * Fetches the latest details of a Payment Link from Razorpay.
   * @param {string} paymentLinkId e.g. plink_xxxx
   * @return {Object} Payment link object
   */
  fetchPaymentLink(paymentLinkId) {
    const url = `https://api.razorpay.com/v1/payment_links/${paymentLinkId}`;
    const options = {
      method: 'get',
      headers: {
        Authorization: this._getAuthHeader()
      },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    const json = JSON.parse(response.getContentText());

    if (statusCode >= 200 && statusCode < 300) {
      return json;
    } else {
      throw new Error(`Failed to fetch payment link ${paymentLinkId}: ${json.error ? json.error.description : response.getContentText()}`);
    }
  },

  /**
   * Fetches specific payment details directly from Razorpay.
   * NEVER trust client data alone; always verify via this endpoint.
   * @param {string} paymentId e.g. pay_xxxx
   * @return {Object} Verified Payment entity
   */
  fetchPayment(paymentId) {
    const url = `https://api.razorpay.com/v1/payments/${paymentId}`;
    const options = {
      method: 'get',
      headers: {
        Authorization: this._getAuthHeader()
      },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    const json = JSON.parse(response.getContentText());

    if (statusCode >= 200 && statusCode < 300) {
      return json;
    } else {
      throw new Error(`Failed to fetch payment ${paymentId}: ${json.error ? json.error.description : response.getContentText()}`);
    }
  },

  /**
   * Verifies the cryptographic HMAC SHA256 signature of a Razorpay webhook.
   * @param {string} rawPayload The raw request body string
   * @param {string} signature Header 'x-razorpay-signature'
   * @param {string} secret Secret configured in Razorpay Webhook settings
   * @return {boolean} True if signature is authentic
   */
  verifyWebhookSignature(rawPayload, signature, secret) {
    if (!signature || !secret) {
      return false;
    }
    try {
      const signatureBytes = Utilities.computeHmacSha256Signature(rawPayload, secret);
      const computedSignature = signatureBytes.map(byte => {
        let n = (byte < 0 ? byte + 256 : byte).toString(16);
        return n.length === 1 ? '0' + n : n;
      }).join('');

      return computedSignature.toLowerCase() === signature.trim().toLowerCase();
    } catch (err) {
      Logger.log('Signature verification error: ' + err.message);
      return false;
    }
  }
};
