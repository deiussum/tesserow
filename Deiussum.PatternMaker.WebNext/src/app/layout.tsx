import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Container from '@mui/material/Container';
import NavBar from '../components/navbar';
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Deiussum\'s Pattern Maker',
  description: 'Create mosaic crochet patterns.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <html lang="en">
        <body className={inter.className}>
          <NavBar/>
          <Container>
            {children}
          </Container>
        </body>
      </html>
  )
}
