/**
 * ====================================================================
 * INNOVISION 2026 — COMPLETE ALL-IN-ONE GOOGLE APPS SCRIPT
 * Organized by: IEEE Student Branch, HITAM
 * Date: 25 September 2026
 * ====================================================================
 * This single file contains the entire backend implementation:
 * 1. Configuration & Constants (3-Section, 52-column schema)
 * 2. Razorpay API Integration Service
 * 3. Form Submission & Dynamic UPI QR Engine
 * 4. Webhook & Redirect Verification Handler (doPost / doGet)
 * 5. Responsive HTML Email Templates with Scannable QR Codes
 * 6. Setup, Trigger Installation & 3-Section Google Form Builder
 * ====================================================================
 */


/**
 * ====================================================================
 * IEEE IDEATHON 2026 — REGISTRATION & PAYMENT VERIFICATION SYSTEM
 * Organized by: IEEE Student Branch, HITAM
 * Date: 25 September 2026
 * ====================================================================
 * File: Config.gs
 * Description: Global configuration, pricing rules, event metadata,
 *              sheet column indices, and secure script property getters.
 * ====================================================================
 */

const CONFIG = {
  // Event Metadata
  EVENT_NAME: 'INNOVISION 2026',
  ORGANIZER: 'IEEE Student Branch, Hyderabad Institute of Technology and Management (HITAM)',
  ORGANIZER_SHORT: 'IEEE SB HITAM',
  EVENT_DATE: '25 September 2026',
  EVENT_VENUE: 'HITAM Campus, Gowdavelly, Medchal, Hyderabad, Telangana 501401',
  SUPPORT_EMAIL: 'ieee@hitam.org', // Replace with official student branch email
  CONTACT_PHONE: '+91 98765 43210', // Replace with organizer contact number

  // Participating IEEE Societies / Councils
  IEEE_GROUPS: [
    'IEEE Sensors Council',
    'IEEE Robotics and Automation Society',
    'IEEE Communications Society',
    'IEEE Women in Engineering'
  ],

  // Fee Logic:
  // Any IEEE Member -> ₹300
  // Any Non-IEEE Member -> ₹200
  FEE_IEEE_MEMBER: 300,
  FEE_NON_IEEE: 200,
  CURRENCY: 'INR',

  // Sheet Names
  SHEET_NAME: 'Registrations',
  DASHBOARD_SHEET_NAME: 'Dashboard',

  // Registration ID Prefix
  REG_ID_PREFIX: 'INNOVISION-2026-',
  REG_ID_PADDING: 5, // e.g. INNOVISION-2026-00001

  // Status Constants
  STATUS: {
    PENDING: 'Payment Pending',
    PAID: 'Paid',
    FAILED: 'Failed',
    AMOUNT_MISMATCH: 'Amount Mismatch',
    VERIFICATION_ERROR: 'Verification Error'
  },

  // Team Size Constraints
  MIN_TEAM_SIZE: 3,
  MAX_TEAM_SIZE: 4,

  // Google Sheet Column Mapping (1-based index, total 52 columns)
  COLUMNS: {
    // SECTION 1: Team Lead & Project Innovation
    TIMESTAMP: 1,               // Column A: Timestamp
    TEAM_NAME: 2,               // Column B: Team Name
    TEAM_SIZE: 3,               // Column C: Total Team Size (3 or 4)
    LEAD_NAME: 4,               // Column D: Lead Full Name
    LEAD_EMAIL: 5,              // Column E: Lead Email Address
    LEAD_MOBILE: 6,             // Column F: Lead Mobile Number
    LEAD_COLLEGE: 7,            // Column G: Lead College / Institution
    LEAD_COURSE: 8,             // Column H: Lead Course / Degree
    LEAD_YEAR: 9,               // Column I: Lead Year of Study
    LEAD_IEEE_MEMBER: 10,       // Column J: Lead IEEE Member? (Yes/No)
    LEAD_IEEE_NUMBER: 11,       // Column K: Lead IEEE Membership Number
    IEEE_TRACK: 12,             // Column L: Selected IEEE Track
    INNOVATION_DOMAIN: 13,      // Column M: Innovation Domain
    PROJECT_TITLE: 14,          // Column N: Innovision Project Title
    PROBLEM_STATEMENT: 15,      // Column O: Brief Problem Statement
    SOLUTION_DESCRIPTION: 16,   // Column P: Brief Solution Description

    // SECTION 2: Team Participants Details
    // Member 2
    MEMBER2_NAME: 17,           // Column Q: Member 2 Full Name
    MEMBER2_EMAIL: 18,          // Column R: Member 2 Email Address
    MEMBER2_MOBILE: 19,         // Column S: Member 2 Mobile Number
    MEMBER2_COLLEGE: 20,        // Column T: Member 2 College / Institution
    MEMBER2_COURSE: 21,         // Column U: Member 2 Course / Degree
    MEMBER2_YEAR: 22,           // Column V: Member 2 Year of Study
    MEMBER2_IEEE_MEMBER: 23,    // Column W: Member 2 IEEE Member? (Yes/No)
    MEMBER2_IEEE_NUMBER: 24,    // Column X: Member 2 IEEE Membership Number

    // Member 3
    MEMBER3_NAME: 25,           // Column Y: Member 3 Full Name
    MEMBER3_EMAIL: 26,          // Column Z: Member 3 Email Address
    MEMBER3_MOBILE: 27,         // Column AA: Member 3 Mobile Number
    MEMBER3_COLLEGE: 28,        // Column AB: Member 3 College / Institution
    MEMBER3_COURSE: 29,         // Column AC: Member 3 Course / Degree
    MEMBER3_YEAR: 30,           // Column AD: Member 3 Year of Study
    MEMBER3_IEEE_MEMBER: 31,    // Column AE: Member 3 IEEE Member? (Yes/No)
    MEMBER3_IEEE_NUMBER: 32,    // Column AF: Member 3 IEEE Membership Number

    // Member 4 (Optional)
    MEMBER4_NAME: 33,           // Column AG: Member 4 Full Name
    MEMBER4_EMAIL: 34,          // Column AH: Member 4 Email Address
    MEMBER4_MOBILE: 35,         // Column AI: Member 4 Mobile Number
    MEMBER4_COLLEGE: 36,        // Column AJ: Member 4 College / Institution
    MEMBER4_COURSE: 37,         // Column AK: Member 4 Course / Degree
    MEMBER4_YEAR: 38,           // Column AL: Member 4 Year of Study
    MEMBER4_IEEE_MEMBER: 39,    // Column AM: Member 4 IEEE Member? (Yes/No)
    MEMBER4_IEEE_NUMBER: 40,    // Column AN: Member 4 IEEE Membership Number

    // SECTION 3: Payment Acknowledgment
    PAYMENT_ACK: 41,            // Column AO: Payment Acknowledgment

    // Backend Registration & Payment Management
    REGISTRATION_ID: 42,        // Column AP: Registration ID (INNOVISION-2026-00001)
    REGISTRATION_FEE: 43,       // Column AQ: Total Team Registration Fee (₹)
    PAYMENT_LINK_ID: 44,        // Column AR: Payment Link ID (plink_xxxx)
    PAYMENT_LINK: 45,           // Column AS: Payment Link URL
    PAYMENT_QR_URL: 46,         // Column AT: Payment QR Code Image URL
    PAYMENT_STATUS: 47,         // Column AU: Payment Status
    PAYMENT_ID: 48,             // Column AV: Payment ID (pay_xxxx)
    PAYMENT_AMOUNT: 49,         // Column AW: Payment Amount (₹)
    PAYMENT_VERIFIED_AT: 50,    // Column AX: Payment Verified At
    CONFIRMATION_SENT: 51,      // Column AY: Confirmation Sent (Yes/No)
    ERROR: 52                   // Column AZ: Error Log
  }
};

/**
 * Retrieves environment properties securely from Script Properties.
 * Never hardcode API Keys or Secrets in source files!
 */
function getScriptConfig() {
  const properties = PropertiesService.getScriptProperties();
  const keyId = properties.getProperty('RAZORPAY_KEY_ID');
  const keySecret = properties.getProperty('RAZORPAY_KEY_SECRET');
  const webAppUrl = properties.getProperty('WEB_APP_URL');
  const webhookSecret = properties.getProperty('WEBHOOK_SECRET') || '';

  if (!keyId || !keySecret) {
    Logger.log('WARNING: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured in Script Properties.');
  }

  return {
    keyId: keyId ? keyId.trim() : '',
    keySecret: keySecret ? keySecret.trim() : '',
    webAppUrl: webAppUrl ? webAppUrl.trim() : '',
    webhookSecret: webhookSecret ? webhookSecret.trim() : ''
  };
}


======================================================================


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


======================================================================


/**
 * ====================================================================
 * IEEE IDEATHON 2026 — REGISTRATION & PAYMENT VERIFICATION SYSTEM
 * File: FormHandler.gs
 * Description: Processes Google Form submissions, assigns sequential IDs,
 *              computes fee based on IEEE membership, generates Razorpay
 *              Payment Links, and emails the payment instructions.
 * ====================================================================
 */

/**
 * Main Form Submission Handler.
 * Triggered automatically on form submit (Installable Trigger).
 * @param {Object} e Google Sheets / Form event object
 */
