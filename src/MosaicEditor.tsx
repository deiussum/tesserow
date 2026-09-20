import { useEffect } from 'react';
import mosaic from './Mosaic';
import styles from './MosaicEditor.module.css';

interface MosaicEditorProps {
    zoomLevel: number;
}

const MosaicEditor = (props: MosaicEditorProps) => {
    useEffect(() => {
        mosaic.setupCanvas();
    }, []);

    useEffect(() => {
        mosaic.draw(props.zoomLevel);
    }, [props.zoomLevel]);

    return (
        <div id="mosaic-chart" className={styles.editorPane}>
            <canvas id="mosaic-canvas"></canvas>
        </div>
    );
}

export default MosaicEditor;
