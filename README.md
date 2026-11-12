# Better SOLAR

## Description / What it's about

**Version 2.0.0** — a local-first companion for FEU Alabang SOLAR. It collects records through your signed-in SOLAR session and presents them in a responsive application that remains useful offline. It never requests your SOLAR password or sends academic records to a server of its own.

The project provides a desktop Manifest V3 extension and a mobile compatibility Manifest V2 extension. Both share the application, Montserrat typography, green design, animations and local database. Mobile browser API support varies; see the installation and compatibility notes below.

## Features

- **Seven cached datasets:** User Profile, Curriculum, Course Offerings, Schedule and Assessment, Grades, Account Balance Summary and Enrollment Reminders. Terms and school years come from the portal, rather than a fixed list.
- **Verified updates:** Scrape Data becomes **Update SOLAR Data** once academic data is cached. Complete datasets are compared with the cache; unchanged payloads are retained, while confirmed changes can update rooms/times and remove dissolved courses. Failed or incomplete collection preserves the previous successful data.
- **Full-table checks:** supported in-document pagination is traversed, declared row totals must agree, and multiple relevant tables are scanned. Required headings/rows, stable reads and loading/filter/error checks protect existing records. Unknown pagination and unconfirmed empty tables fail safely.
- **Interactive weekly schedules:** paired meetings, overlapping courses in adjacent lanes, consistent typography, and complete course-information dialogs. Mobile shows three days at a time with pinned hours, MON–SAT labels, directional arrows, a current-day pill and a reduced-motion-aware swipe cue.
- **Schedule creator:** course/section search, bounded searchable section menus, AND day filters, individual/block additions, no-slot warnings and red full-course blocks. Click a block to remove the selected course or all visualized courses. The creator plans a schedule; it does not register courses.
- **Canvas calendar:** connect a private Calendar Feed URL, read monthly events and full descriptions, and open activities in Canvas. Two-line event previews, manual feed refresh and offline calendar caching are retained.
- **Responsive design:** equal-width desktop panels, contained table/dialog scrolling, word wrapping, a sliding mobile sidebar, light/dark transitions, page/dialog animations and Montserrat. Term/year selections reset when leaving their page.
- **Settings and privacy:** external-link confirmation with a remembered opt-out, a collapsed collection report, report dismissal and deletion of local academic data. The default theme is light.
- **Enrollment:** Courses Offered, Course Registration, COR Revision and the cached term-specific OSES Enrollment Reminders PNG. External links ask for confirmation unless disabled in Settings.

## How to install / use

### Choose a package

Extract the outer `Better_SOLAR.zip` first. Inside `better-solar`:

| Target | Ready-built folder | File-install archive |
| --- | --- | --- |
| Desktop Chrome / Edge | `dist/` | `packages/Better_SOLAR-Chromium.zip` |
| Orion iOS/iPadOS and legacy mobile extension hosts | `dist-mobile/` | `packages/Better_SOLAR-Mobile.zip` |

The installation archives have `manifest.json` at their root. **Do not import the outer source ZIP into a mobile extension installer.** No build is needed to use the supplied packages.

### Desktop Chrome / Edge

