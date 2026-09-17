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
