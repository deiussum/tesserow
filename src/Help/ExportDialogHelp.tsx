import Box from '@mui/material/Box';
import DialogContentText from '@mui/material/DialogContentText';

const ExportDialogHelp = () => {
    return (
        <Box sx={{ my: 1 }}>
            <DialogContentText>
                <h3>Additional PDF</h3>
                <p>
                    If you want to include additional instructions for your PDF, you can select a PDF version of those instructions
                    here and it will be placed at the start of your exported PDF.
                </p>

                <h3>Starting page</h3>
                <p>
                    If you've included an additional PDF with instructions, you may want to start the page numbering for the chart
                    and written pattern at a different number.  For instance, if you include instructions that are 2 pages long,
                    you can set the starting page at 3, and the chart/written pattern will be numbered starting at page 3.
                </p>

                <h3>Include chart</h3>
                <p>
                    Checking this box will include pages for the chart in the exported PDF.
                </p>

                <h3>Include written pattern</h3>
                <p>
                    Checking this box will include the written pattern in the exported PDF.
                </p>

                <h3>Export file name</h3>
                <p>
                    This is where you will select the location you want to export your file to.
                </p>

            </DialogContentText>
        </Box>
    )
}

export default ExportDialogHelp;