import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import mosaic from './Mosaic';
import style from './WrittenPatternDialog.module.css';

const WrittenPatternDialog = () => {
    const writtenPattern = mosaic.data ? mosaic.data.getWrittenPattern() : null;

    const copyWrittenPattern = () => {
        const patternText = document.getElementById('written-pattern-text');
        const range = document.createRange();
        range.selectNode(patternText);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
    }

    return (
        <Box className={style.panel}>
            <Typography variant='h6'>Written Pattern</Typography>
            <Typography variant='body2'>Below is the written pattern. You can click the Copy button to copy it to the clipboard.</Typography>
            <div id='written-pattern-text' className={style.writtenPatternText}>
                {writtenPattern}
            </div>
            <Button variant='contained' onClick={copyWrittenPattern}>Copy</Button>
        </Box>
    );
}

export default WrittenPatternDialog;
