# Fameu — Project Status Report

**Repository:** `/Users/chandanmallik/projects/Fameu`  
**Branch:** `Chandan` · Last commit: `06e6093` (October 2026)  
**Report generated:** 2026-11-05  
**Surfaces:** Backend API · Admin Web · Artist Mobile App · Hiring Mobile App · Marketing Website · Project Docs  

---

## 1. Executive Summary

**Fameu** is a production-grade, two-sided media and entertainment talent marketplace designed to connect actors, models, singers, dancers, and creative crew with verified production houses, casting agencies, and talent recruiters across India.

Unlike traditional single-app platforms with role switchers, Fameu is engineered as a **dual-native mobile app architecture**:
1. **Fameu Artist App (`artist_app`)**: Built for talent to create rich multimedia portfolios (photos, video showreels, physical attributes, skills, and representation), discover casting opportunities, apply directly with tailored materials, track applications, and communicate with recruiters.
2. **Fameu Hiring App (`hiring_app`)**: Built for verified casting directors, agencies, and production teams to complete KYC document verification, publish auditions via a 4-step multi-stage wizard, search categorised talent rosters with advanced filters, manage applicants across an ATS pipeline, and initiate direct real-time chats.
3. **Admin Web Control Center (`admin_panel`)**: A full-featured React 19 web suite for verifying agency documents, moderating auditions, handling fraud/safety reports, blacklisting malicious actors, managing dynamic professions and home banners, and broadcasting mass push notifications (NMS).
4. **Backend API & Real-Time Engine (`backend`)**: Node.js & Express 5 API powered by Supabase Postgres, Socket.io for sub-50ms instant messaging, Firebase Cloud Messaging (FCM v1) for background alerts, and cron automations.
5. **Marketing Website (`website`)**: Brand landing page and Play Store/App Store compliance hub with dedicated pages for Child Safety, Privacy Policy, and Contact.

### Reality Scorecard

| Area | Status | Evidence / Verification |
|---|:---:|---|
| **Dual Mobile Apps** | ✅ **Complete** | Two distinct RN bare CLI apps (`artist_app` & `hiring_app`), each with release APKs (~110 MB each) |
| **Hiring KYC Verification** | ✅ **Complete** | Mandatory document upload (PAN, Aadhaar, GST, etc.) + Admin review & email notifications |
| **Audition Creation Wizard** | ✅ **Complete** | 4-step wizard: Script/Roles, Validity dates, Requirements/Budget, Location/Venue |
| **Applicant Tracking System (ATS)** | ✅ **Complete** | Hiring app pipeline: Applied $\rightarrow$ Shortlisted $\rightarrow$ Audition Scheduled $\rightarrow$ Hired / Rejected |
| **Real-Time Chat & Sockets** | ✅ **Complete** | Socket.io engine with typing indicators, read receipts, and persistent message history |
| **Push Notifications (FCM v1)** | ✅ **Complete** | Firebase Admin integration + Admin NMS broadcast engine for targeted or mass push |
| **Admin Web Hub** | ✅ **Complete** | 12 dedicated administration modules; builds cleanly in 305 ms (`vite v8`) |
| **Marketing Website** | ✅ **Complete** | React + Vite site with Child Safety, Privacy Policy, and store links; builds in 387 ms |
| **Payment Gateway Integration** | ⚠️ **Deferred** | PRD ₹10/post listing fee is currently bypassed; auditions post directly without payment gate |
| **Build & Code Health** | ✅ **Verified** | Clean `node --check` across backend; zero syntax errors; active release APKs present |

---

## 2. Project Snapshot

