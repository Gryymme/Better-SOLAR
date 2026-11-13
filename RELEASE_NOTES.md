# Better SOLAR for Mobile — v2.3.2

Released November 13, 2026.

## Added

- **Optional image labels:** Save PNG opens a label prompt. Enter a label for the top of the image or leave it blank to keep the schedule alone, with no extra top gap. Confirm Save PNG after the preview is ready. Mobile file sharing/download fallback remains unchanged.

## Updated

- Weekly schedules and PNGs show only the occupied hours, rounded outward to whole hours. A final 4:50 PM meeting produces a 5:00 PM final time line instead of unused evening hours.
- The curriculum-title switch is enabled by default. Switch it off to show editable custom-title fields; drafts are retained while changing modes.
- Shared blocks keep codes on one line when there is room and show one title line below. Narrow codes wrap at the letter/number boundary. Full-title mode retains complete titles and normal 12/10 px image fonts.
- The schedule's update timestamp is aligned with Save Schedule as PNG. On mobile the status begins with **Updated**, saving space; collection errors are preserved.
- Version and transfer metadata are 2.3.2. Existing cached records and compatible desktop JSON imports remain supported.

## Retained mobile behavior

The mobile preview uses the width slider without a drag handle. The full six-day image scales to the screen. Saving still uses the native share sheet when supported, with download/manual-open fallback, and does not use the PC downloads permission. The final save starts from the prompt's explicit button tap after encoding finishes so file sharing can retain user activation.

## Updating and verification

Select this ZIP directly in Orion's file-based installer and update the existing installation where supported. Keep a private data export before replacing an installation that may create separate storage.

Automated tests use synthetic data and local canvas renders. Orion's share sheet, native popup sizing, touch interactions, and live SOLAR collection still require device verification.
