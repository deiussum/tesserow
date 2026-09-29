// @vitest-environment jsdom
import { describe, test, expect } from 'vitest';
import mosaic from './Mosaic';

// MosaicEditor mounts a brand-new <canvas id="mosaic-canvas"> element every
// time the editor opens (e.g. Close, then Create/Open/Import again).
// setupCanvas() used to guard listener attachment with a one-time boolean,
// so only the very first canvas in the app's lifetime ever got click/hover
// listeners - clicks on every canvas after that silently did nothing.
function clickCanvas(canvas: HTMLCanvasElement, x: number, y: number) {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'offsetX', { get: () => x });
    Object.defineProperty(event, 'offsetY', { get: () => y });
    canvas.dispatchEvent(event);
}

describe('canvas click listeners are reattached to a fresh canvas element', () => {
    test('clicking still toggles cells after Close (a new canvas) and reopening', () => {
        document.body.innerHTML = '<canvas id="mosaic-canvas"></canvas>';
        mosaic.initialize(6, 6, 0);
        mosaic.setupCanvas();

        const firstCanvas = document.getElementById('mosaic-canvas') as HTMLCanvasElement;
        const firstCell = mosaic.data.getCellByChartRowAndCol(3, 3);
        const firstOriginalColor = firstCell.color;

        clickCanvas(firstCanvas, firstCell.getX() + 1, firstCell.getY() + 1);
        expect(firstCell.color).toBe((firstOriginalColor + 1) % 2);

        // Simulate Close -> Create/Open/Import again: a fresh <canvas> element,
        // same id, distinct DOM node.
        document.body.innerHTML = '<canvas id="mosaic-canvas"></canvas>';
        mosaic.initialize(6, 6, 0);
        mosaic.setupCanvas();

        const secondCanvas = document.getElementById('mosaic-canvas') as HTMLCanvasElement;
        expect(secondCanvas).not.toBe(firstCanvas);

        const secondCell = mosaic.data.getCellByChartRowAndCol(3, 3);
        const secondOriginalColor = secondCell.color;

        clickCanvas(secondCanvas, secondCell.getX() + 1, secondCell.getY() + 1);
        expect(secondCell.color).toBe((secondOriginalColor + 1) % 2);
    });
});
