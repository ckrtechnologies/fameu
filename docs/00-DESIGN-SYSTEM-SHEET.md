# FAMEU — Design System Sheet (Claude Design)

> **This is the PARENT sheet. Paste this into Claude Design FIRST, on its own, before any screen.** It establishes the FAMEU visual language once. Every screen sheet afterward says "using the FAMEU design system" and inherits everything here — so screens stay consistent instead of drifting. Do not generate screens from this sheet; its only job is to lock and show the look.

## The brief in one line
A cinematic, premium mobile app for the Indian film/casting industry — where artists build portfolios and apply to auditions, and casting companies (verified, to stop scams) post and hire. It must feel **trustworthy and editorial**, not like a generic SaaS app. Trust is the product, so verification cues are part of the visual identity.

## Signature (the one thing FAMEU is remembered by)
**The spotlight-gold moment on near-black, plus the green verified badge as a recurring trust mark.** Every screen is quiet and dark with exactly one confident gold action; verified badges appear wherever a company or trusted artist is named. Boldness is spent there and nowhere else.

---

## 1. Color (dark is the default theme)

| Role | Hex | Use |
|---|---|---|
| Background | `#0E0F12` | Screen base (near-black, "theatre") |
| Surface | `#17191F` | Cards, inputs, sheets |
| Surface alt | `#1F222A` | Nested rows, skeletons, received chat bubbles |
| Border | `#2C2F38` | 1px card/input borders, dividers |
| Primary (gold) | `#E3B04B` | The ONE action per screen; active tab |
| Primary pressed | `#C8952B` | Pressed gold |
| Text on gold | `#1A1200` | Label on gold buttons (dark, for contrast) |
| Text primary | `#F4F2EE` | Headings, body |
| Text secondary | `#A6ABB3` | Captions, meta |
| Success / verified | `#4CAF6E` on `#17281C` tint | Verified badge, confirmations |
| Warning / pending | `#E3B04B` on `#2A2413` tint | Pending verification, offline |
| Error / fraud | `#E76A6A` on `#2A1717` tint | Errors, destructive, fraud flags |

Rule: never pure black. One gold element per screen, max. Status colors always shown as a colored label on their dark tint, never full-bleed.

## 2. Type (Inter)
- Display 32/700 · Title 24/600 · Section 20/600 · Card title 17/600 · Body 15/400 · Label 13/400 · Overline 11/600 UPPERCASE +0.5.
- That's the whole scale. No other sizes. Titles left-aligned.

## 3. Spacing & shape
- Strict 4 / 8 / 12 / 16 / 24 / 32 grid. Nothing off-grid.
- 16px screen side padding, always. Card gap 12. Form field gap 16. Section gap 24.
- Radius: inputs/chips 8, cards/buttons 12, sheets 20, pills/avatars fully round. One radius per component type.
- **Cards are flat with a 1px border — NOT drop-shadowed.** This is deliberate and suits the dark theme; it's a key part of the FAMEU look.

## 4. Core components (render each once on this sheet so the client sees the kit)
- **Button** — gold fill, dark text, radius 12, height 52 for main CTAs. Also show: secondary (gold outline), ghost (gold text), destructive (red). Only one gold per screen.
- **Input** — height 52, surface fill, 1px border, radius 8, label above in secondary text. Show focus (gold border) and error (red border + message) states. Plus a 6-box OTP input.
- **Chip** — height 32, fully round; selected = gold fill/dark text, unselected = surface-alt. Used for categories and filters.
- **Audition card** (the signature content unit) — 16:9 poster, title (2 lines), company name + green verified badge, a row with location pin + city + a small "Walk-in/Scheduled" pill. Flat, 1px border.
- **Artist card** — 1:1 photo, name, category overline tag, optional verified badge. For talent grids (2-col).
- **Verified badge** — small pill, green check on dark-green tint. The trust mark; identical everywhere.
- **Status pill** — Pending/Shortlisted/Rejected/Interview and Active/Draft/Closed, each a colored label on its tint.
- **Bottom tab bar** — 5 tabs, icon + label, active tab icon filled + gold. (Two versions exist: Artist = Home/Auditions/Applications/Chat/Profile; Hiring = Dashboard/Auditions/Talent/Chat/Profile.)
- **State blocks** — skeleton (surface-alt shimmer shaped like the real card), empty (small illustration + title + one line + optional gold CTA), error (icon + "Something went wrong" + Retry), offline banner (slim warning bar).

## 5. Icons & feel
- Lucide icons, thin 2px stroke, one set only. Verified = badge-check (green), fraud/report = shield-alert (red).
- Overall feel: clean, lots of breathing room, cinematic calm, one gold moment per screen, everything else quiet and disciplined.

---

## How to use this sheet
1. Paste this whole sheet into Claude Design first. Ask it to render the **design system / component kit** as one board (the palette, type scale, and the components in §4).
2. Look at it. If anything reads generic, say so and iterate — this is the cheap moment to fix the look, before any screen exists.
3. Once you (and Harrsh) like this kit, **keep this sheet in the conversation** and start pasting screen sheets. Each screen sheet begins with "Using the FAMEU design system above…" so it inherits all of this.
