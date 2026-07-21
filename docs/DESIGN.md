# DESIGN.md — FAMEU Mobile Design Guide

> CKR Technologies · React Native (bare CLI) · **Version:** v1.1 · **Date:** 19 Jul 2026
> Single source of truth for all UI decisions. `src/theme/` must mirror Section 1 exactly. Agents and developers must not invent values that exist here. If something isn't covered, propose an addition — never improvise silently.
> Companion: `SCREEN-MAP.md` v1.1 · `AGENTS.md` v1.1.

**Brand direction (FAMEU):** cinematic and premium — deep near-black "theatre" backgrounds, a warm gold primary that reads as spotlight/award, restrained and trustworthy (this is an anti-scam product; the UI must feel credible, not flashy). Dark mode is the design's natural home but light mode is fully defined from day one.

---

## 1. Foundations (Tokens)

### 1.1 Color

Semantic tokens only — components reference these names, never raw hex.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `primary` | #C8952B | #E3B04B | Main actions, active states (spotlight gold) |
| `primaryPressed` | #A97C1F | #C8952B | Pressed state of primary |
| `secondary` | #2B3A67 | #5B6FA8 | Secondary actions (deep indigo) |
| `background` | #FBF9F5 | #0E0F12 | Screen background |
| `surface` | #FFFFFF | #17191F | Cards, sheets, inputs |
| `surfaceAlt` | #F2EEE6 | #1F222A | Nested surfaces, table rows |
| `textPrimary` | #1A1C1F | #F4F2EE | Headings, body |
| `textSecondary` | #5B5F66 | #A6ABB3 | Captions, meta |
| `textDisabled` | #A6A9AE | #5A5E66 | Disabled labels |
| `textOnPrimary` | #1A1200 | #1A1200 | Text on primary (gold) buttons |
| `border` | #E4DFD5 | #2C2F38 | Dividers, input borders |
| `success` / `successBg` | #2E7D46 / #E4F3E8 | #4CAF6E / #17281C | Confirmations, verified badge |
| `warning` / `warningBg` | #B8860B / #FBF1D6 | #E3B04B / #2A2413 | Cautions, offline banner |
| `error` / `errorBg` | #C43D3D / #FBE4E4 | #E76A6A / #2A1717 | Errors, destructive, fraud flags |
| `info` / `infoBg` | #2B5F9E / #E2EBF7 | #5B8FD6 / #16202E | Informational |
| `overlay` | rgba(0,0,0,0.5) | rgba(0,0,0,0.7) | Behind modals/sheets |

Rules:
- Never pure black `#000000`; use `textPrimary`.
- Verified badge uses `success` + `successBg`; fraud/blacklist uses `error` + `errorBg`; "Pending verification" uses `warning` + `warningBg`. These three trust-states are used identically everywhere.
- Status colors always paired with their `*Bg` tint for banners/badges (text on tint, never white on full status color except buttons).
- Dark mode defined here from day one.

### 1.2 Typography

Font: **Inter** (Google Fonts), fallback system font. Add via native linking (`react-native-asset`). Numeric-heavy screens (payments, stats) use Inter tabular figures.

| Token | Size/LineHeight | Weight | Usage |
|---|---|---|---|
| `display` | 32/40 | 700 | Onboarding, big numbers |
| `h1` | 24/32 | 600 | Screen titles |
| `h2` | 20/28 | 600 | Section titles |
| `h3` | 17/24 | 600 | Card titles |
| `body` | 15/22 | 400 | Default text |
| `bodyBold` | 15/22 | 600 | Emphasis, labels |
| `caption` | 13/18 | 400 | Meta, helper text |
| `overline` | 11/14 | 600, +0.5, uppercase | Section labels, category tags, badges |

Rules: no other sizes exist. Line height always specified. Max 2 weights per screen region. Body text never below 13.

### 1.3 Spacing

