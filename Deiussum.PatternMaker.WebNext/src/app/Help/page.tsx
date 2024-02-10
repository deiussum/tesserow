
const Help = () => {
    return (
        <>
            <h1>Help page</h1>
            <ul>
                <li>Start a new mosaic.</li>
                <li>Import an image to use as a mosaic.</li>
                <li>Modifying a mosaic.</li>
                <li>Exporting a mosaic to PDF.</li>
            </ul>

            <div>
                <h2>Start a new mosaic</h2>
                <p>
                    From the home screen, click on the Create button to create a new mosaic from scratch.  Select the width and height from 
                    the dialog and click create. 
                </p>
            </div>
            <div>
                <h2>Import an image to use as a mosaic</h2>
                <p>
                    From the home screen, click on the Import button to import a mosaic from an image.  There are several options here to
                    affect the import.
                </p>
                <ul>
                    <li>
                        Threshold - this adjusts the point at which a pixel in the image becomes black or white.  Move it to the left to reduce 
                        the amount of black, and move it to the right to increase it.  The preview image will change as you adjust the slider.
                    </li>
                    <li>
                        Dimensions (width & height) - this adjusts the width and height of the image.  Depending on the size of the pattern, you
                        probably do not want to adjust this much past the 300s.  The import process starts off by resizing your image to fit in a 
                        300x300 square.  As you enter the width or height, it will automatically adjust the other value in order to maintain the                        
                        same perspective.  If you want to update the preview with the new size, hit the view button next to the input boxes.
                    </li>
                    <li>
                        Starting rows - TBD
                    </li>
                </ul>
            </div>
            <div>
                <h2>Modifying a mosaic</h2>
                <p>
                    Once you have a mosaic showing in the editor, you can swap between what colors each square is.  The application will prevent you
                    from changing something that would make the mosaic invalid, so you if you are initially unable to change a square of the grid, you
                    can try adjusting the squares above and below it so that you have a valid pattern.
                </p>
            </div>
            <div>
                <h2>Exporting a Mosaic to a PDF</h2>
                <p>
                    Once you are ready to export your PDF, you can click on the Export button in the editor.  This will present a dialog with the following
                    options:
                </p>
                <ul>
                    <li>
                        Additional PDF - If you have instructions you would like to include at the beginning of the pattern, check the box here
                        and select a PDF file to include.
                    </li>
                    <li>Include chart - Check this to include the chart of the mosaic in the export.</li>
                    <li>Include written pattern - Check this to include the written pattern in the export.</li>
                    <li>
                        Starting page - If you want to start the page count on something other than page 1, enter the first page number here.
                        This can be useful if you have included an additional PDF and want to begin the page count after the number of pages 
                        in that additional PDF.
                    </li>
                    <li>Export file - Select a file location and name to export your PDF to.</li>
                </ul>
            </div>
        </>
    )
}

export default Help;