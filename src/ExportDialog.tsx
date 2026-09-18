import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';
import TextField from '@mui/material/TextField';
import ExportOptions from './ExportOptions';
import FileSelector from './FileSelector';
import HelpButton from './HelpButton';
import ExportDialogHelp from './Help/ExportDialogHelp';


interface ExportDialogProps {
    open: boolean;
    dialogClosed: () => void;
    exportClicked: (options: ExportOptions) => void;
};


const ExportDialog = (props: ExportDialogProps) => {
    const defaultInput: ExportOptions = { additionalPdfChecked: false, includeChart: true, includeWrittenPattern: true, pageStart: 1}
    const [ inputs, setInputs ] = useState(defaultInput);
    const [ exportPickerError, setExportPickerError ] = useState(false);
    const [ additionalPdfPickerError, setAdditionalPdfPickerError ] = useState(false);

    const setInput = (e:React.ChangeEvent<any>) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value});
    }

    const setBooleanInput = (e:React.ChangeEvent<any>) => {
        const value = e.target.checked;
        setInputs({ ...inputs, [e.target.name]: value});
    }

    const exportClicked = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const exportFileValid = Boolean(inputs.exportFileName);
        setExportPickerError(!exportFileValid);

        const additionalPdfValid =  (inputs.additionalPdfChecked && Boolean(inputs.additionalPdfFileName)) || !inputs.additionalPdfChecked;
        setAdditionalPdfPickerError(!additionalPdfValid);

        if (!exportFileValid || !additionalPdfValid) return

        props.exportClicked(inputs);
    }

    const additionalPdfChanged = (fileName:string) => {
        setInputs( { ...inputs, additionalPdfFileName: fileName});

        const valid = (inputs.additionalPdfChecked && Boolean(fileName)) || !inputs.additionalPdfChecked;
        setAdditionalPdfPickerError(!valid);
    };

    const exportFileChanged = (fileName:string) => {
        setInputs( { ...inputs, exportFileName: fileName});

        setExportPickerError(!fileName);
    };

    return (
        <Dialog open={props.open} fullWidth={true} maxWidth={'md'}>
            <DialogTitle>Export Options</DialogTitle>
            <Box component='form' onSubmit={exportClicked}>
                <DialogContent>
                    <DialogContentText>
                        <h4>
                            Select options for exporting.
                            <HelpButton><ExportDialogHelp/></HelpButton>
                        </h4>
                    </DialogContentText>
                    <div>
                        <FormControlLabel label='Include additional PDF instructions' control={
                            <Checkbox name='additionalPdfChecked' checked={inputs.additionalPdfChecked} onChange={setBooleanInput} />
                        } />
                    </div>
                    <Box component='div'>
                        <FileSelector label='Additional PDF' name='additionalPdf' 
                            value={inputs.additionalPdfFileName} 
                            disabled={!inputs.additionalPdfChecked}
                            required={inputs.additionalPdfChecked}
                            error={additionalPdfPickerError}
                            onChange={additionalPdfChanged} />
                    </Box>
                    <Box component='div' my={2}>
                        <TextField label='Page start' name='pageStart' type='number' value={inputs.pageStart} onChange={setInput} />
                    </Box>
                    <Box>
                        <FormControlLabel label='Include chart' control={
                            <Checkbox name='includeChart' checked={inputs.includeChart} onChange={setBooleanInput} />
                        } />
                    </Box>
                    <Box>
                        <FormControlLabel label='Include written pattern' control={
                            <Checkbox name='includeWrittenPattern' checked={inputs.includeWrittenPattern} onChange={setBooleanInput} />
                        } />
                    </Box>
                    <Box>
                        <FileSelector label='Export file name' name='exportFileName' 
                            value={inputs.exportFileName} 
                            save={true}
                            onChange={exportFileChanged} 
                            error={exportPickerError}
                            required={true} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <ButtonGroup variant='contained'>
                        <Button onClick={props.dialogClosed}>Cancel</Button>
                        <Button type='submit'>Export</Button>
                    </ButtonGroup>
                </DialogActions>
            </Box>
        </Dialog>

    );
}

export default ExportDialog;