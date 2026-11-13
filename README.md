# Better SOLAR for Mobile

**v2.3.2** — The Better SOLAR mobile compatibility extension, packaged for file-based installation. Academic records, calendar events, and schedules remain available offline after collection or import.

## Features

- Academic records, Canvas calendar, light/dark themes, and Settings.
- Three-day schedule swipe views with fixed time labels and complete course details.
- Schedule Creator with searchable sections, individual/block additions, and overlapping meetings.
- Full-screen PNG export with resizing, color/title settings, and mobile share/download options.
- Private desktop-to-mobile academic-data transfer.

## Installation

In Orion's extension settings, choose file-based installation and select **this ZIP directly**. Its manifest is at the archive root; do not repack or nest it in another folder. Enable the extension, allow SOLAR access, and open **Launch Application** for the full interface.

### Updating

Update the existing extension through your browser's supported update/reimport flow. Installing a separate copy can create separate storage. Export records from Settings before replacing an installation. Reload open SOLAR pages after updating.

## Usage

Sign in to SOLAR in the same browser, then choose **Scrape Data** or **Update SOLAR Data**. Settings has direct SOLAR links if the portal's mobile menu does not work.

As an alternative, export data on desktop using **Settings → Transfer academic data → Export scraped data**. Save the JSON privately on your phone, then choose **Choose import file → Import data** in mobile Settings.

Tap a section option in Courses Offered or Add a Block Section. You can also type a complete section; a valid choice is retained without pressing Enter.

Use **Save Schedule as PNG** at the bottom right of any weekly schedule, alongside its update timestamp. Mobile shortens the status to Updated. The full six-day image scales to your screen for preview. Use the width slider (the mobile package has no drag handle) to change its layout width (850 px minimum). The gear opens color/title settings with curriculum titles enabled by default; image edits do not modify academic records. Exports retain normal 12 px code/title and 10 px time/room text, including overlaps. Wide shared blocks retain a one-line code and one title line; full-title mode displays complete titles. Time lines cover the actual scheduled hours, rounded to hour boundaries. **Save PNG** asks for an optional label before saving. Leave it blank for the schedule alone. Confirming uses file sharing when supported, or a download with an **Open PNG** fallback for manual saving.

## Release notes

See [RELEASE_NOTES.md](RELEASE_NOTES.md) for Mobile v2.3.2 changes and update notes.

## Data and compatibility

Records live in the extension's browser profile, not this ZIP. This package includes no personal data, PC build, nested archives, tests, or build tools. Keep exported JSON and PNG files private. Settings → Delete all scraped data clears local extension data, not downloaded files or your SOLAR/Canvas accounts.

Mobile hosts vary in extension API support, background suspension, status-bar tinting, and file sharing. Native device behavior still requires verification; desktop JSON import remains available if live collection is unsupported. Browser-owned shading cannot be removed by page CSS. Fonts are cached on the first online launch unless bundled; the SIL license is included.

Created by Gryymme (Elijah Miranda Nonan). Independent student project, not an official FEU/SOLAR/Canvas product.
