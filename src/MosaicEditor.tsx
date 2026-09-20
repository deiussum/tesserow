import { useEffect } from 'react';
import mosaic from './Mosaic';
import styles from './MosaicEditor.module.css';

const SCROLL_ZOOM_STEP = 0.02;

interface MosaicEditorProps {
    zoomLevel: number;
    onZoomChange?: (next: number) => void;
}

const MosaicEditor = (props: MosaicEditorProps) => {
    useEffect(() => {
        mosaic.setupCanvas();
    }, []);

    useEffect(() => {
        mosaic.draw(props.zoomLevel);
    }, [props.zoomLevel]);

    useEffect(() => {
        const canvas = document.getElementById('mosaic-canvas');
        if (!canvas || !props.onZoomChange) return;

        const handleWheel = (e: WheelEvent) => {
            if (!(e.ctrlKey || e.metaKey)) return;

            e.preventDefault();
            const step = e.deltaY < 0 ? SCROLL_ZOOM_STEP : -SCROLL_ZOOM_STEP;
            props.onZoomChange(props.zoomLevel + step);
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [props.zoomLevel, props.onZoomChange]);

    return (
        <div id="mosaic-chart" className={styles.editorPane}>
            <canvas id="mosaic-canvas"></canvas>
        </div>
    );
}

export default MosaicEditor;
