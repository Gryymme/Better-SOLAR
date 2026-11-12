# Verification and acceptance report

Date: November 12, 2026. Updated for version **2.0.0**.

This revision adds regression coverage for the reported nested SAF markup and UI corrections. See `CHANGELOG-1.0.1.md` for the issue-to-change mapping. All test results are recorded in the rebuilt `qa/` logs.

## Executed checks

| Check | Result | Evidence / scope |
| --- | --- | --- |
| JavaScript syntax and extension manifest | PASS | `npm run check`; all production, scraper, test and build JavaScript parsed by Node |
| Automated regression tests | PASS | See `qa/test-results.txt` for the exact test count and TAP output |
| Production build | PASS | `npm run build`; all runtime resources copied to `dist/` |
| Seven local categories and stable upserts | PASS, API double | Category separation, repeated refresh, separate term/year keys and student scopes |
| Failed-refresh preservation | PASS, API double | Old data retained; status/error updated; retry leaves successful terms untouched |
| Automatic all-option collection | PASS, Chrome API double | Separate Course Offerings years with different available terms; independent SAF, Grades and Balance histories |
| Source selector whitespace and association | PASS, fixtures | Original spaced grades selector retained; term/year and source selection attached to each record |
| Authenticated response DOM parsing | PASS, fixture tree adapter | Profile, balance, offerings, curriculum, SAF and grades extraction tested using the actual scraper functions |
| Submission response verification | PASS, predicate / event doubles | Rejects unchanged document/results and wrong selections; accepts new document or settled result mutation; new AJAX table insertion handled |
| Dependent year/term preparation | PASS, event double | School year applied before term, dependent term option selected, normal requestSubmit invoked |
| Money/payment/grade integrity | PASS | Parenthesized overpayments, all payment rows, source decimal strings, blank final grades |
| Curriculum/SAF integrity | PASS | All groups; multiple summary labels per cell; variable fee labels and live date-range strings |
| Weekly schedule construction | PASS, pure logic / HTML output | Monday–Saturday, paired day/time/room entries, TH vs T, title limit, room prefixes, expanded hour height, overlap lanes and no-slot preview highlighting |
| Course filtering and conflicts | PASS, pure logic | Combined filters, every selected day, slot classification and warning rules, existing/new selection conflicts, duplicates and adjacent intervals |
| Navigation/footer/static tables | PASS, HTML output | All destinations and social URLs, exact credit, dynamic selectors and required grading values |
| Calendar parsing | PASS, pure logic | UTC/IANA/all-day dates, unfolding and escapes, common recurrence, exceptions, additions and canceled overrides |
| Text contrast token calculation | PASS for checked primary pairs | White on brand green 4.64:1; muted text on white 4.99:1; amber warning text was darkened after checking |

The fixture DOM adapter uses Python's HTMLParser to construct representative trees. The database and collector tests use explicit API doubles. These tests validate extraction, scheduling, queue behavior and stored values; they do **not** establish live portal compatibility, browser layout, native form timing, persistence across actual browser restarts or native extension permissions.

## Browser test attempt

The browser suite was attempted. Playwright could load, and system Chromium was found, but this workspace prohibited Chromium's Unix socket creation (`Operation not permitted`). No browser screenshots or passing visual review are claimed. The optional suite remains in `scripts/browser-tests.mjs` for use on a browser-capable machine.

## Implemented, awaiting installed-browser acceptance

