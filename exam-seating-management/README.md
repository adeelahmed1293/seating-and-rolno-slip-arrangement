# 📋 Exam Seating Management System (ESMS)

> A professional Electron desktop application for managing exam seating — with a
> secure, bcrypt-protected admin login.

---

## 📁 Project Structure

```
exam-seating-management/
├── package.json                        # NPM config, scripts, electron-builder settings
├── .gitignore
│
├── src/
│   ├── main/
│   │   ├── main.js                     # 🔧 Electron main process (IPC, windows, auth logic)
│   │   └── preload.js                  # 🔒 Context bridge — exposes window.esms API
│   │
│   └── renderer/
│       ├── assets/
│       │   └── css/
│       │       └── globals.css         # 🎨 Design tokens, resets, shared animations
│       │
│       └── pages/
│           ├── login/
│           │   ├── login.html          # Login page markup
│           │   ├── login.css           # Login page styles
│           │   └── login.js            # Login page logic
│           │
│           ├── setup/
│           │   ├── setup.html          # First-run password setup
│           │   ├── setup.css
│           │   └── setup.js
│           │
│           └── dashboard/
│               ├── dashboard.html      # Dashboard (add content here)
│               ├── dashboard.css
│               └── dashboard.js
│
└── dist/                               # 📦 Build output (auto-generated)
```

---

## 🚀 How to Build & Run

### Prerequisites

| Tool       | Version   | Download                              |
|------------|-----------|---------------------------------------|
| Node.js    | ≥ 18 LTS  | https://nodejs.org                    |
| npm        | ≥ 9       | Comes with Node.js                    |
| Git        | any       | https://git-scm.com (for team use)    |

---

### Step 1 — Clone / Download the project

```bash
# If using Git
git clone https://github.com/YOUR_USERNAME/exam-seating-management.git
cd exam-seating-management

# OR simply unzip the folder and open terminal inside it
```

---

### Step 2 — Install dependencies

```bash
npm install
```

This installs:
- `electron` — the desktop app framework
- `electron-builder` — for packaging into .exe / .dmg / .AppImage
- `bcryptjs` — for hashing/verifying the admin password (pure JS, no native modules)

---

### Step 3 — Run in development mode

```bash
npm run dev
```

This launches the app with DevTools open (so you can inspect and debug).

---

### Step 4 — First launch (one-time setup)

When the app runs for the very first time:
1. It detects no password has been saved
2. It opens the **Setup Page** automatically
3. You enter a password (must meet strength requirements)
4. The password is hashed with **bcrypt (12 salt rounds)** and saved to:
   - **Windows:** `%APPDATA%\exam-seating-management\admin-config.json`
   - **macOS:**   `~/Library/Application Support/exam-seating-management/admin-config.json`
   - **Linux:**   `~/.config/exam-seating-management/admin-config.json`
5. All subsequent launches show the **Login Page**

---

### Step 5 — Build for production

#### Windows (.exe installer)
```bash
npm run build:win
```
Output: `dist/Exam Seating Management System Setup 1.0.0.exe`

#### macOS (.dmg)
```bash
npm run build:mac
```
Output: `dist/Exam Seating Management System-1.0.0.dmg`

#### Linux (.AppImage)
```bash
npm run build:linux
```
Output: `dist/Exam Seating Management System-1.0.0.AppImage`

#### All platforms at once
```bash
npm run build
```

> **Note:** To build for Windows on macOS/Linux, you need Wine installed.
> For cross-platform builds, consider using GitHub Actions CI.

---

## 🔐 Security Architecture

| Layer              | Implementation                                                  |
|--------------------|-----------------------------------------------------------------|
| **Context Isolation** | `contextIsolation: true`, `nodeIntegration: false` in webPreferences |
| **IPC Bridge**     | Only safe methods exposed via `preload.js` → `window.esms`      |
| **Password Hashing** | bcryptjs with 12 salt rounds (≈ 250ms/hash, brute-force resistant) |
| **Storage**        | Local JSON in OS app-data directory (not in app bundle)         |
| **CSP**            | `Content-Security-Policy` meta tag on every HTML page           |

---

## ✏️ How to Add New Features (Team Guide)

### Adding a new page

1. Create a folder: `src/renderer/pages/YOUR_PAGE/`
2. Add `YOUR_PAGE.html`, `YOUR_PAGE.css`, `YOUR_PAGE.js`
3. In `main.js`, add the page name to the `allowed` array in `app:navigate` handler
4. In `dashboard.html`, add a `<a class="nav-item">` link with `data-page="YOUR_PAGE"`
5. In `dashboard.js`, handle navigation in the nav-item click handler

### Adding IPC channels (main ↔ renderer)

1. In `main.js` — add `ipcMain.handle('channel:name', async (event, payload) => { ... })`
2. In `preload.js` — expose it: `myMethod: (data) => ipcRenderer.invoke('channel:name', data)`
3. In your renderer JS — call `window.esms.myMethod(data)`

### Editing design tokens

All colors, fonts, spacing, shadows live in:
```
src/renderer/assets/css/globals.css  (CSS variables under :root)
```
Change once → updates everywhere.

### Adding a database

For structured data, add **better-sqlite3** (works offline, no server needed):
```bash
npm install better-sqlite3
```
Create `src/main/database.js` and import it in `main.js`.

---

## 📦 NPM Scripts Reference

| Command             | Action                                        |
|---------------------|-----------------------------------------------|
| `npm start`         | Run app (production mode, no DevTools)        |
| `npm run dev`       | Run app in dev mode (with DevTools)           |
| `npm run build`     | Build for all platforms                       |
| `npm run build:win` | Build Windows installer only                  |
| `npm run build:mac` | Build macOS DMG only                          |
| `npm run build:linux` | Build Linux AppImage only                   |
| `npm run pack`      | Package without creating installer (testing)  |

---

## 🤝 Team Git Workflow

```bash
# Always pull before starting work
git pull origin main

# Create a feature branch
git checkout -b feature/dashboard-charts

# Work on your files, then commit
git add .
git commit -m "feat: add bar chart to dashboard"

# Push and open a Pull Request
git push origin feature/dashboard-charts
```

---

## 📌 Roadmap / Next Steps

- [ ] Dashboard charts & real statistics
- [ ] Exam management (CRUD)
- [ ] Student enrollment module
- [ ] Exam hall configuration
- [ ] Auto seating plan generator
- [ ] PDF export of seating plans
- [ ] Print support

---

## 📄 License

MIT — free to use and modify.
