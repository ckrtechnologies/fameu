# Argosmob Tech and AI Pvt. Ltd.
## Project Agent Guidelines — Version 2.0

---

# 1. Global Design & Theming

All design tokens — colors, spacing, and typography — must be defined in a central configuration file. No hex codes or font sizes may be hardcoded inline anywhere in the project.

## 1.1 Typography System

Use **Outfit** (web) or **Inter** (mobile) exclusively. The following scale is non-negotiable:

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `h1` | 32px | 700 Bold | Main screen / page titles |
| `h2` | 24px | 600 SemiBold | Section headers |
| `h3` | 20px | 500 Medium | Card / module titles |
| `body` | 16px | 400 Regular | Main content text |
| `caption` | 12px | 400 Regular | Subtext, timestamps, hints |

## 1.2 Color Palette

| Token | Hex | Light Mode | Dark Mode |
|-------|-----|------------|-----------|
| `primary` | `#0033FF` | Electric blue — brand signature | Same |
| `background` | `#FFFFFF` / `#121212` | White | Sleek black |
| `surface` | `#F8FAFC` / `#1E1E1E` | Light card | Dark card |
| `text.main` | `#0F172A` / `#F8FAFC` | Near-black | Off-white |
| `text.muted` | `#64748B` / `#94A3B8` | Slate | Lighter slate |
| `success` | `#10B981` | Green | Same |
| `danger` | `#EF4444` | Red | Same |
| `warning` | `#F59E0B` | Amber | Same |

---

# 2. Security

> ⚠️ **Security rules are mandatory on every project. No exceptions. Missing any of these is a critical defect.**

## 2.1 Input Validation & Sanitization

- Use `zod` or `express-validator` on all Express API routes — validate every `req.body`, `req.params`, and `req.query` before touching the database.
- Never trust client-supplied data. Validate data types, lengths, and allowed values at the API boundary.
- Escape all user-generated content before rendering in web views to prevent XSS.

## 2.2 Rate Limiting

- Install `express-rate-limit` on all public API endpoints.
- Auth endpoints (`/login`, `/register`, `/otp`) must have a stricter limit: max **5 requests per 15 minutes** per IP.
- General API: max **100 requests per minute** per authenticated user.

## 2.3 CORS Policy

- Never use wildcard (`*`) CORS in production. Define an explicit allowlist of origins per environment.
- Store allowed origins in environment variables. Separate configs for dev, staging, and production.

```js
// src/config/cors.js
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
module.exports = { origin: allowedOrigins, credentials: true };
```

## 2.4 Authentication & JWT

- Access tokens: short-lived (**15 minutes**). Refresh tokens: long-lived (**7–30 days**).
- Implement **refresh token rotation** — invalidate the old token on every refresh.
- Store tokens only in secure native storage (`react-native-keychain` / `expo-secure-store`). **Never `AsyncStorage`.**
- Maintain a token blacklist / revocation table in Supabase for logout and forced sign-out.

## 2.5 Supabase Row Level Security (RLS)

- Every new table must have an RLS policy defined before it ships.
- Default policy: **deny all**. Explicitly grant only what is needed per role (`anon`, `authenticated`, `service_role`).
- Never use the `service_role` key on the client side. It bypasses RLS entirely.
- Audit RLS policies as part of every feature review before production deployment.

## 2.6 Payment Security (Cashfree / Razorpay)

- Always verify webhook signatures before processing any payment event using HMAC-SHA256.
- Use **idempotency keys** on all payment-triggering API calls to prevent double charges.
- Never log full card details, CVV, or raw payment responses. Log only order IDs and status.
- Store payment gateway credentials exclusively in environment variables.

```js
// Webhook signature verification (Razorpay)
const crypto = require('crypto');
const expectedSig = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex');
if (expectedSig !== req.headers['x-razorpay-signature']) {
  return res.status(400).json({ success: false, error: 'Invalid signature' });
}
```

---

# 3. Web Portals & Admin Panels

## 3.1 Tech Stack & Structure

- Tech stack: plain HTML, CSS, and vanilla JavaScript unless the client specifically requests a framework.
- Each web domain must have a `src/theme/` folder containing CSS variables and typography configuration mapping the global design rules.
- All screens must be fully responsive across mobile, tablet, and desktop using standard CSS media queries.

