# 📌 Stickies — Desktop & Mobile Notes

A private, offline-first sticky-notes app for **desktop and mobile**.

No build step, no framework, no server — it's a single `index.html` file plus the handful of static files a PWA needs (`manifest.json`, `service-worker.js`, icons).

Every sticky lives in your browser's local storage. Nothing is ever sent anywhere unless you explicitly connect your own Google Drive for sync.

## Features

- Free placement on an unlimited, scrollable desktop canvas — drag stickies anywhere; drop one near another and it aligns without overlapping (toggle this in Settings)
- 9 built-in color themes plus a custom color picker, with a per-sticky transparency slider
- 4 font families, 5 sizes, and inline **bold**, *italic*, __underline__, strikethrough, bullets and numbering with Markdown-style list behavior
- Checklists: type `[]` or `[x]` at the start of a line to get a 🔲/☑️ box; click the first checkbox on a line to toggle it
- Resize, minimize/expand, lock, and **pin** stickies
- **Pinning** controls the sticky's layer/z-order tier: pinned stickies stay above unpinned stickies, while layering is maintained separately within pinned and unpinned stickies
- **Locking** prevents modification of a sticky. A locked sticky cannot be edited, moved, renamed, resized, minimized/expanded, recolored, pinned/unpinned, or otherwise modified until it is unlocked
- A left-hand Groups sidebar — color-coded, with an "Unassigned" bucket for ungrouped stickies; use **⮜** to hide it and **⮞** to show it again for more canvas space
- Search that filters and highlights matches across titles, content, tags, and group names
- Auto-organize: tile, cascade, compact, or cluster by group/color
- Sticky Manager — a plain sortable list view for bulk moving, deleting, exporting and importing
- Trash with restore, installable offline PWA, and optional Google Drive sync
- Reset App Data restores the app to its default data; because this is destructive, export/backup your data first if you need to preserve it

## Running it locally

No build step needed. Just open `index.html` in a browser, or serve the folder with any static file server, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In **Settings → Pages**, set the source to **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) deploys on every push to `main` — no build step, it just publishes the static files as-is.
4. The official Stickies deployment is:

   **https://bkar81.github.io/stickies/**

   On a phone, you'll be prompted to "Add to Home Screen" / "Install". Once installed, the app runs fully offline during normal use.

## Google Drive sync (optional)

Google Drive sync is **off by default**.

### Official Stickies deployment

The official Stickies deployment already has Google OAuth configured. **Users do not need to create a Google Cloud project or enter an OAuth Client ID.**

1. Open **Settings → Google Drive sync**.
2. Tap **Connect**.
3. Sign in with your Google account and grant the requested access.
4. Sync is scoped to `drive.file`, so Stickies can access the Drive file it creates rather than your entire Drive.

Your Stickies data is stored in a single `stickies-notes-data.json` file in your Google Drive. Merging is timestamp-based (`updatedAt` per sticky), so syncing from multiple devices is supported.

### If you fork or self-host Stickies

A forked/self-hosted deployment does not automatically use the official deployment's OAuth configuration. If you want Google Drive sync in your own deployment, configure your own Google OAuth credentials in your own Google Cloud project.

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a new project (or reuse one).
2. Enable the **Google Drive API** for that project (APIs & Services → Library).
3. Go to **APIs & Services → OAuth consent screen** and configure it. If the app remains in "Testing" mode, add your Google account as a test user.
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**
   - Add the URL of your deployment to **Authorized JavaScript origins**.
5. Configure the generated Client ID in your fork according to the OAuth configuration documented in the source code.

Do not ask normal users of the official Stickies deployment to enter a Client ID.

## Important: Pin vs Lock

**Pinned** and **Locked** are different:

- **Pinned** affects layer/z-order. Pinned stickies are kept above unpinned stickies. Within the pinned and unpinned tiers, each sticky keeps its own layer order.
- If an underlying sticky is selected for editing, it may temporarily come to the front while being edited, but when editing ends its original layer position is restored.
- **Locked** affects modification. Nothing should happen to a locked sticky until it is unlocked. This includes editing, moving, renaming, resizing, minimizing/expanding, recoloring, pinning/unpinning and other modifications.
- **Minimize All / Expand All** affects unlocked stickies only, regardless of whether they are pinned or unpinned.

## Files in this repository

| File | Purpose |
|---|---|
| `index.html` | The entire app — HTML, CSS, and JS in one file |
| `README.html` | User documentation and installation/help guide |
| `README.md` | Markdown source/documentation |
| `manifest.json` | PWA manifest (name, icons, theme colors) |
| `service-worker.js` | Offline caching for the app shell |
| `privacy.html` | Privacy policy, linked from the About dialog |
| `terms.html` | Terms of use |
| `icon.svg`, `pwa-*.png`, `apple-touch-icon.png`, `favicon.png` | App icons |
| `.github/workflows/deploy.yml` | GitHub Actions workflow for GitHub Pages |
| `LICENSE` | MIT license |

## License

MIT — see [LICENSE](LICENSE). Use it, fork it, self-host it, modify it freely.
