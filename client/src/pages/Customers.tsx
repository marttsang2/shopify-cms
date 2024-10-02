import React, { useEffect, useState } from 'react';
import { Typography, Container, Box, Button, Modal, TextField, Snackbar, Alert } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Customer } from '../types/customer';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/customers?limit=20${searchTerm ? `&search=${searchTerm}` : ''}`);
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to fetch customers',
                severity: 'error',
            });
        }
    }

    const handleOpen = (customer?: Customer) => {
        if (customer) {
            setSelectedCustomer(customer);
            setFormData({
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
            });
        } else {
            setSelectedCustomer(null);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedCustomer(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = 'http://localhost:8080/api/v1/customers';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...selectedCustomer,
                    ...formData,
                }),
            });
            if (response.ok) {
                await fetchCustomers();
                const newCustomer = await response.json();
                setCustomers([...customers, newCustomer]);
                handleClose();
                setSnackbar({
                    open: true,
                    message: `Customer ${selectedCustomer ? 'updated' : 'created'} successfully`,
                    severity: 'success',
                });
            } else {
                throw new Error('API call failed');
            }
        } catch (error) {
            console.error('Error:', error);
            setSnackbar({
                open: true,
                message: `Failed to ${selectedCustomer ? 'update' : 'create'} customer`,
                severity: 'error',
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                const response = await fetch(`http://localhost:8080/api/v1/customers/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    await fetchCustomers();
                    setSnackbar({
                        open: true,
                        message: 'Customer deleted successfully',
                        severity: 'success',
                    });
                } else {
                    throw new Error('API call failed');
                }
            } catch (error) {
                console.error('Error:', error);
                setSnackbar({
                    open: true,
                    message: 'Failed to delete customer',
                    severity: 'error',
                });
            }
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    const handleSync = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/customers/sync', {
                method: 'POST',
            });
            if (response.ok) {
                await fetchCustomers();
                setSnackbar({
                    open: true,
                    message: 'Sync completed successfully',
                    severity: 'success',
                });
            } else {
                throw new Error('Sync failed');
            }
        } catch (error) {
            console.error('Error:', error);
            setSnackbar({
                open: true,
                message: 'Failed to sync customers',
                severity: 'error',
            });
        }
    };

    const columns: GridColDef[] = [
        { field: 'firstName', headerName: 'First Name', width: 120 },
        { field: 'lastName', headerName: 'Last Name', width: 120 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'phone', headerName: 'Phone', width: 150 },
        { field: 'companies', headerName: 'Company', width: 200, valueGetter: (params: any) => {
            return params?.[0]?.name || 'N/A';
        } },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 300,
            renderCell: (params: any) => (
                <Box>
                    <Button onClick={() => navigate(`/customer/${params.id.replace("gid://shopify/Customer/", "")}`)}>View</Button>
                    <Button onClick={() => handleDelete(params.id.replace("gid://shopify/Customer/", ""))} color="error">Delete</Button>
                </Box>
            ),
        },
    ];

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Customer List
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="contained" onClick={() => handleOpen()}>
                            Add Customer
                        </Button>
                        <Button variant="contained" onClick={handleSync}>
                            Sync Customers
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Search"
                            variant="outlined"
                            value={searchTerm}
                            onChange={handleSearch}
                            sx={{ width: '300px' }}
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                    await fetchCustomers();
                                }
                            }}
                        />
                    </Box>
                </Box>
                <DataGrid
                    rows={customers}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    autoHeight
                />
            </Box>
            <Modal open={open} onClose={handleClose}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography variant="h6" component="h2">
                        {selectedCustomer ? 'Edit Customer' : 'Add Customer'}
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            margin="normal"
                            name="firstName"
                            label="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            name="lastName"
                            label="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            name="email"
                            label="Email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            name="phone"
                            label="Phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                            {selectedCustomer ? 'Update' : 'Create'}
                        </Button>
                    </Box>
                </Box>
            </Modal>
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Home;
