# IEEE IDEATHON 2026 — Online Registration & Payment Verification System

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
Participant
    │
    ▼
Google Form (Interdisciplinary Fields & Categories)
    │
    ▼
Google Sheet ('Registrations' tab)
    │
    ▼
Apps Script Trigger (onFormSubmit)
    │
    ├─► Assigns Atomic Sequential ID: IDEATHON-2026-00001
    ├─► Resolves Fee: IEEE Member (₹300) vs Non-IEEE Member (₹200)
    ├─► Calls Razorpay Payment Links API (POST /v1/payment_links)
    ├─► Saves Link in Google Sheet & Marks "Payment Pending"
    └─► Dispatches Branded Payment Request Email
          │
          ▼
Participant Completes Online Payment (UPI, Cards, NetBanking)
    │
    ▼
Razorpay Webhook (POST) / Browser Redirect (GET)
    │
    ▼
Apps Script Server-to-Server Verification (GET /v1/payments/{payment_id})
    ├─► Checks Status == 'captured'
    ├─► Checks Currency == 'INR'
    ├─► Checks Paid Amount == Expected Fee (₹300 / ₹200)
    │
    ▼
Google Sheet Updated to 'Paid' + Timestamp + Payment ID
    │
    ▼
Automated Official Registration Pass Emailed to Participant
```

---

## Directory Structure

```
d:/IEEE/ideathon/
├── README.md                                 # Overview & Quickstart
├── docs/
│   ├── GOOGLE_FORM_SPEC.md                   # 3-Section Google Form design & options
│   ├── GOOGLE_SHEETS_SCHEMA.md               # 28-column schema, formulas & filter views
│   ├── RAZORPAY_SETUP_GUIDE.md               # Test/Live API keys, webhooks & security
│   └── DEPLOYMENT_AND_TESTING_GUIDE.md       # Deployment manual, test matrix & checklist
└── src/
    ├── UnifiedAppsScript.js                  # Complete all-in-one script for Apps Script
    ├── Config.gs                             # Metadata, fee rules, column mapping
    ├── RazorpayService.gs                    # API communication & signature verification
    ├── FormHandler.gs                        # onFormSubmit, ID generation & payment emails
    ├── WebhookHandler.gs                     # doPost/doGet handlers, server verification
    ├── EmailTemplates.gs                     # Professional IEEE HTML email templates
    └── Setup.gs                              # Sheet setup, installable triggers, 1-click form builder
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
     - `WEBHOOK_SECRET`: `Ideathon2026SecureSecret!`
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
