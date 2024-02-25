import { useState, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface HelpDialogProperties {
    children?: ReactNode;
    open?: boolean;
    onClose?: () => void;
}

const HelpDialog = (props: HelpDialogProperties) => {

    const close = () => {

    }

    return (
        <Dialog open={props.open}>
            <DialogTitle>Help</DialogTitle>
            <DialogContent>
                {props.children}
            </DialogContent>
            <DialogActions>
                <ButtonGroup variant='contained'>
                    <Button onClick={props.onClose}>Close</Button>
                </ButtonGroup>
            </DialogActions>
        </Dialog>
    );
}

export default HelpDialog;