| Feature | Implemented behavior | Acceptance still required |
| --- | --- | --- |
| Popup | Scrape Data, retry, progress, Launch Application, theme | Install, launch a separate app window, verify popup controls |
| Authenticated collector | Inactive SOLAR tab, normal forms, source IDs/headers, dynamic selector traversal | Real signed-in SOLAR run, every available year/term, dependent selectors, redirects/AJAX timing, session expiry |
| Resume/retry | Durable queue, worker-safe step upserts, periodic alarm | Close popup mid-run, suspend worker/restart browser, retry real failures |
| Profile and curriculum | Every specified field/group; excluded Grades Viewing | Compare field-by-field against authenticated DOM |
| Balance | Multiple paired payments, raw source balance, Remaining Balance/Overpayment/None | Compare all actual balance periods and portal-specific history navigation |
| SAF | Exact requested page title, four-field displayed summary, all stored source summary fields, courses, fees, payment options and timetable | Verify real fee table markup, total credits, totals, date labels and ENROLLED condition |
| Grades | Explicit submitted context, missing-final handling, exact undergraduate grading system | Compare all collected grades with portal |
| Shared UI | Green expanded navigation, minimized surface navigation, desktop/dropdown/tablet/mobile navigation, social footer | Review at 390/700/768/1024/1440/1920 px, keyboard/touch, dark mode and actual fonts |
| Footer | Positioned beyond initial viewport | Verify scroll-only visibility on every short/long page |
| Theme | Shared storage event updates and saved choice | Change theme in popup while app is open; launch second window and restart browser |
| Canvas | Direct HTTPS feed request, optional origin permission, persistent URL/raw feed, manual refresh and offline cache | Connect real feed, verify events/dates/timezones, deny/re-grant permission, invalid and offline cases |
| Schedule creator | Multi-select, independent modal filters, block insert, no-slot warning/confirmation, atomic conflicts, remove and retained draft | Exercise dialogs, keyboard, outside-click/Escape, short/overlapping meetings and responsive reflow |
| Offline | All runtime files local, cached records/ICS read from IndexedDB | Disconnect network, close/open extension app, navigate every route, verify previous records remain accessible |
| Exit | Closes a window created by the extension; fallback message in a normal preview tab | Test installed app window and responsive menu Exit |

## Manual release checklist

1. Load `dist/` unpacked in Chrome/Edge 120+ and inspect the extension error list.
2. Sign in to a real SOLAR account in the same browser profile. Click Scrape Data and compare progress with every selector option on each source page.
3. Verify record term/year against source selection, fee totals, source raw strings, every payment, and blank finals. Confirm the student's original tab is unchanged.
4. Simulate a network/session failure and confirm errors are visible, earlier snapshots remain, and Retry failed work succeeds after signing in again.
5. Launch the app, test every navigation item/selector, then the light/dark control across popup and multiple windows.
6. Connect a real Canvas Calendar Feed URL. Compare activity dates/times with Canvas, navigate months, refresh, and test an invalid URL while a valid feed is already cached.
7. Test schedule entry pairing (including F / T with different times/rooms), long titles, zero-slot rows, filter combinations, conflicts among newly selected courses and conflicts with existing courses. A rejected block/selection must not add anything.
8. Review desktop, tablet and mobile layouts. Verify keyboard focus, menus, dialogs, all six timetable headers, wrapped course tables, contained vertical table scrolling, and schedules without internal scrolling, footer positioning, and reduced-motion mode.
9. Disconnect network, close and reopen the extension app. Verify that all collected data and the saved calendar remain usable with clear cache timestamps.
10. Close/reopen the browser during a test collection and verify pending tasks resume. Test Exit from the app's own launched window.

## Transparent limitations

- No real authenticated SOLAR or Canvas session was supplied or tested here.
- Browser visual/interaction/installed-extension acceptance could not run in this environment.
- Balance terms unexposed by the live portal cannot be known in advance. Enrollment-history probes are explicit and report failure; they are not represented as successful empty balances.
- The supplied references did not include an independent `logo.jpg`. The project includes an original Better SOLAR logo, not an official FEU seal.
- The calendar supports common Canvas/iCalendar data. Custom VTIMEZONE definitions, subdaily recurrence and unsupported rule combinations show an error rather than guessed activities. Monthly BYSETPOS is supported; yearly BYDAY requires one explicit BYMONTH.
- Cached records are device/browser-profile local; no cloud synchronization or automatic recurring Canvas refresh is implemented or required.

## 1.0.2 additions

The regression suite now includes settings deletion across all account scopes, cancellation during active scraping, late alarm safety, stale Canvas response protection, cross-window reset signals, AND day filtering, route reset, curriculum widths, wrapped SAF entries, rounded empty-grade containers, modal scroll regions, two-line title fitting, footer order and font caching. Fonts and cross-window browser APIs are tested through explicit doubles, not an actual browser.

