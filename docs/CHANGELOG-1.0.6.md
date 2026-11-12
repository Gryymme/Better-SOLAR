# Better SOLAR 1.0.6

| Requested change | Implementation |
| --- | --- |
| Correct assessment heading | Schedule and Assessment replaces the incorrect Account Balance Summary title. Its eyebrow is BETTER SOLAR, matching the other Academics pages. |
| Centered popup motion | Dialogs fade and grow from the center. Closing reverses the fade/scale, with no trajectory toward the clicked control. Reduced motion is respected. |
| Collapsed Settings report | Each opening starts collapsed. Expanding it is preserved through progress refreshes while that Settings dialog remains open. |
| Enrollment grouping and logo | Courses Offered is inside Enrollment on desktop and in the sidebar. Its route activates the Enrollment parent. The expanded header logo is 56 px, or 44 px on mobile; minimized sizes remain compact. |
| Page alignment | Desktop page gutters increase to 48 px. Navigation and footer use the same content width and gutters. Tablet/phone gutters adjust to 24/12 px. |
| Navigation padding and Settings | Header controls have more horizontal padding. Settings uses a compact icon width, with its height still matching Exit in both expanded and minimized headers. |
| Canvas order and label | Connect to Canvas/Canvas connected appears first, followed by Open Canvas. |
| Calendar controls | Previous, Today and Next have no borders, equal 42 px targets and flat hover highlights. Month arrows use larger SVG icons. Keyboard focus remains visible. |
| Course removal | Visualizer course blocks are clickable and support Enter/Space. A Remove course/Cancel dialog identifies the selected course. Confirmation removes all its meetings. Separate X buttons are removed. The list Remove action uses the same confirmation. |
| Mobile timetable | Code and title share one measured font size. Text wraps at word boundaries within 16 characters, with a one-line ellipsis for a single overlong word. Hour markers simplify to 7 AM, while course meeting times retain their minutes. Mobile block heights fit content and padding; time-based start positions remain. |

The source record values, course identifiers, conflict checks and no-slot warnings remain intact. Actual course descriptions are preserved in accessible labels and confirmation text. See `VERIFICATION.md` for automated checks and outstanding installed-browser visual acceptance.
