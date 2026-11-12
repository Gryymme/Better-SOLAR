# Better SOLAR

A local-first companion for FEU Alabang SOLAR, built as a Chrome/Edge Manifest V3 extension. It collects academic records through the browser's authenticated SOLAR session and displays them in a responsive, offline application. The interface follows the supplied layouts with the required `#2e844c` brand green.

**Delivery status:** Implementation and automated fixture tests are included. A real signed-in SOLAR scrape, real Canvas connection, browser layout review, and installed-extension acceptance checks still need to be performed. This environment could not launch Chromium. See [Verification](docs/VERIFICATION.md) for the precise scope of testing and remaining checks.

## Version 1.0.8

The external-website dialog now puts **Do not ask again** below the divider, in the same footer row as **Cancel** and **Proceed**, including compact phone layouts.

The schedule creator accepts courses whose meeting times overlap, both individually and as block sections. Duplicate selections and invalid meeting data are still reported, and no-slot warnings remain. All weekly timetables place conflicting meetings side by side within the affected day/time group; later non-conflicting meetings regain full day-column width.

Overlapping blocks display at most **20 characters** of the course title, including the ellipsis, while the complete title remains in the accessible description and course-action dialog. Code and title share one fitted font size across desktop and mobile schedules. Whole title words shrink to fit a line rather than being split or replaced. When a code needs wrapping, letters and numbers separate with a hyphen: `CCS0001` displays as `CCS-` / `001`, and `GED0004A` as `GED-` / `004A`. Original source codes stay unchanged. See [the full change log](docs/CHANGELOG-1.0.8.md).

## Version 1.0.7

Clicking a visualizer course block now offers **Remove course**, **Remove all courses**, and **Cancel**. The redundant list beneath the timetable is gone. Hovering a clickable block changes its color and gives it the same lift as a button, including a separate red hover color for full courses.

Word wrapping now keeps words together throughout the interface. Remaining Slots receives a wider column in both offerings tables. Calendar title truncation also prefers complete words.

External website links ask before opening. Choose **Proceed** or **Cancel**; checking **Do not ask again** applies to external links across the app and extension popup. In Settings, turn **Ask before opening external websites** back on to restore confirmation. This preference is separate from academic data and survives Delete all scraped data, like the theme preference. Registration and COR Revision carry northeast arrows.

Theme changes animate color transitions, including changes from another app window. Dark mode uses neutral black/gray surfaces and keeps intentional green, red and amber elements in their corresponding colors. Reduced-motion preferences disable the transition.

Enrollment Reminders collects only the visible term-specific `/images/OSES_<term-and-year>_ALAB.png` image (for example `OSES_1T2627_ALAB.png`), instead of collecting other page images. Run **Scrape Data** while signed in to refresh this image. Unrelated older cached images are no longer displayed. See [the full change log](docs/CHANGELOG-1.0.7.md).

## Version 1.0.6

Schedule and Assessment now uses its correct title and the shared **BETTER SOLAR** eyebrow. Courses Offered is inside **Enrollment** on desktop and in the sidebar. The expanded logo is larger, page/header/footer edges share consistent gutters, header controls have more horizontal padding, and Settings is compact while matching Exit's height.

Dialogs fade and grow from the center, then reverse that movement when closed. The collection report starts collapsed whenever Settings opens. The calendar places the connection button before **Open Canvas**; its month/Today controls have no borders, flat hover highlights and clearer SVG arrows.

Click a course block in the visualizer, or press Enter/Space while it is focused, to confirm **Remove course** or **Cancel**. Confirmation removes all meetings for that course; blocks no longer contain separate X buttons. Mobile code/title text shares one measured font size, wraps complete words within 16 characters per line, uses shorter hour-axis labels and has content-fitted block heights. Full meeting times remain visible. See [the full change log](docs/CHANGELOG-1.0.6.md).

## Version 1.0.5

Full or unverified courses remain selectable in the schedule creator. **Add Courses** and block-section **Submit** show a warning listing affected courses; choose **Add to visualizer** to include them with red course blocks, or **Back** to retain your selection. Duplicate and meeting-conflict checks still prevent invalid additions.

