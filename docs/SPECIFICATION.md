# Better SOLAR — Master Build Prompt

You are a senior full-stack engineer, browser-extension engineer, data-extraction specialist, and UI/UX designer. Build the complete project **Better SOLAR**: an authenticated, client-side companion portal that collects the student's academic information from the FEU Alabang SOLAR portal, stores it locally for offline viewing, and presents it in a polished, responsive application.

Treat this document and the supplied reference screenshots as the complete product specification. **Do not omit, simplify away, silently reinterpret, or replace any requirement.** Consolidate implementation where sensible, but preserve every field, page, interaction, condition, data rule, responsive behavior, and exact static grading-system value listed below.

## 1. Execution protocol and non-negotiable requirements

1. First inspect the existing project/repository, available assets, framework, build scripts, and current implementation. Preserve working code and conventions where practical. Do not overwrite or rebuild unrelated work unnecessarily.
2. Then implement the entire project end-to-end. Do not stop at mockups, wireframes, pseudocode, a plan, or a partially functional prototype. All buttons, menus, filters, selectors, popups, theme controls, data flows, and page navigation must work.
3. If the repository is empty, choose a maintainable, appropriate stack and explain the choice briefly. Do not assume a backend is available: the product is client-side and its scraped academic data must be stored locally. Use a browser-extension architecture that can access the user's already-authenticated SOLAR session. Keep secrets and session credentials out of the app's own storage and never ask the user to provide their SOLAR password.
4. Build a reusable scraper, shared navigation component, shared footer component, shared table/design components, reusable weekly schedule component, and shared theme system. Avoid duplicated page-specific implementations.
5. Use the live DOM and actual authenticated page responses as the source of truth. The HTML fragments below describe the inspected structures; do not depend on placeholder comments or hard-coded example values. Prefer resilient semantic/table parsing and label-to-value mapping over brittle positional selectors. Handle missing, empty, changed, or not-yet-loaded content gracefully.
6. The extension must automatically discover and scrape every available term/school-year option on the relevant pages. The user must not have to visit every page or manually submit every dropdown. Select each available option, trigger the page's normal submission mechanism, wait for its results to load, extract the data, and associate every record with the exact term and school year selected. Restore the user's original page/selection/state where practical. Do not scrape only the examples shown in this specification.
7. Do not fabricate academic data. Preserve source values and labels; normalize only for display or for explicitly required calculations/format conversions. Record the source page, term, school year, scrape time, and scrape status with stored records where useful.
8. Provide useful loading, progress, success, empty, and error states. A failed page/term must not silently appear as successfully scraped. Allow retrying failed work without discarding successful records.
9. The result must be usable offline after a successful scrape. Clearly distinguish locally cached data from data that has not yet been scraped or refreshed.
10. Use the supplied screenshots as visual references for the navigation bar, weekly timetable, and monthly calendar layout. The written requirements below take precedence wherever a screenshot differs (especially colors).

## 2. Project architecture and data collection

Create a browser extension with a scraper and an application that opens in a new browser window. The extension popup/window must contain:

- Title: **Better SOLAR**
- **Scrape Data** button: when clicked, automatically scrape all required information from the authenticated SOLAR account, including all available term/school-year combinations on the pages that use selectors. The user must be signed in to SOLAR. Do not require the user to open each SOLAR page or manually change and submit each dropdown.
- **Launch Application** button: opens a new browser window displaying the Better SOLAR application.
- A top-right light/dark mode toggle. It must change the theme throughout the extension and every Better SOLAR application page/window, including a window opened through Launch Application. Persist the user's theme choice across sessions and windows.

### 2.1 Local data storage

Store scraped records in a local database in the extension/application's local storage area (prefer IndexedDB or an equivalent robust browser-local database). The app must read from this database when offline. Organize data into these exact top-level categories:

1. `User Profile`
2. `Account Balance Summary`
3. `Course Offerings`
4. `Curriculum`
5. `Assessment`
6. `Grades`

Keep term- and school-year-specific datasets separate. Do not overwrite one term's information with another. Retain the original raw value where normalization is required (for example, balance/overpayment and multi-day schedule values). Use stable keys so repeated scraping updates the corresponding record rather than creating uncontrolled duplicates. Provide a clear last-scraped/refresh status to the user.

### 2.2 Scraping behavior and source pages

