import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Unstable_Grid2';
import cardData from './Cards.json';

const Features = () => {

    return (
        <>
            <h1>Features</h1>
            <Grid container spacing={1} >
                {cardData.map((card, index) => 
                    <Grid lg={3} md={4} sm={6} xs={12} key={index}>
                        <Card variant='outlined'>
                            <CardHeader title={card.title} />
                            <CardContent>
                                {card.description}
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </>
    )
}

export default Features;