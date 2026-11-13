# Better SOLAR — Mobile 2.2.0

## Description / What it's about

The mobile WebExtension runtime for Orion iOS/iPadOS and compatible extension-capable browsers. The mobile manifest is at this ZIP's root.

## Features

The shared Better SOLAR UI, offline academic records, Canvas calendar, weekly schedules, schedule creator, themes, Settings and desktop/mobile JSON transfer.

## How to install / use

Select this ZIP directly in Orion → Extensions → + → file-based installation. Enable the extension and allow SOLAR access. Open Launch Application for the full interface. Keep your existing extension identity when updating to preserve its browser-local cache.

Sign in to SOLAR in the same browser and try Scrape Data / Update SOLAR Data. Settings has direct portal links if SOLAR's mobile hamburger does not work. Reload SOLAR after an extension update so automatic scraper scripts are current.

As an alternative, export records on desktop using Settings → Transfer academic data → Export scraped data. Save the JSON privately on your phone, then choose it in mobile Settings → Choose import file → Import data. Existing newer datasets and unrelated terms are kept.

## Changelogs previews

2.2.0 distinguishes assessment summaries/notes from courses, recognizes a verified empty payments table, keeps dropdown choices during background refresh and supplies independent PC/mobile runtime ZIPs.

## Other information

Orion APIs vary by version; live scraping still requires device verification. This package includes no desktop build, development tools, tests or personal records. Fonts are fetched/cached on the first online launch unless bundled; the font license is included.

Cached records are stored in the extension's browser profile. Personal transfer JSON is separate from this installation ZIP. Keep exported JSON private and outside your repository. Settings → Delete all scraped data clears extension data, not downloaded export files.
