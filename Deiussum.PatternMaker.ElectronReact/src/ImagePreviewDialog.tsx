import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';

interface ImagePreviewDialogProps {
    data?: any;
    open: boolean;
    handleClose: () => void;
    onImagePreviewComplete?: (threshold: number, data: any, newWidth: number, newHeight: number, extraRows: number) => void;
    onResizePreviewData?: (data: any, width: number, height: number) => void;
};

const thresholdCanvasStyle = {
    border: '1px black solid'
};

const ImagePreviewDialog = (props: ImagePreviewDialogProps) => {
    const [ threshold, setThreshold ] = useState(-1);
    const [ inputs, setInputs ] = useState({ 
        threshold: -1, 
        width: props.data.width, 
        height: props.data.height, 
        extraRowsChecked: false, 
        extraRows: 1
    });
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

    const setInput = (e:React.ChangeEvent<any>) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value});
    }

    const setBooleanInput = (e:React.ChangeEvent<any>) => {
        const value = e.target.checked;
        setInputs({ ...inputs, [e.target.name]: value});
    }

    const importClicked = (evt: React.FormEvent<HTMLFormElement>) => {
        evt.preventDefault();
        const extraRows = inputs.extraRowsChecked ? Number(inputs.extraRows) : 0;
        props.onImagePreviewComplete(threshold, props.data, Number(inputs.width), Number(inputs.height), extraRows);
    }

    const resizeClicked = () => {
        if (inputs.width > 0 && inputs.height > 0) {
            props.onResizePreviewData(props.data, Number(inputs.width), Number(inputs.height));
        }
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
        <Dialog open={props.open} onClose={props.handleClose} fullScreen>
            <DialogTitle>Image Preview</DialogTitle>
            <Box component="form" onSubmit={importClicked}>
                <DialogContent>
                    <DialogContentText>
                        Adjust the properties image before importing.
                    </DialogContentText>
                    <Grid container spacing={2}>
                        <Grid xs={6}>
                            <Box my={2}>
                                <Divider />
                            </Box>
                            <Box my={1}>
                                <DialogContentText>
                                    Your image has been adjusted to be pure black and white.  You can adjust the threshold slider to adjust the 
                                    point at which a pixel is converted to black and white in order to get the best looking image.  If your image
                                    already was only black and white with nothing in between, this slider will have no effect unless you slide it
                                    all the way to one end or the other.
                                </DialogContentText>
                            </Box>
                            <Box my={1}>
                                <span>Current Threshold: {threshold}</span>
                                <Slider defaultValue={128} onChange={thresholdChange} min={0} max={255} step={1} />
                            </Box>
                            <Box my={2}>
                                <Divider />
                            </Box>
                            <Box my={1}>
                                <DialogContentText>
                                    If your image was larger than 300px, it has been resized to fit within a 300x300 px area.  Going larger than
                                    this is not recommended.  You can adjust the size here and it will resize when you click import.  If you want
                                    to preview the image at that size before the import, you can click on the "Apply" button to update the preview.
                                </DialogContentText>
                            </Box>
                            <Box my={1}>
                                <TextField label="Width" name="width" value={inputs.width} type="number" onChange={setSize} required={true} />
                                <TextField label="Height" name="height" value={inputs.height} type="number" onChange={setSize} required={true} />
                                <Button onClick={resizeClicked} >Apply</Button>
                            </Box>
                            <Box my={2}>
                                <Divider />
                            </Box>
                            <Box my={1}>
                                <DialogContentText>
                                    If you want your pattern to include a number of border rows, click the checkbox here and set the number of rows
                                    you want to use.  This will set that many rows on the top and bottom to the first color.
                                </DialogContentText>
                                <FormControlLabel label="Include extra starting row" 
                                                control={<Checkbox name="extraRowsChecked" 
                                                                    checked={inputs.extraRowsChecked} 
                                                                    onChange={setBooleanInput}/>}/>
                            </Box>
                            <Box my={1}>
                                <TextField label="Extra rows" 
                                        name="extraRows" 
                                        value={inputs.extraRows} 
                                        disabled={!inputs.extraRowsChecked} 
                                        type="number" 
                                        onChange={setInput}
                                        required={inputs.extraRowsChecked}/>
                            </Box>
                        </Grid>
                        <Grid xs={6}>
                            <Box mx={2}>
                                <canvas ref={canvasRef} style={thresholdCanvasStyle}></canvas>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <ButtonGroup variant='contained'>
                        <Button onClick={props.handleClose}>Cancel</Button>
                        <Button type='submit'>Import</Button>
                    </ButtonGroup>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default ImagePreviewDialog;