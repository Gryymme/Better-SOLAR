# Better SOLAR for PC — v2.3.0

Released November 13, 2026.

## Added

- **Save Schedule as PNG** at the bottom right of weekly schedules on Dashboard, Schedule and Assessment, and Schedule Creator.
- Full-screen preview with the project's green blocks, light/dark image mode, a draggable resize handle, and a keyboard-accessible width slider. Minimum layout width: 850 px.
- Schedule image settings for block color, original/full titles, optional collected curriculum titles, and per-course custom titles. The default title limit is 40 characters; full-title mode expands the schedule to fit.
- Local PNG rendering with all six days, overlapping lanes, course/time/credits/section/room details, and a faint `© Gryymme, <current year>` watermark.

## Fixed and changed

- Section choices commit directly on touch selection. Exact typed sections are retained without Enter, including keyboard dismissal.
- Section menus account for the visual viewport when a mobile keyboard is open; scrolling through choices does not select a course section.
- Rewritten installation/usage documentation and separate platform release notes.
- Version metadata and academic-data export metadata updated to 2.3.0. Existing transfer files remain supported.

## Updating

Replace files in the same installed PC folder and reload the existing extension. Do not uninstall it. Cached records stay in the browser profile, and image customization does not change them. Both packages remain independent runtime ZIPs; the PC ZIP excludes `dist-mobile`, development files, and nested archives.

## Verification

Synthetic tests cover image layout, all meeting lanes, title handling, safe customization, touch selection, and existing features. Actual PNG samples were rendered locally. Native browser tests could not launch in the build environment; live SOLAR and device acceptance are not claimed.
