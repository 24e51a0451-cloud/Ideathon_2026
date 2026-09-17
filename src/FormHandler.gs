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
