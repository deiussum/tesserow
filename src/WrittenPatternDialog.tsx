import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import mosaic from './Mosaic';
import style from './WrittenPatternDialog.module.css';

export const PATTERN_PANEL_MIN_WIDTH = 240;
export const PATTERN_PANEL_MAX_WIDTH = 720;
export const PATTERN_PANEL_DEFAULT_WIDTH = 360;

interface WrittenPatternDialogProps {
    width: number;
    onResize: (width: number) => void;
}

const WrittenPatternDialog = ({ width, onResize }: WrittenPatternDialogProps) => {
    const writtenPattern = mosaic.data ? mosaic.data.getWrittenPattern() : null;
    // Tracked in a ref, not state - the drag is driven by window-level
    // mousemove/mouseup listeners that must read the in-progress drag's
    // start point without re-subscribing on every frame.
    const dragStartRef = useRef<{ pointerX: number; panelWidth: number } | null>(null);

    const copyWrittenPattern = () => {
        const patternText = document.getElementById('written-pattern-text');
        const range = document.createRange();
        range.selectNode(patternText);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const dragStart = dragStartRef.current;
            if (!dragStart) return;

            // Handle sits on the panel's left edge, so dragging left (smaller
            // clientX) should widen the panel.
            const delta = dragStart.pointerX - e.clientX;
            const nextWidth = Math.min(
                PATTERN_PANEL_MAX_WIDTH,
                Math.max(PATTERN_PANEL_MIN_WIDTH, dragStart.panelWidth + delta)
            );
            onResize(nextWidth);
        };

        const handleMouseUp = () => {
            dragStartRef.current = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [onResize]);

    const handleResizeStart = (e: ReactMouseEvent) => {
        e.preventDefault();
        dragStartRef.current = { pointerX: e.clientX, panelWidth: width };
    }

    return (
        <Box className={style.panel} style={{ width }}>
            <div className={style.resizeHandle} onMouseDown={handleResizeStart} data-testid='pattern-panel-resize-handle' />
            <div className={style.header}>
                <Typography variant='h6'>Written Pattern</Typography>
                <Typography variant='body2'>Below is the written pattern. You can click the Copy button to copy it to the clipboard.</Typography>
            </div>
            <div className={style.scrollArea}>
                <div id='written-pattern-text' className={style.writtenPatternText}>
                    {writtenPattern}
                </div>
            </div>
            <div className={style.footer}>
                <Button variant='contained' onClick={copyWrittenPattern}>Copy</Button>
            </div>
        </Box>
    );
}

export default WrittenPatternDialog;
