import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import HomePage from './HomePage';
import NewMosaicForm from './NewMosaicForm';
import MosaicEditor from './MosaicEditor';
import ImagePreviewDialog from './ImagePreviewDialog';
import mosaic from './Mosaic';
import type { ImageImportSuccess } from './dialogs-bridge';


const App = () => {
    const [ homePageShown, setHomePageShown ] = useState(true);
    const [ newMosaicFormShown, setNewMosaicFormShown ] = useState(false);
    const [ mosaicEditorShown, setMosaicEditorShown ] = useState(false);
    const [ previewShown, setPreviewShown ] = useState(false);
    const [ previewImageData, setPreviewImageData ] = useState<ImageImportSuccess>(null);

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

    return (
        <>
            {homePageShown ? <HomePage newMosaicClicked={newMosaicClicked} loadMosaicClicked={loadMosaicClicked} importImageClicked={importMosaicClicked} /> : null }
            <NewMosaicForm open={newMosaicFormShown} newMosaicCreated={newMosaicCreated} newMosaicCancelled={newMosaicCancelled} />
            {mosaicEditorShown ? <MosaicEditor closeClicked={mosaicClosedClicked} /> : null }
            {previewShown 
            ? <ImagePreviewDialog open={previewShown} 
                               data={previewImageData} 
                               handleClose={handlePreviewClose} 
                               onImagePreviewComplete={imagePreviewComplete} 
                               onResizePreviewData={onResizePreview}/> 
            : null }

        </>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
