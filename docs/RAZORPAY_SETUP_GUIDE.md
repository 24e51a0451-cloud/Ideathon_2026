# Razorpay Setup & Configuration Guide: IEEE IDEATHON 2026

This guide covers setting up your Razorpay account, generating API credentials, configuring webhooks, and securely connecting Razorpay with Google Apps Script without exposing secrets.

---

## 1. Razorpay Account Setup

1. Go to [https://razorpay.com](https://razorpay.com) and sign up using your IEEE Student Branch email or designated organizer account.
2. Complete preliminary onboarding details:
   - **Business Type**: Educational Institution / College Club / Individual / Society.
   - **Business Name**: `IEEE Student Branch, HITAM` or institution account name.

---

## 2. Test Mode Setup & Generating API Keys

Always start in **Test Mode** to test the complete workflow with simulated money.

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. On the top navigation bar or left sidebar, toggle the switch from **Live Mode** to **Test Mode** (you will see an orange "TEST MODE" badge).
3. In the left sidebar, navigate to:
   **Account & Settings** $\rightarrow$ **API Keys** (under *Website and app settings*).
4. Click **Generate Key** (or **Regenerate Key** if one already exists).
5. A modal will appear displaying:
   - **Key Id**: (e.g., `rzp_test_1234567890abcdef`)
   - **Key Secret**: (e.g., `aBcDeFgHiJkLmNoPqRsTuVwX`)
6. **Important**: Copy both values immediately. Razorpay will never display the `Key Secret` again. Store it in a safe password manager or directly in Google Apps Script Script Properties.

---

## 3. Configuring Google Apps Script Properties

Never put your Key Secret into source code or sheet cells! Store it in Apps Script **Script Properties**:

1. In your Google Sheet, open **Extensions** $\rightarrow$ **Apps Script**.
2. In the Apps Script editor, click the gear icon ⚙️ (**Project Settings**) on the left sidebar.
3. Scroll down to **Script Properties**.
4. Click **Add script property** and add the following properties:

| Property Name | Value | Purpose |
|---------------|-------|---------|
| `RAZORPAY_KEY_ID` | `rzp_test_xxxxxxxxxxxxxx` | Razorpay API Key ID |
| `RAZORPAY_KEY_SECRET`| `xxxxxxxxxxxxxxxxxxxxxxxx` | Razorpay API Secret |
| `WEB_APP_URL` | `https://script.google.com/macros/s/AKfycbx.../exec` | Published Apps Script Web App URL |
| `WEBHOOK_SECRET` | `MyIeeeIdeathon2026SecretKey!` | Arbitrary secret string matching Razorpay Webhook |

5. Click **Save script properties**.

---

## 4. Setting Up Razorpay Webhook

A webhook notifies your Google Apps Script instantly when a participant completes payment.

1. In your [Razorpay Dashboard](https://dashboard.razorpay.com/) (Test Mode), navigate to:
   **Account & Settings** $\rightarrow$ **Webhooks** (under *Website and app settings*).
2. Click **+ Add New Webhook**.
3. Fill in the details:
   - **Webhook URL**: Paste your Google Apps Script Web App URL:
     `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`
   - **Secret**: Enter the exact same secret you saved in `WEBHOOK_SECRET` (e.g., `MyIeeeIdeathon2026SecretKey!`).
   - **Alert Email**: Enter your organizer email to receive alerts if webhook delivery ever fails.
4. **Active Events**: Select the following checkboxes:
   - `payment_link.paid` *(Triggered when a Payment Link is paid)*
   - `payment.captured` *(Triggered when payment is captured)*
5. Click **Create Webhook**.

---

## 5. Migrating to Live Mode (Launch Day Checklist)

Once you have verified all test submissions successfully:

1. In Razorpay Dashboard, complete your **Business KYC Verification** and submit bank account details where registration proceeds should be deposited.
2. In the top bar, switch the toggle to **Live Mode** (Green badge).
3. Go to **Account & Settings** $\rightarrow$ **API Keys** $\rightarrow$ Click **Generate Key**.
4. Copy your Live **Key Id** (`rzp_live_...`) and Live **Key Secret**.
5. Go to **Account & Settings** $\rightarrow$ **Webhooks** $\rightarrow$ Add the Webhook in **Live Mode** with your Web App URL and Webhook Secret.
6. Open your Google Sheet $\rightarrow$ **Extensions** $\rightarrow$ **Apps Script** $\rightarrow$ ⚙️ **Project Settings** $\rightarrow$ Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with the live values.
7. Save properties. The system is now live and ready to accept real payments!
