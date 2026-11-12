# Better SOLAR 1.0.2

## Requested changes

| Comment | Implementation |
| --- | --- |
| 1–2. Montserrat and appropriate sizes | Montserrat throughout the popup/application with a new 15.5 px body scale, 15 px field values, 14 px dense tables, 20 px section headings and 28–36 px page titles. Font weights 400/500/600/700 are loaded and cached locally. |
| 3. Collapsed cache information | Details are initially closed, including after errors and when entering another page. A user's explicit expanded/collapsed choice is preserved during updates within that page. |
| 4. Reset term/year when leaving | Navigation clears the previous page's term/year selection. Returning to Balance, SAF, Grades or Courses Offered requires a new selection and Submit. Course-page drafts are cleared on leaving/reloading that page to avoid retaining the previous term context. |
| 5. Uniform curriculum columns | All groups use the same five percentage widths: 14/40/8/19/19. |
| 6. Dialog scrollbar containment | Rounded dialogs clip a shared shell. Header/footer remain outside a separate, inset scrolling body, keeping scrollbars inside the card. The course picker retains its table-only scrolling. |
| 7. Settings icon and deletion | A settings gear replaces direct theme buttons in the popup, desktop navigation and mobile menu. Settings contains Light/Dark and a confirmed Delete all scraped data action. |
| 8. Grades empty/error card | A rounded result card remains present for failed and empty terms, with its message and refresh status inside it. The grading-system card remains separate. |
| 9. Footer arrangement | Copyright is centered horizontally between the brand and social icons. Narrow layouts stack them in that same order. |
| 10–11. Unavailable rows and selection header | Zero-slot rows retain red highlighting and disabled checkboxes without a visible Unavailable label. The first checkbox heading is visually blank, with an accessible column name. |
| 12. AND day filters | Every selected day must occur in a course's meeting-day set. Applies to the main course list and individual-course picker. |
| 13. 7:00 AM spacing | A shared 20 px inset moves the first time line, its label and all course occurrences below the day-header border. |
| 14. SAF course wrapping | The enrolled-course table uses fixed conservative column widths and wrapping cells. Day/time/room values separated by `/` display on separate lines. |
| 16. Exit hover | Exit uses a red hover background and white text. |
| 17. Calendar title/details | Cards show at most two measured lines. Overflow uses a literal `...`; the full title/details remain available when clicked. A prominent green Open in Canvas link sits beside Close in the fixed dialog footer. |
| 18. Motion | Slide-up on launch, button hover feedback, page-entry motion, and creator open/close slide transitions. Reduced-motion preferences disable these effects. |

## Deletion behavior

The Delete action is implemented as a feature; building/installing this update does not delete anyone's data. A user must open Settings, request deletion and confirm it.

After confirmation, the worker stops and drains active collection, closes its dedicated SOLAR tab, and clears every account's local records plus private metadata in one IndexedDB transaction. This removes saved Canvas URL/content, collection history and active identity. Collection progress and other non-theme extension storage keys are removed. Open app windows are notified to clear displayed data, selections, drafts and stale record dialogs. A generation guard prevents an already-running Canvas request from writing its private results back after deletion. Late collection alarms cannot restore the old job.

The chosen theme and public font assets are retained. A non-personal generation marker prevents stale writes. Nothing is deleted from SOLAR or Canvas. The success message tells the user that the extension can now be removed through Chrome/Edge.

## Fonts and runtime limitation

The workspace blocks binary font downloads. The delivered extension therefore downloads the pinned Montserrat files on its first online launch and caches them for offline use. Until that download succeeds, the browser uses a fallback and Settings reports the pending font setup. The font requests contain no student information.

For a package that contains the font files before first launch, run `npm run fonts` on an internet-connected machine and then `npm run build`. The matching font license and unmodified bytes are included by that script. See `assets/fonts/README.md`.

## Updating

Copy the new `dist` contents over the same installed extension directory, click Reload on its existing Chrome/Edge extension card, and reopen the application. Keep the directory path unchanged to retain records. Do not use the new Delete setting unless you intend to remove those local records.

## Verification

Automated tests cover AND filtering, route-selection reset, uniform table mappings, empty-grade cards, dialog structure, event-title fitting, footer order, confirmed-deletion backend behavior, in-flight collection cancellation, stale feed-write rejection, cross-window reset notifications, and font caching/offline reuse through explicit API doubles. Exact results are in `qa/test-results.txt`.

The native browser UI, animation timing, actual Montserrat download/rendering, and authenticated SOLAR/Canvas integration still need installed-browser acceptance. Chromium remains blocked by the workspace's socket restrictions. No live scrape or visual acceptance is claimed.
