"use client"

import { ChangeEvent, useState } from 'react'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';

const Register = () => {

    const [ inputs, setInputs ] = useState({ name: '' });
    const [ dialogOpen, setDialogOpen ] = useState(false);

    const onFormSubmit = () => {

    }

    const onInputChanged = (e : React.ChangeEvent<any>) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value});
    }

    const openDialog = () => {
        setDialogOpen(true);
    }

    return (
        <Container style={{
           backgroundColor: '#dedede',
           color: 'black'
        }}>
            <h1>Register</h1>
            <TextField name='name' label='Name' placeholder='Name' value={inputs.name} required={true} onChange={(onInputChanged)} />
            <Button type='submit' onClick={onFormSubmit}>Submit</Button>
        </Container>
    )
}

export default Register;