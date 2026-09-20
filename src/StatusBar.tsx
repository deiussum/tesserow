import Box from '@mui/material/Box';

interface StatusBarProps {
    leftText?: string
    middleText?: string
    rightText?: string
}

const StatusBar = (props: StatusBarProps) => {

    return (
        <Box
            sx={{
                width: '100%',
                position: 'fixed',
                bottom: 0,
                backgroundColor: 'background.paper',
                height: '30px',
            }}
        >
            <span style={{float: 'left', paddingLeft: '1em'}}>
                {props.leftText}
            </span>
            <span style={{float: 'left', paddingLeft: '1em'}}>
                {props.middleText}
            </span>
            <span style={{float: 'right', paddingRight: '1em'}}>
                {props.rightText}
            </span>
        </Box>
    );
};

export default StatusBar;
