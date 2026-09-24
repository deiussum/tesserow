// @vitest-environment jsdom
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import AppShell from './AppShell';

describe('AppShell menu bar', () => {
    test('no mosaic open: File shows new/open/import enabled and save/export/close disabled; View is disabled', async () => {
        render(<AppShell mosaicOpen={false} />);

        expect(screen.getByRole('button', { name: 'View' })).toBeDisabled();

        fireEvent.click(screen.getByRole('button', { name: 'File' }));

        expect(await screen.findByRole('menuitem', { name: /New/ })).not.toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('menuitem', { name: /Open/ })).not.toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('menuitem', { name: 'Import Image...' })).not.toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('menuitem', { name: /Save/ })).toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('menuitem', { name: 'Export to PDF...' })).toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('menuitem', { name: 'Close' })).toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('menuitem', { name: 'Exit' })).not.toHaveAttribute('aria-disabled', 'true');
    });

    test('mosaic open: File shows every item enabled, including new/open/import; View is enabled', async () => {
        render(<AppShell mosaicOpen={true} />);

        expect(screen.getByRole('button', { name: 'View' })).not.toBeDisabled();

        fireEvent.click(screen.getByRole('button', { name: 'File' }));

        expect(await screen.findByRole('menuitem', { name: /New/ })).not.toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('menuitem', { name: /Open/ })).not.toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('menuitem', { name: 'Import Image...' })).not.toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('menuitem', { name: /Save/ })).not.toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('menuitem', { name: 'Export to PDF...' })).not.toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('menuitem', { name: 'Close' })).not.toHaveAttribute('aria-disabled', 'true');
    });

    test('clicking an enabled File item invokes its callback and closes the menu', async () => {
        const saveClicked = vi.fn();
        render(<AppShell mosaicOpen={true} saveClicked={saveClicked} />);

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /Save/ }));

        expect(saveClicked).toHaveBeenCalledTimes(1);
    });

    test('New is enabled and clickable even while a mosaic is already open', async () => {
        const newMosaicClicked = vi.fn();
        render(<AppShell mosaicOpen={true} newMosaicClicked={newMosaicClicked} />);

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /New/ }));

        expect(newMosaicClicked).toHaveBeenCalledTimes(1);
    });

    test('clicking a disabled File item (Save with no mosaic open) does not invoke its callback', async () => {
        const saveClicked = vi.fn();
        render(<AppShell mosaicOpen={false} saveClicked={saveClicked} />);

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: /Save/ }));

        expect(saveClicked).not.toHaveBeenCalled();
    });

    test('clicking the disabled View button does not open the View menu', () => {
        render(<AppShell mosaicOpen={false} />);

        fireEvent.click(screen.getByRole('button', { name: 'View' }));

        expect(screen.queryByRole('menuitem', { name: 'Zoom In' })).not.toBeInTheDocument();
    });

    test('Written Pattern menu item shows a check when the panel is open', async () => {
        const { rerender } = render(<AppShell mosaicOpen={true} rightPanelOpen={false} />);

        fireEvent.click(screen.getByRole('button', { name: 'View' }));
        expect((await screen.findByRole('menuitem', { name: 'Written Pattern' })).querySelector('svg')).toBeNull();

        fireEvent.click(screen.getByRole('menuitem', { name: 'Written Pattern' }));
        rerender(<AppShell mosaicOpen={true} rightPanelOpen={true} />);

        fireEvent.click(screen.getByRole('button', { name: 'View' }));
        expect((await screen.findByRole('menuitem', { name: 'Written Pattern' })).querySelector('svg')).not.toBeNull();
    });

    // jsdom has no layout, so this checks the order the flex row lays out in:
    // File and View lead, and Help trails after the spacer at the far edge.
    test.each([ false, true ])('menu bar orders File, View, then Help last (mosaicOpen=%s)', (mosaicOpen) => {
        render(<AppShell mosaicOpen={mosaicOpen} />);

        const menuBar = screen.getByRole('group', { name: 'application menu bar' });
        const triggers = within(menuBar).getAllByRole('button').map(b => b.textContent);

        expect(triggers).toEqual([ 'File', 'View', 'Help' ]);
        expect(menuBar.lastElementChild).toBe(screen.getByRole('button', { name: 'Help' }));
    });

    test('File items that ask for more input end with an ellipsis; Close and Exit do not', async () => {
        render(<AppShell mosaicOpen={true} />);

        fireEvent.click(screen.getByRole('button', { name: 'File' }));
        await screen.findByRole('menuitem', { name: /New/ });

        // Shortcut hints (Ctrl+N etc.) are part of the item's text, so read the label span/text node only.
        const labels = screen.getAllByRole('menuitem').map(item => (item.querySelector('span') ?? item).textContent?.trim());
        expect(labels).toEqual([ 'New...', 'Open...', 'Import Image...', 'Save...', 'Export to PDF...', 'Close', 'Exit' ]);
    });

    test('Help menu opens the About item', async () => {
        const aboutClicked = vi.fn();
        render(<AppShell mosaicOpen={false} aboutClicked={aboutClicked} />);

        fireEvent.click(screen.getByRole('button', { name: 'Help' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: 'About Tesserow' }));

        expect(aboutClicked).toHaveBeenCalledTimes(1);
    });
});
