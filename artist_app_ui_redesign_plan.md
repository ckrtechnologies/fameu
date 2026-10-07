# FAMEU Artist App — UI/UX Redesign & Token Parity Plan

> **Client:** FAMEU (CKR Technologies)  
> **App:** `artist_app` (React Native bare CLI)  
> **Target Parity:** `hiring_app` (Deep Obsidian & Spotlight Gold Design System)  
> **Version:** 1.0.0  
> **Date:** October 2026  
> **Core Constraint:** **STRICTLY ZERO CHANGES TO LOGIC, REDUX/RTK QUERY, DATABASE, OR BACKEND ENDPOINTS.** UI, styling, tokens, animations, transitions, modals, drawers, and keyboard handling only.

---

## 1. Executive Summary & Goals

The `hiring_app` has successfully established a high-end, production-grade visual language featuring:
1. **Deep Obsidian & Spotlight Gold Brand Palette** (`#0E0F12` background, `#17191F` surface, `#131418` headers/tab bars, `#E3B04B` / `#C8952B` primary accents).
2. **Standard Inter Typography** (purging legacy fonts such as `'Comic Sans MS'`).
3. **Robust Keyboard Handling** using `react-native-keyboard-controller`'s `KeyboardProvider` and `KeyboardAwareScrollView`.
4. **Educated Error Handling & Rich Modals** (`educatedError.js` + `CustomAlert` with reasons, action guidance, and status badges).
5. **Obsidian & Gold Navigation Parity** (Drawer with gold-bordered icon badges, verification badges, dark mode toggle, and animated Obsidian bottom tabs).
6. **Consistent Golden Outline Iconography** across navigation, cards, and sections.
7. **Crash Resilience Safeguards** (loading state CTA button guards, activity indicators inside buttons, navigation guards, safe error handling).
8. **Full-Width Community & Comments System** (eliminated crunched layouts, distinct "Add Comment" card vs "What others say?" historical list with tab filters).

This document outlines the **phased, screen-by-screen execution roadmap** to bring the `artist_app` into 100% visual and interactive parity with the `hiring_app`.

---

## 2. Parity Comparison & Gap Analysis

| Layer / Feature | `hiring_app` (Current Production Standard) | `artist_app` (Current State) | Action Required |
|---|---|---|---|
| **Theme Tokens** | `tokens.js` (Figma token mirror, Inter, Deep Obsidian, Spotlight Gold) | Legacy `theme.js` referencing `'Comic Sans MS'`, basic light/dark colors | Port `tokens.js`, update `theme.js`, `colors.light.js`, `colors.dark.js` |
| **Root Providers** | `GestureHandlerRootView` + `SafeAreaProvider` + `KeyboardProvider` + `GlobalAlertProvider` | Missing `GestureHandlerRootView` at root, missing `KeyboardProvider` | Update `App.tsx` provider hierarchy |
| **Keyboard Management** | `react-native-keyboard-controller` (`KeyboardProvider`, `KeyboardAwareScrollView`) | Core `KeyboardAvoidingView` / `KeyboardHidingView` (prone to clipping & jumping) | Install `react-native-keyboard-controller`, replace legacy wrappers |
| **Drawer Navigation** | Deep Obsidian card header, gold outline icon wrappers (`rgba(227, 176, 75, 0.08)`), verified badges, dark theme toggle | Simple list with basic icon colors, plain header, no dark theme toggle | Full UI revamp of `DrawerNavigator.js` |
| **Bottom Tab Bar** | `#131418` Deep Obsidian bar, `#E3B04B` active gold, `#22242B` border, unread badge pills | Light background, outdated pill styling, mismatched heights | Revamp `TabNavigator.js` styling to match `#131418` + `#E3B04B` |
| **Alert & Error UX** | `CustomAlert.js` with educated error reasons, actionable next steps, status badges | Basic modal with raw error strings | Port `educatedError.js` & updated `CustomAlert.js` / `GlobalAlert.js` |
| **Comments Section** | Full-width container, distinct "Add Comment" card, historical tab filters, self-profile check | Crunched margins, basic comment list, raw alerts | Port refined `CommentsSection.js` |
| **CTA Crash Resilience** | CTAs disabled on loading with `<ActivityIndicator>`, safe catch blocks | Some buttons remain active during in-flight network mutations | Apply loading guards to all primary CTAs |