Use the authenticated SOLAR session in the browser. Respect normal site navigation and form submission behavior. Do not bypass authentication, defeat access controls, or send private academic data to an external server. Scraping and storage should remain local to the user's browser.

#### A. User Profile

Source: https://solar.feualabang.edu.ph/user/profile

Scrape and categorize under **User Profile**:

**Student information**
- Student Number
- First Name
- Middle Name
- Last Name
- Personal Email Address
- School Email Address
- Citizenship
- Program
- Curriculum Code

**Enrollment status**
- The enrollment-status heading/title, including its dynamically displayed term and school year (example from inspection: `Enrollment Status: Term 1 SY 20262027`)
- Year Level
- Registration Status
- Student Type
- Scholarship

The profile page's `profile-table` contains label/value rows. The enrollment-status title is in the right-hand profile container above its table. Map values by their labels. **Do not scrape or display the `Grades Viewing` row**; it is explicitly irrelevant to this project.

#### B. Account Balance Summary

Source pattern:
- Term 1, SY 2023–2024 example: https://solar.feualabang.edu.ph/student/balance/1-20232024
- Term 2, SY 2023–2024 example: https://solar.feualabang.edu.ph/student/balance/2-20232024
- The final URL segment encodes `<term>-<schoolyear>`. Discover all available terms/years from the portal where possible; do not limit the scraper to the examples.

Scrape each term/year separately and categorize under **Account Balance Summary**.

**Account Balance Summary table** (`#balancesummaryTable`, two columns: Particulars and Details):
- Statement of Account (the inspected source label has a possible spelling variation, `Statement of Acount`; recognize either spelling)
- Student Number
- Full Name
- Course Code (display this as Program Code in the app)
- Beginning Balance
- Total Assessment

**Payments table** (`#ORTable`):
- Payments (display as Amount Paid)
- OR Number
- Date
- Mode

The table uses a header row followed by one or more data rows. Correctly associate each payment amount with its OR Number, Date, and Mode. If multiple payment rows exist, preserve all of them rather than dropping all but the first.

**Remaining Balance / Overpayment**
- Read the value shown below `#ORTable` in the `Remaining Balance / (Overpayment)` heading.
- If the value is a numeric amount without parentheses, classify it as **Remaining Balance**.
- If the numeric amount is enclosed in parentheses, classify it as **Overpayment**.
- Keep the original raw value. When displaying an overpayment, remove the surrounding parentheses and show the amount as a positive formatted value under Overpayment.
- Display `None` for either Remaining Balance or Overpayment when that category has no value.
- Example inspected value `(1.30)` is an overpayment, not a remaining balance. This is only an example; the actual amount varies by term/year.

#### C. Course Offerings

Source: https://solar.feualabang.edu.ph/course/offerings

The source page initially displays term and school-year dropdowns and requires submission before its course table appears.

**Selectors**
- Term selector: `select#term`, with available terms represented by values such as `1`, `2`, and `3`.
- School-year selector: `select#school_year`, with values such as `20262027`, `20252026`, `20242025`, `20232024`, `20222023`, `20212022`, `20202021`, `20192020`, and `20182019`.
- These are examples, not a fixed list. Read the options currently available to the authenticated user.

Automatically iterate through every valid term/year combination supported by the page, select both values, submit using the page's normal mechanism, wait for the table to update, and scrape the resulting data. Never associate a table with the wrong selection.

**Course table columns, in order**
- Course Code (source heading may say COURSE)
- Section
- Class Size
- Remaining Slots (source heading may say REMAINING)
- Day
- Time
- Room

Preserve every course row and the exact source values. Categorize under **Course Offerings**, keyed by term and school year.

#### D. Curriculum

Source: https://solar.feualabang.edu.ph/program/curriculum

The curriculum is specific to the student's degree/program. Scrape the complete table and categorize under **Curriculum**.

**Course columns, in order**
- Course Code
- Course Title
- Credits (source heading may say UNITS)
- Laboratory (Co-requisite) (source heading may say LABORATORY)
- Pre-Requisite (source heading may say PRE-REQUISITE)

The table includes group-heading rows spanning all five columns. These identify the academic year and term for the course rows that follow, for example `First Year (1st Term)`, `First Year (2nd Term)`, etc. Preserve these group headings and associate every course with the correct year/term group. Do not treat group-heading rows as course records. Keep the complete curriculum, including all years and terms.

