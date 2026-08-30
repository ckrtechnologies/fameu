# FameU Platform: Dual-App Architecture & Client Presentation Guide

A comprehensive feature breakdown and live presentation script for presenting **FameU Artist App** and **FameU Hiring App** side-by-side on dual emulators.

---

## 1. Executive Platform Overview

**FameU** is a full-stack media entertainment talent marketplace connecting performers (actors, models, dancers, crew) with verified casting directors, production houses, and advertising agencies.

```mermaid
flowchart LR
    A["🎬 Hiring Agency App (Emulator 2)"] <--> B["⚡ FameU Cloud Engine & Admin Panel"]
    B <--> C["🎭 Artist App (Emulator 1)"]
```

---

## 2. Side-by-Side Dual-App Feature Matrix

| Functional Module | 🎭 Artist App (Emulator 1) | 🎬 Hiring / Agency App (Emulator 2) | Client Business Value |
| :--- | :--- | :--- | :--- |
| **1. Authentication & Onboarding** | • Mobile OTP Authentication<br>• Talent Profile Setup (Physical stats, Headshots, Union IDs) | • Mobile OTP Authentication<br>• Company Setup + **Mandatory KYC Verification** (PAN, GST, DL, Selfie) | Protects artists from scam agencies by strictly enforcing verified corporate identity. |
| **2. Talent & Brand Showcase** | **Digital Talent Passport**:<br>• High-res Comp Cards & Headshots<br>• Showreels & Audio Samples<br>• Physical Stats (Height, Eye/Hair color, Body type)<br>• 80+ Profession Tags & 13+ Languages | **Production Brand Hub**:<br>• Production House Bio & Website<br>• Past Film/TV/OTT Credits<br>• Verified Recruiter Badges<br>• Corporate Office Location | Artists get a unified, professional casting profile; Agencies verify credibility before interviewing. |
| **3. Casting & Audition System** | **Audition Discovery Feed**:<br>• Multi-parameter search (Films, OTT, TV, Ads)<br>• Filter by City, Role, Age, Gender, Paid/TFP<br>• Filter by Mode (Walk-In, Scheduled, Online)<br>• Bookmark & Deadline Alerts | **Casting Publisher Suite**:<br>• 16 Project Types (Feature Films, Web Series, Commercials, etc.)<br>• Compensation Setup (Per Day, Month, Lump Sum, TFP)<br>• Venue Map Pins (Walk-in) & Slot Timing<br>• Script / Sides PDF Attachment | Replaces fragmented, unorganized WhatsApp groups and Instagram DMs with structured casting notices. |
| **4. Application Workflow** | **1-Click Audition Submissions**:<br>• Tailored pitch notes & monologues<br>• Select role-specific showreel clip<br>• Custom casting questionnaires | **Casting ATS (Applicant Tracking System)**:<br>• Centralized candidate submission inbox<br>• Multi-card grid of headshots & showreels<br>• Fast candidate comparison | Eliminates lost emails and cluttered spreadsheets with a specialized entertainment ATS. |
| **5. Application Lifecycle Tracking** | **Live Pipeline Tracker**:<br>• `Applied` $\to$ `Under Review` $\to$ `Shortlisted` $\to$ `Selected` / `Rejected`<br>• Real-time push notifications on status changes | **Pipeline Decision Engine**:<br>• 1-Tap status actions (`Shortlist`, `Select`, `Reject`)<br>• Bulk status updating<br>• Automated candidate messaging | Completely eliminates candidate ghosting and automates production updates. |
| **6. Active Talent Hunt (Headhunting)** | **Passive Discovery**:<br>• Artists receive private casting invites directly from verified producers without public postings. | **Direct Talent Sourcing**:<br>• Search entire artist database<br>• Granular filters: Age, Height, Skills, Language, City<br>• Send 1-tap Direct Audition Invitations | Producers can urgently headhunt lead actors or specialized performers for time-sensitive shoots. |
| **7. Fast Contact & Audition Logistics** | • In-app Real-time Chat<br>• Downloadable Audition Call Letters<br>• Venue Google Maps Navigation<br>• Attached Script Sides & Reference Lookbooks | • **Fast Contact Action Bar**:<br>&nbsp;&nbsp;📱 Direct WhatsApp Trigger<br>&nbsp;&nbsp;📞 Direct Phone Call<br>&nbsp;&nbsp;✉️ Official Email<br>&nbsp;&nbsp;💬 In-App Chat | Closes communication lag between casting directors and shortlisted talent. |
| **8. Platform Trust & Compliance** | • Verified Agency Badge Inspection<br>• Anti-Scam / Fraud Reporting System<br>• Block suspicious casting accounts | • Compliance & KYC clearance check<br>• Privacy-guarded talent contact access<br>• Strict terms adherence | Establishes a trusted, professional environment for the Indian entertainment ecosystem. |

---

## 3. Step-by-Step Live 2-Emulator Demonstration Script

Follow this sequence during client demos to showcase real-time platform synergy:

```
[Screen Left: Emulator 1 - Artist App]        [Screen Right: Emulator 2 - Hiring App]
```

| Step | 🎬 Hiring App Action (Right Screen) | 🎭 Artist App Reaction (Left Screen) | Presentation Talking Point |
| :---: | :--- | :--- | :--- |
| **Step 1: Post Casting Call** | Open **Post New Audition** &rarr; Select *Feature Film* &rarr; Set Budget *₹15,000/day* &rarr; Tap **Post Audition**. | Open **Auditions Feed** and pull to refresh. The new audition appears immediately with live tags. | *"Notice the zero-latency sync. As soon as a casting director publishes a call, talent across the target city receives the notice instantly."* |
| **Step 2: Submit Audition** | Stay on the **Hiring Dashboard**. | Open the audition details &rarr; Select monologue reel &rarr; Tap **Submit Application**. | *"Artists don't need to format resumes or email attachments. They apply in 3 seconds using their pre-verified Digital Talent Passport."* |
| **Step 3: ATS Review** | Navigate to **Applications** tab. The candidate's card appears in the inbox. | Artist sees application badge change to **"Submitted"**. | *"The hiring team gets an organized Applicant Tracking System (ATS) where showreels, headshots, and measurements are instantly visible."* |
| **Step 4: Shortlist & Connect** | Tap **"Shortlist"** &rarr; Tap the **WhatsApp** or **In-App Chat** icon. | Artist instantly receives a **"Shortlisted!"** push notification and status update in their tracker. | *"Both parties have full visibility. Status changes trigger automated notifications, and casting directors can initiate direct WhatsApp/call contact with one tap."* |
| **Step 5: Direct Talent Sourcing** | Open **Find Talent** &rarr; Filter by *"Dancer in Mumbai"* &rarr; Tap on artist profile. | The artist's full comp card, video reels, and language fluencies open seamlessly. | *"Agencies are not limited to posting auditions—they can proactively headhunt specific talent from our database."* |

---

## 4. Key Highlights & Differentiators

* **Rich Solid Visual Design**: Custom 3D vector SVG icons across all 16 project types, audition modes, compensations, and 13 language script badges (Hindi, English, Marathi, Bengali, Telugu, Tamil, Kannada, Malayalam, Gujarati, Punjabi, Urdu, Bhojpuri).
* **Enterprise KYC Verification**: Multi-document identity verification protecting both sides of the marketplace.
* **Production-Ready ATS**: Eliminates manual spreadsheets and unorganized messaging groups for film and TV casting crews.
