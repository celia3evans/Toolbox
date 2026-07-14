# Toolbox

A bilingual (EN/FR) multi-page resource hub for engineering students and student societies. Resources are stored in a Google Sheet and served by a bare Node.js HTTP server — no framework required.

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` | Hero section + navigation bubbles linking to all other pages |
| All Resources | `/resources.html` | Browse all resources with search and category/free filters |
| Category | `/category.html?cat=<name>` | Resources filtered to a single category |
| Saved | `/saved.html` | Your locally bookmarked resources |
| Profile | `/profile.html` | Sign in with Google (Google Identity Services) |
| About | `/about.html` | About the tool and contact info |

---

## Prerequisites | Conditions préalables

- [Node.js](https://nodejs.org/) (any current LTS version | n'importe quelle version LTS actuelle)
- A Google Cloud service account with the Sheets API enabled | Un compte de service Google Cloud avec l'API Sheets activée

---

## Setup | Configuration

```bash
git clone https://github.com/celia3evans/Toolbox.git
cd Toolbox
npm install
```

### 1. Google Sheets Backend | Backend Google Sheets

1. Go to [console.cloud.google.com](https://console.cloud.google.com), create a project, and enable the **Google Sheets API**.

   Allez sur [console.cloud.google.com](https://console.cloud.google.com), créez un projet et activez l'**API Google Sheets**.

2. Under IAM & Admin → Service Accounts, create a service account and download its JSON key. Save it as `credentials.json` in the project root.

   Dans IAM & Admin → Comptes de service, créez un compte de service et téléchargez sa clé JSON. Enregistrez-la sous `credentials.json` à la racine du projet.

3. Open your Google Sheet, click **Share**, and share it with the service account email (e.g. `name@project.iam.gserviceaccount.com`).

   Ouvrez votre feuille Google, cliquez sur **Partager** et partagez-la avec l'adresse e-mail du compte de service.

4. Copy your spreadsheet ID from the sheet URL and set it in `routes/sheet.js`:

   Copiez l'ID de la feuille depuis l'URL et définissez-le dans `routes/sheet.js` :
   ```
   https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
   ```
   ```js
   const SHEET_ID = 'your-spreadsheet-id-here';
   ```

> ⚠️ `credentials.json` is listed in `.gitignore` and must never be committed. | `credentials.json` est dans `.gitignore` et ne doit jamais être versionné.

#### Sheet Schema | Schéma de la feuille

The sheet tab must be named `LinksNResources` with columns A–I:

| Column | Field | Description |
|--------|-------|-------------|
| A | `id` | Unique integer ID |
| B | `title-en` | English title |
| C | `titre-fr` | French title |
| D | `link-en` | English URL |
| E | `lien-fr` | French URL |
| F | `description-en` | English description |
| G | `description-fr` | French description |
| H | `categories` | Comma-separated category labels (e.g. `Finance,Career`) |
| I | `free` | `TRUE` or `FALSE` |

---

### 2. Google OAuth (Profile page) | Google OAuth (page Profil)

The Profile page uses [Google Identity Services](https://developers.google.com/identity/gsi/web) for client-side sign-in. No server-side OAuth flow is required.

1. In [Google Cloud Console](https://console.cloud.google.com), go to **APIs & Services → Credentials** and create an **OAuth 2.0 Client ID** (Web application type).
2. Add `http://localhost:7373` to the **Authorized JavaScript origins**.
3. Copy the **Client ID** and paste it into `public/js/config.js`:

```js
const CONFIG = {
  googleClientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
};
```

> ⚠️ Never put your OAuth **client secret** in `config.js` or any frontend file. The client ID is safe to expose.

---

## Run | Lancez l'application

```bash
node server.js
```

Then open [http://localhost:7373](http://localhost:7373) in your browser.

Ouvrez ensuite [http://localhost:7373](http://localhost:7373) dans votre navigateur.

---

## Project Structure | Structure du projet

```
Toolbox/
├── server.js               # Bare Node.js HTTP server (port 7373)
├── routes/
│   ├── index.js            # Route dispatcher
│   └── sheet.js            # Google Sheets API handler
├── public/
│   ├── css/
│   │   └── style.css       # Global design system (dark navy theme)
│   └── js/
│       ├── config.js       # Google OAuth client ID (no secrets)
│       ├── translations.js # Single source of truth for all UI text (EN + FR)
│       ├── i18n.js         # Language toggle (EN/FR) + localStorage
│       ├── api.js          # Fetch wrapper for /api/sheet
│       ├── cards.js        # Resource card renderer + save/filter logic
│       └── nav.js          # Hamburger nav menu
├── index.html              # Landing page
├── resources.html          # All resources (search + filters)
├── category.html           # Category-specific resources
├── saved.html              # Saved resources (localStorage)
├── profile.html            # User profile (Google OAuth)
├── about.html              # About / mission
└── credentials.json        # ← NOT committed (gitignored)
```

---

## API Endpoints | Points d'accès API

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/sheet` | Returns all resources as a JSON array |
| `GET` | `/api/sheet?category=Finance` | Returns resources in the given category |
| `GET` | `/api/sheet?free=true` | Returns free resources only |
| `GET` | `/api/sheet?id=5` | Returns the resource with the given ID |
| `POST` | `/api/sheet` | Appends a new row — body: `{ "values": [["id", "title-en", ...]] }` |

---

## Tests

```bash
npm test
```

Tests use **Jest** (jsdom environment) and cover the three shared JS modules:

- `i18n.js` — language toggle, persistence, string lookup
- `cards.js` — save/unsave, card rendering, description truncation, filter logic
- `api.js` — fetch wrapper, query string construction, error handling

---

## Language Support | Support des langues

The UI is fully bilingual. All translatable text lives in a single file — `public/js/translations.js` — as `{ en: '...', fr: '...' }` entries keyed by dot-namespaced IDs. HTML elements reference a key via `data-i18n="key"` and `i18n.js` swaps their `textContent` (or `placeholder`) on every language toggle, without a page reload. The selected language is persisted in `localStorage` under `cfes-lang`.

To add or edit a translation, change it in `translations.js` only — no HTML or other JS files need to be touched.