#### E. Schedule and Assessment (SAF)

Source: https://solar.feualabang.edu.ph/student/saf

The source page has a combined term/school-year dropdown, then requires submission before its information appears.

**Selector**
- `select#school_year` (accessible label: Select Term and School Year)
- Values follow `<term>-<schoolyear>`, e.g. `1-20262027`, `3-20252026`, `2-20252026`, `1-20252026`, and older combinations.
- Options vary by student's enrollment history. Discover all options actually present; do not assume every student has the same history.
- Automatically select, submit, wait for the response, and scrape each available option. Associate every result with its exact selection.

**Enrollment/registration summary fields**
- Enrollment Status
- Student Number
- College
- Program
- Name
- Year Level
- Term
- School Year
- Phone
- Zip Code
- Address
- Classification

The source summary table may place multiple labeled values in one cell. Extract each label/value pair correctly.

**Enrolled courses table** (`.assessment_schedule` inside `.assessment_schedule-container`), columns in order:
- Course Code (source heading may say Courses)
- Course Title (source heading may say Title)
- Course Section (source heading may say Section)
- Credits (source heading may say Units)
- Days
- Time
- Room

Preserve all course rows.

**Assessment/fee table** (`.assessment_form` inside `.assessment_form-container`):
- Extract every label/value row actually present, not just a fixed list. Fee rows can vary by term and by courses enrolled.
- Recognize and display, when present:
  - Tuition Fee (`<number of credits>` appears dynamically in the label)
  - Miscellaneous Fee
  - ID Validation Fee
  - ITE Computer Laboratory Fee (`<course code>`)
  - Multimedia Lab Fee (`<course code>`)
  - PRESENTATION FEE (`<course code>`)
  - Any other additional fees, course fees, scholarship-related adjustments, additional fees, or fees without discounts that appear in the live table
  - TOTAL ASSESSMENT
  - Down Payment (Upon Enrollment) 40%
  - Midterm (`<date range value, depends on term>`) 30%
  - Final (`<date range value, depends on term>`) 30%
  - Add on: Installment Fee
- Preserve dynamic fee labels, date ranges, values, and two-decimal monetary precision. Do not hard-code the example Miscellaneous Fee amount (`14,127.00`) or assume the example fee rows are always present.
- Extract the date-range text from the live Midterm and Final labels; do not invent dates.
- Calculate/display Total Credit Units from the enrolled course credits. Preserve the source total assessment value and emphasize it in bold.

Categorize this data under **Assessment**, while keeping the course schedule and enrollment summary data available for the SAF page and weekly schedule. Do not lose the relationship between SAF data and the matching term/year.

#### F. Grades

Source: https://solar.feualabang.edu.ph/student/grades

The page uses a combined term/school-year selector and requires submission before the grades table appears.

**Selector**
- `select#school_year`
- Option values use `<term> - <schoolyear>` (spaces may vary), e.g. `1 - 20262027`, `3 - 20252026`, `2 - 20252026`, `1 - 20252026`, and older combinations.
- Available choices vary by student. Read the actual options, automatically submit each, wait for the results, and associate the grades with the exact selected term/year.

**Grades table columns, in order**
- Course Code
- Course Title
- Course Section
- Credits (source heading may say UNITS)
- Midterm Grade (source heading may say MIDTERM)
- Final Grade (source heading may say FINAL)

Preserve all rows. Some current/in-progress terms have no Final Grade yet. Treat a blank/missing Final Grade as not yet available; do not convert it to zero, fail, or a fabricated grade.

Categorize under **Grades**.

## 3. Extension popup and global theme

When the extension popup/window is opened, show:
- Title: **Better SOLAR**
- **Scrape Data** button
- **Launch Application** button
- Top-right light/dark theme toggle

Scrape Data must run the full automatic scrape described above, only when the user has an authenticated SOLAR session. Show progress by page and term/year, completion summary, and actionable errors. Launch Application opens the main app in a new browser window.

Theme selection must apply to the popup, all app pages, and newly launched windows, and persist across sessions. Use a consistent theme token system rather than separate ad hoc dark-mode styles.

## 4. Shared visual system and navigation

### 4.1 Design direction

