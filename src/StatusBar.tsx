

interface StatusBarProps {
    leftText?: string
    middleText?: string
    rightText?: string
}

const style = {
    width: '100%',
    position: 'fixed' as 'fixed',
    bottom: 0,
    backgroundColor: '#05405c',
    height: '30px'
}

const StatusBar = (props: StatusBarProps) => {

    return (
        <div style={style}>
            <span style={{float: 'left', paddingLeft: '1em'}}>
                {props.leftText}
            </span>
            <span style={{float: 'left', paddingLeft: '1em'}}>
                {props.middleText}
            </span>
            <span style={{float: 'right', paddingRight: '1em'}}>
                {props.rightText}
            </span>
        </div>
    );
};

export default StatusBar;