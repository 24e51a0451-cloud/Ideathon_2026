/**
 * ====================================================================
 * IEEE IDEATHON 2026 — COMPLETE ALL-IN-ONE GOOGLE APPS SCRIPT
 * Organized by: IEEE Student Branch, HITAM
 * Date: 25 September 2026
 * ====================================================================
 * This single file contains the entire backend implementation:
 * 1. Configuration & Constants
 * 2. Razorpay API Integration Service
 * 3. Form Submission & Sequential ID Engine
 * 4. Webhook & Redirect Verification Handler (doPost / doGet)
 * 5. Responsive HTML Email Templates
 * 6. Setup, Trigger Installation, 1-Click Form Builder & Diagnostics
 * ====================================================================
 */

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
  EVENT_NAME: 'IEEE IDEATHON 2026',
  ORGANIZER: 'IEEE Student Branch, Hyderabad Institute of Technology and Management (HITAM)',
  ORGANIZER_SHORT: 'IEEE SB HITAM',
  EVENT_DATE: '25 September 2026',
  EVENT_VENUE: 'HITAM Campus, Gowdavelly, Medchal, Hyderabad, Telangana 501401',
  SUPPORT_EMAIL: 'ieee@hitam.org',
  CONTACT_PHONE: '+91 98765 43210',

  IEEE_GROUPS: [
    'IEEE Sensors Council',
    'IEEE Robotics and Automation Society',
    'IEEE Communications Society',
    'IEEE Women in Engineering'
  ],

  // Pricing Logic:
  // Any IEEE Member -> ₹300
  // Any Non-IEEE Member -> ₹200
  FEE_IEEE_MEMBER: 300,
  FEE_NON_IEEE: 200,
  CURRENCY: 'INR',

  SHEET_NAME: 'Registrations',
  DASHBOARD_SHEET_NAME: 'Dashboard',

  REG_ID_PREFIX: 'IDEATHON-2026-',
  REG_ID_PADDING: 5,

  STATUS: {
    PENDING: 'Payment Pending',
    PAID: 'Paid',
    FAILED: 'Failed',
    AMOUNT_MISMATCH: 'Amount Mismatch',
    VERIFICATION_ERROR: 'Verification Error'
  },

  COLUMNS: {
    TIMESTAMP: 1,
    FULL_NAME: 2,
    EMAIL: 3,
    MOBILE: 4,
    COLLEGE: 5,
    COURSE: 6,
    YEAR_OF_STUDY: 7,
    PARTICIPANT_TYPE: 8,
    IEEE_STATUS: 9,
    INTERNAL_EXTERNAL: 10,
    IEEE_TRACK: 11,
    INNOVATION_DOMAIN: 12,
    IDEATHON_TITLE: 13,
    TEAM_NAME: 14,
    TEAM_SIZE: 15,
    TEAM_MEMBERS: 16,
    PROBLEM_STATEMENT: 17,
    SOLUTION_DESCRIPTION: 18,
    REGISTRATION_ID: 19,
    REGISTRATION_FEE: 20,
    PAYMENT_LINK_ID: 21,
    PAYMENT_LINK: 22,
    PAYMENT_STATUS: 23,
    PAYMENT_ID: 24,
    PAYMENT_AMOUNT: 25,
    PAYMENT_VERIFIED_AT: 26,
    CONFIRMATION_SENT: 27,
    ERROR: 28
  }
};

function getScriptConfig() {
  const properties = PropertiesService.getScriptProperties();
  const keyId = properties.getProperty('RAZORPAY_KEY_ID');
  const keySecret = properties.getProperty('RAZORPAY_KEY_SECRET');
  const webAppUrl = properties.getProperty('WEB_APP_URL');
  const webhookSecret = properties.getProperty('WEBHOOK_SECRET') || '';

  return {
    keyId: keyId ? keyId.trim() : '',
    keySecret: keySecret ? keySecret.trim() : '',
    webAppUrl: webAppUrl ? webAppUrl.trim() : '',
    webhookSecret: webhookSecret ? webhookSecret.trim() : ''
  };
}

// ==========================================
// 2. RAZORPAY API INTEGRATION SERVICE
// ==========================================

