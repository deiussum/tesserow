import { useState } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import mosaic from './Mosaic';
import style from './WrittenPatternDialog.module.css';

interface WrittenPatternDialogProps {
    open: boolean,
    dialogClosed?: () => void
}

const WrittenPatternDialog = (props: WrittenPatternDialogProps) => {

    const [ writtenPattern ] = useState(mosaic.data.getWrittenPattern());

    const copyWrittenPattern = () => {
        const patternText = document.getElementById('written-pattern-text');
        const range = document.createRange();
        range.selectNode(patternText);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
    }

    return (
        <Dialog open={props.open}>
            <DialogTitle>Written Pattern</DialogTitle>
            <DialogContent>
                <DialogContentText>Below is the written pattern.  You can click the Copy button to copy it to the clipboard.</DialogContentText>
                <div className={style.writtenPatternText}>
                    {writtenPattern}
                </div>
            </DialogContent>
            <DialogActions>
                <ButtonGroup variant='contained'>
                    <Button onClick={props.dialogClosed}>Close</Button>
                    <Button onClick={copyWrittenPattern}>Copy</Button>
                </ButtonGroup>
            </DialogActions>
        </Dialog>
    );
}

export default WrittenPatternDialog;