# Mobile extension compatibility — 2.0.0

## Installation packages

The delivery contains the shared project, `dist/` for desktop and `dist-mobile/` for legacy/mobile hosts. `packages/Better_SOLAR-Mobile.zip` is the installable mobile archive, with its manifest at the root. The outer Better_SOLAR.zip contains source and both builds; extract it before selecting the mobile package in an extension installer.

Orion's documented iOS/iPadOS workflow is Extensions → + → file-based installation, after enabling third-party extensions when required. Select the mobile archive from Files and grant access. Kiwi versions that expose a local ZIP/folder installer can use the same mobile package. Exact file-picker/menu labels depend on the installed browser version. See the README for steps.

## Shared behavior and platform differences

| Area | Desktop package | Mobile compatibility package |
| --- | --- | --- |
| Manifest/background | MV3 module service worker | MV2 background HTML page with the same module entry |
| Extension API namespace | chrome or browser, normalized to Promises | Same adapter, including callback-only APIs |
| SOLAR parser injection | scripting.executeScript | tabs.executeScript plus a bundled private message bridge |
| Asynchronous scans/submission | Injected function result | Extension-only tab messages with asynchronous responses |
| Application launch | Separate window where supported | Active browser tab, with no required windows API |
| Collector tab | Normally inactive | Can be active so the mobile host loads its documents |
| Resume | Durable queue, alarms, worker startup | Background-page timers, optional alarms, foreground progress/resume |
| Interface | Existing responsive pages and animations | Same pages, animations, calendar, schedule and Settings |
| Local data | Extension IndexedDB/storage | Same schema within that mobile extension identity |

The adapter does not use remote scripts or a remote scraping service. The legacy bridge accepts only known parser operations from the same extension ID. It does not expose academic records through page-script messages.

## Essential capabilities

The host must implement runtime messaging, local storage, tab create/get/update/remove and either modern scripting or legacy tab injection with tab messaging. IndexedDB, ES modules, native dialogs, canvas text measurement and standard observer/layout APIs are required by the shared UI. Alarms and separate windows have fallbacks. Optional Canvas host permission requests must work for the chosen Canvas instance.

A host may expose a namespace but not implement an operation. Modern injection can fall back to legacy injection; opening a separate window can fall back to a tab; absent/unavailable alarms do not block the in-process queue. A visible extension view resumes/polls saved progress when mobile storage-change events or background wakeups are insufficient. Request timeouts use AbortController when AbortSignal.timeout is unavailable.

The extension cannot keep iOS/Android from suspending the browser. Keep it in the foreground while collecting. Do not close or navigate the collector tab; return to Better SOLAR after collection or suspension to see progress/resume its persisted queue. A failed essential operation is reported and retains previous records. Installation success alone does not establish API compatibility.

## Verification status

Automated doubles verify both API conventions, modern and legacy collector paths, asynchronous tab messaging, window fallback and the existing deletion/retry protections. Full-scan fixtures verify pagination, count mismatches, missing/malformed tables, filtered results, multiple curriculum tables and explicit zero records. These are code-level checks.

No Orion/iOS or Kiwi/Android device was available, no live student session was used and the workspace blocks Chromium startup. No successful device installation, live collection or native animation/layout review is claimed.

On each target device, validate installation, app-tab launch, light/dark appearance, sidebar/dialog motion, Canvas permissions/feed, three-day swiping and pinned hours. Collect a real SOLAR term, then update it unchanged and after a known room/course change; interrupt a separate update and confirm the old payload stays available. Exercise suspension/resume and Settings deletion. Keep personal records/screenshots outside the repository.

## Browser status and sources

- [Orion iOS/iPadOS documentation](https://help.kagi.com/orion/browser-extensions/ios-ipados-extensions.html): file-based installation is documented; extension support is preliminary and constrained by Apple's APIs.
- [Orion technical/API information](https://help.kagi.com/orion/misc/technical.html): supported APIs are an evolving subset.
- [Orion file-install discussion](https://orionfeedback.org/d/936-install-from-file-for-extensions/20): project responses describe ZIP, CRX and XPI file support.
- [Kiwi project README](https://github.com/kiwibrowser/src.next/blob/kiwi/README.md): archived, with maintenance ending after January 2025. This is a legacy compatibility target, not a maintained-browser recommendation.
- [MDN background manifest reference](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background): page/script/worker support differs between engines, motivating separate build manifests.

These references inform the package and guide; they do not certify this extension on a device.
