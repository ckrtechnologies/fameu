# FAMEU — Stitch Prompt Playbook

> How to get FAMEU-branded, consistent screens out of Stitch. The rule that fixes everything: **stop pasting the full DESIGN.md.** Stitch (Gemini-based) can't hold thousands of words — it grabs the gist and fills the rest with generic defaults. Feed it a short, identical **style header** every time, then just the one screen. Generate **screen-by-screen**, never whole-app.

---

## THE STYLE HEADER — paste this at the top of EVERY screen prompt, unchanged

Copy-paste exactly, every time. Its job is to be short enough that Stitch actually holds it, and identical enough that screens come out consistent.

```
STYLE (FAMEU — a film audition & talent app, cinematic and premium, trustworthy not flashy):
- Dark mode. Background #0E0F12. Cards/surfaces #17191F with a 1px #2C2F38 border (flat, NOT drop-shadowed).
- Primary/accent = gold #E3B04B. Buttons: gold fill with dark #1A1200 text. Only ONE gold button per screen.
- Text: primary #F4F2EE, secondary #A6ABB3. Font: Inter. Titles 24px/600, section titles 20px/600, body 15px/400, labels 11px uppercase.
- Verified badge = green #4CAF6E check on a dark green tint, small pill, next to any company/verified name.
- Spacing on a strict 4/8/12/16/24 grid. 16px screen side padding. Card corner radius 12, pills fully rounded.
- Icons: Lucide, thin 2px stroke. Mobile 390x844, iOS-style.
Keep it clean, lots of breathing room, one bold gold moment per screen, everything else quiet.
```

That's it. ~10 lines. Stitch can hold this. The full DESIGN.md cannot fit in its head — this is the distilled version that survives.

---

## PROMPT RECIPE (per screen)

```
[STYLE HEADER — pasted unchanged]

SCREEN: <name + one-line purpose>
LAYOUT top to bottom:
- <component 1>
- <component 2>
- <sticky footer button, if any>

DON'T: <the specific generic things to block>
```

The **DON'T line is your secret weapon** — it directly blocks Stitch's defaults. Use it aggressively.

---

## READY-TO-PASTE EXAMPLES (your 8 hero screens)

### A-7 — Artist Home
```
[STYLE HEADER]

SCREEN: Artist Home feed — where an artist sees auditions to apply to.
LAYOUT top to bottom:
- Large title "Home" left-aligned, a bell icon top-right.
- A slim profile-completion card with a gold progress bar (only if incomplete).
- Section "Nearby auditions" with a horizontal row of audition cards.
- Section "Trending" with vertical audition cards.
- Bottom tab bar: Home, Auditions, Applications, Chat, Profile (Home active in gold).
Audition card = 16:9 poster image, title (2 lines max), company name with a green verified badge, a row with a location pin + city + a small "Walk-in" or "Scheduled" pill.
DON'T: no drop shadows on cards (use the 1px border), no purple/blue accents, no gradient buttons, no more than one gold element competing for attention, no stock "hero banner" at the top.
```

### A-19 — Audition Detail
```
[STYLE HEADER]

SCREEN: Audition detail — full info about one audition, with an Apply button.
LAYOUT top to bottom:
- Back arrow + a small flag/report icon top-right.
- 16:9 poster image.
- Title (24px), then company name with green verified badge.
- Two small pills: category + "Scheduled".
- Sections with 20px headers: Role description, Character requirements, Age & gender, Compensation, Required documents, Instructions.
- A venue card: map pin, address, a "Navigate" link.
- Sticky footer: ONE full-width gold "Apply now" button.
DON'T: no shadowed cards, no second colored button, no icon-heavy clutter in the sections, no generic placeholder lorem — use realistic film-casting copy.
```

### A-8 — Artist Profile (public)
```
[STYLE HEADER]

SCREEN: An artist's public profile.
LAYOUT top to bottom:
- Back arrow + share icon.
- A 1:1 profile photo, name (24px), category tags as small uppercase pills, a green verified badge if verified.
- A 16:9 intro-video player with a play button.
- Section "Skills" as pills.
- Section "Experience" as a simple timeline list.
- Section "Photos" as a 2-column grid preview.
- Sticky footer: gold "Edit profile" button.
DON'T: no social-media-style cover banner, no blue links, no shadows, no rounded-everything — only pills and avatars are fully round, cards stay at radius 12.
```

