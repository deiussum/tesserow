import { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';

interface ThresholdDialogProps {
    data?: any;
    open: boolean;
    handleClose: () => void;
    onImagePreviewComplete?: (threshold: number, data: any, newWidth: number, newHeight: number) => void;
};

const ImagePreviewDialog = (props: ThresholdDialogProps) => {
    const [ threshold, setThreshold ] = useState(-1);
    const [ inputs, setInputs ] = useState({ threshold: -1, width: props.data.width, height: props.data.height } );
    const canvasRef = useRef(null);

    const drawImage = () => {
        let canvas = canvasRef.current;

        if (!canvas || !props.open) return;

        canvas.width = props.data.width * 2;
        canvas.height = props.data.height * 2;

        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        for(let row = 0; row < props.data.height; row++) {
            for (let col = 0; col < props.data.width; col++) {
                var color = props.data.data[row][col];

                ctx.fillStyle = color >= threshold ? "white" : "black";
                ctx.fillRect(col, row, col, row);
            }
        }
    };

    const thresholdChange = (e:Event, value:number) => {
        setThreshold(value)
    }

    const setSize = (e:React.ChangeEvent<any>) => {
        const aspect = props.data.width / props.data.height;
        const newWidth = e.target.name === "width" ? e.target.value : (e.target.value * aspect).toFixed(0);
        const newHeight = e.target.name === "height" ? e.target.value : (e.target.value / aspect).toFixed(0);

        setInputs({ ...inputs, width: newWidth, height: newHeight });
    }

    const importClicked = () => {
        props.onImagePreviewComplete(threshold, props.data, Number(inputs.width), Number(inputs.height));
    }

    useEffect(() => {

        if (threshold >= 0) {
            drawImage();
        } 
        else {
            // This is a hack for now.  For some reason, the initial useEffect triggers before the canvas is available. 
            // This is to introduce a slight delay.
            setThreshold(128);
        }
    }, [threshold]);

    return (
        <Dialog open={props.open} onClose={props.handleClose}>
            <DialogTitle>Image Preview</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Adjust the size of the image and the threshold to get the desired black/white ratio
                </DialogContentText>
                <span>Current Threshold: {threshold}</span>
                <Slider defaultValue={128} onChange={thresholdChange} min={0} max={255} step={1} />
                <TextField label="Width" name="width" value={inputs.width} type="number" onChange={setSize}></TextField>
                <TextField label="Height" name="height" value={inputs.height} type="number" onChange={setSize}></TextField>
                <canvas id='threshold-canvas' ref={canvasRef}></canvas>
            </DialogContent>
            <DialogActions>
                <ButtonGroup variant='contained'>
                    <Button onClick={props.handleClose}>Cancel</Button>
                    <Button onClick={importClicked}>Import</Button>
                </ButtonGroup>
            </DialogActions>
        </Dialog>
    );
}

export default ImagePreviewDialog;