import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';
const EXPIRES_IN = '7d';

export function generateAccessToken(user) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: EXPIRES_IN
    });
}

export function generateRefreshToken(user) {
    return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
