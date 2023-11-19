import { useEffect, useState } from 'react';
import mosaic from './Mosaic';

interface WrittenPatternDialogProps {
    dialogClosed?: () => void
}

const WrittenPatternDialog = (props: WrittenPatternDialogProps) => {

    const [ writtenPattern ] = useState(mosaic.data.getWrittenPattern());

    const copyWrittenPattern = () => {
        var patternText = document.getElementById('written-pattern-text');
        var range = document.createRange();
        range.selectNode(patternText);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
    }

    return (
        <div id="written-pattern">
            <button id="close-written-pattern" onClick={props.dialogClosed}>Close</button>
            <button id="copy-written-pattern" onClick={copyWrittenPattern}>Copy</button>
            <div id="written-pattern-text">
                {writtenPattern}
            </div>
        </div>
    );
}

export default WrittenPatternDialog;