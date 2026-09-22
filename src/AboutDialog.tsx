import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import packageJson from '../package.json';

interface AboutDialogProps {
    open: boolean;
    onClose: () => void;
}

const AboutDialog = (props: AboutDialogProps) => {
    return (
        <Dialog open={props.open}>
            <DialogTitle>About {packageJson.productName}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Version {packageJson.version}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <ButtonGroup variant='contained'>
                    <Button onClick={props.onClose}>Close</Button>
                </ButtonGroup>
            </DialogActions>
        </Dialog>
    );
}

export default AboutDialog;
