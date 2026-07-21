# FAMEU — Figma Component Build Sheet

> For the designer. Build this library **first**, before any screen. Source of truth is `DESIGN.md` v1.1 §1–§3; this sheet translates it into a Figma build order. Every value here already exists as a token in `fameu-figma-tokens.json` — reference the variable, never type a raw hex or px. Build in **Dark mode first** (FAMEU default), then flip the mode to verify Light.
>
> Golden rule: if a screen later needs something not in this library, **stop and add it here first** — never draw a one-off on a screen frame. That discipline is the entire reason the 79 screens will look consistent instead of templated.

## Build order (each step unblocks the next)

1. **Import tokens** → 2. **Text styles** → 3. **Primitives** (button, input, chip, badge, avatar, icon) → 4. **Composites** (cards, list rows, tab bar, header, sheets) → 5. **State/feedback** (skeleton, empty, error, offline, toast, dialog) → 6. **Then screens** (separate file/pages, see `FIGMA-SCREEN-SPECS.md`).

---

## 1. Setup

- Import `fameu-figma-tokens.json` via **Tokens Studio** plugin → creates color + number variables with Light/Dark modes.
- Install **Inter** (Google Fonts). Enable tabular figures on a text style variant for money/stats.
- Frame size for screens later: **390 × 844** (design target). Must survive 360 × 640 — test the dense forms there.
- Grid: 16px side margins (matches `spacing.lg`), no column grid needed for mobile; use auto-layout everywhere.

## 2. Text styles (create as Figma text styles, mapped to typography tokens)

`display · h1 · h2 · h3 · body · bodyBold · caption · overline` — exactly these 8, nothing else. Overline: uppercase, +0.5 letter-spacing. No other sizes may appear anywhere in the file.

---

## 3. Primitives (build as components with variants)

