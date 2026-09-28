import { describe, test, expect } from 'vitest';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import mosaic from './Mosaic';
import type { MosaicChartSaveData } from './Mosaic';

// Resources/Samples/diamond.json is the app icon's diamond redrawn as a
// workable mosaic chart (the icon itself breaks the mosaic rules along its
// diagonals - see the add-app-icon OpenSpec change). It's built through the
// editor's own toggleColor() so its colours and stitch types are exactly what
// Tesserow would save. Regenerate with `UPDATE_SAMPLES=1 npm test`.

const SAMPLE_PATH = fileURLToPath(new URL('../Resources/Samples/diamond.json', import.meta.url));

// '#' = colour A (the motif), '.' = colour B, top row first. Every vertical run
// of a colour starts and ends on a row of that colour, and the outer ring is
// each row's own colour.
const DIAMOND = [
    '#################',
    '.................',
    '#......###......#',
    '.......#.#.......',
    '#....###.###....#',
    '.....#.....#.....',
    '#..###..#..###..#',
    '...#....#....#...',
    '####..#####..####',
    '...#....#....#...',
    '#..###..#..###..#',
    '.....#.....#.....',
    '#....###.###....#',
    '.......#.#.......',
    '#......###......#',
    '.................',
    '#################',
];

function buildDiamond(): MosaicChartSaveData {
    const size = DIAMOND.length;
    mosaic.initialize(size, size, 0);
    const chart = mosaic.data;

    // Bottom-up, like crocheting it: each toggle only depends on the rows below.
    for (let rowNumber = 1; rowNumber <= size; rowNumber++) {
        const line = DIAMOND[size - rowNumber];
        for (let col = 0; col < size; col++) {
            const cell = chart.getCellByChartRowAndCol(rowNumber, size - col);
            const wanted = line[col] === '#' ? 0 : 1;
            if (cell.color !== wanted && !cell.toggleColor()) {
                throw new Error(`cell at row ${rowNumber}, column ${size - col} can't be toggled`);
            }
        }
    }
    return chart.getSaveData();
}

/** Cells that don't follow the mosaic rules, as "row,column" strings. */
function ruleViolations(data: MosaicChartSaveData): string[] {
    const colorAt = (rowNumber: number, columnNumber: number) =>
        data.rows[data.height - rowNumber].cells[data.width - columnNumber].color;
    const rowColor = (rowNumber: number) => (rowNumber - 1) % 2;
    const violations: string[] = [];

    for (let rowNumber = 1; rowNumber <= data.height; rowNumber++) {
        for (let col = 1; col <= data.width; col++) {
            const color = colorAt(rowNumber, col);
            if (color === rowColor(rowNumber)) continue;

            // A cell showing the other colour is a double crochet into the row
            // below: that cell must be in its own row colour (the same colour),
            // and the cell above must be in its row colour too. Edge cells
            // can't change at all.
            const edge = rowNumber === 1 || rowNumber === data.height || col === 1 || col === data.width;
            const belowOk = !edge && colorAt(rowNumber - 1, col) === rowColor(rowNumber - 1);
            const aboveOk = !edge && colorAt(rowNumber + 1, col) === rowColor(rowNumber + 1);
            if (edge || !belowOk || !aboveOk) violations.push(`${rowNumber},${col}`);
        }
    }
    return violations;
}

describe('diamond sample chart', () => {
    test('matches the chart built through the editor\'s toggle rules', () => {
        const built = buildDiamond();

        if (process.env.UPDATE_SAMPLES || !existsSync(SAMPLE_PATH)) {
            mkdirSync(dirname(SAMPLE_PATH), { recursive: true });
            writeFileSync(SAMPLE_PATH, JSON.stringify(built, null, 2) + '\n');
        }

        const committed = JSON.parse(readFileSync(SAMPLE_PATH, 'utf8'));
        expect(committed).toEqual(built);
    });

    test('obeys the mosaic construction rules', () => {
        const committed: MosaicChartSaveData = JSON.parse(readFileSync(SAMPLE_PATH, 'utf8'));

        expect(committed.width).toBe(DIAMOND.length);
        expect(committed.height).toBe(DIAMOND.length);
        expect(ruleViolations(committed)).toEqual([]);
    });

    test('loads into the editor and produces a written pattern', () => {
        const committed: MosaicChartSaveData = JSON.parse(readFileSync(SAMPLE_PATH, 'utf8'));

        mosaic.load(committed);

        expect(mosaic.data.getWrittenPattern()).toContain('Row 17');
    });
});