## 3.2 Navigation & Layout

- Implement structural layout shifts for smaller screens: sidebars collapse into slide-out hamburger menus on mobile.
- Wide elements such as data tables must scroll horizontally without breaking the page width.
- Modals must use auto height/width based on content — no unnecessary scrollbars.

## 3.3 Data Tables

- All tabular data screens must include **Excel (.xlsx) and PDF export** options using `jspdf` and `xlsx` libraries.
- Tables must support client-side search, column sorting, and pagination for datasets exceeding 20 rows.
- Include a visible row count and current page indicator.

## 3.4 Forms & Dropdowns

- Large dropdown lists (more than 10 options) must include a text search field to filter options.
- All dropdown options must be sorted alphabetically by default.
- Form inputs must display clear visual states for `focus`, `error`, `success`, and `disabled`.
- Error messages must appear directly below the relevant input field.

---

# 4. Mobile Apps — React Native CLI

## 4.1 Folder Structure

```
src/
  screens/        # Full-screen UI views
  components/     # Reusable UI elements
  navigation/     # React Navigation config
  store/          # Redux slices (RTK)
  services/       # API logic (RTK Query)
  utils/          # Helpers, permissions, formatters
  theme/          # Colors, typography, spacing tokens
  config/         # App-level config & env access
```

## 4.2 State & Data Fetching

- All network requests must use **RTK Query** with centralized endpoints, strict cache invalidation tags, and proper error handling.
- No raw `fetch()` or `axios()` calls scattered in UI components.
- Use `react-native-mmkv` for fast local caching of user preferences and non-sensitive cached data.
- Every screen that fetches data must show a `SkeletonLoader` or consistent loading spinner — no blank white screens.
- Any list or feed returning zero results must display a standardized `EmptyState` component with an icon, message, and action button.

## 4.3 Styling

- Use React Native `StyleSheet.create()` exclusively.
- Do not install third-party UI frameworks (`NativeBase`, `NativeWind`, `UI Kitten`) unless specifically requested by the client.
- Avoid hardcoded pixel values for layout dimensions. Use `Dimensions.get('window')` or `react-native-size-matters` for responsive scaling.

## 4.4 Core Reusable Components

> These components must exist in every project. Inline styling of raw `TouchableOpacity`, `TextInput`, or `Modal` is not permitted.

- `<CustomButton />` — handles loading state, disabled state, and variant styles (primary / secondary / ghost).
- `<CustomInput />` — handles focus, error, and disabled visual states. Error message renders below the input.
- `<CustomModal />` — wraps `react-native-bottom-sheet` for mobile-native feel.
- `<SkeletonLoader />` — consistent loading placeholder for data-fetching screens.
- `<EmptyState />` — standardized empty state with icon, message, and optional action button.

## 4.5 Navigation

- Use **React Navigation** as the standard navigation library.
- Hide the bottom tab bar on deep child screens (e.g., detail views) to maximize screen real estate.
- Always provide a visible back button in the header on child screens.
- Centralize all navigation configuration in `src/navigation/`.

## 4.6 Device & System Handling

- Always wrap primary screens in `SafeAreaView` and configure `StatusBar` style (light/dark) dynamically based on screen background.
- Implement `KeyboardAvoidingView` on all screens with forms. Dismiss keyboard on tap outside.
- All profile pictures and media banners must use `expo-image` or `react-native-fast-image` for caching.
- Centralize all OS permissions (camera, gallery, notifications) in `src/utils/permissions.js`. Always check and gracefully handle denied states before launching native modals.

## 4.7 Performance

- Always use `FlatList` or `SectionList` for arrays of data. Never `map()` over arrays inside a `ScrollView`.
- Implement lazy loading / pagination on all list screens that could exceed 20 items.
- Use `React.memo()` and `useCallback()` on list item components rendered inside `FlatList`.
- Compress images before upload using `expo-image-manipulator`. Never upload originals directly.

## 4.8 CLI & Build

- This project uses **React Native CLI**, not Expo managed workflow.
- After any native module installation, always run: `cd ios && pod install`
- Test on both iOS and Android after every native dependency change.