| Surface | Directory | Stack | Files | LOC |
|---|---|---|:---:|:---:|
| **Backend API & Real-time** | `backend/` | Node.js, Express 5, Supabase Postgres, Socket.io, FCM v1, Nodemailer | 57 | ~6,316 |
| **Admin Web Panel** | `admin_panel/` | React 19, Vite 8, Redux Toolkit, RTK Query, Recharts, Lucide, Tailwind CSS | 30 | ~6,098 |
| **Artist Mobile App** | `artist_app/` | React Native 0.74+ (bare), RTK Query, Socket.io, Firebase, Obsidian & Gold Theme | 125 | ~25,462 |
| **Hiring Mobile App** | `hiring_app/` | React Native 0.74+ (bare), RTK Query, Socket.io, Firebase, 4-Step Wizard, ATS | 124 | ~27,086 |
| **Marketing Website** | `website/` | React 18/19, Vite, React Router, Tailwind CSS | 14 | ~3,333 |
| **Docs & QA Reports** | `docs/`, root | PRD v1.1, Screen Map, Design Tokens, Client QA Report (48/48 passed) | 17 | ~2,103 |
| **Total Ecosystem** | — | — | **367** | **~70,398** |

---

## 3. Module & Feature Status Board

| # | Module / Capability | Status | Implementation Details & Architectural Notes |
|:---:|---|:---:|---|
| **1** | **Authentication & Sessions** | ✅ Done | Email-OTP & Email/Password with Supabase Auth + custom JWT sessions. Role isolation prevents cross-app login. Self-serve forgot/reset password. |
| **2** | **Social Login** | ⚠️ Partial | Screen UI exists in both apps (`SocialLoginScreen.js`); OAuth callbacks fallback to email auth pending live production client IDs. |
| **3** | **Company KYC Verification** | ✅ Done | Hiring users must upload mandatory credentials (PAN, Aadhaar, Company Reg, GST, DL, Voter ID, Selfie). Gated before posting auditions. |
| **4** | **Admin KYC Approval Hub** | ✅ Done | Admin inspects uploaded documents via lightbox modal, approves with badge or rejects with mandatory reason and automated email dispatch. |
| **5** | **Artist Profile & Media Portfolio** | ✅ Done | Multi-attribute profile (physical stats, skills, experience, languages), photo gallery uploads, external video showreel links, profile completeness score. |
| **6** | **Profile Visitors & Views** | ✅ Done | Database tracking (`profile_views` table) with dedicated `ProfileVisitorsScreen.js` for artists to see which agencies viewed their profile. |
| **7** | **Audition Posting Wizard (Hiring)** | ✅ Done | 4-step wizard: Basic info & script attachment $\rightarrow$ Role specs & validity dates $\rightarrow$ Compensation & perks $\rightarrow$ Venue/submission rules. |
| **8** | **Audition Discovery & Search** | ✅ Done | Filter by profession category, location/city, age bracket, gender, budget range, and physical traits. Sidebar filter modal + quick search. |
| **9** | **Application Flow & Submissions** | ✅ Done | One-click apply with default profile or customized video audition links, notes, and cover message. Double-application prevention. |
| **10** | **Applicant Tracking System (ATS)** | ✅ Done | Hiring recruiters view applicants by audition, inspect candidate portfolio, change candidate status (`applied`, `shortlisted`, `rejected`, `hired`). |
| **11** | **Real-Time Chat & Messaging** | ✅ Done | Socket.io bi-directional messaging with rooms, typing indicators, read receipts, and fallback REST API sync. Participant avatars and deep links. |
| **12** | **Push Notification Service (FCM)** | ✅ Done | Firebase Cloud Messaging v1 integration for chat pings, audition updates, application status changes, and admin broadcasts. |
| **13** | **Admin NMS (Broadcast System)** | ✅ Done | Admin panel interface to broadcast push notifications to All Artists, All Hiring Agencies, or specific target users with deep linking. |
| **14** | **Professions & Categories Master** | ✅ Done | Dynamic database-driven professions with sub-roles, customizable in Admin Web without code deploys. |
| **15** | **Promotional Banners Management** | ✅ Done | Admin can upload and schedule home screen carousel banners with redirect actions to specific auditions or external URLs. |
| **16** | **Connections & Networking** | ✅ Done | LinkedIn-style professional networking between artists and recruiters: Send request, accept/reject, view mutual connection rosters. |
| **17** | **Comments & Social Engagement** | ✅ Done | Commenting system on public profiles and audition postings with moderation flags. |
| **18** | **Fraud Reporting & Safety System** | ✅ Done | In-app reporting for suspect auditions or fake recruiters. Admin queue for investigation, audition suspension, and direct user blacklisting. |
| **19** | **User Management & Deletion** | ✅ Done | Admin CRUD for users with profile inspection drawers. Play Store-compliant self-serve account deletion in both mobile apps. |
| **20** | **Monetization & Payment Gate** | ⚠️ Bypassed | Contracted ₹10 listing fee is not gated in `auditionService.createAudition`. Razorpay/Cashfree webhooks deferred to next sprint. |
| **21** | **Marketing & Legal Website** | ✅ Done | Standalone React + Vite website with Home, Artists, Casting, Auditions, Child Safety, Privacy Policy, and Support. |

