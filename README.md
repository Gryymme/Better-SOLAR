# Better SOLAR — PC 2.2.0

## Description / What it's about

An offline companion for FEU Alabang SOLAR, for desktop Chrome/Edge 120+. Academic records stay in the extension's browser profile.

## Features

Cached profile, curriculum, grades, assessments, offerings, balances and reminders; Canvas calendar; weekly schedules and creator; themes; Settings; private desktop/mobile JSON transfer.

## How to install / use

Extract this ZIP. In Chrome/Edge Extensions, enable Developer mode and Load unpacked the extracted folder containing `manifest.json`. Sign in to SOLAR in the same browser, then open Better SOLAR and use Scrape Data / Update SOLAR Data.

For upgrades, keep the existing installed folder path, replace its contents with this ZIP's runtime files, then Reload the existing extension and reopen the app. Cached records are stored in your browser profile, not the installed folder. Do not uninstall the extension to update it.

Use Retry failed work after updating to recollect failed assessments. Unavailable grades/future offerings remain reported without erasing old cached data. Term/year selections remain in place during refreshes but reset when leaving the page.

For transfer: Settings → Transfer academic data → Export scraped data. Send that personal JSON privately to your phone, then use Choose import file → Import data in the mobile extension. Settings also provides direct SOLAR links and Delete all scraped data.

## Changelogs previews

2.2.0 accepts assessment summary/note rows, recognizes a verified empty payments table, preserves dropdown drafts during refreshes, and separates the PC/mobile runtime packages.

## Other information

This ZIP intentionally excludes mobile builds, nested archives, development scripts, tests, QA captures and historical documentation. The remaining JavaScript is editable runtime source. Fonts are fetched/cached on the first online launch unless bundled; the font license is included.

Your records are in IndexedDB (`better-solar-local`), not these files. Exported JSON contains personal data: keep it out of repositories. No personal records are included in this ZIP. Live portal/device compatibility still requires user verification.
