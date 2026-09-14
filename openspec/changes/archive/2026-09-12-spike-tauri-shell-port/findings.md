## Findings

Spike branch: `spike/tauri-shell-port`. Electron tooling was left untouched throughout and still builds/runs independently.

### Rendering fidelity

- **Linux (WebKitGTK)**: verified manually against the existing Electron build. The chart canvas — grid lines, row/column number labels, and the X-stitch markers — rendered identically. The only visible difference was scrollbar styling, which the user preferred on the Tauri/WebKitGTK side. This was design.md's primary named risk, and it did not materialize on Linux.
- **Windows / macOS**: not tested in this spike (no access to that hardware in this environment). Deferred to the user to verify later; see "Open items" below.

### Functional round-trips (all verified manually against the running app)

- JSON project save/load: works, and a file saved from Tauri loads correctly in the Electron build (format unchanged, as designed).
- Image import (Jimp-based decode/greyscale/threshold): works.
- PDF export, chart-only: works.
- PDF export, merged with an additional cover PDF: works, via a fallback to direct `pdf-lib` calls (see below).

### Things that didn't work on the first try

- **`pdf-merger-js` cannot run in the webview at all.** It imports `fs/promises` at module load time, which doesn't exist outside Node. This was anticipated as a possibility in design.md; confirmed, and replaced with direct `pdf-lib` page-copying (already a transitive dependency; added as a direct one).
- **pdfkit's default (Node) build reads its base-14 font metrics via `fs`.** Not something design.md called out specifically (it focused on the *write* path, not font loading). Fixed by importing `pdfkit/js/pdfkit.standalone` — a prebuilt browser bundle with fonts embedded — instead of the default Node entry point.
- **`blob-stream` needs Node's `stream`/`util` modules**, which Vite otherwise externalizes to empty stubs, silently breaking at runtime rather than failing the build. Fixed by adding `vite-plugin-node-polyfills`.
- **Tauri's fs plugin permission model is more granular than the app's own code assumes.** Byte-level commands (`readFile`/`writeFile`, used by image import and PDF export) and text-level commands (`readTextFile`/`writeTextFile`, used by JSON save/load) require *separate* capability grants (`fs:allow-read-file` vs `fs:allow-read-text-file`, etc.), even though `dialogs.ts`/`tauri-bridge.ts` treat them as the same kind of "read/write a user-chosen file." Missing the text-file permissions caused JSON Save to fail silently (an unhandled promise rejection, easy to miss without watching the dev console) while image import and PDF export worked fine. This is a real ergonomic gotcha versus Electron's simpler trust model, worth remembering if this code is extended later (e.g., any new fs plugin usage needs its own explicit permission, not just "fs access in general").
- **electron-forge's webpack integration doesn't detach cleanly for Tauri.** Its `devUrl`/`frontendDist` model wants a plain dev server and static build directory; electron-forge's webpack plugin manages its own internal server tightly coupled to Electron startup. Used the Vite fallback that design.md already allowed for, kept entirely separate from the existing `webpack.*.config.ts` files (new `vite.config.ts`, new `index.html` at the repo root, new `src/renderer.tauri.ts` entry point alongside the untouched `src/renderer.ts`).

### Rust-toolchain burden for contributors

Zero custom Rust was needed to reach parity with the current feature set — `tauri-plugin-dialog` and `tauri-plugin-fs` covered everything, registered with a couple of lines in `lib.rs`. That said, building the app at all now requires a Rust toolchain (`cargo`) plus WebKitGTK dev headers on Linux, which is new friction for anyone building from source that didn't exist with the Node-only Electron setup — relevant given the upcoming open-source release.

### Go/no-go recommendation

**Cautiously positive.** Every piece of functionality this spike touched works after fixes, and the one platform we could actually test (Linux) shows no rendering regression versus Electron — the opposite of what was originally worried about. The problems found (pdf-merger-js, pdfkit's font loading, blob-stream's Node deps, fs permission granularity) were all real, but each had a small, well-understood fix, not a dead end. Recommend treating this as encouraging enough to pursue Windows/macOS verification before deciding whether to actually migrate the shipped app.

### Open items

- Windows and macOS rendering/functional verification (tasks 4.1/4.2) — deferred; the user will test these when they have access to that hardware.
- The Rust image-import-as-native-module idea from the original proposal exploration remains explicitly out of scope and untouched.
