import { describe, test, expect } from 'vitest';
import mosaic from './Mosaic';

// `MosaicChart`/`MosaicRow`/`MosaicCell` are not exported - every test drives
// them through the `mosaic` singleton via `mosaic.initialize(...)` and reads
// `mosaic.data`, per design.md under add-vitest-domain-model-tests.

describe('row and column numbering', () => {
    test('numbers the top row equal to the chart height and the bottom row 1', () => {
        mosaic.initialize(5, 4, 0);
        const chart = mosaic.data;

        expect(chart.rows[0].rowNumber).toBe(4);
        expect(chart.rows[chart.rows.length - 1].rowNumber).toBe(1);

        const topCell = chart.getCellByChartRowAndCol(4, 1);
        const bottomCell = chart.getCellByChartRowAndCol(1, 1);
        expect(topCell.getY()).toBeLessThan(bottomCell.getY());
    });

    test('numbers the rightmost cell 1 and the leftmost cell equal to the chart width', () => {
        mosaic.initialize(5, 4, 0);
        const chart = mosaic.data;

        const rightmost = chart.getCellByChartRowAndCol(4, 1);
        const leftmost = chart.getCellByChartRowAndCol(4, 5);
        expect(rightmost.getX()).toBeGreaterThan(leftmost.getX());
    });

    test('renumbers after adding extra rows, keeping row 1 at the bottom', () => {
        mosaic.initialize(5, 4, 2);
        const chart = mosaic.data;

        expect(chart.height).toBe(8);
        const top = chart.getCellByChartRowAndCol(8, 1);
        const bottom = chart.getCellByChartRowAndCol(1, 1);
        expect(top.getY()).toBeLessThan(bottom.getY());
    });
});

describe('alternating base color and locked edge cells', () => {
    test('adjacent rows alternate color when there are no extra rows', () => {
        mosaic.initialize(5, 6, 0);
        const chart = mosaic.data;

        for (let i = 0; i < chart.rows.length - 1; i++) {
            expect(chart.rows[i].color).not.toBe(chart.rows[i + 1].color);
        }
    });

    test('extra border rows share one fixed color, which can match the adjacent core row', () => {
        mosaic.initialize(5, 5, 1);
        const chart = mosaic.data;
        const topExtra = chart.rows[0];
        const adjacentCore = chart.rows[1];
        const bottomExtra = chart.rows[chart.rows.length - 1];

        expect(topExtra.color).toBe(0);
        expect(bottomExtra.color).toBe(0);
        expect(adjacentCore.color).toBe(topExtra.color);
    });

    test('the first and last cell of every row equal that row\'s base color', () => {
        mosaic.initialize(6, 5, 0);
        const chart = mosaic.data;

        for (const row of chart.rows) {
            expect(row.cells[0].color).toBe(row.color);
            expect(row.cells[row.cells.length - 1].color).toBe(row.color);
        }
    });
});

describe('cell color toggling', () => {
    test('cells on the outer edge cannot be toggled', () => {
        mosaic.initialize(6, 5, 0);
        const chart = mosaic.data;

        const edgeCells = [
            chart.rows[0].cells[2],
            chart.rows[chart.rows.length - 1].cells[2],
            chart.rows[2].cells[0],
            chart.rows[2].cells[chart.rows[2].cells.length - 1],
        ];

        for (const cell of edgeCells) {
            const before = cell.color;
            expect(cell.toggleColor()).toBe(false);
            expect(cell.color).toBe(before);
        }
    });

    test('toggle rejected when the cell and the cell below it already match the row color', () => {
        mosaic.initialize(6, 6, 0);
        const chart = mosaic.data;
        const cell = chart.getCellByChartRowAndCol(4, 3);
        const below = cell.getCellBelow();

        expect(cell.color).toBe(cell.row.color);
        expect(below.canToggleColor()).toBe(true);

        below.toggleColor();
        expect(below.color).toBe(cell.row.color);

        const before = cell.color;
        expect(cell.toggleColor()).toBe(false);
        expect(cell.color).toBe(before);
    });

    test('a valid toggle flips the cell color and the stitch type of the cell above', () => {
        mosaic.initialize(6, 6, 0);
        const chart = mosaic.data;
        const cell = chart.getCellByChartRowAndCol(3, 3);
        const above = cell.getCellAbove();

        expect(cell.canToggleColor()).toBe(true);
        const originalColor = cell.color;
        const originalAboveType = above.type;

        expect(cell.toggleColor()).toBe(true);
        expect(cell.color).toBe((originalColor + 1) % 2);
        expect(above.type).toBe((originalAboveType + 1) % 2);
    });
});

