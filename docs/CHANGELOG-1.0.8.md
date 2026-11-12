# Better SOLAR 1.0.8

| Request | Result |
| --- | --- |
| External-dialog checkbox | Do not ask again is in the footer below the divider, aligned with Cancel and Proceed. A compact footer style keeps the controls on one row on phones. Confirmation/persistence/reset behavior is retained. |
| Allow conflicting meeting times | Individual courses and block sections may overlap existing or newly selected courses. Duplicate selections and invalid meeting pairs remain blocking. No-slot warnings remain separate. |
| Side-by-side meetings everywhere | The shared weekly schedule groups connected overlapping time intervals per day and assigns separate lanes. Every Dashboard, Schedule and Assessment and visualizer schedule uses this layout. Independent groups regain full day-column width. Adjacent meetings are not conflicts. |
| Code wrapping | Narrow blocks split at the letter/number boundary and append a hyphen to the prefix. Four-digit, zero-padded numeric parts omit one display-only leading zero, matching `CCS-` / `001` and `GED-` / `004A`. Full source codes remain in stored data, identifiers and accessible descriptions. |
| Shared title/font fitting | Shared blocks limit displayed titles to 20 characters including ellipsis. Full descriptions remain accessible. Code and title use a common measured font on every viewport; complete title words shrink to fit rather than being split into character fragments. |

The changes affect the local visualizer and rendering only. They do not register courses or alter SOLAR records. Course removal, no-slot colors, external link consent and private-data deletion remain available.

See `VERIFICATION.md` and `qa/` for automated results and the remaining installed-browser layout checks.
