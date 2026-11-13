# Better SOLAR for Mobile — v2.3.0

Released November 13, 2026.

## Fixed

- Section menus in Courses Offered, Add an Individual Course, and Add a Block Section now commit a tapped choice without depending on a follow-up click event.
- Exact typed sections persist without pressing Enter. Case-insensitive matching restores the portal's canonical section name.
- Touch scrolling through a long menu does not select an option. Menu placement follows the visible viewport when the keyboard opens.
- The app's mobile top edge uses an opaque navigation color, a matching browser theme-color hint, and safe-area padding, with page-owned header shadows removed. Browser-owned shading remains controlled by the host.

## Added

- **Save Schedule as PNG** on every weekly schedule, matching the PC feature set.
- Full-screen six-day preview, light/dark image mode, draggable resize handle, accessible width slider, and green Save PNG button. Minimum layout width: 850 px; mobile previews scale to fit without exporting only the visible three days.
- Settings for block color, full titles, optional collected curriculum titles, and custom course titles. Export changes leave saved academic records untouched.
- A faint current-year Gryymme watermark. File sharing is used when supported; download and manual-open fallback remain available.
- Rewritten mobile README and platform-specific release notes. Version and transfer metadata are now 2.3.0; older compatible JSON exports can still be imported.

## Installation and updating

Select the mobile ZIP directly in Orion's file-based extension installer. The manifest is at its root; no desktop build is included. Update the existing extension where supported and reload open SOLAR tabs. Export cached records before replacing an installation that may create a new extension identity.

## Verification

Synthetic tests and local PNG renders cover the new image and picker behavior. Native Orion interaction, browser-controlled status shading, and the share/save sheet require device verification. This release does not claim that every host supports live scraping; desktop JSON import remains available.
