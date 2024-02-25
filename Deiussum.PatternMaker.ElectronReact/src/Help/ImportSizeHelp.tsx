import Box from '@mui/material/Box';
import DialogContentText from '@mui/material/DialogContentText';

const ImportSizeHelp = () => {
    return (
        <Box my={1}>
            <DialogContentText>
                If your image was larger than 300px, it has been resized to fit within a 300x300 px area.  Going larger than
                this is not recommended.  You can adjust the size here and it will resize when you click import.  If you want
                to preview the image at that size before the import, you can click on the "Apply" button to update the preview.
            </DialogContentText>
        </Box>
    )
}

export default ImportSizeHelp;