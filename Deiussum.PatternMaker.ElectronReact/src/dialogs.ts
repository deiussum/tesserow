import { dialog } from 'electron';
import fs from 'fs';
import Jimp from 'jimp';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import PDFMerger from 'pdf-merger-js';
import { v4 as uuidv4 } from 'uuid';
import ExportOptions from './ExportOptions';

class Dialogs {
    async getFileName(filters: any, save: boolean) {
        let success = true;
        let result = '';
        if (save === true) {
            const { canceled, filePath } =  await dialog.showSaveDialog({ filters: filters});
            success = !canceled;
            result = filePath;
        }
        else {
             const { canceled, filePaths } = await dialog.showOpenDialog({ filters: filters});
            success = !canceled;
            result = filePaths[0];
        }
        if (!success) return { success: false, error: 'Cancelled' };

        return { success, result };
    }

    async save(data: any) {
        const { canceled, filePath } = await dialog.showSaveDialog({ filters: [ { extensions: ['json'], name: 'JSON Files' }]});
        if (canceled) return { success: false, error: 'Save cancelled' };

        let fileStream = fs.createWriteStream(filePath);

        fileStream.write(JSON.stringify(data, null, 2));
        fileStream.close();
    }

    async open() {
        const { canceled, filePaths } = await dialog.showOpenDialog({ filters: [ {extensions: ['json'], name: 'JSON Files'}]});
        if (canceled) return { success: false, error: 'Open cancelled' };

        const filePath = filePaths[0];
        console.log('File selected:' + filePath);

        const data = fs.readFileSync(filePath).toString();

        return { success: true, data: JSON.parse(data) };
    }

    async import() {
        const { canceled, filePaths } = await dialog.showOpenDialog({ filters: [ {extensions: ['png', 'jpeg', 'jpg', 'gif'], name: 'Image Files'}]});
        if (canceled) return { success: false, error: 'Import cancelled' };

        const filePath = filePaths[0];

        let image = await Jimp.read(filePath);
        const imageThreshold = 300;
        const w = image.bitmap.width;
        const h = image.bitmap.height;

        if (w > imageThreshold || h > imageThreshold) 
        {
            const newWidth = w > h ? imageThreshold : imageThreshold * w / h;
            const newHeight = h > w ? imageThreshold : imageThreshold * h / w;

            console.log(`Resizing ${w}, ${h} => ${newWidth}, ${newHeight}`);

            image.resize(newWidth, newHeight);
        }

        return this.getImageData(image, filePath);
    }

    async resize(filePath: string, width: number, height: number) {
        console.log(`Resizing file to ${width}x${height}: ${filePath}`)
        let image = await Jimp.read(filePath);

        image.resize(width, height);

        return this.getImageData(image, filePath);
    }

    getImageData(image: Jimp, filePath: string) {
        image.greyscale();
        var data:any = {
            success: true,
            filePath: filePath,
            width: image.bitmap.width,
            height: image.bitmap.height,
            data: [],
        }

        console.log('Gathering data...');
        for(let row=0; row<data.height; row++) {
            var newRow: any = [];
            data.data.push(newRow);

            for(let col=0; col<data.width; col++) {
                const rgba = Jimp.intToRGBA(image.getPixelColor(col, row));
                const inverseAlpha = 1.0 - (rgba.a / 255.0);
                const color = rgba.r + ((255 - rgba.r) * inverseAlpha);
                newRow.push(color);
            }
        }

        console.log('Data built.');
        return data;
    }