function onFormSubmit(e) {
  const lock = LockService.getScriptLock();
  
  // Wait up to 30 seconds for concurrent submissions to queue safely
  try {
    lock.waitLock(30000);
  } catch (err) {
    Logger.log('Could not obtain lock within 30s: ' + err.message);
    throw new Error('Server busy. Submission lock timeout.');
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      throw new Error(`Sheet "${CONFIG.SHEET_NAME}" not found. Please run setupSheet() first.`);
    }

    // Determine the row number of the submission
    let rowNumber;
    if (e && e.range) {
      rowNumber = e.range.getRow();
    } else {
      rowNumber = sheet.getLastRow();
    }

    // Safeguard: Ensure we are not processing the header row
    if (rowNumber <= 1) {
      Logger.log('Ignoring header row submission.');
      return;
    }

    // Check if this row has already been assigned a Registration ID
    const existingRegId = sheet.getRange(rowNumber, CONFIG.COLUMNS.REGISTRATION_ID).getValue();
    if (existingRegId && existingRegId.toString().trim() !== '') {
      Logger.log(`Row ${rowNumber} already processed with ID: ${existingRegId}`);
      return;
    }

    // Read row values (52 columns)
    const rowValues = sheet.getRange(rowNumber, 1, 1, 52).getValues()[0];

    const teamData = {
      rowNumber: rowNumber,
      timestamp: rowValues[CONFIG.COLUMNS.TIMESTAMP - 1],
      teamName: (rowValues[CONFIG.COLUMNS.TEAM_NAME - 1] || '').toString().trim(),
      teamSize: (rowValues[CONFIG.COLUMNS.TEAM_SIZE - 1] || '3').toString().trim(),
      ieeeTrack: (rowValues[CONFIG.COLUMNS.IEEE_TRACK - 1] || '').toString().trim(),
      domain: (rowValues[CONFIG.COLUMNS.INNOVATION_DOMAIN - 1] || '').toString().trim(),
      title: (rowValues[CONFIG.COLUMNS.PROJECT_TITLE - 1] || '').toString().trim(),
      problemStatement: (rowValues[CONFIG.COLUMNS.PROBLEM_STATEMENT - 1] || '').toString().trim(),
      solutionDescription: (rowValues[CONFIG.COLUMNS.SOLUTION_DESCRIPTION - 1] || '').toString().trim(),

      // Member 1 (Lead)
      lead: {
        name: (rowValues[CONFIG.COLUMNS.LEAD_NAME - 1] || '').toString().trim(),
        email: (rowValues[CONFIG.COLUMNS.LEAD_EMAIL - 1] || '').toString().trim(),
        mobile: (rowValues[CONFIG.COLUMNS.LEAD_MOBILE - 1] || '').toString().trim(),
        college: (rowValues[CONFIG.COLUMNS.LEAD_COLLEGE - 1] || '').toString().trim(),
        course: (rowValues[CONFIG.COLUMNS.LEAD_COURSE - 1] || '').toString().trim(),
        year: (rowValues[CONFIG.COLUMNS.LEAD_YEAR - 1] || '').toString().trim(),
        isIeee: isMemberIeee(rowValues[CONFIG.COLUMNS.LEAD_IEEE_MEMBER - 1]),
        ieeeNumber: (rowValues[CONFIG.COLUMNS.LEAD_IEEE_NUMBER - 1] || '').toString().trim()
      },

      // Member 2
      member2: {
        name: (rowValues[CONFIG.COLUMNS.MEMBER2_NAME - 1] || '').toString().trim(),
        email: (rowValues[CONFIG.COLUMNS.MEMBER2_EMAIL - 1] || '').toString().trim(),
        mobile: (rowValues[CONFIG.COLUMNS.MEMBER2_MOBILE - 1] || '').toString().trim(),
        college: (rowValues[CONFIG.COLUMNS.MEMBER2_COLLEGE - 1] || '').toString().trim(),
        course: (rowValues[CONFIG.COLUMNS.MEMBER2_COURSE - 1] || '').toString().trim(),
        year: (rowValues[CONFIG.COLUMNS.MEMBER2_YEAR - 1] || '').toString().trim(),
        isIeee: isMemberIeee(rowValues[CONFIG.COLUMNS.MEMBER2_IEEE_MEMBER - 1]),
        ieeeNumber: (rowValues[CONFIG.COLUMNS.MEMBER2_IEEE_NUMBER - 1] || '').toString().trim()
      },

      // Member 3
      member3: {
        name: (rowValues[CONFIG.COLUMNS.MEMBER3_NAME - 1] || '').toString().trim(),
        email: (rowValues[CONFIG.COLUMNS.MEMBER3_EMAIL - 1] || '').toString().trim(),
        mobile: (rowValues[CONFIG.COLUMNS.MEMBER3_MOBILE - 1] || '').toString().trim(),
        college: (rowValues[CONFIG.COLUMNS.MEMBER3_COLLEGE - 1] || '').toString().trim(),
        course: (rowValues[CONFIG.COLUMNS.MEMBER3_COURSE - 1] || '').toString().trim(),
        year: (rowValues[CONFIG.COLUMNS.MEMBER3_YEAR - 1] || '').toString().trim(),
        isIeee: isMemberIeee(rowValues[CONFIG.COLUMNS.MEMBER3_IEEE_MEMBER - 1]),
        ieeeNumber: (rowValues[CONFIG.COLUMNS.MEMBER3_IEEE_NUMBER - 1] || '').toString().trim()
      },

      // Member 4 (Optional)
      member4: {
        name: (rowValues[CONFIG.COLUMNS.MEMBER4_NAME - 1] || '').toString().trim(),
        email: (rowValues[CONFIG.COLUMNS.MEMBER4_EMAIL - 1] || '').toString().trim(),
        mobile: (rowValues[CONFIG.COLUMNS.MEMBER4_MOBILE - 1] || '').toString().trim(),
        college: (rowValues[CONFIG.COLUMNS.MEMBER4_COLLEGE - 1] || '').toString().trim(),
        course: (rowValues[CONFIG.COLUMNS.MEMBER4_COURSE - 1] || '').toString().trim(),
        year: (rowValues[CONFIG.COLUMNS.MEMBER4_YEAR - 1] || '').toString().trim(),
        isIeee: isMemberIeee(rowValues[CONFIG.COLUMNS.MEMBER4_IEEE_MEMBER - 1]),
        ieeeNumber: (rowValues[CONFIG.COLUMNS.MEMBER4_IEEE_NUMBER - 1] || '').toString().trim()
      }
    };

    const hasMember4 = teamData.member4.name !== '' && teamData.member4.email !== '';

    // 1. Calculate Aggregate Team Fee
    let totalFee = (teamData.lead.isIeee ? CONFIG.FEE_IEEE_MEMBER : CONFIG.FEE_NON_IEEE) +
                   (teamData.member2.isIeee ? CONFIG.FEE_IEEE_MEMBER : CONFIG.FEE_NON_IEEE) +
                   (teamData.member3.isIeee ? CONFIG.FEE_IEEE_MEMBER : CONFIG.FEE_NON_IEEE);

    if (hasMember4) {
      totalFee += (teamData.member4.isIeee ? CONFIG.FEE_IEEE_MEMBER : CONFIG.FEE_NON_IEEE);
    }

    // 2. Generate Atomic Sequential Registration ID (e.g. INNOVISION-2026-00001)
    const registrationId = generateNextRegistrationId(sheet);

    // Save initial computed data to sheet
    sheet.getRange(rowNumber, CONFIG.COLUMNS.REGISTRATION_ID).setValue(registrationId);
    sheet.getRange(rowNumber, CONFIG.COLUMNS.REGISTRATION_FEE).setValue(totalFee);
    sheet.getRange(rowNumber, CONFIG.COLUMNS.PAYMENT_STATUS).setValue(CONFIG.STATUS.PENDING);
    sheet.getRange(rowNumber, CONFIG.COLUMNS.CONFIRMATION_SENT).setValue('No');
    SpreadsheetApp.flush();

    // 3. Create Razorpay Payment Link for the entire team
    let paymentLinkData;
    let qrCodeUrl = '';
    try {
      paymentLinkData = RazorpayService.createPaymentLink({
        registrationId: registrationId,
        teamName: teamData.teamName,
        fullName: teamData.lead.name,
        email: teamData.lead.email,
        mobile: teamData.lead.mobile,
        amountRupees: totalFee,
        participantType: `Team (${teamData.teamName}) - Lead: ${teamData.lead.name}`,
        ieeeTrack: teamData.ieeeTrack,
        domain: teamData.domain
      });

      // Generate dynamic scannable QR Code image URL
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentLinkData.shortUrl)}`;

      sheet.getRange(rowNumber, CONFIG.COLUMNS.PAYMENT_LINK_ID).setValue(paymentLinkData.id);
      sheet.getRange(rowNumber, CONFIG.COLUMNS.PAYMENT_LINK).setValue(paymentLinkData.shortUrl);
      sheet.getRange(rowNumber, CONFIG.COLUMNS.PAYMENT_QR_URL).setValue(qrCodeUrl);
      sheet.getRange(rowNumber, CONFIG.COLUMNS.ERROR).setValue('');
      SpreadsheetApp.flush();
    } catch (apiErr) {
      Logger.log(`Failed to create Razorpay Payment Link for ${registrationId}: ${apiErr.message}`);
      sheet.getRange(rowNumber, CONFIG.COLUMNS.ERROR).setValue(`Payment Link Error: ${apiErr.message}`);
      SpreadsheetApp.flush();
      return;
    }

    // 4. Send Payment Request Email with Scannable QR Code to Lead & Members
    try {
      const allEmails = [teamData.lead.email, teamData.member2.email, teamData.member3.email];
      if (hasMember4) allEmails.push(teamData.member4.email);

      EmailTemplates.sendPaymentEmail({
        teamName: teamData.teamName,
        teamSize: hasMember4 ? '4 Members' : '3 Members',
        leadName: teamData.lead.name,
        leadEmail: teamData.lead.email,
        allEmails: allEmails.filter(email => email && email.includes('@')),
        registrationId: registrationId,
        totalFee: totalFee,
        paymentLinkUrl: paymentLinkData.shortUrl,
        qrCodeUrl: qrCodeUrl,
        ieeeTrack: teamData.ieeeTrack,
        domain: teamData.domain,
        members: [
          { role: 'Team Lead', name: teamData.lead.name, email: teamData.lead.email, college: teamData.lead.college, status: teamData.lead.isIeee ? `IEEE Member (${teamData.lead.ieeeNumber || 'ID Provided'})` : 'Non-IEEE Member', fee: teamData.lead.isIeee ? CONFIG.FEE_IEEE_MEMBER : CONFIG.FEE_NON_IEEE },
          { role: 'Member 2', name: teamData.member2.name, email: teamData.member2.email, college: teamData.member2.college, status: teamData.member2.isIeee ? `IEEE Member (${teamData.member2.ieeeNumber || 'ID Provided'})` : 'Non-IEEE Member', fee: teamData.member2.isIeee ? CONFIG.FEE_IEEE_MEMBER : CONFIG.FEE_NON_IEEE },
          { role: 'Member 3', name: teamData.member3.name, email: teamData.member3.email, college: teamData.member3.college, status: teamData.member3.isIeee ? `IEEE Member (${teamData.member3.ieeeNumber || 'ID Provided'})` : 'Non-IEEE Member', fee: teamData.member3.isIeee ? CONFIG.FEE_IEEE_MEMBER : CONFIG.FEE_NON_IEEE },
          ...(hasMember4 ? [{ role: 'Member 4', name: teamData.member4.name, email: teamData.member4.email, college: teamData.member4.college, status: teamData.member4.isIeee ? `IEEE Member (${teamData.member4.ieeeNumber || 'ID Provided'})` : 'Non-IEEE Member', fee: teamData.member4.isIeee ? CONFIG.FEE_IEEE_MEMBER : CONFIG.FEE_NON_IEEE }] : [])
        ]
      });
    } catch (emailErr) {
      Logger.log(`Failed to send payment email to ${teamData.lead.email}: ${emailErr.message}`);
      const currentError = sheet.getRange(rowNumber, CONFIG.COLUMNS.ERROR).getValue() || '';
      sheet.getRange(rowNumber, CONFIG.COLUMNS.ERROR).setValue(`${currentError} | Email Error: ${emailErr.message}`.trim());
    }

  } catch (err) {
    Logger.log(`Critical Error in onFormSubmit: ${err.message}\nStack: ${err.stack}`);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Determines whether a given member value indicates IEEE membership.
 * @param {string} val
 * @return {boolean}
 */
function isMemberIeee(val) {
  const text = (val || '').toString().toLowerCase();
  return text.includes('yes') || text.includes('300') || (text.includes('ieee') && !text.includes('non'));
}

/**
 * Generates the next sequential Registration ID based on existing IDs in column AP (42).
 * Guarantees zero duplicates even if rows are deleted or formatted.
 * 
 * @param {Sheet} sheet The active registrations sheet
 * @return {string} e.g. "INNOVISION-2026-00001"
 */
function generateNextRegistrationId(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return `${CONFIG.REG_ID_PREFIX}00001`;
  }

  const idRange = sheet.getRange(2, CONFIG.COLUMNS.REGISTRATION_ID, lastRow - 1, 1).getValues();
  let maxSeq = 0;

  for (let i = 0; i < idRange.length; i++) {
    const val = idRange[i][0];
    if (val && typeof val === 'string' && val.startsWith(CONFIG.REG_ID_PREFIX)) {
      const numPart = parseInt(val.replace(CONFIG.REG_ID_PREFIX, ''), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const padded = Utilities.formatString('%0' + CONFIG.REG_ID_PADDING + 'd', nextSeq);
  return `${CONFIG.REG_ID_PREFIX}${padded}`;
}


======================================================================


/**
 * ====================================================================
 * IEEE IDEATHON 2026 — REGISTRATION & PAYMENT VERIFICATION SYSTEM
 * File: WebhookHandler.gs
 * Description: Web App endpoint for Razorpay Webhooks (POST) and
 *              Redirect Callbacks (GET). Enforces server-side verification,
 *              idempotency, sheet updates, and confirmation email dispatch.
 * ====================================================================
 */

/**
 * Handles incoming POST requests (Razorpay Webhooks).
 * Configure in Razorpay Dashboard -> Settings -> Webhooks.
 * Events: payment_link.paid, payment.captured
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rawPayload = e.postData.contents;
    const body = JSON.parse(rawPayload);
    const event = body.event;

    Logger.log(`Received Webhook Event: ${event}`);

    // Optional: Webhook signature verification if secret is configured
    const config = getScriptConfig();
    if (config.webhookSecret) {
      const headers = e.headers || {};
      const signature = headers['X-Razorpay-Signature'] || headers['x-razorpay-signature'];
      if (signature) {
        const isValid = RazorpayService.verifyWebhookSignature(rawPayload, signature, config.webhookSecret);
        if (!isValid) {
          Logger.log('Invalid Webhook Signature detected!');
          return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid signature' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // Process payment_link.paid or payment.captured
    let paymentId = null;
    let paymentLinkId = null;
    let registrationId = null;

    if (event === 'payment_link.paid') {
      const plinkEntity = body.payload.payment_link.entity;
      paymentLinkId = plinkEntity.id;
      registrationId = plinkEntity.reference_id;
      
      if (body.payload.payment && body.payload.payment.entity) {
        paymentId = body.payload.payment.entity.id;
      }
    } else if (event === 'payment.captured') {
      const paymentEntity = body.payload.payment.entity;
      paymentId = paymentEntity.id;
      paymentLinkId = paymentEntity.order_id || (paymentEntity.notes ? paymentEntity.notes.payment_link_id : null);
      registrationId = paymentEntity.notes ? paymentEntity.notes.registration_id : null;
    } else {
      return ContentService.createTextOutput(JSON.stringify({ status: 'ignored', message: `Event ${event} not processed` }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Process and verify the payment
    const result = verifyAndUpdateRegistration({
      paymentId: paymentId,
      paymentLinkId: paymentLinkId,
      registrationId: registrationId,
      triggerSource: `Webhook: ${event}`
    });

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error in doPost webhook handler: ' + err.message);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles incoming GET requests (Browser Redirect Callback after payment).
 * Razorpay redirects the user's browser back to this URL upon payment completion.
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const regId = params.reg_id || params.razorpay_payment_link_reference_id;
    const paymentId = params.razorpay_payment_id;
    const paymentLinkId = params.razorpay_payment_link_id;
    const paymentStatus = params.razorpay_payment_link_status;

    // Diagnostic ping or root check
    if (!regId && !paymentId && !paymentLinkId) {
      return HtmlService.createHtmlOutput(renderStatusPortalHtml({
        title: `${CONFIG.EVENT_NAME} Registration Portal`,
        headline: 'IEEE IDEATHON 2026',
        message: 'The registration and payment verification system is active and running.',
        isSuccess: true
      })).setTitle(`${CONFIG.EVENT_NAME} - Status`);
    }

    // Perform verification in background
    let verificationResult = { success: false, message: 'Processing payment verification...' };
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
        title: 'Payment Successful & Confirmed',
        headline: '🎉 Registration Confirmed!',
        message: `Thank you for registering for <strong>${CONFIG.EVENT_NAME}</strong>! Your payment has been successfully verified. An official confirmation email with your pass details has been dispatched.`,
        regId: regId || verificationResult.registrationId,
        paymentId: paymentId || verificationResult.paymentId,
        amount: verificationResult.amount ? `₹${verificationResult.amount}` : '',
        isSuccess: true
      })).setTitle('Registration Confirmed - IEEE IDEATHON 2026');
    } else {
      return HtmlService.createHtmlOutput(renderStatusPortalHtml({
        title: 'Payment Under Processing',
        headline: 'Payment Received — Verification Pending',
        message: `Your payment was submitted and is being verified with Razorpay. If your account was debited, your registration status will automatically update to Paid within 2-5 minutes and a confirmation email will be sent.`,
        regId: regId,
        paymentId: paymentId,
        isSuccess: false
      })).setTitle('Payment Processing - IEEE IDEATHON 2026');
    }

  } catch (err) {
    Logger.log('Error in doGet handler: ' + err.message);
    return HtmlService.createHtmlOutput(renderStatusPortalHtml({
      title: 'Verification Error',
      headline: 'Verification In Progress',
      message: 'Your payment was recorded. If you see this message, our automated background task will complete the verification shortly.',
      isSuccess: false
    }));
  }
}

/**
 * Core Payment Verification Engine.
 * Verifies transaction directly with Razorpay API and updates Google Sheet safely.
 */
function verifyAndUpdateRegistration(details) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    Logger.log('Lock timeout in verifyAndUpdateRegistration: ' + err.message);
    return { success: false, message: 'Server busy. Concurrency lock timeout.' };
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      throw new Error(`Sheet "${CONFIG.SHEET_NAME}" not found`);
    }

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: false, message: 'No registration records found' };
    }

    // Locate the row in sheet
    const regIdCol = sheet.getRange(2, CONFIG.COLUMNS.REGISTRATION_ID, lastRow - 1, 1).getValues();
    const linkIdCol = sheet.getRange(2, CONFIG.COLUMNS.PAYMENT_LINK_ID, lastRow - 1, 1).getValues();
    
    let targetRow = -1;

    // Search by Registration ID
    if (details.registrationId) {
      for (let i = 0; i < regIdCol.length; i++) {
        if (regIdCol[i][0] && regIdCol[i][0].toString().trim() === details.registrationId.trim()) {
          targetRow = i + 2;
          break;
        }
      }
    }

    // Fallback: Search by Payment Link ID
    if (targetRow === -1 && details.paymentLinkId) {
      for (let i = 0; i < linkIdCol.length; i++) {
        if (linkIdCol[i][0] && linkIdCol[i][0].toString().trim() === details.paymentLinkId.trim()) {
          targetRow = i + 2;
          break;
        }
      }
    }

    if (targetRow === -1) {
      Logger.log(`Record not found for RegID: ${details.registrationId} or LinkID: ${details.paymentLinkId}`);
      return { success: false, message: 'Registration record not found in Google Sheet' };
    }

    // Read existing row data (52 columns)
    const rowValues = sheet.getRange(targetRow, 1, 1, 52).getValues()[0];
    const currentStatus = rowValues[CONFIG.COLUMNS.PAYMENT_STATUS - 1];
    const confirmationSent = rowValues[CONFIG.COLUMNS.CONFIRMATION_SENT - 1];
    const expectedFee = Number(rowValues[CONFIG.COLUMNS.REGISTRATION_FEE - 1]);
    const registrationId = rowValues[CONFIG.COLUMNS.REGISTRATION_ID - 1];
    const teamName = rowValues[CONFIG.COLUMNS.TEAM_NAME - 1] || 'Team';
    const teamSize = rowValues[CONFIG.COLUMNS.TEAM_SIZE - 1] || '3 Members';
    const leadName = rowValues[CONFIG.COLUMNS.LEAD_NAME - 1];
    const leadEmail = rowValues[CONFIG.COLUMNS.LEAD_EMAIL - 1];

    // Idempotency check: If already confirmed and marked PAID, skip duplicate
    if (currentStatus === CONFIG.STATUS.PAID && confirmationSent === 'Yes') {
      Logger.log(`Registration ${registrationId} is already marked as PAID and confirmed. Skipping duplicate.`);
      return { success: true, message: 'Already verified and confirmed', alreadyDone: true };
    }

    let effectivePaymentId = details.paymentId;

    // Retrieve from payment link entity if needed
    if (!effectivePaymentId && details.paymentLinkId) {
      const plinkData = RazorpayService.fetchPaymentLink(details.paymentLinkId);
      if (plinkData.payments && plinkData.payments.length > 0) {
        effectivePaymentId = plinkData.payments[0].payment_id;
      }
    }

    if (!effectivePaymentId) {
      const plinkIdInSheet = rowValues[CONFIG.COLUMNS.PAYMENT_LINK_ID - 1];
      if (plinkIdInSheet) {
        const plinkData = RazorpayService.fetchPaymentLink(plinkIdInSheet);
        if (plinkData.payments && plinkData.payments.length > 0) {
          effectivePaymentId = plinkData.payments[0].payment_id;
        }
      }
    }

    if (!effectivePaymentId) {
      Logger.log(`No verified payment ID discovered yet for ${registrationId}.`);
      return { success: false, message: 'Payment ID not yet found for transaction' };
    }

    // Direct Server-to-Server API verification
    const verifiedPayment = RazorpayService.fetchPayment(effectivePaymentId);

    const actualPaidRupees = verifiedPayment.amount / 100;
    const paymentStatus = verifiedPayment.status;
    const isCaptured = verifiedPayment.captured === true || paymentStatus === 'captured';
    const currency = verifiedPayment.currency;

    const nowTimestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

    // Check 1: Amount Mismatch
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

    // Check 2: Currency INR
    if (currency !== CONFIG.CURRENCY) {
      const currMsg = `Currency mismatch: Expected ${CONFIG.CURRENCY}, got ${currency}`;
      sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_STATUS).setValue(CONFIG.STATUS.VERIFICATION_ERROR);
      sheet.getRange(targetRow, CONFIG.COLUMNS.ERROR).setValue(currMsg);
      SpreadsheetApp.flush();
      return { success: false, message: currMsg };
    }

    // Check 3: Captured Status
    if (!isCaptured) {
      const statusMsg = `Payment not captured. Status: ${paymentStatus}`;
      sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_STATUS).setValue(CONFIG.STATUS.FAILED);
      sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_ID).setValue(effectivePaymentId);
      sheet.getRange(targetRow, CONFIG.COLUMNS.ERROR).setValue(statusMsg);
      SpreadsheetApp.flush();
      return { success: false, message: statusMsg };
    }

    // All checks passed! Update row to PAID
    sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_STATUS).setValue(CONFIG.STATUS.PAID);
    sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_ID).setValue(effectivePaymentId);
    sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_AMOUNT).setValue(actualPaidRupees);
    sheet.getRange(targetRow, CONFIG.COLUMNS.PAYMENT_VERIFIED_AT).setValue(nowTimestamp);
    sheet.getRange(targetRow, CONFIG.COLUMNS.ERROR).setValue('');
    SpreadsheetApp.flush();

    // Prepare team member roster and email list
    const leadIeeeStatus = (rowValues[CONFIG.COLUMNS.LEAD_IEEE_MEMBER - 1] || '').toString().toLowerCase();
    const leadIeeeNum = (rowValues[CONFIG.COLUMNS.LEAD_IEEE_NUMBER - 1] || '').toString().trim();
    const isLeadIeee = leadIeeeStatus.includes('yes') || leadIeeeStatus.includes('300') || (leadIeeeStatus.includes('ieee') && !leadIeeeStatus.includes('non'));

    const m2Name = rowValues[CONFIG.COLUMNS.MEMBER2_NAME - 1];
    const m2Email = rowValues[CONFIG.COLUMNS.MEMBER2_EMAIL - 1];
    const m2College = rowValues[CONFIG.COLUMNS.MEMBER2_COLLEGE - 1];
    const m2IeeeStatus = (rowValues[CONFIG.COLUMNS.MEMBER2_IEEE_MEMBER - 1] || '').toString().toLowerCase();
    const m2IeeeNum = (rowValues[CONFIG.COLUMNS.MEMBER2_IEEE_NUMBER - 1] || '').toString().trim();
    const isM2Ieee = m2IeeeStatus.includes('yes') || m2IeeeStatus.includes('300') || (m2IeeeStatus.includes('ieee') && !m2IeeeStatus.includes('non'));

    const m3Name = rowValues[CONFIG.COLUMNS.MEMBER3_NAME - 1];
    const m3Email = rowValues[CONFIG.COLUMNS.MEMBER3_EMAIL - 1];
    const m3College = rowValues[CONFIG.COLUMNS.MEMBER3_COLLEGE - 1];
    const m3IeeeStatus = (rowValues[CONFIG.COLUMNS.MEMBER3_IEEE_MEMBER - 1] || '').toString().toLowerCase();
    const m3IeeeNum = (rowValues[CONFIG.COLUMNS.MEMBER3_IEEE_NUMBER - 1] || '').toString().trim();
    const isM3Ieee = m3IeeeStatus.includes('yes') || m3IeeeStatus.includes('300') || (m3IeeeStatus.includes('ieee') && !m3IeeeStatus.includes('non'));

    const m4Name = rowValues[CONFIG.COLUMNS.MEMBER4_NAME - 1];
    const m4Email = rowValues[CONFIG.COLUMNS.MEMBER4_EMAIL - 1];
    const m4College = rowValues[CONFIG.COLUMNS.MEMBER4_COLLEGE - 1];
    const m4IeeeStatus = (rowValues[CONFIG.COLUMNS.MEMBER4_IEEE_MEMBER - 1] || '').toString().toLowerCase();
    const m4IeeeNum = (rowValues[CONFIG.COLUMNS.MEMBER4_IEEE_NUMBER - 1] || '').toString().trim();
    const isM4Ieee = m4IeeeStatus.includes('yes') || m4IeeeStatus.includes('300') || (m4IeeeStatus.includes('ieee') && !m4IeeeStatus.includes('non'));

    const teamMembersList = [
      {
        role: 'Team Lead',
        name: leadName,
        email: leadEmail,
        college: rowValues[CONFIG.COLUMNS.LEAD_COLLEGE - 1],
        status: isLeadIeee ? `IEEE Member (ID: ${leadIeeeNum || 'Provided'})` : 'Non-IEEE Member',
        ieeeNumber: leadIeeeNum
      },
      {
        role: 'Member 2',
        name: m2Name,
        email: m2Email,
        college: m2College,
        status: isM2Ieee ? `IEEE Member (ID: ${m2IeeeNum || 'Provided'})` : 'Non-IEEE Member',
        ieeeNumber: m2IeeeNum
      },
      {
        role: 'Member 3',
        name: m3Name,
        email: m3Email,
        college: m3College,
        status: isM3Ieee ? `IEEE Member (ID: ${m3IeeeNum || 'Provided'})` : 'Non-IEEE Member',
        ieeeNumber: m3IeeeNum
      }
    ];

    const allRecipientEmails = [leadEmail, m2Email, m3Email];
    if (m4Name && m4Email) {
      teamMembersList.push({
        role: 'Member 4',
        name: m4Name,
        email: m4Email,
        college: m4College,
        status: isM4Ieee ? `IEEE Member (ID: ${m4IeeeNum || 'Provided'})` : 'Non-IEEE Member',
        ieeeNumber: m4IeeeNum
      });
      allRecipientEmails.push(m4Email);
    }

    // Send official registration confirmation pass
    if (confirmationSent !== 'Yes') {
      try {
        EmailTemplates.sendConfirmationEmail({
          teamName: teamName,
          teamSize: teamSize,
          leadName: leadName,
          leadEmail: leadEmail,
          allEmails: allRecipientEmails.filter(em => em && em.includes('@')),
          registrationId: registrationId,
          ieeeTrack: rowValues[CONFIG.COLUMNS.IEEE_TRACK - 1],
          domain: rowValues[CONFIG.COLUMNS.INNOVATION_DOMAIN - 1],
          title: rowValues[CONFIG.COLUMNS.IDEATHON_TITLE - 1],
          problemStatement: rowValues[CONFIG.COLUMNS.PROBLEM_STATEMENT - 1],
          solutionDescription: rowValues[CONFIG.COLUMNS.SOLUTION_DESCRIPTION - 1],
          members: teamMembersList,
          paymentId: effectivePaymentId,
          amountPaid: actualPaidRupees,
          verifiedAt: nowTimestamp
        });

        sheet.getRange(targetRow, CONFIG.COLUMNS.CONFIRMATION_SENT).setValue('Yes');
        SpreadsheetApp.flush();
      } catch (mailErr) {
        Logger.log(`Failed to send confirmation email for team ${teamName}: ${mailErr.message}`);
        sheet.getRange(targetRow, CONFIG.COLUMNS.ERROR).setValue(`Confirmation Email Error: ${mailErr.message}`);
        SpreadsheetApp.flush();
      }
    }

    return {
      success: true,
      message: 'Payment successfully verified and recorded',
      registrationId: registrationId,
      teamName: teamName,
      paymentId: effectivePaymentId,
      amount: actualPaidRupees
    };

  } catch (err) {
    Logger.log('Critical error during verification: ' + err.message);
    return { success: false, message: err.message };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Renders a responsive HTML response page for browser redirects.
 */
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      body {
        margin: 0;
        padding: 40px 16px;
        background: #f4f7fa;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #2d3748;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 80vh;
      }
      .card {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        max-width: 540px;
        width: 100%;
        padding: 36px 32px;
        text-align: center;
        border-top: 6px solid ${primaryColor};
      }
      .icon {
        font-size: 52px;
        margin-bottom: 16px;
      }
      h1 {
        margin: 0 0 12px 0;
        font-size: 24px;
        color: #1a202c;
      }
      p {
        font-size: 15px;
        line-height: 1.6;
        color: #4a5568;
        margin: 0 0 24px 0;
      }
      .details-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
        text-align: left;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        font-size: 14px;
        border-bottom: 1px dashed #edf2f7;
      }
      .detail-row:last-child {
        border-bottom: none;
      }
      .label {
        font-weight: 600;
        color: #718096;
      }
      .value {
        font-weight: 600;
        color: #2b6cb0;
      }
      .footer {
        font-size: 12px;
        color: #a0aec0;
        border-top: 1px solid #edf2f7;
        padding-top: 16px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="icon">${icon}</div>
      <h1>${data.headline}</h1>
      <p>${data.message}</p>
      
      ${data.regId ? `
      <div class="details-box">
        <div class="detail-row">
          <span class="label">Registration ID:</span>
          <span class="value">${data.regId}</span>
        </div>
        ${data.paymentId ? `
        <div class="detail-row">
          <span class="label">Razorpay Payment ID:</span>
          <span class="value">${data.paymentId}</span>
        </div>` : ''}
        ${data.amount ? `
        <div class="detail-row">
          <span class="label">Amount Paid:</span>
          <span class="value">${data.amount}</span>
        </div>` : ''}
        <div class="detail-row">
          <span class="label">Event Date:</span>
          <span class="value">${CONFIG.EVENT_DATE}</span>
        </div>
      </div>` : ''}

      <div class="footer">
        ${CONFIG.ORGANIZER} • Hyderabad
      </div>
    </div>
  </body>
  </html>
  `;
}