const RazorpayService = {
  _getAuthHeader() {
    const config = getScriptConfig();
    if (!config.keyId || !config.keySecret) {
      throw new Error('Razorpay API credentials missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Script Properties.');
    }
    return 'Basic ' + Utilities.base64Encode(`${config.keyId}:${config.keySecret}`);
  },

  createPaymentLink(params) {
    const config = getScriptConfig();
    const url = 'https://api.razorpay.com/v1/payment_links';
    const amountInPaise = Math.round(params.amountRupees * 100);

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
      notify: { sms: false, email: false },
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

    if (config.webAppUrl) {
      payload.callback_url = `${config.webAppUrl}?source=razorpay_redirect&reg_id=${encodeURIComponent(params.registrationId)}`;
      payload.callback_method = 'get';
    }

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: this._getAuthHeader() },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    const json = JSON.parse(response.getContentText());

    if (statusCode >= 200 && statusCode < 300) {
      return { id: json.id, shortUrl: json.short_url, status: json.status };
    } else {
      const desc = json.error ? json.error.description : response.getContentText();
      throw new Error(`Razorpay API Error (${statusCode}): ${desc}`);
    }
  },

  fetchPaymentLink(paymentLinkId) {
    const url = `https://api.razorpay.com/v1/payment_links/${paymentLinkId}`;
    const options = {
      method: 'get',
      headers: { Authorization: this._getAuthHeader() },
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

  fetchPayment(paymentId) {
    const url = `https://api.razorpay.com/v1/payments/${paymentId}`;
    const options = {
      method: 'get',
      headers: { Authorization: this._getAuthHeader() },
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

  verifyWebhookSignature(rawPayload, signature, secret) {
    if (!signature || !secret) return false;
    try {
      const signatureBytes = Utilities.computeHmacSha256Signature(rawPayload, secret);
      const computedSignature = signatureBytes.map(byte => {
        let n = (byte < 0 ? byte + 256 : byte).toString(16);
        return n.length === 1 ? '0' + n : n;
      }).join('');
      return computedSignature.toLowerCase() === signature.trim().toLowerCase();
    } catch (err) {
      return false;
    }
  }
};

// ==========================================
// 3. FORM SUBMISSION & REGISTRATION LOGIC
// ==========================================

function onFormSubmit(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    Logger.log('Lock timeout on form submit: ' + err.message);
    throw new Error('Server busy. Concurrency lock timeout.');
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) throw new Error(`Sheet "${CONFIG.SHEET_NAME}" not found`);

    let rowNumber = (e && e.range) ? e.range.getRow() : sheet.getLastRow();
    if (rowNumber <= 1) return;

    const existingRegId = sheet.getRange(rowNumber, CONFIG.COLUMNS.REGISTRATION_ID).getValue();
    if (existingRegId && existingRegId.toString().trim() !== '') return;

    const rowValues = sheet.getRange(rowNumber, 1, 1, 28).getValues()[0];

    const participantData = {
      fullName: (rowValues[CONFIG.COLUMNS.FULL_NAME - 1] || '').toString().trim(),
      email: (rowValues[CONFIG.COLUMNS.EMAIL - 1] || '').toString().trim(),
      mobile: (rowValues[CONFIG.COLUMNS.MOBILE - 1] || '').toString().trim(),
      college: (rowValues[CONFIG.COLUMNS.COLLEGE - 1] || '').toString().trim(),
      course: (rowValues[CONFIG.COLUMNS.COURSE - 1] || '').toString().trim(),
      yearOfStudy: (rowValues[CONFIG.COLUMNS.YEAR_OF_STUDY - 1] || '').toString().trim(),
      participantType: (rowValues[CONFIG.COLUMNS.PARTICIPANT_TYPE - 1] || '').toString().trim(),
      ieeeTrack: (rowValues[CONFIG.COLUMNS.IEEE_TRACK - 1] || '').toString().trim(),
      domain: (rowValues[CONFIG.COLUMNS.INNOVATION_DOMAIN - 1] || '').toString().trim(),
      title: (rowValues[CONFIG.COLUMNS.IDEATHON_TITLE - 1] || '').toString().trim(),
      teamName: (rowValues[CONFIG.COLUMNS.TEAM_NAME - 1] || '').toString().trim(),
      teamSize: (rowValues[CONFIG.COLUMNS.TEAM_SIZE - 1] || '1').toString().trim(),
      teamMembers: (rowValues[CONFIG.COLUMNS.TEAM_MEMBERS - 1] || '').toString().trim()
    };

    const categoryDetails = parseParticipantCategory(participantData.participantType);
    const fee = categoryDetails.isIeeeMember ? CONFIG.FEE_IEEE_MEMBER : CONFIG.FEE_NON_IEEE;
    const registrationId = generateNextRegistrationId(sheet);

    sheet.getRange(rowNumber, CONFIG.COLUMNS.IEEE_STATUS).setValue(categoryDetails.ieeeStatus);
    sheet.getRange(rowNumber, CONFIG.COLUMNS.INTERNAL_EXTERNAL).setValue(categoryDetails.internalExternal);
    sheet.getRange(rowNumber, CONFIG.COLUMNS.REGISTRATION_ID).setValue(registrationId);
    sheet.getRange(rowNumber, CONFIG.COLUMNS.REGISTRATION_FEE).setValue(fee);
    sheet.getRange(rowNumber, CONFIG.COLUMNS.PAYMENT_STATUS).setValue(CONFIG.STATUS.PENDING);
    sheet.getRange(rowNumber, CONFIG.COLUMNS.CONFIRMATION_SENT).setValue('No');
    SpreadsheetApp.flush();

    let paymentLinkData;
    try {
      paymentLinkData = RazorpayService.createPaymentLink({
        registrationId: registrationId,
        fullName: participantData.fullName,
        email: participantData.email,
        mobile: participantData.mobile,
        amountRupees: fee,
        participantType: participantData.participantType,
        ieeeTrack: participantData.ieeeTrack,
        domain: participantData.domain
      });

      sheet.getRange(rowNumber, CONFIG.COLUMNS.PAYMENT_LINK_ID).setValue(paymentLinkData.id);
      sheet.getRange(rowNumber, CONFIG.COLUMNS.PAYMENT_LINK).setValue(paymentLinkData.shortUrl);
      sheet.getRange(rowNumber, CONFIG.COLUMNS.ERROR).setValue('');
      SpreadsheetApp.flush();
    } catch (apiErr) {
      sheet.getRange(rowNumber, CONFIG.COLUMNS.ERROR).setValue(`Payment Link Error: ${apiErr.message}`);
      SpreadsheetApp.flush();
      return;
    }

    try {
      EmailTemplates.sendPaymentEmail({
        fullName: participantData.fullName,
        email: participantData.email,
        registrationId: registrationId,
        participantType: participantData.participantType,
        registrationFee: fee,
        paymentLinkUrl: paymentLinkData.shortUrl,
        ieeeTrack: participantData.ieeeTrack,
        domain: participantData.domain
      });
    } catch (mailErr) {
      sheet.getRange(rowNumber, CONFIG.COLUMNS.ERROR).setValue(`Email Error: ${mailErr.message}`);
    }

  } catch (err) {
    Logger.log(`onFormSubmit error: ${err.message}`);
  } finally {
    lock.releaseLock();
  }
}

function parseParticipantCategory(participantType) {
  const text = (participantType || '').toLowerCase();
  const isInternal = text.includes('hitam internal') || text.includes('internal');
  const isNonIeee = text.includes('non-ieee') || text.includes('non ieee');
  const isIeeeMember = !isNonIeee && (text.includes('ieee member') || text.includes('ieee'));

  return {
    internalExternal: isInternal ? 'HITAM Internal' : 'External',
    ieeeStatus: isIeeeMember ? 'IEEE Member' : 'Non-IEEE Member',
    isIeeeMember: isIeeeMember
  };
}

function generateNextRegistrationId(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return `${CONFIG.REG_ID_PREFIX}00001`;

  const ids = sheet.getRange(2, CONFIG.COLUMNS.REGISTRATION_ID, lastRow - 1, 1).getValues();
  let maxSeq = 0;

  for (let i = 0; i < ids.length; i++) {
    const val = ids[i][0];
    if (val && typeof val === 'string' && val.startsWith(CONFIG.REG_ID_PREFIX)) {
      const num = parseInt(val.replace(CONFIG.REG_ID_PREFIX, ''), 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    }
  }

  const nextSeq = maxSeq + 1;
  return `${CONFIG.REG_ID_PREFIX}${Utilities.formatString('%0' + CONFIG.REG_ID_PADDING + 'd', nextSeq)}`;
}

// ==========================================
// 4. WEBHOOK & REDIRECT VERIFICATION HANDLER
// ==========================================

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rawPayload = e.postData.contents;
    const body = JSON.parse(rawPayload);
    const event = body.event;

    const config = getScriptConfig();
    if (config.webhookSecret) {
      const headers = e.headers || {};
      const signature = headers['X-Razorpay-Signature'] || headers['x-razorpay-signature'];
      if (signature && !RazorpayService.verifyWebhookSignature(rawPayload, signature, config.webhookSecret)) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid signature' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    let paymentId = null;
    let paymentLinkId = null;
    let registrationId = null;

    if (event === 'payment_link.paid') {
      const plink = body.payload.payment_link.entity;
      paymentLinkId = plink.id;
      registrationId = plink.reference_id;
      if (body.payload.payment && body.payload.payment.entity) {
        paymentId = body.payload.payment.entity.id;
      }
    } else if (event === 'payment.captured') {
      const payment = body.payload.payment.entity;
      paymentId = payment.id;
      paymentLinkId = payment.order_id || (payment.notes ? payment.notes.payment_link_id : null);
      registrationId = payment.notes ? payment.notes.registration_id : null;
    } else {
      return ContentService.createTextOutput(JSON.stringify({ status: 'ignored', message: `Unhandled event: ${event}` }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const result = verifyAndUpdateRegistration({
      paymentId: paymentId,
      paymentLinkId: paymentLinkId,
      registrationId: registrationId,
      triggerSource: `Webhook: ${event}`
    });

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const regId = params.reg_id || params.razorpay_payment_link_reference_id;
    const paymentId = params.razorpay_payment_id;
    const paymentLinkId = params.razorpay_payment_link_id;
    const paymentStatus = params.razorpay_payment_link_status;

    if (!regId && !paymentId && !paymentLinkId) {
      return HtmlService.createHtmlOutput(renderStatusPortalHtml({
        title: `${CONFIG.EVENT_NAME} Portal`,
        headline: 'IEEE IDEATHON 2026',
        message: 'The registration and payment verification system is active and running.',
        isSuccess: true
      })).setTitle(`${CONFIG.EVENT_NAME} - Status`);
    }

    let verificationResult = { success: false };
    if (paymentId || paymentLinkId) {
      verificationResult = verifyAndUpdateRegistration({
        paymentId: paymentId,
        paymentLinkId: paymentLinkId,
        registrationId: regId,
        triggerSource: 'Browser Redirect'
      });
    }

    if (verificationResult.success || paymentStatus === 'paid') {
      return HtmlService.createHtmlOutput(renderStatusPortalHtml({
        title: 'Registration Confirmed',
        headline: '🎉 Registration Confirmed!',
        message: `Thank you for registering for <strong>${CONFIG.EVENT_NAME}</strong>. Your payment has been verified! A formal confirmation email has been dispatched.`,
        regId: regId || verificationResult.registrationId,
        paymentId: paymentId || verificationResult.paymentId,
        amount: verificationResult.amount ? `₹${verificationResult.amount}` : '',
        isSuccess: true
      })).setTitle('Registration Confirmed - IEEE IDEATHON 2026');
    } else {
      return HtmlService.createHtmlOutput(renderStatusPortalHtml({
        title: 'Payment Under Verification',
        headline: 'Payment Processing',
        message: 'Your payment was submitted and is being verified with Razorpay. Your status will update to Paid within 2 minutes.',
        regId: regId,
        paymentId: paymentId,
        isSuccess: false
      })).setTitle('Payment Processing - IEEE IDEATHON 2026');
    }
  } catch (err) {
    return HtmlService.createHtmlOutput(renderStatusPortalHtml({
      title: 'Verification In Progress',
      headline: 'Payment Recorded',
      message: 'Your transaction was submitted. Our background verification will update your registration shortly.',
      isSuccess: false
    }));
  }
}

function verifyAndUpdateRegistration(details) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return { success: false, message: 'Concurrency lock timeout' };
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) throw new Error(`Sheet "${CONFIG.SHEET_NAME}" not found`);

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'No records found' };

    const regIdCol = sheet.getRange(2, CONFIG.COLUMNS.REGISTRATION_ID, lastRow - 1, 1).getValues();
    const linkIdCol = sheet.getRange(2, CONFIG.COLUMNS.PAYMENT_LINK_ID, lastRow - 1, 1).getValues();
    let targetRow = -1;

    if (details.registrationId) {
      for (let i = 0; i < regIdCol.length; i++) {
        if (regIdCol[i][0] && regIdCol[i][0].toString().trim() === details.registrationId.trim()) {
          targetRow = i + 2;
          break;
        }
      }
    }

    if (targetRow === -1 && details.paymentLinkId) {
      for (let i = 0; i < linkIdCol.length; i++) {
        if (linkIdCol[i][0] && linkIdCol[i][0].toString().trim() === details.paymentLinkId.trim()) {
          targetRow = i + 2;
          break;
        }
      }
    }

    if (targetRow === -1) return { success: false, message: 'Registration row not found' };

    const rowValues = sheet.getRange(targetRow, 1, 1, 28).getValues()[0];
    const currentStatus = rowValues[CONFIG.COLUMNS.PAYMENT_STATUS - 1];
    const confirmationSent = rowValues[CONFIG.COLUMNS.CONFIRMATION_SENT - 1];
    const expectedFee = Number(rowValues[CONFIG.COLUMNS.REGISTRATION_FEE - 1]);
    const registrationId = rowValues[CONFIG.COLUMNS.REGISTRATION_ID - 1];
    const participantName = rowValues[CONFIG.COLUMNS.FULL_NAME - 1];
    const email = rowValues[CONFIG.COLUMNS.EMAIL - 1];

    if (currentStatus === CONFIG.STATUS.PAID && confirmationSent === 'Yes') {
      return { success: true, message: 'Already verified and confirmed', alreadyDone: true };
    }

    let effectivePaymentId = details.paymentId;
    if (!effectivePaymentId && details.paymentLinkId) {
      const plinkData = RazorpayService.fetchPaymentLink(details.paymentLinkId);
      if (plinkData.payments && plinkData.payments.length > 0) {
        effectivePaymentId = plinkData.payments[0].payment_id;
      }
    }

    if (!effectivePaymentId) {
      const plinkInSheet = rowValues[CONFIG.COLUMNS.PAYMENT_LINK_ID - 1];
      if (plinkInSheet) {
        const plinkData = RazorpayService.fetchPaymentLink(plinkInSheet);
        if (plinkData.payments && plinkData.payments.length > 0) {
          effectivePaymentId = plinkData.payments[0].payment_id;
        }
      }
    }

    if (!effectivePaymentId) return { success: false, message: 'Payment ID not found yet' };

    // Fetch payment entity directly from Razorpay
    const verifiedPayment = RazorpayService.fetchPayment(effectivePaymentId);
    const actualPaidRupees = verifiedPayment.amount / 100;
    const paymentStatus = verifiedPayment.status;
    const isCaptured = verifiedPayment.captured === true || paymentStatus === 'captured';
    const currency = verifiedPayment.currency;
    const nowTimestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

    if (actualPaidRupees !== expectedFee) {
      const mismatchMsg = `Amount mismatch: Expected ₹${expectedFee}, received ₹${actualPaidRupees}`;
      sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_STATUS).setValue(CONFIG.STATUS.AMOUNT_MISMATCH);
      sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_ID).setValue(effectivePaymentId);
      sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_AMOUNT).setValue(actualPaidRupees);
      sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_VERIFIED_AT).setValue(nowTimestamp);
      sheet.getRange(targetRow, CONFIG.COLUMNS.ERROR).setValue(mismatchMsg);
      SpreadsheetApp.flush();
      return { success: false, message: mismatchMsg };
    }

    if (currency !== CONFIG.CURRENCY) {
      const currMsg = `Currency mismatch: Expected ${CONFIG.CURRENCY}, got ${currency}`;
      sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_STATUS).setValue(CONFIG.STATUS.VERIFICATION_ERROR);
      sheet.getRange(targetRow, CONFIG.COLUMNS.ERROR).setValue(currMsg);
      SpreadsheetApp.flush();
      return { success: false, message: currMsg };
    }

    if (!isCaptured) {
      const statusMsg = `Payment not captured. Status: ${paymentStatus}`;
      sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_STATUS).setValue(CONFIG.STATUS.FAILED);
      sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_ID).setValue(effectivePaymentId);
      sheet.getRange(targetRow, CONFIG.COLUMNS.ERROR).setValue(statusMsg);
      SpreadsheetApp.flush();
      return { success: false, message: statusMsg };
    }

    // Success! Update row
    sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_STATUS).setValue(CONFIG.STATUS.PAID);
    sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_ID).setValue(effectivePaymentId);
    sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_AMOUNT).setValue(actualPaidRupees);
    sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_VERIFIED_AT).setValue(nowTimestamp);
    sheet.getRange(targetRow, CONFIG.COLUMNS.ERROR).setValue('');
    SpreadsheetApp.flush();

    if (confirmationSent !== 'Yes') {
      try {
        EmailTemplates.sendConfirmationEmail({
          fullName: participantName,
          email: email,
          registrationId: registrationId,
          participantType: rowValues[CONFIG.COLUMNS.PARTICIPANT_TYPE - 1],
          ieeeStatus: rowValues[CONFIG.COLUMNS.IEEE_STATUS - 1],
          internalExternal: rowValues[CONFIG.COLUMNS.INTERNAL_EXTERNAL - 1],
          ieeeTrack: rowValues[CONFIG.COLUMNS.IEEE_TRACK - 1],
          domain: rowValues[CONFIG.COLUMNS.INNOVATION_DOMAIN - 1],
          title: rowValues[CONFIG.COLUMNS.IDEATHON_TITLE - 1],
          teamName: rowValues[CONFIG.COLUMNS.TEAM_NAME - 1],
          teamSize: rowValues[CONFIG.COLUMNS.TEAM_SIZE - 1],
          teamMembers: rowValues[CONFIG.COLUMNS.TEAM_MEMBERS - 1],
          paymentId: effectivePaymentId,
          amountPaid: actualPaidRupees,
          verifiedAt: nowTimestamp
        });
        sheet.getRange(targetRow, CONFIG.COLUMNS.CONFIRMATION_SENT).setValue('Yes');
        SpreadsheetApp.flush();
      } catch (mailErr) {
        sheet.getRange(targetRow, CONFIG.COLUMNS.ERROR).setValue(`Confirmation Email Error: ${mailErr.message}`);
      }
    }

    return {
      success: true,
      message: 'Verified and marked as PAID',
      registrationId: registrationId,
      paymentId: effectivePaymentId,
      amount: actualPaidRupees
    };

  } finally {
    lock.releaseLock();
  }
}