Create a sleek, modern, polished student portal with clear typography and a coherent design system. The primary brand green is **`#2e844c`**. Use it for the full-size navigation bar and weekly schedule course blocks. The attached screenshots are layout references; do not copy their purple/blue colors where they conflict with this green requirement.

Apply these global UI/UX rules everywhere:
1. Delete filler badges.
2. Do not italicize random words.
3. Use monospace only where it is functionally appropriate.
4. Establish and consistently use a design system.
5. Group related content with deliberate spacing.
6. Use specific, informative headlines.
7. Make primary calls to action visually clear.
8. Include a deliberate accent color in addition to the brand green.
9. Keep icon style and sizing consistent.
10. Remove unnecessary embellishments.
11. Inner corner radius = outer corner radius minus padding.
12. Maintain accessible, readable text contrast.
13. Wrap headline text naturally.
14. Align visually, not merely by matching pixel values.
15. Include loading states.
16. Animate useful feedback (for example, successful actions, validation, and transitions); avoid decorative motion.

Use consistent spacing, typography, radii, shadows, borders, table styles, focus states, hover states, and responsive breakpoints. All data tables except the weekly schedule must use the shared clean, sleek, modern table design.

### 4.2 Shared navigation bar

Implement the navigation bar once as a reusable component and include it on every page.

**Desktop, expanded state (page scrolled to top):**
- Logo image (`logo.jpg`)
- Brand label: **Better SOLAR**
- Dashboard → home page
- User Profile dropdown, shown on hover, with:
  - User Profile → `user-profile`
  - Curriculum → `curriculum`
  - Balance Summary → `balance-summary`
  - Schedule and Assessment → `saf`
  - Grades → `grades`
- Courses Offered → `course-list`
- Canvas → https://feu.instructure.com
- Exit button at far right, which closes the application window

**Scrolled/minimized state:**
- When the page is scrolled down, minimize the navigation bar and remove its green background; use a white background.
- At the top of the page, show the full-size navigation bar with background `#2e844c`.
- Preserve usable contrast and visible active-page state in both modes.

**Responsive navigation:**
- If the viewport is too narrow for all desktop items, show:
  - Logo
  - Better SOLAR
  - Button for the currently open page
  - Menu button that reveals Dashboard, User Profile, Courses Offered, and Canvas
  - Exit button
- On the User Profile page, the current-page User Profile button must also provide access to its nested items: User Profile, Curriculum, Balance Summary, Schedule and Assessment, and Grades.
- If there is insufficient room for Exit, put Exit inside the Menu list.
- On mobile, show only the hamburger side-menu control (three horizontal lines), logo, and Better SOLAR in the bar. The hamburger opens a side menu containing all navigation options originally available in the desktop bar, including the nested User Profile pages, Canvas, and Exit.
- Ensure keyboard accessibility and usable touch targets; do not rely on hover alone for mobile or keyboard users.

### 4.3 Shared footer

Implement the footer once as a reusable component and include it on every page.

- It should appear only when the user scrolls to the bottom of the page.
- On short pages that do not require scrolling to view all content, it must not be visible without scrolling down.
- Left: `logo.jpg` and **Better SOLAR**.
- Right: clickable icons linking to:
  - Facebook: https://www.facebook.com/elijajajah.paul
  - Instagram: https://www.instagram.com/elijajajah.paul/
  - GitHub: https://github.com/Gryymme
- Below these, centered: **Copyright 2026 © Gryymme (Elijah Miranda Nonan)**

## 5. Pages and behavior

### 5.1 Dashboard / Home

This is the landing page when Launch Application opens the app.

- Include the shared navigation bar and footer.
- Heading: **Welcome `<first name>`**, with the first name obtained from the scraped User Profile data.
- Main content has two areas:
  - **Calendar (larger area, left):** a sleek monthly calendar showing upcoming Canvas activities.
  - **Weekly course schedule (smaller area, right):** show the student's weekly course timetable, using the shared schedule component described in section 5.5 and the supplied weekly-schedule screenshot as a layout reference.
