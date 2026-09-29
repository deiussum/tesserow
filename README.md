# Tesserow

Mosaic Pattern Maker for Crocheting

Tesserow is a desktop app for designing mosaic crochet patterns. Draw a chart by hand, or import an image and let Tesserow turn it into one, then export a printable PDF with the chart and a row-by-row written pattern.

Tesserow is still early in development, so expect rough edges.

## Download

**[Download the latest release](https://github.com/deiussum/tesserow/releases/latest)**

The [Releases page](https://github.com/deiussum/tesserow/releases) has installers for:

| Platform | Files |
| --- | --- |
| Linux | Flatpak bundle (`.flatpak`), `.deb` (Debian, Ubuntu), `.rpm` (Fedora, openSUSE), AppImage |
| Windows | `.msi` installer, or `-setup.exe` installer |

There's no macOS build yet.

## Installing

### Flatpak

```sh
flatpak install --user Tesserow_<version>_x86_64.flatpak
flatpak run com.deiussum.tesserow
```

The GNOME runtime it needs is installed from Flathub automatically. The Flatpak can read and write files anywhere in your home directory; to use files elsewhere (for example a USB drive under `/media`), grant access with:

```sh
flatpak override --user --filesystem=/media com.deiussum.tesserow
```

### AppImage

Make the file executable (`chmod +x Tesserow_<version>_amd64.AppImage`), then run it. Nothing needs to be installed.

### Windows

The Windows installers are not code-signed, so Windows SmartScreen shows a "Windows protected your PC" warning when you run one. Choose **More info**, then **Run anyway** to install.

## Using Tesserow

### Getting started

The start screen offers three ways in, which are also on the **File** menu:

- **New Mosaic...** creates a blank chart. Enter its width and height in stitches. To add plain border rows, check **Include extra starting row** and enter how many; that many rows of color A are added to both the top and the bottom of the chart.
- **Open...** opens a chart you saved earlier.
- **Import Image...** builds a chart from a picture (see below).

To try things out, open `Resources/Samples/diamond.json` from this repository, a small diamond motif.

### Editing the chart

The chart shows the two yarn colors as white (color A) and grey (color B). Rows are numbered from the bottom and columns from the right, matching the direction you crochet. Hover over a stitch to see its row and column.

Click a stitch to switch its color. Tesserow follows the rules of mosaic crochet, so some stitches can't be changed:

- Stitches on the outer edge of the chart.
- Stitches where the change would produce something you can't crochet, such as stacking contrasting stitches that don't line up with the row below.

When you change a stitch, the stitch above it is marked with an **X**, meaning a double crochet worked down into the row below. Change it back and the X goes away.

### Importing an image

After you choose an image, the Image Preview screen shows it converted to black and white:

- **Threshold** sets how light a pixel has to be to count as white. Move the slider until the preview looks right. If the image is already pure black and white, the slider only has an effect at its extremes.
- **Image Size** sets the chart's width and height in stitches, keeping the image's proportions. Large images are scaled down to fit 300×300 automatically, and going bigger than that isn't recommended. Click **Apply** to preview the new size; otherwise it is applied when you import.
- **Include extra starting row** adds plain border rows, as with a new mosaic.

Click **Import** to create the chart. You can then touch it up by hand. Stitches that break the mosaic rules can't be reproduced, so fine detail from the image may be lost.

### Written pattern

Open **View > Written Pattern**, or click the arrow tab on the right side of the window, to show the pattern as text. Drag the panel's left edge to resize it, and click **Copy** to copy the whole pattern to the clipboard.

Each line gives a row number, the color to work it in, and its stitches from right to left. For example, `Row 3 ColorB    JS,4SC,1DC,3SC,ES,` means: row 3 in color B, a join stitch, 4 single crochet, 1 double crochet, 3 single crochet, and an end stitch.

| Code | Stitch |
| --- | --- |
| `SC` | Single crochet |
| `DC` | Double crochet (the X on the chart) |
| `JS` | Join stitch, which starts the row |
| `ES` | End stitch, which finishes the row |

### Exporting a PDF

**File > Export to PDF...** creates a printable pattern:

- **Include chart** and **Include written pattern** choose what goes in the PDF.
- **Include additional PDF instructions** puts a PDF you choose (for example a cover page or your own instructions) at the start of the export.
- **Page start** sets the first page number of the chart and written pattern. If your extra instructions are 2 pages long, set it to 3.
- **Export file name** is where the PDF is saved.

The status bar at the bottom of the window shows when the export has finished.

### Saving your work

**File > Save** saves the chart to its file, and **Save As...** saves it under a new name. Charts are saved as `.json` files, which you can reopen with **File > Open...**. If you try to close a chart or quit with unsaved changes, Tesserow asks before discarding them.

### Zooming

Use **View > Zoom In** / **Zoom Out** / **Reset Zoom**, the zoom buttons in the status bar, or hold Ctrl and scroll the mouse wheel over the chart. Click the zoom percentage in the status bar to pick a preset from 25% to 400%.

### Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| Ctrl+N | New mosaic |
| Ctrl+O | Open |
| Ctrl+S | Save |
| Ctrl+Shift+S | Save As |
| Ctrl++ / Ctrl+= | Zoom in |
| Ctrl+- | Zoom out |
| Ctrl+0 | Reset zoom |

## Development

### Running the app

This is a Tauri + React desktop application. Building it requires a Rust toolchain (`cargo`) in addition to Node, plus WebKitGTK dev headers on Linux.

To run this:

- Run `npm install` to install all of the dependencies.
- Run `npm start` to run the application.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for branching, pull requests, and releases.

### Building the Flatpak

`npm run flatpak` builds the Flatpak from source and writes the bundle to `flatpak/dist/`. It needs `flatpak` with the Flathub remote added, plus either `flatpak-builder` or the Flathub-packaged builder (`flatpak install flathub org.flatpak.Builder`), and Python 3 to generate the offline dependency lists. The GNOME SDK and the Rust/Node SDK extensions are installed on first run. (The Flathub-packaged builder is sandboxed and can't see `/tmp`, so build from a checkout elsewhere when using it.)

### App icon

The icon is a 16×16 mosaic-chart diamond defined in `Resources/Icon/icon-grid.txt` (`#` = amber, `.` = navy). After editing it, run `npm run icon` to regenerate every icon size and format, and commit the results.

The icon is a stylised mark, not a workable chart. `Resources/Samples/diamond.json` is the same motif redrawn to follow the mosaic crochet rules, and you can open it in Tesserow with File > Open.
