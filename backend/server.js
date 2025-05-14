// server.js
import Fastify from 'fastify';
import mercurius from 'mercurius';
import dotenv from 'dotenv';
import cors from '@fastify/cors';

import { schema } from './src/graphql/schema.js';
import { resolvers } from './src/graphql/resolvers/index.js';
import { authRoutes } from './src/routes/auth.js';
import { authenticate } from './src/plugins/authenticate.js';
import { uploadRoutes } from './src/routes/upload.js';

dotenv.config();

const app = Fastify({ logger: true });

// CORS (opțional, dar util pentru aplicații frontend)
await app.register(cors, {
    origin: true,
    credentials: true
});

// Upload image route
await uploadRoutes(app);

// Autentificare REST simplă (ex: /me)
app.get('/me', { preHandler: authenticate }, async (req, reply) => {
    return { user: req.user };
});

// Rute REST pentru auth (login, register etc.)
await authRoutes(app);

// GraphQL cu Mercurius
app.register(mercurius, {
    schema,
    resolvers,
    graphiql: true,
    context: (request, reply) => ({ request, reply })
});

// Pornire server
const PORT = process.env.PORT || 4000;

app.listen({ port: PORT }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`🚀 Server running at ${address}`);
});
