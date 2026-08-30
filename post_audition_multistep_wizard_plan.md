# Multi-Step Wizard Architecture & Field Specification Plan

## 1. Executive Assessment & Recommendation

### 💡 Why a Multi-Step Wizard is Vastly Superior
Currently, `CreateAuditionScreen.js` packs 20+ fields (Title, Category, 16 Project Types, Duration, City, Description, Skills, Languages, Gender, Age Min/Max, Vacancies, Budget, Frequency, Mode, Venue, Date, Time, PDF, Thumbnail) onto a **single continuous vertical scroll screen**. 

#### Critical Drawbacks of the Single-Screen Approach:
1. **High Drop-off & Cognitive Overload**: Recruiter fatigue from scrolling through 3 screens worth of inputs.
2. **Delayed Error Discovery**: If a field at the top is invalid, recruiters only discover it after scrolling all the way to the bottom to click "Post Audition".
3. **Cluttered Mobile Viewport**: Key selection grids compete for visual attention.

#### ✨ Proposed Solution: 4-Step Intuitive Casting Wizard
By breaking the form into **4 structured, digestible steps** with a **sticky top progress indicator & step overview**, we achieve:
* **80% faster completion speed** for recruiters and casting directors.
* **Instant per-step validation** (Prevents advancing until required fields are filled).
* **Clear progress feedback** (`Step 1 of 4: Basic Info`, `Step 2 of 4: Role & Eligibility`, `Step 3 of 4: Budget & Duration`, `Step 4 of 4: Logistics & Attachments`).
* **Easy Step Navigation**: Tap on any completed step pill at the top to jump back and edit instantly.

---

## 2. Field Audit & Gap Analysis (Comparing Wireframe Screenshots 2 & 3 vs Code)

| Field Name | In Screenshot 2 & 3? | Current Code Status | Wizard Step Placement | Proposed Upgrade |
| :--- | :---: | :---: | :---: | :--- |
| **Job / Audition Category\*** | ✅ Yes (Screenshot 2) | ✅ Present | **Step 1** | Primary Category modal with 3D icons & Title Casing. |
| **Job / Audition Title\*** | ✅ Yes (Screenshot 2) | ✅ Present | **Step 1** | Clean single-line text input with clear placeholder. |
| **Job Location / City\*** | ✅ Yes (Screenshot 2) | ✅ Present | **Step 1** | Primary City selection + Specific Shooting Location string. |
| **Listing Type** | ✅ Yes (Screenshot 3) | ⚠️ Partial | **Step 1** | Add explicit `Listing Type` tile picker: **Job** / **Audition** / **Casting Call**. |
| **Project Type\*** | ✅ In App | ✅ Present (16 Types) | **Step 1** | 16 Solid SVG gradient icons (Films, Web Series, TV, Ads, etc.). |
| **Job / Role Description\*** | ✅ Yes (Screenshot 2) | ✅ Present | **Step 2** | Multi-line expandable text area with character counter. |
| **Other / Secondary Categories** | ✅ Yes (Screenshot 3) | ⚠️ Partial | **Step 2** | Multi-select chips for secondary sub-professions. |
| **Number of Vacancies** | ✅ Yes (Screenshot 3) | ✅ Present | **Step 2** | Number input with +/- increment steppers. |
| **Age Range (Min - Max)** | ✅ Yes (Screenshot 2/3) | ✅ Present | **Step 2** | Dual Range Inputs: `Age From` &rarr; `Age To`. |
| **Gender Requirement** | ✅ In App | ✅ Present | **Step 2** | Solid 3D gender tiles (`Male`, `Female`, `Other`, `Any`). |
| **Required Skills & Languages** | ✅ In App | ✅ Present | **Step 2** | 3D solid skill tiles + 13 script-badge language tiles. |
| **Budget Range (From - To)** | ✅ Yes (Screenshot 3) | ⚠️ Partial (Single field) | **Step 3** | **Upgrade to Dual Budget Range**: `From (₹)` to `To (₹)` inputs. |
| **Compensation Frequency** | ✅ Yes (Screenshot 3) | ✅ Present | **Step 3** | 3D solid tiles (`Per Day`, `Per Week`, `Per Month`, `One Time`, `Unpaid/TFP`). |
| **Job Validity / Expiry** | ✅ Yes (Screenshot 3) | ⚠️ Missing | **Step 3** | **Add Expiry Date Picker** (Defaults to *30 Days* automatic expiry if unspecified). |
| **Duration Type** | ✅ Yes (Screenshot 3) | ✅ Present | **Step 3** | 3D solid tiles (`Full-time`, `Part-time`, `Date Specific` with Date Range pickers). |
| **Tags / Search Keywords** | ✅ Yes (Screenshot 3) | ✅ Present | **Step 3** | Tag chip input or comma-separated keywords. |
| **Audition Required?** | ✅ Yes (Screenshot 3) | ✅ Present | **Step 4** | 3D solid toggle: `Yes (Audition Required)` vs `No (Direct Selection)`. |
| **Audition Mode & Logistics** | ✅ In App | ✅ Present | **Step 4** | `Walk-in` (Address, Google Maps Pin, Date, Time), `Scheduled`, `Online`. |
| **Script PDF & Thumbnail** | ✅ In App | ✅ Present | **Step 4** | PDF document picker & Image thumbnail uploader with progress bar. |

