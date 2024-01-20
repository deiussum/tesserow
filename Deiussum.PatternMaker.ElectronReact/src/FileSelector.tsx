import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FolderIcon from '@mui/icons-material/FolderOpen';
import TextField from '@mui/material/TextField';

interface FileSelectorProps {
    extensions?: string;
    value?: string;
    save?: boolean;
    label?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    visible?: boolean;
    error?: boolean;
    onChange?: (fileName: string) => void;
}

const FileSelector = (props: FileSelectorProps) => {
    const [ fileName, setFileName ] = useState(props.value)

    const selectFile = async () => {
        const filters = [{ extensions: ['pdf'],  name: 'PDF files'}];
        const response = await (window as any).dialogs.getFileName(filters, props.save);
        if (response.success === true) {
            setFileName(response.result);
            props.onChange(response.result);
        }
    }
    
    const visibility = props.visible === false ? 'collapse' : 'visible';

    return (
     <Box my={2} visibility={visibility}>
        <span>
            <TextField label={props.label} 
                name={props.name} 
                value={fileName} 
                inputProps={{readOnly: true}}
                InputLabelProps={{shrink: true}} 
                size={'medium'}
                fullWidth={true}
                required={props.required}
                error={props.error}
            />
            <Button variant='outlined' 
                onClick={selectFile} 
                disabled={props.disabled}><FolderIcon /></Button>
        </span>
     </Box>   
    );
}

export default FileSelector;