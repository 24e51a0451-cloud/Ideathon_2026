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

    // Read row values
    const rowValues = sheet.getRange(rowNumber, 1, 1, 28).getValues()[0];

    const participantData = {
      rowNumber: rowNumber,
      timestamp: rowValues[CONFIG.COLUMNS.TIMESTAMP - 1],
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
      teamMembers: (rowValues[CONFIG.COLUMNS.TEAM_MEMBERS - 1] || '').toString().trim(),
      problemStatement: (rowValues[CONFIG.COLUMNS.PROBLEM_STATEMENT - 1] || '').toString().trim(),
      solutionDescription: (rowValues[CONFIG.COLUMNS.SOLUTION_DESCRIPTION - 1] || '').toString().trim()
    };

    // 1. Determine Derived Statuses (IEEE Status & Internal/External)
    const derivedStatus = parseParticipantCategory(participantData.participantType);
    
    // 2. Determine Fee:
    // Any IEEE Member -> ₹300
    // Any Non-IEEE Member -> ₹200
    const registrationFee = derivedStatus.isIeeeMember ? CONFIG.FEE_IEEE_MEMBER : CONFIG.FEE_NON_IEEE;

    // 3. Generate Atomic, Sequential Registration ID (e.g. IDEATHON-2026-00001)
    const registrationId = generateNextRegistrationId(sheet);

    // Save initial computed data to sheet before external API call
    sheet.getRange(rowNumber, CONFIG.COLUMNS.IEEE_STATUS).setValue(derivedStatus.ieeeStatus);
    sheet.getRange(rowNumber, CONFIG.COLUMNS.INTERNAL_EXTERNAL).setValue(derivedStatus.internalExternal);
    sheet.getRange(rowNumber, CONFIG.COLUMNS.REGISTRATION_ID).setValue(registrationId);
    sheet.getRange(rowNumber, CONFIG.COLUMNS.REGISTRATION_FEE).setValue(registrationFee);
    sheet.getRange(rowNumber, CONFIG.COLUMNS.PAYMENT_STATUS).setValue(CONFIG.STATUS.PENDING);
    sheet.getRange(rowNumber, CONFIG.COLUMNS.CONFIRMATION_SENT).setValue('No');
    SpreadsheetApp.flush();

    // 4. Create Razorpay Payment Link
    let paymentLinkData;
    try {
      paymentLinkData = RazorpayService.createPaymentLink({
        registrationId: registrationId,
        fullName: participantData.fullName,
        email: participantData.email,
        mobile: participantData.mobile,
        amountRupees: registrationFee,
        participantType: participantData.participantType,
        ieeeTrack: participantData.ieeeTrack,
        domain: participantData.domain
      });

      sheet.getRange(rowNumber, CONFIG.COLUMNS.PAYMENT_LINK_ID).setValue(paymentLinkData.id);
      sheet.getRange(rowNumber, CONFIG.COLUMNS.PAYMENT_LINK).setValue(paymentLinkData.shortUrl);
      sheet.getRange(rowNumber, CONFIG.COLUMNS.ERROR).setValue('');
      SpreadsheetApp.flush();
    } catch (apiErr) {
      Logger.log(`Failed to create Razorpay Payment Link for ${registrationId}: ${apiErr.message}`);
      sheet.getRange(rowNumber, CONFIG.COLUMNS.ERROR).setValue(`Payment Link Error: ${apiErr.message}`);
      SpreadsheetApp.flush();
      return;
    }

    // 5. Send Payment Request Email to Participant
    try {
      EmailTemplates.sendPaymentEmail({
        fullName: participantData.fullName,
        email: participantData.email,
        registrationId: registrationId,
        participantType: participantData.participantType,
        registrationFee: registrationFee,
        paymentLinkUrl: paymentLinkData.shortUrl,
        ieeeTrack: participantData.ieeeTrack,
        domain: participantData.domain
      });
    } catch (emailErr) {
      Logger.log(`Failed to send payment email to ${participantData.email}: ${emailErr.message}`);
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
 * Parses the raw participant category string into structured flags.
 * Categories:
 * 1. HITAM Internal – IEEE Member -> ₹300
 * 2. HITAM Internal – Non-IEEE Member -> ₹200
 * 3. External – IEEE Member -> ₹300
 * 4. External – Non-IEEE Member -> ₹200
 * 
 * @param {string} participantType
 * @return {Object} { internalExternal: string, ieeeStatus: string, isIeeeMember: boolean }
 */
function parseParticipantCategory(participantType) {
  const text = (participantType || '').toLowerCase();

  const isInternal = text.includes('hitam internal') || text.includes('internal');
  const internalExternal = isInternal ? 'HITAM Internal' : 'External';

  const isNonIeee = text.includes('non-ieee') || text.includes('non ieee');
  const isIeeeMember = !isNonIeee && (text.includes('ieee member') || text.includes('ieee'));

  const ieeeStatus = isIeeeMember ? 'IEEE Member' : 'Non-IEEE Member';

  return {
    internalExternal: internalExternal,
    ieeeStatus: ieeeStatus,
    isIeeeMember: isIeeeMember
  };
}

/**
 * Generates the next sequential Registration ID based on existing IDs in column S.
 * Guarantees zero duplicates even if rows are deleted or formatted.
 * 
 * @param {Sheet} sheet The active registrations sheet
 * @return {string} e.g. "IDEATHON-2026-00001"
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
