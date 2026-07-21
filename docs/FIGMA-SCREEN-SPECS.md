# FAMEU — Figma Screen Layout Specs (all 79 screens)

> For the designer, **after** the component library (`FIGMA-COMPONENT-SHEET.md`) is built. Each screen below is an **assembly list**: which components stack, in what order, top to bottom. You are not designing layouts here — you're placing pre-built components on 390×844 frames. Every screen = Header → Content (auto-layout, 16px side padding) → optional sticky footer CTA.
>
> IDs match `SCREEN-MAP.md` v1.1. Three Figma pages: **① Artist App**, **② Hiring App**, **③ Admin (web)**. Build the ~8 hero screens first (marked ⭐) for the client "look" approval, then the rest for "flow".
>
> Every data screen must include its **4 states** as separate frames or component-swap variants: loading (skeleton), empty, error, offline. Don't skip — they're in the library, just place them.

---

# ① ARTIST APP (35 screens)

## Auth stack (AA-0 … AA-7)

- **AA-0 Splash** — centered FAMEU logo on `background`, gold logo reveal. No spinner.
- **AA-1 Onboarding** — 3 horizontal slides: illustration + `display` headline + `body` line; page dots; "Skip" ghost top-right; "Get started" primary (lg, full) on last slide. Ends at AA-2.
- **AA-2 Register (Email)** — Header "Create account". Inputs: email, password (eye). Primary "Send code" (lg, full). Ghost "I already have an account" → AA-5. Below: "or" divider + social buttons (AA-4).
- **AA-3 Email OTP** — Header "Check your email". `caption` "We sent a code to {email}" + edit-email link. otp-box input (6). Resend timer (30s) as `caption`. Primary "Verify". → A-1 on success.
- **AA-4 Social Login** — Google + Facebook buttons (secondary), fallback ghost "Use email instead".
- **AA-5 Login** — email, password inputs. "Forgot password?" ghost link → AA-6. Primary "Log in".
- **AA-6 Forgot Password** — email input + `caption` explainer. Primary "Send reset code".
- **AA-7 Reset Password** — otp-box + new password + confirm. Primary "Reset password".

## Onboarding into profile

- **A-1 Category Selection ⭐** — Header "What do you do?". Grid of 16 category chips/cards (2-col), each with an icon + `overline` label (Actor, Singer, Model, Dancer, Voice Artist, Musician, Influencer, Anchor, Writer, Director, Editor, Cinematographer, Makeup Artist, Stylist, Technician, Background Artist). Tap → routes to matching form. Selected chip state.
- **A-2 Actor Registration ⭐** — Modal (X). Scroll form, fields grouped in sections with `overline` headers: **Basics** (Full name, Age, Gender select, Height, Weight, Body type, Skin tone, Hair colour, Eye colour), **Skills** (Languages known multi-chip, Acting experience), **Media** (Portfolio upload, Intro video upload, Monologue upload — each an upload row w/ progress), **Links & availability** (Social links, Current city, Travel availability switch). Sticky footer primary "Save profile". Field gap 16, section gap 24.
- **A-3 Singer Registration** — same form pattern: Singing genre, Vocal range, Languages (chips), Audio upload, Performance video upload, Instruments (chips), Singing experience.
- **A-4 Model Registration** — Height, Weight, Measurements, Shoe size, Portfolio photos (photo grid uploader), Ramp experience, Brand collaboration history.
- **A-5 Dancer Registration** — Dance styles (chips), Training details, Performance videos, Competition history, Certifications (upload rows).
- **A-6 Technician Registration** — Sub-category select (Video Editor, Cinematographer, Makeup Artist, Fashion Stylist, Script Writer, Director, Assistant Director, Photographer, VFX Artist, Sound Engineer) → then Experience, Resume upload, Equipment info, Work portfolio upload.

## Main app

