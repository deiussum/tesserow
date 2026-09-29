import { useState, MouseEvent } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0];

interface StatusBarProps {
    leftText?: string
    middleText?: string
    rightText?: string
    onZoomIn?: () => void
    onZoomOut?: () => void
    onZoomReset?: () => void
    onZoomPresetSelected?: (zoom: number) => void
}

const StatusBar = (props: StatusBarProps) => {
    const [ presetMenuAnchor, setPresetMenuAnchor ] = useState<HTMLElement | null>(null);

    const openPresetMenu = (event: MouseEvent<HTMLElement>) => {
        setPresetMenuAnchor(event.currentTarget);
    };

    const closePresetMenu = () => {
        setPresetMenuAnchor(null);
    };

    const presetSelected = (zoom: number) => {
        closePresetMenu();
        props.onZoomPresetSelected?.(zoom);
    };

    const zoomControlsShown = props.onZoomIn || props.onZoomOut || props.onZoomReset;

    return (
        <Box
            sx={{
                width: '100%',
                backgroundColor: 'background.paper',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <span style={{paddingLeft: '1em'}}>
                {props.leftText}
            </span>
            <span style={{paddingLeft: '1em'}}>
                {props.middleText}
            </span>
            <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: '0.5em' }}>
                {zoomControlsShown ? (
                    <>
                        <IconButton size='small' onClick={props.onZoomOut} aria-label='Zoom out'>
                            <ZoomOutIcon fontSize='small' />
                        </IconButton>
                        <IconButton size='small' onClick={props.onZoomReset} aria-label='Reset zoom'>
                            <RestartAltIcon fontSize='small' />
                        </IconButton>
                        <IconButton size='small' onClick={props.onZoomIn} aria-label='Zoom in'>
                            <ZoomInIcon fontSize='small' />
                        </IconButton>
                    </>
                ) : null}
                <span
                    onClick={props.onZoomPresetSelected ? openPresetMenu : undefined}
                    style={{
                        paddingLeft: '0.5em',
                        paddingRight: '0.5em',
                        cursor: props.onZoomPresetSelected ? 'pointer' : undefined,
                    }}
                >
                    {props.rightText}
                </span>
                {props.onZoomPresetSelected ? (
                    <Menu
                        anchorEl={presetMenuAnchor}
                        open={Boolean(presetMenuAnchor)}
                        onClose={closePresetMenu}
                    >
                        {ZOOM_PRESETS.map((zoom) => (
                            <MenuItem key={zoom} onClick={() => presetSelected(zoom)}>
                                {(zoom * 100).toFixed(0)}%
                            </MenuItem>
                        ))}
                    </Menu>
                ) : null}
            </Box>
        </Box>
    );
};

export default StatusBar;