Additional manual acceptance: inspect Montserrat after first online download and after offline reopening; open/close every dialog with long content; inspect the 7:00 AM label; test multiple selected days; navigate away/back from all four selector pages; inspect long event cards and Canvas/Close buttons; exercise all four animations with reduced motion enabled/disabled; confirm data deletion during a real scrape and during a delayed Canvas request while multiple windows are open.

The build environment also blocked font-file network downloads. The supplied build automatically caches Montserrat at first online launch; fully bundled fonts can be produced with `npm run fonts` and `npm run build`. Actual font bytes/rendering were not verified in this workspace.

## 1.0.3 additions

Added regression checks for retry controls inside collapsed details, section search and deduplication, six-row menu geometry, opening above low controls, narrow-viewport clamping, keyboard commit/restoration, clearing a section filter and late blur safety after removal. The native browser suite includes planned checks for equal panel widths, compact type, grades gaps, retry visibility, bounded dropdowns in dialogs and popup animation; those native checks remain unexecuted because Chromium is unavailable here.


## 1.0.4 additions

Automated regressions check collapsed collection-card content boundaries, progress fractions and width continuity during DOM replacement, click-to-dialog origin geometry, sidebar frame direction, half-row table cutoffs with nonuniform rows, unscaled table measurement during popup animations, single leading menu placement, non-padded weekly hours, semantic bold code/title, wider Credits and measured mobile text wrapping. Explicit DOM/style doubles verify layout coordination; these are not native rendering results.

The optional browser suite now checks Section label alignment, half-row cutoffs in the main course table and course picker, full-width square phone cards, mobile time-line fitting, bounded course text, leftmost menu position, delayed sidebar dismissal, generic collapsed collection feedback and directional dialog offsets. These checks still require a browser-capable machine. A fresh Chromium launch was attempted for this revision, but the workspace again denied Unix socket creation (`Operation not permitted`). No passing native browser checks, screenshots or authenticated collection are claimed.

Manual acceptance for this revision:

1. At 390 px and 320 px widths, inspect the calendar, SAF, grades, curriculum and weekly schedule; check full-width square cards, complete non-offering tables, bold course titles and matching time/room sizes. Verify `7:00 AM–8:50 AM` stays on one line. Offerings alone may scroll horizontally.
2. At compact/tablet widths, verify Menu is before the logo. Open/close it by button, shade, Escape and route selection; test rapid toggles. Repeat with reduced motion enabled.
3. Trigger collection. While collapsed, verify only the generic heading/bar appear; expand for current work, term/year and counts below the bar. Verify the bar moves smoothly through repeated progress updates in both the application and extension popup.
4. Open event, settings, individual-course, block-section and Canvas dialogs from different locations. Confirm the opening direction follows each invoking button. Hover all header controls and the User Profile dropdown.
5. Filter a long offerings table and resize its window; verify the viewport ends halfway through the following row, while the last row remains fully reachable by scrolling. Repeat inside the individual-course dialog, including after validation errors and font loading.


## 1.0.5 additions

Automated tests cover PNG discovery and exclusion of navigation/logo/external images; authenticated image fetching; PNG signature, HTTP failure and size checks; offline image rendering; collector integration and the seventh category; warning lists and enabled checkboxes for full/unverified courses; red visualizer blocks with unchanged conflict validation; Academics/Enrollment destinations; shared app/Settings report contents; dialog tail geometry and animated-close lifecycle, cancellation, focus restoration and deletion guards; and exactly 16 characters per complete mobile course-text line with measured font sizing.

The native browser suite has planned checks for warning Back/confirmation behavior, red blocks, rounded inset mobile cards, 16-character wrapping, retained Settings reports after dismissal, matching Settings/Exit sizes and the shorter directional popup trajectory. Browser visual checks remain unavailable due the workspace's Chromium socket restriction. The authenticated enrollment/reminders page could not be retrieved by the web reader; its real markup and image layout have not been inspected here. The collector discovers same-origin PNG images from the live page instead of using an invented image filename. A real signed-in collection is required to verify compatibility.

Manual acceptance for this revision:

