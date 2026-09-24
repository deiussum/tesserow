import { createTheme } from '@mui/material/styles';

// Built around the app's existing dark navy background/light text (previously
// only set via index.css, with MUI components left on their light default)
// rather than introducing new colors - see design.md under add-app-shell-layout.
// Primary is an amber accent chosen to contrast with the cool navy, replacing
// MUI's default pastel blue - see design.md under refine-menu-bar-and-accent.
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#f2b544',
        },
        // Deeper than MUI's dark-mode default red, which only reaches ~3.7:1
        // against the white label on contained buttons (Discard).
        error: {
            main: '#d32f2f',
        },
        background: {
            default: '#05405c',
            paper: '#0a5478',
        },
        text: {
            primary: '#dcdcdc',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                // Show labels in their written case rather than MUI's default ALL CAPS.
                root: { textTransform: 'none' },
            },
        },
    },
});

export default theme;
