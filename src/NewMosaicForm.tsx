import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import mosaic from './Mosaic';

export const NEW_MOSAIC_DEFAULT_WIDTH = 20;
export const NEW_MOSAIC_DEFAULT_HEIGHT = 20;

interface NewMosaicFormProps {
    open: boolean,
    newMosaicCreated?: () => void;
    newMosaicCancelled?: () => void;
    width?: number;
    height?: number;
    extraRowsChecked?: boolean;
    extraRows?: number;
}

const NewMosaicForm = (props: NewMosaicFormProps) => {
    const [ inputs, setInputs ] = useState({
        width: props.width ?? NEW_MOSAIC_DEFAULT_WIDTH,
        height: props.height ?? NEW_MOSAIC_DEFAULT_HEIGHT,
        extraRowsChecked: props.extraRowsChecked,
        extraRows: props.extraRows
    });

    const [ errors, setErrors ] = useState({
        width: false,
        height: false,
        extraRows: false
    });

    const setInput = (e:React.ChangeEvent<HTMLInputElement>) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value});

        const error = !e.target.value;
        setErrors({ ...errors, [e.target.name]: error});
    }

    const setBooleanInput = (e:React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.checked;
        setInputs({ ...inputs, [e.target.name]: value});
    }

    const createClicked = (evt: React.FormEvent<HTMLFormElement>) => {
        evt.preventDefault();

        const extraRows = inputs.extraRowsChecked ? Number(inputs.extraRows) : 0;
        mosaic.initialize(Number(inputs.width), Number(inputs.height), extraRows);
        props.newMosaicCreated();
    }

    return (
        <Dialog open={props.open}>
            <DialogTitle>New Mosaic</DialogTitle>
            <Box component='form' onSubmit={createClicked} >
                <DialogContent>
                    <DialogContentText>Set the height & width of your new mosaic.</DialogContentText>
                    <Box sx={{ my: 1 }}>
                        <TextField name="width" 
                            type="number" 
                            label="Width" 
                            value={inputs.width} 
                            onChange={setInput} 
                            required={true} 
                            error={errors.width} />
                        <TextField name="height" 
                            type="number" 
                            label="Height" 
                            value={inputs.height} 
                            onChange={setInput} 
                            required={true}
                            error={errors.height}/>
                    </Box>
                    <Box sx={{ my: 2 }}>
                        <Divider />
                    </Box>
                    <Box sx={{ my: 1 }}>
                        <DialogContentText>
                            Check this box and set a number of rows if you want to include extra starting rows of the same color.
                        </DialogContentText>
                        <FormControlLabel label="Include extra starting row" 
                                            control={<Checkbox name="extraRowsChecked" 
                                                                checked={inputs.extraRowsChecked} 
                                                                onChange={setBooleanInput}/>}/>
                    </Box>
                    <Box sx={{ my: 1 }}>
                        <TextField label="Extra rows" 
                                    name="extraRows" 
                                    value={inputs.extraRows} 
                                    disabled={!inputs.extraRowsChecked} 
                                    type="number" 
                                    required={inputs.extraRowsChecked}
                                    error={errors.extraRows}
                                    onChange={setInput}/>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.newMosaicCancelled}>Cancel</Button>
                    <Button variant='contained' type='submit'>Create</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default NewMosaicForm;