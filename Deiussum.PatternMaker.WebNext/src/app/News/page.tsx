import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Unstable_Grid2';
import newsItems from './newsItems.json';

const News = () => {

    return (
        <>
            <h1>News page</h1>
            <Grid container spacing={1}>
                {newsItems.map((item, index) => 
                    <Grid lg={4} md={6} sm={12} key={index}>
                        <Card variant='outlined'>
                            <CardHeader title={item.title}/>
                            <CardContent>{item.description}</CardContent>
                        </Card>
                    </Grid>
                   )}
            </Grid>
        </>
    )
}

export default News;