    async export(data: any, options: ExportOptions) {
        const filePath = options.exportFileName;
        const exportFilePath = options.additionalPdfChecked ? this.#tempFilePath(filePath) : filePath;

        const doc = new PDFDocument({ bufferPages: true });
        const stream = fs.createWriteStream(exportFilePath);
        doc.pipe(stream);

        if (options.includeChart) {
            for(let pageIndex=0; pageIndex<data.chartPages.length; pageIndex++) {
                this.drawChartPage(doc, data.chartPages[pageIndex]);
            }
        }

        if (options.includeWrittenPattern) {
            for(let i=0; i<data.writtenPatternLines.length; i++) {
                doc.font('Courier')
                .fontSize(12)
                .text(data.writtenPatternLines[i]);
                doc.moveDown(0.5);
            }
        }

        this.addPdfFooterToAllPages(doc, Number(options.pageStart));

        stream.on('finish', async () => {
            if (options.additionalPdfChecked) {
                const merger = new PDFMerger();

                await merger.add(options.additionalPdfFileName);
                await merger.add(exportFilePath);
                await merger.save(filePath);
                
                setTimeout(() => {
                    fs.unlinkSync(exportFilePath);
                }, 1000);
            }
        });
        doc.end();

    }

    drawChartPage(doc: any, page: any) {
        const squareSize = 12;
        for(let rowIndex=0; rowIndex<page.pageCells.length; rowIndex++) {
            let row = page.pageCells[rowIndex];
            for(let colIndex=0; colIndex<row.length; colIndex++) {
                let col = row[colIndex];

                if (!col) continue;

                let x = (colIndex + 3) * squareSize;
                let y = (rowIndex + 3) * squareSize;
                let color = col.color == 0 ? 'white' : 'grey';

                doc.rect(x, y, squareSize, squareSize)
                   .fillAndStroke(color, 'black');

                if (col.type == 1) {
                    doc.moveTo(x, y)
                       .lineTo(x + squareSize, y + squareSize)
                       .stroke();
                    doc.moveTo(x + squareSize, y)
                       .lineTo(x, y + squareSize)
                       .stroke();
                }
            }
        }

        let origLeft = doc.page.margins.left;
        let origTop = doc.page.margins.top;
        doc.page.margins.left = 0;
        doc.page.margins.top = 0;
        for(let rowLabel=page.rowStartNumber; rowLabel>=page.rowEndNumber; rowLabel--) {
            let x1 = 2 * squareSize;
            let x2 = (page.colStartNumber - page.colEndNumber + 4.1) * squareSize;
            let y = (page.rowStartNumber - rowLabel + 3.4) * squareSize; 

            const label = ('   ' + rowLabel).slice(-3);
            doc.fillColor('black')
               .strokeColor('black')
               .fontSize(6)
               .text(label, x1, y)
               .text(label, x2, y);

        }
        
        for(let colLabel=page.colStartNumber; colLabel>=page.colEndNumber; colLabel--) {
            let x = (page.colStartNumber - colLabel + 3.1) * squareSize; 
            let y1 = 2.4 * squareSize;
            let y2 = (page.rowStartNumber - page.rowEndNumber + 4.4) * squareSize;

            const label = ('   ' + colLabel).slice(-3);
            doc.fillColor('black')
               .strokeColor('black')
               .fontSize(6)
               .text(label, x, y1)
               .text(label, x, y2);
        }
        doc.page.margins.left = origLeft;
        doc.page.margins.top = origTop;

        doc.addPage();
    }

    addPdfFooterToAllPages(doc: any, startPage: number) {
        let pages = doc.bufferedPageRange();
        for(let i=0; i<pages.count; i++) {
            doc.switchToPage(i);
            this.addPdfFooter(doc, i + startPage, pages.count + startPage - 1);
        }
    }

    addPdfFooter(doc: any, pageNumber: number, totalPages: number) {
        let bottom = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        doc.fillColor('black')
           .strokeColor('black')
           .fontSize(8)
           .text('Page ' + pageNumber + ' of ' + totalPages
                , 0
                , doc.page.height - (bottom/2)
                , { align: 'center'});
        doc.page.margins.bottom = bottom;
    }

    #tempFilePath(filePath: string) {
        const baseName = path.basename(filePath, '.pdf');
        const id = uuidv4().replace('-', '');
        const tempName = baseName + id + '.pdf';
        const dirName = path.dirname(filePath);
        const fullTempPath = path.join(dirName, tempName);

        return fullTempPath;
    }
}

const dialogs = new Dialogs();

export default dialogs;
