import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import HomePage from './HomePage';
import NewMosaicForm from './NewMosaicForm';
import MosaicEditor from './MosaicEditor';
import mosaic from './Mosaic';


const App = () => {
    const [ homePageShown, setHomePageShown ] = useState(true);
    const [ newMosaicFormShown, setNewMosaicFormShown ] = useState(false);
    const [ mosaicEditorShown, setMosaicEditorShown ] = useState(false);
    const [ writtenPatternDialogShown, setWrittenPatternDialogShown ] = useState(false);

    const newMosaicClicked = () => {
        setHomePageShown(false);
        setNewMosaicFormShown(true);
    }

    const newMosaicCreated = () => {
        setNewMosaicFormShown(false);
        setMosaicEditorShown(true);
    }

    const newMosaicCancelled = () => {
        setNewMosaicFormShown(false);
        setHomePageShown(true);
    }

    const importMosaicClicked = async () => {
        if(await importImage()) {
            setHomePageShown(false);
            setMosaicEditorShown(true);
        }
    }

    const mosaicClosedClicked = () => {
        setMosaicEditorShown(false);
        setHomePageShown(true);
    };

    const importImage = async () => {
        const response = await (window as any).dialogs.import();

        console.log(response);
        if (!response.success) return false;

        mosaic.initialize(response.width, response.height);

        const threshold = 125;
        for(let row=response.height - 1; row > 0; row--) {
            for (let col = response.width - 1; col > 0; col--) {
                var color = response.data[row][col];
                var cell = mosaic.data.getCellByRowAndCol(row, col);

                if (!cell) continue;

                var cellColor = color > threshold ? 0 : 1;
                if (cellColor != cell.color) cell.toggleColor();
            }
        }
        return true;
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

    return (
        <>
            {homePageShown ? <HomePage newMosaicClicked={newMosaicClicked} loadMosaicClicked={loadMosaicClicked} importImageClicked={importMosaicClicked} /> : null }
            {newMosaicFormShown ? <NewMosaicForm newMosaicCreated={newMosaicCreated} newMosaicCancelled={newMosaicCancelled} /> : null }
            {mosaicEditorShown ? <MosaicEditor closeClicked={mosaicClosedClicked} /> : null }
        </>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
