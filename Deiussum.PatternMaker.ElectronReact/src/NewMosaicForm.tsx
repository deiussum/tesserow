import React, { useState } from 'react';
import mosaic from './Mosaic';

interface NewMosaicFormProps {
    newMosaicCreated?: () => void;
    newMosaicCancelled?: () => void;
    width?: number;
    height?: number;
}

const NewMosaicForm = (props: NewMosaicFormProps) => {
    const [ width, setWidth ] = useState(props.width);
    const [ height, setHeight ] = useState(props.height);

    const widthChanged = (e: React.ChangeEvent<any>) => {
        setWidth(e.target.value);
    }

    const heightChanged = (e: React.ChangeEvent<any>) => {
        setHeight(e.target.value);
    }

    const createClicked = () => {
        mosaic.initialize(width, height);
        props.newMosaicCreated();
    }

    return (
        <div id="newMosaicForm">
            <div>
                <label htmlFor="newWidth">Width:</label>
                <input id="newWidth" name="newWidth" type="number" min="0" value={width} onChange={widthChanged}/>
            </div>
            <div>
                <label htmlFor="newHeight">Height:</label>
                <input id="newHeight" name="newHeight" type="number" min="0" value={height} onChange={heightChanged}/>
            </div>
            <div>
                <button id="cancelNewMosaic" onClick={props.newMosaicCancelled}>Cancel</button>
                <button id="createNewMosaic" onClick={createClicked}>Create</button>
            </div>
        </div>
    );
}

export default NewMosaicForm;