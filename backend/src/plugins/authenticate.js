// src/plugins/authenticate.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export async function authenticate(request, reply) {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.code(401).send({ error: 'Token missing or invalid' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        request.user = decoded; // user info available in route handlers
    } catch (err) {
        return reply.code(401).send({ error: 'Invalid token' });
    }
}