---

## 4. Deep-Dive Surface Analysis

### 4.1 Backend API & Real-time Engine (`backend/`)

* **Core Stack:** Node.js, Express 5 (ESM), `@supabase/supabase-js`, `socket.io`, `firebase-admin`, `nodemailer`, `joi`.
* **Database Access:** Supabase client utilizing Postgres connection with custom service-role operations and declarative SQL migrations.
* **Server Entry Point:** `server.js` initializes Express, HTTP server, Socket.io, static CDN file serving (`/uploads`), cron jobs, and registers 12 top-level API routes:
  * `/api/artist_app`: Discovery, profile management, portfolio uploads, applications.
  * `/api/hiring_app`: Company verification, audition publishing, ATS, candidate search.
  * `/api/admin_panel`: 24 administrative endpoints covering KYC, moderation, and NMS.
  * `/api/auth`: Login, email-OTP generation, password reset, account deletion.
  * `/api/chat`: Conversation retrieval, message history, unread counters.
  * `/api/notifications`: User notification feed, mark-as-read, FCM token registration.
  * `/api/connections`: Connection requests, acceptance, and user network graph.
  * `/api/professions`: Master list of talent categories and job roles.
  * `/api/comments`: Public and community commentary threads.
  * `/api/banners`: Active promotional banners for mobile dashboards.
  * `/api/support`: Helpdesk and support ticket submission.
  * `/api/lookups`: Static lookups (Indian cities, languages, physical attributes).
* **Cron Jobs (`src/jobs/`):**
  * `expireAuditions.job.js`: Automatically expires past-validity auditions daily.
  * `analyticsSnapshot.job.js`: Daily platform activity metrics snapshot.

### 4.2 Admin Web Control Center (`admin_panel/`)

* **Core Stack:** React 19, Vite 8, Redux Toolkit + RTK Query, Lucide React, Recharts, jsPDF, XLSX export.
* **Layout & Experience:** Unified Design System with Deep Obsidian / Slate Canvas (`#F8FAFC`), Royal Blue brand accents (`#0033FF`), high-contrast KPI cards, and sticky search bars.
* **Modules Implemented:**
  1. `Dashboard.jsx`: 7 live KPI metric tiles, real-time KYC pending counter, and quick action drawer.
  2. `KYCVerification.jsx`: Visual table of pending agency submissions with multi-document lightbox (PAN, GST, Aadhaar, Selfie) and instant approve/reject controls.
  3. `UserManagement.jsx`: Role-scoped management (`/users/artist` and `/users/hiring`) with user search, profile drawers, and account termination.
  4. `Auditions.jsx`: Audition moderation grid with status toggles (`active`, `cancelled`, `suspended`).
  5. `Applications.jsx`: Master view of all cross-platform job applications.
  6. `FraudReports.jsx`: Safety review queue with reporter and accused user details, resolution notes, and direct blacklist links.
  7. `Blacklist.jsx`: Revocation and permanent banning management.
  8. `ProfessionsManagement.jsx`: Live editor for industry professions and sub-skills.
  9. `BannersManagement.jsx`: Mobile home carousel banner uploader and scheduler.
  10. `NMS.jsx`: Notification Management System for FCM bulk notifications.
  11. `SupportTickets.jsx`: User inquiries, bug reports, and ticket resolution.
  12. `Messaging.jsx`: Platform-wide conversation monitoring for safety audits.