- Calendar header: month/year at top-left; **Connect to Canvas** button at top-right.
- Connect to Canvas opens a popup/modal asking the user to paste their Canvas Calendar Feed URL. Explain that the feed URL is obtained in Canvas via Calendar → Calendar Feed at the bottom-right of the page.
- After a valid feed URL is saved, populate the calendar with scheduled Canvas activities. Persist the feed URL locally so the user does not need to enter it again on later sessions. Handle invalid/unreachable feeds and empty calendars gracefully. Do not send the feed URL or calendar data to an unrelated external service.
- Calendar should support navigating months and clearly show scheduled activities on their dates.
- Weekly course schedule should occupy less width than the calendar.
- If the viewport cannot fit both side by side, stack the weekly schedule below the calendar and separate them with the shared gray horizontal divider.

### 5.2 User Profile

Title: **User Profile**

Use a two-column layout on wide screens, with two rounded containers; stack them on narrow screens.

**Left container — Student Information**
Display labels and values in two aligned columns; values must be left-aligned:
- Student Number
- First Name
- Middle Name
- Last Name
- Personal Email Address
- School Email Address
- Citizenship
- Program
- Curriculum

Map Curriculum to the scraped Curriculum Code.

**Right container — Enrollment Status**
Display labels and values in two aligned columns; values must be left-aligned:
- Current Term
- Current School Year
- Year Level
- Registration Status
- Student Type
- Scholarship

Display formats:
- Current Term example: `1st term`
- Current School Year example: `SY 2026-2027`
- Year Level example: `4th Year`

Derive term and school-year display values from the dynamically scraped enrollment-status heading/data. Do not hard-code the example values.

### 5.3 Curriculum

Title: **Program Curriculum**

- Display the complete scraped curriculum.
- Each academic year/term group must have its own separate table.
- Place the group heading before its table, formatted like `1st year - 1st Term`.
- Each table uses the shared table design and these columns:
  - Course Code
  - Course Title
  - Credits
  - Laboratory (Co-requisite)
  - Pre-Requisite
- Preserve every curriculum row and its correct year/term grouping.

### 5.4 Account Balance Summary

Title: **Account Balance Summary**

At the top, show:
- Term label and term dropdown
- School Year label and school-year dropdown
- Submit button

Do not show the balance details until both a term and school year have been selected and submitted. Populate choices from scraped/available data, not a hard-coded list.

Use a rounded container with these sections.

**Account Balance Summary**
- Full Name
- Student Number
- Statement of Account
- Program Code
- Beginning Balance
- Total Assessment — value must be bold

Add the shared gray horizontal divider.

**Payment Summary**
- Amount Paid
- OR Number
- Date
- Mode
- Remaining Balance
- Overpayment

Align each label on the left and its value to the right of the label; values themselves must be left-aligned. For Remaining Balance and Overpayment, show `None` if no value exists. Apply the parentheses classification and display rule from section 2.2.B; do not show parentheses around an overpayment.

If multiple payments exist, present them without mismatching their amount, OR number, date, or mode. Preserve term/year selection context.

### 5.5 Schedule and Assessment (SAF)

The page title requested by the source specification is **Account Balance Summary**; retain this exact title unless the existing project contains a clear established correction. The page is reached through the navigation item **Schedule and Assessment**.

At the top, show Term and School Year dropdowns plus Submit. Do not show details until a selection is made and submitted. Choices must reflect the scraped SAF selector options.

Use a responsive two-column layout.

**Left rounded container**

1. Main heading:
   - If the selected term/year's SAF Enrollment Status is exactly `ENROLLED`, show **Enrollment Summary**.
   - Otherwise show **Registration Summary**.

2. Aligned label/value summary:
   - Name
   - Student Number
   - Enrollment Status
   - Classification

3. Shared gray divider.

4. Enrolled-courses table with columns:
   - Code
   - Course Title
   - Section
   - Credits
   - Days
   - Time
   - Room

   Convert displayed times to 12-hour format (`HH:MM AM/PM`). Preserve the source time values in storage.

5. Shared gray divider.

6. Assessment details:
   - Total Credit Units (sum the enrolled course credits)
   - Tuition Fee (`<number of credits>`)
   - Miscellaneous Fee
   - ID Validation Fee
   - Every additional fee actually present for the selected term/year, retaining the exact source label
   - Total Assessment — value must be bold

7. Shared gray divider.

8. Smaller subheading: **Payment Options** (smaller than the main container heading):
   - Down Payment (Upon Enrollment) 40%
   - Midterm (`<scraped date range>`) 30%
   - Final (`<scraped date range>`) 30%
   - Add on - Installment Fee

   Get the Midterm and Final date ranges from the scraped fee labels for the selected term/year. Never invent date ranges. Retain exact source amounts and labels.

