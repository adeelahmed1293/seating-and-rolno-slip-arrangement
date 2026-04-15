# Exam Seating Planner — Electron Desktop App

A fully offline desktop application for generating anti-cheat exam seating plans.

## Features

- **True 8-neighbour anti-cheat isolation** — zero adjacent same-class seats
- **4-class checkerboard pattern** — guaranteed conflict-free layout
- **Excel (.xlsx) & CSV import** — native file picker dialog
- **Roll numbers on seats** — students can find their exact seat
- **Roll Number Directory** — searchable lookup table
- **Native CSV export** — save-as dialog for all rooms or summary
- **Keyboard shortcuts** — Ctrl+O (open), Ctrl+E (export)
- **Fully offline** — no internet required after install

---

## Quick Start (Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Run in development
```bash
# 1. Install client dependencies
cd client
npm install

# 2. Return to root
cd ..

# 3. Install root dependencies
npm install

# 4. Start the app
npm run dev
```

---

## Building Installers

### Windows (.exe installer)
```bash
npm run build:win
# Output: dist/Exam Seating Planner Setup 1.0.0.exe
```

### macOS (.dmg)
```bash
npm run build:mac
# Output: dist/Exam Seating Planner-1.0.0.dmg
```

### Linux (.AppImage + .deb)
```bash
npm run build:linux
# Output: dist/Exam Seating Planner-1.0.0.AppImage
#         dist/exam-seating-planner_1.0.0_amd64.deb
```

### All platforms at once
```bash
npm run build
```

> **Note:** Cross-compiling (e.g. building Windows .exe on Linux) requires Wine or Docker.
> The easiest approach is to build on each target OS natively, or use CI (GitHub Actions).

---

## Project Structure

```
exam-seating-planner/
├── package.json          ← Root dependencies and scripts
├── README.md
├── client/               ← React frontend (Vite + Tailwind)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx      ← React app entry
│       ├── App.jsx       ← Main app component
│       ├── index.css
│       ├── components/   ← Reusable UI components
│       │   ├── Sidebar.jsx
│       │   ├── Toast.jsx
│       │   └── ui.jsx
│       ├── pages/        ← Page components
│       │   ├── Dashboard.jsx
│       │   ├── ClassManager.jsx
│       │   ├── DateSheet.jsx
│       │   ├── GeneratePlan.jsx
│       │   ├── ImportData.jsx
│       │   ├── RollDirectory.jsx
│       │   ├── RoomGroups.jsx
│       │   ├── RoomView.jsx
│       │   └── SlipPreview.jsx
│       └── utils/        ← Utility functions
│           ├── exportUtils.js
│           ├── fileImport.js
│           ├── palette.js
│           ├── seating.js
│           └── store.js
├── electron/             ← Electron main process
│   ├── main.js           ← Window management, IPC
│   └── preload.js        ← Context bridge API
└── src/                  ← Legacy static files
    ├── index.html
    ├── xlsx.full.min.js  ← XLSX library
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── algorithms.js
    │   ├── app.js
    │   ├── fileImport.js
    │   ├── state.js
    │   └── utils.js
    └── pages/
        ├── classes.html
        ├── classes.js
        ├── dashboard.html
        ├── dashboard.js
        ├── datesheet.html
        ├── datesheet.js
        ├── directory.html
        ├── directory.js
        ├── generate.html
        ├── generate.js
        ├── import.html
        ├── import.js
        ├── rooms.html
        ├── rooms.js
        ├── roomview.html
        ├── roomview.js
        ├── slips.html
        └── slips.js
```

---

## Adding a Custom Icon

Replace `assets/icon.png` with your own **256×256 PNG** icon, then:

- **Windows**: Also add `assets/icon.ico` (256px ICO file)
- **macOS**: Also add `assets/icon.icns` (ICNS file)

You can convert PNG → ICO/ICNS using tools like [ImageMagick](https://imagemagick.org/) or online converters.

---

## Excel / CSV Format

Your import file should have:
- **Row 1**: Class names in columns 1, 3, 5, … (every 2nd column starting at 0)
- **Row 2 onwards**: Roll numbers below each class name

Example:
```
CS-A,  , CS-B,  , BBA,
2023-001, , 2023-101, , 2023-201,
2023-002, , 2023-102, , 2023-202,
...
```

The sheet named **"Registration No"** is used automatically if present.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Import CSV / Excel |
| `Ctrl+E` | Export all rooms CSV |
| `Ctrl+Shift+E` | Export summary CSV |
| `Ctrl+R` | Reload app |
| `F11` | Toggle fullscreen |