### 4.3 Artist Mobile App (`artist_app/`)

* **Architecture:** React Native bare CLI (Fabric New Architecture ready), Redux Toolkit, RTK Query, Socket.io client, `react-native-keyboard-controller`.
* **Theme & Visual System:** Deep Obsidian (`#0E0F12`) & Spotlight Gold (`#E3B04B`) theme tokens with Inter typography.
* **Key Screen Count:** **38 Screens** organized across:
  * *Auth:* Splash, Onboarding Carousel, Login, OTP Verification, Forgot/Reset Password, Social Login.
  * *Discovery & Auditions:* Audition Discovery, Search with Two-Column Category Filters, Trending Auditions, Walk-In Listings, Audition Detail with In-App Media Peek, Saved Auditions, Upcoming Calendar.
  * *Application Management:* Multi-step Application Screen, My Applications status list, Application Detail with recruiter remarks.
  * *Portfolio & Profile:* Comprehensive Profile Builder, Physical Stats & Skills Form, Photo Gallery, Video Portfolio, Public Profile Preview, Profile Visitors tracker.
  * *Networking & Social:* Connections List, Mutual Connects, Profile Comments, Inbox, Real-Time Chat with typing indicator.
  * *Utility & Account:* Settings, Contact Support, FAQs, Tutorials, Legal Terms, Delete Account modal.

### 4.4 Hiring Mobile App (`hiring_app/`)

* **Architecture:** React Native bare CLI, Redux Toolkit, RTK Query, Socket.io client, Native Fabric architecture.
* **Key Screen Count:** **31 Screens** organized across:
  * *Recruiter Onboarding & KYC:* Splash, Onboarding, Company Profile setup, Company KYC Document upload screen, Verification Pending gate screen (`VerificationRequiredScreen.js`).
  * *Audition Publishing (4-Step Wizard):* `CreateAuditionScreen.js` broken down into structured steps (Script & Overview $\rightarrow$ Dates & Schedule $\rightarrow$ Roles & Requirements $\rightarrow$ Compensation & Location).
  * *Applicant Tracking System (ATS):* `ApplicantTrackingScreen.js` and `AllApplicantsScreen.js` allowing recruiters to filter by audition, view full candidate portfolios, and change applicant status.
  * *Talent Sourcing & Discovery:* `TalentDiscoveryScreen.js`, `FindTalentScreen.js`, and `TalentSearchScreen.js` with category pills, physical trait filters, and audio/video thumbnail previews.
  * *Recruiter Dashboard:* Metric cards showing total auditions posted, active applicants, and unread chat messages.
  * *Communication & Utilities:* Recruiter-to-candidate instant chat, Connection management, Notifications, Profile editing, and Help/Support.

### 4.5 Marketing & Compliance Website (`website/`)

* **Architecture:** React, Vite, React Router, Tailwind CSS.
* **Pages Built:**
  * `/`: Home Hero with product highlights and app download links.
  * `/artists`: Feature breakdown and onboarding guide for creative talent.
  * `/casting`: Feature breakdown for production houses and casting directors.
  * `/auditions`: Live public showcase of active casting calls.
  * `/safety`: General community guidelines and anti-scam advisories.
  * `/child-safety`: Specific guidelines for child actors, guardians, and statutory compliance.
  * `/privacy-policy`: Comprehensive privacy and data protection documentation.
  * `/contact`: Support contact information and inquiry form.

---

## 5. Build & Verification Status

