import React, { useState } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import mosaic from './Mosaic';

interface NewMosaicFormProps {
    open: boolean,
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
        <Dialog open={props.open}>
            <DialogTitle>New Mosaic</DialogTitle>
            <DialogContent>
                <DialogContentText>Set the height & width of your new mosaic.</DialogContentText>
                <TextField id="newWidth" name="newWidth" type="number" label="Width" value={width} onChange={widthChanged}/>
                <TextField id="newHeight" name="newHeight" type="number" label="Height" value={height} onChange={heightChanged}/>
                <DialogActions>
                    <ButtonGroup variant='contained'>
                        <Button id="cancelNewMosaic" onClick={props.newMosaicCancelled}>Cancel</Button>
                        <Button id="createNewMosaic" onClick={createClicked}>Create</Button>
                    </ButtonGroup>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
}

export default NewMosaicForm;