// @vitest-environment jsdom
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from './HomePage';

describe('HomePage', () => {
    test('clicking New Mosaic invokes newMosaicClicked', () => {
        const newMosaicClicked = vi.fn();
        render(<HomePage newMosaicClicked={newMosaicClicked} />);

        fireEvent.click(screen.getByRole('button', { name: 'New Mosaic' }));

        expect(newMosaicClicked).toHaveBeenCalledTimes(1);
    });

    test('clicking Open invokes loadMosaicClicked', () => {
        const loadMosaicClicked = vi.fn();
        render(<HomePage loadMosaicClicked={loadMosaicClicked} />);

        fireEvent.click(screen.getByRole('button', { name: 'Open...' }));

        expect(loadMosaicClicked).toHaveBeenCalledTimes(1);
    });

    test('clicking Import Image invokes importImageClicked', () => {
        const importImageClicked = vi.fn();
        render(<HomePage importImageClicked={importImageClicked} />);

        fireEvent.click(screen.getByRole('button', { name: 'Import Image' }));

        expect(importImageClicked).toHaveBeenCalledTimes(1);
    });

    test('shows current Tesserow branding, not the legacy wordmark', () => {
        render(<HomePage />);

        expect(screen.getByText('Tesserow')).toBeInTheDocument();
        expect(screen.queryByText(/Deiussum/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Pattern Maker/)).not.toBeInTheDocument();
    });
});
