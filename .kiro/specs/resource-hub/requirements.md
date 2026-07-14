# Requirements Document

## Introduction

The CFES Toolbox (Boîte à outils de la FCEG) is a bilingual (English/French) multi-page resource hub web application for engineering students and student societies. It surfaces curated resources stored in a Google Sheet, organized by category, and allows users to filter, search, save, and explore resources. The frontend is plain HTML/CSS/JS served by a bare Node.js server; the backend exposes the existing Google Sheets API (`GET /api/sheet`, `POST /api/sheet`).

The application consists of six pages: Landing, All Resources, Category, Saved Resources, User Profile, and About.

---

## Glossary

- **App**: The CFES Toolbox single-origin web application served from `http://localhost:7373`.
- **Resource**: A single row from the Google Sheet with the fields: `id`, `title-en`, `titre-fr`, `link-en`, `lien-fr`, `description-en`, `description-fr`, `categories` (comma-separated), `free` (boolean).
- **Category**: A topic group label read dynamically from the `categories` field of Resource rows in the Google Sheet. The set of categories is not hardcoded; it is derived at runtime from all distinct category values present in the sheet data.
- **Language Toggle**: A control that switches the entire UI between English ("EN") and French ("FR"). Default is English.
- **Active Language**: The currently selected display language (EN or FR). Persisted in `localStorage`.
- **Resource Card**: A visual element that represents one Resource, showing its localized title, localized description, category badges, a **Free** or **Paid** badge, and a save action.
- **Saved Resources**: Resources the user has bookmarked locally, stored in `localStorage` under the key `cfes-saved`.
- **Nav Menu**: A hamburger-triggered overlay/drawer that links to all six pages.
- **Landing Page**: The entry-point page (`/` or `index.html`) displaying the hero section and a static grid of navigation bubbles linking to the five other pages.
- **All Resources Page**: A page (`/resources.html`) listing every resource with search and filter controls.
- **Category Page**: A page (`/category.html?cat=<name>`) listing resources for one specific Category.
- **Saved Page**: A page (`/saved.html`) listing the user's Saved Resources.
- **User Profile Page**: A page (`/profile.html`) for user login and profile information. Login functionality is planned; see Requirement 10.
- **About Page**: A page (`/about.html`) with static information about the CFES Toolbox: mission statement and a link to the official CFES website.
- **Search Bar**: A text input that filters resources by matching the query against the localized title and localized description of each Resource.
- **Filter Panel**: A set of controls (category checkboxes and a free/paid toggle) that narrow the visible resources on the All Resources Page.
- **API**: The existing backend endpoint at `/api/sheet`.

---

## Requirements

### Requirement 1: Language Toggle

**User Story:** As a visitor, I want to switch between English and French at any time, so that I can use the App in my preferred official language.

#### Acceptance Criteria

1. THE App SHALL display a language toggle control showing "EN" and "FR" on every page.
2. WHEN a user activates the language toggle, THE App SHALL re-render all visible text in the selected Active Language without a full page reload.
3. THE App SHALL persist the Active Language selection in `localStorage` so that it is restored on the next visit.
4. WHEN the page loads, THE App SHALL read `localStorage` and initialize the Active Language from the stored value, defaulting to "EN" if no value is stored.
5. THE App SHALL apply the Active Language to all Resource fields (`title-en`/`titre-fr`, `description-en`/`description-fr`, `link-en`/`lien-fr`) when rendering Resource Cards.

---

### Requirement 2: Navigation Menu

**User Story:** As a visitor, I want a navigation menu accessible from every page, so that I can move between pages without getting lost.

#### Acceptance Criteria

1. THE App SHALL display a hamburger menu icon in the top-right area on every page.
2. WHEN a user activates the hamburger icon, THE Nav Menu SHALL open and display links to: Landing Page, All Resources Page, Saved Page, User Profile Page, and About Page.
3. WHEN a user selects a link from the Nav Menu, THE App SHALL navigate to the selected page and close the Nav Menu.
4. WHEN a user activates the hamburger icon while the Nav Menu is open, THE Nav Menu SHALL close.
5. WHEN the Nav Menu is open, THE App SHALL display a visible close affordance (icon or overlay tap area) that closes the Nav Menu when activated.

---

### Requirement 3: Landing Page — Hero and Navigation Grid

**User Story:** As a visitor, I want to see a branded landing page with clear navigation options, so that I can immediately understand what the Toolbox offers and go to the section I need.

#### Acceptance Criteria

