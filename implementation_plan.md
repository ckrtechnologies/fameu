# FilmApp Implementation Plan & Domain-Driven Strategy

Given the large scale of this two-sided platform, we will adopt a **Domain-Driven Design (DDD)** within a Monorepo architecture. This ensures extreme scalability and prevents code from becoming spaghetti as the team and feature set grow. 

Instead of a single "mobile" folder, we will split the apps distinctly to reduce bundle sizes and improve performance:
1. `backend` (Express.js)
2. `artist_app` (React Native CLI)
3. `hiring_app` (React Native CLI)
4. `admin_panel` (React + Vite)
5. `website` (React + Vite - Landing page)

---

## The Domain-Driven Folder Structure

```text
/fameu_monorepo
├── /backend (Express.js)
│   └── /src
│       ├── /core          (DB config, shared middleware, CDN/Storage config, logger)
│       └── /domains       (Each domain contains its own routes, controller, service, and tests)
│           ├── /auth
│           ├── /artist
│           ├── /hiring
│           ├── /audition
│           ├── /payment
│           └── /admin
│
├── /artist_app (React Native CLI)
│   └── /src
│       ├── /core          (Navigation, API Client, Redux Store, Theme)
│       ├── /shared        (Reusable UI: Buttons, Cards, Inputs)
│       └── /domains
│           ├── /auth
│           ├── /profile   (Portfolio, Resume, Categories)
│           ├── /discover  (Map walk-ins, feed)
│           └── /applications
│
├── /hiring_app (React Native CLI)
│   └── /src
│       ├── /core
│       ├── /shared
│       └── /domains
│           ├── /auth
│           ├── /company   (KYC, Credits)
│           ├── /auditions (Posting, Editing)
│           └── /applicants(ATS, Shortlisting)
│
├── /admin_panel (React + Vite)
│   └── /src/domains       (Users, KYC, Fraud, Analytics, CMS)
│
└── /website (React + Vite)
    └── /src/domains       (Landing, About, Terms, Contact)
```

---

## Phased Execution Strategy

### Phase 1: Monorepo Foundation & Core Auth Domain
**Goal:** Establish the architecture and secure user entry points across all platforms.
1. **Initialize Monorepo:** Scaffold the 5 projects (`backend`, `artist_app`, `hiring_app`, `admin_panel`, `website`) using their respective CLIs.
2. **Backend Core:** Setup Express, database connection to Supabase, Error Handling middleware, and the Local CDN upload logic in `backend/src/core`.
3. **Auth Domain (Backend):** 
   - Build `/auth` domain to handle MSG91 OTP logic and Supabase SSO token verification.
4. **Auth Domain (Frontend):** 
   - Setup Redux stores and API clients in both `artist_app` and `hiring_app`.
   - Build the login/OTP screens for both apps.

### Phase 2: Profiles & KYC Domain
**Goal:** Allow users to build their identities and get verified.
1. **Backend:** 
   - Build `/artist` domain (handling the 5 categories and portfolio local CDN uploads).
   - Build `/hiring` domain (handling company data and KYC document uploads).
2. **Mobile Apps:** 
   - Build the Profile creation flow and Media upload components in the `artist_app`.
   - Build the Company verification screens in the `hiring_app`.
3. **Admin Panel:**
   - Scaffold the Admin React app.
   - Build the KYC Verification Queue to approve/reject agencies.

### Phase 3: The Engine Domain (Auditions & ATS)
**Goal:** The core marketplace functionality—connecting jobs with talent.
1. **Backend:** 
   - Build `/audition` domain (posting, applying, geospatial `lat/lng` queries, shortlisting).
2. **Hiring App:**
   - Build the Audition Creation flow.
   - Build the Applicant Tracking System (ATS) to view artists, shortlist, and schedule interviews.
3. **Artist App:**
   - Build the Discovery feed and Google Maps walk-in interface.
   - Build the Application flow.

### Phase 4: Social, Notifications & Admin Domains
**Goal:** Drive retention and build moderation tools.
1. **Backend:** 
   - Add Socket.io to `backend/src/core` for realtime chat.
   - Build the `/notifications` domain utilizing Firebase Admin.
2. **Mobile Apps:**
   - Implement real-time 1-to-1 messaging between Artists and Casting Directors.
   - Configure push notification receivers.
3. **Admin Panel & Website:**
   - Finish Admin domains: Fraud reports, User Blacklisting, Analytics.
   - Build the public `website` landing page for SEO and app-store links.

### Phase 5: Payments Domain & Production
**Goal:** Monetization and Deployment.
1. **Payments Domain:** Integrate Cashfree webhooks into the backend `/payment` domain. Build the credit purchase UI in `hiring_app`.
2. **Deployment:** Setup NGINX, PM2, and PM2 logs for the backend. Configure Vercel/Netlify for the web apps, and prepare Fastlane/EAS for the mobile builds.

---

## User Review Required
> [!IMPORTANT]
> A Domain-Driven Design (DDD) is excellent for scaling, as each feature acts as a self-contained module. Separating the `artist` and `hiring` apps into two React Native projects will also keep the app size small for users.
> 
> Please review this new structure and phased approach. If you approve, we will begin executing **Phase 1**!
