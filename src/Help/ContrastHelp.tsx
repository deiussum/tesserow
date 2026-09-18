import Box from '@mui/material/Box';
import DialogContentText from '@mui/material/DialogContentText';

const ContrastHelp = () => {
    return (
        <Box sx={{ my: 1 }}>
            <DialogContentText>
                Your image has been adjusted to be pure black and white.  You can adjust the threshold slider to adjust the 
                point at which a pixel is converted to black and white in order to get the best looking image.  If your image
                already was only black and white with nothing in between, this slider will have no effect unless you slide it
                all the way to one end or the other.
            </DialogContentText>
        </Box>
    )
}

export default ContrastHelp;