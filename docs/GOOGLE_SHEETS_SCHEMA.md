# Google Sheet Schema & Organizer Analytics Guide

**Event**: INNOVISION 2026  
**Sheet Name**: `Registrations`  
**Dashboard Name**: `Dashboard`  

---

## 1. Complete Team Column Schema (Columns A to AZ — 52 Columns)

| Col | Header Name | Section / Populated By | Data Type | Description & Purpose |
|:---:|:---|:---|:---|:---|
| **A (1)** | `Timestamp` | Form / System | Datetime | Submission timestamp recorded by Google Forms. |
| **B (2)** | `Team Name` | Section 1 (Lead) | String | Name of the team or startup project. |
| **C (3)** | `Total Team Size` | Section 1 (Lead) | String | `3 Members` or `4 Members`. |
| **D (4)** | `Lead Full Name` | Section 1 (Lead) | String | Full name of Member 1 (Team Lead). |
| **E (5)** | `Lead Email Address` | Section 1 (Lead) | Email | Lead email for payment link & official pass. |
| **F (6)** | `Lead Mobile Number` | Section 1 (Lead) | Phone | 10-digit WhatsApp/Mobile number of Lead. |
| **G (7)** | `Lead College / Institution` | Section 1 (Lead) | String | College name (e.g., `HITAM` or external college). |
| **H (8)** | `Lead Course / Degree` | Section 1 (Lead) | String | B.Tech, Medical, Law, Degree, Management, etc. |
| **I (9)** | `Lead Year of Study` | Section 1 (Lead) | String | 1st, 2nd, 3rd, 4th / Final, or Graduate/Alumni. |
| **J (10)** | `Lead IEEE Member?` | Section 1 (Lead) | String | `Yes (IEEE Member — ₹300)` / `No (Non-IEEE Member — ₹200)`. |
| **K (11)** | `Lead IEEE Membership Number` | Section 1 (Lead) | String | 8-digit IEEE ID or "NA". |
| **L (12)** | `Selected IEEE Track` | Section 1 (Lead) | String | Selected IEEE Society/Council track. |
| **M (13)** | `Innovation Domain` | Section 1 (Lead) | String | 1 of 12 interdisciplinary innovation domains. |
| **N (14)** | `Innovision Project Title` | Section 1 (Lead) | String | Project / Innovation Title. |
| **O (15)** | `Brief Problem Statement` | Section 1 (Lead) | Text | Problem tackled by the team. |
| **P (16)** | `Brief Solution Description` | Section 1 (Lead) | Text | Technical approach & proposed solution. |
| **Q (17)** | `Member 2 Full Name` | Section 2 (Participants) | String | Member 2 Full Name. |
| **R (18)** | `Member 2 Email Address` | Section 2 (Participants) | Email | Member 2 Email. |
| **S (19)** | `Member 2 Mobile Number` | Section 2 (Participants) | Phone | Member 2 Mobile number. |
| **T (20)** | `Member 2 College / Institution` | Section 2 (Participants) | String | Member 2 College name. |
| **U (21)** | `Member 2 Course / Degree` | Section 2 (Participants) | String | Member 2 Degree program. |
| **V (22)** | `Member 2 Year of Study` | Section 2 (Participants) | String | Member 2 Academic year. |
| **W (23)** | `Member 2 IEEE Member?` | Section 2 (Participants) | String | `Yes (IEEE Member — ₹300)` / `No (Non-IEEE Member — ₹200)`. |
| **X (24)** | `Member 2 IEEE Membership Number` | Section 2 (Participants) | String | 8-digit IEEE ID or "NA". |
| **Y (25)** | `Member 3 Full Name` | Section 2 (Participants) | String | Member 3 Full Name. |
| **Z (26)** | `Member 3 Email Address` | Section 2 (Participants) | Email | Member 3 Email. |
| **AA (27)** | `Member 3 Mobile Number` | Section 2 (Participants) | Phone | Member 3 Mobile number. |
| **AB (28)** | `Member 3 College / Institution` | Section 2 (Participants) | String | Member 3 College name. |
| **AC (29)** | `Member 3 Course / Degree` | Section 2 (Participants) | String | Member 3 Degree program. |
| **AD (30)** | `Member 3 Year of Study` | Section 2 (Participants) | String | Member 3 Academic year. |
| **AE (31)** | `Member 3 IEEE Member?` | Section 2 (Participants) | String | `Yes (IEEE Member — ₹300)` / `No (Non-IEEE Member — ₹200)`. |
| **AF (32)** | `Member 3 IEEE Membership Number` | Section 2 (Participants) | String | 8-digit IEEE ID or "NA". |
| **AG (33)** | `Member 4 Full Name` | Section 2 (Participants) | String | Member 4 Full Name (Optional). |
| **AH (34)** | `Member 4 Email Address` | Section 2 (Participants) | Email | Member 4 Email (Optional). |
| **AI (35)** | `Member 4 Mobile Number` | Section 2 (Participants) | Phone | Member 4 Mobile number (Optional). |
| **AJ (36)** | `Member 4 College / Institution` | Section 2 (Participants) | String | Member 4 College name (Optional). |
| **AK (37)** | `Member 4 Course / Degree` | Section 2 (Participants) | String | Member 4 Degree program (Optional). |
| **AL (38)** | `Member 4 Year of Study` | Section 2 (Participants) | String | Member 4 Academic year (Optional). |
| **AM (39)** | `Member 4 IEEE Member?` | Section 2 (Participants) | String | `Yes` / `No` / `NA` (Optional). |
| **AN (40)** | `Member 4 IEEE Membership Number` | Section 2 (Participants) | String | 8-digit IEEE ID or "NA" (Optional). |
| **AO (41)** | `Payment Acknowledgment` | Section 3 | String | Acknowledgment checkbox response. |
| **AP (42)** | `Registration ID` | Backend System | String | Atomic, sequential unique ID (`INNOVISION-2026-00001`). |
| **AQ (43)** | `Total Team Registration Fee` | Backend System | Currency (₹) | Total aggregate team fee based on member status. |
| **AR (44)** | `Payment Link ID` | Backend System | String | Razorpay Payment Link ID (`plink_xxx`). |
| **AS (45)** | `Payment Link URL` | Backend System | URL | Razorpay payment link URL sent to all members. |
| **AT (46)** | `Payment QR Code URL` | Backend System | URL | Scannable dynamic UPI QR code URL. |
| **AU (47)** | `Payment Status` | Backend / Webhook | String | `Payment Pending`, `Paid`, `Failed`, `Amount Mismatch`, `Verification Error`. |
| **AV (48)** | `Payment ID` | Backend / Webhook | String | Razorpay verified transaction ID (`pay_xxx`). |
| **AW (49)** | `Payment Amount` | Backend / Webhook | Currency (₹) | Verified amount paid. |
| **AX (50)** | `Payment Verified At` | Backend / Webhook | Datetime | Timestamp of successful payment verification. |
| **AY (51)** | `Confirmation Sent` | Backend System | String | `Yes` or `No` (prevents duplicate emails). |
| **AZ (52)** | `Error` | Backend System | String | Logs API/network error traces if any. |