All label/value pairs must be aligned; values must be left-aligned.

**Right rounded container — Weekly course schedule**

Show the same weekly schedule component used on Dashboard, populated from the enrolled courses for the selected SAF term/year.

**Weekly schedule construction rules (apply to Dashboard and SAF):**
- Build the schedule from the enrolled-course rows, not from Course Offerings.
- Columns must always run Monday through Saturday, even if a day has no classes.
- Day abbreviations:
  - M = Monday
  - T = Tuesday
  - W = Wednesday
  - TH = Thursday
  - F = Friday
  - S = Saturday
- Day, Time, and Room source values can contain multiple entries separated by `/`, with corresponding entries at the same index belonging together.
- Example for CS0037:
  - Day: `F / T`
  - Time: `14:00:00-15:50:00 / 11:00:00-12:50:00`
  - Room: `ONLINE / 706`
  This means Friday 2:00–3:50 PM, online; Tuesday 11:00 AM–12:50 PM, Room 706.
- Split the day, time, and room values by `/`, trim whitespace, and pair by index. Create one schedule occurrence per matching day. Never show Friday's time/room in Tuesday's block or vice versa.
- Render each course occurrence in the correct weekday and time position.
- Each course block must show:
  - Course Code
  - Course Title, wrapped onto multiple lines and truncated to a maximum of 40 characters; if longer, display the first 40 characters followed by `...`
  - Timeslot in 12-hour format
  - Room, prefixed with `Room ` for physical room values (e.g. `Room 706`); show `ONLINE` or `ASYNCH` exactly, without a `Room` prefix
- Course blocks must be green `#2e844c`.
- Match the supplied timetable screenshot's weekly-grid structure and clear hour/day alignment, but use the required green color.
- If a block cannot fit all four content elements, increase the height of all course blocks and the hour-row heights consistently until the information fits. Avoid clipping or overlapping blocks.
- Handle courses with multiple weekly meetings as separate correctly positioned occurrences.

On narrow screens, stack the SAF containers vertically and keep the schedule readable and scrollable without losing day labels.

### 5.6 Grades

Title: **Grades**

At the top, show Term and School Year dropdowns plus Submit. Populate choices from the scraped grades selector options. Do not show grade details until both values are selected and submitted.

**Selected-term grades container**
- Heading: `Term <selected term> - SY <selected school year>`
- Shared table columns:
  - Course Code
  - Course Title
  - Section
  - Credits
  - Midterm
  - Final
- Preserve blank/missing Final Grade values for ongoing terms as not yet available; never substitute zero or a made-up grade.

**Second rounded container — Undergraduate Grading System**

Show this exact table:

| Raw Score | Grade Point | Letter Rating | Percentage | Description |
|---|---:|---|---|---|
| 95.8 - 100 | 4.0 | A | 97-100 | Excellent |
| 91.5 - 95.7 | 3.5 | A- | 93-96 | Superior |
| 87.2 - 91.4 | 3.0 | B+ | 89-92 | Very Good |
| 82.9 - 87.1 | 2.5 | B | 85-88 | Good |
| 78.6 - 82.8 | 2.0 | B- | 81-84 | Satisfactory |
| 74.3 - 78.5 | 1.5 | C | 78-80 | Fair |
| 70.0 - 74.2 | 1.0 | D | 75-77 | Pass |
| Below 70.0 | 0.5 | F | Below 75 | Fail |

Below the table, show **Other Ratings** with the exact entries and alignment:
- `0.0 - No Attendance / Excessive Absences`
- `6.0 - Passed (For Internship / NSTP / Correlation Courses)`
- `7.0 - Officially Dropped`
- `8.0 - Credited (For Transferees)`
- `9.0 - Incomplete`

For each Other Ratings line, left-align the number, center-align the dash, and left-align the description to the right of the dash.

### 5.7 Courses Offered / Course List

Navigation label: **Courses Offered**. Page title: **Courses Offered**.

At the top, show Term and School Year dropdowns plus Submit. Do not show course data until both are selected and submitted. Populate available options from the source page.

Heading: `Courses Offered for Term <selected term>, SY <selected school year>`.