- **A-7 Home / Dashboard ⭐** — Large-title header "Home" + bell (A-23). Content: profile-completion card (progress bar, if <100%) → section "Nearby auditions" `h2` + horizontal audition cards → "Recommended" → "Trending" `h2` + vertical audition cards. Pull-to-refresh. States: skeleton = card skeletons; empty = "No auditions near you yet → Expand area".
- **A-8 Artist Profile (public) ⭐** — Header w/ share icon. Hero: 1:1 photo + name `h1` + category `overline` tags + verified badge (if verified). Intro video player (16:9). Sections: Skills, Experience timeline (list rows), Photo gallery preview (grid, → A-10), "Edit profile" primary → A-9.
- **A-9 Edit Profile** — Modal. Same field pattern as registration, pre-filled. Media replace rows. Sticky "Save changes".
- **A-10 Photo Gallery** — Header. 2-col photo grid (1:1), each with delete affordance; "Add photos" tile. Empty = "No photos yet".
- **A-11 Video Portfolio** — List of video items (16:9 poster + play + label intro/monologue/performance). Add button.
- **A-12 Resume Upload** — Upload row + PDF preview thumbnail + replace. Empty = "No resume uploaded".
- **A-13 Verification (Artist)** — Header "Get verified (optional)". `caption` explainer. ID-type select + upload row + selfie capture row. Primary "Submit for review". Status badge (pending/approved/rejected) when applicable.
- **A-14 Audition Discovery ⭐** — Large-title "Auditions" + filter icon (→ A-15 sheet) + list/map toggle segmented control. List = vertical audition cards. Map = map view with pins + a bottom peek card. States: skeleton cards; empty "No auditions match → Clear filters"; offline banner.
- **A-15 Search & Filter** — Bottom sheet. Multi-select chip groups: Category, City, Language, Role type, Gender criteria; date-range row. "Apply filters" primary + "Clear" ghost.
- **A-16 Trending Auditions** — Header. Vertical audition cards ranked. 
- **A-17 Upcoming Calendar** — Calendar strip/month view; days with applied/saved auditions marked; list below for the selected day.
- **A-18 Walk-In Listings** — Header. Audition cards filtered to walk-in, each with distance + date emphasized.
- **A-19 Audition Detail ⭐** — Header w/ report icon (→ report sheet). Content: poster 16:9 → title `h1` → company row + verified badge → chips (category, role type) → sections `h2`: Role description, Character requirements, Age/Gender criteria, Compensation, Required documents, Instructions → Venue map card (map-pin + address + "Navigate"). Sticky footer primary "Apply now" → A-20.
- **A-20 Apply for Audition** — Modal. Summary of audition (mini card) → portfolio selection (pick which media to attach, checkboxes) → optional intro-video picker → cover note textarea. Sticky "Submit application". Success → toast + returns, status Pending in A-21.
- **A-21 My Applications** — Large-title "Applications". List rows: audition title + company + **status badge** (Pending/Shortlisted/Rejected/Interview). Empty = "No applications yet → Browse auditions".
- **A-22 Application Detail** — Header. Audition mini-card → status timeline → casting-team response block (if any) → "Message" primary (only if chat unlocked → A-27).
- **A-23 Notifications** — Header "Notifications". List rows grouped by day: icon by type + title + `caption` time. Unread dot. Empty = "You're all caught up".
- **A-24 Settings** — List rows: Change password, Notification preferences, Privacy, then Logout (ghost) + Delete account (destructive text) → A-25.
- **A-25 Delete Account** — Dialog-style screen: warning `body` + reason select + destructive "Delete account" (confirm names the action).
- **A-26 Chat List** — Large-title "Chat". List rows: peer avatar + company name + last message `caption` + unread count. Empty = "No conversations yet — chat opens when a casting team connects".
- **A-27 Chat Thread ⭐** — Header: peer name + verified badge. Message bubbles (sent = `primary` tint, received = `surfaceAlt`), read state, typing indicator. Input row (text + send) docked above keyboard. Realtime.

---

# ② HIRING APP (31 screens)

## Auth stack (HA-0 … HA-7)
Identical structure to Artist AA-0…AA-7, **Hiring branding/copy**, and on success routes to **H-1** (not a category screen). Rebuild as instances of the same auth frames with swapped copy ("Create your company account", etc.). No role selection.

## Company setup & verification

- **H-1 Company Registration** — Header "Register your company". Type select (Production House, Casting Agency, Individual Casting Director, Talent Manager, Event Organizer, Ad Agency, OTT Production Team). Fields: Company name, Contact (phone/email), Social links, Description. Primary "Continue" → H-2.
- **H-2 Company Verification ⭐** — Modal, multi-step feel. Upload rows: Aadhaar, PAN, Company registration doc, GST (optional). Selfie/face capture row. `caption` trust copy "We review every company before it can post. Usually 24–48 hours." Sticky "Submit for review" → H-3.
- **H-3 Verification Pending ⭐** — Centered state screen: illustration + "Under review" `h1` + `caption` est. time + submitted timestamp. This is the **locked shell** — only this + Profile are reachable until approved. On approval → H-6.
- **H-4 Company Profile (public)** — Logo + name `h1` + verified badge + description + past productions list + social links.
- **H-5 Edit Company Profile** — Modal, pre-filled fields + logo replace. Sticky "Save changes".

## Hiring main app

