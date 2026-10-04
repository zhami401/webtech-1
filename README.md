# Stradivarius Mega Silkway Project — Midterm

This repository contains a finished multi-page (6 pages) HTML5 and CSS3 website developed as a student project for the **Introduction to Web Technologies** course at Astana IT University.

### Team Members
* **Auyezkhan Alina**
* **Kharagussova Zhamilya**
## Site Structure (Page List)
1. `index.html` — Home / General info about Stradivarius Mega Silkway
2. `about-stradivarius.html` — Store history, location, contacts, and opening hours
3. `catalog.html` — Seasonal Autumn Collection Vibe & categories
4. `care.html` — Garment care guide & Style inquiry form
5. `visit-and-feedback.html` — Store visit booking & Feedback form
6. `registration.html` — Account Registration and Login page

---

## Three User Journeys
All three journeys can be completed end-to-end by a single visitor without server-side dependencies:

1. **Journey 1: Check Store Info & Hours**
   * **Start:** Visitor lands on `index.html`.
   * **Steps:** Navigates to `about-stradivarius.html` via navigation bar → Reads brand history → Scrolls to check opening hours and store address in Astana.
   * **End:** Clicks email link to contact store managers.

2. **Journey 2: Explore Collection & Request Style Advice**
   * **Start:** Visitor opens `catalog.html`.
   * **Steps:** Browses autumn collection categories → Follows quick link to `care.html` → Reviews garment care table.
   * **End:** Fills in and submits the "Personal Style Consultation" inquiry form.

3. **Journey 3: Book a Fitting Visit**
   * **Start:** Visitor enters via `visit-and-feedback.html` (or clicks floating "Contact us" button).
   * **Steps:** Selects purpose ("Fitting") → Fills in full name, email, phone, guest count, and preferred date.
   * **End:** Clicks "Submit" button and sees the designated response block prepared for confirmation.

---

## 🛠️ Preparation for JavaScript (Freeze Tag)
As required for the midterm freeze:
* **Unique IDs:** Every form, input, button, and dynamic block has a dedicated `id` attribute.
* **Empty Containers:** Form response containers (`#visit-form-response`, `#care-form-response`) are placed in markup awaiting JS dynamic rendering.
* **State Classes:** Utility classes (`.hidden`, `.is-invalid`, `.alert-success-custom`, `.alert-danger-custom`) are pre-defined in `base.css`.

---

## Quality Pass List (Cross-Testing Findings)
Conducted 2 days prior to deadline across different devices (Desktop & Mobile):

| Found By | Page / File | Issue Description | Fix Applied |
| :--- | :--- | :--- | :--- |
| Alina | `visit-and-feedback.html` | Missing `id` attribute on main form for JS targeting | Added `id="visit-form"` and empty response container |
| Zhamilya | `registration.html` | "coming soon" disabled button text present | Removed "coming soon" label to comply with strict grading rules |
| Alina | `care.html` | Missing `id` on consultation form button | Added `id="care-submit-btn"` |
| Zhamilya | Mobile view (All) | Nav collapse behavior check | Verified layout wraps smoothly without horizontal scrollbar |


## Technical Standards & Styling Summary
1. **Stylesheet Architecture:** Clean separation into `base.css`, `alina.css`, and `zhamilya.css`. CSS custom properties (`:root`) used for design tokens.
2. **Framework & Layout:** Built on Bootstrap 5.3.3 CDN supplemented with custom Flexbox and CSS Grid layers.
3. **No Dead Links:** All links point to existing internal pages or valid external resources (`href="#"` avoided).
4. **Validation:** 100% compliant with W3C Markup & W3C CSS Validators (Zero Errors).
