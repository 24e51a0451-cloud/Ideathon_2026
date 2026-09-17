# INNOVISION 2026 — Online Registration & Payment Verification System

**Organized by**: IEEE Student Branch, Hyderabad Institute of Technology and Management (HITAM)  
**Event Date**: 25 September 2026  
**Participating Societies & Councils**:
- IEEE Sensors Council
- IEEE Robotics and Automation Society
- IEEE Communications Society
- IEEE Women in Engineering

---

## System Architecture

```
Team Submits 3-Section Registration (Mandatory 3 or 4 Members)
    │
    ▼
Google Form (Section 1: Lead & Domain | Section 2: Participants & IEEE IDs | Section 3: QR Payment)
    │
    ▼
Google Sheet ('Registrations' tab — 52 Columns)
    │
    ▼
Apps Script Trigger (onFormSubmit)
    │
    ├─► Assigns Atomic Sequential ID: INNOVISION-2026-00001
    ├─► Computes Aggregate Team Fee based on each member's IEEE status (₹300 / ₹200)
    ├─► Calls Razorpay Payment Links API + Generates Dynamic Scannable UPI QR Code
    ├─► Saves Link & QR in Google Sheet & Marks "Payment Pending"
    └─► Dispatches Team Payment Request Email with Embedded UPI QR to Lead & CCs all members
          │
          ▼
Team Completes Payment via UPI QR (GPay, PhonePe, Paytm), NetBanking, or Cards
          │
          ▼
Razorpay Webhook (POST) / Browser Redirect (GET)
          │
          ▼
Apps Script Server-to-Server Verification (GET /v1/payments/{payment_id})
    ├─► Checks Status == 'captured'
    ├─► Checks Currency == 'INR'
    ├─► Checks Paid Amount == Expected Team Fee
    │
    ▼
Google Sheet Updated to 'Paid' + Timestamp + Payment ID
    │
    ▼
Automated Official Team Participant Pass Emailed to ALL Team Members
```

---

## Directory Structure

```
d:/IEEE/ideathon/
├── README.md                                 # Overview & Quickstart
├── docs/
│   ├── GOOGLE_FORM_SPEC.md                   # 3-Section Team Google Form design (3-4 members + IEEE IDs)
│   ├── GOOGLE_SHEETS_SCHEMA.md               # 52-column schema, formulas & filter views
│   ├── RAZORPAY_SETUP_GUIDE.md               # Test/Live API keys, webhooks & security
│   └── DEPLOYMENT_AND_TESTING_GUIDE.md       # Deployment manual, test matrix & checklist
└── src/
    ├── UnifiedAppsScript.js                  # Complete all-in-one script for Apps Script (52 columns)
    ├── Config.gs                             # Metadata, fee rules, 52-column mapping
    ├── RazorpayService.gs                    # API communication & signature verification
    ├── FormHandler.gs                        # onFormSubmit, dynamic QR generation & fee calculation
    ├── WebhookHandler.gs                     # doPost/doGet handlers, server verification & pass dispatch
    ├── EmailTemplates.gs                     # Professional IEEE HTML email templates with dynamic QR codes
    └── Setup.gs                              # Sheet setup, installable triggers, 1-click 3-section form builder
```

---

## Quick Deployment (3 Minutes)

1. **Create Google Form**: Follow [GOOGLE_FORM_SPEC.md](docs/GOOGLE_FORM_SPEC.md) or run `buildGoogleForm` in Apps Script!
2. **Link to Google Sheet**: In Form $\rightarrow$ Responses $\rightarrow$ Link to Sheets.
3. **Open Apps Script**: In Sheet $\rightarrow$ Extensions $\rightarrow$ Apps Script.
4. **Copy Code**: Copy entire content of [src/UnifiedAppsScript.js](src/UnifiedAppsScript.js) into `Code.gs`.
5. **Add Script Properties**:
   - In ⚙️ **Project Settings** $\rightarrow$ **Script Properties**:
     - `RAZORPAY_KEY_ID`: `rzp_test_...`
     - `RAZORPAY_KEY_SECRET`: Razorpay Secret
     - `WEBHOOK_SECRET`: `Innovision2026SecureSecret!`
6. **Initialize**: Select function `setupSheet` $\rightarrow$ Click **Run** (Authorize permissions).
7. **Install Trigger**: Select function `installTriggers` $\rightarrow$ Click **Run**.
8. **Deploy Web App**:
   - Top right **Deploy** $\rightarrow$ **New deployment** $\rightarrow$ Type: **Web app**.
   - Execute as: **Me** | Who has access: **Anyone**.
   - Copy the Web App URL $\rightarrow$ Add it to Script Properties as `WEB_APP_URL`.
9. **Set Webhook in Razorpay**:
   - In Razorpay Dashboard $\rightarrow$ Webhooks $\rightarrow$ Add Webhook:
     - URL: Web App URL
     - Secret: Webhook Secret
     - Events: `payment_link.paid`, `payment.captured`.
10. **Test with Simulated Payments**: Follow [DEPLOYMENT_AND_TESTING_GUIDE.md](docs/DEPLOYMENT_AND_TESTING_GUIDE.md).
