# Better SOLAR 1.0.5

| Request | Result |
| --- | --- |
| Full courses and block sections | Full/unverified courses remain selectable. Add/Submit shows a dialog naming each affected code and section. Back preserves the selection; Add to visualizer confirms the preview. Affected blocks are red. Duplicate and time-conflict checks remain blocking. |
| Navigation spacing and sizes | More space separates navigation controls. Settings and Exit use equal dimensions, including in the minimized bar. Exit uses a vivid bright-red hover. |
| Popup motion | Opening begins transparent, near full size, with only the last small part of the path from the invoking control. Buttons, Escape and outside clicks animate dialogs closed. Reduced-motion preferences suppress motion. |
| Enrollment | Added after Courses Offered on desktop and in the sidebar. Course Registration and COR Revision open the specified SOLAR destinations. Enrollment Reminders opens a new local page. |
| Reminders PNG | Scrape Data discovers PNG images on the live authenticated reminders page. Downloads use the collector tab's session, validate PNG signatures and enforce size limits. Images are cached per student as a seventh record category for offline display. Refresh failures retain the previous cache; Delete all scraped data removes it. |
| Academics | Renamed the parent User Profile menu. The User Profile page keeps its own name. |
| Canvas and Today | Canvas now sits beside Connect to Canvas/Canvas connected inside the calendar. Today and both month arrows share the same dimensions. |
| Dismissible collection card | Dismiss hides the card across page changes and reopening. Settings retains the collection report and retry action. Starting another collection shows the card again. |
| Settings cleanup and deletion | Removed the font-cache status message. The confirmation button shows an animated spinner and Deleting… while deletion runs. Existing interruption and stale-write protections remain. |
| Compact navigation | The leading menu control is a plain three-line icon with no label or outline. Settings is hidden from the header and remains in the sidebar. |
| Stacked schedule visualizer | Opening scrolls to the schedule panel. Close Schedule Visualizer is above that panel instead of above the offerings table. |
| Mobile cards and type | Restored rounded cards with page-side margins. General text, headings and buttons are smaller. Existing calendar-event and table font sizes remain. Sidebar Settings/Exit buttons are smaller. |
| Mobile timetable | Measured font scaling fits each complete code/title line into 16 characters. Long text wraps in 16-character chunks; shorter codes and final lines stay shorter. All text remains available in accessible labels. |

No registration or COR submission is performed by the extension. The new navigation links open SOLAR. The visualizer remains a local planning tool.

See `VERIFICATION.md` and `qa/` for test results and the limits of native-browser and live-portal verification. Actual reminders images stay in the browser database and are not included in this source package.
