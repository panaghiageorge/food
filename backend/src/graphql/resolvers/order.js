// src/graphql/resolvers/order.js
import { pool } from '../../db/pool.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export const resolvers = {
    Query: {
        getAllOrders: async (_, { limit = 20, offset = 0 }, context) => {
            const auth = context.reply.request.headers.authorization;
            const token = auth?.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);
            if (payload.role !== 'admin') throw new Error('Forbidden');

            const baseQuery = 'SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2';
            const countQuery = 'SELECT COUNT(*) FROM orders';

            const [ordersRes, countRes] = await Promise.all([
                pool.query(baseQuery, [limit, offset]),
                pool.query(countQuery)
            ]);

            const orders = await Promise.all(ordersRes.rows.map(async (order) => {
                const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);

                const items = await Promise.all(itemsRes.rows.map(async item => {
                    const product = await pool.query('SELECT * FROM products WHERE id = $1', [item.product_id]).then(r => r.rows[0]);
                    const optionValues = await pool.query(
                        `SELECT pov.* FROM product_option_values pov
         JOIN order_item_option_values oio ON oio.option_value_id = pov.id
         WHERE oio.order_item_id = $1`,
                        [item.id]
                    ).then(r => r.rows);

                    return {
                        id: item.id,
                        product,
                        quantity: item.quantity,
                        optionValues
                    };
                }));

                return {
                    id: order.id,
                    status: order.status,
                    items
                };
            }));

            return {
                items: orders,
                totalCount: parseInt(countRes.rows[0].count, 10)
            };
        },

        myOrders: async (_, { limit = 20, offset = 0, status, startDate, endDate }, context) => {
            const auth = context.reply.request.headers.authorization;
            const token = auth?.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);
            const userId = payload.id;

            let whereConditions = ['user_id = $1'];
            const values = [userId];

            if (status !== undefined) {
                whereConditions.push(`status = $${values.length + 1}`);
                values.push(status);
            }

            if (startDate) {
                whereConditions.push(`created_at >= $${values.length + 1}`);
                values.push(startDate);
            }

            if (endDate) {
                whereConditions.push(`created_at <= $${values.length + 1}`);
                values.push(endDate);
            }

            const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';

            const baseQuery = `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
            const countQuery = `SELECT COUNT(*) FROM orders ${whereClause}`;

            const [ordersRes, countRes] = await Promise.all([
                pool.query(baseQuery, [...values, limit, offset]),
                pool.query(countQuery, values)
            ]);

            const orders = await Promise.all(ordersRes.rows.map(async (order) => {
                const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
                const items = await Promise.all(itemsRes.rows.map(async item => {
                    const product = await pool.query('SELECT * FROM products WHERE id = $1', [item.product_id]).then(r => r.rows[0]);
                    const optionValues = await pool.query(
                        `SELECT pov.* FROM product_option_values pov
         JOIN order_item_option_values oio ON oio.option_value_id = pov.id
         WHERE oio.order_item_id = $1`,
                        [item.id]
                    ).then(r => r.rows);

                    return {
                        id: item.id,
                        product,
                        quantity: item.quantity,
                        optionValues
                    };
                }));

                return {
                    id: order.id,
                    status: order.status,
                    items
                };
            }));

            return {
                items: orders,
                totalCount: parseInt(countRes.rows[0].count, 10)
            };
        },

    },

    Mutation: {
        placeOrder: async (_, __, context) => {
            const auth = context.reply.request.headers.authorization;
            const token = auth?.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);
            const userId = payload.id;

            const cartItemsRes = await pool.query('SELECT * FROM cart_items WHERE user_id = $1', [userId]);
            const cartItems = cartItemsRes.rows;

            if (cartItems.length === 0) throw new Error('Cart is empty');

            const orderRes = await pool.query('INSERT INTO orders (user_id) VALUES ($1) RETURNING *', [userId]);
            const order = orderRes.rows[0];

            for (const item of cartItems) {
                const orderItemRes = await pool.query(
                    'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING id',
                    [order.id, item.product_id, item.quantity]
                );
                const orderItemId = orderItemRes.rows[0].id;

                const optionRes = await pool.query(
                    'SELECT option_value_id FROM cart_item_option_values WHERE cart_item_id = $1',
                    [item.id]
                );

                for (const { option_value_id } of optionRes.rows) {
                    await pool.query(
                        'INSERT INTO order_item_option_values (order_item_id, option_value_id) VALUES ($1, $2)',
                        [orderItemId, option_value_id]
                    );
                }
            }

            await pool.query('DELETE FROM cart_item_option_values WHERE cart_item_id IN (SELECT id FROM cart_items WHERE user_id = $1)', [userId]);
            await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

            const items = await Promise.all(cartItems.map(async item => {
                const product = await pool.query('SELECT * FROM products WHERE id = $1', [item.product_id]).then(r => r.rows[0]);
                const options = await pool.query(
                    `SELECT pov.* FROM product_option_values pov
           JOIN cart_item_option_values cio ON cio.option_value_id = pov.id
           WHERE cio.cart_item_id = $1`,
                    [item.id]
                ).then(r => r.rows);

                return {
                    id: item.id,
                    product,
                    quantity: item.quantity,
                    optionValues: options
                };
            }));

            return {
                id: order.id,
                status: order.status,
                items
            };
        },

        updateOrderStatus: async (_, { orderId, status }, context) => {
            const auth = context.reply.request.headers.authorization;
            const token = auth?.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);
            if (payload.role !== 'admin') throw new Error('Forbidden');

            const updated = await pool.query(
                'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
                [status, orderId]
            );

            const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
            const items = await Promise.all(itemsRes.rows.map(async item => {
                const product = await pool.query('SELECT * FROM products WHERE id = $1', [item.product_id]).then(r => r.rows[0]);
                const optionValues = await pool.query(
                    `SELECT pov.* FROM product_option_values pov
           JOIN order_item_option_values oio ON oio.option_value_id = pov.id
           WHERE oio.order_item_id = $1`,
                    [item.id]
                ).then(r => r.rows);

                return {
                    id: item.id,
                    product,
                    quantity: item.quantity,
                    optionValues
                };
            }));

            return {
                id: updated.rows[0].id,
                status: updated.rows[0].status,
                items
            };
        },

        updateOrderStatusName: async (_, { id, name }, context) => {
            const auth = context.reply.request.headers.authorization;
            const token = auth?.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);
            if (payload.role !== 'admin') throw new Error('Forbidden');

            const res = await pool.query(
                'UPDATE order_statuses SET name = $1 WHERE id = $2 RETURNING *',
                [name, id]
            );
            return res.rows[0];
        },

        cancelOrder: async (_, { orderId }, context) => {
            const auth = context.reply.request.headers.authorization;
            const token = auth?.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);
            const userId = payload.id;

            const orderRes = await pool.query(
                'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
                [orderId, userId]
            );

            if (orderRes.rows.length === 0) {
                throw new Error('Order not found or not owned by user');
            }

            const order = orderRes.rows[0];

            if (![0, 1].includes(order.status)) {
                throw new Error('Only pending or confirmed orders can be cancelled');
            }

            await pool.query(
                'UPDATE orders SET status = 6 WHERE id = $1',
                [orderId]
            );

            return true;
        }
    }
};