1. THE Landing Page SHALL display a hero section containing the heading "Toolbox" and the bilingual tagline ("Forging strong engineering students and societies." / "Forger de solides étudiant·e·s en génie et des associations étudiantes.").
2. THE Landing Page SHALL display a static grid of navigation bubbles, one per destination page: All Resources, Saved, Profile, and About.
3. THE Landing Page SHALL arrange navigation bubbles using rounded pill/bubble shapes on a dark navy background.
4. WHEN a user activates a navigation bubble, THE App SHALL navigate to the corresponding page.
5. THE Landing Page SHALL render the hero heading and tagline in the Active Language.
6. THE Landing Page SHALL render each navigation bubble label in the Active Language.

---

### Requirement 4: All Resources Page — Display

**User Story:** As a visitor, I want to browse every available resource in one place, so that I can discover resources beyond a single category.

#### Acceptance Criteria

1. WHEN the All Resources Page loads, THE App SHALL fetch all resources from `GET /api/sheet` and display them as Resource Cards.
2. THE All Resources Page SHALL display each Resource Card with: localized title, localized description (truncated to 150 characters with an ellipsis if longer), category badges, and a **Free** badge for resources where `free` is `true` or a **Paid** badge for resources where `free` is `false`.
3. WHEN the API request is in progress, THE All Resources Page SHALL display a loading indicator.
4. IF the API request fails, THEN THE All Resources Page SHALL display an error message in the Active Language with a retry action.
5. WHEN there are no resources matching the active search and filter state, THE All Resources Page SHALL display a "no results" message in the Active Language.

---

### Requirement 5: All Resources Page — Search

**User Story:** As a visitor, I want to search resources by keyword, so that I can quickly find resources relevant to my topic.

#### Acceptance Criteria

1. THE All Resources Page SHALL display a Search Bar at the top of the resource list.
2. WHEN a user types in the Search Bar, THE All Resources Page SHALL filter the displayed Resource Cards to those whose localized title or localized description contains the search query (case-insensitive).
3. THE All Resources Page SHALL apply the search filter client-side, without making a new API request.
4. WHEN the Search Bar is cleared, THE All Resources Page SHALL restore the full list subject to the active Filter Panel state.

---

### Requirement 6: All Resources Page — Filter Panel

**User Story:** As a visitor, I want to filter resources by category and by free/paid status, so that I can narrow down results to what is useful to me.

#### Acceptance Criteria

1. WHEN the All Resources Page loads, THE Filter Panel SHALL derive the set of available Categories from the loaded resource data and display one checkbox per Category.
2. WHEN a user selects one or more Category checkboxes, THE All Resources Page SHALL display only Resource Cards whose `categories` field includes at least one of the selected Categories.
3. WHEN a user activates the free-only toggle, THE All Resources Page SHALL display only Resource Cards where `free` is `true`.
4. WHEN both a Category filter and the free-only toggle are active, THE All Resources Page SHALL apply both filters conjunctively (AND logic).
5. WHEN a user deselects all Category checkboxes, THE All Resources Page SHALL treat the category filter as inactive and display resources from all categories.
6. THE All Resources Page SHALL combine the active Filter Panel state and the active Search Bar query conjunctively when determining which Resource Cards to display.

---

### Requirement 7: Category Page

**User Story:** As a visitor, I want to browse resources within a specific category, so that I can focus on one area of interest.

#### Acceptance Criteria

1. WHEN the Category Page loads, THE App SHALL read the `cat` query parameter from the URL and display the category name as the page heading in the Active Language.
2. WHEN the Category Page loads, THE App SHALL fetch resources from `GET /api/sheet?category=<cat>` and display them as Resource Cards.
3. THE Category Page SHALL display a Search Bar that filters the loaded Resource Cards client-side by localized title or localized description (case-insensitive).
4. WHEN the `cat` query parameter is absent or does not match a known Category, THE Category Page SHALL display an error message in the Active Language and a link back to the Landing Page.
5. WHEN the API request is in progress, THE Category Page SHALL display a loading indicator.
6. IF the API request fails, THEN THE Category Page SHALL display an error message in the Active Language with a retry action.

---

### Requirement 8: Resource Card — Save Action

**User Story:** As a visitor, I want to save resources I find useful, so that I can return to them quickly without searching again.

#### Acceptance Criteria