---

## 3. Phase-Wise Implementation Roadmap

```mermaid
graph TD
    A[Phase 1: Foundation & Design Tokens] --> B[Phase 2: Root Providers & Keyboard Stack]
    B --> C[Phase 3: Core UI Components & Alert System]
    C --> D[Phase 4: Navigation Shell Overhaul (Drawer & Tabs)]
    D --> E[Phase 5: Screen-by-Screen UI Transformation]
    E --> F[Phase 6: Parity Audit & Quality Gate]
```

---

### Phase 1: Foundation, Tokens & Typography (Theme Layer)
**Objective:** Establish the exact token system and color palettes from `hiring_app` in `artist_app`.

#### Key Tasks:
1. **Create `artist_app/src/theme/tokens.js`**:
   - Mirror `hiring_app/src/theme/tokens.js` 1:1.
   - Define semantic colors for both `light` and `dark` modes:
     - Primary: `#E3B04B` (Dark) / `#C8952B` (Light)
     - Header & Tab Bar: `#131418`
     - Background: `#0E0F12` (Dark) / `#F8F6F1` (Light)
     - Surface: `#17191F` (Dark) / `#FFFFFF` (Light)
     - SurfaceAlt: `#1F222A` (Dark) / `#EAE6DC` (Light)
     - Border: `#2C2F38` (Dark) / `#E8E4DA` (Light)
     - Gold Accents & Borders: `'rgba(227, 176, 75, 0.3)'` & `'rgba(227, 176, 75, 0.08)'`
   - Define Inter typography hierarchy: `display`, `h1`, `h2`, `h3`, `body`, `bodyBold`, `caption`, `overline`.
   - Standardize spacing scale: `xs: 4`, `s: 8`, `m: 12`, `l: 16`, `xl: 24`, `xxl: 32`, `xxxl: 48`.
   - Standardize radii: `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `full: 9999`.
2. **Update `artist_app/src/theme/theme.js`**:
   - Export tokens, typography aliases (`h1`, `h2`, `h3`, `h4`, `body`, `body2`, `caption`), spacing, radius, elevation, motion.
   - Eliminate `'Comic Sans MS'` entirely and bind to `Inter`.
3. **Synchronize `colors.light.js` and `colors.dark.js`**:
   - Align token aliases so existing screen style sheets resolve correctly without breaking backwards compatibility.

---

### Phase 2: Root Setup & Keyboard Controller Stack
**Objective:** Replicate the rock-solid provider hierarchy and keyboard handling of `hiring_app`.

#### Key Tasks:
1. **Dependency Alignment**:
   - Install `react-native-keyboard-controller` in `artist_app` (pinning to `^1.22.6` matching `hiring_app`).
2. **Revamp `artist_app/App.tsx`**:
   - Wrap root in `<GestureHandlerRootView style={{ flex: 1 }}>`.
   - Configure `<SafeAreaProvider initialMetrics={initialWindowMetrics}>`.
   - Wrap tree with `<KeyboardProvider statusBarTranslucent={true} navigationBarTranslucent={true}>`.
   - Maintain Redux `<Provider>` and `<ThemeProvider>`.
   - Mount `<GlobalStatusBar />` using `#131418` Deep Obsidian background and `light-content` bar style.
   - Mount `<GlobalAlertProvider ref={GlobalAlertRef} />` and `<Toast config={toastConfig} />`.
   - Keep `<ErrorBoundary>` at the top level to catch unhandled JS crashes gracefully.

---

### Phase 3: Core UI Components & Educated Alert System
**Objective:** Standardize reusable inputs, buttons, and alert modals to look premium with golden accents.

#### Key Tasks:
1. **Port Educated Error Engine**:
   - Create `artist_app/src/utils/educatedError.js` matching `hiring_app`.
   - Parse error payloads, network timeouts, session expirations, not-null constraints, and self-profile actions into clear, actionable advice.
2. **Revamp `CustomAlert.js` & `GlobalAlert.js`**:
   - Upgrade `CustomAlert.js` to render the gold-accented educational card with bulb icon (`bulb-outline`), reason bullet, and action recommendation.
   - Support `type: 'error' | 'warning' | 'success' | 'info'` with corresponding background badge tints.
   - Support `GlobalAlert.showError(title, error, contextMessage)` throughout the app.
