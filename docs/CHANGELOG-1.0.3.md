# Better SOLAR 1.0.3

| Requested change | Implementation |
| --- | --- |
| Retry only when cache feedback is expanded | The Retry failed work button is now inside the details content. Collapsing the card hides it automatically, including from keyboard navigation. It appears only when failures exist. |
| Equal space beside the weekly schedule | Dashboard, SAF and the course visualizer use two equal columns when displayed side by side. Existing narrow-screen stacking remains. |
| Smaller calendar event text | Event titles use 11 px text, or 10.5 px on narrow screens. The two-line limit, measured `...` fitting and complete detail dialog remain. |
| Smaller tables beside a schedule | SAF and course-visualizer tables use 12.5 px text, compact cell padding and closer meeting-entry spacing while the panels are side by side. Full-width tables retain their regular size. |
| Popup-opening animation | Shared dialogs open with a short fade/slide/scale transition and a fading backdrop. The extension popup content also animates when opened. Reduced-motion preferences disable these animations. |
| Limit dropdown entries | Section choices in the main course filters, individual picker and block-section dialog use a bounded searchable combobox instead of a browser-sized native list. A maximum of six rows is visible; all remaining sections are accessible by scrolling or searching. Menus fit the viewport and open above the control when appropriate. The native browser popover layer keeps them visible inside clipped/rounded dialogs. |
| Consistent grades spacing | Grade-result and grading-system cards are grouped with the same 24 px gap used between other panels. The unselected-term placeholder also gets that spacing. |

The section dropdown supports Arrow Up/Down, Home/End, Enter, Tab and Escape. An invalid unfinished search restores the last selected section. Clearing the input resets the section filter. Escape first closes an open section menu without closing its containing dialog. Closing a dialog or leaving a page disposes its dropdowns.

## Updating

Replace the files in the same installed `dist` directory, click Reload on the existing Chrome/Edge extension card, and reopen the app. This UI update preserves academic records, Canvas data, settings and font cache. No new scrape is required for these changes.

## Verification

Automated regression coverage includes collapsed retry placement, complete section matching/search ordering, six-row geometry, viewport fitting, keyboard selection, clear/reset behavior and safe disposal. The existing parser, data-deletion and scheduling tests remain in the release suite. Exact results are in `qa/test-results.txt`.

The optional native browser suite was extended for section-menu size/search, modal keyboard behavior, equal-width panels, calendar type size, grades spacing, retry visibility and dialog animation. It remains unexecuted here because Chromium launch is blocked by the workspace. Real browser visual review and authenticated SOLAR/Canvas validation are not claimed.

Montserrat continues using the 1.0.2 font setup: first-online-load caching or optional bundling with `npm run fonts` and `npm run build`.
