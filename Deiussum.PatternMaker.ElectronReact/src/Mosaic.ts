class Mosaic {
    defaultScale: number = 15;
    scale: number = 15;
    canvas: any = null;
    data: MosaicChart = null;
    hovering: any = null;

    initialize = (width: number, height: number) => {
        this.data = new MosaicChart(width, height);
    }

    load = (data:any) => {
        this.initialize(data.width, data.height);
        this.data.loadData(data);
    }

    setupCanvas = () => {
        this.canvas = document.getElementById('mosaic-canvas');

        this.canvas.width = (this.data.width * this.scale) + (this.scale * 2);
        this.canvas.height = (this.data.height * this.scale) + (this.scale * 2);

        this.canvas.addEventListener('mousemove', (e: any) => {
            const canvasX = e.offsetX;
            const canvasY = e.offsetY;
            const hoverCell = this.data.getCellByCoords(canvasX, canvasY);
            const ctx = this.canvas.getContext('2d');

            if (hoverCell === undefined) return;

            if (hoverCell !== this.hovering && this.hovering !== null) {
                this.hovering.draw(ctx);
            }

            hoverCell.highlight(ctx);
            this.canvas.setAttribute('title', `Row: ${hoverCell.row.rowNumber}, Column: ${hoverCell.columnNumber}`);
            this.hovering = hoverCell;
        });

        this.canvas.addEventListener('click', (e: any) => {
            const canvasX = e.offsetX;
            const canvasY = e.offsetY;
            const clickedCell = this.data.getCellByCoords(canvasX, canvasY);

            if (clickedCell === undefined) return;

            clickedCell.toggleColor();
        });

        this.data.draw();
    }

    draw(zoomLevel: number) {
        this.scale = this.defaultScale * zoomLevel;
        this.setupCanvas();
    }
}

class MosaicChart {
    width: number;
    height: number;
    rows: MosaicRow[];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.rows = [];

        for (let i=0; i<height; i++) {
            this.rows.push(new MosaicRow(height - i, width, (height - i - 1) % 2));
        }
    }
    draw() {
        const ctx = mosaic.canvas.getContext('2d');

        for (let rowIndex = 0; rowIndex < this.height; rowIndex++) {
            for(let colIndex = 0; colIndex< this.width; colIndex++) {
                const row = this.rows[rowIndex];
                const cell = row.cells[colIndex];

                cell.draw(ctx);
            }
        }
    }

    getCellByCoords(x: number, y: number) {
        const rowIndex = Math.floor(y / mosaic.scale) - 1;
        const colIndex = Math.floor(x / mosaic.scale) - 1;

        if (rowIndex < 0 || rowIndex >= this.height || colIndex < 0 || colIndex >= this.width) return undefined;

        const row = this.rows[rowIndex];
        return row.cells[colIndex];
    }

    getCellByChartRowAndCol(row: number, col: number) {
        if (row <= 0 || row > this.height || col <= 0 || col > this.width) return null;

        const rowIndex = this.height - row;
        const colIndex = this.width - col;

        return this.rows[rowIndex].cells[colIndex];
    }

    getCellByRowAndCol(rowIndex: number, colIndex: number) {
        if (rowIndex < 0 || rowIndex >= this.height || colIndex < 0 || colIndex >= this.width) return null;

        return this.rows[rowIndex].cells[colIndex];
    }

    getCellRangeByRowAnddCol(rowStartIndex: number, rowEndIndex: number, colStartIndex: number, colEndIndex: number) {
        let rows = [];

        for(let rowIndex=rowStartIndex; rowIndex<=rowEndIndex; rowIndex++) {
            const cells: any =[];
            rows.push(cells);

            for(let colIndex=colStartIndex; colIndex<=colEndIndex; colIndex++) {
                cells.push(this.getCellByRowAndCol(rowIndex, colIndex));
            }
        }

        return rows;
    }

    getWrittenPattern(column1Length = 16, totalWidth = 80) {
        let pattern = '';
        for (let rowIndex = this.height - 1; rowIndex >=0; rowIndex--) {
            const row = this.rows[rowIndex];

            pattern += row.getWrittenPattern(column1Length, totalWidth);
        }
        return pattern;
    }

    getWrittenPatternLines(column1Length = 16, totalWidth = 80) {
        let pattern = [];
        for (let rowIndex = this.height - 1; rowIndex >=0; rowIndex--) {
            const row = this.rows[rowIndex];

            pattern.push(row.getWrittenPattern(column1Length, totalWidth));
        }
        return pattern;
    }

    getChartPageData(colsPerPage = 43, rowsPerPage = 55) {
        let results = [];
        var colPages = Math.ceil(this.width / colsPerPage);
        var rowPages = Math.ceil(this.height / rowsPerPage);

        for(let rowPage=0; rowPage<rowPages; rowPage++) {
            let rowStart = rowPage * rowsPerPage;
            let rowEnd = Math.min(rowStart + rowsPerPage - 1, this.height);

            for(let colPage=0; colPage<colPages; colPage++) {
                var colStart = colPage * colsPerPage;
                var colEnd = Math.min(colStart + colsPerPage - 1, this.width);

                var page = {
                    rowStartNumber: this.height - rowStart,
                    rowEndNumber: Math.max(this.height - rowEnd, 1),
                    colStartNumber: this.width - colStart,
                    colEndNumber: Math.max(this.width - colEnd, 1),
                    pageCells: this.getCellRangeByRowAnddCol(rowStart, rowEnd, colStart, colEnd)
                };

                results.push(page);
            }
        }

        return results;
    }

    getSaveData() {
        return {
            width: this.width,
            height: this.height,
            rows: this.rows.map((row) => row.getSaveData())
        };
    }

    loadData(data:any) {
        this.width = data.width;
        this.height = data.height;

        for(let row=0;row<data.height;row++)
        {
            this.rows[row].loadData(data.rows[row]);
        }
    }
}

