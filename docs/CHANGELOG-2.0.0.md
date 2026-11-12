# Better SOLAR 2.0.0

Date: November 12, 2026.

| Request | Result |
| --- | --- |
| Simplify mobile schedule header | Removed the large capsule background. Directional paging arrows, uppercase MON–SAT labels, the small current-day pill, pinned hour rail and swipe cue remain. |
| Update previously collected records | Both app and popup show Update SOLAR Data when cached academic payloads exist. Updating re-discovers and re-reads available term datasets; it never clears the database first. |
| Preserve unchanged records | Canonical payload comparison ignores object-key order. Equal data keeps its payload/change timestamp; lastCheckedAt and verification metadata advance. Changed complete snapshots replace that category/owner/term only. |
| Protect records during partial collection | The collector requires complete scan evidence before saving. Stable reads, full-page traversal, multiple tables, declared totals, required rows, unfiltered results and loading/error checks gate replacement. Failed attempts preserve the last successful payload. Missing profile labels cannot silently erase previous values. |
| Reflect dissolved courses and changed schedules | A complete changed snapshot updates source rows and removes rows no longer in that verified term. A table-level confirmed empty response can clear its previous rows; missing/inaccessible tables and unreached terms retain cached data. |
| Narrow course information | All course-information dialogs are capped at 640 px, while preserving smaller labels on the left, bold left-aligned values on the right, the subtitle and visualizer removal actions. Other dialogs retain their established widths. |
| Mobile extension installation | Added a Manifest V2 background-page build and root-manifest mobile installation ZIP. Shared adapters support Promise/browser and callback/Chrome APIs, legacy tab injection and asynchronous messaging, window-to-tab launch fallback, optional alarms, foreground progress/resume and request timeout fallback. |
| Preserve UI and features | Desktop Manifest V3, shared pages/themes/fonts, calendar, schedule behavior, animations, consent, identity separation, queue/retry and data deletion remain in place. |
| Reorder README | Description, Features, How to install/use, Changelogs previews, Other information. Includes mobile installation, source builds, browser-local storage and compatibility limits. |

## Update integrity

A dataset is saved only after its entire supported document/table scope is read. In-document pagination must end normally and any declared total must match. Changed totals, skipped/repeated pages, malformed rows, loading/errors, filtered results and unknown pagination fail rather than modifying cached records. Every available term is attempted independently; a term missing from current discovery is retained because its deletion cannot be verified.

Completeness checks establish consistency of the returned document and supported controls, not completeness of SOLAR's internal backend. Unknown or full-navigation pagination is conservative and requires live validation. Explicit Settings deletion is the only operation that clears all local academic data.

## Mobile scope

The code and installable package target browsers offering WebExtension file installation. Orion's iOS APIs remain partial; Kiwi is archived. This release is **not device-verified** on either browser. Missing essential APIs cannot be implemented by an extension itself. See [Mobile compatibility](MOBILE-COMPATIBILITY.md), [Verification](VERIFICATION.md) and the recorded automated checks.