- **H-6 Dashboard / Home ⭐** — Large-title "Dashboard". Stat cards row (Active auditions, Applications, Shortlisted — big numbers, tabular figures). Quick-post primary "Post audition" (full) → H-7. Recent auditions list below.
- **H-7 Post New Audition ⭐** — Modal. Sectioned form: **Project** (Title, Role description, Character requirements), **Criteria** (Age min/max, Gender, Category select, Language), **Logistics** (Type walk-in/scheduled toggle, Date & time, Venue address + map pin), **Details** (Compensation, Required documents, Instructions). Sticky footer primary "Continue to payment" → H-18. (Post stays draft until paid + webhook-confirmed.)
- **H-8 Manage Auditions** — List rows: title + status badge (Active/Closed/Draft) + applicant count. Row actions: edit/pause/delete. Empty = "No auditions yet → Post your first".
- **H-9 Edit Audition** — Modal, same as H-7 pre-filled. "Save changes".
- **H-10 Audition Applications** — Header (audition title). List rows: applicant avatar + name + category + city + applied date + status badge. Empty = "No applications yet".
- **H-11 Artist Application Detail ⭐** — Full artist profile embedded (photo, intro video, portfolio, skills) + their application (cover note, attached media). Sticky footer: **Shortlist** (primary) / **Reject** (destructive ghost) / **Schedule interview** (secondary) → H-13.
- **H-12 Shortlisted Candidates** — Filtered list (status=shortlisted) for an audition. "Send interview notice" per row or bulk.
- **H-13 Schedule Interview** — Modal. Date/time picker + venue (address + map pin) + note. Primary "Send to candidate(s)".
- **H-14 Artist Search ⭐** — Large-title "Talent" + filter icon. 2-col **artist card** grid. Filter sheet: Category, Location, Age range, Gender, Language, Experience, Physical features. Empty = "No talent matches → Adjust filters".
- **H-15 Artist Profile View** — Read-only artist profile (like A-8, no edit). Footer: "Send request" primary → H-16.
- **H-16 Send Communication Request** — Bottom sheet: message textarea + `caption` "They'll be notified and can accept to open a chat." Primary "Send request".
- **H-17 Notifications** — Like A-23: new applications, system, admin messages, chat.
- **H-18 Payment & Subscription ⭐** — Order summary card (audition title + "₹10"), payment method, single primary "Pay ₹10". Blocking loader "Do not press back" during gateway. Success = slow success animation + "Audition is live" + "View audition". Failure = "No money was deducted" + retry. **Status from webhook, never client callback.**
- **H-19 Transaction History** — List rows: date + amount + description (audition title). Empty = "No transactions yet".
- **H-20 Settings** — Change password, Notification preferences, Logout. (No delete-company in MVP unless added.)
- **H-21 Report Fraudulent Audition** — Bottom sheet: reason select + details textarea. Primary "Submit report".
- **H-22 Chat List** — Like A-26, peers are artists.
- **H-23 Chat Thread** — Like A-27, realtime thread with an artist.

---

# ③ ADMIN PANEL — WEB (13 screens)

> Different frame: **web, 1440-wide**, left nav + content area. Reuse the same color/type tokens (this is where consistency across mobile+web pays off) but web-density layouts: data tables, not cards. Lower design priority than the two apps — functional over beautiful.

- **AD-1 Admin Login** — Centered card: email + password + 2FA code. Primary "Log in".
- **AD-2 Dashboard** — Metric tiles (Total artists, Active auditions, Pending verifications, Revenue, Fraud reports) + charts. Left nav to all sections.
- **AD-3 User Management** — Data table (users), search + filters, row actions activate/deactivate/view.
- **AD-4 Artist Management** — Table of artists; view/edit/delete; verification status; grant/revoke badge toggle.
- **AD-5 Company Verification Queue ⭐** — Table of pending companies → detail drawer showing uploaded docs (signed-URL viewer) + **Approve / Reject with reason**. The trust-critical admin screen.
- **AD-6 Verified Companies** — Table of approved companies + badge status.
- **AD-7 Blacklist Management** — Table + add/remove with reason + audit trail column.
- **AD-8 Audition Moderation** — Table of active auditions; flag/pause/remove with reason.
- **AD-9 Fraud Reports** — Table of reports; actions warn/suspend/blacklist.
- **AD-10 Payment Monitoring** — Transactions table; filter by date/amount/user type; export CSV.
- **AD-11 Analytics & Reports** — Charts: artists, active auditions, application stats, top categories, engagement, revenue trend.
- **AD-12 Content Management** — Editors for banners, FAQs, terms, privacy.
- **AD-13 Admin Settings** — Manage admin accounts, roles, permissions.

---

## Client-approval sequence (how to actually use this)

**Round 1 — "the look" (≈8 screens ⭐):** A-1, A-7, A-8, A-14, A-19, A-27, H-6, H-7, H-18. These carry every visual decision (cards, badges, forms, payment, chat, gold-on-dark). Show Harrsh *only these*. He approves a look, not 79 screens.

**Round 2 — "the flow":** once the look is signed, assemble the remaining screens (fast, since it's all component placement) and link them into a clickable Figma prototype for tap-through approval per app.

**Then:** export approved frames as PNGs (your "approved images") for the record, and the same Figma file becomes the dev handoff for the RN build.

Keep the boldness in one place (the gold + the cinematic dark), everything else quiet — that's what separates this from the templated look you were getting.
