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
    'Timestamp',
    'Full Name',
    'Email Address',
    'Mobile Number',
    'College / Institution',
    'Course / Degree',
    'Year of Study',
    'Participant Type',
    'IEEE Membership Status',
    'Internal/External Status',
    'IEEE Track',
    'Innovation Domain',
    'Ideathon Title',
    'Team Name',
    'Team Size',
    'Team Members',
    'Problem Statement',
    'Solution Description',
    'Registration ID',
    'Registration Fee',
    'Payment Link ID',
    'Payment Link',
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
  sheet.getRange('T:T').setNumberFormat('₹#,##0'); // Registration Fee
  sheet.getRange('Y:Y').setNumberFormat('₹#,##0'); // Payment Amount

  // 2. Setup 'Dashboard' Sheet for Real-Time Event Metrics
  let dashboard = ss.getSheetByName(CONFIG.DASHBOARD_SHEET_NAME);
  if (!dashboard) {
    dashboard = ss.insertSheet(CONFIG.DASHBOARD_SHEET_NAME, 1);
  }
  dashboard.clear();

  // Dashboard Title
  dashboard.getRange('A1:D1').merge()
    .setValue(`📊 ${CONFIG.EVENT_NAME} — ORGANIZER LIVE METRICS`)
    .setBackground('#002855')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(14)
    .setHorizontalAlignment('center');

  // Key KPI Cards
  const kpis = [
    ['Metric', 'Formula / Count'],
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
  
  // Style Dashboard table headers
  dashboard.getRange('A3:B3').setBackground('#006699').setFontColor('#ffffff').setFontWeight('bold');
  dashboard.getRange('A10:B10').setBackground('#006699').setFontColor('#ffffff').setFontWeight('bold');
  dashboard.getRange('A16:B16').setBackground('#006699').setFontColor('#ffffff').setFontWeight('bold');
  dashboard.getRange('A22:B22').setBackground('#006699').setFontColor('#ffffff').setFontWeight('bold');
  dashboard.getRange('B8').setNumberFormat('₹#,##0'); // Total Revenue Currency format
  
  dashboard.setColumnWidth(1, 350);
  dashboard.setColumnWidth(2, 180);

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

  // Create new installable trigger on form submit
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  Logger.log('Successfully installed "onFormSubmit" installable trigger.');
}

/**
 * Diagnostic helper: Tests connection to Razorpay API using configured credentials.
 */
function testRazorpayConnection() {
  const config = getScriptConfig();
  Logger.log(`Testing Razorpay connection with Key ID: ${config.keyId}`);

  if (!config.keyId || !config.keySecret) {
    Logger.log('❌ ERROR: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set in Script Properties.');
    return 'Credentials Missing';
  }

  try {
    const url = 'https://api.razorpay.com/v1/payments?count=1';
    const authHeader = 'Basic ' + Utilities.base64Encode(`${config.keyId}:${config.keySecret}`);
    const response = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: { Authorization: authHeader },
      muteHttpExceptions: true
    });

    const code = response.getResponseCode();
    if (code === 200) {
      Logger.log('✅ SUCCESS: Successfully authenticated with Razorpay API!');
      return 'Connected Successfully';
    } else {
      Logger.log(`❌ FAILED: Razorpay returned status code ${code}: ${response.getContentText()}`);
      return `Failed: ${code}`;
    }
  } catch (err) {
    Logger.log('❌ EXCEPTION connecting to Razorpay: ' + err.message);
    return `Exception: ${err.message}`;
  }
}

/**
 * Helper to set Script Properties conveniently from the editor.
 * Usage: Run setProjectProperties("rzp_test_xxxx", "secret_xxxx", "https://script.google.com/...")
 */
function setProjectProperties(keyId, keySecret, webAppUrl, webhookSecret) {
  const props = PropertiesService.getScriptProperties();
  if (keyId) props.setProperty('RAZORPAY_KEY_ID', keyId.trim());
  if (keySecret) props.setProperty('RAZORPAY_KEY_SECRET', keySecret.trim());
  if (webAppUrl) props.setProperty('WEB_APP_URL', webAppUrl.trim());
  if (webhookSecret) props.setProperty('WEBHOOK_SECRET', webhookSecret.trim());

  Logger.log('Script Properties updated successfully.');
}

/**
 * Organizer Utility: Reconciles all registrations currently marked 'Payment Pending'.
 * Queries Razorpay for each pending payment link to check if payment was completed.
 * Useful as a safety net in case of network interruptions or dropped webhooks.
 */
function reconcilePendingPayments() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const data = sheet.getRange(2, 1, lastRow - 1, 28).getValues();
  let updatedCount = 0;

  for (let i = 0; i < data.length; i++) {
    const rowNum = i + 2;
    const status = data[i][CONFIG.COLUMNS.PAYMENT_STATUS - 1];
    const linkId = data[i][CONFIG.COLUMNS.PAYMENT_LINK_ID - 1];
    const regId = data[i][CONFIG.COLUMNS.REGISTRATION_ID - 1];

    if (status === CONFIG.STATUS.PENDING && linkId) {
      Logger.log(`Checking status for ${regId} (${linkId})...`);
      try {
        const plinkData = RazorpayService.fetchPaymentLink(linkId);
        if (plinkData.status === 'paid' && plinkData.payments && plinkData.payments.length > 0) {
          const paymentId = plinkData.payments[0].payment_id;
          Logger.log(`Found paid transaction for ${regId}: ${paymentId}. Verifying...`);
          
          const result = verifyAndUpdateRegistration({
            paymentId: paymentId,
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
 * Automatically creates and designs the complete Google Form with all 3 sections,
 * interdisciplinary degrees, 12 innovation domains, and question validations,
 * then links it directly to this Google Spreadsheet!
 */
function buildGoogleForm() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create the Form
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

  // Set destination to this Spreadsheet
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  const editUrl = form.getEditUrl();
  const publishedUrl = form.getPublishedUrl();

  // Save URLs directly into Dashboard sheet
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

/**
 * Adds a custom menu to Google Sheets upon opening so you can
 * easily access form links and actions with one click!
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚡ IEEE Ideathon')
    .addItem('🛠️ Generate / Link Google Form', 'buildGoogleForm')
    .addItem('📊 Format Sheet & Dashboard', 'setupSheet')
    .addItem('🔌 Install Form Trigger', 'installTriggers')
    .addItem('🔄 Reconcile Pending Payments', 'reconcilePendingPayments')
    .addToUi();
}
