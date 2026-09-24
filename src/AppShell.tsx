import { ReactNode, useState, MouseEvent } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { lighten, Theme } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import styles from './AppShell.module.css';
import { PATTERN_PANEL_DEFAULT_WIDTH } from './WrittenPatternDialog';

interface AppShellProps {
    mosaicOpen: boolean;
    newMosaicClicked?: () => void;
    loadMosaicClicked?: () => void;
    importImageClicked?: () => void;
    toggleWrittenPatternClicked?: () => void;
    exportClicked?: () => void;
    saveClicked?: () => void;
    closeClicked?: () => void;
    exitClicked?: () => void;
    zoomInClicked?: () => void;
    zoomOutClicked?: () => void;
    zoomResetClicked?: () => void;
    aboutClicked?: () => void;
    rightPanelOpen?: boolean;
    rightPanelWidth?: number;
    rightPanelContent?: ReactNode;
    statusBar?: ReactNode;
    children?: ReactNode;
}

const shortcutTextSx = { display: 'flex', justifyContent: 'space-between', minWidth: '12em' };

const MENU_BAR_HEIGHT = 30;

// An open trigger and its menu share this background so they read as one
// piece attached to the bar, rather than a menu floating below a button.
const openMenuBackground = (theme: Theme) => lighten(theme.palette.background.paper, 0.08);

const menuTriggerSx = (open: boolean) => ({
    color: 'inherit',
    minWidth: 0,
    height: '100%',
    px: 1.25,
    borderRadius: 0,
    ...(open ? {
        backgroundColor: openMenuBackground,
        '&:hover': { backgroundColor: openMenuBackground },
    } : {}),
});

const attachedMenuProps = (align: 'left' | 'right') => ({
    anchorOrigin: { vertical: 'bottom', horizontal: align },
    transformOrigin: { vertical: 'top', horizontal: align },
    slotProps: {
        paper: {
            sx: {
                borderRadius: 0,
                backgroundColor: openMenuBackground,
                backgroundImage: 'none',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.35)',
            },
        },
        list: { sx: { py: 0.5 } },
    },
} as const);

const AppShell = (props: AppShellProps) => {
    const [ fileMenuAnchor, setFileMenuAnchor ] = useState<HTMLElement | null>(null);
    const [ viewMenuAnchor, setViewMenuAnchor ] = useState<HTMLElement | null>(null);
    const [ helpMenuAnchor, setHelpMenuAnchor ] = useState<HTMLElement | null>(null);

    const openFileMenu = (e: MouseEvent<HTMLElement>) => setFileMenuAnchor(e.currentTarget);
    const openViewMenu = (e: MouseEvent<HTMLElement>) => setViewMenuAnchor(e.currentTarget);
    const openHelpMenu = (e: MouseEvent<HTMLElement>) => setHelpMenuAnchor(e.currentTarget);

    const fileItemClicked = (action?: () => void) => {
        setFileMenuAnchor(null);
        action?.();
    };
    const viewItemClicked = (action?: () => void) => {
        setViewMenuAnchor(null);
        action?.();
    };
    const helpItemClicked = (action?: () => void) => {
        setHelpMenuAnchor(null);
        action?.();
    };

    return (
        <div className={styles.shell}>
            {/* backgroundImage: 'none' drops MUI's dark-mode elevation overlay, which
                would otherwise lighten the bar to the same shade as an open menu and
                hide the open trigger's highlight. */}
            <AppBar position='static' sx={{ backgroundColor: 'background.paper', backgroundImage: 'none' }}>
                <Box role='group' aria-label='application menu bar' sx={{ display: 'flex', height: MENU_BAR_HEIGHT, px: 0.5 }}>
                    <Button sx={menuTriggerSx(Boolean(fileMenuAnchor))} onClick={openFileMenu}>File</Button>
                    <Button sx={menuTriggerSx(Boolean(viewMenuAnchor))} onClick={openViewMenu} disabled={!props.mosaicOpen}>View</Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button sx={menuTriggerSx(Boolean(helpMenuAnchor))} onClick={openHelpMenu}>Help</Button>
                </Box>

                <Menu {...attachedMenuProps('left')} anchorEl={fileMenuAnchor} open={Boolean(fileMenuAnchor)} onClose={() => setFileMenuAnchor(null)}>
                    <MenuItem sx={shortcutTextSx} onClick={() => fileItemClicked(props.newMosaicClicked)}>
                        <span>New...</span>
                        <Typography variant='body2' color='text.secondary'>Ctrl+N</Typography>
                    </MenuItem>
                    <MenuItem sx={shortcutTextSx} onClick={() => fileItemClicked(props.loadMosaicClicked)}>
                        <span>Open...</span>
                        <Typography variant='body2' color='text.secondary'>Ctrl+O</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => fileItemClicked(props.importImageClicked)}>
                        Import Image...
                    </MenuItem>
                    <Divider />
                    <MenuItem sx={shortcutTextSx} disabled={!props.mosaicOpen} onClick={() => fileItemClicked(props.saveClicked)}>
                        <span>Save...</span>
                        <Typography variant='body2' color='text.secondary'>Ctrl+S</Typography>
                    </MenuItem>
                    <MenuItem disabled={!props.mosaicOpen} onClick={() => fileItemClicked(props.exportClicked)}>
                        Export to PDF...
                    </MenuItem>
                    <MenuItem disabled={!props.mosaicOpen} onClick={() => fileItemClicked(props.closeClicked)}>
                        Close
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => fileItemClicked(props.exitClicked)}>
                        Exit
                    </MenuItem>
                </Menu>

                <Menu {...attachedMenuProps('left')} anchorEl={viewMenuAnchor} open={Boolean(viewMenuAnchor)} onClose={() => setViewMenuAnchor(null)}>
                    <MenuItem onClick={() => viewItemClicked(props.zoomInClicked)}>Zoom In</MenuItem>
                    <MenuItem onClick={() => viewItemClicked(props.zoomOutClicked)}>Zoom Out</MenuItem>
                    <MenuItem onClick={() => viewItemClicked(props.zoomResetClicked)}>Reset Zoom</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => viewItemClicked(props.toggleWrittenPatternClicked)}>
                        <ListItemIcon>
                            {props.rightPanelOpen ? <CheckIcon fontSize='small' /> : null}
                        </ListItemIcon>
                        <ListItemText>Written Pattern</ListItemText>
                    </MenuItem>
                </Menu>

                <Menu {...attachedMenuProps('right')} anchorEl={helpMenuAnchor} open={Boolean(helpMenuAnchor)} onClose={() => setHelpMenuAnchor(null)}>
                    <MenuItem onClick={() => helpItemClicked(props.aboutClicked)}>About Tesserow</MenuItem>
                </Menu>
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
                            right: props.rightPanelOpen ? (props.rightPanelWidth ?? PATTERN_PANEL_DEFAULT_WIDTH) : 0,
                            backgroundColor: 'background.paper',
                            borderRadius: '4px 0 0 4px',
                        }}
                    >
                        {props.rightPanelOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                ) : null}
            </div>
            {props.mosaicOpen && props.statusBar ? (
                <div className={styles.statusBarRow}>
                    {props.statusBar}
                </div>
            ) : null}
        </div>
    );
}

export default AppShell;
