// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NewMosaicForm, { NEW_MOSAIC_DEFAULT_WIDTH, NEW_MOSAIC_DEFAULT_HEIGHT } from './NewMosaicForm';
import mosaic from './Mosaic';

describe('NewMosaicForm', () => {
    beforeEach(() => {
        mosaic.initialize(1, 1, 0);
    });

    test('opens with width and height pre-filled to the defaults', () => {
        render(<NewMosaicForm open={true} newMosaicCreated={() => {}} newMosaicCancelled={() => {}} />);

        expect(screen.getByRole('spinbutton', { name: 'Width' })).toHaveValue(NEW_MOSAIC_DEFAULT_WIDTH);
        expect(screen.getByRole('spinbutton', { name: 'Height' })).toHaveValue(NEW_MOSAIC_DEFAULT_HEIGHT);
    });

    test('submitting unedited creates a chart at the default size', () => {
        const newMosaicCreated = vi.fn();
        render(<NewMosaicForm open={true} newMosaicCreated={newMosaicCreated} newMosaicCancelled={() => {}} />);

        fireEvent.click(screen.getByRole('button', { name: 'Create' }));

        expect(newMosaicCreated).toHaveBeenCalled();
        expect(mosaic.data.width).toBe(NEW_MOSAIC_DEFAULT_WIDTH);
        expect(mosaic.data.height).toBe(NEW_MOSAIC_DEFAULT_HEIGHT);
    });

    test('editing width/height before submitting uses the edited values, not the defaults', () => {
        const newMosaicCreated = vi.fn();
        render(<NewMosaicForm open={true} newMosaicCreated={newMosaicCreated} newMosaicCancelled={() => {}} />);

        fireEvent.change(screen.getByRole('spinbutton', { name: 'Width' }), { target: { value: '35' } });
        fireEvent.change(screen.getByRole('spinbutton', { name: 'Height' }), { target: { value: '42' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));

        expect(newMosaicCreated).toHaveBeenCalled();
        expect(mosaic.data.width).toBe(35);
        expect(mosaic.data.height).toBe(42);
    });
});
