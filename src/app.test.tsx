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
    save: vi.fn(async (_data, filePath: string) => ({ success: true as const, filePath })),
    saveAs: vi.fn().mockResolvedValue({ success: false, error: 'Save cancelled' }),
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

describe('File > Export to PDF', () => {
    beforeEach(() => {
        mosaic.initialize(6, 6, 0);
    });

    test('shows the error in the status bar when the export fails, instead of staying on "Exporting..."', async () => {
        window.dialogs = {
            ...dialogsStub,
            open: vi.fn().mockResolvedValue({ success: true, data: mosaic.data.getSaveData() }),
            getFileName: vi.fn().mockResolvedValue({ success: true, result: '/home/user/chart.pdf' }),
            export: vi.fn().mockRejectedValue(new Error('Standard font "Helvetica" is not registered.')),
        };
        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /Open/ }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'View' })).not.toBeDisabled());

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /Export to PDF/ }));

        // The export-file picker is the only enabled folder button (the cover
        // PDF picker is disabled until its checkbox is ticked).
        const exportPicker = (await screen.findAllByTestId('FolderOpenIcon'))
            .map((icon) => icon.closest('button'))
            .find((button) => !button.disabled);
        fireEvent.click(exportPicker);
        await waitFor(() => expect(screen.getByDisplayValue('/home/user/chart.pdf')).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: 'Export' }));

        expect(await screen.findByText('Export failed: Standard font "Helvetica" is not registered.')).toBeInTheDocument();
        expect(screen.queryByText('Exporting...')).not.toBeInTheDocument();
    });
});

describe('File > Save and Save As', () => {
    const OPENED_PATH = '/home/user/opened.json';

    beforeEach(() => {
        mosaic.initialize(6, 6, 0);
        window.dialogs = {
            ...dialogsStub,
            save: vi.fn(async (_data, filePath: string) => ({ success: true as const, filePath })),
            saveAs: vi.fn().mockResolvedValue({ success: false, error: 'Save cancelled' }),
            open: vi.fn().mockResolvedValue({ success: true, data: mosaic.data.getSaveData(), filePath: OPENED_PATH }),
        };
    });

    async function openEditor() {
        render(<App />);
        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /Open/ }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'View' })).not.toBeDisabled());
    }

    async function chooseFileItem(name: string) {
        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name }));
    }

    test('Save after Open writes back to the opened file without a dialog', async () => {
        await openEditor();
        expect(mosaic.filePath).toBe(OPENED_PATH);
        mosaic.data.getCellByChartRowAndCol(3, 3).toggleColor();

        await chooseFileItem('Save Ctrl+S');

        await waitFor(() => expect(screen.getByText('Saved')).toBeInTheDocument());
        expect(window.dialogs.save).toHaveBeenCalledWith(expect.anything(), OPENED_PATH);
        expect(window.dialogs.saveAs).not.toHaveBeenCalled();
        expect(mosaic.isDirty).toBe(false);
    });

    test('Save on a chart with no associated file prompts once, then later Saves reuse the chosen file', async () => {
        await openEditor();
        // Stand in for a new/imported chart, which has no associated file.
        mosaic.filePath = null;
        vi.mocked(window.dialogs.saveAs).mockResolvedValue({ success: true, filePath: '/home/user/new.json' });

        await chooseFileItem('Save Ctrl+S');
        await waitFor(() => expect(mosaic.filePath).toBe('/home/user/new.json'));
        expect(window.dialogs.saveAs).toHaveBeenCalledTimes(1);

        mosaic.data.getCellByChartRowAndCol(3, 3).toggleColor();
        await chooseFileItem('Save Ctrl+S');

        await waitFor(() => expect(window.dialogs.save).toHaveBeenCalledWith(expect.anything(), '/home/user/new.json'));
        expect(window.dialogs.saveAs).toHaveBeenCalledTimes(1);
    });

    test('Save As prompts with the current file as the default and re-associates the chart', async () => {
        await openEditor();
        vi.mocked(window.dialogs.saveAs).mockResolvedValue({ success: true, filePath: '/home/user/copy.json' });

        await chooseFileItem('Save As... Ctrl+Shift+S');

        await waitFor(() => expect(mosaic.filePath).toBe('/home/user/copy.json'));
        expect(window.dialogs.saveAs).toHaveBeenCalledWith(expect.anything(), OPENED_PATH);
        expect(window.dialogs.save).not.toHaveBeenCalled();
    });

    test('cancelling Save As keeps the existing associated file', async () => {
        await openEditor();
        mosaic.data.getCellByChartRowAndCol(3, 3).toggleColor();

        await chooseFileItem('Save As... Ctrl+Shift+S');

        await waitFor(() => expect(screen.getByText('Saved')).toBeInTheDocument());
        expect(mosaic.filePath).toBe(OPENED_PATH);
        expect(mosaic.isDirty).toBe(true);
    });

    test('a failed write shows "Save failed" and leaves the chart dirty', async () => {
        await openEditor();
        vi.mocked(window.dialogs.save).mockRejectedValue(new Error('Permission denied'));
        mosaic.data.getCellByChartRowAndCol(3, 3).toggleColor();

        await chooseFileItem('Save Ctrl+S');

        expect(await screen.findByText('Save failed: Permission denied')).toBeInTheDocument();
        expect(screen.queryByText('Saved')).not.toBeInTheDocument();
        expect(mosaic.isDirty).toBe(true);
        expect(mosaic.filePath).toBe(OPENED_PATH);
    });

    test('Close clears the associated file', async () => {
        await openEditor();

        await chooseFileItem('Close');

        await waitFor(() => expect(screen.getByRole('button', { name: 'View' })).toBeDisabled());
        expect(mosaic.filePath).toBeNull();
    });

    test('Ctrl+Shift+S runs Save As and not Save; Ctrl+S runs Save', async () => {
        await openEditor();

        fireEvent.keyDown(window, { key: 'S', ctrlKey: true, shiftKey: true });
        await waitFor(() => expect(window.dialogs.saveAs).toHaveBeenCalledTimes(1));
        expect(window.dialogs.save).not.toHaveBeenCalled();

        fireEvent.keyDown(window, { key: 's', ctrlKey: true });
        await waitFor(() => expect(window.dialogs.save).toHaveBeenCalledWith(expect.anything(), OPENED_PATH));
        expect(window.dialogs.saveAs).toHaveBeenCalledTimes(1);
    });

    test('Save and Save As accelerators do nothing on the home screen', async () => {
        render(<App />);

        fireEvent.keyDown(window, { key: 's', ctrlKey: true });
        fireEvent.keyDown(window, { key: 'S', ctrlKey: true, shiftKey: true });

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(window.dialogs.save).not.toHaveBeenCalled();
        expect(window.dialogs.saveAs).not.toHaveBeenCalled();
    });
});
