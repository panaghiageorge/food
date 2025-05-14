// src/graphql/resolvers/auth.js
import { pool } from '../../db/pool.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateAccessToken, verifyToken } from '../../utils/authUtils.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export const resolvers = {
    Query: {},

    Mutation: {
        register: async (_, { email, password, name, role = 'client' }) => {
            const hashed = await bcrypt.hash(password, 10);
            const result = await pool.query(
                'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
                [email, hashed, name, role]
            );
            return result.rows[0];
        },

        login: async (_, { email, password }) => {
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0];
            if (!user) throw new Error('User not found');

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) throw new Error('Invalid password');

            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                }
            };
        },

        logout: async (_, { refreshToken }) => {
            await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
            return true;
        },

        refreshToken: async (_, { refreshToken }) => {
            const tokenQuery = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [refreshToken]);
            if (!tokenQuery.rows.length) throw new Error('Invalid refresh token');

            const payload = verifyToken(refreshToken);
            const user = { id: payload.id, email: payload.email };

            const newAccessToken = generateAccessToken(user);
            return { token: newAccessToken };
        }
    }
};
