import { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ExportDialog from './ExportDialog';
import ExportOptions from './ExportOptions';
import mosaic from './Mosaic';
import WrittenPatternDialog from './WrittenPatternDialog';
import StatusBar from './StatusBar';
import styles from './MosaicEditor.module.css';

interface MosaicEditorProps  {
    closeClicked?: () => void;
};

const MosaicEditor = (props: MosaicEditorProps) => {
    const [ exportDialogShown, setExportDialogShown ] = useState(false);
    const [ writtenPatternDialogShown, setWrittenPatternDialogShown ] = useState(false);
    const [ zoomLevel, setZoomLevel ] = useState(1.0);
    const [ zoomString, setZoomString ] = useState('Zoom: 100%');
    const [ statusText, setStatusText ] = useState('Ready');
    const [ middleText ] = useState('');

    useEffect(() => {
        mosaic.setupCanvas();
    }, []);

    useEffect(() => {
        setZoomStringFromZoom(zoomLevel);
        mosaic.draw(zoomLevel);
    }, [zoomLevel]);

    const showWrittenPatternClicked = () => {
        setWrittenPatternDialogShown(true);
    }

    const closeWrittenPatternClicked = () => {
        setWrittenPatternDialogShown(false);
    }

    const exportCanceled = () => {
        setExportDialogShown(false);
    }

    const exportClicked = async () => {
        setExportDialogShown(true);
    }

    const exportConfirmed = async (options:ExportOptions) => {
        setExportDialogShown(false);
        setStatusText('Exporting...');
        const data = {
            chartPages: mosaic.data.getChartPageData(),
            writtenPatternLines: mosaic.data.getWrittenPatternLines(16, 65)
        };
        await window.dialogs.export(data, options);
        setStatusText('Exported');
    }

    const saveClicked = async() => {
        setStatusText('Saving...');
        const data = mosaic.data.getSaveData();
        await window.dialogs.save(data);
        setStatusText('Saved');
    }

    const zoomInClicked = () => {
        setZoomLevel(zoomLevel + 0.1);
    }

    const zoomOutClicked = () => {
        setZoomLevel(zoomLevel - 0.1);
    }

    const setZoomStringFromZoom = (zoom:number) => {
        setZoomString(`Zoom: ${(zoom * 100).toFixed(0)}%`);
    }

    return(
        <>
            <AppBar>
                <ButtonGroup variant='contained' aria-label='outlined primary button group'>
                    <Button onClick={showWrittenPatternClicked}>Show Written Pattern</Button>
                    <Button onClick={exportClicked}>Export to PDF</Button>
                    <Button onClick={saveClicked}>Save</Button>
                    <Button onClick={zoomInClicked}>Zoom In</Button>
                    <Button onClick={zoomOutClicked}>Zoom Out</Button>
                    <Button onClick={props.closeClicked}>Close</Button>
                </ButtonGroup>
            </AppBar>
            <div id="mosaic-chart" className={styles.editorPane}>
                <canvas id="mosaic-canvas"></canvas>
            </div>
            <WrittenPatternDialog open={writtenPatternDialogShown} dialogClosed={closeWrittenPatternClicked} />
            <ExportDialog open={exportDialogShown} dialogClosed={exportCanceled} exportClicked={exportConfirmed}/>
            <StatusBar leftText={statusText} middleText={middleText} rightText={zoomString} />
        </>
    )
}

export default MosaicEditor;