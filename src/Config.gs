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
