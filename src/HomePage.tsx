import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import styles from './HomePage.module.css';

interface HomePageProps {
    newMosaicClicked?: () => void;
    loadMosaicClicked?: () => void;
    importImageClicked?: () => void;
}

const HomePage = (props: HomePageProps) => {
    return (
        <div className={styles.background}>
            <Typography variant='h4' component='h1' className={styles.wordmark}>
                Tesserow
            </Typography>
            <Paper className={styles.startCard} elevation={4}>
                <Stack spacing={2}>
                    <Button variant='contained' size='large' onClick={props.newMosaicClicked}>
                        New Mosaic
                    </Button>
                    <Button variant='outlined' onClick={props.loadMosaicClicked}>
                        Open...
                    </Button>
                    <Button variant='outlined' onClick={props.importImageClicked}>
                        Import Image
                    </Button>
                </Stack>
            </Paper>
        </div>
    );
}

export default HomePage;