1. Keep the extracted folder in a permanent location.
2. Open `chrome://extensions` or `edge://extensions`, enable Developer mode and choose Load unpacked.
3. Select `better-solar/dist`, then pin Better SOLAR from the extension menu.
4. Sign in to [SOLAR](https://solar.feualabang.edu.ph/user/profile) in the same browser profile.
5. Open Better SOLAR, choose Scrape Data and leave the browser open during collection. Choose Launch Application for the dashboard.

Chrome/Edge 120+ is the desktop target. This is a developer-mode package, not a signed/published store release.

### Orion on iPhone / iPad

1. Extract the outer delivery ZIP in Files and locate `packages/Better_SOLAR-Mobile.zip`.
2. In Orion's three-dot menu → Settings, enable third-party Chrome/Firefox extensions if required by your version.
3. Open Extensions, tap **+**, choose file-based installation and select **Better_SOLAR-Mobile.zip**. Enable the extension and allow the SOLAR/Canvas access it needs.
4. Sign in to SOLAR **in Orion**, open Better SOLAR from Extensions and choose Scrape Data. Launch Application opens the full interface in a tab.
5. Keep Orion foregrounded during collection. The collector tab may become active so iOS can load the portal. Do not close or navigate it. Return to Better SOLAR to view progress or resume its saved queue after suspension.

Orion documents file installation, but iOS extension support is preliminary and API-limited. The mobile package includes a background page and legacy injection/message transport; **it has not been tested on an actual Orion device, and full functionality is not guaranteed**. Unsupported collection APIs report a failure and preserve cached records. See [Mobile compatibility](docs/MOBILE-COMPATIBILITY.md).

### Kiwi / extension-capable Android browsers

1. On an existing Kiwi installation, open its Extensions manager (`kiwi://extensions` where available) and enable Developer mode.
2. Use that version's ZIP/file import control, if provided, to select `packages/Better_SOLAR-Mobile.zip`. For folder-based loading, extract that archive and select its root manifest folder instead.
3. Enable Better SOLAR, sign in to SOLAR in the same browser and open the extension. Keep the browser foregrounded while collecting; the full app opens in a tab.

Kiwi's maintainers archived the project and stopped maintenance after January 2025. It is a legacy compatibility target, not a maintained-browser recommendation. Other Android browsers must support local installation and the APIs in the compatibility guide. Standard mobile Chrome and Safari do not load these packages through their normal interfaces. No iOS/Android installation is claimed as device-tested.

### Update an existing installation

Copy the new `dist` contents into the **same installed desktop folder path**, then Reload the existing extension and reopen the application. Preserve its extension identity: uninstalling or loading a different folder can create a different database. Do not delete scraped data as an update step.

On mobile, use the browser's existing-extension update/reload/import workflow if offered. Importing another copy can create a separate extension. Caches do not transfer between browsers or devices.

### Collect and update SOLAR records

1. Sign in to SOLAR in the same browser profile.
2. Choose **Scrape Data** initially, or **Update SOLAR Data** after data exists. The label updates in both the app and popup.
3. Expand the collection card for category, term/year, step count and failures. Collapsed collection shows Collecting SOLAR Data and an animated progress bar.
4. Let the collector finish without altering its SOLAR tab. Desktop normally uses an inactive tab; mobile may need it active. Large histories can take several minutes.
5. Use **Retry failed work** in the expanded report to retry failures without discarding successful terms.

The collector discovers live selector options, sets school year before dependent term choices and verifies normal form responses. It uses SOLAR's existing session and form handling. Balance history is discovered from live links/selectors, with enrollment-history probes where needed; unavailable probes are reported.

Updates compare complete category/term/year payloads. Unchanged data keeps its payload and change timestamp; its successful verification time advances. A fully scanned changed table can remove dissolved courses or change their meetings. Missing pages, malformed rows, filters, loading/errors, mismatched totals and unsupported pagination cannot erase an earlier successful payload. Unreached terms remain cached. A confirmed table-level zero result can replace a nonempty table; a missing table cannot.

Supported next-page controls are followed for in-document pagination. Unknown or server-navigation pagination is treated conservatively. Completeness checks verify the returned page/table, not the contents of SOLAR's backend. Suspended mobile collection resumes when the host permits it or an extension view returns to the foreground; the extension cannot prevent OS suspension.

### Application and schedule creator

Dashboard shows the calendar and current enrollment term's SAF schedule, falling back to the latest collected SAF. Academics groups User Profile, Curriculum, Balance Summary, Schedule and Assessment, and Grades. Term pages require Term + School Year + Submit; leaving resets the selection. Enrollment contains Courses Offered, Course Registration, COR Revision and Enrollment Reminders.

Mobile schedules start on Mon–Wed on Sunday through Wednesday, or Thu–Sat on Thursday through Saturday. Swipe or use the header arrows; hour labels remain fixed. Keyboard users can focus the day area and use arrow keys, Home or End. Any block opens its full code, title, section, credits, selected meeting time and room. Smaller labels sit to the left of bold, left-aligned values in a compact dialog.

For planning, open Courses Offered, submit a term/year and choose Open Schedule Creator. Individual/block additions allow overlapping meetings; exact duplicates and invalid meeting pairing are rejected. No-slot courses require a warning confirmation and appear red. Click a visualized block for Remove selected course or Remove all courses. Closing/reopening the creator retains its window draft; leaving/reloading the page or changing the offered term clears it. Offering titles and omitted credits can be supplemented from the collected curriculum; unknown values remain unavailable.

Open Settings from the gear or mobile sidebar for theme, external-link confirmation, the collection report and local-data deletion. A dismissed report remains there. Your appearance and confirmation choice persist across app windows.

### Connect Canvas

1. In [Canvas](https://feu.instructure.com), open Calendar → Calendar Feed and copy the private `.ics` URL.
2. Choose Connect to Canvas on the dashboard, paste the URL and allow access to that instance if asked.
3. Use Canvas connected → Refresh Calendar for manual refresh. A failed refresh preserves the previous feed.

Feeds are fetched directly over HTTPS, without a proxy. Treat the feed URL as private; do not share or commit it. Only Canvas `/feeds/calendars/... .ics` paths are accepted, including converted webcal URLs; redirects to another origin are rejected. Common recurrences, exclusions, overrides and time zones are supported. Arbitrary embedded VTIMEZONE definitions and hourly/minutely recurrence remain unsupported and produce explicit warnings.

### Build from source

Node.js 20+ and Python 3 are needed for checks/packaging, not for ready-built installation:

```sh
npm run check
npm test
npm run build
python3 scripts/package.py
```

The build recreates both extension folders. Packaging creates the two root-manifest installation ZIPs. To bundle Montserrat for an offline first launch, run `npm run fonts` before building; otherwise the first online launch caches pinned public font files. See [font setup](assets/fonts/README.md).

## Changelogs previews

| Version | Preview |
| --- | --- |
| [2.0.0](docs/CHANGELOG-2.0.0.md) | Verified differential updates, full-table safeguards, mobile package/API adapter, compact course dialogs and simplified mobile headers. |
| [1.1.0](docs/CHANGELOG-1.1.0.md) | Three-day mobile swiping, pinned hours, day-aware defaults and checkbox/detail formatting. |
| [1.0.9](docs/CHANGELOG-1.0.9.md) | Consistent timetable fonts and full course details. |
| [1.0.8](docs/CHANGELOG-1.0.8.md) | Overlapping course lanes and confirmation footer. |
| [1.0.7](docs/CHANGELOG-1.0.7.md) | Course actions, external-link consent and neutral dark surfaces. |
| [1.0.6](docs/CHANGELOG-1.0.6.md) | SAF title, Enrollment navigation and centered dialog motion. |
| [1.0.5](docs/CHANGELOG-1.0.5.md) | No-slot warnings, reminders, report dismissal and mobile navigation. |
| [1.0.4](docs/CHANGELOG-1.0.4.md) | Collection progress, navigation/table motion and responsive refinements. |
| [1.0.3](docs/CHANGELOG-1.0.3.md) | Bounded section menus, equal panels and compact type. |
| [1.0.2](docs/CHANGELOG-1.0.2.md) | Montserrat, Settings/deletion, selector reset, AND filters and animations. |
| [1.0.1](docs/CHANGELOG-1.0.1.md) | Nested SAF fees, student mapping, light default and stable navigation. |

## Other information

### Where scraped data is stored

Records, collector tasks, the private Canvas feed and reminders PNG are stored in **IndexedDB (`better-solar-local`) inside the installed extension's browser profile**, not this project folder. Theme, progress and confirmation preferences use extension-local storage; drafts use window session storage; public fonts use Cache Storage or bundled files. Uploading the supplied source/build folders does not upload your browser's records. Avoid adding browser-profile exports or personal test captures to the repository.

Before uninstalling, use Settings → Delete all scraped data, confirm and wait for completion. This stops/drains collection, clears every local student scope and private feed/job metadata, and resets open app views. Theme/confirmation preferences are retained until extension removal. SOLAR/Canvas accounts are unchanged. No scraped personal records are included in this archive.

### Compatibility and verification

The mobile package uses a Manifest V2 background page, legacy tab injection/private messaging and callback/Promise API normalization. Desktop retains Manifest V3 and modern scripting. Mobile launches in a tab and can resume/poll its saved collection queue from a visible extension view. OS suspension cannot be prevented.

Collection requires runtime messaging, local storage, tabs create/get/update/remove, and either modern scripting or legacy tab injection plus tab messaging. IndexedDB and modern DOM support are needed for the UI/cache. Alarms and windows have practical fallbacks. Installation cannot supply APIs that a browser does not implement.

Automated fixtures cover extraction, table traversal, updates/cache preservation, API adapters, queue/retry/deletion and existing app behavior. They do not establish native installation, live signed-in SOLAR compatibility or pixel-level layout. Chromium could not launch in this environment; no Orion/Kiwi device was available. See [Verification](docs/VERIFICATION.md) and [Mobile compatibility](docs/MOBILE-COMPATIBILITY.md).

### Project structure

| Location | Purpose |
| --- | --- |
| `src/` | Shared UI, database, collector, platform adapter and calendar/schedule logic |
| `scraper/` | SOLAR extraction/full scans and legacy message bridge |
| `manifest.json` / `background.html` | Desktop manifest / mobile background entry |
| `dist/` / `dist-mobile/` | Ready-built extensions |
| `packages/` | Browser-installation ZIPs |
| `scripts/` / `tests/` | Build/packaging/checks and synthetic regression fixtures |
| `qa/` / `docs/` | Check outputs, limits and changelogs |
| `assets/` | Logo, icon and font license/setup |

Production JavaScript has no runtime package dependencies or remote scripts. Public fonts are downloaded once only when not bundled; no academic records are sent with font requests. There is no cloud synchronization, backend or recurring network automation.

### Platform references

- [Orion iOS/iPadOS installation and limitations](https://help.kagi.com/orion/browser-extensions/ios-ipados-extensions.html)
- [Orion API information](https://help.kagi.com/orion/misc/technical.html)
- [Kiwi archive and maintenance status](https://github.com/kiwibrowser/src.next/blob/kiwi/README.md)
- [WebExtension background page/worker support](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background)

Copyright 2026 © Gryymme (Elijah Miranda Nonan).
