import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import AppShell from './AppShell';
import HomePage from './HomePage';
import NewMosaicForm from './NewMosaicForm';
import MosaicEditor from './MosaicEditor';
import ImagePreviewDialog from './ImagePreviewDialog';
import ExportDialog from './ExportDialog';
import ExportOptions from './ExportOptions';
import WrittenPatternDialog from './WrittenPatternDialog';
import StatusBar from './StatusBar';
import mosaic from './Mosaic';
import type { ImageImportSuccess } from './dialogs-bridge';


const App = () => {
    const [ homePageShown, setHomePageShown ] = useState(true);
    const [ newMosaicFormShown, setNewMosaicFormShown ] = useState(false);
    const [ mosaicEditorShown, setMosaicEditorShown ] = useState(false);
    const [ previewShown, setPreviewShown ] = useState(false);
    const [ previewImageData, setPreviewImageData ] = useState<ImageImportSuccess>(null);

    const [ exportDialogShown, setExportDialogShown ] = useState(false);
    const [ patternPanelOpen, setPatternPanelOpen ] = useState(false);
    const [ zoomLevel, setZoomLevel ] = useState(1.0);
    const [ zoomString, setZoomString ] = useState('Zoom: 100%');
    const [ statusText, setStatusText ] = useState('Ready');

    const newMosaicClicked = () => {
        setNewMosaicFormShown(true);
    }

    const newMosaicCreated = () => {
        setNewMosaicFormShown(false);
        setHomePageShown(false);
        setMosaicEditorShown(true);
    }

    const newMosaicCancelled = () => {
        setNewMosaicFormShown(false);
    }

    const importMosaicClicked = async () => {
        await importImage();
    }

    const mosaicClosedClicked = () => {
        setMosaicEditorShown(false);
        setHomePageShown(true);

        // Reset editor session state so the next mosaic opened starts fresh,
        // matching the old behavior where this state lived locally in
        // MosaicEditor and was naturally reset by unmount/remount.
        setZoomLevel(1.0);
        setZoomString('Zoom: 100%');
        setStatusText('Ready');
        setPatternPanelOpen(false);
        setExportDialogShown(false);
    };

    const importImage = async () => {
        const response = await window.dialogs.import();

        console.log(response);
        if (!response.success) return false;

        setPreviewImageData(response);
        setPreviewShown(true);
        return true;
    }

    const onResizePreview = async (data: ImageImportSuccess, width: number, height: number) => {
        data = await window.dialogs.resize(data.filePath, width, height);
        setPreviewImageData(data);
    }

    const imagePreviewComplete = async (threshold: number, data: ImageImportSuccess, newWidth: number, newHeight: number, extraRows: number) => {
        if (newWidth != data.width || newHeight != newHeight) {
            data = await window.dialogs.resize(data.filePath, newWidth, newHeight);
        }

        mosaic.initialize(data.width, data.height, extraRows);

        for(let row=data.height - 1; row > 0; row--) {
            for (let col = data.width - 1; col > 0; col--) {
                const color = data.data[row][col];
                const cell = mosaic.data.getCellByRowAndCol(row + extraRows, col);

                if (!cell) continue;

                const cellColor = color > threshold ? 0 : 1;
                if (cellColor != cell.color) cell.toggleColor();
            }
        }
        setPreviewShown(false);
        setHomePageShown(false);
        setMosaicEditorShown(true);
    }

    const loadMosaicClicked = async () => {
        if (await loadFile()) {
            setHomePageShown(false);
            setMosaicEditorShown(true);
        }
    }

    const loadFile = async() => {
        const response = await window.dialogs.open();

        console.log(response);
        if (!response.success) return false;

        mosaic.load(response.data);
        return true;
    }

    const handlePreviewClose = () => {
        setPreviewShown(false);
    }

    const toggleWrittenPatternClicked = () => {
        setPatternPanelOpen(!patternPanelOpen);
    }

    const exportCanceled = () => {
        setExportDialogShown(false);
    }

    const exportClicked = () => {
        setExportDialogShown(true);
    }

    const exportConfirmed = async (options: ExportOptions) => {
        setExportDialogShown(false);
        setStatusText('Exporting...');
        const data = {
            chartPages: mosaic.data.getChartPageData(),
            writtenPatternLines: mosaic.data.getWrittenPatternLines(16, 65)
        };
        await window.dialogs.export(data, options);
        setStatusText('Exported');
    }

    const saveClicked = async () => {
        setStatusText('Saving...');
        const data = mosaic.data.getSaveData();
        await window.dialogs.save(data);
        setStatusText('Saved');
    }

    const setZoomStringFromZoom = (zoom: number) => {
        setZoomString(`Zoom: ${(zoom * 100).toFixed(0)}%`);
    }

    const zoomInClicked = () => {
        const newZoom = zoomLevel + 0.1;
        setZoomLevel(newZoom);
        setZoomStringFromZoom(newZoom);
    }

    const zoomOutClicked = () => {
        const newZoom = zoomLevel - 0.1;
        setZoomLevel(newZoom);
        setZoomStringFromZoom(newZoom);
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppShell
                mosaicOpen={mosaicEditorShown}
                newMosaicClicked={newMosaicClicked}
                loadMosaicClicked={loadMosaicClicked}
                importImageClicked={importMosaicClicked}
                toggleWrittenPatternClicked={toggleWrittenPatternClicked}
                exportClicked={exportClicked}
                saveClicked={saveClicked}
                zoomInClicked={zoomInClicked}
                zoomOutClicked={zoomOutClicked}
                closeClicked={mosaicClosedClicked}
                rightPanelOpen={mosaicEditorShown && patternPanelOpen}
                rightPanelContent={<WrittenPatternDialog />}
            >
                {homePageShown ? <HomePage /> : null}
                {mosaicEditorShown ? (
                    <>
                        <MosaicEditor zoomLevel={zoomLevel} />
                        <StatusBar leftText={statusText} rightText={zoomString} />
                    </>
                ) : null}
            </AppShell>
            <NewMosaicForm open={newMosaicFormShown} newMosaicCreated={newMosaicCreated} newMosaicCancelled={newMosaicCancelled} />
            <ExportDialog open={exportDialogShown} dialogClosed={exportCanceled} exportClicked={exportConfirmed} />
            {previewShown
            ? <ImagePreviewDialog open={previewShown}
                               data={previewImageData}
                               handleClose={handlePreviewClose}
                               onImagePreviewComplete={imagePreviewComplete}
                               onResizePreviewData={onResizePreview}/>
            : null }

        </ThemeProvider>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
