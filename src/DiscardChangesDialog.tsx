import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface DiscardChangesDialogProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const DiscardChangesDialog = (props: DiscardChangesDialogProps) => {
    return (
        <Dialog open={props.open}>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    This mosaic has unsaved changes. Continuing will discard them.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel}>Cancel</Button>
                <Button variant='contained' color='error' onClick={props.onConfirm}>Discard</Button>
            </DialogActions>
        </Dialog>
    );
}

export default DiscardChangesDialog;
