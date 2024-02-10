import Image from 'next/image';
import Grid from '@mui/material/Unstable_Grid2';

export default function Home() {
  return (
    <main className="pt-24">
      <Grid container spacing={1}>
        <Grid xs={4}>
          <h1>Deiussum&apos;s Pattern Maker</h1>
          Deiussum&apos;s Pattern Maker is a tool for creating mosaic crochet patterns.  It is currently only available through
          private testing.
        </Grid>
        <Grid xs={8}>
          <Image src='/HomePage-Background.png' alt='Background' width={637} height={718} />
        </Grid>
      </Grid>
    </main>
  )
}
