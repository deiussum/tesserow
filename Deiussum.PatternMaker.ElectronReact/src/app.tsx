import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import HomePage from './HomePage';
import NewMosaicForm from './NewMosaicForm';
import MosaicEditor from './MosaicEditor';
import ImagePreviewDialog from './ImagePreviewDialog';
import mosaic from './Mosaic';


const App = () => {
    const [ homePageShown, setHomePageShown ] = useState(true);
    const [ newMosaicFormShown, setNewMosaicFormShown ] = useState(false);
    const [ mosaicEditorShown, setMosaicEditorShown ] = useState(false);
    const [ thresholdShown, setThresholdShown ] = useState(false);
    const [ thresholdImageData, setThresholdImageData ] = useState(null);

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
        const response = await (window as any).dialogs.import();

        console.log(response);
        if (!response.success) return false;

        setThresholdImageData(response);
        setThresholdShown(true);
        return true;
    }

    const imagePreviewComplete = async (threshold: number, data: any, newWidth: number, newHeight: number) => {
        if (newWidth != data.width || newHeight != newHeight) {
            data = await (window as any).dialogs.resize(data.filePath, newWidth, newHeight);
        }

        mosaic.initialize(data.width, data.height);

        for(let row=data.height - 1; row > 0; row--) {
            for (let col = data.width - 1; col > 0; col--) {
                var color = data.data[row][col];
                var cell = mosaic.data.getCellByRowAndCol(row, col);

                if (!cell) continue;

                var cellColor = color > threshold ? 0 : 1;
                if (cellColor != cell.color) cell.toggleColor();
            }
        }
        setThresholdShown(false);
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
        const response = await (window as any).dialogs.open();

        console.log(response);
        if (!response.success) return false;

        mosaic.load(response.data);
        return true;
    }

    const handlePreviewClose = () => {
        setThresholdShown(false);
    }

    return (
        <>
            {homePageShown ? <HomePage newMosaicClicked={newMosaicClicked} loadMosaicClicked={loadMosaicClicked} importImageClicked={importMosaicClicked} /> : null }
            <NewMosaicForm open={newMosaicFormShown} newMosaicCreated={newMosaicCreated} newMosaicCancelled={newMosaicCancelled} />
            {mosaicEditorShown ? <MosaicEditor closeClicked={mosaicClosedClicked} /> : null }
            {thresholdShown 
            ? <ImagePreviewDialog open={thresholdShown} 
                               data={thresholdImageData} 
                               handleClose={handlePreviewClose} 
                               onImagePreviewComplete={imagePreviewComplete} /> 
            : null }

        </>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