1. THE Resource Card SHALL display a save/bookmark icon button.
2. WHEN a user activates the save icon on a Resource Card, THE App SHALL add the resource `id` to `cfes-saved` in `localStorage` and update the icon to a filled/active state.
3. WHEN a user activates the save icon on an already-saved Resource Card, THE App SHALL remove the resource `id` from `cfes-saved` in `localStorage` and update the icon to an unfilled/inactive state.
4. WHEN a page containing Resource Cards loads, THE App SHALL read `cfes-saved` from `localStorage` and render the save icon in the correct filled or unfilled state for each Resource Card.

---

### Requirement 9: Saved Resources Page

**User Story:** As a visitor, I want a dedicated page showing all my saved resources, so that I can quickly access my personal collection.

#### Acceptance Criteria

1. WHEN the Saved Page loads, THE App SHALL read resource IDs from `cfes-saved` in `localStorage`.
2. WHEN at least one resource ID is stored, THE App SHALL fetch resources from `GET /api/sheet` and display Resource Cards only for the saved IDs.
3. WHEN `cfes-saved` is empty or absent, THE Saved Page SHALL display a message in the Active Language indicating no resources are saved, with a link to the All Resources Page.
4. WHEN a user unsaves a resource from the Saved Page, THE App SHALL remove that Resource Card from the displayed list immediately without a page reload.

---

### Requirement 10: User Profile Page — Google OAuth Login

**User Story:** As a visitor, I want to sign in with my Google account, so that I can access a personalized profile within the CFES Toolbox.

#### Acceptance Criteria

1. THE App SHALL include a User Profile Page at `/profile.html`.
2. WHEN a user visits the User Profile Page and is not signed in, THE User Profile Page SHALL display a "Sign in with Google" button.
3. WHEN a user activates the "Sign in with Google" button, THE App SHALL initiate the Google OAuth 2.0 authorization flow using a configured Google client ID.
4. WHEN Google OAuth completes successfully, THE App SHALL receive an ID token from Google, extract the user's display name and profile picture URL, and store them in `sessionStorage`.
5. WHEN a user is signed in, THE User Profile Page SHALL display the user's Google display name and profile picture.
6. WHEN a user is signed in, THE User Profile Page SHALL display a "Sign out" button.
7. WHEN a user activates the "Sign out" button, THE App SHALL clear the user's session data from `sessionStorage` and return the User Profile Page to the signed-out state.
8. THE App SHALL load the Google Identity Services client library from `https://accounts.google.com/gsi/client` and configure it with the Google client ID supplied via an environment variable or a static config file; THE server SHALL NOT expose the client secret to the frontend.
9. THE User Profile Page SHALL render all labels and messages in the Active Language.

---

### Requirement 11: About Page

**User Story:** As a visitor, I want to read about the CFES Toolbox and find contact information, so that I can understand the project and reach out if needed.

#### Acceptance Criteria

1. THE About Page SHALL display a static description of the CFES Toolbox in the Active Language.
2. THE About Page SHALL display the CFES organization name, a brief mission statement, and a link to the official CFES website.
3. THE About Page SHALL re-render its text content in the Active Language when the Language Toggle is activated.

---

### Requirement 12: Visual Style and Accessibility

**User Story:** As a visitor, I want the App to be visually consistent and accessible, so that it is pleasant and usable for all students.

#### Acceptance Criteria

1. THE App SHALL use a dark navy primary background color (`#0d1b2a` or equivalent) and white/light text across all pages.
2. THE App SHALL use rounded pill/bubble shapes for Category bubbles consistent with the reference design.
3. THE App SHALL provide visible focus indicators on all interactive elements (links, buttons, inputs).
4. THE App SHALL include `aria-label` or visible text labels on all icon-only buttons (hamburger menu, save icon, language toggle).
5. THE App SHALL use semantic HTML elements (`<nav>`, `<main>`, `<header>`, `<button>`, `<a>`) for all structural and interactive components.
6. WHEN the Active Language is French, THE App SHALL set `lang="fr"` on the `<html>` element; WHEN the Active Language is English, THE App SHALL set `lang="en"`.

---

### Requirement 13: Static File Serving for New Pages

**User Story:** As a developer, I want new HTML pages served correctly by the existing Node.js server, so that client-side navigation works without adding a framework.

#### Acceptance Criteria

1. THE App SHALL serve `resources.html`, `category.html`, `saved.html`, `profile.html`, and `about.html` as static files from the project root.
2. WHEN a request is made for a `.css` or `.js` file under a `/public/` path, THE server SHALL serve the file with the correct `Content-Type` header (`text/css` or `application/javascript`).
3. THE server SHALL continue to serve `index.html` at the root path `/`.
