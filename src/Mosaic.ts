export interface MosaicCellSaveData {
    columnNumber: number;
    color: number;
    type: number;
}

export interface MosaicRowSaveData {
    rowNumber: number;
    cellCount: number;
    cells: MosaicCellSaveData[];
}

export interface MosaicChartSaveData {
    width: number;
    height: number;
    extraRows: number;
    rows: MosaicRowSaveData[];
}

export interface ChartPageData {
    rowStartNumber: number;
    rowEndNumber: number;
    colStartNumber: number;
    colEndNumber: number;
    pageCells: (MosaicCell | null)[][];
}

class Mosaic {
    defaultScale: number = 15;
    scale: number = 15;
    canvas: HTMLCanvasElement = null;
    data: MosaicChart = null;
    hovering: MosaicCell = null;
    #eventListenersSet: boolean = false;

    initialize = (width: number, height: number, extraRows: number) => {
        this.data = new MosaicChart(width, height);

        if (extraRows > 0) this.data.addExtraRows(extraRows);
    }

    load = (data: MosaicChartSaveData) => {
        this.initialize(data.width, data.height, 0);
        this.data.loadData(data);
    }

    setupCanvas = () => {
        this.canvas = document.getElementById('mosaic-canvas') as HTMLCanvasElement;

        this.canvas.width = (this.data.width * this.scale) + (this.scale * 2);
        this.canvas.height = (this.data.height * this.scale) + (this.scale * 2);

        this.#setupEventListeners();

        this.data.draw();
    }

    draw(zoomLevel: number) {
        this.scale = this.defaultScale * zoomLevel;
        this.setupCanvas();
    }

    #setupEventListeners() {
        if (this.#eventListenersSet) return;
        const mouseMove = (e: MouseEvent) => {
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
        };
        this.canvas.addEventListener('mousemove', mouseMove);

        const canvasClicked = (e: MouseEvent) => {
            const canvasX = e.offsetX;
            const canvasY = e.offsetY;
            const clickedCell = this.data.getCellByCoords(canvasX, canvasY);

            if (clickedCell === undefined) return;

            clickedCell.toggleColor();
        };
        this.canvas.addEventListener('click', canvasClicked);

        this.#eventListenersSet = true;
    }
}

class MosaicChart {
    width: number;
    height: number;
    extraRows: number;
    rows: MosaicRow[];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.rows = [];

        for (let i=0; i<height; i++) {
            this.rows.push(new MosaicRow(height - i, width, (height - i - 1) % 2));
        }
    }

    addExtraRows(count: number) {
        for(let i = 0; i < count; i++) {
            const bottomRow = new MosaicRow(count - i, this.width, 0);
            const topRow = new MosaicRow(this.height + i, this.width, 0);

            this.rows.push(topRow);
            this.rows.splice(0, 0, bottomRow);
        }

        this.height += count * 2;
        this.rows.forEach((row, index) => {
            row.updateRowNumber(this.height - index);
        });

        this.extraRows = count;
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
        const rows: (MosaicCell | null)[][] = [];

        for(let rowIndex=rowStartIndex; rowIndex<=rowEndIndex; rowIndex++) {
            const cells: (MosaicCell | null)[] = [];
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
            if (!row) continue; // Why is this bad?

            pattern += row.getWrittenPattern(column1Length, totalWidth);
        }
        return pattern;
    }

    getWrittenPatternLines(column1Length = 16, totalWidth = 80) {
        const pattern = [];
        for (let rowIndex = this.height - 1; rowIndex >=0; rowIndex--) {
            const row = this.rows[rowIndex];

            pattern.push(row.getWrittenPattern(column1Length, totalWidth));
        }
        return pattern;
    }

    getChartPageData(colsPerPage = 43, rowsPerPage = 55): ChartPageData[] {
        const results: ChartPageData[] = [];
        const colPages = Math.ceil(this.width / colsPerPage);
        const rowPages = Math.ceil(this.height / rowsPerPage);

        for(let rowPage=0; rowPage<rowPages; rowPage++) {
            const rowStart = rowPage * rowsPerPage;
            const rowEnd = Math.min(rowStart + rowsPerPage - 1, this.height);

            for(let colPage=0; colPage<colPages; colPage++) {
                const colStart = colPage * colsPerPage;
                const colEnd = Math.min(colStart + colsPerPage - 1, this.width);

                const page = {
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
            extraRows: this.extraRows,
            rows: this.rows.map((row) => row.getSaveData())
        };
    }

    loadData(data: MosaicChartSaveData) {
        this.width = data.width;
        this.height = data.height;
        this.extraRows = data.extraRows;

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
        const patternLines = [];
        let pattern = `Row ${this.rowNumber} Color${this.colorLabel()}`;

        const spaceCount = column1Length - pattern.length;

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

    loadData(data: MosaicRowSaveData) {
        this.rowNumber = data.rowNumber;
        this.cellCount = data.cellCount;

        for(let col=0;col<data.cellCount;col++)
        {
            this.cells[col].loadData(data.cells[col]);
        }
    }

    updateRowNumber(newRow: number) {
        this.rowNumber = newRow;
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

    draw(ctx: CanvasRenderingContext2D | null) {
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

    highlight(ctx: CanvasRenderingContext2D) {
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
        const cellAbove = this.getCellAbove();
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

    loadData(data: MosaicCellSaveData) {
        this.columnNumber = data.columnNumber;
        this.color = data.color;
        this.type = data.type;
    }
}

const mosaic = new Mosaic();
export default mosaic;