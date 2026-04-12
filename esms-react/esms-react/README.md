# Exam Seating Management System — React + Tailwind + Electron

Converted from plain HTML/CSS/JS → **React 18 + Tailwind CSS 3 + Electron 29**  
Developed by the **BATs Dev**

---

## Project Structure

```
esms-react/
├── electron/
│   ├── main.js          ← Electron main process (IPC, auth, window)
│   └── preload.js       ← Context bridge (window.esms API)
├── src/
│   ├── assets/
│   │   └── logo.png     ← Brand logo
│   ├── components/
│   │   ├── TitleBar.jsx ← Custom frameless titlebar
│   │   └── BrandPanel.jsx ← Shared left panel (Login + Setup)
│   ├── pages/
│   │   ├── LoginPage.jsx    ← Login form (exact replica)
│   │   ├── SetupPage.jsx    ← First-time setup form
│   │   └── DashboardPage.jsx ← Dashboard with sidebar nav
│   ├── App.jsx          ← React Router routes + Electron nav listener
│   ├── main.jsx         ← React entry point
│   └── index.css        ← Tailwind + global design tokens + keyframes
├── public/
│   └── logo.png
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run in browser (dev, no Electron)
```bash
npm run dev
# Open http://localhost:5173
# Demo credentials: username=admin  password=admin
```

### 3. Run as Electron app (dev)
```bash
npm run electron:dev
```

### 4. Build for production
```bash
npm run electron:build
# Output in /release
```

---

## Adding New Pages

1. Create `src/pages/YourPage.jsx`
2. Add route in `src/App.jsx`:
   ```jsx
   <Route path="/your-page" element={<YourPage />} />
   ```
3. Add nav item in `DashboardPage.jsx` → `NAV_ITEMS` array
4. Navigate via `useNavigate('/your-page')` or `window.esms.navigate('your-page')`

---

## Design Tokens

All design tokens are in `src/index.css` as CSS variables:

| Token | Value |
|-------|-------|
| `--clr-bg` | `#0e1929` (darkest navy) |
| `--clr-surface` | `#132030` |
| `--clr-accent` | `#4a7fb5` (steel blue) |
| `--clr-text` | `#d8e8f5` |
| `--clr-success` | `#34d399` |
| `--clr-error` | `#f87171` |
| `--font-display` | Syne |
| `--font-body` | Inter |

---

## window.esms API (Electron only)

| Method | Description |
|--------|-------------|
| `window.esms.login({ username, password })` | Authenticate |
| `window.esms.setup({ password })` | First-run password setup |
| `window.esms.navigate('login' \| 'setup' \| 'dashboard')` | Navigate pages |
| `window.esms.isFirstRun()` | Check if setup needed |
| `window.esms.minimize()` | Minimize window |
| `window.esms.maximize()` | Toggle maximize |
| `window.esms.close()` | Close window |

---

## Tech Stack

- **React 18** — UI components
- **React Router v6** — Client-side routing (HashRouter for Electron)
- **Tailwind CSS 3** — Utility classes
- **Vite 5** — Build tool + dev server
- **Electron 29** — Desktop wrapper
- **bcryptjs** — Password hashing (12 salt rounds)