**Filters, aligned above the table on the left:**
- Course: text search box that filters courses.
- Section: searchable dropdown containing all sections present in the selected course list. Typing letters/numbers filters/sorts the options to matching characters.
- Day: multi-select toggle buttons labeled `M`, `T`, `W`, `TH`, `F`, `S`, representing Monday through Saturday. Multiple days may remain selected; show courses occurring on any selected day. Clearly indicate selected buttons. Filters must work together.

**Schedule visualizer control, above the table on the right:**
- Button label: **Open Schedule Creator** (the later detailed interaction refers to “Open Schedule Visualizer”; use one consistent label, preferably Open Schedule Creator, and rename it **Close Schedule Visualizer** while open).
- When opened, resize/reflow the page into two areas: Course Offerings table on the left and an initially empty weekly schedule on the right.
- Use the same weekly schedule grid design as Dashboard/SAF, with Monday–Saturday columns. The schedule begins empty and is populated only by the user's selections.
- If the viewport is too narrow for side-by-side display, place the weekly schedule below the course table and separate it with the shared gray divider.
- Above the schedule, show:
  - **Add an Individual Course**
  - **Add a Block Section**

**Add a Block Section**
- Open a modal asking the user to select a block section and submit.
- Populate the weekly schedule with every course block in that selected block section.
- Provide Submit and Cancel. Clicking outside the modal also closes it and cancels the operation.
- Validate the entire block against existing schedule entries for time conflicts before adding it. If any conflict exists, explain the conflict and do not partially add the block.

**Add an Individual Course**
- Open a modal containing the complete selected-term Course Offerings table.
- Every course row is clickable/selectable; the header row is not.
- Include the same Course, Section, and Day filters inside the modal.
- Allow selecting one or multiple courses before clicking **Add Courses**.
- Do not allow selection of courses with zero remaining slots; highlight unavailable rows in red and make their unavailable status clear.
- Before adding, detect:
  1. Conflicts between each selected course and courses already on the weekly schedule.
  2. Conflicts among the newly selected courses themselves.
- A time conflict occurs when two meetings overlap on the same day. Correctly compare parsed time intervals and paired day/time occurrences.
- If any conflict exists, do not add the conflicting selection; clearly identify which selected course conflicts with which already-added or newly selected course. Do not silently ignore conflicts.
- If there are no conflicts and slots are available, add all selected courses to the weekly schedule.
- Provide Add Courses and Cancel. Clicking outside the modal also closes it and cancels the operation.
- Keep the visualizer state and selections usable while filters change; closing the visualizer should return the course table to its normal full-width layout.

## 6. Responsive behavior and accessibility

- Make every page responsive and usable on desktop, tablet, and mobile.
- Preserve the specified desktop two-column layouts when there is sufficient width; stack them at sensible breakpoints.
- Keep tables usable on narrow screens (responsive columns, horizontal scrolling, or another clear strategy; never silently hide required data).
- Keep the weekly schedule's Monday–Saturday labels visible and make the grid usable on small screens.
- Use semantic headings, labels, buttons, tables, accessible modal behavior, keyboard navigation, visible focus states, and sufficient contrast.
- Hover menus must have keyboard/touch equivalents. Modals must support Escape where appropriate, Cancel, and outside-click dismissal as specified.
- Respect reduced-motion preferences.

## 7. Data integrity, parsing, and validation

- Discover selector options dynamically from the authenticated portal. The examples in this document are illustrative, not exhaustive.
- Scrape all available terms and school years for Balance Summary, Course Offerings, SAF, and Grades according to each page's actual selector/URL pattern.
- Do not assume the available terms are identical across the four pages.
- Correctly handle selector formats that differ:
  - Course Offerings: separate Term and School Year selectors.
  - SAF: combined `<term>-<schoolyear>` value.
  - Grades: combined `<term> - <schoolyear>` value; normalize whitespace only for matching, retain the selected source value.
  - Balance Summary: URL ending `<term>-<schoolyear>`.
- Wait for the correct page result after each submission/navigation before reading the DOM. Prevent stale tables from being stored under a new selection.
- Parse values by table IDs/classes, header labels, and row labels where possible. Handle capitalization and minor label spelling differences noted above.
- Preserve decimal precision and currency strings. Do not infer missing amounts.
- Retain all rows, including multiple payment rows and variable assessment fee rows.
- Handle empty tables, no records, unavailable terms, session expiry, network failures, and changed page structures with explicit status/errors.
- Avoid duplicate records on repeat scrapes. Store enough metadata to identify the source and the exact selection.
- A single failed term/page must not erase successful data from other pages/terms.
- Keep the scraper and UI decoupled: the scraper produces structured records; pages render those records.

