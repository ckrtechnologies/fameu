# Fameu Hiring App — Comprehensive QA Test Cases & Verification Suite

**Document Version:** 1.0.0  
**Target Platform:** Android (React Native Fabric Architecture)  
**Target Device:** Google Pixel 10 Pro XL (`emulator-5554`)  
**Resolution:** 1344 x 2992 (Edge-to-Edge)  
**Date:** August 27, 2026  
**Audience:** Client Stakeholders, Product Team, QA Lead  

---

## 📊 1. Test Suite Summary & Overview

| Module ID | Module Name | Total Test Cases | Automation Status | Priority |
| :--- | :--- | :---: | :---: | :---: |
| **MOD-01** | Authentication & Session Management | 4 | Automated (ADB) | Critical |
| **MOD-02** | Recruiter Dashboard & Metrics | 6 | Automated (ADB) | High |
| **MOD-03** | 4-Step Casting Call Creation Wizard | 12 | Automated (ADB) | Critical |
| **MOD-04** | Auditions Management & Lifecycle | 6 | Automated (ADB) | High |
| **MOD-05** | Talent Discovery & Profile Exploration | 6 | Automated (ADB) | High |
| **MOD-06** | Applicant Tracking System (ATS Pipeline) | 6 | Automated (ADB) | High |
| **MOD-07** | Real-Time Messaging & Sockets | 4 | Automated (ADB) | Medium |
| **MOD-08** | Recruiter Profile & Settings | 4 | Automated (ADB) | Medium |
| **TOTAL** | **Full Application Suite** | **48 Test Cases** | **100% Executable** | — |

---

## 🛠️ 2. Execution Environment & Test Bed

- **Application Package:** `com.hiringapp`
- **Main Activity:** `com.hiringapp/.MainActivity`
- **Backend API Gateway:** `https://api.fameu.in` (WebSocket: `wss://api.fameu.in`)
- **Automation Driver:** Android Debug Bridge (ADB Subsystem Controller)
- **Visual Capture Engine:** SurfaceFlinger Direct Frame Capture (`screencap -p`)

---

## 📋 3. Detailed Test Cases Matrix

---

### Module 1: Authentication & Session Management (`MOD-01`)

| Test ID | Test Scenario | Preconditions | Test Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-AUTH-01` | **App Cold Launch** | App is killed | 1. Execute `am start -n com.hiringapp/.MainActivity`<br>2. Wait for splash screen dismiss | App launches into Dashboard without crashes or blank screens | ⏳ Ready |
| `TC-AUTH-02` | **Token Persistence** | User logged in | 1. Force stop app<br>2. Relaunch app | Session restored automatically without asking to re-login | ⏳ Ready |
| `TC-AUTH-03` | **FCM Push Token Registration** | Network active | 1. Launch app<br>2. Inspect logcat for FCM token | FCM Token is generated and registered with backend | ⏳ Ready |
| `TC-AUTH-04` | **WebSocket Handshake** | Token valid | 1. App reaches dashboard<br>2. Monitor socket listener | Socket connects to `api.fameu.in` and receives socket ID | ⏳ Ready |

---

### Module 2: Recruiter Dashboard & Metrics (`MOD-02`)

| Test ID | Test Scenario | Preconditions | Test Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-DASH-01` | **Live Production Ticker Bar** | On Dashboard | 1. Check top ticker card<br>2. Verify live audition count badge | Displays real-time live auditions count with "LIVE NOW" pill | ⏳ Ready |
| `TC-DASH-02` | **Quick Launch 3D Action Cards** | On Dashboard | 1. Verify `Post Audition`, `Find Talent`, `Applications`, `Messaging` cards | 4 Solid 3D action cards render with rich gradient badges & labels | ⏳ Ready |
| `TC-DASH-03` | **Overview KPI Stats Grid** | On Dashboard | 1. Inspect 4 metric cards (`Active Auditions`, `Pending Review`, `Shortlisted`, `Total Applicants`) | Numbers render dynamically from RTK Query with distinct icons | ⏳ Ready |
| `TC-DASH-04` | **Live Auditions Section** | On Dashboard | 1. Scroll to "Live Auditions (Today)"<br>2. Observe placeholder or active cards | Shows clean empty state or live card list with studio tags | ⏳ Ready |
| `TC-DASH-05` | **Active Auditions List & "View All"** | On Dashboard | 1. Tap "View All" on Active Auditions section | Navigates directly to "My Auditions" tab | ⏳ Ready |
| `TC-DASH-06` | **Recent Applicants Section** | On Dashboard | 1. Scroll to "Recent Applicants"<br>2. Tap "See All" | Navigates directly to "Applicants" tab | ⏳ Ready |

---

### Module 3: 4-Step Casting Call Creation Wizard (`MOD-03`)

