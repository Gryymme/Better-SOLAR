# Better SOLAR 1.0.4

| Requested change | Implementation |
| --- | --- |
| Section filter label | Scoped the Course filter's flex rules to direct labels and prevented nested Section labels from stretching. |
| Collapsed scraper feedback | Only “Collecting SOLAR Data” and a progress track appear. Expanded details show current dataset, term/year and steps in small text below the bar. Retry stays in expanded details. Application and extension popup share this behavior. |
| Smooth loading bar | The bar transitions from its currently displayed width across status refreshes. A moving highlight indicates ongoing collection, including while a step is waiting. |
| Directional popups | Shared dialogs derive their translation and initial scale from the invoking button's viewport position. Keyboard activation uses the same focused control. |
| Consistent navigation hover | Header links, dropdown triggers, Settings, Menu and Exit share the same lift/transition; brand and logo remain stationary. Exit retains its red hover state. |
| Half-row scroll cue | Bounded course tables measure actual row heights and finish halfway through a following row. This recalculates after filtering, resizing, font loading and dialog validation changes. All rows remain reachable. Tables whose rows all fit remain complete. |
| Weekly block typography | Code and title use bold weight 700. Time and room share a smaller size; times fit one line and omit leading hour zeros, for example `7:00 AM–8:50 AM`. |
| SAF Credits width | Increased the dedicated column from 6% to 12% and kept its heading on one line. |
| Profile menu animation | The navigation dropdown fades/slides in when shown by hover, focus or its trigger. |
| Sidebar animation/placement | A single Menu control is before the logo at compact widths. The sidebar slides in and out, including before navigation to another page. Shade/Escape closing and focus restoration remain. |
| Phone cards and calendar | Page cards fill the viewport width with square corners. Calendar padding and event text are smaller to leave more space for two-line event titles. |
| Phone tables | Non-offering tables use fixed widths, smaller text and wrapping without horizontal scrolling. The wider course-offerings table remains horizontally scrollable on phones. |
| Phone timetable | Smaller bold text uses measured wrapping with at most 15 characters per line. Time text shrinks to fit its column; room text matches it. Original course data and accessible descriptions remain intact. |

Motion respects the browser's reduced-motion preference. No scraping logic, academic records, database schema or account data were changed by this UI release.

Validation: syntax/manifest checks, automated regressions and production build. See `VERIFICATION.md` and `qa/` for exact results and remaining native-browser acceptance. Native visual review and authenticated SOLAR/Canvas collection were unavailable in this workspace.
