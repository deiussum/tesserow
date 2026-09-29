// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WrittenPatternDialog, { PATTERN_PANEL_MIN_WIDTH, PATTERN_PANEL_MAX_WIDTH } from './WrittenPatternDialog';
import mosaic from './Mosaic';

// jsdom has no layout engine, so scroll position/visibility can't be measured
// geometrically - the Copy-stays-visible guarantee is instead verified
// structurally: Copy must live outside the pattern text's scrollable
// container, which is what actually keeps it in view in a real browser.
describe('WrittenPatternDialog', () => {
    beforeEach(() => {
        mosaic.initialize(10, 100, 0);
    });

    test('Copy button sits outside the scrollable pattern-text area', () => {
        const { container } = render(<WrittenPatternDialog width={360} onResize={() => {}} />);

        const copyButton = screen.getByRole('button', { name: 'Copy' });
        const scrollArea = container.querySelector('#written-pattern-text')?.parentElement;

        expect(scrollArea).not.toBeNull();
        expect(scrollArea?.contains(copyButton)).toBe(false);
        expect(copyButton).toBeVisible();
        expect(copyButton).toBeEnabled();
    });

    test('clicking Copy invokes the clipboard copy command', () => {
        // jsdom doesn't implement document.execCommand at all (not even a
        // stub), so there's no existing method for vi.spyOn to wrap - assign
        // one directly instead.
        const execCommand = vi.fn().mockReturnValue(true);
        document.execCommand = execCommand;

        render(<WrittenPatternDialog width={360} onResize={() => {}} />);
        fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

        expect(execCommand).toHaveBeenCalledWith('copy');
    });

    test('dragging the resize handle reports a clamped width via onResize', () => {
        const onResize = vi.fn();
        render(<WrittenPatternDialog width={360} onResize={onResize} />);

        const handle = screen.getByTestId('pattern-panel-resize-handle');

        fireEvent.mouseDown(handle, { clientX: 500 });

        // Dragging left (smaller clientX) widens the panel.
        fireEvent.mouseMove(window, { clientX: 400 });
        expect(onResize).toHaveBeenLastCalledWith(460);

        // Over-dragging past the max clamps instead of exceeding it.
        fireEvent.mouseMove(window, { clientX: 100 });
        expect(onResize).toHaveBeenLastCalledWith(PATTERN_PANEL_MAX_WIDTH);

        // Over-dragging past the min (from the same mousedown) clamps too.
        fireEvent.mouseMove(window, { clientX: 900 });
        expect(onResize).toHaveBeenLastCalledWith(PATTERN_PANEL_MIN_WIDTH);

        fireEvent.mouseUp(window);
    });
});