The navigation now groups academic pages under **Academics** and adds **Enrollment** after Courses Offered, with links to Course Registration, COR Revision and the new cached **Enrollment Reminders** page. Canvas is beside its connection button inside the calendar. The Settings and Exit buttons match in size; compact navigation uses a plain hamburger and keeps Settings in the sidebar.

The collection card can be dismissed; its report remains available in Settings. New collection brings the status card back. Dialogs use a short fade/translation in the direction of the invoking control and animate closed. Deletion shows a spinner before clearing records. Mobile cards are inset and rounded again, general text is smaller, and long timetable code/title lines fit 16 characters before wrapping. See [the full change log](docs/CHANGELOG-1.0.5.md).

After updating, use **Scrape Data** while signed in to SOLAR to collect the new reminders PNG. The image is downloaded through the authenticated collector tab, validated and cached in IndexedDB under **Enrollment Reminders**, separately for each verified student. It remains available offline and is removed by **Delete all scraped data**. Registration and COR links open SOLAR; the visualizer does not register courses.

## Version 1.0.4

The Section filter label now aligns correctly. During collection, the collapsed status card shows only **Collecting SOLAR Data** and a smoothly animated progress bar; expand it for the current dataset, term/year and step count. Dialogs open from the invoking control, navigation hover effects are consistent, the profile dropdown animates, and the left-side menu slides both ways.

Scrollable offerings tables finish at half of the following row to indicate more content. Weekly schedules use bold code/title text and smaller matching time/room text, with hours such as `7:00 AM`. SAF reserves more width for Credits. Phone layouts use full-width square cards, compact calendar/table text and measured timetable wrapping capped at 15 characters per line. Only the wide offerings table allows horizontal scrolling. See [the full change log](docs/CHANGELOG-1.0.4.md).

## Version 1.0.3

Cache-feedback retry controls now appear only in expanded details. Side-by-side schedule panels have equal widths, calendar event text and adjacent table text are smaller, dialogs animate on opening, section dropdowns show at most six rows at a time, and grades cards use a consistent 24 px gap. See [the change log](docs/CHANGELOG-1.0.3.md).

Section menus remain searchable and retain every available choice. Use Arrow Up/Down and Enter to choose; Escape closes the menu first. The main course list, individual-course picker and block-section dialog all use the same bounded control. This replaces the browser's unbounded suggestion popup shown in the reference screenshot.

## Version 1.0.2

This update applies the Montserrat design, Settings with local-data deletion, reset-on-leave term selectors, AND day filters, uniform curriculum columns, wrapped SAF meetings, contained dialog scrolling, consistent empty-grade cards, calendar title truncation, a centered footer and reduced-motion-aware animations. See [the full change log](docs/CHANGELOG-1.0.2.md).

**Montserrat needs one online launch to download its pinned font files into the browser's font cache.** Later launches can use that cache offline. Direct binary downloads were blocked in the build workspace, so this supplied ZIP does not contain the font binaries. To bundle them before first launch, run `npm run fonts` and `npm run build` on an internet-connected machine. See [font setup](assets/fonts/README.md). Academic records are never sent with font requests.

## Updating from 1.0.0

Version **1.0.1** fixes nested assessment fees and `Student #` mapping, increases regular text to 16 px, stabilizes/shrinks the navigation, uses SVG dropdown chevrons, removes internal timetable scrolling, contains and wraps course tables, and defaults to light mode.

**Keep your installed folder path unchanged:** copy the new `dist` contents into the existing installed `dist` folder, click **Reload** on the existing Chrome/Edge extension card, reopen the application, then choose **Retry failed work**. Do not uninstall the extension or load a different folder path if you want to retain its cached records. See [the change log](docs/CHANGELOG-1.0.1.md) for details.

## Install the ready-built extension

No Node.js installation or build is needed for these steps.