### A-14 — Audition Discovery
```
[STYLE HEADER]

SCREEN: Browse and search auditions.
LAYOUT top to bottom:
- Large title "Auditions", a filter icon top-right.
- A segmented toggle: "List" / "Map".
- (List view) a vertical stack of audition cards.
- Bottom tab bar with Auditions active in gold.
Audition card = 16:9 poster, title, company + green verified badge, location pin + city + type pill.
DON'T: no shadows, no map screenshot with pink Google pins — if pins, make them gold. No generic search-results grid; keep it a comfortable single-column list.
```

### A-27 — Chat Thread
```
[STYLE HEADER]

SCREEN: A chat conversation between an artist and a casting company.
LAYOUT top to bottom:
- Header: back arrow, the company name with a green verified badge.
- Message bubbles: messages I sent = gold-tinted bubble on the right; received = dark grey #1F222A bubble on the left. Small timestamps.
- A "typing..." indicator.
- Input row docked at the bottom: a text field + a gold send button.
DON'T: no bright blue iMessage bubbles, no shadows on bubbles, no emoji-heavy UI, keep it calm and professional.
```

### H-6 — Hiring Dashboard
```
[STYLE HEADER]

SCREEN: Dashboard for a casting company / production house.
LAYOUT top to bottom:
- Large title "Dashboard".
- A row of 3 stat cards: "Active auditions", "Applications", "Shortlisted" — each a big number with a small label under it.
- A full-width gold "Post audition" button.
- Section "Recent auditions" as a list with status pills (Active / Draft / Closed).
- Bottom tab bar: Dashboard, Auditions, Talent, Chat, Profile (Dashboard active in gold).
DON'T: no shadowed stat cards (1px border only), no pie charts, no purple dashboard-template look, numbers should feel confident and large.
```

### H-7 — Post New Audition
```
[STYLE HEADER]

SCREEN: Form to post a new audition.
LAYOUT top to bottom:
- Header with an X (close), title "Post audition".
- Grouped form sections with 11px uppercase labels:
  PROJECT: Title, Role description, Character requirements.
  CRITERIA: Age range, Gender, Category, Language.
  LOGISTICS: a Walk-in / Scheduled toggle, Date & time, Venue address with a small map.
  DETAILS: Compensation, Required documents, Instructions.
- Sticky footer: gold "Continue to payment" button.
DON'T: no cramped fields — 16px gaps, generous. No shadows. No single giant scroll with no section headers. Inputs are #17191F with a 1px border, radius 8.
```

### H-18 — Payment
```
[STYLE HEADER]

SCREEN: Pay ₹10 to make an audition go live.
LAYOUT top to bottom:
- Header, title "Payment".
- An order summary card: the audition title, and "₹10" shown clearly.
- A payment method row.
- Sticky footer: ONE full-width gold "Pay ₹10" button.
- (Optional second frame) a success state: a green check, "Audition is live", and a "View audition" button.
DON'T: no shadows, no fake card-number form (payment is handled by the gateway), no red/green clutter — keep it a calm single-focus screen.
```

---

## WORKING RULES (pin these)

1. **Style header every time, unchanged.** Consistency comes from repetition, not from Stitch remembering.
2. **One screen per generation.** Whole-app prompts split Stitch's attention and screens drift apart.
3. **Always end with a DON'T line.** It's the most effective single lever — it blocks the exact generic defaults (shadows, blue accents, gradients, banners) that were making your output look templated.
4. **Regenerate 2–3 times, keep the best.** Stitch is a slot machine; the header just loads the dice toward FAMEU.
5. **If it drifts, shorten — don't lengthen.** When a screen comes out generic, the fix is usually *less* text, not more. Trim the layout list to the essentials + the header.
6. **Realistic copy in the prompt.** Say "use real film-casting text" or write a sample line — generic lorem is half of what makes a mockup look generic.
7. **Approve the LOOK on ~8 hero screens first** (the ones above). Once Harrsh likes those, the rest are the same header + a layout list — fast, and consistent because the header never changes.
8. **Export approved screens as images** for your client record; Stitch can also hand off code/Figma later if you want, but images are enough for approval.

---

## Why this works when pasting DESIGN.md didn't

DESIGN.md is written for *you and your developers and the RN build* — it's a governance document. Stitch is a fast image model with a small attention window; it needs a *poster*, not a *rulebook*. The style header is DESIGN.md's visual essence compressed to what Stitch can actually hold in one shot. Same design system, format it can digest.
```