## 8. Completion and quality assurance

Before declaring the project complete:

1. Verify all six data categories are implemented and stored locally.
2. Verify all six SOLAR source areas are scraped:
   - User Profile
   - Account Balance Summary
   - Course Offerings
   - Curriculum
   - Schedule and Assessment
   - Grades
3. Verify automatic iteration across every available term/year selector option and correct record association.
4. Verify the popup's Scrape Data and Launch Application actions.
5. Verify theme persistence across popup and launched application windows.
6. Verify all navigation destinations, nested User Profile options, responsive menu behavior, and Exit behavior.
7. Verify the shared footer and all three external social links.
8. Verify Canvas feed connection persistence and calendar population.
9. Verify all page-specific labels, columns, exact grading-system rows, empty states, and formatting rules.
10. Verify the Account Balance parentheses rule, multiple payment rows, dynamic SAF fee rows/date ranges, missing Final Grade behavior, and 12-hour time display.
11. Verify weekly schedule pairing of multi-day/time/room values, correct weekday placement, 40-character title truncation, room labels, green blocks, and no clipping/overlap.
12. Verify course filters, searchable section selector, multi-day filter, visualizer responsive layout, block-section insertion, individual-course selection, zero-slot disabling, and conflict detection for both existing and newly selected courses.
13. Verify local/offline rendering after data has been scraped.
14. Run the project's available linting, type checks, tests, and production build. Fix errors introduced by the implementation.
15. Add or update tests for parsing, term/year association, balance/overpayment classification, schedule occurrence pairing, time conversion, and schedule conflict detection.
16. Do not claim a live scrape or portal integration has been verified unless it was actually tested with an authenticated SOLAR session. If access to the live portal or credentials/session is unavailable, finish the implementation with robust real integration code, provide a clearly labeled test/demo mode using sample data only where necessary, and state exactly what still requires an authenticated test.

## 9. Explicit source-specification ambiguities (do not silently discard)

The original instructions contain a few inconsistent labels/directions. Preserve the following transparent resolutions:
- Dashboard layout: the detailed instruction says the calendar is on the **left** and the narrower weekly schedule is on the **right**, but one later sentence mistakenly says the calendar is on the right. Use the explicit left/right layout: larger calendar left, smaller schedule right; stack schedule below on narrow screens.
- Courses Offered visualizer: the opening button is called **Open Schedule Creator**, while the detailed interaction later refers to **Open Schedule Visualizer**. Use **Open Schedule Creator** when closed and **Close Schedule Visualizer** when open, as specified above, and keep the behavior consistent.
- SAF page title: the source explicitly labels this page title **Account Balance Summary**, even though the page is Schedule and Assessment. Retain that exact requested title unless the existing implementation establishes a deliberate correction; do not confuse this page's content or route with the separate Balance Summary page.
- The supplied header/timetable screenshots use purple/blue styling, while the written project specification explicitly requires `#2e844c` for the full-size navigation bar and course blocks. Follow the written green color requirement and use screenshots for layout/behavior only.

## 10. Deliverables and final report

Deliver a complete, runnable Better SOLAR project, not merely instructions. Include:
- All source code and reusable components.
- Extension manifest/configuration and setup/build instructions.
- Local database schema and data access layer.
- Scraper implementation and progress/error reporting.
- All six application pages, shared navigation, shared footer, theme system, calendar, and weekly schedule.
- Tests for critical parsing and scheduling logic.
- A concise README explaining installation, signing in to SOLAR, scraping, launching the app, offline behavior, Canvas feed connection, and known limitations.

At the end, report:
- What was implemented.
- The files/components created or changed.
- How to install/run the extension and application.
- What was tested and the results.
- Any remaining limitations or steps that require a real authenticated SOLAR/Canvas session.

**Final instruction:** Build the complete Better SOLAR experience while preserving every requirement in this specification. Do not omit a requirement merely because it is lengthy, repetitive, or difficult. If a requirement cannot be completed because of a genuine technical or access limitation, explain it explicitly and implement the closest safe, functional behavior without pretending it is complete.
