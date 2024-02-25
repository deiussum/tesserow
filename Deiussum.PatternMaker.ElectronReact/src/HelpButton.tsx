import { useState, ReactNode } from 'react';
import Button from '@mui/material/Button';
import HelpIcon from '@mui/icons-material/Help';
import HelpDialog from './HelpDialog';

interface HelpButtonProps
{
    children?: ReactNode
}

const HelpButton = (props: HelpButtonProps)  =>
{
    const [ showHelp, setShowHelp ] = useState(false);

    const onClickIcon = () => {
        setShowHelp(true);
    }

    const onCloseHelp = () => {
        setShowHelp(false);
    }

    return (
        <>
            <Button onClick={onClickIcon}><HelpIcon /></Button>
            
            <HelpDialog open={showHelp} onClose={onCloseHelp} >
                {props.children}
            </HelpDialog>
        </>
    )
}

export default HelpButton;