======================================================================


/**
 * ====================================================================
 * IEEE IDEATHON 2026 — REGISTRATION & PAYMENT VERIFICATION SYSTEM
 * File: EmailTemplates.gs
 * Description: Professional, responsive IEEE-branded HTML email templates
 *              for Payment Requests and Official Verified Confirmations.
 * ====================================================================
 */

const EmailTemplates = {
  /**
   * Sends the Payment Request Email containing the Razorpay link to all team members.
   * @param {Object} data
   */
  sendPaymentEmail(data) {
    const subject = `[Action Required] Complete Team Payment for ${CONFIG.EVENT_NAME} — Reg ID: ${data.registrationId}`;
    
    let membersHtml = '';
    if (data.members && data.members.length > 0) {
      membersHtml = data.members.map(m => `
        <tr style="border-bottom: 1px dashed #e2e8f0;">
          <td style="padding: 6px 8px; font-weight: 600; color: #475569;">${m.role}:</td>
          <td style="padding: 6px 8px; font-weight: 700; color: #0f172a;">${m.name}</td>
          <td style="padding: 6px 8px; color: #64748b; font-size: 13px;">${m.college || ''}</td>
          <td style="padding: 6px 8px; font-weight: 600; color: #006699; text-align: right;">${m.status}</td>
        </tr>
      `).join('');
    }

    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 30px 0; }
        .main-table { max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #002855 0%, #006699 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 0.5px; }
        .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 30px 28px; color: #334155; line-height: 1.6; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
        .info-card { background: #f8fafc; border-left: 4px solid #006699; padding: 16px 20px; border-radius: 4px; margin: 20px 0; }
        .label { font-weight: 600; color: #64748b; }
        .value { font-weight: 700; color: #0f172a; }
        .price-highlight { font-size: 22px; color: #006699; font-weight: 800; }
        .btn-container { text-align: center; margin: 32px 0 24px; }
        .pay-btn { background: #006699; color: #ffffff !important; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 6px; display: inline-block; box-shadow: 0 4px 8px rgba(0, 102, 153, 0.3); }
        .roster-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin: 16px 0; }
        .note { font-size: 13px; color: #64748b; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 12px 16px; margin: 20px 0; }
        .footer { background-color: #0f172a; color: #94a3b8; padding: 24px; text-align: center; font-size: 12px; line-height: 1.5; }
        .footer a { color: #38bdf8; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <table class="main-table" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <h1>${CONFIG.EVENT_NAME}</h1>
              <p>${CONFIG.ORGANIZER}</p>
            </td>
          </tr>
          <tr>
            <td class="content">
              <div class="greeting">Dear ${data.leadName} & Team (${data.teamName}),</div>
              <p>Thank you for submitting your team registration for <strong>${CONFIG.EVENT_NAME}</strong>! Your team details have been recorded. Please complete the aggregate team fee payment via the secure Razorpay link below to confirm your team's participation.</p>
              
              <div class="info-card">
                <table width="100%" cellpadding="4" cellspacing="0">
                  <tr>
                    <td class="label">Registration ID:</td>
                    <td class="value" align="right">${data.registrationId}</td>
                  </tr>
                  <tr>
                    <td class="label">Team Name:</td>
                    <td class="value" align="right">${data.teamName} (${data.teamSize})</td>
                  </tr>
                  <tr>
                    <td class="label">IEEE Track:</td>
                    <td class="value" align="right">${data.ieeeTrack}</td>
                  </tr>
                  <tr>
                    <td class="label">Innovation Domain:</td>
                    <td class="value" align="right">${data.domain}</td>
                  </tr>
                  <tr>
                    <td class="label">Total Team Registration Fee:</td>
                    <td class="price-highlight" align="right">₹${data.totalFee}</td>
                  </tr>
                </table>
              </div>

              <div class="roster-box">
                <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #006699;">👥 Registered Team Roster</div>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                  ${membersHtml}
                </table>
              </div>

              ${data.qrCodeUrl ? `
              <div style="text-align: center; margin: 24px 0 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                <div style="font-weight: 700; font-size: 15px; color: #002855; margin-bottom: 6px;">📱 Instant UPI QR Code Payment</div>
                <div style="font-size: 13px; color: #64748b; margin-bottom: 14px;">Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI App:</div>
                <img src="${data.qrCodeUrl}" width="220" height="220" alt="Scan & Pay Razorpay QR" style="border: 2px solid #006699; border-radius: 10px; padding: 6px; background: #ffffff; display: inline-block;" />
                <div style="font-size: 12px; color: #64748b; margin-top: 10px; font-weight: 600;">
                  Amount: ₹${data.totalFee} • Instant Verification
                </div>
              </div>
              ` : ''}

              <div class="btn-container">
                <a href="${data.paymentLinkUrl}" target="_blank" class="pay-btn">Click to Pay ₹${data.totalFee} via Razorpay Portal</a>
              </div>

              <div class="note">
                <strong>Important Instructions:</strong>
                <ul style="margin: 6px 0 0; padding-left: 20px;">
                  <li>Payments can be made via <strong>UPI QR, GPay, PhonePe, Paytm, Net Banking, and Cards</strong>.</li>
                  <li>This single payment covers the registration fee for your entire team (${data.teamSize}).</li>
                  <li>Once payment is received and verified, official team participant passes will be automatically emailed to all registered team members.</li>
                </ul>
              </div>

              <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
                Direct payment link:<br>
                <a href="${data.paymentLinkUrl}" style="color: #006699; word-break: break-all;">${data.paymentLinkUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <strong>${CONFIG.ORGANIZER}</strong><br>
              Venue: ${CONFIG.EVENT_VENUE}<br>
              Event Date: ${CONFIG.EVENT_DATE}<br>
              Queries? Reach us at <a href="mailto:${CONFIG.SUPPORT_EMAIL}">${CONFIG.SUPPORT_EMAIL}</a>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
    `;

    const recipientEmails = data.allEmails && data.allEmails.length > 0 ? data.allEmails : [data.leadEmail];
    const toEmail = recipientEmails[0];
    const ccEmails = recipientEmails.slice(1).join(',');

    MailApp.sendEmail({
      to: toEmail,
      cc: ccEmails || undefined,
      subject: subject,
      htmlBody: htmlBody
    });
  },

  /**
   * Sends the Official Verified Team Registration Confirmation Email.
   * Dispatched ONLY after payment has been verified with Razorpay API.
   * @param {Object} data
   */
  sendConfirmationEmail(data) {
    const subject = `[Confirmed] Official Team Registration Pass — ${CONFIG.EVENT_NAME} (ID: ${data.registrationId})`;

    let membersRows = '';
    if (data.members && data.members.length > 0) {
      membersRows = data.members.map((m, idx) => `
        <tr style="border-bottom: 1px solid #bbf7d0;">
          <td style="padding: 6px 8px; font-weight: 600; color: #166534;">${m.role}:</td>
          <td style="padding: 6px 8px; font-weight: 700; color: #0f172a;">${m.name}</td>
          <td style="padding: 6px 8px; color: #475569; font-size: 13px;">${m.college || ''}</td>
          <td style="padding: 6px 8px; color: #006699; font-weight: 600; text-align: right;">${m.status}</td>
        </tr>
      `).join('');
    }

    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 30px 0; }
        .main-table { max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #002855 0%, #006699 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .badge { background: #10b981; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; display: inline-block; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .header h1 { margin: 0; font-size: 26px; }
        .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 32px 28px; color: #334155; line-height: 1.6; }
        .pass-box { background: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .pass-title { font-size: 18px; font-weight: 800; color: #166534; text-align: center; margin-bottom: 16px; border-bottom: 1px solid #bbf7d0; padding-bottom: 8px; }
        .detail-table td { padding: 6px 8px; font-size: 14px; }
        .detail-label { font-weight: 600; color: #475569; width: 38%; }
        .detail-value { font-weight: 700; color: #0f172a; }
        .event-details { background: #f8fafc; border-radius: 8px; padding: 18px; margin: 24px 0; border: 1px solid #e2e8f0; }
        .event-details h3 { margin: 0 0 10px; font-size: 15px; color: #006699; }
        .footer { background-color: #0f172a; color: #94a3b8; padding: 24px; text-align: center; font-size: 12px; line-height: 1.6; }
        .footer a { color: #38bdf8; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <table class="main-table" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <div class="badge">✓ Payment Verified</div>
              <h1>${CONFIG.EVENT_NAME}</h1>
              <p>${CONFIG.ORGANIZER}</p>
            </td>
          </tr>
          <tr>
            <td class="content">
              <p style="font-size: 16px; font-weight: 600; color: #0f172a;">Congratulations, Team ${data.teamName}!</p>
              <p>Your registration payment has been verified. Your team is officially confirmed to participate in <strong>${CONFIG.EVENT_NAME}</strong> on <strong>${CONFIG.EVENT_DATE}</strong>.</p>

              <div class="pass-box">
                <div class="pass-title">OFFICIAL TEAM PARTICIPANT PASS</div>
                <table class="detail-table" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="detail-label">Registration ID:</td>
                    <td class="detail-value" style="color: #006699; font-size: 16px;">${data.registrationId}</td>
                  </tr>
                  <tr>
                    <td class="detail-label">Team Name:</td>
                    <td class="detail-value">${data.teamName} (${data.teamSize})</td>
                  </tr>
                  <tr>
                    <td class="detail-label">IEEE Track:</td>
                    <td class="detail-value">${data.ieeeTrack}</td>
                  </tr>
                  <tr>
                    <td class="detail-label">Innovation Domain:</td>
                    <td class="detail-value">${data.domain}</td>
                  </tr>
                  <tr>
                    <td class="detail-label">Project Title:</td>
                    <td class="detail-value">${data.title}</td>
                  </tr>
                  <tr>
                    <td class="detail-label">Razorpay Payment ID:</td>
                    <td class="detail-value" style="font-family: monospace; font-size: 13px;">${data.paymentId}</td>
                  </tr>
                  <tr>
                    <td class="detail-label">Amount Paid:</td>
                    <td class="detail-value" style="color: #166534; font-size: 16px;">₹${data.amountPaid} (VERIFIED & PAID)</td>
                  </tr>
                  <tr>
                    <td class="detail-label">Verified Timestamp:</td>
                    <td class="detail-value" style="font-size: 12px; color: #64748b;">${data.verifiedAt}</td>
                  </tr>
                </table>

                <div style="margin-top: 16px; font-size: 14px; font-weight: 700; color: #166534;">Verified Team Members:</div>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 8px; font-size: 13px;">
                  ${membersRows}
                </table>
              </div>

              <div class="event-details">
                <h3>📍 Event & Venue Logistics</h3>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Date:</strong> ${CONFIG.EVENT_DATE}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Venue:</strong> ${CONFIG.EVENT_VENUE}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Host:</strong> IEEE Student Branch, HITAM</p>
                <p style="margin: 10px 0 0; font-size: 13px; color: #64748b;">
                  * All team members must carry their College/Institutional ID cards along with a digital or printed copy of this pass on the event day.
                </p>
              </div>

              <p style="font-size: 14px;">We look forward to hosting your team at HITAM Campus!</p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <strong>${CONFIG.ORGANIZER}</strong><br>
              In Collaboration with IEEE Sensors Council, RAS, ComSoc, & WIE<br>
              Support: <a href="mailto:${CONFIG.SUPPORT_EMAIL}">${CONFIG.SUPPORT_EMAIL}</a>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
    `;

    const recipientEmails = data.allEmails && data.allEmails.length > 0 ? data.allEmails : [data.leadEmail];
    const toEmail = recipientEmails[0];
    const ccEmails = recipientEmails.slice(1).join(',');

    MailApp.sendEmail({
      to: toEmail,
      cc: ccEmails || undefined,
      subject: subject,
      htmlBody: htmlBody
    });
  }
};


======================================================================


/**
 * ====================================================================
 * IEEE IDEATHON 2026 — REGISTRATION & PAYMENT VERIFICATION SYSTEM
 * File: Setup.gs
 * Description: One-click sheet initialization, trigger installation,
 *              API diagnostics, automated Google Form builder, and
 *              payment reconciliation.
 * ====================================================================
 */

/**
 * Run this function once from the Apps Script editor to initialize
 * the Google Sheet headers, styling, and create the Live Dashboard.
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup 'Registrations' Sheet
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME, 0);
  }

  const headers = [
    // Section 1: Team Information, Lead Details & Innovation Domain
    'Timestamp',
    'Team Name',
    'Total Team Size',
    'Lead Full Name',
    'Lead Email Address',
    'Lead Mobile Number',
    'Lead College / Institution',
    'Lead Course / Degree',
    'Lead Year of Study',
    'Lead IEEE Member?',
    'Lead IEEE Membership Number',
    'Selected IEEE Track',
    'Innovation Domain',
    'Innovision Project Title',
    'Brief Problem Statement',
    'Brief Solution Description',

    // Section 2: Team Participants Details (Member 2, 3, 4)
    'Member 2 Full Name',
    'Member 2 Email Address',
    'Member 2 Mobile Number',
    'Member 2 College / Institution',
    'Member 2 Course / Degree',
    'Member 2 Year of Study',
    'Member 2 IEEE Member?',
    'Member 2 IEEE Membership Number',

    'Member 3 Full Name',
    'Member 3 Email Address',
    'Member 3 Mobile Number',
    'Member 3 College / Institution',
    'Member 3 Course / Degree',
    'Member 3 Year of Study',
    'Member 3 IEEE Member?',
    'Member 3 IEEE Membership Number',

    'Member 4 Full Name',
    'Member 4 Email Address',
    'Member 4 Mobile Number',
    'Member 4 College / Institution',
    'Member 4 Course / Degree',
    'Member 4 Year of Study',
    'Member 4 IEEE Member?',
    'Member 4 IEEE Membership Number',

    // Section 3: Payment Acknowledgment & Backend Management
    'Payment Acknowledgment',
    'Registration ID',
    'Total Team Registration Fee',
    'Payment Link ID',
    'Payment Link URL',
    'Payment QR Code URL',
    'Payment Status',
    'Payment ID',
    'Payment Amount',
    'Payment Verified At',
    'Confirmation Sent',
    'Error'
  ];

  // Write headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Styling headers: IEEE Navy Blue background, white bold text
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#002855');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontFamily('Arial');
  headerRange.setFontSize(10);
  headerRange.setWrap(false);
  sheet.setFrozenRows(1);

  // Set number formats
  sheet.getRange('AQ:AQ').setNumberFormat('₹#,##0'); // Registration Fee (Col 43)
  sheet.getRange('AW:AW').setNumberFormat('₹#,##0'); // Payment Amount (Col 49)

  // 2. Setup 'Dashboard' Sheet for Real-Time Event Metrics
  let dashboard = ss.getSheetByName(CONFIG.DASHBOARD_SHEET_NAME);
  if (!dashboard) {
    dashboard = ss.insertSheet(CONFIG.DASHBOARD_SHEET_NAME, 1);
  }
  dashboard.clear();

  // Dashboard Title
  dashboard.getRange('A1:D1').merge()
    .setValue(`📊 ${CONFIG.EVENT_NAME} — TEAM REGISTRATION & METRICS`)
    .setBackground('#002855')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(14)
    .setHorizontalAlignment('center');

  // Key KPI Cards
  const kpis = [
    ['Metric', 'Count / Formula'],
    ['Total Registered Teams', `=COUNTA(${CONFIG.SHEET_NAME}!AP2:AP)`],
    ['Confirmed Paid Teams', `=COUNTIF(${CONFIG.SHEET_NAME}!AU2:AU, "Paid")`],
    ['Pending Payment Teams', `=COUNTIF(${CONFIG.SHEET_NAME}!AU2:AU, "Payment Pending")`],
    ['Payment Mismatches / Errors', `=COUNTIF(${CONFIG.SHEET_NAME}!AU2:AU, "Amount Mismatch") + COUNTIF(${CONFIG.SHEET_NAME}!AU2:AU, "Verification Error")`],
    ['Total Revenue Collected (INR)', `=SUMIF(${CONFIG.SHEET_NAME}!AU2:AU, "Paid", ${CONFIG.SHEET_NAME}!AW2:AW)`],
    ['', ''],
    ['Team Size Breakdown', 'Paid Teams'],
    ['3-Member Teams', `=COUNTIFS(${CONFIG.SHEET_NAME}!C2:C, "*3*", ${CONFIG.SHEET_NAME}!AU2:AU, "Paid")`],
    ['4-Member Teams', `=COUNTIFS(${CONFIG.SHEET_NAME}!C2:C, "*4*", ${CONFIG.SHEET_NAME}!AU2:AU, "Paid")`],
    ['', ''],
    ['Track Distribution', 'Total Paid Teams'],
    ['IEEE Sensors Council', `=COUNTIFS(${CONFIG.SHEET_NAME}!L2:L, "*Sensors*", ${CONFIG.SHEET_NAME}!AU2:AU, "Paid")`],
    ['IEEE Robotics and Automation Society', `=COUNTIFS(${CONFIG.SHEET_NAME}!L2:L, "*Robotics*", ${CONFIG.SHEET_NAME}!AU2:AU, "Paid")`],
    ['IEEE Communications Society', `=COUNTIFS(${CONFIG.SHEET_NAME}!L2:L, "*Communications*", ${CONFIG.SHEET_NAME}!AU2:AU, "Paid")`],
    ['IEEE Women in Engineering', `=COUNTIFS(${CONFIG.SHEET_NAME}!L2:L, "*Women*", ${CONFIG.SHEET_NAME}!AU2:AU, "Paid")`]
  ];

  dashboard.getRange(3, 1, kpis.length, 2).setValues(kpis);
  
  // Style Dashboard table headers
  dashboard.getRange('A3:B3').setBackground('#006699').setFontColor('#ffffff').setFontWeight('bold');
  dashboard.getRange('A10:B10').setBackground('#006699').setFontColor('#ffffff').setFontWeight('bold');
  dashboard.getRange('A14:B14').setBackground('#006699').setFontColor('#ffffff').setFontWeight('bold');
  dashboard.getRange('B8').setNumberFormat('₹#,##0'); // Total Revenue Currency format
  
  dashboard.setColumnWidth(1, 350);
  dashboard.setColumnWidth(2, 200);

  Logger.log('Setup completed successfully! Sheets "Registrations" and "Dashboard" are ready.');
}

/**
 * Automatically creates the onFormSubmit installable trigger programmatically.
 * Run this function once after pasting your code.
 */
function installTriggers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Delete existing triggers for onFormSubmit to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Create new installable trigger
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  Logger.log('Successfully installed "onFormSubmit" trigger.');
}

/**
 * Verifies the Razorpay API connection.
 */
function testRazorpayConnection() {
  const config = getScriptConfig();
  if (!config.keyId || !config.keySecret) {
    Logger.log('❌ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in Script Properties.');
    return;
  }

  try {
    const url = 'https://api.razorpay.com/v1/payments?count=1';
    const authHeader = 'Basic ' + Utilities.base64Encode(`${config.keyId}:${config.keySecret}`);
    const options = {
      method: 'get',
      headers: { Authorization: authHeader },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      Logger.log('✅ Razorpay API connection verified successfully!');
    } else {
      Logger.log(`❌ Razorpay API returned status ${response.getResponseCode()}: ${response.getContentText()}`);
    }
  } catch (e) {
    Logger.log('❌ Connection exception: ' + e.message);
  }
}

/**
 * Reconciles any unverified pending payments against Razorpay.
 */
function reconcilePendingPayments() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const data = sheet.getRange(2, 1, lastRow - 1, 52).getValues();
  let updatedCount = 0;

  for (let i = 0; i < data.length; i++) {
    const status = data[i][CONFIG.COLUMNS.PAYMENT_STATUS - 1];
    const linkId = data[i][CONFIG.COLUMNS.PAYMENT_LINK_ID - 1];
    const regId = data[i][CONFIG.COLUMNS.REGISTRATION_ID - 1];

    if (status === CONFIG.STATUS.PENDING && linkId) {
      try {
        const plinkData = RazorpayService.fetchPaymentLink(linkId);
        if (plinkData.status === 'paid' && plinkData.payments && plinkData.payments.length > 0) {
          const result = verifyAndUpdateRegistration({
            paymentId: plinkData.payments[0].payment_id,
            paymentLinkId: linkId,
            registrationId: regId,
            triggerSource: 'Manual Reconciliation'
          });

          if (result.success) {
            updatedCount++;
          }
        }
      } catch (err) {
        Logger.log(`Reconciliation check failed for ${regId}: ${err.message}`);
      }
    }
  }

  Logger.log(`Reconciliation completed. ${updatedCount} registrations updated to PAID.`);
}

/**
 * Builds the complete 3-Section team-based Google Form (3 or 4 members)
 * and links it directly to this Google Spreadsheet.
 */
function buildGoogleForm() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create the Form
  const form = FormApp.create(CONFIG.EVENT_NAME + ' — Official Team Registration');
  form.setTitle(CONFIG.EVENT_NAME + ' — Official Team Registration');
  form.setDescription(
    'Welcome to IEEE IDEATHON 2026 organized by the IEEE Student Branch at HITAM in collaboration with IEEE Sensors Council, IEEE Robotics and Automation Society, IEEE Communications Society, and IEEE Women in Engineering.\n\n' +
    '📅 Event Date: ' + CONFIG.EVENT_DATE + '\n' +
    '📍 Venue: ' + CONFIG.EVENT_VENUE + '\n\n' +
    '👥 Team Participation: Mandatory 3 or 4 members per team.\n' +
    '🎓 Open to students & graduates from ALL academic backgrounds.\n\n' +
    '💰 Registration Fee (Per Participant):\n' +
    '• IEEE Member: ₹' + CONFIG.FEE_IEEE_MEMBER + '\n' +
    '• Non-IEEE Member: ₹' + CONFIG.FEE_NON_IEEE + '\n' +
    '(Total team fee is calculated dynamically based on each member’s IEEE status)\n\n' +
    '📌 Form Structure (3 Sections):\n' +
    '• Section 1: Team Info, Innovation Domain & Team Lead Details\n' +
    '• Section 2: Team Participants Details (Members 2, 3, & optional 4)\n' +
    '• Section 3: Razorpay Dynamic Payment & Instant UPI QR Instructions'
  );
  form.setAllowResponseEdits(false);
  form.setCollectEmail(true);

  const courses = ['B.Tech / Engineering', 'Medical', 'Law', 'Degree', 'Management', 'Commerce', 'Arts & Humanities', 'Other'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year / Final Year', 'Graduate / Alumni'];

  // ==========================================
  // SECTION 1: Team Info, Domain & Team Lead
  // ==========================================
  const teamNameItem = form.addTextItem();
  teamNameItem.setTitle('Team Name');
  teamNameItem.setHelpText('Enter your unique team or startup name.');
  teamNameItem.setRequired(true);

  const teamSizeItem = form.addMultipleChoiceItem();
  teamSizeItem.setTitle('Total Team Size');
  teamSizeItem.setHelpText('Select whether your team has 3 or 4 participating members.');
  teamSizeItem.setChoiceValues(['3 Members', '4 Members']);
  teamSizeItem.setRequired(true);

  const leadNameItem = form.addTextItem();
  leadNameItem.setTitle('Team Lead (Member 1) — Full Name');
  leadNameItem.setRequired(true);

  const leadEmailItem = form.addTextItem();
  leadEmailItem.setTitle('Team Lead (Member 1) — Email Address');
  leadEmailItem.setHelpText('Primary payment link & communications will be sent to this address.');
  leadEmailItem.setRequired(true);

  const leadMobileItem = form.addTextItem();
  leadMobileItem.setTitle('Team Lead (Member 1) — Mobile / WhatsApp Number');
  leadMobileItem.setRequired(true);

  const leadCollegeItem = form.addTextItem();
  leadCollegeItem.setTitle('Team Lead (Member 1) — College / Institution Name');
  leadCollegeItem.setHelpText('Enter "HITAM" if internal student, or full college name.');
  leadCollegeItem.setRequired(true);

  const leadCourseItem = form.addMultipleChoiceItem();
  leadCourseItem.setTitle('Team Lead (Member 1) — Course / Degree');
  leadCourseItem.setChoiceValues(courses);
  leadCourseItem.setRequired(true);

  const leadYearItem = form.addMultipleChoiceItem();
  leadYearItem.setTitle('Team Lead (Member 1) — Year of Study');
  leadYearItem.setChoiceValues(years);
  leadYearItem.setRequired(true);

  const leadIeeeItem = form.addMultipleChoiceItem();
  leadIeeeItem.setTitle('Team Lead (Member 1) — Are you an IEEE Member?');
  leadIeeeItem.setHelpText('IEEE Member: ₹300 | Non-IEEE Member: ₹200');
  leadIeeeItem.setChoiceValues(['Yes (IEEE Member — ₹300)', 'No (Non-IEEE Member — ₹200)']);
  leadIeeeItem.setRequired(true);

  const leadIeeeNumItem = form.addTextItem();
  leadIeeeNumItem.setTitle('Team Lead (Member 1) — IEEE Membership Number');
  leadIeeeNumItem.setHelpText('If IEEE member, enter your 8-digit IEEE membership number. Otherwise, enter "NA".');
  leadIeeeNumItem.setRequired(true);

  const trackItem = form.addMultipleChoiceItem();
  trackItem.setTitle('Select IEEE Track');
  trackItem.setHelpText('Select the IEEE society or council track aligned with your project.');
  trackItem.setChoiceValues(CONFIG.IEEE_GROUPS);
  trackItem.setRequired(true);

  const domainItem = form.addListItem();
  domainItem.setTitle('Innovation Domain');
  domainItem.setHelpText('Select the domain that best describes your project.');
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
  titleItem.setTitle('Innovision Project Title');
  titleItem.setHelpText('A clear, catchy title summarizing your innovative idea.');
  titleItem.setRequired(true);

  const problemItem = form.addParagraphTextItem();
  problemItem.setTitle('Brief Problem Statement');
  problemItem.setHelpText('What specific problem does your innovation address? (2-4 sentences)');
  problemItem.setRequired(true);

  const solutionItem = form.addParagraphTextItem();
  solutionItem.setTitle('Brief Solution Description');
  solutionItem.setHelpText('Explain your approach, technology stack, and implementation plan. (3-5 sentences)');
  solutionItem.setRequired(true);

  // ==========================================
  // SECTION 2: Team Participants Details
  // ==========================================
  form.addPageBreakItem()
    .setTitle('Section 2: Team Participants Details')
    .setHelpText('Please provide complete details for Team Member 2, Team Member 3, and optionally Team Member 4.');

  // Member 2
  const m2Name = form.addTextItem();
  m2Name.setTitle('Member 2 — Full Name');
  m2Name.setRequired(true);

  const m2Email = form.addTextItem();
  m2Email.setTitle('Member 2 — Email Address');
  m2Email.setHelpText('Pass & updates will also be emailed to Member 2.');
  m2Email.setRequired(true);

  const m2Mobile = form.addTextItem();
  m2Mobile.setTitle('Member 2 — Mobile / WhatsApp Number');
  m2Mobile.setRequired(true);

  const m2College = form.addTextItem();
  m2College.setTitle('Member 2 — College / Institution Name');
  m2College.setRequired(true);

  const m2Course = form.addMultipleChoiceItem();
  m2Course.setTitle('Member 2 — Course / Degree');
  m2Course.setChoiceValues(courses);
  m2Course.setRequired(true);

  const m2Year = form.addMultipleChoiceItem();
  m2Year.setTitle('Member 2 — Year of Study');
  m2Year.setChoiceValues(years);
  m2Year.setRequired(true);

  const m2Ieee = form.addMultipleChoiceItem();
  m2Ieee.setTitle('Member 2 — Are you an IEEE Member?');
  m2Ieee.setHelpText('IEEE Member: ₹300 | Non-IEEE Member: ₹200');
  m2Ieee.setChoiceValues(['Yes (IEEE Member — ₹300)', 'No (Non-IEEE Member — ₹200)']);
  m2Ieee.setRequired(true);

  const m2IeeeNum = form.addTextItem();
  m2IeeeNum.setTitle('Member 2 — IEEE Membership Number');
  m2IeeeNum.setHelpText('If IEEE member, enter 8-digit number. Otherwise, enter "NA".');
  m2IeeeNum.setRequired(true);

  // Member 3
  const m3Name = form.addTextItem();
  m3Name.setTitle('Member 3 — Full Name');
  m3Name.setRequired(true);

  const m3Email = form.addTextItem();
  m3Email.setTitle('Member 3 — Email Address');
  m3Email.setHelpText('Pass & updates will also be emailed to Member 3.');
  m3Email.setRequired(true);

  const m3Mobile = form.addTextItem();
  m3Mobile.setTitle('Member 3 — Mobile / WhatsApp Number');
  m3Mobile.setRequired(true);

  const m3College = form.addTextItem();
  m3College.setTitle('Member 3 — College / Institution Name');
  m3College.setRequired(true);

  const m3Course = form.addMultipleChoiceItem();
  m3Course.setTitle('Member 3 — Course / Degree');
  m3Course.setChoiceValues(courses);
  m3Course.setRequired(true);

  const m3Year = form.addMultipleChoiceItem();
  m3Year.setTitle('Member 3 — Year of Study');
  m3Year.setChoiceValues(years);
  m3Year.setRequired(true);

  const m3Ieee = form.addMultipleChoiceItem();
  m3Ieee.setTitle('Member 3 — Are you an IEEE Member?');
  m3Ieee.setHelpText('IEEE Member: ₹300 | Non-IEEE Member: ₹200');
  m3Ieee.setChoiceValues(['Yes (IEEE Member — ₹300)', 'No (Non-IEEE Member — ₹200)']);
  m3Ieee.setRequired(true);

  const m3IeeeNum = form.addTextItem();
  m3IeeeNum.setTitle('Member 3 — IEEE Membership Number');
  m3IeeeNum.setHelpText('If IEEE member, enter 8-digit number. Otherwise, enter "NA".');
  m3IeeeNum.setRequired(true);

  // Member 4 (Optional)
  const m4Name = form.addTextItem();
  m4Name.setTitle('Member 4 — Full Name (Leave blank if 3-member team)');
  m4Name.setRequired(false);

  const m4Email = form.addTextItem();
  m4Email.setTitle('Member 4 — Email Address (Optional)');
  m4Email.setRequired(false);

  const m4Mobile = form.addTextItem();
  m4Mobile.setTitle('Member 4 — Mobile / WhatsApp Number (Optional)');
  m4Mobile.setRequired(false);

  const m4College = form.addTextItem();
  m4College.setTitle('Member 4 — College / Institution Name (Optional)');
  m4College.setRequired(false);

  const m4Course = form.addMultipleChoiceItem();
  m4Course.setTitle('Member 4 — Course / Degree (Optional)');
  m4Course.setChoiceValues(courses);
  m4Course.setRequired(false);

  const m4Year = form.addMultipleChoiceItem();
  m4Year.setTitle('Member 4 — Year of Study (Optional)');
  m4Year.setChoiceValues(years);
  m4Year.setRequired(false);

  const m4Ieee = form.addMultipleChoiceItem();
  m4Ieee.setTitle('Member 4 — Are you an IEEE Member? (Optional)');
  m4Ieee.setHelpText('IEEE Member: ₹300 | Non-IEEE Member: ₹200');
  m4Ieee.setChoiceValues(['Yes (IEEE Member — ₹300)', 'No (Non-IEEE Member — ₹200)', 'NA (3-Member Team)']);
  m4Ieee.setRequired(false);

  const m4IeeeNum = form.addTextItem();
  m4IeeeNum.setTitle('Member 4 — IEEE Membership Number (Optional)');
  m4IeeeNum.setHelpText('Enter 8-digit number if IEEE member, else "NA".');
  m4IeeeNum.setRequired(false);

  // ==========================================
  // SECTION 3: Razorpay Payment & Dynamic QR
  // ==========================================
  form.addPageBreakItem()
    .setTitle('Section 3: Razorpay Payment & Dynamic UPI QR Method')
    .setHelpText(
      '💳 PAYMENT INSTRUCTIONS:\n\n' +
      '1. Per-Participant Fee: ₹300 for IEEE Members | ₹200 for Non-IEEE Members.\n' +
      '2. Upon clicking "Submit", our automated system instantly calculates your aggregate team fee and generates a secure Razorpay Payment Link with a dynamic UPI QR Code.\n' +
      '3. The payment link & QR code will be dispatched to all team member emails immediately.\n' +
      '4. You can scan the QR Code using Google Pay, PhonePe, Paytm, BHIM, or use Net Banking & Cards.\n' +
      '5. Once verified, official Verified Participant Passes will be emailed to all team members.'
    );

  const ackItem = form.addCheckboxItem();
  ackItem.setTitle('Payment & Registration Confirmation Acknowledgment');
  ackItem.setChoiceValues([
    'I agree to pay the calculated team fee via the automated Razorpay Payment Link / dynamic UPI QR Code dispatched to our emails upon submission.'
  ]);
  ackItem.setRequired(true);

  // Set destination to this Spreadsheet
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  const editUrl = form.getEditUrl();
  const publishedUrl = form.getPublishedUrl();

  // Save URLs directly into Dashboard sheet
  const dashboard = ss.getSheetByName(CONFIG.DASHBOARD_SHEET_NAME);
  if (dashboard) {
    dashboard.getRange('A19:B19').setBackground('#006699').setFontColor('#ffffff').setFontWeight('bold')
      .setValues([['🔗 Google Form Links', 'Direct Access URL']]);
    dashboard.getRange('A20:B20').setValues([['Public Team Form (Share with Participants):', publishedUrl]]);
    dashboard.getRange('A21:B21').setValues([['Editor Form (Edit Questions & Theme):', editUrl]]);
  }

  Logger.log('====================================================');
  Logger.log('🎉 3-SECTION TEAM GOOGLE FORM CREATED & LINKED!');
  Logger.log('Form Public URL: ' + publishedUrl);
  Logger.log('Form Edit URL: ' + editUrl);
  Logger.log('====================================================');

  return {
    editUrl: editUrl,
    publishedUrl: publishedUrl
  };
}

/**
 * Adds a custom menu to Google Sheets upon opening.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚡ INNOVISION 2026')
    .addItem('🛠️ Generate / Link Team Google Form', 'buildGoogleForm')
    .addItem('📊 Format Sheet & Dashboard', 'setupSheet')
    .addItem('🔌 Install Form Trigger', 'installTriggers')
    .addItem('🔄 Reconcile Pending Payments', 'reconcilePendingPayments')
    .addItem('🔑 Test Razorpay Connection', 'testRazorpayConnection')
    .addToUi();
}


======================================================================