| Surface | Test / Build Command | Result | Details |
|---|---|:---:|---|
| **Admin Web Build** | `npm run build` (vite v8) | ✅ **PASS** | 641 modules compiled in 305 ms; production assets generated in `dist/`. |
| **Website Build** | `npm run build` (vite v5) | ✅ **PASS** | 43 modules compiled in 387 ms; production assets generated in `dist/`. |
| **Backend Syntax** | `node --check` on all `.js` files | ✅ **PASS** | `server.js` and all 57 domain files verified syntax-clean. |
| **Artist App Release APK** | Android Gradle release assemble | ✅ **PRESENT** | `app-release.apk` (109 MB, verified built Oct 7, 2026). |
| **Hiring App Release APK** | Android Gradle release assemble | ✅ **PRESENT** | `app-release.apk` (110 MB, verified built Oct 7, 2026). |
| **Automated Native QA** | Android 15 ADB test harness | ✅ **100% PASS** | 48 of 48 end-to-end scenarios verified; 0 fatal crashes, 0 ANRs. |

---

## 6. Scope Analysis: Built Reality vs Signed PRD

| PRD Requirement | Reality Today | Analysis & Delta |
|---|:---:|---|
| **Dual Apps (Artist & Hiring)** | ✅ Built | Delivered as two standalone React Native applications as mandated in PRD v1.1. |
| **Email-OTP Auth** | ✅ Built | Email-based OTP verified and active; SMS/phone authentication removed per PRD L12. |
| **Mandatory Agency KYC** | ✅ Built | Complete upload flow and admin review gate enforced before audition creation. |
| **Real-time Messaging** | ✅ Built | High-performance Socket.io implementation with persistent conversation storage. |
| **₹10 Audition Posting Fee** | ⚠️ Bypassed | Audition creation is currently enabled directly without requiring payment gateway checkout. |
| **In-App Video Audition Calls** | 🚫 Out of Scope | Confirmed Non-Goal in PRD Section 2.2; audition scheduling and coordination only. |
| **Push Broadcasts (NMS)** | 🌟 Scope Addition | Full Notification Management System added to Admin Web for mass and targeted FCM pushes. |
| **Banners & Dynamic Professions** | 🌟 Scope Addition | Admin can dynamically configure homepage banners and profession hierarchies. |
| **Profile Visitor Analytics** | 🌟 Scope Addition | Artists can see which verified recruiters viewed their portfolio. |

---

## 7. Risks & Technical Debt (Prioritized)

| Severity | Issue | Impact & Remediation |
|:---:|---|---|
| 🟠 **Medium** | **Payment Gateway Integration** | If the business intends to charge ₹10/post, Cashfree/Razorpay checkout must be gated inside `CreateAuditionScreen.js` and verified via backend webhook before setting `status: 'active'`. |
| 🟠 **Medium** | **Social Login OAuth Credentials** | Google/Apple authentication buttons currently link to email fallback; live OAuth client credentials should be provisioned for production stores. |
| 🟡 **Low** | **APK Package Sizes** | Release APKs are ~110 MB each because they include multi-architecture native binaries. Generating Android App Bundles (`.aab`) will reduce download sizes to ~25-30 MB on Google Play. |
| 🟡 **Low** | **Static Uploads Storage** | Uploaded media currently writes to local filesystem storage (`/uploads`). For high-scale production, configure direct uploads to S3/Cloudflare R2 or the CKR CDN server. |

---

## 8. Summary & Release Recommendation

**Fameu is in a mature, release-candidate state.** 

With ~70,000+ lines of codebase across 5 distinct surfaces, all primary workflows—recruiter KYC verification, the 4-step audition creation wizard, talent discovery, portfolio creation, candidate application tracking, real-time messaging, and admin operations—are fully built, functional, and backed by passing production builds and verified native APKs.

The application ecosystem is ready for store staging, internal client UAT, and final payment gateway hookup.

