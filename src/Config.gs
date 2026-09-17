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
  EVENT_NAME: 'IEEE IDEATHON 2026',
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
  REG_ID_PREFIX: 'IDEATHON-2026-',
  REG_ID_PADDING: 5, // e.g. IDEATHON-2026-00001

  // Status Constants
  STATUS: {
    PENDING: 'Payment Pending',
    PAID: 'Paid',
    FAILED: 'Failed',
    AMOUNT_MISMATCH: 'Amount Mismatch',
    VERIFICATION_ERROR: 'Verification Error'
  },

  // Google Sheet Column Mapping (1-based index)
  COLUMNS: {
    TIMESTAMP: 1,               // Column A: Timestamp
    FULL_NAME: 2,               // Column B: Full Name
    EMAIL: 3,                   // Column C: Email Address
    MOBILE: 4,                  // Column D: Mobile Number
    COLLEGE: 5,                 // Column E: College / Institution
    COURSE: 6,                  // Column F: Course / Degree
    YEAR_OF_STUDY: 7,           // Column G: Year of Study
    PARTICIPANT_TYPE: 8,        // Column H: Participant Type (Selected Option)
    IEEE_STATUS: 9,             // Column I: IEEE Membership Status (IEEE Member / Non-IEEE Member)
    INTERNAL_EXTERNAL: 10,      // Column J: Internal/External Status (HITAM Internal / External)
    IEEE_TRACK: 11,             // Column K: IEEE Track
    INNOVATION_DOMAIN: 12,      // Column L: Innovation Domain
    IDEATHON_TITLE: 13,         // Column M: Ideathon Title
    TEAM_NAME: 14,              // Column N: Team Name
    TEAM_SIZE: 15,              // Column O: Team Size
    TEAM_MEMBERS: 16,           // Column P: Team Members
    PROBLEM_STATEMENT: 17,      // Column Q: Problem Statement
    SOLUTION_DESCRIPTION: 18,  // Column R: Solution Description
    REGISTRATION_ID: 19,        // Column S: Registration ID (IDEATHON-2026-00001)
    REGISTRATION_FEE: 20,       // Column T: Registration Fee (₹)
    PAYMENT_LINK_ID: 21,        // Column U: Payment Link ID (plink_xxxx)
    PAYMENT_LINK: 22,           // Column V: Payment Link URL
    PAYMENT_STATUS: 23,         // Column W: Payment Status
    PAYMENT_ID: 24,             // Column X: Payment ID (pay_xxxx)
    PAYMENT_AMOUNT: 25,         // Column Y: Payment Amount (₹)
    PAYMENT_VERIFIED_AT: 26,    // Column Z: Payment Verified At
    CONFIRMATION_SENT: 27,      // Column AA: Confirmation Sent (Yes/No)
    ERROR: 28                   // Column AB: Error Log
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