| Test ID | Test Scenario | Preconditions | Test Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-WIZ-01` | **Wizard Launch & Step 1 Header** | On Dashboard | 1. Tap "Post Audition" action button | Opens 4-Step Wizard. Top timeline shows Step 1 active (25%), 4 3D node bubbles | ⏳ Ready |
| `TC-WIZ-02` | **Listing Type Selection** | On Step 1 | 1. Tap between `Audition`, `Job`, and `Casting Call` 3D cards | Card toggles active border, background glow, and checkmark badge | ⏳ Ready |
| `TC-WIZ-03` | **Category Modal with 3D Icons** | On Step 1 | 1. Tap "Primary Category"<br>2. Search category in modal<br>3. Tap item to select | Modal opens with 3D profession icons, Title Casing, and checkmark pill | ⏳ Ready |
| `TC-WIZ-04` | **Project Type Multi-Select Grid** | On Step 1 | 1. Tap `Web-series`, `Films`, `Ad films` | Solid SVG gradient tiles highlight with active selection rings | ⏳ Ready |
| `TC-WIZ-05` | **Step 1 Validation Guard** | On Step 1 | 1. Leave title blank<br>2. Tap "Continue to Step 2" | Toast error displays: "Please enter a Job / Audition Title" | ⏳ Ready |
| `TC-WIZ-06` | **Step 2 Role & Criteria Screen** | Step 1 valid | 1. Tap "Continue to Step 2"<br>2. Observe timeline | Progress bar advances to 50%, Step 1 shows green checkmark, Step 2 active | ⏳ Ready |
| `TC-WIZ-07` | **Role Description & Stepper Counter** | On Step 2 | 1. Enter character brief in textarea<br>2. Tap `[+]` on Open Positions | Open positions increment dynamically (e.g. 1 ➔ 2 ➔ 3) | ⏳ Ready |
| `TC-WIZ-08` | **Gender & Languages Badges** | On Step 2 | 1. Select `Female`<br>2. Multi-select `Hindi`, `English`, `Marathi` | Native script language badges toggle active state | ⏳ Ready |
| `TC-WIZ-09` | **Step 3 Budget Range & Validity** | Step 2 valid | 1. Tap "Continue to Step 3"<br>2. Enter Min (5000) & Max (25000)<br>3. Select `Per Day` | Dual budget fields format properly; Frequency tiles highlight | ⏳ Ready |
| `TC-WIZ-10` | **30-Day Auto Expiry Default** | On Step 3 | 1. Verify Job Validity card | Displays default "Automatically closes in 30 days" with calendar picker | ⏳ Ready |
| `TC-WIZ-11` | **Step 4 Logistics & Walk-in Venue** | Step 3 valid | 1. Tap "Continue to Step 4"<br>2. Select `Walk-in`<br>3. Enter Venue, Date, Time | Progress bar reaches 100%; Walk-in Venue card opens with date/time pickers | ⏳ Ready |
| `TC-WIZ-12` | **Final Submission & Broadcast** | Step 4 valid | 1. Tap "Broadcast Casting Call" / "Publish Audition" | Payload submits to backend, success toast shown, redirects to "My Auditions" | ⏳ Ready |

---

### Module 4: Audition Management & Lifecycle (`MOD-04`)

| Test ID | Test Scenario | Preconditions | Test Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-AUD-01` | **My Auditions Navigation** | App open | 1. Tap "My Auditions" tab on bottom bar | Displays all posted auditions with active filters | ⏳ Ready |
| `TC-AUD-02` | **Filter Tabs (All / Active / Closed)** | On My Auditions | 1. Tap `Active` pill<br>2. Tap `Closed` pill | List filters dynamically based on listing status | ⏳ Ready |
| `TC-AUD-03` | **Advanced Filters Modal** | On My Auditions | 1. Tap "Advanced Filters" bar | Filter sheet opens with City, Category, Date range controls | ⏳ Ready |
| `TC-AUD-04` | **Audition Card Data Display** | On My Auditions | 1. Inspect created audition card | Displays Title, Category, Budget range, Location, and Expiry badge | ⏳ Ready |
| `TC-AUD-05` | **Edit Audition Flow** | On My Auditions | 1. Tap "Edit" on an audition card | Opens 4-Step Wizard pre-populated with existing data in Edit Mode | ⏳ Ready |
| `TC-AUD-06` | **Close / Archive Audition** | On My Auditions | 1. Tap options menu ➔ "Close Audition" | Listing updates to `Closed` status and moves to Closed tab | ⏳ Ready |

---

### Module 5: Talent Discovery & Search/Filter (`MOD-05`)