1. Extract `Better_SOLAR.zip` and keep the extracted folder on your computer.
2. In Chrome, open `chrome://extensions`; in Edge, open `edge://extensions`.
3. Enable **Developer mode** and choose **Load unpacked**.
4. Select the **`better-solar/dist`** folder. Select the folder containing `manifest.json`, not the ZIP file.
5. Pin **Better SOLAR** from the browser's Extensions menu.
6. Open [SOLAR](https://solar.feualabang.edu.ph/user/profile) and sign in normally. Better SOLAR never requests or stores your SOLAR password.
7. Open the extension and select **Scrape Data**. Leave the browser open while it works. The popup can be closed: progress and the job are retained locally.
8. Select **Launch Application** to open the dashboard in a new window.

Use Chrome or Edge 120 or newer. Firefox and Safari are not packaged targets. This is a developer-mode extension, not a signed store release. Keep the extracted extension folder in place.

## Collect and refresh records

The collector reads these seven SOLAR areas:

- **User Profile**: student information and the live enrollment-status heading; excludes Grades Viewing.
- **Account Balance Summary**: term/year-specific statements, every payment row and balance/overpayment classification.
- **Course Offerings**: all dynamically discovered years and supported terms, with source column values preserved.
- **Curriculum**: all year/term groups, co-requisites and prerequisites.
- **Assessment**: every available SAF term, all registration fields, enrolled courses and variable assessment/payment-option labels.
- **Grades**: every available grades term; unavailable finals remain blank in storage.
- **Enrollment Reminders**: only the visible OSES term-specific Alabang PNG on the live reminders page; it is downloaded within the signed-in SOLAR tab and saved locally for offline viewing.

The collector uses a separate inactive SOLAR tab and normal form submissions, including SOLAR's own CSRF/session handling. Your existing tab and selections stay untouched. The collector tab closes when the run finishes. Do not navigate or close that tab while collection is running.

The job discovers dropdown options from the live page. It sets school year before term to handle dependent options. It waits for a new document or a settled result-table mutation and checks the returned selection before storing the response. It rejects an unverified response instead of assigning stale results to a different term.

Balance history is discovered from live balance links and its own selectors. If the portal exposes neither, the collector probes term/year pairs actually found in the student's SAF/grade history. Failed or unavailable probes are reported. It cannot discover balance history the portal never exposes; it does not invent historical terms.

Progress is visible in the popup and app. **Retry failed work** retries failures while preserving successful records, and verifies the profile identity again. Refresh errors retain the last successful payload with an explicit warning. Repeating collection updates stable keys rather than duplicating records.

Large course-offering histories can take several minutes. Browser alarms resume pending work after a service-worker suspension. A closed browser resumes the job when it starts again, provided the SOLAR session is still valid.

## Use the application

The dashboard contains the monthly Canvas calendar on the left and an equally wide weekly timetable on the right when the window supports two columns. The timetable uses the current enrollment term's SAF, or the most recent collected SAF when the current term has no cached SAF.

The shared navigation provides Dashboard; Academics (User Profile, Curriculum, Balance Summary, Schedule and Assessment, and Grades); Enrollment (Courses Offered, Course Registration, COR Revision and Enrollment Reminders); Settings; and Exit. Canvas is inside the dashboard calendar. It minimizes as the page scrolls. On small screens, use the hamburger menu. The shared footer is below the initial viewport, including on short pages.

Balance Summary, SAF, Grades, and Courses Offered require an explicit **Term + School Year + Submit** action before term-specific details appear. Choices come from collected records and reported failed attempts, without fixed academic years. The SAF heading and navigation both use **Schedule and Assessment**, with **BETTER SOLAR** above the page heading.

Light is the default when no explicit preference is saved. Open the Settings gear for Light/Dark appearance, external website confirmation, the collection report and Delete all scraped data. Appearance persists across the popup and every application window. On mobile, Settings is inside the side menu. All academic data stays in IndexedDB on this device; theme/progress use extension-local storage. Each verified student identity has a separate local record scope to prevent records from different SOLAR accounts from mixing.

## Canvas calendar

1. In [Canvas](https://feu.instructure.com), select **Calendar**.
2. At the bottom-right, select **Calendar Feed** and copy the private `.ics` URL.
3. On the dashboard, choose **Connect to Canvas**, paste the URL and connect.
4. Grant access to that Canvas instance if Chrome asks. The feed is fetched directly from the entered HTTPS origin, without a proxy or external calendar service.

The URL and calendar content persist locally. Reopen **Canvas connected** and select **Refresh Calendar** to refresh it. When offline or a refresh fails, the previous feed remains available. The calendar shows its cache date. Refresh is manual; it does not run a recurring network task.

The parser supports folded/escaped content, UTC, floating and IANA-zone dates, all-day and multi-day activities, daily/weekly/monthly/yearly recurrence, common BYDAY/BYMONTHDAY/BYMONTH/BYSETPOS rules, COUNT/UNTIL/INTERVAL, exclusions, additions and occurrence overrides/cancellations. Unsupported recurrence fields or custom non-IANA timezones produce a visible warning. Embedded arbitrary VTIMEZONE definitions and hourly/minutely recurrence are not implemented. These limits do not normally affect Canvas assignment calendar feeds, but must be checked against the real feed.

The feed is a private link; avoid sharing it. The extension never includes it in logs or analytics. Only normal HTTPS Canvas `/feeds/calendars/... .ics` paths are accepted, including webcal links converted to HTTPS. Cross-origin redirects are rejected.

## Course schedule creator

Open **Courses Offered**, submit a term/year, then choose **Open Schedule Creator**.

- Combine course search, searchable section choices and any number of day toggles. A course must have meetings on every selected day (AND logic).
- **Add an Individual Course** opens the complete selected-term list with its own filters. Select multiple courses, then **Add Courses**. Changing filters retains the course selections. All selected day buttons must match (AND logic).
- Zero-slot or unknown-slot courses stay selectable and highlighted in red. Adding them shows a warning; confirmation adds red blocks to the visualizer. Back keeps the selection without adding it.
- **Add a Block Section** checks every course in the block before adding the whole block.
- Overlapping meeting times are allowed, including overlaps against courses already in the visualizer and within a newly selected block. The shared timetable places them in separate side-by-side lanes. Exact duplicate selections and invalid meeting pairing still reject the selection atomically.
- Click a course block to open Course actions. Remove course deletes every meeting of that selected course; Remove all courses clears the weekly visualizer. Cancel changes nothing. Keyboard users can focus a block and press Enter or Space. No separate course list is displayed beneath the timetable.
- Closing/reopening the visualizer retains its state. The draft uses that application window's session storage while the course page is open. Leaving/reloading the page or choosing a different offered term clears the draft; returning requires selecting term/year again.

Course-offering tables do not provide course titles. The visualizer looks titles up from the cached curriculum where possible; otherwise it displays the source course code. It never invents a title. It does not enroll you in courses or send a registration request.

## Offline and demonstration mode

After successful collection, reopen the extension application even without an internet connection. Extension HTML, CSS, scripts, icons, academic data and the saved Canvas feed are local. Montserrat is available offline after its initial download or after bundling the font files. SOLAR collection and Canvas refresh require a connection. Scraped records and feeds remain snapshots until you refresh them.

With an empty database, **Explore demo** loads explicitly labeled synthetic records in memory. Demo data is never written to the academic database and real collection/Canvas connection is disabled until you leave demo. The sample calendar intentionally uses November 2026. Refreshing the page leaves demonstration mode.

Uninstalling the extension or clearing extension storage removes cached records. Data is not synchronized between devices or profiles. On a shared computer, anyone with access to the browser profile can view cached records; use a personal browser profile.

## Build and verify from source

Production JavaScript runtime dependencies: **none**. Montserrat font assets are fetched and cached once unless bundled with `npm run fonts`. The source uses native browser modules and IndexedDB. This avoids a backend, remote JavaScript and a bundler dependency. A public font CDN is used only for the initial Montserrat asset download unless fonts were bundled. Node.js 20+ runs the build and tests; Python 3 is used only by fixture tests and the optional preview server.

```sh
cd better-solar
npm run check
npm test
npm run build
```

`check` performs JavaScript syntax and manifest checks. There is no TypeScript compiler or separate ESLint configuration. `build` copies the production files into `dist/`. Reload the extension after rebuilding.

Optional HTTP preview for layout/development:

```sh
npm run preview
# Open http://localhost:4173/app.html and choose Explore demo.
```

The HTTP preview cannot use your SOLAR session or act as the installed extension. Its IndexedDB and theme are isolated from extension storage. HTTP preview pages are not installed as an offline web app; offline launch is provided by the extension package.

Optional browser acceptance suite on a machine that can launch Chromium:

```sh
npm install --no-save playwright
npx playwright install chromium
node scripts/browser-tests.mjs
```

Set `CHROMIUM_PATH` to a system Chromium executable if needed. The suite uses synthetic fixtures only. It includes desktop/mobile interaction checks and screenshots for local review. It was supplied but could not be executed in this workspace because Chromium socket creation is prohibited.

## Delete cached academic data before removing the extension

Open **Settings → Delete all scraped data → Delete data**. The confirmation clears every local student account's academic records, the saved Canvas URL/feed, collection history and schedule drafts. Active collection is stopped first, and open application windows clear their displayed records. Wait for the success message before removing the extension from Chrome/Edge.

This action affects the browser's Better SOLAR cache. Your SOLAR/Canvas accounts and repository source files are unchanged. The appearance preference and public font cache remain until the extension itself is removed. Installation or Reload does not trigger deletion.

Term/year selectors reset when navigating to another Better SOLAR page. You must select and submit again when returning. Calendar cards display only two lines and open a full-detail dialog with a prominent Canvas link. All requested motion respects the system's reduced-motion preference.

## Source map

| Path | Purpose |
| --- | --- |
| `manifest.json`, `popup.html`, `app.html` | Extension permissions, popup and application entrypoints |
| `src/background.js` | Durable collector queue, authenticated tab control, discovery, submission and retry |
| `scraper/dom.js` | Reusable semantic DOM extraction and verified-response predicate |
| `src/db.js` | IndexedDB schema, account scoping, upserts and error retention |
| `src/app.js` | Seven routes and page interactions |
| `src/ui.js`, `src/schedule-layout.js`, `src/calendar-layout.js` | Shared navigation, footer, wrapped/contained course tables, dialogs, selectors and adaptive timetable |
| `src/core.js` | Formatting, schedule pairing/filtering/conflict detection, fixed grading values |
| `src/theme.js`, `src/styles.css`, `src/navigation.js` | Shared theme, stable header state and responsive design system |
| `src/canvas.js`, `src/ics.js` | Direct private-feed connection, cache and calendar expansion |
| `src/demo.js` | Clearly separated, opt-in synthetic fixtures |
| `src/settings.js`, `src/data-reset.js` | Shared settings and cross-window local-data deletion |
| `src/fonts.js`, `src/font-assets.js` | Montserrat loading, caching and optional bundled-asset selection |
| `src/view-state.js` | Reset-on-leave term-selection rules |
| `assets/logo.jpg`, `assets/icon128.png` | Original Better SOLAR project mark |
| `tests/` | Parsing, collection, persistence, presentation and calendar regression tests |
| `scripts/` | Build, syntax/manifest check and optional browser acceptance suite |
| `docs/` | Original requirements, database schema and verification report |

No separate `logo.jpg` was attached. The included original project logo satisfies the filename requirement; it is not an official FEU seal. Replace `assets/logo.jpg` with an authorized logo and rebuild if required.

## Known limitations and authenticated acceptance

The selectors and field mappings implement the supplied inspected structures. No authenticated SOLAR browser session was available here. Actual SOLAR redirects, dependent dropdown behavior, normal form/AJAX submission timing, fee markup, balance history discovery, session expiry and all real terms must be validated after installation. Changed markup intentionally causes a reported failure instead of guessed data.

The real Canvas feed and its requested host permission must also be tested. Browser rendering, touch/keyboard interactions, popup launch/Exit, cross-window theme propagation, worker suspension/restart and native IndexedDB offline reopening remain acceptance checks on the installed extension. See the checklist in `docs/VERIFICATION.md`.