Scale: `4, 8, 12, 16, 20, 24, 32, 48, 64`. Named `space.xs → space.4xl`.
- Screen horizontal padding: **16** (fixed everywhere).
- Gap between stacked cards: 12. Between form fields: 16. Between sections: 24 or 32.
- No arbitrary values (no 10, 14, 18…).

### 1.4 Radius

`sm: 8` (inputs, chips) · `md: 12` (cards, buttons) · `lg: 20` (sheets, modals) · `full: 999` (pills, avatars, category tags). One radius per component type, never mixed on a screen.

### 1.5 Elevation

- `level0`: flat (default).
- `level1`: cards — shadowOpacity 0.06, radius 8, offset (0,2); Android elevation 2.
- `level2`: sheets, popovers — opacity 0.12, radius 16, offset (0,4); elevation 8.
- Never stack shadows; in dark mode prefer `border` + `surfaceAlt` over shadows.

### 1.6 Iconography

Set: **Lucide** — one set only, one stroke weight (2). Via `react-native-svg`.
Sizes: `16` (inline), `20` (list/input), `24` (default, tab bar), `28` (feature). Icon color follows adjacent text color. Filled variant only for active tab state. Verified = Lucide `badge-check` in `success`; fraud/report = `shield-alert` in `error`.

### 1.7 Motion tokens

| Token | Value | Usage |
|---|---|---|
| `duration.fast` | 150ms | Press feedback, toggles |
| `duration.base` | 250ms | Screen transitions, sheet open |
| `duration.slow` | 400ms | Complex/celebratory (payment success, verified) |
| `easing.standard` | cubic-bezier(0.2, 0, 0, 1) | Almost everything |
| `easing.exit` | cubic-bezier(0.4, 0, 1, 1) | Elements leaving |

Rules: use Reanimated; no animation over 500ms; respect OS reduced-motion; never animate layout on keystroke.

### 1.8 Haptics (react-native-haptic-feedback)

- `selection` → category chips, tab switch, filter toggles, picker ticks.
- `impactLight` → primary button press (Apply, Post Audition, Pay).
- `notificationSuccess` → payment confirmed, application submitted, company approved.
- `notificationError` → payment failure, destructive confirm, verification rejected.
- Never haptic on scroll or passive events.

---

## 2. Layout & Navigation

### 2.1 Screen anatomy
Every screen = StatusBar → Header → Content (scrollable) → optional sticky footer CTA → respects safe areas (`useSafeAreaInsets`, never hardcode notch heights).

### 2.2 Header
Height 56 + safe area. Back/close (left, 44×44), title `h3` **left-aligned** (chosen for this app, applied everywhere), max 1 right action icon + optional text action. Large-title (`h1`) only on tab root screens (Home, My Applications, Search).

### 2.3 Navigation model

FAMEU is **two separate apps** (PRD L11) sharing this one design system — same tokens, components, and rules; different tab sets and branding accents. There is **no role-selection screen** in either app.
**Artist app tabs (5):** Home · Auditions · Applications · Chat · Profile.
**Hiring app tabs (5):** Dashboard · Auditions · Talent · Chat · Profile.
Pre-approval hiring users see a locked shell — only Verification Pending (H-3) + Profile until approved.

- **Bottom tabs**: 3–5 destinations, icon + label always, active = filled icon + `primary`.
- **Stack push**: list → detail (audition list → detail, applicant list → profile).
- **Modal (full screen)**: self-contained flows — Post Audition, Apply, Company Verification, Payment. Has Close (X), not Back.
- **Bottom sheet**: filters, category picker, quick confirmations, report reason — under ~60% height. Grab handle, `lg` top radius, `overlay`, drag-to-dismiss.
- **Alert dialog**: destructive confirms (delete account, remove audition) and blocking errors. Max 2 buttons.

Choosing rule: content = push · task = modal · choice/quick action = sheet · irreversible = dialog.

