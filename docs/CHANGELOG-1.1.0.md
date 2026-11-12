# Better SOLAR 1.1.0

| Request | Implementation |
| --- | --- |
| Course values and labels | Values are bold, larger and left aligned in the left column. Labels are smaller, regular weight and positioned on the right. The header subtitle reads “Displaying details for the selected course.” |
| Three-day mobile timetable | The six-day track is twice the mobile viewport width. Three day columns are visible at a time, with native horizontal swiping and snap positions at Monday and Thursday. The time rail remains outside the scrolling day viewport. |
| Day-aware initial view | Sunday–Wednesday starts on Monday–Wednesday. Thursday–Saturday starts on Thursday–Saturday. Explicit user choices survive resizing and same-view rerenders. |
| Swipe cue | A small 650 ms horizontal nudge runs on first visibility and returns to the selected half. It cancels on interaction, does not repeat on status rerenders, and is disabled for reduced motion. Arrow keys, Home and End provide keyboard paging. |
| Full mobile course content | Code, title, time and room use regular schedule typography. Shared-time mobile blocks also show their title. Timeline positions, side-by-side overlaps and regular duration heights are retained. |
| External confirmation checkbox | One checkbox aligns with the vertical center of its title/help group. Help text starts beneath the title, and the action buttons remain beside the group. |
| Settings checkbox | The same compound control removes the narrow label width restriction, aligns both text lines, and centers the checkbox against the whole group. Appearance's theme selector retains its own compact width. |

Original cached data, course identities, full information dialogs, removal actions, no-slot warnings, external consent and deletion protections are retained. See `VERIFICATION.md` and `qa/` for exact checks and the limits of native-browser verification.
