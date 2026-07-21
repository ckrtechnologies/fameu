# FAMEU — Screen Sheets (Claude Design)

> **These are CHILD sheets. Paste the design-system sheet (`00-DESIGN-SYSTEM-SHEET.md`) FIRST, then paste ONE screen sheet below per generation.** Each begins with "Using the FAMEU design system above" so it inherits the palette, type, spacing, and components — you never re-specify the look. That inheritance is what keeps all screens consistent.
>
> Order: build these 8 hero screens for the client "look" approval. Once approved, the remaining ~71 screens are written the same way (system reference + layout list) from `SCREEN-MAP.md`.
>
> Each sheet also lists the screen's **4 states** (loading/empty/error/offline) — ask Claude Design to show them as extra frames once the main screen looks right.

---

## SCREEN SHEET — A-7 Artist Home ⭐
```
Using the FAMEU design system above, design the Artist Home screen (mobile, 390×844, dark).

Purpose: where an artist lands to find auditions to apply to.
Layout top to bottom:
- Large title "Home" (left-aligned), bell icon top-right.
- A slim profile-completion card with a gold progress bar and "Complete your profile" — only shown when incomplete.
- Section "Nearby auditions" (20px header) → a horizontal scroll row of audition cards.
- Section "Trending" (20px header) → vertical audition cards.
- Artist bottom tab bar, Home active in gold.
Use realistic Indian film-casting content (roles like "Lead actor — regional web series", real-sounding production house names, cities like Mumbai, Hyderabad).
After the main screen, also show: the loading state (audition-card skeletons) and the empty state ("No auditions near you yet" + gold "Expand search area").
```

## SCREEN SHEET — A-19 Audition Detail ⭐ (build this one first — richest test of the look)
```
Using the FAMEU design system above, design the Audition Detail screen (mobile, dark).

Purpose: full info about one audition, ending in an Apply action.
Layout top to bottom:
- Back arrow, small flag/report icon top-right.
- 16:9 poster image.
- Title (24px). Below it, production house name with a green verified badge.
- Two small pills: category + "Scheduled".
- Sections (20px headers): Role description, Character requirements, Age & gender criteria, Compensation, Required documents, Audition instructions.
- A venue card: location pin + address + a "Navigate" link, with a small map.
- Sticky footer: ONE full-width gold "Apply now" button.
Use realistic casting copy, not lorem.
```

## SCREEN SHEET — A-8 Artist Profile ⭐
```
Using the FAMEU design system above, design the Artist public Profile screen (mobile, dark).

Purpose: an artist's shareable portfolio.
Layout top to bottom:
- Back arrow + share icon.
- 1:1 profile photo, name (24px), category tags as uppercase pills, a green verified badge.
- A 16:9 intro-video player with a gold play button.
- Section "Skills" as chips.
- Section "Experience" as a simple timeline list.
- Section "Photos" as a 2-column grid preview.
- Sticky footer: gold "Edit profile" button.
No social-media cover banner. Only pills/avatars are fully round; cards stay radius 12.
```

## SCREEN SHEET — A-14 Audition Discovery ⭐
```
Using the FAMEU design system above, design the Audition Discovery screen (mobile, dark).

Purpose: browse and search auditions.
Layout top to bottom:
- Large title "Auditions", filter icon top-right.
- A segmented toggle "List / Map".
- List view: vertical stack of audition cards.
- Artist bottom tab bar, Auditions active.
Also show the Map view variant: a dark map with GOLD pins (not default red) and a bottom peek card for the selected audition.
Also show the empty state: "No auditions match your filters" + gold "Clear filters".
```

## SCREEN SHEET — A-27 Chat Thread ⭐
```
Using the FAMEU design system above, design the Chat Thread screen (mobile, dark).

Purpose: real-time chat between an artist and a casting company (opens only after they connect).
Layout top to bottom:
- Header: back arrow, the company name with a green verified badge.
- Message bubbles: sent = gold-tinted bubble on the right; received = surface-alt (#1F222A) bubble on the left; small timestamps.
- A "typing…" indicator.
- Input row docked at bottom: text field + gold send button.
Calm and professional. No bright-blue iMessage bubbles, no shadows on bubbles.
```

## SCREEN SHEET — H-6 Hiring Dashboard ⭐
```
Using the FAMEU design system above, design the Hiring Dashboard screen (mobile, dark).

Purpose: home for a casting company / production house.
Layout top to bottom:
- Large title "Dashboard".
- A row of 3 stat cards: "Active auditions", "Applications", "Shortlisted" — each a big confident number with a small label.
- A full-width gold "Post audition" button.
- Section "Recent auditions" as a list with status pills (Active / Draft / Closed).
- Hiring bottom tab bar (Dashboard / Auditions / Talent / Chat / Profile), Dashboard active.
Stat cards flat with 1px border, no shadows. No pie charts.
```

## SCREEN SHEET — H-7 Post New Audition ⭐
```
Using the FAMEU design system above, design the Post New Audition form screen (mobile, dark).

Purpose: a casting company creates an audition posting.
Layout top to bottom:
- Header with an X (close) and title "Post audition".
- Grouped form sections, each with an 11px uppercase label:
  PROJECT — Title, Role description, Character requirements.
  CRITERIA — Age range, Gender, Category, Language.
  LOGISTICS — a Walk-in / Scheduled toggle, Date & time, Venue address with a small map.
  DETAILS — Compensation, Required documents, Instructions.
- Sticky footer: gold "Continue to payment" button.
Generous 16px gaps between fields. Inputs are #17191F with a 1px border, radius 8. No cramped single scroll — clear section headers.
```

## SCREEN SHEET — H-18 Payment ⭐
```
Using the FAMEU design system above, design the Payment screen (mobile, dark).

Purpose: pay ₹10 to make an audition go live.
Layout top to bottom:
- Header, title "Payment".
- An order summary card: the audition title and "₹10" shown clearly.
- A payment method row.
- Sticky footer: ONE full-width gold "Pay ₹10" button.
Also show a success state as a second frame: a green check, "Your audition is live", and a gold "View audition" button.
Calm, single-focus. No fake card-number form (a payment gateway handles that). No shadows.
```

---

## After the 8 heroes are approved
Write every remaining screen the same way — open with "Using the FAMEU design system above," then a top-to-bottom layout list pulled from `SCREEN-MAP.md`. Because the system sheet stays in the conversation, screen #40 inherits the exact same look as screen #1. That inheritance is the entire trick; the screen sheets stay short because the design-system sheet carries the weight.

## The process in one picture
```
[Design-System Sheet]  ← paste once, approve the LOOK here
        │  (every screen inherits from it)
        ├── [Screen Sheet A-7]   → generate → critique → keep
        ├── [Screen Sheet A-19]  → generate → critique → keep
        ├── [Screen Sheet ...]
        └── [Screen Sheet H-18]
                                   ↑ approve the FLOW across these
```
