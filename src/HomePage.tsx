import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Container from '@mui/material/Container';
import styles from './HomePage.module.css';

interface HomePageProps {
    newMosaicClicked?: () => void;
    loadMosaicClicked?: () => void;
    importImageClicked?: () => void;
}

const HomePage = (props: HomePageProps) => {

    return (
        <Container className={styles.background}>
            <div className={styles.contentArea}>
                <ButtonGroup variant='contained' orientation='vertical' aria-label='outlined primary button group'>
                    <Button onClick={props.newMosaicClicked}>Create New</Button>
                    <Button onClick={props.loadMosaicClicked}>Load File</Button>
                    <Button onClick={props.importImageClicked}>Import Image</Button>
                </ButtonGroup>
            </div>
        </Container>
    );
}

export default HomePage;