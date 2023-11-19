

interface HomePageProps {
    newMosaicClicked?: () => void;
    loadMosaicClicked?: () => void;
    importImageClicked?: () => void;
}

const HomePage = (props: HomePageProps) => {

    return (
        <div>
            <h1>Deiussum's Pattern Maker</h1>
            <div id="initialButtons">
                <button id="openNewMosaic" onClick={props.newMosaicClicked}>Create New</button>
                <button id="loadMosaic" onClick={props.loadMosaicClicked}>Load File</button>
                <button id="importImage" onClick={props.importImageClicked}>Import Image</button>
            </div>
        </div>
    );
}

export default HomePage;