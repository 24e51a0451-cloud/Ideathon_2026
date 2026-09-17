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
