import React, { useEffect, useState } from 'react';
import { Typography, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Company } from '../types/customer';

const CompanyList = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [open, setOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [newCompany, setNewCompany] = useState<Partial<Company>>({});

    useEffect(() => {
        fetchCompanies();
    }, []);

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
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (company: Company) => {
        setEditingCompany(company);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingCompany(null);
    };

    const handleCreateOpen = () => {
        setCreateOpen(true);
    };

    const handleCreateClose = () => {
        setCreateOpen(false);
        setNewCompany({});
    };

    const handleSave = async () => {
        if (!editingCompany) return;
        try {
            const response = await fetch(`http://localhost:8080/api/v1/companies/${editingCompany.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCompany),
            });
            if (!response.ok) {
                throw new Error('Failed to update company');
            }
            fetchCompanies();
            handleClose();
        } catch (error) {
            setError((error as Error).message);
        }
    };

    const handleCreate = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCompany),
            });
            if (!response.ok) {
                throw new Error('Failed to create company');
            }
            fetchCompanies();
            handleCreateClose();
        } catch (error) {
            setError((error as Error).message);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/companies/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete company');
            }
            fetchCompanies();
        } catch (error) {
            setError((error as Error).message);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingCompany) {
            setEditingCompany({ ...editingCompany, [e.target.name]: e.target.value });
        }
    };

    const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCompany({ ...newCompany, [e.target.name]: e.target.value });
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>Company List</Typography>
            <Button onClick={handleCreateOpen} variant="contained" color="primary" style={{ marginBottom: '20px' }}>
                Create New Company
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>City</TableCell>
                            <TableCell>Province</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {companies.map((company) => (
                            <TableRow key={company.id}>
                                <TableCell>{company.name}</TableCell>
                                <TableCell>{company.address1}</TableCell>
                                <TableCell>{company.city}</TableCell>
                                <TableCell>{company.province}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleEdit(company)}>Edit</Button>
                                    <Button onClick={() => handleDelete(company.id)} color="secondary">Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit Company</DialogTitle>
                <DialogContent>
                    {editingCompany && (
                        <>
                            <TextField fullWidth margin="normal" name="name" label="Name" value={editingCompany.name} onChange={handleChange} />
                            <TextField fullWidth margin="normal" name="address1" label="Address" value={editingCompany.address1} onChange={handleChange} />
                            <TextField fullWidth margin="normal" name="city" label="City" value={editingCompany.city} onChange={handleChange} />
                            <TextField fullWidth margin="normal" name="province" label="Province" value={editingCompany.province} onChange={handleChange} />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={createOpen} onClose={handleCreateClose}>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogContent>
                    <TextField fullWidth margin="normal" name="name" label="Name" value={newCompany.name || ''} onChange={handleCreateChange} />
                    <TextField fullWidth margin="normal" name="address1" label="Address" value={newCompany.address1 || ''} onChange={handleCreateChange} />
                    <TextField fullWidth margin="normal" name="city" label="City" value={newCompany.city || ''} onChange={handleCreateChange} />
                    <TextField fullWidth margin="normal" name="province" label="Province" value={newCompany.province || ''} onChange={handleCreateChange} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCreateClose}>Cancel</Button>
                    <Button onClick={handleCreate}>Create</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CompanyList;
