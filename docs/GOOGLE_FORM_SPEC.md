# Google Form Design Specification: IEEE IDEATHON 2026

**Event**: IEEE IDEATHON 2026  
**Organized by**: IEEE Student Branch, Hyderabad Institute of Technology and Management (HITAM)  
**Date**: 25 September 2026  

---

## Form Settings & Setup

1. Open [Google Forms](https://forms.google.com) and create a **Blank Form**.
2. **Form Title**: `IEEE IDEATHON 2026 — Official Registration`
3. **Form Description**:
   ```
   Welcome to IEEE IDEATHON 2026 organized by the IEEE Student Branch at HITAM in collaboration with IEEE Sensors Council, IEEE Robotics and Automation Society, IEEE Communications Society, and IEEE Women in Engineering.

   Event Date: 25 September 2026
   Venue: HITAM Campus, Gowdavelly, Medchal, Hyderabad

   Open to students and graduates from ALL academic backgrounds (Engineering, Medical, Law, Degree, Management, Commerce, Arts & Humanities).

   Registration Fees:
   • IEEE Members (Internal or External): ₹300
   • Non-IEEE Members (Internal or External): ₹200

   Instructions:
   1. Complete the registration form below.
   2. After submission, you will receive an email with your unique Registration ID and a secure Razorpay payment link.
   3. Complete the payment online. Once verified, your official registration pass will be emailed immediately.
   ```
4. **Form Settings**:
   - Under **Settings** $\rightarrow$ **Responses**:
     - Turn on **Collect email addresses** $\rightarrow$ Set to **Verified** or **Responder input**.
     - Send responders a copy of their response: **Always** or **When requested**.
     - Allow response editing: **Off**.

---

## Section 1: Participant & Academic Information

| # | Question Title | Question Type | Options / Configuration | Required? | Helper / Validation Text |
|---|----------------|---------------|-------------------------|-----------|--------------------------|
| 1 | **Full Name** | Short answer | Text | **Yes** | Enter your name as you would like it on your certificate and event pass. |
| 2 | **Email Address** | Short answer | Text (Email validation) | **Yes** | Enter a valid email address. Your payment link and event pass will be sent here. |
| 3 | **Mobile / WhatsApp Number** | Short answer | Text (Regex) | **Yes** | 10-digit mobile number. Validation: Regular expression `^[6-9]\d{9}$`. |
| 4 | **College / Institution Name** | Short answer | Text | **Yes** | If HITAM student, enter "HITAM". Otherwise, enter your full college name. |
| 5 | **Course / Degree** | Multiple choice | 1. B.Tech / Engineering<br>2. Medical<br>3. Law<br>4. Degree<br>5. Management<br>6. Commerce<br>7. Arts & Humanities<br>8. Other | **Yes** | Select your current or completed program. Interdisciplinary teams are highly encouraged! |
| 6 | **Year of Study** | Multiple choice | 1. 1st Year<br>2. 2nd Year<br>3. 3rd Year<br>4. 4th Year / Final Year<br>5. Graduate / Alumni | **Yes** | Select your current year of study. |

---

## Section 2: Participant Category & Fee Determination

| # | Question Title | Question Type | Options / Configuration | Required? | Helper / Validation Text |
|---|----------------|---------------|-------------------------|-----------|--------------------------|
| 7 | **Participant Category** | Multiple choice | 1. `HITAM Internal – IEEE Member` (₹300)<br>2. `HITAM Internal – Non-IEEE Member` (₹200)<br>3. `External – IEEE Member` (₹300)<br>4. `External – Non-IEEE Member` (₹200) | **Yes** | *Important*: Select your exact category. Your registration fee will be automatically computed based on this choice. IEEE members may be asked to present their IEEE membership number at the check-in desk. |

---

## Section 3: Ideathon Project & Team Details

| # | Question Title | Question Type | Options / Configuration | Required? | Helper / Validation Text |
|---|----------------|---------------|-------------------------|-----------|--------------------------|
| 8 | **Select IEEE Track** | Multiple choice | 1. IEEE Sensors Council<br>2. IEEE Robotics and Automation Society<br>3. IEEE Communications Society<br>4. IEEE Women in Engineering | **Yes** | Select the IEEE society/council track most aligned with your project focus. |
| 9 | **Innovation Domain** | Dropdown / Multiple choice | 1. Healthcare & Biomedical Innovation<br>2. Smart Agriculture & Food Security<br>3. Environment & Climate<br>4. Smart Cities & Infrastructure<br>5. Safety & Disaster Management<br>6. Education & Digital Empowerment<br>7. Women & Social Inclusion<br>8. Accessibility & Assistive Technology<br>9. Transportation & Smart Mobility<br>10. Industrial & Workplace Innovation<br>11. Communication & Digital Connectivity<br>12. AI / IoT / Robotics / Emerging Technology | **Yes** | Broad interdisciplinary domains open to ideas from engineering, healthcare, legal, business, and social perspectives. |
| 10 | **Ideathon Project Title** | Short answer | Text | **Yes** | Give a clear, concise title for your innovation / idea. |
| 11 | **Participation Type** | Multiple choice | 1. Individual<br>2. Team | **Yes** | Choose whether you are participating solo or as part of a team. |
| 12 | **Team Name** | Short answer | Text | *Optional* | Required if participating as a Team. Leave blank if Individual. |
| 13 | **Total Team Size (including Team Lead)** | Dropdown | 1, 2, 3, 4 | **Yes** | Select 1 if participating individually. |
| 14 | **Team Member Details** | Paragraph | Text | *Optional* | If team, list names, colleges, and email addresses of other team members. |
| 15 | **Brief Problem Statement** | Paragraph | Text | **Yes** | What specific real-world problem or pain point is your idea addressing? (2–4 sentences). |
| 16 | **Proposed Solution Description** | Paragraph | Text | **Yes** | How does your idea solve this problem? Mention any technical or practical approach (3–5 sentences). |

---

## Linking Form to Google Sheet

1. In Google Forms, click the **Responses** tab.
2. Click **Link to Sheets** (the green Sheets icon).
3. Select **Create a new spreadsheet** named `IEEE IDEATHON 2026 - Registrations`.
4. Click **Create**.
