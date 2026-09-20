import { ReactNode } from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import styles from './AppShell.module.css';

// Keep in sync with the panel width set in WrittenPatternDialog.module.css - the
// handle needs to know it to sit flush against the drawer's edge when it's open.
const PATTERN_PANEL_WIDTH = 360;

interface AppShellProps {
    mosaicOpen: boolean;
    newMosaicClicked?: () => void;
    loadMosaicClicked?: () => void;
    importImageClicked?: () => void;
    toggleWrittenPatternClicked?: () => void;
    exportClicked?: () => void;
    saveClicked?: () => void;
    zoomInClicked?: () => void;
    zoomOutClicked?: () => void;
    closeClicked?: () => void;
    rightPanelOpen?: boolean;
    rightPanelContent?: ReactNode;
    children?: ReactNode;
}

const AppShell = (props: AppShellProps) => {
    return (
        <div className={styles.shell}>
            <AppBar position='static' sx={{ backgroundColor: 'background.paper' }}>
                <ButtonGroup variant='contained' aria-label='outlined primary button group'>
                    {props.mosaicOpen ? (
                        <>
                            <Button onClick={props.exportClicked}>Export to PDF</Button>
                            <Button onClick={props.saveClicked}>Save</Button>
                            <Button onClick={props.zoomInClicked}>Zoom In</Button>
                            <Button onClick={props.zoomOutClicked}>Zoom Out</Button>
                            <Button onClick={props.closeClicked}>Close</Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={props.newMosaicClicked}>Create New</Button>
                            <Button onClick={props.loadMosaicClicked}>Load File</Button>
                            <Button onClick={props.importImageClicked}>Import Image</Button>
                        </>
                    )}
                </ButtonGroup>
            </AppBar>
            <div className={styles.body}>
                <div className={styles.content}>
                    {props.children}
                </div>
                {props.rightPanelOpen ? (
                    <Drawer
                        variant='persistent'
                        anchor='right'
                        open={props.rightPanelOpen}
                        // MUI's Drawer paper defaults to position:fixed spanning the
                        // full viewport height even for the persistent variant, which
                        // overlaps the AppBar above it. Confine it to this flex row instead.
                        slotProps={{ paper: { sx: { position: 'relative' } } }}
                    >
                        {props.rightPanelContent}
                    </Drawer>
                ) : null}
                {props.mosaicOpen ? (
                    <IconButton
                        onClick={props.toggleWrittenPatternClicked}
                        aria-label={props.rightPanelOpen ? 'Hide written pattern' : 'Show written pattern'}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            right: props.rightPanelOpen ? PATTERN_PANEL_WIDTH : 0,
                            backgroundColor: 'background.paper',
                            borderRadius: '4px 0 0 4px',
                        }}
                    >
                        {props.rightPanelOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                ) : null}
            </div>
        </div>
    );
}

export default AppShell;