1. Collect all records while signed in, open Enrollment → Enrollment Reminders and verify the PNG against SOLAR. Reopen offline. A login/error response must report failure and retain any earlier successful image. Delete data and confirm the image disappears in every app window.
2. Select a full course, choose Add Courses, inspect its exact code/section in the warning, use Back, and verify the selection remains. Repeat and confirm Add to visualizer; inspect the red block. Repeat with a block section that includes a full course. Confirm conflicting meetings and duplicate selections are still rejected atomically.
3. Dismiss the cache card, switch pages/reopen the app, and view the report in Settings. Start another collection; confirm the card returns and progress updates in both places.
4. At full and compact widths inspect nav spacing, Academics/Enrollment links, equal Settings/Exit dimensions, bright-red Exit hover, and the plain leading hamburger with Settings only in the sidebar. Compare Today and arrow dimensions. On stacked layouts open the creator and verify scrolling to it and the Close button above its schedule.
5. Open and close all dialog types with buttons, Escape and outside clicks; verify short fade-in motion from the invoking direction and a contained fade-out. During deletion confirm the spinner appears and dismissal is disabled until completion. Test reduced motion.
6. At 320/390/700 px inspect rounded inset cards, smaller general/button text, unchanged event/table type, and 16-character complete schedule-title lines. Short final lines and short course codes naturally contain fewer characters.


## 1.0.6 additions

New regressions exercise the corrected SAF heading/eyebrow; Courses Offered nested under Enrollment in desktop and sidebar markup; calendar connection/Open Canvas order and SVG arrows; removal targets without nested X buttons; removal confirmation Cancel/accept promises and focus restoration; initially collapsed reports; shared mobile code/title font sizing, whole-word wrapping and maximum line length; abbreviated axis hours with complete meeting-time metadata; and content-height calculation. Existing dialog lifecycle tests retain close timing, replacement safety and deletion dismissal guards while testing centered inverse motion.

A new native-browser launch attempt was blocked by Chromium's Unix socket restriction (`Operation not permitted`). `qa/browser-attempt.txt` records this result. No passing native layout checks or screenshots are claimed. The optional browser suite now includes course-block Cancel/keyboard removal, compact Settings dimensions, collapsed Settings reports, matching mobile code/title fonts, compact block heights and shortened hour-axis labels.

Manual acceptance for this revision:

1. Verify the SAF page title and eyebrow before and after submitting a term. Confirm Account Balance Summary retains its own heading.
2. Open Enrollment on desktop and in the sidebar; Courses Offered must be inside that group. Compare header logo sizes before/after scrolling. At 1440/1920/2440 px, compare the left/right page, navigation and footer boundaries and control padding.
3. Open Settings twice; its report must start collapsed each time. Expand it during collection and confirm progress updates preserve that choice. Verify centered open/close motion for all dialogs, including Escape and outside-click dismissal, and reduced motion.
4. Check connection/Open Canvas order. Hover month/Today controls: only a same-sized flat highlight should appear; inspect arrow visibility and keyboard focus outlines.
5. Click a visualizer course block, cancel and confirm it stays. Repeat and remove; every meeting for that course must disappear. Test Enter and Space, the list Remove action, no-slot blocks and data deletion while a confirmation is open.
6. At 320/390/700 px, verify equal code/title font sizes, complete words on lines of at most 16 characters, shorter hour markers, full minute-accurate meeting times and no excess blank space beneath room labels. Words longer than 16 characters use a single ellipsis label instead of being split across lines; the complete original title/code remains in the accessible course description and confirmation.


## 1.0.7 additions

Automated checks cover three separate course-action results (selected/all/cancel); confirmation destination/checkbox behavior; external URL classification, Cancel, Proceed, persisted opt-out, restoration, cross-window preference changes, repeated-click suppression, normal/middle-click interception and storage failure rollback; theme-transition lifecycle, rapid reversal, first-load suppression and reduced motion; wider Remaining Slots columns and absence of character-breaking CSS; calendar ellipsis at word boundaries; OSES-only source rendering and live DOM discovery, including future terms, hidden history, non-image links and unrelated images; and deletion retaining only non-private theme/link preferences.

The optional browser suite includes planned checks for block hover colors, removing all courses, absence of the old list, neutral dark surfaces, the theme-transition flag, and external-link Cancel/Proceed/remember/reset behavior. It stubs website opening to avoid navigating to real services during tests. Native Chromium checks remain blocked by the workspace's socket restrictions; no passing native screenshot review or authenticated collection is claimed.