---

# 5. Backend — Node.js & Express

## 5.1 Domain-Driven Structure

```
src/
  api/
    auth/             # auth.routes.js, auth.controller.js, index.js
    users/            # users.routes.js, users.controller.js, index.js
    payments/         # payments.routes.js, payments.controller.js, index.js
  services/           # notification.service.js, email.service.js
  sockets/            # socketManager.js
  core/
    middlewares/      # errorHandler.js, auth.middleware.js, rateLimiter.js
  config/             # supabase.js, firebase.js, env.js
  utils/              # helpers, validators
```

## 5.2 Routes & Controllers

- **Controllers are thin.** Their only job: extract data from `req`, call a service or DB function, and return a formatted response. No complex business logic in controllers.
- Route files only define the path, HTTP method, middleware chain, and controller reference. No inline functions in the router.
- All async controllers must use `try/catch` and pass errors to the global error handler.

## 5.3 Standardized API Response

```json
// Success
{ "success": true, "data": { ... }, "message": "Optional string" }

// Error
{ "success": false, "error": "Human-readable message" }
```

## 5.4 Global Middlewares

- `errorHandler.js` — catches all unhandled errors. Never send raw stack traces to the client in production.
- `auth.middleware.js` — validates JWT on protected routes. Attaches decoded user context to `req.user`.
- `rateLimiter.js` — applies `express-rate-limit`. Stricter limits on `/auth/*` routes.
- `requestLogger.js` — logs method, route, status, and response time using `morgan` or `pino`.

## 5.5 WebSockets (Socket.IO)

- All real-time event listeners and emitters are managed centrally in `src/sockets/socketManager.js`.
- When a REST API action triggers a real-time update, the controller imports the socket instance to emit — never initializes a new socket connection inline.
- Authenticate socket connections using the same JWT middleware as REST routes.

## 5.6 Push Notifications (FCM)

- All FCM notifications are dispatched through `src/services/notification.service.js`.
- Never initialize `firebase-admin` inline. Use the pre-initialized instance from `src/config/firebase.js`.
- Log every notification attempt (user ID, type, success/failure) for debugging and retry logic.
- Implement a **retry queue** — store failed pushes in a DB table and retry on a schedule.

## 5.7 Environment & Config

- Never hardcode secrets. All keys must be loaded via `dotenv` and exported from `src/config/`.
- Use three environment files: `.env.development`, `.env.staging`, `.env.production`
- Commit a `.env.example` with all required variable names (no values) to the repository.
- **Fail fast on startup** — validate that all required env vars are present before the server starts listening.

---

# 6. Testing & Code Quality

## 6.1 Testing Standards

- Unit tests are required for all service functions and utility helpers using **Jest**.
- Minimum coverage floor: **60%** on `src/services/` and `src/utils/` before a feature branch can be merged.
- Maintain a **Postman or Bruno collection** per API module, committed to the repository. This is the source of truth for API contracts.
- API integration tests must cover: happy path, validation error, auth error, and not-found cases for every endpoint.

## 6.2 Linting & Formatting

- Shared `.eslintrc.js` and `.prettierrc` must be committed in every repository root.
- Install `husky` and `lint-staged`. Enforce lint + format checks on every commit via pre-commit hooks.
- No warnings are allowed to be committed — treat all ESLint warnings as errors in CI.

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## 6.3 Code Review Checklist

Every pull request must pass the following before merge:

1. No hardcoded secrets, hex colors, or pixel values.
2. RLS is enabled on any new Supabase tables.
3. All new API routes have input validation and rate limiting.
4. Payment webhooks are signature-verified.
5. New env vars are added to `.env.example`.
6. Unit tests cover any new service logic.
7. The Postman / Bruno collection is updated if API contracts changed.

---

# 7. Performance & Optimization

## 7.1 API & Database

- Every API endpoint returning a list must support cursor-based or offset **pagination**. No unbounded queries.
- Always use explicit column selection in Supabase: `.select('id, name, created_at')` — never `.select('*')` in production.
- Add database indexes for all columns used in `.eq()`, `.filter()`, or `.order()` queries.
- Use Supabase Edge Functions for heavy compute tasks to offload the Express server.