### 2.4 Lists & grids
- List rows: min height 56, padding 16, divider = `border` inset 16, chevron only if row navigates.
- Cards in list: gap 12, full-bleed minus 16 padding.
- Talent/photo grids: 2 columns on phones, gap 12; 3+ only on tablets.
- FlashList for any list >10 items (audition feed, applicants, talent search, chat); `keyExtractor` mandatory.

### 2.5 Keyboard & forms layout
- `react-native-keyboard-controller` on every screen with inputs (heavy: registration forms, Post Audition).
- Submit CTA sticks above keyboard. "Next" moves focus; last field submits. Tap outside dismisses.

### 2.6 Responsiveness
Design at 390×844; must work at 360×640 without truncation. No fixed widths — flex + percentages. Tablets (if in scope): max content width 600, centered. Long registration forms must not break on small Android.

---

## 3. Component Specs

Every interactive component defines all states: default, pressed, disabled, loading, (focused/error where applicable). Components live in `src/components/ui/`; screens never re-implement them.

### 3.1 Button

| Variant | Style |
|---|---|
| Primary | `primary` bg, `textOnPrimary`, radius `md` |
| Secondary | transparent bg, 1px `primary` border, `primary` text |
| Ghost | transparent, `primary` text, no border |
| Destructive | `error` bg, white text |

Sizes: `lg` 52h (main CTAs — Apply, Pay ₹10, Post), `md` 44h, `sm` 36h. Pressed: `primaryPressed` / 0.7 opacity for ghost. Disabled: 40% opacity, no press. Loading: spinner replaces label, width locked. Full-width for screen CTAs; never two primary buttons at once.

### 3.2 Input
Height 52, `surface` bg, 1px `border`, radius `sm`, `body`. Label above (`caption`, `textSecondary`). Focus: `primary` border. Error: `error` border + error caption with icon. Disabled: `surfaceAlt`. Password: eye toggle. Prefix/suffix icons at 20. Helper slot always reserved (no jump). OTP input: 6 single-char boxes, auto-advance, paste-from-email supported (email OTP — no SMS auto-read).

### 3.3 Selection controls
Switch (settings/toggles), Checkbox (multi-select filters), Radio (single ≤5, else sheet picker), Chips (category + filter — height 32, `full` radius, selected = `primary` bg). Never mix checkbox and switch semantics.

### 3.4 Cards
`surface` bg, radius `md`, padding 16, **1px `border`** (chosen style for this app — flat + bordered, not shadowed, suits dark cinematic theme). Pressable cards show pressed feedback (`surfaceAlt`). Audition card = poster/thumb (16:9) + title + company (with verified badge) + city + type chip.

### 3.5 Badges, avatars, tags
Badge: `overline` on status `*Bg`, radius `full`, height 22. **Verified badge** (`success`) appears on every company name and every verified-artist name — consistent placement, right of the name. Notification dot: 8px `error`. Avatar: 24/32/40/64, `full` radius; fallback = initials on `primary` at 20% — never a broken image.

### 3.6 Feedback components
- **Toast/Snackbar**: **bottom** (fixed choice), auto-dismiss 3s, max 2 lines, optional single action. Non-blocking confirmations ("Application submitted").
- **Dialog**: title `h3`, body `body`, buttons right-aligned/stacked, destructive in `error`.
- **Bottom sheet**: as §2.3.
- **Skeleton**: `surfaceAlt` blocks with shimmer, mirrors real layout (audition cards, applicant rows).
- **Progress**: bar for determinate (media upload), spinner for indeterminate (<3s).

### 3.7 Media
Images: fixed aspect ratios only — `1:1` (avatars, portfolio photos), `16:9` (audition posters, banners), `4:3` (listings). `surfaceAlt` placeholder while loading (`@d11/react-native-fast-image`, 200ms fade), fallback icon on error. Never layout-shift on load. Video: portfolio playback with poster frame; audio (singer): waveform-style player. Upload UI shows determinate progress + cancel; large video uploads chunk and can resume.

