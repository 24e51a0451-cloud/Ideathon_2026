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
   * Sends the Payment Request Email containing the Razorpay link.
   * @param {Object} data
   */
  sendPaymentEmail(data) {
    const subject = `[Action Required] Complete Payment for ${CONFIG.EVENT_NAME} — Reg ID: ${data.registrationId}`;
    
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 30px 0; }
        .main-table { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #002855 0%, #006699 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 0.5px; }
        .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 30px 28px; color: #334155; line-height: 1.6; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
        .info-card { background: #f8fafc; border-left: 4px solid #006699; padding: 16px 20px; border-radius: 4px; margin: 20px 0; }
        .label { font-weight: 600; color: #64748b; }
        .value { font-weight: 700; color: #0f172a; }
        .price-highlight { font-size: 20px; color: #006699; font-weight: 800; }
        .btn-container { text-align: center; margin: 32px 0 24px; }
        .pay-btn { background: #006699; color: #ffffff !important; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 6px; display: inline-block; box-shadow: 0 4px 8px rgba(0, 102, 153, 0.3); }
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
              <div class="greeting">Dear ${data.fullName},</div>
              <p>Thank you for registering for <strong>${CONFIG.EVENT_NAME}</strong>! Your registration details have been received. Please complete the registration fee payment via the secure Razorpay link below to lock in your slot.</p>
              
              <div class="info-card">
                <table width="100%" cellpadding="4" cellspacing="0">
                  <tr>
                    <td class="label">Registration ID:</td>
                    <td class="value" align="right">${data.registrationId}</td>
                  </tr>
                  <tr>
                    <td class="label">Category:</td>
                    <td class="value" align="right">${data.participantType}</td>
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
                    <td class="label">Registration Fee:</td>
                    <td class="price-highlight" align="right">₹${data.registrationFee}</td>
                  </tr>
                </table>
              </div>

              <div class="btn-container">
                <a href="${data.paymentLinkUrl}" target="_blank" class="pay-btn">Pay ₹${data.registrationFee} via Razorpay</a>
              </div>

              <div class="note">
                <strong>Important Instructions:</strong>
                <ul style="margin: 6px 0 0; padding-left: 20px;">
                  <li>Payments can be made via UPI (GPay, PhonePe, Paytm), Net Banking, Debit/Credit Cards.</li>
                  <li>Do NOT share your payment link with others; it is uniquely bound to your Registration ID: <strong>${data.registrationId}</strong>.</li>
                  <li>Once payment is completed, you will automatically receive an official confirmation receipt.</li>
                </ul>
              </div>

              <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
                If the button above does not work, copy and paste this link into your browser:<br>
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

    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody
    });
  },

  /**
   * Sends the Official Verified Registration Confirmation Email.
   * Dispatched ONLY after payment has been verified with Razorpay API.
   * @param {Object} data
   */
  sendConfirmationEmail(data) {
    const subject = `[Confirmed] Official Registration Pass — ${CONFIG.EVENT_NAME} (ID: ${data.registrationId})`;

    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 30px 0; }
        .main-table { max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #002855 0%, #006699 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .badge { background: #10b981; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; display: inline-block; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .header h1 { margin: 0; font-size: 26px; }
        .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 32px 28px; color: #334155; line-height: 1.6; }
        .pass-box { background: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .pass-title { font-size: 18px; font-weight: 800; color: #166534; text-align: center; margin-bottom: 16px; border-bottom: 1px solid #bbf7d0; padding-bottom: 8px; }
        .detail-table td { padding: 6px 8px; font-size: 14px; }
        .detail-label { font-weight: 600; color: #475569; width: 40%; }
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
              <p style="font-size: 16px; font-weight: 600; color: #0f172a;">Congratulations, ${data.fullName}!</p>
              <p>Your payment has been successfully verified by our automated system. Your entry to <strong>${CONFIG.EVENT_NAME}</strong> on <strong>${CONFIG.EVENT_DATE}</strong> is officially confirmed.</p>

              <div class="pass-box">
                <div class="pass-title">OFFICIAL PARTICIPANT PASS</div>
                <table class="detail-table" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="detail-label">Registration ID:</td>
                    <td class="detail-value" style="color: #006699; font-size: 16px;">${data.registrationId}</td>
                  </tr>
                  <tr>
                    <td class="detail-label">Participant Name:</td>
                    <td class="detail-value">${data.fullName}</td>
                  </tr>
                  <tr>
                    <td class="detail-label">Category:</td>
                    <td class="detail-value">${data.participantType}</td>
                  </tr>
                  <tr>
                    <td class="detail-label">IEEE Status:</td>
                    <td class="detail-value">${data.ieeeStatus}</td>
                  </tr>
                  <tr>
                    <td class="detail-label">Affiliation:</td>
                    <td class="detail-value">${data.internalExternal}</td>
                  </tr>
                  <tr>
                    <td class="detail-label">IEEE Track:</td>
                    <td class="detail-value">${data.ieeeTrack}</td>
                  </tr>
                  <tr>
                    <td class="detail-label">Innovation Domain:</td>
                    <td class="detail-value">${data.domain}</td>
                  </tr>
                  ${data.teamName ? `
                  <tr>
                    <td class="detail-label">Team Name:</td>
                    <td class="detail-value">${data.teamName} (Size: ${data.teamSize || '1'})</td>
                  </tr>` : ''}
                  ${data.teamMembers ? `
                  <tr>
                    <td class="detail-label">Team Members:</td>
                    <td class="detail-value">${data.teamMembers}</td>
                  </tr>` : ''}
                  <tr>
                    <td class="detail-label">Razorpay Payment ID:</td>
                    <td class="detail-value" style="font-family: monospace; font-size: 13px;">${data.paymentId}</td>
                  </tr>
                  <tr>
                    <td class="detail-label">Amount Paid:</td>
                    <td class="detail-value" style="color: #166534;">₹${data.amountPaid} (PAID)</td>
                  </tr>
                  <tr>
                    <td class="detail-label">Verified Timestamp:</td>
                    <td class="detail-value" style="font-size: 12px; color: #64748b;">${data.verifiedAt}</td>
                  </tr>
                </table>
              </div>

              <div class="event-details">
                <h3>📍 Event & Venue Logistics</h3>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Date:</strong> ${CONFIG.EVENT_DATE}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Venue:</strong> ${CONFIG.EVENT_VENUE}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Host:</strong> IEEE Student Branch, HITAM</p>
                <p style="margin: 10px 0 0; font-size: 13px; color: #64748b;">
                  * Please carry your College/Institutional ID card along with a digital or printed copy of this email on the day of the event.
                </p>
              </div>

              <p style="font-size: 14px;">We are excited to see your innovative ideas come to life at HITAM!</p>
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

    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody
    });
  }
};
