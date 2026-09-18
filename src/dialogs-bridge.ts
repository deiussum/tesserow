/**
 * Installs window.dialogs, backed by Tauri's dialog/fs plugins. Consumed by
 * app.tsx, MosaicEditor.tsx, and FileSelector.tsx.
 */
import { open as openDialog, save as saveDialog } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile, readFile, writeFile } from '@tauri-apps/plugin-fs';
import Jimp from 'jimp';
// pdfkit's default (Node) entry reads its base-14 font metrics via `fs`, which
// doesn't exist in the webview. The standalone build embeds fonts and browser
// shims for stream/fs/zlib instead - see design.md's PDF export decision.
// @ts-ignore - no type declarations ship for the standalone entry point
import PDFDocument from 'pdfkit/js/pdfkit.standalone';
import blobStream from 'blob-stream';
import { PDFDocument as PdfLibDocument } from 'pdf-lib';
import ExportOptions from './ExportOptions';

function toTauriFilters(filters: any[]) {
    return (filters || []).map((f: any) => ({ name: f.name, extensions: f.extensions }));
}

async function getFileName(filters: any, save: boolean) {
    const tauriFilters = toTauriFilters(filters);
    const result = save
        ? await saveDialog({ filters: tauriFilters })
        : await openDialog({ filters: tauriFilters, multiple: false });

    if (!result) return { success: false, error: 'Cancelled' };
    return { success: true, result };
}

async function save(data: any) {
    const filePath = await saveDialog({ filters: [{ extensions: ['json'], name: 'JSON Files' }] });
    if (!filePath) return { success: false, error: 'Save cancelled' };

    await writeTextFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
}

async function open() {
    const filePath = await openDialog({ filters: [{ extensions: ['json'], name: 'JSON Files' }], multiple: false });
    if (!filePath) return { success: false, error: 'Open cancelled' };

    const text = await readTextFile(filePath as string);
    return { success: true, data: JSON.parse(text) };
}

async function loadJimpImage(filePath: string) {
    const bytes = await readFile(filePath);
    return await Jimp.read(Buffer.from(bytes));
}

function getImageData(image: any, filePath: string) {
    image.greyscale();
    const data: any = {
        success: true,
        filePath,
        width: image.bitmap.width,
        height: image.bitmap.height,
        data: [],
    };

    for (let row = 0; row < data.height; row++) {
        const newRow: any = [];
        data.data.push(newRow);

        for (let col = 0; col < data.width; col++) {
            const rgba = Jimp.intToRGBA(image.getPixelColor(col, row));
            const inverseAlpha = 1.0 - rgba.a / 255.0;
            const color = rgba.r + (255 - rgba.r) * inverseAlpha;
            newRow.push(color);
        }
    }

    return data;
}

async function importImage() {
    const filePath = await openDialog({
        filters: [{ extensions: ['png', 'jpeg', 'jpg', 'gif'], name: 'Image Files' }],
        multiple: false,
    });
    if (!filePath) return { success: false, error: 'Import cancelled' };

    const image = await loadJimpImage(filePath as string);
    const imageThreshold = 300;
    const w = image.bitmap.width;
    const h = image.bitmap.height;

    if (w > imageThreshold || h > imageThreshold) {
        const newWidth = w > h ? imageThreshold : (imageThreshold * w) / h;
        const newHeight = h > w ? imageThreshold : (imageThreshold * h) / w;
        image.resize(newWidth, newHeight);
    }

    return getImageData(image, filePath as string);
}

async function resize(filePath: string, width: number, height: number) {
    const image = await loadJimpImage(filePath);
    image.resize(width, height);
    return getImageData(image, filePath);
}

