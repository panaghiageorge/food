import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export async function authRoutes(app) {
    app.post('/register', async (req, reply) => {
        const { email, password, name, role = 'client' } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const result = await pool.query(
                'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
                [email, hashedPassword, name, role]
            );
            return result.rows[0];
        } catch (err) {
            return reply.code(400).send({ error: 'User already exists or invalid input.' });
        }
    });

    app.post('/login', async (req, reply) => {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await pool.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + interval \'7 days\')',
            [user.id, refreshToken]
        );

        return {
            token: accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
    });

    app.post('/logout', async (req, reply) => {
        const { refreshToken } = req.body;
        await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
        return { success: true };
    });
}
