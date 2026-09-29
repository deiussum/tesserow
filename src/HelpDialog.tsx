import { ReactNode } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

interface HelpDialogProperties {
    children?: ReactNode;
    open?: boolean;
    onClose?: () => void;
}

const HelpDialog = (props: HelpDialogProperties) => {
    return (
        <Dialog open={props.open}>
            <DialogTitle>Help</DialogTitle>
            <DialogContent>
                {props.children}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default HelpDialog;