import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

interface HomePageProps {
    newMosaicClicked?: () => void;
    loadMosaicClicked?: () => void;
    importImageClicked?: () => void;
}

const HomePage = (props: HomePageProps) => {

    return (
        <div>
            <h1>Deiussum's Pattern Maker</h1>
            <ButtonGroup variant='contained' aria-label='outlined primary button group'>
                <Button onClick={props.newMosaicClicked}>Create New</Button>
                <Button onClick={props.loadMosaicClicked}>Load File</Button>
                <Button onClick={props.importImageClicked}>Import Image</Button>
            </ButtonGroup>
        </div>
    );
}

export default HomePage;