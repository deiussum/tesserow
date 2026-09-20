import { createTheme } from '@mui/material/styles';

// Built around the app's existing dark navy background/light text (previously
// only set via index.css, with MUI components left on their light default)
// rather than introducing new colors - see design.md under add-app-shell-layout.
const theme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#05405c',
            paper: '#0a5478',
        },
        text: {
            primary: '#dcdcdc',
        },
    },
});

export default theme;