class MosaicRow {
    rowNumber: number;
    cellCount: number;
    color: number;
    cells: MosaicCell[];

    constructor(rowNumber: number, cellCount: number, color: number) {
        this.rowNumber = rowNumber;
        this.cellCount = cellCount;
        this.color = color;
        this.cells = [];

        for(let i=0; i<cellCount; i++) {
            this.cells.push(new MosaicCell(cellCount - i, this, this.color));
        }
        this.cells[cellCount - 1].type = 2;
        this.cells[0].type = 3;
    }

    colorLabel() {
        return this.color == 0 ? "A" : "B";
    }

    getWrittenPattern(column1Length: number = 16, totalWidth: number = 80) {
        let patternLines = [];
        let pattern = `Row ${this.rowNumber} Color${this.colorLabel()}`;

        let spaceCount = column1Length - pattern.length;

        pattern+= ' '.repeat(spaceCount);

        let currentStitch = null;
        let currentCount = 0;
        for(let cellIndex=this.cellCount - 1; cellIndex >= 0; cellIndex--) {
            const cell = this.cells[cellIndex];
            if (currentStitch == cell.stitchTypeWrittenDisplay()) {
                currentCount++;
                continue;
            }

            if (currentCount > 0) {
                if (currentStitch === "JS" || currentStitch === "ES") {
                    pattern += `${currentStitch},`;
                }
                else {
                    pattern += `${currentCount}${currentStitch},`;
                }
            }

            if (pattern.length > totalWidth - 6) {
                patternLines.push(pattern);
                pattern = ' '.repeat(column1Length);
            }

            currentStitch = cell.stitchTypeWrittenDisplay();
            currentCount = 1;
        }
        // Include last set
        if (currentCount > 0) {
            if (currentStitch === "JS" || currentStitch === "ES") {
                pattern += `${currentStitch},`;
            }
            else {
                pattern += `${currentCount}${currentStitch}`;
            }
        }
        patternLines.push(pattern);

        return patternLines.join('\n') + '\n';
    }

    getSaveData() {
        return {
            rowNumber: this.rowNumber,
            cellCount: this.cellCount,
            cells: this.cells.map((cell) => cell.getSaveData())
        };
    }

    loadData(data: any) {
        this.rowNumber = data.rowNumber;
        this.cellCount = data.cellCount;

        for(let col=0;col<data.cellCount;col++)
        {
            this.cells[col].loadData(data.cells[col]);
        }
    }
}

class MosaicCell {
    columnNumber: number;
    row: MosaicRow;
    color: number;
    type: number;

    constructor(columnNumber: number, row: MosaicRow, color: number) {
        this.columnNumber = columnNumber;
        this.row = row;
        this.color = color;
        this.type = 0;
    }

    draw(ctx: any) {
        const x = this.getX();
        const y = this.getY();

        if (!ctx) return;

        ctx.fillStyle = this.color === 0 ? "white" : "grey";
        ctx.strokeStyle = "black";
        ctx.fillRect(x, y, mosaic.scale, mosaic.scale);
        ctx.strokeRect(x, y, mosaic.scale, mosaic.scale);

        if (this.type == 1) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + mosaic.scale, y + mosaic.scale);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + mosaic.scale, y);
            ctx.lineTo(x, y + mosaic.scale);
            ctx.stroke();
        }
    }

    highlight(ctx: any) {
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.getX(), this.getY(), mosaic.scale, mosaic.scale);
    }

    getX() {
        return (mosaic.data.width - this.columnNumber + 1) * mosaic.scale;
    }

    getY() {
        return (mosaic.data.height - this.row.rowNumber + 1) * mosaic.scale;
    }

    getCellAbove() {
        const rowNumber = this.row.rowNumber + 1;

        return mosaic.data.getCellByChartRowAndCol(rowNumber, this.columnNumber)
    }

    getCellBelow() {
        const rowNumber = this.row.rowNumber - 1;

        return mosaic.data.getCellByChartRowAndCol(rowNumber, this.columnNumber)
    }

    isRowColor() {
        return this.color == this.row.color;
    }

    canToggleColor() {
        if (this.row.rowNumber == 1 
            || this.row.rowNumber == mosaic.data.height
            || this.columnNumber == 1
            || this.columnNumber == mosaic.data.width) 
            return false;

        const cellBelow = this.getCellBelow();
        if (cellBelow == null) return false;
        if (this.isRowColor() && cellBelow.color == this.row.color) return false;

        const cellAbove = this.getCellAbove();
        if (this.isRowColor() && cellAbove != null && !cellAbove.isRowColor()) return false;

        return true;
    }

    toggleColor() {
        if (!this.canToggleColor()) return false;

        const ctx = mosaic.canvas ? mosaic.canvas.getContext("2d") : null;
        this.color = (this.color + 1) % 2;

        this.draw(ctx);

        // Get double stitch square
        var cellAbove = this.getCellAbove();
        if (cellAbove != null) {
            cellAbove.type = (cellAbove.type + 1) % 2;
            cellAbove.draw(ctx);
        }

        return true;
    }
    stitchTypeWrittenDisplay() {
        switch(this.type) {
            case 0:  return "SC";
            case 1: return "DC";
            case 2: return "JS";
            case 3: return "ES";
            default: return "??";
        }
    }

    getSaveData() {
        return {
            columnNumber: this.columnNumber,
            color: this.color,
            type: this.type
        };
    }

    loadData(data:any) {
        this.columnNumber = data.columnNumber;
        this.color = data.color;
        this.type = data.type;
    }
}

const mosaic = new Mosaic();
export default mosaic;