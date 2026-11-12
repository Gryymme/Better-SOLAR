# Better SOLAR 1.0.1

This update fixes assessment collection using the additional inspected markup and addresses all seven UI comments.

| Reported issue | Change |
| --- | --- |
| Assessment fee rows missing | Looks for populated leaf fee tables, including tables nested inside layout wrappers. Ignores empty/hidden duplicate forms, skips spacer rows, supports split fee/payment tables, and falls back to fee labels if classes change. Retains every dynamic label and original value. Allows more time for assessment content to finish loading. |
| SAF student/period labels | Recognizes `Student #`, Student Number/No./ID, and multiple values in one cell. Extracts embedded term/year from Year Level text; falls back to the submitted live dropdown option when those labels are absent. Does not hard-code enrollment history. |
| Regular text too small | Sets the body to 16 px and increases field values, labels, tables, status text and headings. Course lists retain conservative responsive type to fit their columns. |
| Navigation flicker near top | Keeps a permanent spacer and fixes the navigation to the viewport, so minimizing it cannot change scroll position. Separate collapse/expand thresholds prevent repeated toggling near a boundary. |
| Weekly schedule requires internal scrolling | Uses percentage-based Monday–Saturday columns across the available width. Removes fixed pixel widths and internal height limits. Measures course content and adjusts one consistent hourly scale to prevent clipping/overlap. Stacks wide layouts when each area needs more room. |
| Minimized header too tall | Uses a 44 px minimized bar, including mobile. |
| User Profile dropdown arrow | Replaces text glyphs with a consistent SVG chevron in both desktop and compact navigation. |
| Long course tables and hard-to-reach dialog actions | Bounds the main offerings table vertically, keeps its headers visible, wraps cells using explicit conservative column widths, and removes horizontal scrolling. The individual picker scrolls only the table; filters and Cancel/Add Courses stay outside that scrolling area. |
| Default light mode | Uses light when no explicit theme is saved, even on a dark OS. Existing deliberate light/dark preferences and cross-window updates remain supported. |

## Update an existing installation without losing cached records

1. Close open Better SOLAR application windows.
2. Extract the updated ZIP.
3. Copy the **contents** of the new `better-solar/dist` into the **same `dist` folder already loaded** in Chrome/Edge, replacing its files. Keep that installed directory path unchanged.
4. Open `chrome://extensions` or `edge://extensions` and click **Reload** on the existing Better SOLAR extension card. Do not remove/uninstall it.
5. Open the extension, select **Launch Application**, and use **Retry failed work** to collect failed assessment terms again. Successful cached records remain available.
6. If you explicitly saved dark mode before, use the theme button once to choose light. New/unset preferences default to light.

The source and build version are 1.0.1. IndexedDB remains schema version 1; this update does not erase or migrate your existing records.

## Verification

Regression fixtures reproduce the reported nested SAF structure with synthetic student/payment values, not personal academic data. Tests cover all source fees, the Student # label, multiple labels per cell, embedded year/term, empty/hidden duplicates, split tables, changed fee classes, stable navigation thresholds, adaptive timetable sizing, column wrapping, and light defaults. Exact results are in `qa/test-results.txt`.

Browser acceptance checks were expanded for the reported UI issues. Chromium still cannot launch in this workspace because socket creation is prohibited. Browser layout and interaction checks, and a real signed-in assessment refresh, remain to be performed on the installed extension. No live scrape or visual review is claimed.

The timetable itself has no inner scrollbars. Its full content determines its height on narrow screens or unusually short/overlapping meetings, so readable content remains present as part of the page.