3. **Enhance Form Controls (`src/components/forms/`)**:
   - `CustomButton.js`: Add Spotlight Gold gradient/solid style, disabled opacity (`0.5`), and auto `<ActivityIndicator>` when `loading={true}`.
   - `CustomInput.js`: Deep Obsidian background (`#17191F` dark / `#FFFFFF` light), subtle gold focus border (`#E3B04B`), and clean placeholder styling.
   - `CustomDropdown.js`, `CustomCheckbox.js`, `CustomRadio.js`: Apply gold checkmarks and border accents.
4. **Port Refined `CommentsSection.js`**:
   - Eliminate side-padding bottlenecks (ensure 100% full-width layout).
   - Distinct "Add Comment" card and separate "What others say?" historical section.
   - Tab filters for "Artists" vs "Recruiters".
   - Integrate `GlobalAlert.showError` for invalid or self-profile comment actions.

---

### Phase 4: Navigation Shell Overhaul (Drawer & Bottom Tabs)
**Objective:** Deliver identical high-end navigation chrome to `hiring_app`.

#### Key Tasks:
1. **Revamp `DrawerNavigator.js`**:
   - **Top Inset Header**: Safe area pad with Deep Obsidian `#131418`.
   - **Artist Profile Card**: Circular avatar with gold border, artist name, username, email/phone.
   - **Verification Badge**: Distinct trust badge (`VERIFIED ARTIST` in green `#10B981` or `KYC PENDING` in gold `#E3B04B`).
   - **Section Categorization**:
     - *MAIN NAVIGATION* (Dashboard, Auditions, Applications, Portfolio, Saved).
     - *UTILITIES & HELP* (Tutorial, FAQ, Legal, Contact Us, Settings).
     - *APPEARANCE* (Dark Theme Switch with gold active track `#E3B04B`).
     - *ACCOUNT ACTIONS* (Log Out & Delete Account in red tint).
   - **Iconography Consistency**: All menu items wrapped in the signature container:
     ```js
     iconContainer: {
       width: 36,
       height: 36,
       borderRadius: 10,
       backgroundColor: 'rgba(227, 176, 75, 0.08)',
       borderWidth: 1,
       borderColor: 'rgba(227, 176, 75, 0.3)',
       justifyContent: 'center',
       alignItems: 'center',
       marginRight: 14,
     }
     ```
   - **Modals**: Educated confirmation alerts on Logout and Delete Account.
2. **Revamp `TabNavigator.js`**:
   - Deep Obsidian tab bar background (`#131418`).
   - Top border `#22242B`.
   - Active icon and label tint in Spotlight Gold (`#E3B04B`), inactive in `#8A8F9E`.
   - Smooth spring scale micro-animation on tab switch.
   - Unread badge counter pills with gold/red highlights.

---

### Phase 5: Screen-by-Screen UI Transformation
**Objective:** Polish every screen to follow the Obsidian & Gold aesthetic without modifying business logic.

#### Group A: Authentication & Onboarding
- `SplashScreen.js`: Deep dark backdrop with glowing gold FAMEU logo and smooth fade-in.
- `OnboardingScreen.js`: High-contrast slides with gold CTA buttons.
- `LoginScreen.js` & `OtpScreen.js`:
  - Wrap in `KeyboardAwareScrollView`.
  - Dark inputs with gold active focus.
  - Primary button disabled while SMS OTP request is pending.

#### Group B: Core Tab Screens
- `ArtistDashboardScreen.js`:
  - **Score Widget & Checklist**: Spotlight Gold progress indicator, clean card surfaces (`#17191F`).
  - **Live Radar & Ticker**: High-contrast gold accents on active feeds.
  - **Audition Cards**: Clean typography, rounded corners (`radius.md`), golden outline icons for date, location, and compensation.
  - **Recruiter & Pro Tips Carousels**: Obsidian surface backgrounds with gold highlights.
- `AuditionDiscoveryScreen.js`:
  - Sticky search & filter bar with gold active chips.
  - Clean card listings with verified badges.
