# Better SOLAR 1.0.7

| Request | Result |
| --- | --- |
| Course actions and hover | The course-block dialog offers Remove course, Remove all courses and Cancel. Clearing all courses affects only the current visualizer. The redundant course list is removed. Clickable blocks lift and change background on hover, including full courses shown in red. |
| Whole-word wrapping | Removed character-breaking CSS throughout the project. Remaining Slots receives 14% of the main offerings table and 13% of the individual-course table. Calendar ellipsis fitting retains complete words when possible. Existing ellipsis for overlong single tokens remains. |
| External websites | App and extension-popup website links require Proceed/Cancel confirmation by default. The destination is shown with a Do not ask again checkbox. Settings can restore confirmation. The non-private preference persists across windows/restarts and academic-data deletion. Both normal and middle clicks use the same guard. |
| External arrows | Course Registration and COR Revision include a northeast arrow icon. |
| Theme animation | Color changes animate for 280 ms on user changes and changes from another window. Initial launch stays immediate. Rapid reversals restart cleanup safely; reduced motion disables transitions. |
| Neutral dark mode | Neutral pages, cards, text, borders, menus, dialogs and scrollbars use black/gray shades. Active header surfaces and the dialog backdrop are corrected. Intentionally green/red/amber elements keep their corresponding accent colors. |
| OSES reminders image only | Collection reads the visible `img` whose source matches `/images/OSES_<term>T<year-pair>_ALAB.png`, without hardcoding one term. Only the first displayed matching image is fetched. Generic images, site chrome, hidden history, other origins and download anchors are ignored. Older unrelated cached images are hidden. |

No real external website is opened by the automated unit tests. Tests use explicit callbacks and API doubles. Source package contents contain no scraped student records or reminders image; actual collected images remain in the browser database.

See `VERIFICATION.md` and `qa/` for exact checks and remaining browser/authenticated-portal acceptance.
