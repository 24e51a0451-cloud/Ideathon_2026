# Deployment, Testing & Verification Guide: IEEE IDEATHON 2026

This guide provides an exhaustive, step-by-step manual for student organizers to deploy, configure, test, and maintain the IEEE Ideathon 2026 registration and automated payment verification system.

---

## Part 1: Step-by-Step Deployment Guide

### Step 1: Create Google Form and Link to Google Sheet
1. Follow [GOOGLE_FORM_SPEC.md](GOOGLE_FORM_SPEC.md) to build the 3-section Google Form, OR use the 1-click `buildGoogleForm` function inside Google Apps Script!
2. In Google Forms $\rightarrow$ **Responses** tab $\rightarrow$ click the **Link to Sheets** icon.
3. Select **Create a new spreadsheet** named `IEEE IDEATHON 2026 - Registrations`.
4. Open the created Google Sheet. Rename the active response sheet tab to `Registrations`.

### Step 2: Open Google Apps Script Editor
1. In the Google Sheet top menu, click **Extensions** $\rightarrow$ **Apps Script**.
2. Rename the Apps Script project to `IEEE-IDEATHON-2026-Backend`.

### Step 3: Paste the Code
- Open [UnifiedAppsScript.js](../src/UnifiedAppsScript.js), copy the entire contents, and paste it into `Code.gs`.
- Click **Save** (Ctrl+S or 💾 icon).

### Step 4: Configure Script Properties
1. In the left sidebar of Apps Script, click the ⚙️ **Project Settings** icon.
2. Scroll to **Script Properties** $\rightarrow$ Click **Add script property**:
   - `RAZORPAY_KEY_ID`: `rzp_test_...` (from Razorpay Dashboard)
   - `RAZORPAY_KEY_SECRET`: Your Razorpay test secret
   - `WEBHOOK_SECRET`: `Ideathon2026SecureSecret!`
3. Click **Save script properties**.

### Step 5: Run Initial Sheet & Dashboard Setup
1. In the Apps Script top toolbar dropdown, select the function **`setupSheet`**.
2. Click **Run** and grant required Google permissions.
3. Check your Google Sheet: You will now see professional Navy Blue headers on the `Registrations` sheet and a fully populated `Dashboard` tab with live KPI formula cards!

### Step 6: Install Form Submission Trigger
1. In the function dropdown, select **`installTriggers`**.
2. Click **Run**.
3. This registers the `onFormSubmit` installable trigger automatically.

### Step 7: Deploy as Web App
1. At the top right of the Apps Script editor, click **Deploy** $\rightarrow$ **New deployment**.
2. Click the gear icon ⚙️ next to *Select type* $\rightarrow$ choose **Web app**.
3. Configure the deployment settings:
   - **Description**: `IEEE Ideathon 2026 Webhook & Callback Endpoint`
   - **Execute as**: `Me (your_email@gmail.com)`
   - **Who has access**: `Anyone` *(Crucial: Razorpay servers need to post webhooks to this endpoint without logging into Google)*
4. Click **Deploy**.
5. Copy the generated **Web App URL** (e.g., `https://script.google.com/macros/s/AKfycbx.../exec`).

### Step 8: Save Web App URL & Connect Razorpay
1. Go back to ⚙️ **Project Settings** in Apps Script $\rightarrow$ Add property:
   - `WEB_APP_URL`: Paste the Web App URL copied in Step 7.
2. Save script properties.
3. Open [Razorpay Dashboard](https://dashboard.razorpay.com/) (in Test Mode) $\rightarrow$ **Account & Settings** $\rightarrow$ **Webhooks** $\rightarrow$ **+ Add New Webhook**:
   - URL: Paste your `WEB_APP_URL`
   - Secret: Enter your `WEBHOOK_SECRET`
   - Events: Check `payment_link.paid` and `payment.captured`
   - Click **Create Webhook**.

### Step 9: Diagnostic Test
1. In Apps Script, select the function **`testRazorpayConnection`** $\rightarrow$ Click **Run**.
2. Open the **Execution log** (Ctrl+Enter).
3. Verify output:
   `✅ SUCCESS: Successfully authenticated with Razorpay API!`

---

## Part 2: Complete Testing Procedures (Razorpay Test Mode)

### Test 1: HITAM Internal – IEEE Member
- **Test Input**: Category `HITAM Internal – IEEE Member`
- **Expected Results**:
  - Registration ID: `IDEATHON-2026-00001`
  - Fee: **`₹300`**
  - Email with button linking to Razorpay Payment Link for **₹300**.
  - Pay via Razorpay Test Card (`4111 1111 1111 1111`, expiry in future, OTP `123456`).
  - Sheet updates to **`Paid`** with `Payment ID` (`pay_...`).
  - Confirmation email received with pass details.

### Test 2: HITAM Internal – Non-IEEE Member
- **Test Input**: Category `HITAM Internal – Non-IEEE Member`
- **Expected Results**:
  - Registration ID: `IDEATHON-2026-00002`
  - Fee: **`₹200`**
  - Sheet updates to **`Paid`** $\rightarrow$ Confirmation email dispatched.

### Test 3: External – IEEE Member
- **Test Input**: Category `External – IEEE Member`
- **Expected Results**:
  - Registration ID: `IDEATHON-2026-00003`
  - Fee: **`₹300`**
  - Sheet updates to **`Paid`**.

### Test 4: External – Non-IEEE Member
- **Test Input**: Category `External – Non-IEEE Member`
- **Expected Results**:
  - Registration ID: `IDEATHON-2026-00004`
  - Fee: **`₹200`**
  - Sheet updates to **`Paid`**.

---

## Part 3: Final Pre-Flight Launch Checklist

- [ ] Google Form questions tested and response spreadsheet verified.
- [ ] Script properties set (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `WEB_APP_URL`, `WEBHOOK_SECRET`).
- [ ] Web App deployed (`Execute as: Me`, `Who has access: Anyone`).
- [ ] Razorpay Webhook configured and active.
- [ ] Verified test submissions for all 4 categories generated correct ₹200/₹300 amounts.
- [ ] Verified confirmation emails arrived cleanly with accurate details.
- [ ] Dashboard formulas verified updating counts and revenue.
- [ ] Clear test rows from `Registrations` sheet.
- [ ] Switch Razorpay to **Live Mode**, generate Live API keys, and update Script Properties.
- [ ] Share Google Form link across colleges and IEEE communication channels!