Manual acceptance for this revision:

1. Open a populated visualizer and hover a green/red course. Inspect the color change, lift and keyboard focus. Click a block and exercise Cancel, Remove course and Remove all courses; verify counts and every meeting change correctly. The redundant list must be absent.
2. Inspect Remaining Slots on full-width and side-by-side offerings, plus the individual-course dialog. Inspect headings, descriptions, calendar titles and narrow tables for complete-word wrapping. Very long single tokens may use existing component ellipsis rather than be split into separate lines.
3. Try navigation, calendar event, Open Canvas, reminders and footer links. Cancel must open nothing. Proceed opens the chosen destination. Do not ask again suppresses future external prompts; Settings restores them. Repeat by keyboard and middle click, in the extension popup, after reopening, and in another app window.
4. Switch Light → Dark → Light quickly and from another app window. Inspect the smooth colors, neutral dark page/cards/dialogs/borders and preserved intentional green/red/amber elements. Repeat with reduced motion.
5. Collect Enrollment Reminders while signed in. Confirm only the displayed OSES term-specific Alabang PNG is downloaded and shown, including a different term filename. Other page images and download links must be ignored. Reopen offline, then delete data and confirm the image is removed while the non-private appearance/link preferences remain.


## 1.0.8 additions

New automated regressions cover allowing existing/new overlap combinations while preserving duplicate and invalid-meeting checks; two-way, nested and three-way overlap groups; transitive groups, adjacent meetings, independent days and full-width recovery; unchanged source meeting objects; shared-renderer geometry for editable and read-only timetables; the 20-character shared-title cap with full accessible descriptions; code formatting including numeric suffixes; common font fitting without breaking full title words; and the external confirmation checkbox inside the footer alongside its actions instead of in the scrolling body.

The optional browser script now expects accepted overlapping individual selections and verifies shared-column/title metadata. It retains duplicate block validation, no-slot warnings, removal controls, and adds a footer checkbox/action alignment check. Native browser execution remains subject to the workspace's Chromium socket restriction; no passing visual review is claimed.

Manual acceptance for this revision:

1. Open external links from the main app and extension popup at desktop and 320/390 px widths. Confirm the checkbox sits below the divider on one footer row beside Cancel/Proceed, remains keyboard-accessible, and still remembers/resets the preference correctly.
2. Add two courses with overlapping times, both together and against an existing visualizer course. Add a block with internal or existing overlaps. Every valid selected course must be included. Duplicate rows must still be rejected and full-course warnings must remain.
3. Compare Dashboard, Schedule and Assessment and the visualizer using two-way/three-way, nested and chain overlaps. Blocks sharing times must occupy different lanes; later unrelated meetings and other days must keep full column width. Adjacent meetings must not be treated as overlapping.
4. Resize shared blocks to narrow widths. Verify `CCS0001` → `CCS-` / `001` and `GED0004A` → `GED-` / `004A` when wrapping is needed. Original codes in records and course-action dialogs must remain unchanged.
5. Verify shared block titles contain at most 20 displayed characters including ellipsis. Code/title fonts must match; full displayed words must fit without character-level wrapping. An individual long word may exceed the earlier 16-character line preference, but must stay on one fitted line. Full minute-accurate times, room labels, hover/removal and mobile content-fitted heights must remain.


## 1.1.0 additions

Automated coverage now includes every weekday-to-half mapping; initial horizontal placement; persistence after resizing; cue visibility gating, direction, smooth return and once-per-view behavior; reduced-motion suppression; cancellation on interaction; arrow-key paging; observer/listener cleanup; time labels outside the horizontal viewport; six columns inside the day track; all four mobile course fields at fixed regular type; six complete course information fields and the requested subtitle; and compound checkbox controls with separate accessible names/descriptions.

Course details continue to preserve original codes/titles, known numeric credits and the clicked meeting's exact time/day/room. Offering enrichment does not invent missing credits. Both read-only and editable timetable blocks retain keyboard access and data-deletion cleanup. The visualizer still supports overlaps, no-slot warnings, selected/all removal and consent preferences.

