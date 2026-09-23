# 📌 Stickies — Desktop Notes

A private, offline-first desktop sticky-notes app inspired by **Stickies by Zhorn Software**.
No build step, no framework, no server — it's a single `index.html` file plus the handful of
static files a PWA needs (`manifest.json`, `service-worker.js`, icons).

Every note lives in your browser's local storage. Nothing is ever sent anywhere unless you
explicitly connect your own Google Drive for sync.

## Features

- Free placement on an unlimited, scrollable desktop canvas — drag notes anywhere; drop one
  near another and it aligns without overlapping (toggle this in Settings)
- 9 built-in color themes plus a custom color picker, with a per-note transparency slider
- 4 font families, 5 sizes, and inline **bold**, *italic*, __underline__ and bullet formatting
- Checklists: type `[]` or `[x]` to get a 🔲/☑️ box; click it to toggle
- Resize, minimize-to-titlebar, lock, and **pin** (keeps a note always on top and skips it
  during Minimize All / Auto-Organize)
- A left-hand Groups sidebar — color-coded, with an "Unassigned" bucket for ungrouped stickies
- Search that filters and highlights matches across titles, content, tags, and group names
- Auto-organize: tile, cascade, compact, or cluster by group/color
- Sticky Manager — a plain sortable list view for bulk moving, deleting, exporting and importing
- Trash with restore, installable offline PWA, and optional Google Drive sync

## Running it locally

No build step needed. Just open `index.html` in a browser, or serve the folder with any static
file server, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In **Settings → Pages**, set the source to **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) deploys on every push to `main` —
   no build step, it just publishes the static files as-is.
4. Visit `https://<your-username>.github.io/<repo>/`. On a phone, you'll be prompted to
   "Add to Home Screen" / "Install" — once installed, the app runs fully offline and does not
   contact GitHub again during normal use.

## Setting up Google Drive sync (optional)

Sync is **off by default**. Each self-hosted copy of this app needs its own Google OAuth Client
ID — this keeps your notes syncing only to *your* Drive, under *your* Google Cloud project, with
no shared backend.

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a new project (or
   reuse one).
2. Enable the **Google Drive API** for that project (APIs & Services → Library).
3. Go to **APIs & Services → OAuth consent screen** and configure it (External is fine for
   personal use; add your own Google account as a test user if it stays in "Testing" mode).
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**
   - Authorized JavaScript origins: add the URL you deploy to, e.g.
     `https://your-username.github.io`
5. Copy the generated Client ID (looks like `xxxxx.apps.googleusercontent.com`).
6. In the app, open **Settings → Google Drive sync** and paste it into "Google OAuth Client ID."
7. Tap **Sync with Google Drive** in the toolbar. You'll be asked to sign in and grant access —
   scoped to `drive.file`, meaning the app can only see the one file it creates, never the rest
   of your Drive.

Notes sync into a single `stickies-notes-data.json` file in your Drive. Merging is timestamp-based
(newest `updatedAt` per note wins), so syncing from multiple devices is safe.

## Files in this repository

| File | Purpose |
|---|---|
| `index.html` | The entire app — HTML, CSS, and JS in one file |
| `manifest.json` | PWA manifest (name, icons, theme colors) |
| `service-worker.js` | Offline caching for the app shell |
| `privacy.html` | Privacy policy, linked from the About dialog |
| `icon.svg`, `pwa-*.png`, `apple-touch-icon.png`, `favicon.png` | App icons |
| `.github/workflows/deploy.yml` | GitHub Actions workflow for GitHub Pages |
| `LICENSE` | MIT license |

## License

MIT — see [LICENSE](LICENSE). Use it, fork it, self-host it, modify it freely.
