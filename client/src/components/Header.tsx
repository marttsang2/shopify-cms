import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
    const navigate = useNavigate();
  return (
    <AppBar position="static" style={{ marginBottom: '20px' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          Customer Management
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Customers
        </Button>
        <Button color="inherit" component={Link} to="/company">
          Companies
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