The optional browser suite includes three-column track-width checks, stable time-rail position after horizontal scrolling, bold/larger right-side values with smaller left-side labels, subtitle checks, and checkbox centering/alignment. Native Chromium remains blocked by the workspace socket restriction; passing native visual review is not claimed.

Manual acceptance for this release:

1. On 320/390/700 px windows, verify exactly three day columns fit beside the fixed hour rail. Compare code/title/time/room information and block heights with the regular timetable. Swipe both ways and verify the labels do not move horizontally and the page itself does not overflow.
2. Check Sunday, Monday, Tuesday and Wednesday default to the first half; Thursday, Friday and Saturday default to the second half. Check the visible-entry cue moves slightly toward the hidden days and returns. Drag or tap during the cue, use reduced motion, resize, and exercise Arrow Left/Right and Home/End.
3. Open course information from Dashboard, Assessment and the visualizer. Labels must be on the left; values must be on the right, left aligned and larger/bolder than the labels, with a compact gap. Verify the subtitle and full original field values. Only the visualizer should expose removal controls.
4. Inspect external confirmation and Settings on wide and narrow windows. The checkbox must center vertically against both text lines; the title/help text starts at one common left edge. In wide Settings, Ask before opening external websites must remain one line. Consent/opt-out/reset and data deletion must still work.

### Day-header / course-detail follow-up

- Automated swipe coverage includes header-arrow paging, disabled directions after a manual swipe and disposal of button listeners. The shared rendered schedule exposes MON–SAT abbreviations while retaining full accessible weekday names.
- Manual acceptance: at mobile widths, verify the rounded neutral capsule header, today’s inset pill and subtle edge arrows. Tap each available arrow, then swipe in both directions; confirm the pinned hour rail, three-day viewport and course columns stay aligned. Desktop headers should retain full weekday names.
- Open course information from Dashboard, Assessment and the visualizer: labels must be to the left of their left-aligned bold values, with a compact 12 px gap (10 px on mobile). The subtitle and all full values must remain present.
- Native Chrome rendering remains unavailable in this environment; browser geometry assertions are included for a compatible host.

## 2.0.0 additions

- The mobile schedule removes the large header capsule but retains arrows, MON–SAT labels and the small current-day pill. Course-information dialogs are capped at 640 px without changing other dialog widths. Native visual acceptance remains outstanding.
- The shared heading and popup use Update SOLAR Data once cached academic data exists. Canonical comparison retains equal payloads and their original change timestamp while recording the successful check time.
- Real DOM scan fixtures now traverse every supported page, compare declared row counts, collect multiple curriculum tables and reject missing/partial/filtered/unconfirmed-zero responses. They cover changed totals, skipped/repeated pages and unsupported pagination. Database fixtures cover changed rooms, dissolved courses, isolation of other terms and protection against missing profile fields.
- Collector fixtures cover both modern and legacy injection/message paths, rejection of unverified snapshots, retry and deletion. API doubles cover callback-only Chrome, Promise-only browser, runtime.lastError and window-to-tab fallback.
- Desktop MV3 and mobile MV2 builds contain the same source assets; mobile uses a background HTML page and bundled private bridge. Root-manifest installation archives are checked separately from the outer source archive.
- README is organized as Description, Features, How to install/use, Changelogs previews and Other information, with real platform references and explicit browser-local storage details.

### Outstanding native acceptance

No passing native-browser rendering, actual mobile installation, live authenticated SOLAR update, real Canvas connection or mobile OS suspension test is claimed. Orion has partial iOS API support; Kiwi is archived. The ready-built mobile package and compatibility fallbacks are code-complete but require device verification. See MOBILE-COMPATIBILITY.md.

On a real signed-in browser, compare complete tables and totals before/after an unchanged update, a dissolved course and a changed room. Interrupt pagination, expire the session and simulate a missing table: cached payloads must remain. Confirm that unknown/missing term options do not remove old term datasets. Verify both app and popup labels return to Scrape Data after explicit deletion.

Release result: **163/163 automated tests passed**, syntax checks passed, both builds passed and both root-manifest archives passed integrity/asset checks. A fresh 2.0.0 Chromium attempt again failed on prohibited Unix socket creation; see qa/browser-attempt.txt.
