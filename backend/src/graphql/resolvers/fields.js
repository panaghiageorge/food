// src/graphql/resolvers/fields.js
import { pool } from '../../db/pool.js';

export const resolvers = {
    Order: {
        statusInfo: async (order) => {
            const res = await pool.query('SELECT * FROM order_statuses WHERE id = $1', [order.status]);
            if (res.rows.length === 0) {
                return { id: order.status, name: 'Unknown' };
            }
            return res.rows[0];
        }
    },
    Product: {
        restaurant: async (product) => {
            const res = await pool.query('SELECT * FROM restaurants WHERE id = $1', [product.restaurant_id]);
            return res.rows[0];
        },
        category: async (product) => {
            const res = await pool.query('SELECT * FROM categories WHERE id = $1', [product.category_id]);
            return res.rows[0];
        }
    },
    Category: {
        restaurant: async (category) => {
            const res = await pool.query('SELECT * FROM restaurants WHERE id = $1', [category.restaurant_id]);
            return res.rows[0];
        }
    },
    Restaurant: {
        categories: async (restaurant) => {
            const res = await pool.query('SELECT * FROM categories WHERE restaurant_id = $1', [restaurant.id]);
            return res.rows;
        },
        products: async (restaurant) => {
            const res = await pool.query('SELECT * FROM products WHERE restaurant_id = $1', [restaurant.id]);
            return res.rows.map(p => ({
                ...p,
                categoryId: p.category_id,
                restaurantId: p.restaurant_id
            }));
        }
    }
};
