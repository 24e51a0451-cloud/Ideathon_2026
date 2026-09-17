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
