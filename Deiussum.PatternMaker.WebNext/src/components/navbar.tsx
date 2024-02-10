"use client"

import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

const pages = ['News', 'Features', 'Help' ];

export default function NavBar() {
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

    const menuClick = (event: React.MouseEvent<HTMLElement>) => {
        if (anchorElNav) {
            setAnchorElNav(null);
        }
        else {
            setAnchorElNav(event.currentTarget);
        }
    };

    const menuItemClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(null);
    };

    const onMenuClose = () => {
        setAnchorElNav(null);
    };

    return (
        <Box sx={{ flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton 
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={menuClick}
                    >
                        <MenuIcon />
                        <Menu open={Boolean(anchorElNav)} anchorEl={anchorElNav} onClose={onMenuClose}>
                        {pages.map((page) => (
                            <MenuItem key={page} onClick={menuItemClick}>
                                <Typography>
                                    <Link href={`/${page}`}>{page}</Link>
                                </Typography>
                            </MenuItem>
                        ))}
                        </Menu>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1}}>
                        <Link href='/'>Deiussum&apos;s Pattern Maker</Link>
                    </Typography>
                    <Button color="inherit">Login</Button>
                </Toolbar>
            </AppBar>
        </Box>
    );

};