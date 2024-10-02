import express from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../logger';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const companies = await prisma.company.findMany();
    res.status(200).json(companies);
  } catch (error) {
    logger.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, address1, city, province } = req.body;
    const company = await prisma.company.create({
      data: {
        name,
        address1,
        city,
        province
      }
    });
    res.status(200).json(company);
  } catch (error) {
    logger.error('Error creating company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address1, city, province } = req.body;
    const company = await prisma.company.update({
      where: { id },
      data: { name, address1, city, province }
    });
    res.status(200).json(company);
  } catch (error) {
    logger.error('Error updating company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.company.delete({ where: { id } });
    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    logger.error('Error deleting company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
