# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

BogenScore ("Bogen Score") is a single-file German-language PWA for tracking archery training scores. The entire app — markup, CSS, and JavaScript — lives in `index.html`. There is no build step, no package manager, and no external dependencies (fonts are embedded as base64 `data:` URIs, all logic is vanilla JS/DOM).

## Development

- **Run**: open `index.html` directly in a browser, or serve the directory with any static file server (e.g. `python3 -m http.server`) for a more realistic PWA test environment.
- **No build/lint/test tooling exists.** There are no npm scripts, bundlers, or automated tests — verify changes by opening the file in a browser and exercising the flow manually.
- Because everything is in one file, use line-anchored edits (grep for the function name) rather than trying to reason about file layout from memory.

## Architecture

Everything is organized as a single `<script>` block (starting ~line 537) operating on a few global state variables and a set of `screen*` DOM containers toggled via `showScreen(id)`:

- **State**: `favs` (saved quick-start configs), `sessions` (completed training sessions), `currentCfg` (in-progress session setup), `activeSession` (`{cfg, passes, currentPass}` while a session is running). All persisted to `localStorage` under keys `bogen_favs` / `bogen_sessions` via `save()`.
- **Screens** (`home`, `session`, `review`, `stats`) are plain `<div class="screen">` elements shown/hidden by `showScreen()`; `updateHeader()` swaps the header title/subtitle/actions per screen.
- **Scoring modes**: `WA` (World Archery, rings 1–10/X/M) and `DFBV` (rings 1–5/M), each with their own CSS ring-color classes (`WA_CLASSES` / `DFBV_CLASSES` in `ringClass()`). `ringValue()` converts a ring label to its point value; `maxScore(cfg)` computes the theoretical max for a config.
- **Session flow**: `startSession(cfg)` → `renderSessionScreen()` (arrow chips, ring-tap grid, passe history) → `commitPass()` per end → `goToReview()` → `renderReview()` (allows editing individual arrows via `openPicker`) → `saveSession()` persists into `sessions`.
- **Favorites editor**: `favEditorData` holds a scratch copy of `favs` edited via `showFavEditor()`/`renderFavEditorSlots()` in 2-column rows (max 8 slots), committed with `saveFavs()`.
- **Stats screen**: `renderStats()` computes summary cards (PB/recent/average) and calls `renderChart()` (hand-rolled SVG sparkline, no charting library) over `filteredSessions()` (filtered by `statsFilter` mode/percent, `timeRange` days, `distFilter` meters).
- **CSV import/export**: `exportCSV()`/`importCSV()` round-trip `sessions` through a custom CSV format (semicolon/pipe-delimited passe details within a comma-delimited row) — keep the column order and delimiter scheme in sync between both functions if changed.
- **Modals**: favorites editor, arrow picker, confirm dialog, time-range picker, and an "about" dialog (shown once via the `bogen_seen` localStorage flag) are plain hidden `<div>`s toggled with `.hidden`.

All UI text and labels are in German; keep new user-facing strings consistent with that.
