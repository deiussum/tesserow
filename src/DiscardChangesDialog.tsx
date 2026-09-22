import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
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
                <ButtonGroup variant='contained'>
                    <Button onClick={props.onCancel}>Cancel</Button>
                    <Button onClick={props.onConfirm}>Discard</Button>
                </ButtonGroup>
            </DialogActions>
        </Dialog>
    );
}

export default DiscardChangesDialog;