### Button
Variant props: `variant` {primary, secondary, ghost, destructive} × `size` {lg, md, sm} × `state` {default, pressed, disabled, loading}.
- **primary**: fill `primary`, label `textOnPrimary`, radius `md`. pressed → `primaryPressed`. disabled → 40% opacity. loading → spinner replaces label, **width locked** (don't let it resize).
- **secondary**: transparent fill, 1px `primary` border, `primary` label.
- **ghost**: transparent, `primary` label, no border. pressed → 0.7 opacity.
- **destructive**: fill `error`, white label.
- Heights: lg 52, md 44, sm 36. Full-width variant for screen CTAs (Apply, Pay ₹10, Post audition). Never two primaries on one screen.

### Input
Variant props: `state` {default, focus, error, disabled} × `type` {text, password, otp-box}.
- Height 52, fill `surface`, 1px `border`, radius `sm`, text `body`. Label above in `caption`/`textSecondary`.
- focus → `primary` border. error → `error` border + error caption row with a 16px alert icon. disabled → `surfaceAlt`.
- **Reserve the helper/error slot always** (fixed height) so layout doesn't jump.
- password → trailing eye icon (20). otp-box → 6 separate single-char boxes, auto-advance; used on the Email OTP screen (email OTP — no SMS auto-read).

### Chip
Props: `type` {category, filter} × `selected` {true, false}. Height 32, radius `full`. selected → fill `primary`, `textOnPrimary`. unselected → `surfaceAlt`, `textSecondary`. Used for category tags and filter multi-selects.

### Badge
Props: `kind` {verified, pending, rejected, fraud, status-neutral}. `overline` text on the matching `*Bg`, radius `full`, height 22.
- **verified** → `success` on `successBg` + `badge-check` icon. **pending** → `warning`/`warningBg`. **rejected/fraud** → `error`/`errorBg` + `shield-alert`. 
- This is a **trust component** — it must look identical everywhere it appears (every company name, every verified artist name). Build once, reuse only.

### Avatar
Props: `size` {24, 32, 40, 64} × `state` {image, fallback}. radius `full`. fallback = initials on `primary` at 20% opacity. Never a broken-image state.

### Icon
Lucide, stroke 2. Component set covering the ones the screens use: home, search, calendar, map-pin, bell, user, message-circle, badge-check, shield-alert, upload, camera, play, chevron-right, x, filter, plus, credit-card, check, alert-circle. Sizes 16/20/24/28.

---

## 4. Composites

### Audition card (the signature content unit — get this right, everything inherits its feel)
Fill `surface`, radius `md`, 1px `border` (flat + bordered, per DESIGN.md §3.4 — no shadow; suits the dark theme), padding 16.
Layout (auto-layout, vertical): poster/thumb **16:9** → title `h3` (max 2 lines) → company row (name `bodyBold` + **verified badge**) → meta row (`map-pin` + city `caption`, `type` chip walk-in/scheduled). Pressable → pressed state fills `surfaceAlt`.

### Artist card (talent grid unit)
2-col grid item. Portrait photo **1:1** → name `bodyBold` → category `overline` tag → optional verified badge. Gap 12.

### List row
Min height 56, padding 16, divider = `border` inset 16. Trailing `chevron-right` (20) only if the row navigates. Variants: plain, with-avatar, with-value (settings), with-status-badge (applications).

### Header
Height 56 + safe area. Left back/close (44×44 touch). Title `h3` **left-aligned** (fixed for this app). Max 1 right action. Large-title variant (`h1`) for tab roots only (Home, My Applications, Talent).

### Bottom tab bar
5 tabs, icon (24) + label (`caption`). active = **filled** icon + `primary`; inactive = outline + `textSecondary`. Build **two instances**: Artist {Home, Auditions, Applications, Chat, Profile} and Hiring {Dashboard, Auditions, Talent, Chat, Profile}. Optional notification dot (8px `error`).

### Bottom sheet
Grab handle, top radius `lg`, `overlay` behind, `surface` body. Used for filters, category picker, report-reason, quick confirms. Under ~60% height.

### Modal (full-screen)
Close (X) top-left, not back. Used for Post Audition, Apply, Company Verification, Payment.

---

## 5. State & feedback components (mandatory — screens reference these, never redraw)

- **Skeleton**: `surfaceAlt` blocks with a shimmer, shaped like the real card/row (audition-card skeleton, list-row skeleton, profile skeleton). DESIGN.md §4 — no blank white screens.
- **Empty state**: illustration slot (≤120px) + `h3` title + `caption` line + optional primary CTA. Build variants: "no auditions match filters → Clear filters", "no applications yet → Browse auditions", "no messages yet".
- **Error state**: icon + "Something went wrong" (`h3`) + `caption` + secondary **Retry** button. Always a retry path.
- **Offline banner**: slim persistent bar in `warningBg` / `warning` text, "You're offline". Docks under header.
- **Toast/Snackbar**: **bottom**, `surface` + `border`, max 2 lines, optional single action. For "Application submitted", "Payment confirmed".
- **Dialog**: title `h3`, body `body`, max 2 buttons right-aligned; destructive uses `error`. For delete account, remove audition.
- **Progress**: determinate bar (media upload) + indeterminate spinner (<3s waits).

---

## 6. Handoff checklist (designer self-check before building screens)

- [ ] All 8 text styles created, no stray sizes.
- [ ] Every color is a variable with Light + Dark modes; zero raw hex on any layer.
- [ ] Button/Input/Chip/Badge/Avatar all have every state variant from §3.
- [ ] Verified/pending/fraud badges look identical and use the trust tokens + icons.
- [ ] Audition card + artist card + list row + both tab bars + header built.
- [ ] All 5 state components (skeleton/empty/error/offline/toast) built.
- [ ] Auto-layout on everything; nothing absolutely-positioned.
- [ ] Dark mode is the default; flipping to Light mode doesn't break any component.

Once every box is ticked, screens become assembly, not design — which is exactly what makes 79 of them feasible and consistent.