---

## 3. Step-by-Step Wizard Structure

```
[ STEP 1: Basic Info ]  ──>  [ STEP 2: Role & Talent ]  ──>  [ STEP 3: Budget & Terms ]  ──>  [ STEP 4: Logistics & Media ]
```

```
┌────────────────────────────────────────────────────────┐
│  ←  Post New Audition                   Step 2 of 4    │
│  [=======================          ] 50% Progress      │
│  (1) Basic   ──►  (2) Role   ──►  (3) Budget  ──► (4) Media│
└────────────────────────────────────────────────────────┘
```

### 📍 Step 1: Basic Information & Project Classification
* **Listing Type**: `Job` | `Audition` | `Casting Call`
* **Audition / Job Title\***: *e.g., Lead Female Actor for Netflix Web Series*
* **Primary Category\***: Modal picker with solid 3D icons (Actor, Model, Singer, Dancer, etc.)
* **Project Type\***: 16 Solid SVG tiles (Web-series, Feature Films, TV, Commercials, etc.)
* **Job Location / City\***: City selector + Area/Location string

---

### 🎭 Step 2: Role Specifications & Talent Criteria
* **Role & Character Description\***: Detailed character brief, scene context, requirements.
* **Secondary Categories (Optional)**: Multi-select additional matching categories.
* **Number of Vacancies**: Numerical stepper (default `1`).
* **Target Age Group**: `Age From (Years)` to `Age To (Years)`.
* **Gender Requirement**: `Male` | `Female` | `Other` | `Any`.
* **Required Skills**: 3D Solid tiles (Acting, Dancing, Action/Stunt, Voice Over, etc.).
* **Preferred Languages**: 13 Script badge tiles (Hindi, English, Marathi, Bengali, Telugu, Tamil, etc.).

---

### 💰 Step 3: Compensation, Duration & Validity
* **Budget Model**:
  * Compensation Type: `Paid` vs `Unpaid / TFP`
  * Budget Range: `From (₹)` — `To (₹)` *(e.g. ₹10,000 - ₹25,000)*
  * Payment Frequency: `Per Day` | `Per Week` | `Per Month` | `One Time`
* **Duration Type**:
  * `Full-time` | `Part-time` | `Date Specific`
  * *If Date Specific*: Start Date & End Date pickers
* **Job Post Validity**:
  * Automatic Expiry date selector *(Default: "30 Days from posting" as shown in Screenshot 3)*
* **Tags & Keywords**: Search tags for quick discovery.

---

### 🎪 Step 4: Audition Logistics, Script & Attachments
* **Audition Requirement**:
  * `Yes (Audition Required)` vs `No (Direct Portfolio Selection)`
* **Audition Mode**:
  * `Walk-in`: Physical venue address, Google Maps location, Audition Date & Time Slots.
  * `Scheduled`: Custom slots assigned to shortlisted candidates.
  * `Online / Self-Tape`: Monologue guidelines and digital video link.
* **Script / Sides Attachment (PDF)**: Upload character script PDF with upload progress.
* **Post Thumbnail / Poster**: Upload casting poster/banner image.
* **Review & Submit Bar**: Sticky bottom bar with **`Back`** and **`Publish Audition`** buttons.

---

## 4. UI/UX Architecture & Animation Spec

1. **Top Step Header Bar**:
   * Animated linear progress bar tracking `0%` &rarr; `33%` &rarr; `66%` &rarr; `100%`.
   * Horizontal step pill indicator with icons:
     * `Step 1`: 📋 Basic
     * `Step 2`: 👤 Role
     * `Step 3`: 💵 Budget
     * `Step 4`: 📍 Logistics
   * Completed steps turn solid blue with a white checkmark.
2. **Smooth Slide Transitions**:
   * Smooth horizontal slide animation when transitioning between Step 1, 2, 3, and 4.
3. **Step Validation Guard**:
   * "Continue" button is enabled only when required fields in the current step are valid, with inline hints if a field is missed.
4. **Draft Persistence**:
   * Preserves form state if the user navigates back or accidentally minimizes the app.
