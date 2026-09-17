# Google Sheet Schema & Organizer Analytics Guide

**Event**: IEEE IDEATHON 2026  
**Sheet Name**: `Registrations`  
**Dashboard Name**: `Dashboard`  

---

## 1. Complete Column Schema (Columns A to AB)

| Col | Header Name | Populated By | Data Type | Example Value | Description & Purpose |
|-----|-------------|--------------|-----------|---------------|-----------------------|
| **A** | `Timestamp` | Google Form | Datetime | `2026-09-25 10:14:22` | Submission timestamp recorded by Google Forms. |
| **B** | `Full Name` | Google Form | String | `Ananya Sharma` | Participant's full name. |
| **C** | `Email Address` | Google Form | String (Email) | `ananya@example.com` | Participant's contact email. |
| **D** | `Mobile Number` | Google Form | String (Phone) | `+919876543210` | 10-digit WhatsApp/mobile number. |
| **E** | `College / Institution` | Google Form | String | `HITAM` | Name of the institution. |
| **F** | `Course / Degree` | Google Form | String | `B.Tech / Engineering` | Course (B.Tech, Medical, Law, Degree, Management, etc.). |
| **G** | `Year of Study` | Google Form | String | `3rd Year` | Current academic year. |
| **H** | `Participant Type` | Google Form | String | `HITAM Internal – IEEE Member` | Exact option chosen by participant. |
| **I** | `IEEE Membership Status` | Apps Script | String | `IEEE Member` | Derived: `IEEE Member` or `Non-IEEE Member`. |
| **J** | `Internal/External Status` | Apps Script | String | `HITAM Internal` | Derived: `HITAM Internal` or `External`. |
| **K** | `IEEE Track` | Google Form | String | `IEEE Sensors Council` | Selected IEEE society/council track. |
| **L** | `Innovation Domain` | Google Form | String | `Healthcare & Biomedical Innovation` | 1 of 12 interdisciplinary domains. |
| **M** | `Ideathon Title` | Google Form | String | `Non-invasive Glucose Monitor` | Project innovation title. |
| **N** | `Team Name` | Google Form | String | `BioSense Tech` | Team name (blank if individual). |
| **O** | `Team Size` | Google Form | Number / String | `3` | Total participants in the team (1–4). |
| **P** | `Team Members` | Google Form | String (Paragraph)| `1. Rahul V, 2. Sneha P` | Additional team members' details. |
| **Q** | `Problem Statement` | Google Form | String (Paragraph)| `Traditional blood glucose...` | Problem being tackled. |
| **R** | `Solution Description` | Google Form | String (Paragraph)| `Using optical NIR sensors...` | Technical/practical solution proposed. |
| **S** | `Registration ID` | Apps Script | String | `IDEATHON-2026-00001` | Atomic, sequential unique ID generated with lock. |
| **T** | `Registration Fee` | Apps Script | Currency (INR) | `₹300` | Auto-computed fee: ₹300 (IEEE) or ₹200 (Non-IEEE). |
| **U** | `Payment Link ID` | Apps Script | String | `plink_O123456789abc` | Unique Razorpay Payment Link ID. |
| **V** | `Payment Link` | Apps Script | URL | `https://rzp.io/i/xxxxxx` | Clickable payment link sent to participant. |
| **W** | `Payment Status` | Apps Script / Webhook | String | `Paid` | `Payment Pending`, `Paid`, `Failed`, `Amount Mismatch`, `Verification Error`. |
| **X** | `Payment ID` | Apps Script / Webhook | String | `pay_P123456789xyz` | Razorpay verified transaction ID. |
| **Y** | `Payment Amount` | Apps Script / Webhook | Currency (INR) | `₹300` | Verified amount paid. |
| **Z** | `Payment Verified At`| Apps Script / Webhook | Datetime | `2026-09-25 10:18:45` | Timestamp of successful verification. |
| **AA**| `Confirmation Sent` | Apps Script | String | `Yes` | `Yes` or `No` (prevents duplicate emails). |
| **AB**| `Error` | Apps Script | String | `(empty)` | Records API/network error traces if any. |

---

## 2. Dynamic Live Dashboard Sheet

The script includes an automated `setupSheet()` routine that builds a companion sheet named **`Dashboard`** with live updating formulas:

### KPI Formulas Used:
- **Total Registrations**:  
  `=COUNTA(Registrations!S2:S)`
- **Confirmed Paid Registrations**:  
  `=COUNTIF(Registrations!W2:W, "Paid")`
- **Pending Payments**:  
  `=COUNTIF(Registrations!W2:W, "Payment Pending")`
- **Total Revenue Collected (₹)**:  
  `=SUMIF(Registrations!W2:W, "Paid", Registrations!Y2:Y)`
- **HITAM Internal Paid Participants**:  
  `=COUNTIFS(Registrations!J2:J, "HITAM Internal", Registrations!W2:W, "Paid")`
- **External Paid Participants**:  
  `=COUNTIFS(Registrations!J2:J, "External", Registrations!W2:W, "Paid")`
- **IEEE Members Paid**:  
  `=COUNTIFS(Registrations!I2:I, "IEEE Member", Registrations!W2:W, "Paid")`
- **Non-IEEE Members Paid**:  
  `=COUNTIFS(Registrations!I2:I, "Non-IEEE Member", Registrations!W2:W, "Paid")`
- **IEEE Track Distributions**:  
  `=COUNTIFS(Registrations!K2:K, "*Sensors*", Registrations!W2:W, "Paid")`  
  `=COUNTIFS(Registrations!K2:K, "*Robotics*", Registrations!W2:W, "Paid")`  
  `=COUNTIFS(Registrations!K2:K, "*Communications*", Registrations!W2:W, "Paid")`  
  `=COUNTIFS(Registrations!K2:K, "*Women*", Registrations!W2:W, "Paid")`

---

## 3. How Organizers Can Filter the Sheet

In Google Sheets, use **Filter Views** (Data $\rightarrow$ Filter views $\rightarrow$ Create new filter view):

1. **All Paid Participants (Confirmed Pass Holders)**:
   - Column **W** (`Payment Status`) $\rightarrow$ Check only `Paid`.
2. **HITAM Internal Participants**:
   - Column **J** (`Internal/External Status`) $\rightarrow$ Check only `HITAM Internal`.
3. **External College Participants**:
   - Column **J** (`Internal/External Status`) $\rightarrow$ Check only `External`.
4. **IEEE Members**:
   - Column **I** (`IEEE Membership Status`) $\rightarrow$ Check only `IEEE Member`.
5. **Participants Under Each Society/Council Track**:
   - Column **K** (`IEEE Track`) $\rightarrow$ Filter by specific society.
6. **Action Needed (Payment Pending / Mismatch)**:
   - Column **W** (`Payment Status`) $\rightarrow$ Select `Payment Pending`, `Amount Mismatch`, or `Verification Error`.
