import 'dotenv/config'
import express from 'express';
import '@shopify/shopify-api/adapters/node';
import customersRouter from './routes/customer';
import companiesRouter from './routes/company';
import authRouter from './routes/auth';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import logger from './logger';
import cron from 'node-cron';

const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/v1/customers', customersRouter);
app.use('/api/v1/companies', companiesRouter);
app.use('/api/v1/auth', authRouter);

app.listen(PORT, () => {
    logger.info(`Server is Successfully Running, and App is listening on port ${PORT}`);
});