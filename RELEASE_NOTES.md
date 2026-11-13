# Better SOLAR for PC — v2.3.2

Released November 13, 2026.

## Added

- **Optional image labels:** Save PNG asks whether to add a label. Enter text to place it above the image's weekday headings, or leave the field blank for the schedule alone. Confirm Save PNG to choose a file destination. Cancel returns to the preview.

## Updated

- Time lines on weekly schedules and exported PNGs cover the actual meeting range. The first hour is rounded down and the last hour up: a 7:00 AM–4:50 PM schedule shows 7:00 AM through 5:00 PM.
- Curriculum titles are enabled by default in PNG settings. Switch this off to edit custom titles; existing draft edits are preserved between modes.
- Shared blocks keep a one-line code when it fits and show one title line underneath. Narrow codes still wrap at the letter/number boundary. Full-title mode displays complete course titles. Font sizes remain 12 px for codes/titles and 10 px for meeting details.
- Cached-record update text shares the schedule footer with Save Schedule as PNG. Narrow/mobile layouts shorten the prefix to Updated while collection errors remain visible.
- **Launch Application opens a new active tab** in the existing browser window instead of creating a separate browser window.
- The PC toolbar popup is now **440 px wide**, with room for the logo/title, actions, and collection status.
- Version and transfer metadata are 2.3.2; existing caches and compatible JSON transfers remain supported.

## Updating

Replace files in the same installed PC folder and reload the existing extension. Cached academic records stay in your browser profile. Save PNG retains the native Save As flow introduced in 2.3.1 and its downloads permission.

## Verification scope

Automated fixtures cover image labels and blank-label geometry, occupied-hour bounds, responsive shared text, curriculum defaults, the cache footer, and tab launch. Synthetic PNGs are rendered locally. Native browser layout and OS chooser behavior still require device acceptance; this build environment blocks Chromium startup.