describe('written pattern text', () => {
    test('lists rows starting at row 1 and ending at the top row', () => {
        mosaic.initialize(4, 3, 0);
        const chart = mosaic.data;
        const lines = chart.getWrittenPatternLines();

        expect(lines[0].startsWith('Row 1 Color')).toBe(true);
        expect(lines[lines.length - 1].startsWith(`Row ${chart.height} Color`)).toBe(true);
    });

    test('collapses a run of consecutive same-type stitches into one count-plus-type entry', () => {
        mosaic.initialize(6, 3, 0);
        const chart = mosaic.data;
        const lines = chart.getWrittenPatternLines();

        expect(lines.every((line) => line.includes('4SC'))).toBe(true);
    });

    test('renders join/end stitches without a numeric run-length prefix', () => {
        mosaic.initialize(6, 3, 0);
        const chart = mosaic.data;
        const lines = chart.getWrittenPatternLines();

        expect(lines.every((line) => line.includes('JS,') && line.includes('ES'))).toBe(true);
        expect(lines.every((line) => !line.includes('1JS') && !line.includes('1ES'))).toBe(true);
    });

    test('wraps a row whose text exceeds the configured line width onto an indented continuation line', () => {
        mosaic.initialize(5, 1, 0);
        const chart = mosaic.data;
        const [line] = chart.getWrittenPatternLines(16, 20);
        const segments = line.split('\n').filter(Boolean);

        expect(segments.length).toBeGreaterThan(1);
        expect(segments[1].startsWith(' '.repeat(16))).toBe(true);
    });
});

describe('unsaved-changes tracking', () => {
    test('a successful toggle marks the chart dirty', () => {
        mosaic.initialize(6, 6, 0);
        const cell = mosaic.data.getCellByChartRowAndCol(3, 3);

        expect(mosaic.isDirty).toBe(false);
        expect(cell.toggleColor()).toBe(true);
        expect(mosaic.isDirty).toBe(true);
    });

    test('a rejected toggle leaves the dirty state unchanged', () => {
        mosaic.initialize(6, 6, 0);
        const edgeCell = mosaic.data.rows[0].cells[2];

        expect(mosaic.isDirty).toBe(false);
        expect(edgeCell.toggleColor()).toBe(false);
        expect(mosaic.isDirty).toBe(false);
    });

    test('initializing a chart clears the dirty state', () => {
        mosaic.initialize(6, 6, 0);
        mosaic.data.getCellByChartRowAndCol(3, 3).toggleColor();
        expect(mosaic.isDirty).toBe(true);

        mosaic.initialize(6, 6, 0);
        expect(mosaic.isDirty).toBe(false);
    });

    test('loading a chart clears the dirty state', () => {
        mosaic.initialize(6, 6, 0);
        const saveData = mosaic.data.getSaveData();
        mosaic.data.getCellByChartRowAndCol(3, 3).toggleColor();
        expect(mosaic.isDirty).toBe(true);

        mosaic.load(saveData);
        expect(mosaic.isDirty).toBe(false);
    });
});

describe('save/load round trip', () => {
    test('loading saved data into a fresh chart of the same size reproduces every cell', () => {
        mosaic.initialize(6, 6, 0);
        const originalChart = mosaic.data;
        originalChart.getCellByChartRowAndCol(3, 3).toggleColor();

        const before = originalChart.rows.map((row) => row.cells.map((cell) => ({ color: cell.color, type: cell.type })));
        const saveData = originalChart.getSaveData();

        mosaic.initialize(6, 6, 0);
        mosaic.data.loadData(saveData);

        const after = mosaic.data.rows.map((row) => row.cells.map((cell) => ({ color: cell.color, type: cell.type })));
        expect(after).toEqual(before);
    });
});
