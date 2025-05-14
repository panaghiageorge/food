// src/graphql/resolvers/cart.js
import { pool } from '../../db/pool.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export const resolvers = {
    Query: {
        getCart: async (_, __, context) => {
            const auth = context.reply.request.headers.authorization;
            const token = auth?.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);
            const userId = payload.id;

            const cartItemsRes = await pool.query(
                'SELECT * FROM cart_items WHERE user_id = $1',
                [userId]
            );

            const items = await Promise.all(cartItemsRes.rows.map(async item => {
                const productRes = await pool.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
                const optionsRes = await pool.query(
                    `SELECT pov.* FROM product_option_values pov
           JOIN cart_item_option_values cio ON cio.option_value_id = pov.id
           WHERE cio.cart_item_id = $1`,
                    [item.id]
                );

                return {
                    id: item.id,
                    quantity: item.quantity,
                    product: productRes.rows[0],
                    optionValues: optionsRes.rows
                };
            }));

            return items;
        }
    },

    Mutation: {
        addToCart: async (_, { productId, quantity, optionValueIds = [] }, context) => {
            const auth = context.reply.request.headers.authorization;
            const token = auth?.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);
            const userId = payload.id;

            const result = await pool.query(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING id',
                [userId, productId, quantity]
            );
            const cartItemId = result.rows[0].id;

            for (const valueId of optionValueIds) {
                await pool.query(
                    'INSERT INTO cart_item_option_values (cart_item_id, option_value_id) VALUES ($1, $2)',
                    [cartItemId, valueId]
                );
            }

            return {
                id: cartItemId,
                quantity,
                product: await pool.query('SELECT * FROM products WHERE id = $1', [productId]).then(r => r.rows[0]),
                optionValues: await pool.query(
                    `SELECT pov.*
           FROM product_option_values pov
           JOIN cart_item_option_values cio ON cio.option_value_id = pov.id
           WHERE cio.cart_item_id = $1`,
                    [cartItemId]
                ).then(r => r.rows)
            };
        }
    }
};
