# Local database schema

Database: `better-solar-local`, version 1. Native IndexedDB, shared by the extension service worker, popup and application windows. No external database.

## `records` object store

Key path: `id`. Index: `category`.

The six exact category values are `User Profile`, `Account Balance Summary`, `Course Offerings`, `Curriculum`, `Assessment`, and `Grades`.

Each record has:

```js
{
  id: "<owner>|<category>|<term>|<schoolyear>",
  owner: "verified student number",
  category: "Assessment",
  term: "1",                     // empty for profile/curriculum
  year: "20262027",              // exact source year identifier
  sourceSelection: { school_year: "1-20262027" },
  sourceUrl: "https://solar.feualabang.edu.ph/student/saf",
  scrapedAt: "ISO-8601 successful collection time",
  status: "success",             // success | empty | error
  lastAttempt: "ISO-8601 failure time if applicable",
  error: "actionable failed-refresh message if applicable",
  data: { /* category payload */ }
}
```

`put` is an upsert. A failed refresh updates the status/error/attempt time while preserving the previous successful `data` and `scrapedAt`. An explicitly empty source response is a successful empty snapshot and replaces the corresponding previous snapshot. A missing/unrecognized table is an error rather than an empty snapshot.

All UI queries filter by the most recently verified `activeOwner` metadata. Historical accounts remain separate locally and are never mixed into the currently active account's pages. Credentials, cookies, CSRF token values and full source HTML are not persisted.

## Payload shapes

| Category | Stored data |
| --- | --- |
| User Profile | `values` map with required source fields, plus raw `enrollmentHeading`; Grades Viewing excluded |
| Account Balance Summary | Canonical display field map `values`, original `rawSummary` map, all `payments` with paired `paid/or/date/mode`, raw balance string `rawBalance` |
| Course Offerings | Every `courses` row: `code/section/size/remaining/days/time/room`, plus original `rawValues` array |
| Curriculum | Ordered `groups` with original `heading` and each group's course rows `code/title/credits/lab/prerequisite/group/rawValues` |
| Assessment | All twelve canonical `summary` fields when present (including Student # → Student Number), `rawSummary` label/value pairs, every enrolled `courses` row, every original `fees` label/value pair, derived `totalCredits` |
| Grades | All `courses` rows `code/title/section/credits/midterm/final/rawValues`; blank finals stay empty |

Currency values, fee labels, date ranges, schedule strings, final grade strings and selector option values remain strings. The UI derives amount classifications, two-decimal formatting and time formatting without replacing the originals. Stable term-level keys make refreshes idempotent; rows remain ordered within the complete source snapshot rather than being merged by an unreliable course code.

## `meta` object store

Out-of-line keys:

- `activeOwner`: current verified student number.
- `scrapeJob`: durable task queue with state, original source selections, status per task, discovery provenance, current collector tab and verified identity.
- `canvas`: private feed URL, complete raw ICS content, cache time and event count. This intentionally survives failed refreshes.

Chrome `storage.local` holds only shared `theme` and `scrapeProgress`; no session credentials. `chrome.alarms` resumes the queue. Draft schedule selections use the app window's `sessionStorage`. Demonstration payloads stay in memory.

Version 1 is the initial schema; future changes must add explicit migrations in `src/db.js` without deleting successful records.

## Version 1.0.2 settings deletion

The shared Settings feature sends DELETE_DATA to the worker. It serializes control commands, cancels/drains active collection, closes the collector tab, then clears both stores in one transaction. Only a non-personal `dataGeneration` marker is placed back in `meta`. This marker is checked atomically when a pending Canvas request attempts to save, preventing an old response from recreating deleted private data.

Extension storage keeps only theme plus a non-personal `dataResetAt` signal, which causes other app windows to clear memory and session drafts. No source portal account or cookie is deleted. Public font responses are in the separate `better-solar-fonts-v1` Cache Storage; this cache contains no academic data. Bundled fonts, when generated, are public project assets rather than scraped records.
