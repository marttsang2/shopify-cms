import express from 'express';
import { shopify } from '../providers/shopify';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        await shopify.auth.begin({
            shop: process.env.SHOPIFY_HOST as string,
            callbackPath: '/api/v1/auth/callback',
            rawRequest: req,
            rawResponse: res,
            isOnline: false,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.get('/callback', async (req, res) => {
    try {
        const callback = await shopify.auth.callback({
            rawRequest: req,
            rawResponse: res,
        });
        
        res.redirect('/');
    } catch (error) {
        res.status(500).json({ error });
    }
});

export default router;