function drawChartPage(doc: any, page: any) {
    const squareSize = 12;
    for (let rowIndex = 0; rowIndex < page.pageCells.length; rowIndex++) {
        const row = page.pageCells[rowIndex];
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
            const col = row[colIndex];
            if (!col) continue;

            const x = (colIndex + 3) * squareSize;
            const y = (rowIndex + 3) * squareSize;
            const color = col.color == 0 ? 'white' : 'grey';

            doc.rect(x, y, squareSize, squareSize).fillAndStroke(color, 'black');

            if (col.type == 1) {
                doc.moveTo(x, y).lineTo(x + squareSize, y + squareSize).stroke();
                doc.moveTo(x + squareSize, y).lineTo(x, y + squareSize).stroke();
            }
        }
    }

    const origLeft = doc.page.margins.left;
    const origTop = doc.page.margins.top;
    doc.page.margins.left = 0;
    doc.page.margins.top = 0;
    for (let rowLabel = page.rowStartNumber; rowLabel >= page.rowEndNumber; rowLabel--) {
        const x1 = 2 * squareSize;
        const x2 = (page.colStartNumber - page.colEndNumber + 4.1) * squareSize;
        const y = (page.rowStartNumber - rowLabel + 3.4) * squareSize;

        const label = ('   ' + rowLabel).slice(-3);
        doc.fillColor('black').strokeColor('black').fontSize(6).text(label, x1, y).text(label, x2, y);
    }

    for (let colLabel = page.colStartNumber; colLabel >= page.colEndNumber; colLabel--) {
        const x = (page.colStartNumber - colLabel + 3.1) * squareSize;
        const y1 = 2.4 * squareSize;
        const y2 = (page.rowStartNumber - page.rowEndNumber + 4.4) * squareSize;

        const label = ('   ' + colLabel).slice(-3);
        doc.fillColor('black').strokeColor('black').fontSize(6).text(label, x, y1).text(label, x, y2);
    }
    doc.page.margins.left = origLeft;
    doc.page.margins.top = origTop;

    doc.addPage();
}

function addPdfFooter(doc: any, pageNumber: number, totalPages: number) {
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.fillColor('black')
        .strokeColor('black')
        .fontSize(8)
        .text('Page ' + pageNumber + ' of ' + totalPages, 0, doc.page.height - bottom / 2, { align: 'center' });
    doc.page.margins.bottom = bottom;
}

function addPdfFooterToAllPages(doc: any, startPage: number) {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        addPdfFooter(doc, i + startPage, pages.count + startPage - 1);
    }
}

async function renderPdfBytes(data: any, options: ExportOptions): Promise<Uint8Array> {
    const doc = new PDFDocument({ bufferPages: true });
    const stream = doc.pipe(blobStream());

    if (options.includeChart) {
        for (let pageIndex = 0; pageIndex < data.chartPages.length; pageIndex++) {
            drawChartPage(doc, data.chartPages[pageIndex]);
        }
    }

    if (options.includeWrittenPattern) {
        for (let i = 0; i < data.writtenPatternLines.length; i++) {
            doc.font('Courier').fontSize(12).text(data.writtenPatternLines[i]);
            doc.moveDown(0.5);
        }
    }

    addPdfFooterToAllPages(doc, Number(options.pageStart));

    const blob: Blob = await new Promise((resolve) => {
        stream.on('finish', () => resolve(stream.toBlob('application/pdf')));
        doc.end();
    });

    return new Uint8Array(await blob.arrayBuffer());
}

async function exportPdf(data: any, options: ExportOptions) {
    const generatedBytes = await renderPdfBytes(data, options);

    if (!options.additionalPdfChecked) {
        await writeFile(options.exportFileName, generatedBytes);
        return { success: true };
    }

    // pdf-merger-js imports `fs/promises` at module load, which doesn't exist
    // in the webview - merge directly via pdf-lib instead (see design.md).
    const coverBytes = await readFile(options.additionalPdfFileName);
    const merged = await PdfLibDocument.create();

    const coverDoc = await PdfLibDocument.load(coverBytes);
    const coverPages = await merged.copyPages(coverDoc, coverDoc.getPageIndices());
    coverPages.forEach((p) => merged.addPage(p));

    const generatedDoc = await PdfLibDocument.load(generatedBytes);
    const generatedPages = await merged.copyPages(generatedDoc, generatedDoc.getPageIndices());
    generatedPages.forEach((p) => merged.addPage(p));

    const mergedBytes = await merged.save();
    await writeFile(options.exportFileName, mergedBytes);
    return { success: true };
}

(window as any).dialogs = {
    getFileName,
    save,
    open,
    import: importImage,
    resize,
    export: exportPdf,
};