function renderStatusPortalHtml(data) {
  const primaryColor = data.isSuccess ? '#006699' : '#e65100';
  const icon = data.isSuccess ? '✅' : '⏳';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${data.title}</title>
    <style>
      body { margin: 0; padding: 40px 16px; background: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 80vh; }
      .card { background: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 520px; width: 100%; padding: 36px 30px; text-align: center; border-top: 6px solid ${primaryColor}; }
      .icon { font-size: 50px; margin-bottom: 12px; }
      h1 { margin: 0 0 12px; font-size: 22px; color: #1a202c; }
      p { font-size: 15px; line-height: 1.6; color: #4a5568; margin: 0 0 20px; }
      .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: left; }
      .detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px dashed #edf2f7; }
      .detail-row:last-child { border-bottom: none; }
      .label { font-weight: 600; color: #718096; }
      .value { font-weight: 600; color: #2b6cb0; }
      .footer { font-size: 12px; color: #a0aec0; border-top: 1px solid #edf2f7; padding-top: 14px; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="icon">${icon}</div>
      <h1>${data.headline}</h1>
      <p>${data.message}</p>
      ${data.regId ? `
      <div class="details-box">
        <div class="detail-row"><span class="label">Registration ID:</span><span class="value">${data.regId}</span></div>
        ${data.paymentId ? `<div class="detail-row"><span class="label">Payment ID:</span><span class="value">${data.paymentId}</span></div>` : ''}
        ${data.amount ? `<div class="detail-row"><span class="label">Amount Paid:</span><span class="value">${data.amount}</span></div>` : ''}
        <div class="detail-row"><span class="label">Event Date:</span><span class="value">${CONFIG.EVENT_DATE}</span></div>
      </div>` : ''}
      <div class="footer">${CONFIG.ORGANIZER} • HITAM Campus</div>
    </div>
  </body>
  </html>
  `;
}

// ==========================================
// 5. HTML EMAIL TEMPLATES
// ==========================================

const EmailTemplates = {
  sendPaymentEmail(data) {
    const subject = `[Action Required] Complete Payment for ${CONFIG.EVENT_NAME} — Reg ID: ${data.registrationId}`;
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
            <tr><td style="background:linear-gradient(135deg,#002855 0%,#006699 100%);padding:30px 24px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:24px;">${CONFIG.EVENT_NAME}</h1>
              <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">${CONFIG.ORGANIZER}</p>
            </td></tr>
            <tr><td style="padding:30px 28px;color:#334155;line-height:1.6;">
              <div style="font-size:16px;font-weight:600;color:#0f172a;margin-bottom:16px;">Dear ${data.fullName},</div>
              <p>Thank you for submitting your registration for <strong>${CONFIG.EVENT_NAME}</strong>! To lock in your registration, please complete payment via the secure link below.</p>
              
              <div style="background:#f8fafc;border-left:4px solid #006699;padding:16px 20px;border-radius:4px;margin:20px 0;">
                <table width="100%">
                  <tr><td style="color:#64748b;font-weight:600;padding:4px 0;">Registration ID:</td><td align="right" style="font-weight:700;">${data.registrationId}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;padding:4px 0;">Category:</td><td align="right" style="font-weight:700;">${data.participantType}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;padding:4px 0;">IEEE Track:</td><td align="right" style="font-weight:700;">${data.ieeeTrack}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;padding:4px 0;">Innovation Domain:</td><td align="right" style="font-weight:700;">${data.domain}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;padding:4px 0;">Registration Fee:</td><td align="right" style="color:#006699;font-weight:800;font-size:20px;">₹${data.registrationFee}</td></tr>
                </table>
              </div>

              <div style="text-align:center;margin:30px 0;">
                <a href="${data.paymentLinkUrl}" target="_blank" style="background:#006699;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:6px;display:inline-block;box-shadow:0 4px 8px rgba(0,102,153,0.3);">Pay ₹${data.registrationFee} via Razorpay</a>
              </div>

              <p style="font-size:13px;color:#64748b;">Payments can be made securely using UPI (GPay, PhonePe, Paytm), Net Banking, or Credit/Debit Cards. Direct link: <a href="${data.paymentLinkUrl}" style="color:#006699;">${data.paymentLinkUrl}</a></p>
            </td></tr>
            <tr><td style="background:#0f172a;color:#94a3b8;padding:24px;text-align:center;font-size:12px;">
              <strong>${CONFIG.ORGANIZER}</strong><br>
              Venue: ${CONFIG.EVENT_VENUE}<br>
              Event Date: ${CONFIG.EVENT_DATE} | Queries: <a href="mailto:${CONFIG.SUPPORT_EMAIL}" style="color:#38bdf8;">${CONFIG.SUPPORT_EMAIL}</a>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    `;

    MailApp.sendEmail({ to: data.email, subject: subject, htmlBody: htmlBody });
  },

  sendConfirmationEmail(data) {
    const subject = `[Confirmed] Official Registration Pass — ${CONFIG.EVENT_NAME} (ID: ${data.registrationId})`;
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
        <tr><td align="center">
          <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08);">
            <tr><td style="background:linear-gradient(135deg,#002855 0%,#006699 100%);padding:32px 24px;text-align:center;color:#ffffff;">
              <span style="background:#10b981;color:#ffffff;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">✓ Payment Verified</span>
              <h1 style="margin:12px 0 0;font-size:26px;">${CONFIG.EVENT_NAME}</h1>
              <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">${CONFIG.ORGANIZER}</p>
            </td></tr>
            <tr><td style="padding:32px 28px;color:#334155;line-height:1.6;">
              <p style="font-size:16px;font-weight:600;color:#0f172a;margin-top:0;">Congratulations, ${data.fullName}!</p>
              <p>Your payment has been successfully verified. Your participation in <strong>${CONFIG.EVENT_NAME}</strong> on <strong>${CONFIG.EVENT_DATE}</strong> is officially confirmed.</p>

              <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:8px;padding:20px;margin:20px 0;">
                <div style="font-size:17px;font-weight:800;color:#166534;text-align:center;margin-bottom:14px;border-bottom:1px solid #bbf7d0;padding-bottom:8px;">OFFICIAL PARTICIPANT PASS</div>
                <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;">
                  <tr><td style="color:#475569;font-weight:600;width:40%;">Registration ID:</td><td style="color:#006699;font-weight:700;font-size:16px;">${data.registrationId}</td></tr>
                  <tr><td style="color:#475569;font-weight:600;">Participant Name:</td><td style="font-weight:700;">${data.fullName}</td></tr>
                  <tr><td style="color:#475569;font-weight:600;">Category:</td><td style="font-weight:700;">${data.participantType}</td></tr>
                  <tr><td style="color:#475569;font-weight:600;">IEEE Status:</td><td style="font-weight:700;">${data.ieeeStatus}</td></tr>
                  <tr><td style="color:#475569;font-weight:600;">Affiliation:</td><td style="font-weight:700;">${data.internalExternal}</td></tr>
                  <tr><td style="color:#475569;font-weight:600;">IEEE Track:</td><td style="font-weight:700;">${data.ieeeTrack}</td></tr>
                  <tr><td style="color:#475569;font-weight:600;">Innovation Domain:</td><td style="font-weight:700;">${data.domain}</td></tr>
                  ${data.teamName ? `<tr><td style="color:#475569;font-weight:600;">Team Name:</td><td style="font-weight:700;">${data.teamName} (Size: ${data.teamSize || '1'})</td></tr>` : ''}
                  ${data.teamMembers ? `<tr><td style="color:#475569;font-weight:600;">Team Members:</td><td style="font-weight:700;">${data.teamMembers}</td></tr>` : ''}
                  <tr><td style="color:#475569;font-weight:600;">Razorpay Payment ID:</td><td style="font-family:monospace;font-weight:700;">${data.paymentId}</td></tr>
                  <tr><td style="color:#475569;font-weight:600;">Amount Paid:</td><td style="color:#166534;font-weight:800;">₹${data.amountPaid} (PAID)</td></tr>
                  <tr><td style="color:#475569;font-weight:600;">Verified Timestamp:</td><td style="font-size:12px;color:#64748b;">${data.verifiedAt}</td></tr>
                </table>
              </div>

              <div style="background:#f8fafc;border-radius:8px;padding:18px;margin:20px 0;border:1px solid #e2e8f0;font-size:14px;">
                <strong style="color:#006699;">📍 Event Logistics</strong><br>
                <strong>Date:</strong> ${CONFIG.EVENT_DATE}<br>
                <strong>Venue:</strong> ${CONFIG.EVENT_VENUE}<br>
                Please present your College ID card and this confirmation pass at the registration desk on 25 September 2026.
              </div>
            </td></tr>
            <tr><td style="background:#0f172a;color:#94a3b8;padding:24px;text-align:center;font-size:12px;">
              <strong>${CONFIG.ORGANIZER}</strong><br>
              Queries: <a href="mailto:${CONFIG.SUPPORT_EMAIL}" style="color:#38bdf8;">${CONFIG.SUPPORT_EMAIL}</a>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    `;

    MailApp.sendEmail({ to: data.email, subject: subject, htmlBody: htmlBody });
  }
};

// ==========================================
// 6. SETUP, DIAGNOSTICS & RECONCILIATION
// ==========================================

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME, 0);

  const headers = [
    'Timestamp', 'Full Name', 'Email Address', 'Mobile Number', 'College / Institution',
    'Course / Degree', 'Year of Study', 'Participant Type', 'IEEE Membership Status',
    'Internal/External Status', 'IEEE Track', 'Innovation Domain', 'Ideathon Title',
    'Team Name', 'Team Size', 'Team Members', 'Problem Statement', 'Solution Description',
    'Registration ID', 'Registration Fee', 'Payment Link ID', 'Payment Link',
    'Payment Status', 'Payment ID', 'Payment Amount', 'Payment Verified At',
    'Confirmation Sent', 'Error'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#002855').setFontColor('#ffffff').setFontWeight('bold').setFontFamily('Arial').setFontSize(10);
  sheet.setFrozenRows(1);
  sheet.getRange('T:T').setNumberFormat('₹#,##0');
  sheet.getRange('Y:Y').setNumberFormat('₹#,##0');

  let dashboard = ss.getSheetByName(CONFIG.DASHBOARD_SHEET_NAME);
  if (!dashboard) dashboard = ss.insertSheet(CONFIG.DASHBOARD_SHEET_NAME, 1);
  dashboard.clear();

  dashboard.getRange('A1:D1').merge()
    .setValue(`📊 ${CONFIG.EVENT_NAME} — ORGANIZER LIVE METRICS`)
    .setBackground('#002855').setFontColor('#ffffff').setFontWeight('bold').setFontSize(14).setHorizontalAlignment('center');

  const kpis = [
    ['Metric', 'Count / Amount'],
    ['Total Registrations', `=COUNTA(${CONFIG.SHEET_NAME}!S2:S)`],
    ['Confirmed Paid Registrations', `=COUNTIF(${CONFIG.SHEET_NAME}!W2:W, "Paid")`],
    ['Pending Payments', `=COUNTIF(${CONFIG.SHEET_NAME}!W2:W, "Payment Pending")`],
    ['Amount Mismatches / Errors', `=COUNTIF(${CONFIG.SHEET_NAME}!W2:W, "Amount Mismatch") + COUNTIF(${CONFIG.SHEET_NAME}!W2:W, "Verification Error")`],
    ['Total Revenue Collected (INR)', `=SUMIF(${CONFIG.SHEET_NAME}!W2:W, "Paid", ${CONFIG.SHEET_NAME}!Y2:Y)`],
    ['', ''],
    ['Category Breakdown', 'Count (Paid)'],
    ['HITAM Internal – IEEE Member (₹300)', `=COUNTIFS(${CONFIG.SHEET_NAME}!H2:H, "*HITAM Internal – IEEE Member*", ${CONFIG.SHEET_NAME}!W2:W, "Paid")`],
    ['HITAM Internal – Non-IEEE Member (₹200)', `=COUNTIFS(${CONFIG.SHEET_NAME}!H2:H, "*HITAM Internal – Non-IEEE Member*", ${CONFIG.SHEET_NAME}!W2:W, "Paid")`],
    ['External – IEEE Member (₹300)', `=COUNTIFS(${CONFIG.SHEET_NAME}!H2:H, "*External – IEEE Member*", ${CONFIG.SHEET_NAME}!W2:W, "Paid")`],
    ['External – Non-IEEE Member (₹200)', `=COUNTIFS(${CONFIG.SHEET_NAME}!H2:H, "*External – Non-IEEE Member*", ${CONFIG.SHEET_NAME}!W2:W, "Paid")`],
    ['', ''],
    ['Affiliation Breakdown', 'Total Paid'],
    ['HITAM Internal Participants', `=COUNTIFS(${CONFIG.SHEET_NAME}!J2:J, "HITAM Internal", ${CONFIG.SHEET_NAME}!W2:W, "Paid")`],
    ['External Participants', `=COUNTIFS(${CONFIG.SHEET_NAME}!J2:J, "External", ${CONFIG.SHEET_NAME}!W2:W, "Paid")`],
    ['IEEE Members', `=COUNTIFS(${CONFIG.SHEET_NAME}!I2:I, "IEEE Member", ${CONFIG.SHEET_NAME}!W2:W, "Paid")`],
    ['Non-IEEE Members', `=COUNTIFS(${CONFIG.SHEET_NAME}!I2:I, "Non-IEEE Member", ${CONFIG.SHEET_NAME}!W2:W, "Paid")`],
    ['', ''],
    ['Track Distribution', 'Total Paid'],
    ['IEEE Sensors Council', `=COUNTIFS(${CONFIG.SHEET_NAME}!K2:K, "*Sensors*", ${CONFIG.SHEET_NAME}!W2:W, "Paid")`],
    ['IEEE Robotics and Automation Society', `=COUNTIFS(${CONFIG.SHEET_NAME}!K2:K, "*Robotics*", ${CONFIG.SHEET_NAME}!W2:W, "Paid")`],
    ['IEEE Communications Society', `=COUNTIFS(${CONFIG.SHEET_NAME}!K2:K, "*Communications*", ${CONFIG.SHEET_NAME}!W2:W, "Paid")`],
    ['IEEE Women in Engineering', `=COUNTIFS(${CONFIG.SHEET_NAME}!K2:K, "*Women*", ${CONFIG.SHEET_NAME}!W2:W, "Paid")`]
  ];

  dashboard.getRange(3, 1, kpis.length, 2).setValues(kpis);
  dashboard.getRange('A3:B3').setBackground('#006699').setFontColor('#ffffff').setFontWeight('bold');
  dashboard.getRange('A10:B10').setBackground('#006699').setFontColor('#ffffff').setFontWeight('bold');
  dashboard.getRange('A16:B16').setBackground('#006699').setFontColor('#ffffff').setFontWeight('bold');
  dashboard.getRange('A22:B22').setBackground('#006699').setFontColor('#ffffff').setFontWeight('bold');
  dashboard.getRange('B8').setNumberFormat('₹#,##0');
  dashboard.setColumnWidth(1, 350);
  dashboard.setColumnWidth(2, 180);

  Logger.log('Setup finished. "Registrations" and "Dashboard" are ready!');
}

function installTriggers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('onFormSubmit').forSpreadsheet(ss).onFormSubmit().create();
  Logger.log('Successfully installed "onFormSubmit" trigger.');
}

function testRazorpayConnection() {
  const config = getScriptConfig();
  if (!config.keyId || !config.keySecret) {
    Logger.log('❌ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in Script Properties.');
    return;
  }
  try {
    const url = 'https://api.razorpay.com/v1/payments?count=1';
    const authHeader = 'Basic ' + Utilities.base64Encode(`${config.keyId}:${config.keySecret}`);
    const response = UrlFetchApp.fetch(url, { method: 'get', headers: { Authorization: authHeader }, muteHttpExceptions: true });
    Logger.log(response.getResponseCode() === 200 ? '✅ Razorpay API connection verified!' : `❌ Status ${response.getResponseCode()}: ${response.getContentText()}`);
  } catch (e) {
    Logger.log('❌ Connection exception: ' + e.message);
  }
}

function setProjectProperties(keyId, keySecret, webAppUrl, webhookSecret) {
  const props = PropertiesService.getScriptProperties();
  if (keyId) props.setProperty('RAZORPAY_KEY_ID', keyId.trim());
  if (keySecret) props.setProperty('RAZORPAY_KEY_SECRET', keySecret.trim());
  if (webAppUrl) props.setProperty('WEB_APP_URL', webAppUrl.trim());
  if (webhookSecret) props.setProperty('WEBHOOK_SECRET', webhookSecret.trim());
  Logger.log('Script Properties updated successfully.');
}

function reconcilePendingPayments() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const data = sheet.getRange(2, 1, lastRow - 1, 28).getValues();
  let updatedCount = 0;

  for (let i = 0; i < data.length; i++) {
    const status = data[i][CONFIG.COLUMNS.PAYMENT_STATUS - 1];
    const linkId = data[i][CONFIG.COLUMNS.PAYMENT_LINK_ID - 1];
    const regId = data[i][CONFIG.COLUMNS.REGISTRATION_ID - 1];

    if (status === CONFIG.STATUS.PENDING && linkId) {
      try {
        const plinkData = RazorpayService.fetchPaymentLink(linkId);
        if (plinkData.status === 'paid' && plinkData.payments && plinkData.payments.length > 0) {
          const res = verifyAndUpdateRegistration({
            paymentId: plinkData.payments[0].payment_id,
            paymentLinkId: linkId,
            registrationId: regId,
            triggerSource: 'Manual Reconciliation'
          });
          if (res.success) updatedCount++;
        }
      } catch (err) {
        Logger.log(`Reconcile error for ${regId}: ${err.message}`);
      }
    }
  }
  Logger.log(`Reconciled ${updatedCount} payments.`);
}

function buildGoogleForm() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const form = FormApp.create(CONFIG.EVENT_NAME + ' — Official Registration');
  form.setTitle(CONFIG.EVENT_NAME + ' — Official Registration');
  form.setDescription(
    'Welcome to IEEE IDEATHON 2026 organized by the IEEE Student Branch at HITAM in collaboration with IEEE Sensors Council, IEEE Robotics and Automation Society, IEEE Communications Society, and IEEE Women in Engineering.\n\n' +
    '📅 Event Date: ' + CONFIG.EVENT_DATE + '\n' +
    '📍 Venue: ' + CONFIG.EVENT_VENUE + '\n\n' +
    '🎓 Open to students & graduates from ALL academic backgrounds (Engineering, Medical, Law, Degree, Management, Commerce, Arts & Humanities, etc.)\n\n' +
    '💰 Registration Fees:\n' +
    '• IEEE Members (Internal or External): ₹' + CONFIG.FEE_IEEE_MEMBER + '\n' +
    '• Non-IEEE Members (Internal or External): ₹' + CONFIG.FEE_NON_IEEE + '\n\n' +
    '📌 Instructions:\n' +
    '1. Fill out your participant, category, and ideathon details below.\n' +
    '2. Upon submission, an automated payment link will be emailed to you.\n' +
    '3. Pay the registration fee via UPI / Cards / NetBanking on Razorpay.\n' +
    '4. Your registration pass will be verified and emailed immediately!'
  );
  form.setAllowResponseEdits(false);
  form.setCollectEmail(true);

  // SECTION 1: Participant & Academic Information
  const nameItem = form.addTextItem();
  nameItem.setTitle('Full Name');
  nameItem.setHelpText('Enter your name as you would like it on your certificate and event pass.');
  nameItem.setRequired(true);

  const emailItem = form.addTextItem();
  emailItem.setTitle('Email Address');
  emailItem.setHelpText('Enter a valid email address. Your payment link and event pass will be sent here.');
  emailItem.setRequired(true);

  const mobileItem = form.addTextItem();
  mobileItem.setTitle('Mobile / WhatsApp Number');
  mobileItem.setHelpText('10-digit mobile number for event alerts and team coordination.');
  mobileItem.setRequired(true);

  const collegeItem = form.addTextItem();
  collegeItem.setTitle('College / Institution Name');
  collegeItem.setHelpText('If HITAM student, enter "HITAM". Otherwise, enter your full college name.');
  collegeItem.setRequired(true);

  const courseItem = form.addMultipleChoiceItem();
  courseItem.setTitle('Course / Degree');
  courseItem.setHelpText('Select your current or completed educational program. Interdisciplinary participation is highly encouraged!');
  courseItem.setChoiceValues([
    'B.Tech / Engineering',
    'Medical',
    'Law',
    'Degree',
    'Management',
    'Commerce',
    'Arts & Humanities',
    'Other'
  ]);
  courseItem.setRequired(true);

  const yearItem = form.addMultipleChoiceItem();
  yearItem.setTitle('Year of Study');
  yearItem.setChoiceValues([
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year / Final Year',
    'Graduate / Alumni'
  ]);
  yearItem.setRequired(true);

  // SECTION 2: Participant Category
  form.addPageBreakItem().setTitle('Section 2: Participant Category & Fee');

  const categoryItem = form.addMultipleChoiceItem();
  categoryItem.setTitle('Participant Type');
  categoryItem.setHelpText(
    'Select your registration category. Your fee is automatically determined based on this choice:\n' +
    '• IEEE Members (Internal or External) — ₹300\n' +
    '• Non-IEEE Members (Internal or External) — ₹200'
  );
  categoryItem.setChoiceValues([
    'HITAM Internal – IEEE Member',
    'HITAM Internal – Non-IEEE Member',
    'External – IEEE Member',
    'External – Non-IEEE Member'
  ]);
  categoryItem.setRequired(true);

  // SECTION 3: Ideathon Project Details
  form.addPageBreakItem().setTitle('Section 3: Ideathon Project Details');

  const trackItem = form.addMultipleChoiceItem();
  trackItem.setTitle('Select IEEE Track');
  trackItem.setHelpText('Select the IEEE society or council track aligned with your project.');
  trackItem.setChoiceValues(CONFIG.IEEE_GROUPS);
  trackItem.setRequired(true);

  const domainItem = form.addListItem();
  domainItem.setTitle('Innovation Domain');
  domainItem.setHelpText('Select the interdisciplinary domain that best describes your innovation.');
  domainItem.setChoiceValues([
    'Healthcare & Biomedical Innovation',
    'Smart Agriculture & Food Security',
    'Environment & Climate',
    'Smart Cities & Infrastructure',
    'Safety & Disaster Management',
    'Education & Digital Empowerment',
    'Women & Social Inclusion',
    'Accessibility & Assistive Technology',
    'Transportation & Smart Mobility',
    'Industrial & Workplace Innovation',
    'Communication & Digital Connectivity',
    'AI / IoT / Robotics / Emerging Technology'
  ]);
  domainItem.setRequired(true);

  const titleItem = form.addTextItem();
  titleItem.setTitle('Ideathon Project Title');
  titleItem.setHelpText('A clear, catchy title summarizing your project/solution.');
  titleItem.setRequired(true);

  const partTypeItem = form.addMultipleChoiceItem();
  partTypeItem.setTitle('Individual / Team Participation');
  partTypeItem.setChoiceValues(['Individual', 'Team']);
  partTypeItem.setRequired(true);

  const teamNameItem = form.addTextItem();
  teamNameItem.setTitle('Team Name');
  teamNameItem.setHelpText('Leave blank if participating individually.');
  teamNameItem.setRequired(false);

  const teamSizeItem = form.addListItem();
  teamSizeItem.setTitle('Total Team Size (including Team Lead)');
  teamSizeItem.setChoiceValues(['1', '2', '3', '4']);
  teamSizeItem.setRequired(true);

  const membersItem = form.addParagraphTextItem();
  membersItem.setTitle('Team Member Details');
  membersItem.setHelpText('If participating as a team, list other members with their Full Name, College, and Email.');
  membersItem.setRequired(false);

  const problemItem = form.addParagraphTextItem();
  problemItem.setTitle('Brief Problem Statement');
  problemItem.setHelpText('What specific problem does your idea address? (2-4 sentences)');
  problemItem.setRequired(true);

  const solutionItem = form.addParagraphTextItem();
  solutionItem.setTitle('Brief Solution Description');
  solutionItem.setHelpText('Explain your approach, technology used, or implementation plan. (3-5 sentences)');
  solutionItem.setRequired(true);

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  const editUrl = form.getEditUrl();
  const publishedUrl = form.getPublishedUrl();

  // Save the URLs directly onto Dashboard sheet
  const dashboard = ss.getSheetByName(CONFIG.DASHBOARD_SHEET_NAME);
  if (dashboard) {
    dashboard.getRange('A28:B28').setBackground('#006699').setFontColor('#ffffff').setFontWeight('bold')
      .setValues([['🔗 Google Form Links', 'Direct Access URL']]);
    dashboard.getRange('A29:B29').setValues([['Public Form (Share with Participants):', publishedUrl]]);
    dashboard.getRange('A30:B30').setValues([['Editor Form (Edit Questions & Theme):', editUrl]]);
  }

  Logger.log('====================================================');
  Logger.log('🎉 GOOGLE FORM CREATED & LINKED TO SPREADSHEET!');
  Logger.log('Form Public URL (Share with participants): ' + publishedUrl);
  Logger.log('Form Edit URL (To edit questions): ' + editUrl);
  Logger.log('====================================================');

  return {
    editUrl: editUrl,
    publishedUrl: publishedUrl
  };
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚡ IEEE Ideathon')
    .addItem('🛠️ Generate / Link Google Form', 'buildGoogleForm')
    .addItem('📊 Format Sheet & Dashboard', 'setupSheet')
    .addItem('🔌 Install Form Trigger', 'installTriggers')
    .addItem('🔄 Reconcile Pending Payments', 'reconcilePendingPayments')
    .addToUi();
}