---

## 4. States & Feedback Patterns

Every data-fetching screen implements all four:

1. **Loading**: skeleton matching final layout. Spinner only inside a component. Never a blank white screen.
2. **Empty**: icon/illustration (≤120px) + `h3` title + one-line `caption` + primary CTA if fixable. ("No auditions match your filters" → "Clear filters"; "No applications yet" → "Browse auditions").
3. **Error**: full-screen (icon + "Something went wrong" + Retry) for failed initial load; toast for failed actions; inline for validation. Always a retry path.
4. **Offline**: persistent slim `warningBg` banner "You're offline"; disable posting/applying/paying while offline; cached feed/profile still browsable.

Optimistic UI for save/save-audition/chip toggles (revert + toast on fail). Pull-to-refresh on all root lists. Infinite scroll with footer spinner; never "Load more" buttons.

---

## 5. Interaction Rules
- Minimum touch target **44×44** (padding extends target).
- Every touchable gives feedback within 100ms.
- Debounce submit buttons; disable while in flight — **critical on Pay ₹10 and Apply** (double-submit = double charge / duplicate application).
- Destructive actions confirm; confirm button names the action ("Delete account", "Remove audition", never "Yes").
- Gestures: iOS swipe-back always on; Android hardware back mapped on every screen incl. modals; swipe-to-delete only with a visible alternative.

---

## 6. Content & UX Writing
- Tone: **professional, reassuring** — this is a trust product. Short, direct, second person.
- Buttons = verb + object: "Apply now", "Post audition", "Pay ₹10", "Verify company". Never "OK"/"Submit"/"Yes".
- Errors = what happened + what to do: "Payment failed. No money was deducted. Try again or use another method." Never raw codes.
- Verification/trust copy is explicit and calm: "We review every company before it can post. This usually takes 24–48 hours."
- Sentence case everywhere (except `overline`).
- Numbers: currency `₹10`, `₹1,29,999` (Indian grouping); dates `12 Mar 2026`; relative time under 24h ("2h ago").
- Titles max 2 lines then ellipsis; prices/amounts never truncate.
- All strings in a strings/i18n file from day one — no hardcoded copy (also enables Phase-2 localisation).

---

## 7. Accessibility
- Text contrast ≥ 4.5:1 (verify the gold-on-dark and gold-on-light `primary` pairs once, then trust tokens; `textOnPrimary` is dark for exactly this reason).
- `accessibilityLabel` on every icon-only button; `accessibilityRole` on custom touchables.
- OS font scaling to 1.3× without breaking (test the dense registration forms).
- Never color alone (verified = icon + color + text; fraud flag = icon + color + text).
- Respect reduced-motion.

---

## 8. Platform Conventions
- **Android**: hardware/gesture back = header back everywhere; ripple via Pressable android_ripple; edge-to-edge with correct status-bar contrast.
- **iOS**: swipe-back on; no fake-Android patterns; ActionSheet feel for sheets.
- **Status bar**: style per screen background.
- **Permissions**: never on launch. Pre-permission explainer → OS prompt → inline "Open settings" fallback. Camera/photos (media upload, selfie verify) and location (nearby auditions) each get an explainer. Notifications asked only after first application/first post, never on first open.

---