- `MyApplicationsScreen.js`:
  - Tab pills ("Applied", "Shortlisted", "Selected", "Rejected") styled with subtle gold borders.
  - Empty state with gold illustration and CTA.
- `ArtistProfileScreen.js` & `PublicProfileScreen.js`:
  - Profile hero header with gold verified star badge.
  - Full-width `CommentsSection`.
  - Media showcase (photos & videos) on dark gallery cards.
- `InboxScreen.js` & `ChatScreen.js`:
  - Message bubbles: Artist sent messages in Spotlight Gold (`#C8952B` / `#E3B04B` with dark text `#1A1200`), received in dark obsidian surface (`#1F222A`).
  - Keyboard avoiding input container using `KeyboardStickyView` or `KeyboardAwareScrollView`.

#### Group C: Profile Management & Secondary Screens
- `EditProfileScreen.js` & `ArtistFormScreen.js`:
  - Wrap in `KeyboardAwareScrollView`.
  - Structured form cards with gold section headers.
  - CTAs disabled during save/upload with `<ActivityIndicator>`.
- `PhotoGalleryScreen.js` & `VideoPortfolioScreen.js`:
  - Clean dark grid layout with gold upload button.
- `SavedAuditionsScreen.js`, `ConnectionListScreen.js`, `ProfileVisitorsScreen.js`:
  - Unified list items with gold action buttons.
- `FaqScreen.js`, `TutorialScreen.js`, `LegalScreen.js`, `ContactUsScreen.js`, `ArtistSettingsScreen.js`:
  - Clean obsidian reading layout, Inter typography, gold contact links.

---

### Phase 6: Parity Audit, Crash Resilience & Native Gate Verification
**Objective:** Verify visual excellence and stability across Android and iOS.

#### Checklist:
1. **Visual Parity**: Side-by-side comparison with `hiring_app` across colors, fonts, margins, and icons.
2. **Keyboard Testing**: Ensure no input is hidden behind the keyboard on Android or iOS.
3. **Crash Resilience**:
   - Verify every async CTA disables on tap and displays a spinner.
   - Test offline/error scenarios to ensure `CustomAlert` renders educational guidance rather than blank crashes.
4. **Android Build Verification**: Run `./gradlew assembleRelease` or build check in `artist_app/android`.

---

## 4. Architectural Guarantees (Non-Negotiables)

1. **NO Business Logic Alterations**: All Redux hooks (`useSelector`, `useDispatch`), RTK Query API endpoints, and mutation signatures remain 100% untouched.
2. **NO Backend or Schema Changes**: Request payloads, parameter names, and responses remain identical.
3. **Vanilla StyleSheet with Design Tokens**: No Tamagui, no NativeWind, no raw hardcoded hex codes.
4. **JavaScript Only**: All code strictly `.js` / `.jsx`.

---

## 5. Implementation Sequence & Next Action

| Step | Scope | Status | Deliverables |
|---|---|---|---|
| **Phase 1** | Tokens & Theme System | **COMPLETED** | `tokens.js`, `theme.js`, `colors.light.js`, `colors.dark.js` |
| **Phase 2** | Root & Keyboard Setup | **COMPLETED** | `App.tsx`, `KeyboardProvider`, `GestureHandlerRootView` |
| **Phase 3** | Core UI & Alert Engine | **COMPLETED** | `educatedError.js`, `CustomAlert.js`, `GlobalAlert.js`, `CustomButton.js`, `CommentsSection.js` |
| **Phase 4** | Navigation Shell | **COMPLETED** | `DrawerNavigator.js`, `TabNavigator.js` |
| **Phase 5** | Screen-by-Screen UI Transformation | **COMPLETED** | `LoginScreen.js`, `OtpScreen.js`, `ArtistDashboardScreen.js`, `AuditionDiscoveryScreen.js`, `AuditionCard.js`, `MyApplicationsScreen.js`, `ArtistProfileScreen.js`, `PublicProfileScreen.js`, `ChatScreen.js`, `InboxScreen.js`, `ShrinkableHeader.js` |
| **Phase 6** | Parity Audit, Crash Resilience & Release Build | **COMPLETED** | Metro compilation verified (100% success), Gradle build verified (`BUILD SUCCESSFUL`), all legacy colors & buttons audited |
