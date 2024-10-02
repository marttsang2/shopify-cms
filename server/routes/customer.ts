import express from 'express';
import { restClient, graphqlClient, session, shopify } from '../providers/shopify';
import logger from '../logger';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const router = express.Router();
const prisma = new PrismaClient();

// Sync customers every day at midnight
cron.schedule('0 0 * * *', () => {
  syncCustomers();
});

// Get all clients
router.get('/', async (req: any, res: any) => {
  try {
    const customers = await prisma.customer.findMany({
      where: req.query.search ? {
        OR: [
          { firstName: { contains: req.query.search, mode: 'insensitive' } },
          { lastName: { contains: req.query.search, mode: 'insensitive' } },
          { email: { contains: req.query.search } },
        ],
      } : undefined,
      include: {
        companies: true,
      },
    });

    res.json(customers);
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get a specific client
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id.toString() },
      include: { companies: true },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create a new client
router.post('/', async (req, res) => {
  try {
    const customer = await prisma.customer.create({
      data: {
        ...req.body,
      },
      include: { companies: true },
    });

    await graphqlClient.request(
      `
      mutation {
        customerCreate(input: {
          firstName: "${req.body.firstName}",
          lastName: "${req.body.lastName}",
          email: "${req.body.email}",
          phone: "${req.body.phone}"
        }) {
          customer {
            id
          }
        }
      }
      `
    );

    res.json(customer);
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Insert a new company to a client
router.post('/:id/company/:companyId', async (req, res) => {
  try {
    logger.info(req.params.companyId.toString());
    const company = await prisma.company.findUnique({
      where: { id: req.params.companyId.toString() },
    });

    logger.info(company);

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const customer = await prisma.customer.update({
      where: { id: req.params.id.toString() },
      data: {
        companies: {
          connect: { id: company.id },
        },
      },
      include: { companies: true },
    });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});


// Update a client
router.put('/:id', async (req, res) => {
  try {
    console.log(req.body);
    const customer = await prisma.customer.update({
      where: { id: req.params.id.toString() },
      data: {
        ...req.body,
        companies: {
          upsert: req.body.companies.map((company: any) => ({
            where: { id: company.id || 0 },
            update: company,
            create: company,
          })),
        },
      },
      include: { companies: true },
    });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete a client
router.delete('/:id', async (req, res) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id.toString() },
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Sync data from Shopify to DB
router.post('/sync', async (req, res) => {
  try {
    await syncCustomers();
    res.json({ message: 'Customers synced successfully' });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: (error as Error).message });
  }
});

async function syncCustomers() {
  const response: any = await graphqlClient.request(
    `
    {
      customers(first: 250) {
        edges {
          node {
            id
            firstName
            lastName
            displayName
            email
            phone
            addresses {
              id
              address1
              address2
              city
              company
              province
            }
          }
        }
      }
    }
    `
  );
  const shopifyCustomers = response.data.customers.edges.map((edge: any) => edge.node);

  await Promise.all(shopifyCustomers.map(async (customer: any) => {
    const existingCustomer = await prisma.customer.findUnique({
      where: { customerId: customer.id },
    });

    const validCompanies = [];

    for (const address of customer.addresses) {
      let company = await prisma.company.findFirst({
        where: {
          name: address.company || '',
        },
      });

      if (company) {
        company = await prisma.company.update({
          where: {
            id: company.id,
          },
          data: {
            address1: address.address1 || '',
            address2: address.address2 || '',
            city: address.city || '',
            province: address.province || '',
          },
        });
      } else if (address.company) {
        company = await prisma.company.create({
          data: {
            name: address.company,
            address1: address.address1 || '',
            address2: address.address2 || '',
            city: address.city || '',
            province: address.province || '',
          },
        });
      }

      if (company) {
        validCompanies.push({ id: company.id });
      }
    }

    const customerData = {
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      companies: {
        connect: validCompanies,
      },
    };

    if (existingCustomer && existingCustomer.customerId) {
      await prisma.customer.update({
        where: { customerId: existingCustomer.customerId },
        data: customerData,
      });
    } else {
      await prisma.customer.create({
        data: {
          customerId: customer.id,
          ...customerData,
        },
      });
    }
  }));
}

export default router;
