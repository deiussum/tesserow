import { useEffect, useState } from 'react';
import mosaic from './Mosaic';
import WrittenPatternDialog from './WrittenPatternDialog';

const MosaicEditor = () => {
    const [ writtenPatternDialogShown, setWrittenPatternDialogShown ] = useState(false);

    useEffect(() => {
        mosaic.setupCanvas();
    });

    const showWrittenPatternClicked = () => {
        setWrittenPatternDialogShown(true);
    }

    const closeWrittenPatternClicked = () => {
        setWrittenPatternDialogShown(false);
    }

    const exportClicked = async () => {
        const data = {
            chartPages: mosaic.data.getChartPageData(),
            writtenPatternLines: mosaic.data.getWrittenPatternLines(16, 65)
        };
        await (window as any).dialogs.export(data);
    }

    const saveClicked = async() => {
        const data = mosaic.data.getSaveData();
        await (window as any).dialogs.save(data);
    }

    return(
        <>
            <div id="mosaic-chart">
                <div>
                    <button id="show-written-pattern" onClick={showWrittenPatternClicked}>Show Written Pattern</button>
                    <button id="export-chart" onClick={exportClicked}>Export to PDF...</button>
                    <button id="save-chart" onClick={saveClicked}>Save...</button>
                </div>
                <canvas id="mosaic-canvas"></canvas>
            </div>
            {writtenPatternDialogShown ? <WrittenPatternDialog dialogClosed={closeWrittenPatternClicked} /> : null }
        </>
    )
}

export default MosaicEditor;