| Test ID | Test Scenario | Preconditions | Test Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-DISC-01` | **Explore Talent Screen Launch** | On Dashboard | 1. Tap "Find Talent" 3D card | Navigates to Talent Discovery search interface | ⏳ Ready |
| `TC-DISC-02` | **Profession Category Filter Strip** | On Find Talent | 1. Tap through category pills (`Actor`, `Model`, `Dancer`, `Singer`) | Artist grid refreshes filtered by selected profession | ⏳ Ready |
| `TC-DISC-03` | **Talent Profile Card Rendering** | On Find Talent | 1. Inspect artist cards | Shows Headshot thumbnail, Name, Experience, City, Verified badge | ⏳ Ready |
| `TC-DISC-04` | **Artist Profile Detail View** | On Find Talent | 1. Tap on an artist card | Opens full Artist Profile with Showreels, Photo Gallery, and Physical Specs | ⏳ Ready |
| `TC-DISC-05` | **Bookmark / Shortlist Artist** | On Profile | 1. Tap star/bookmark icon on artist card | Artist added to recruiter's shortlisted talent collection | ⏳ Ready |
| `TC-DISC-06` | **Direct Invite to Audition** | On Profile | 1. Tap "Invite to Audition"<br>2. Select active audition | Direct invitation sent to artist's notification feed | ⏳ Ready |

---

### Module 6: Applicant Tracking System (ATS Pipeline) (`MOD-06`)

| Test ID | Test Scenario | Preconditions | Test Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-ATS-01` | **Applicants Screen Navigation** | App open | 1. Tap "Applicants" on bottom tab bar | Displays candidate submissions categorized by pipeline stage | ⏳ Ready |
| `TC-ATS-02` | **Pipeline Status Tabs** | On Applicants | 1. Tap between `All`, `Pending`, `Shortlisted`, `Rejected`, `Hired` | Tabs switch smoothly with indicator line and filtered counts | ⏳ Ready |
| `TC-ATS-03` | **Applicant Profile Review** | On Applicants | 1. Tap an applicant card | Displays submitted audition video, intro speech, photos, and applied role | ⏳ Ready |
| `TC-ATS-04` | **Shortlist Candidate Action** | On Applicant Card | 1. Tap "Shortlist" (Star button) | Applicant moves to `Shortlisted` stage; real-time push sent to talent | ⏳ Ready |
| `TC-ATS-05` | **Reject Candidate Action** | On Applicant Card | 1. Tap "Reject" button | Applicant status changes to `Rejected` | ⏳ Ready |
| `TC-ATS-06` | **Hire / Select Candidate Action** | On Applicant Card | 1. Tap "Hire Candidate" button | Applicant promoted to `Hired` stage; contract flow unlocked | ⏳ Ready |

---

### Module 7: Real-Time Messaging & Sockets (`MOD-07`)

| Test ID | Test Scenario | Preconditions | Test Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-MSG-01` | **Messages Tab Navigation** | App open | 1. Tap "Messages" tab on bottom bar | Loads conversation list with candidate thumbnails and unread badges | ⏳ Ready |
| `TC-MSG-02` | **Open Chat Thread** | On Messages | 1. Tap on an active candidate conversation | Chat screen opens with message history and candidate header | ⏳ Ready |
| `TC-MSG-03` | **Send Real-Time Message** | In Chat Thread | 1. Type message into input<br>2. Tap Send button | Message bubble appears instantly with timestamp; emitted via Socket.io | ⏳ Ready |
| `TC-MSG-04` | **Receive Real-Time Message** | In Chat Thread | 1. Receive incoming message event | New message appends dynamically without requiring page reload | ⏳ Ready |

---

### Module 8: Recruiter Profile & Settings (`MOD-08`)

| Test ID | Test Scenario | Preconditions | Test Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-PROF-01` | **Profile Screen Navigation** | App open | 1. Tap "Profile" tab on bottom bar | Displays Recruiter/Production House details and verification badge | ⏳ Ready |
| `TC-PROF-02` | **Company / Studio Info Display** | On Profile | 1. Verify Production House Name, Bio, Location, Website | Data rendered accurately from profile state | ⏳ Ready |
| `TC-PROF-03` | **Edit Profile Flow** | On Profile | 1. Tap "Edit Profile"<br>2. Update bio<br>3. Save | Profile updates successfully in database with success toast | ⏳ Ready |
| `TC-PROF-04` | **Logout Flow** | On Profile | 1. Tap "Logout"<br>2. Confirm dialog | Session cleared and navigated to Login Screen | ⏳ Ready |

---

## 🎯 4. Automation Execution Plan

```
Step 1: Execute MOD-01 (Auth & Connection Handshake) ──► Capture Screen
Step 2: Execute MOD-02 (Dashboard & Live Metrics)     ──► Capture Screen
Step 3: Execute MOD-03 (4-Step Wizard Steps 1-4)      ──► Capture 4 Screens
Step 4: Execute MOD-04 (My Auditions Management)      ──► Capture Screen
Step 5: Execute MOD-05 (Talent Discovery)             ──► Capture Screen
Step 6: Execute MOD-06 (Applicant Tracking Pipeline)  ──► Capture Screen
Step 7: Execute MOD-07 (Messaging & Conversations)    ──► Capture Screen
Step 8: Execute MOD-08 (Profile & Settings)           ──► Capture Screen
Step 9: Compile Comprehensive Test Execution Report with Live Screenshots
```
