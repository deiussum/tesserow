import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
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
import WrittenPatternDialog, { PATTERN_PANEL_DEFAULT_WIDTH } from './WrittenPatternDialog';
import StatusBar from './StatusBar';
import DiscardChangesDialog from './DiscardChangesDialog';
import AboutDialog from './AboutDialog';
import mosaic from './Mosaic';
import type { ImageImportSuccess } from './dialogs-bridge';

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4.0;
const ZOOM_STEP = 0.1;

export const App = () => {
    const [ homePageShown, setHomePageShown ] = useState(true);
    const [ newMosaicFormShown, setNewMosaicFormShown ] = useState(false);
    const [ mosaicEditorShown, setMosaicEditorShown ] = useState(false);
    const [ previewShown, setPreviewShown ] = useState(false);
    const [ previewImageData, setPreviewImageData ] = useState<ImageImportSuccess>(null);

    const [ exportDialogShown, setExportDialogShown ] = useState(false);
    const [ patternPanelOpen, setPatternPanelOpen ] = useState(false);
    const [ patternPanelWidth, setPatternPanelWidth ] = useState(PATTERN_PANEL_DEFAULT_WIDTH);
    const [ zoomLevel, setZoomLevel ] = useState(1.0);
    const [ zoomString, setZoomString ] = useState('Zoom: 100%');
    const [ statusText, setStatusText ] = useState('Ready');
    const [ pendingAction, setPendingAction ] = useState<(() => void) | null>(null);
    const [ aboutShown, setAboutShown ] = useState(false);

    const runWithDirtyGuard = (action: () => void) => {
        if (mosaic.isDirty) {
            setPendingAction(() => action);
        } else {
            action();
        }
    }

    // Matches the session reset New/Open/Import/Close all commit to once
    // they actually replace the current mosaic - called at the point each
    // one actually takes effect, not when the guard first lets them proceed,
    // so cancelling a sub-dialog (e.g. New Mosaic) after that point doesn't
    // reset state out from under the mosaic that's still open.
    const resetEditorSessionState = () => {
        setZoomLevel(1.0);
        setZoomString('Zoom: 100%');
        setStatusText('Ready');
        setPatternPanelOpen(false);
        setPatternPanelWidth(PATTERN_PANEL_DEFAULT_WIDTH);
        setExportDialogShown(false);
    }

    const discardConfirmed = () => {
        const action = pendingAction;
        setPendingAction(null);
        action?.();
    }

    const discardCancelled = () => {
        setPendingAction(null);
    }

    const newMosaicClicked = () => {
        runWithDirtyGuard(() => setNewMosaicFormShown(true));
    }

    const newMosaicCreated = () => {
        setNewMosaicFormShown(false);
        resetEditorSessionState();
        setHomePageShown(false);
        setMosaicEditorShown(true);
    }

    const newMosaicCancelled = () => {
        setNewMosaicFormShown(false);
    }

    const importMosaicClicked = () => {
        runWithDirtyGuard(() => { void importImage(); });
    }

    const mosaicClosedClicked = () => {
        runWithDirtyGuard(() => {
            setMosaicEditorShown(false);
            setHomePageShown(true);
            mosaic.isDirty = false;
            resetEditorSessionState();
        });
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
        resetEditorSessionState();
        setHomePageShown(false);
        setMosaicEditorShown(true);
    }

    const loadMosaicClicked = () => {
        runWithDirtyGuard(() => {
            loadFile().then((loaded) => {
                if (loaded) {
                    resetEditorSessionState();
                    setHomePageShown(false);
                    setMosaicEditorShown(true);
                }
            });
        });
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
        const result = await window.dialogs.save(data);
        if (result.success) mosaic.isDirty = false;
        setStatusText('Saved');
    }

    const exitClicked = () => {
        void getCurrentWindow().close();
    }

    const aboutClicked = () => {
        setAboutShown(true);
    }

    const aboutClosed = () => {
        setAboutShown(false);
    }

    const setZoomStringFromZoom = (zoom: number) => {
        setZoomString(`Zoom: ${(zoom * 100).toFixed(0)}%`);
    }

    const setZoom = (next: number) => {
        const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
        setZoomLevel(clamped);
        setZoomStringFromZoom(clamped);
    }

    const zoomInClicked = () => {
        setZoom(zoomLevel + ZOOM_STEP);
    }

    const zoomOutClicked = () => {
        setZoom(zoomLevel - ZOOM_STEP);
    }

    const zoomResetClicked = () => {
        setZoom(1.0);
    }

    const zoomPresetSelected = (zoom: number) => {
        setZoom(zoom);
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!(e.ctrlKey || e.metaKey)) return;

            if (mosaicEditorShown) {
                if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    zoomInClicked();
                    return;
                } else if (e.key === '-') {
                    e.preventDefault();
                    zoomOutClicked();
                    return;
                } else if (e.key === '0') {
                    e.preventDefault();
                    zoomResetClicked();
                    return;
                } else if (e.key === 's' || e.key === 'S') {
                    e.preventDefault();
                    saveClicked();
                    return;
                }
            }

            // New/Open apply regardless of whether a mosaic is already open -
            // same as the File menu items, they go through the dirty-check
            // guard rather than being disabled while editing.
            if (e.key === 'n' || e.key === 'N') {
                e.preventDefault();
                newMosaicClicked();
            } else if (e.key === 'o' || e.key === 'O') {
                e.preventDefault();
                loadMosaicClicked();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mosaicEditorShown, zoomLevel]);

    useEffect(() => {
        const appWindow = getCurrentWindow();
        let unlisten: (() => void) | undefined;

        appWindow.onCloseRequested((event) => {
            if (!mosaic.isDirty) return;

            event.preventDefault();
            setPendingAction(() => () => { void appWindow.destroy(); });
        }).then((fn) => { unlisten = fn; });

        return () => unlisten?.();
    }, []);

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
                closeClicked={mosaicClosedClicked}
                exitClicked={exitClicked}
                zoomInClicked={zoomInClicked}
                zoomOutClicked={zoomOutClicked}
                zoomResetClicked={zoomResetClicked}
                aboutClicked={aboutClicked}
                rightPanelOpen={mosaicEditorShown && patternPanelOpen}
                rightPanelWidth={patternPanelWidth}
                rightPanelContent={<WrittenPatternDialog width={patternPanelWidth} onResize={setPatternPanelWidth} />}
                statusBar={
                    <StatusBar
                        leftText={statusText}
                        rightText={zoomString}
                        onZoomIn={zoomInClicked}
                        onZoomOut={zoomOutClicked}
                        onZoomReset={zoomResetClicked}
                        onZoomPresetSelected={zoomPresetSelected}
                    />
                }
            >
                {homePageShown ? <HomePage /> : null}
                {mosaicEditorShown ? (
                    <MosaicEditor zoomLevel={zoomLevel} onZoomChange={setZoom} />
                ) : null}
            </AppShell>
            <NewMosaicForm open={newMosaicFormShown} newMosaicCreated={newMosaicCreated} newMosaicCancelled={newMosaicCancelled} />
            <ExportDialog open={exportDialogShown} dialogClosed={exportCanceled} exportClicked={exportConfirmed} />
            <DiscardChangesDialog open={pendingAction !== null} onConfirm={discardConfirmed} onCancel={discardCancelled} />
            <AboutDialog open={aboutShown} onClose={aboutClosed} />
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

// Guarded so importing this module for tests (no #root in jsdom) doesn't
// throw - production always has index.html's #root element.
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App/>);
}
