import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Container, Box, Button, TextField, Grid, Paper, Snackbar, Alert, Modal, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Company, Customer } from '../types/customer';

const CustomerDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });
    const [companyModalOpen, setCompanyModalOpen] = useState(false);

    useEffect(() => {
        fetchCustomer();
        fetchCompanies();
    }, [id]);

    const fetchCustomer = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/customers/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch customer');
            }
            const data = await response.json();
            setCustomer(data);
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/companies');
            if (!response.ok) {
                throw new Error('Failed to fetch companies');
            }
            const data = await response.json();
            setCompanies(data);
        } catch (error) {
            setError((error as Error).message);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/api/v1/customers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customer),
            });
            if (!response.ok) {
                throw new Error('Failed to update customer');
            }
            setSnackbar({
                open: true,
                message: 'Customer updated successfully',
                severity: 'success',
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: (error as Error).message,
                severity: 'error',
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomer(prev => prev ? { ...prev, [e.target.name]: e.target.value } : null);
    };

    const handleCompanySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/api/v1/customers/${id}/company/${selectedCompanyId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error('Failed to create company');
            }
            setSnackbar({
                open: true,
                message: 'Company created successfully',
                severity: 'success',
            });
            setCompanyModalOpen(false);
            await fetchCustomer();
        } catch (error) {
            setSnackbar({
                open: true,
                message: (error as Error).message,
                severity: 'error',
            });
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!customer) return <Typography>Customer not found</Typography>;

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>Customer Details</Typography>
                <form onSubmit={handleUpdate}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="First Name"
                                name="firstName"
                                value={customer.firstName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                name="lastName"
                                value={customer.lastName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={customer.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={customer.phone}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="outlined" onClick={() => setCompanyModalOpen(true)}>
                                Add Company
                            </Button>
                        </Grid>
                        {customer.companies && customer.companies.length > 0 && (
                            <>
                                {customer.companies.map((company, index) => (
                                    <React.Fragment key={index}>
                                        <Grid item xs={12}>
                                            <Typography variant='body1' gutterBottom>Address {index + 1}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Company"
                                                name={`companies[${index}].name`}
                                                value={company.name || ''}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Address"
                                                name={`companies[${index}].address1`}
                                                value={company.address1 || ''}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="City"
                                                name={`companies[${index}].city`}
                                                value={company.city || ''}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                    </React.Fragment>
                                ))}
                            </>
                        )}
                    </Grid>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Button variant="contained" color="primary" type="submit">
                            Update Customer
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/')}>
                            Back to List
                        </Button>
                    </Box>
                </form>
            </Paper>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
            <Modal
                open={companyModalOpen}
                onClose={() => setCompanyModalOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
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
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Add New Company
                    </Typography>
                    <form onSubmit={handleCompanySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <FormControl fullWidth>
                            <InputLabel id="company-label">Company</InputLabel>
                            <Select
                                label="Company"
                            name="companyId"
                            value={selectedCompanyId}
                            onChange={(e) => setSelectedCompanyId(e.target.value as string)}
                            placeholder='Select Company'
                        >
                            {companies.map((company) => (
                                <MenuItem key={company.id} value={company.id}>
                                    {company.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                            Add Company
                        </Button>
                        </FormControl>
                    </form>
                </Box>
            </Modal>
        </Container>
    );
};

export default CustomerDetail;