## 9. Recurring Flow Patterns
- **Splash**: logo reveal + session/role check every launch; no spinner (extend logo hold if slow).
- **Onboarding**: ≤3 slides, skippable, ends at that app's auth (no role selection — two separate apps). Ask nothing you can ask later.
- **Auth**: **email OTP** (no phone/SMS); social secondary; 6-box OTP input, 30s resend, edit-email link. No role selection — each app goes straight from onboarding into its own register/login.
- **Verification (hiring)**: multi-step upload → selfie → submit → Pending screen with calm expectation-setting → push on decision. Rejected shows the reason + a fix path.
- **Payments**: order summary before pay; single "Pay ₹10" CTA; blocking loader "Do not press back" while gateway processes; success = `duration.slow` success animation + audition-live confirmation + "View audition"; failure = refund reassurance + retry. **Status always confirmed from webhook, never client callback.**
- **Apply**: confirm sheet with portfolio selection → submit → success toast → status appears in My Applications as Pending.
- **Chat**: opens only after comm-request accepted / shortlist; realtime; typing + read states; no personal-number exchange encouraged in copy.
- **Forms**: validate on blur; show all errors on submit; scroll to first error. Long category forms save draft locally so a crash doesn't lose media selections.
- **Search**: debounce 300ms; recent searches when empty; skeleton results; clear (×).
- **Settings/Profile**: grouped rows; logout + delete account at bottom; delete behind a confirmation flow (store requirement).

---

## 10. Governance
- `src/theme/` mirrors Section 1 — any token change updates both in the same PR.
- New component → spec here first, then built in `components/ui/`.
- Per-screen / agent-output review checklist:
  - [ ] Only theme tokens (no raw hex/px/font sizes)
  - [ ] All 4 data states implemented
  - [ ] All interactive states (pressed/disabled/loading)
  - [ ] Touch targets ≥ 44, safe areas, keyboard handled
  - [ ] Copy follows §6; strings externalised
  - [ ] Works at 360×640 and 1.3× font scale
  - [ ] Android back + iOS swipe-back correct
  - [ ] Verified/fraud/pending trust-states use the standard tokens + icons

> Anything that violates this document is a bug, even if it "looks fine".

---

## 11. Implementation Stack (design rule → approved library)

Agents must use these — no alternatives — unless this table is updated first.

| Design area | Approved library | Rule |
|---|---|---|
| Styling & tokens (§1) | NativeWind | All styles reference theme tokens; no inline StyleSheet colors/sizes |
| Animations & motion (§1.7) | `react-native-reanimated` (+ `moti`) | Never RN `Animated`; durations/easings from tokens |
| Gestures (§5) | `react-native-gesture-handler` | All swipes/drags/dismissals; never PanResponder |
| Custom drawing/effects | `@shopify/react-native-skia` | Gradients, waveform, custom shapes |
| Designer animations (§4) | `lottie-react-native` | Payment success, verified tick, empty-state art |
| Images (§3.7) | `@d11/react-native-fast-image` | Placeholder + 200ms transition, mandatory |
| Lists (§2.4) | `@shopify/flash-list` | Any list >10 items |
| Bottom sheets (§2.3, §3.6) | `@gorhom/bottom-sheet` | All sheets |
| Haptics (§1.8) | `react-native-haptic-feedback` | Only the four mapped events |
| Blur & translucency | `@react-native-community/blur` | Translucent tab bar/header if used |
| Icons (§1.6) | `react-native-svg` + Lucide | One set, stroke weight 2 |
| Keyboard (§2.5) | `react-native-keyboard-controller` | Every screen with inputs |
| Safe areas (§2.1) | `react-native-safe-area-context` | `useSafeAreaInsets`; never hardcoded |
| Navigation (§2.3) | `@react-navigation/native` (native-stack + bottom-tabs) | Tabs/stack/modal per model |
| Maps (§4.2 audition) | `react-native-maps` (Google provider) | Map view + navigation handoff |
| Media playback | `react-native-video` | Portfolio video/audio playback |
| Realtime (chat) | `@supabase/supabase-js` Realtime | Chat channels only; data still via API layer where possible |
| Server state (§4) | RTK Query (`@reduxjs/toolkit`) | All server fetching/caching |
| Client state | RTK slices | Session, UI flags, offline queue, form drafts |

Rules:
- These ship pre-installed in the CKR RN starter — agents never add UI libraries beyond this table.
- If a screen needs something outside this table, stop and propose it — don't install it.
- Version pins live in the starter's `package.json`; this table defines *what*.