## 7.2 Media & CDN

- Compress images before upload using `expo-image-manipulator` (mobile) or `sharp` (backend). Target: JPEG quality 80, max 1200px wide.
- Serve all media through the VPS CDN — never directly from Supabase Storage URLs in production.
- Use `cache-control` headers on static assets: `max-age=31536000` for immutable assets, `no-cache` for API responses.

## 7.3 Mobile Bundle

- Use dynamic imports for heavy screens not in the initial navigation flow.
- Flatten Redux state — avoid deeply nested objects that trigger unnecessary re-renders.
- Use `React.memo()` and `useCallback()` on list item components rendered inside `FlatList`.

---

# 8. DevOps & Deployment

## 8.1 VPS Standard Stack

| Layer | Tool / Rule |
|-------|-------------|
| Process Manager | PM2 — auto-restart on crash, startup on reboot |
| Reverse Proxy | Nginx — handles SSL termination and port forwarding |
| SSL | Let's Encrypt via Certbot — auto-renew enabled |
| Firewall | UFW — allow only ports 22 (SSH), 80, 443. Block all else. |
| Monitoring | PM2 logs + UptimeRobot or BetterStack for uptime alerts |
| Backups | Supabase daily backups enabled. VPS snapshot weekly. |

## 8.2 CI/CD Pipeline

- Every repository must have a **GitHub Actions** workflow that runs on every pull request.
- CI pipeline must run: ESLint check → unit tests → build verification. PRs failing CI cannot be merged.
- Staging deployments trigger automatically on merge to `develop`. Production requires a manual approval step.

## 8.3 Versioning

- All projects use semantic versioning: `MAJOR.MINOR.PATCH`
- Maintain a `CHANGELOG.md` in the repository root. Update it on every release.
- Tag every production release in Git: `git tag -a v1.2.0 -m "Release notes here"`
- Mobile app builds must have version + build number updated in both iOS (`Info.plist`) and Android (`build.gradle`) before every store submission.

---

# 9. Project Handoff & Documentation

## 9.1 Repository README Standard

Every repository root must contain a `README.md` with all of the following sections:

- Project overview — what it does and who it is for.
- Tech stack list with versions.
- Environment setup — step-by-step instructions to run the project locally from scratch.
- All required environment variables with descriptions (no values — point to `.env.example`).
- Deployment instructions for staging and production.
- Link to architecture diagram (Figma, Miro, or Whimsical).
- Link to Postman / Bruno API collection.

## 9.2 API Documentation

- Auto-generate Swagger / OpenAPI docs from route definitions using `swagger-jsdoc` and `swagger-ui-express`.
- Swagger UI must be available at `/api-docs` on the staging environment.
- Every endpoint must document: method, path, request body schema, response schema, and possible error codes.

## 9.3 Seed Data

- Every project must include a `scripts/seed.js` that populates the database with enough realistic data to develop and demo all major features.
- Seed script must be **idempotent** — running it twice must not create duplicates.
- Any developer must be able to go from zero to a working local environment in **under 10 minutes**.

## 9.4 Client Handoff Checklist

1. All environment variables documented and transferred securely (password manager).
2. Production `.env` files stored in a password manager shared with the client.
3. DNS, SSL, and VPS access credentials transferred.
4. App store accounts (Apple / Google) access confirmed.
5. Swagger API docs URL shared.
6. Git repository access granted to client's nominated technical contact.
7. 30-minute walkthrough call completed with client's team.

---

# 10. How These Guidelines Accelerate Development

| Without Guidelines | With These Guidelines |
|---|---|
| New dev takes 2 weeks to understand project structure | 2 days — folder structure is fully predictable |
| Design inconsistencies require client revision rounds | Eliminated — theme tokens are centralized |
| Payment bug causes double-charge incident | Prevented — webhook verification is mandated |
| Production DB exposed via missing RLS | Prevented — RLS enforced from day one |
| API docs don't exist at handoff | Auto-generated via Swagger |
| "Works on my machine" deployment failures | Eliminated — env structure is standardized |
| Each project starts from scratch | Every project is 40% done structurally from day one |

---

*Argosmob Tech and AI Pvt. Ltd. · Confidential · Version 2.0*