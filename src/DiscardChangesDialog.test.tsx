// @vitest-environment jsdom
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DiscardChangesDialog from './DiscardChangesDialog';

describe('DiscardChangesDialog', () => {
    test('Discard is styled as a destructive action and Cancel as a secondary one', () => {
        render(<DiscardChangesDialog open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />);

        const discard = screen.getByRole('button', { name: 'Discard' });
        expect(discard).toHaveClass('MuiButton-contained');
        expect(discard).toHaveClass('MuiButton-colorError');

        const cancel = screen.getByRole('button', { name: 'Cancel' });
        expect(cancel).toHaveClass('MuiButton-text');
        expect(cancel).not.toHaveClass('MuiButton-colorError');
    });

    test('Discard and Cancel invoke their callbacks', () => {
        const onConfirm = vi.fn();
        const onCancel = vi.fn();
        render(<DiscardChangesDialog open={true} onConfirm={onConfirm} onCancel={onCancel} />);

        fireEvent.click(screen.getByRole('button', { name: 'Discard' }));
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
