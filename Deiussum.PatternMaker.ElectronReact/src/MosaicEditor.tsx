import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import mosaic from './Mosaic';
import WrittenPatternDialog from './WrittenPatternDialog';

interface MosaicEditorProps  {
    closeClicked?: () => void;
};

const MosaicEditor = (props: MosaicEditorProps) => {
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
                <ButtonGroup variant='contained' aria-label='outlined primary button group'>
                    <Button onClick={showWrittenPatternClicked}>Show Written Pattern</Button>
                    <Button onClick={exportClicked}>Export to PDF</Button>
                    <Button onClick={saveClicked}>Save</Button>
                    <Button onClick={props.closeClicked}>Close</Button>
                </ButtonGroup>
                <canvas id="mosaic-canvas"></canvas>
            </div>
            <WrittenPatternDialog open={writtenPatternDialogShown} dialogClosed={closeWrittenPatternClicked} />
        </>
    )
}

export default MosaicEditor;