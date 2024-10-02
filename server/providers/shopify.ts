import { ApiVersion, shopifyApi } from "@shopify/shopify-api";

const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET as string,
    scopes: ['write_customers', 'read_customers', 'write_companies', 'read_companies', 'write_customer_data_erasure', 'read_customer_data_erasure'],
    hostName: process.env.SHOPIFY_HOST as string,
    apiVersion: ApiVersion.July24,
    isEmbeddedApp: false,
});

const session = shopify.session.customAppSession(process.env.SHOPIFY_HOST as string);
session.accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const restClient = new shopify.clients.Rest({ session });
const graphqlClient = new shopify.clients.Graphql({ session });

export { shopify, restClient, graphqlClient, session };