---

## 2. Dynamic Live Dashboard Sheet

The automated `setupSheet()` routine builds a live updating companion sheet named **`Dashboard`**:

### KPI Formulas Used:
- **Total Registered Teams**:  
  `=COUNTA(Registrations!AP2:AP)`
- **Confirmed Paid Teams**:  
  `=COUNTIF(Registrations!AU2:AU, "Paid")`
- **Pending Payment Teams**:  
  `=COUNTIF(Registrations!AU2:AU, "Payment Pending")`
- **Payment Mismatches / Errors**:  
  `=COUNTIF(Registrations!AU2:AU, "Amount Mismatch") + COUNTIF(Registrations!AU2:AU, "Verification Error")`
- **Total Revenue Collected (₹)**:  
  `=SUMIF(Registrations!AU2:AU, "Paid", Registrations!AW2:AW)`
- **3-Member Teams (Paid)**:  
  `=COUNTIFS(Registrations!C2:C, "*3*", Registrations!AU2:AU, "Paid")`
- **4-Member Teams (Paid)**:  
  `=COUNTIFS(Registrations!C2:C, "*4*", Registrations!AU2:AU, "Paid")`
- **Track Distributions**:  
  `=COUNTIFS(Registrations!L2:L, "*Sensors*", Registrations!AU2:AU, "Paid")`  
  `=COUNTIFS(Registrations!L2:L, "*Robotics*", Registrations!AU2:AU, "Paid")`  
  `=COUNTIFS(Registrations!L2:L, "*Communications*", Registrations!AU2:AU, "Paid")`  
  `=COUNTIFS(Registrations!L2:L, "*Women*", Registrations!AU2:AU, "Paid")`
