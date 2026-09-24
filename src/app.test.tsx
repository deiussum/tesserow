// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from './app';
import mosaic from './Mosaic';
import type { DialogsApi } from './dialogs-bridge';

// app.tsx talks to Tauri's window API on mount (the onCloseRequested
// listener) - stub it out so rendering App doesn't hit the real (absent in
// jsdom) __TAURI_INTERNALS__ bridge.
vi.mock('@tauri-apps/api/window', () => ({
    getCurrentWindow: () => ({
        close: vi.fn(),
        destroy: vi.fn(),
        onCloseRequested: vi.fn().mockResolvedValue(() => {}),
    }),
}));

const dialogsStub: DialogsApi = {
    getFileName: vi.fn(),
    save: vi.fn().mockResolvedValue({ success: true }),
    open: vi.fn().mockResolvedValue({ success: false, error: 'not used in this test' }),
    import: vi.fn().mockResolvedValue({ success: false, error: 'not used in this test' }),
    resize: vi.fn(),
    export: vi.fn(),
};

describe('File > New discard-confirmation flow', () => {
    beforeEach(() => {
        mosaic.initialize(6, 6, 0);
        window.dialogs = dialogsStub;
    });

    test('with unsaved changes, shows the discard dialog and blocks New until confirmed', async () => {
        mosaic.data.getCellByChartRowAndCol(3, 3).toggleColor();
        expect(mosaic.isDirty).toBe(true);

        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /New/ }));

        expect(await screen.findByText('Discard unsaved changes?')).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'New Mosaic' })).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Discard' }));

        expect(await screen.findByRole('heading', { name: 'New Mosaic' })).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument());
    });

    test('cancelling the discard dialog leaves the chart open and untouched', async () => {
        mosaic.data.getCellByChartRowAndCol(3, 3).toggleColor();

        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /New/ }));
        fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

        await waitFor(() => expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument());
        expect(screen.queryByRole('heading', { name: 'New Mosaic' })).not.toBeInTheDocument();
        expect(mosaic.isDirty).toBe(true);
    });

    test('with no unsaved changes, New proceeds immediately without a dialog', async () => {
        expect(mosaic.isDirty).toBe(false);

        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /New/ }));

        expect(await screen.findByRole('heading', { name: 'New Mosaic' })).toBeInTheDocument();
        expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument();
    });

    test('New is available (not blocked) even while a mosaic is already open', async () => {
        window.dialogs = {
            ...dialogsStub,
            open: vi.fn().mockResolvedValue({ success: true, data: mosaic.data.getSaveData() }),
        };
        render(<App />);

        // Reach the editor first (mosaicOpen: true), same as the Close tests below.
        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /Open/ }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'View' })).not.toBeDisabled());
        expect(mosaic.isDirty).toBe(false);

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /New/ }));

        // Not dirty, so New proceeds immediately - no discard prompt needed,
        // and critically, the item was clickable at all (regression: it used
        // to be disabled whenever a mosaic was open).
        expect(await screen.findByRole('heading', { name: 'New Mosaic' })).toBeInTheDocument();
        expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument();
    });

    test('New while a mosaic is open and dirty still goes through the discard-confirmation dialog', async () => {
        window.dialogs = {
            ...dialogsStub,
            open: vi.fn().mockResolvedValue({ success: true, data: mosaic.data.getSaveData() }),
        };
        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /Open/ }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'View' })).not.toBeDisabled());

        mosaic.data.getCellByChartRowAndCol(3, 3).toggleColor();
        expect(mosaic.isDirty).toBe(true);

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /New/ }));

        expect(await screen.findByText('Discard unsaved changes?')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Discard' }));

        expect(await screen.findByRole('heading', { name: 'New Mosaic' })).toBeInTheDocument();
    });
});

describe('File > Close discard-confirmation flow', () => {
    beforeEach(() => {
        mosaic.initialize(6, 6, 0);
        window.dialogs = {
            ...dialogsStub,
            open: vi.fn().mockResolvedValue({ success: true, data: mosaic.data.getSaveData() }),
        };
    });

    async function openEditorAndMakeDirty() {
        render(<App />);

        // Open a mosaic to reach the editor (mosaicOpen state), then mark it
        // dirty directly - bypassing the canvas, which jsdom can't drive.
        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /Open/ }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'View' })).not.toBeDisabled());

        mosaic.data.getCellByChartRowAndCol(3, 3).toggleColor();
        expect(mosaic.isDirty).toBe(true);
    }

    test('with unsaved changes, Close shows the discard dialog and blocks until confirmed', async () => {
        await openEditorAndMakeDirty();

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: 'Close' }));

        expect(await screen.findByText('Discard unsaved changes?')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Discard' }));

        // isDirty clears once the close actually proceeds, so a later
        // Exit/OS-close won't wrongly prompt for changes Close already discarded.
        await waitFor(() => expect(screen.getByRole('button', { name: 'View' })).toBeDisabled());
        expect(mosaic.isDirty).toBe(false);
    });

    test('cancelling Close leaves the editor open and untouched', async () => {
        await openEditorAndMakeDirty();

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: 'Close' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

        await waitFor(() => expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument());
        expect(screen.getByRole('button', { name: 'View' })).not.toBeDisabled();
        expect(mosaic.isDirty).toBe(true);
    });

    test('with no unsaved changes, Close proceeds immediately without a dialog', async () => {
        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /Open/ }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'View' })).not.toBeDisabled());
        expect(mosaic.isDirty).toBe(false);

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: 'Close' }));

        await waitFor(() => expect(screen.getByRole('button', { name: 'View' })).toBeDisabled());
        expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument();
    });
});

describe('Session state resets when Open replaces an already-open mosaic', () => {
    beforeEach(() => {
        mosaic.initialize(6, 6, 0);
        window.dialogs = {
            ...dialogsStub,
            open: vi.fn().mockResolvedValue({ success: true, data: mosaic.data.getSaveData() }),
        };
    });

    test('zooming in, then Open (not dirty), resets zoom back to 100% - matching Close', async () => {
        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /Open/ }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'View' })).not.toBeDisabled());
        expect(screen.getByText('Zoom: 100%')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'View' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: 'Zoom In' }));
        expect(screen.getByText('Zoom: 110%')).toBeInTheDocument();

        // Reopening without discarding anything (not dirty) still replaces
        // the mosaic - session state (zoom, here) should reset just like Close does.
        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /Open/ }));

        await waitFor(() => expect(screen.getByText('Zoom: 100%')).toBeInTheDocument());
    });
});
