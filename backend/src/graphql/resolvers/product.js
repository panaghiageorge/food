// src/graphql/resolvers/product.js
import { pool } from '../../db/pool.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export const resolvers = {
    Query: {
        categories: async () => {
            const { rows } = await pool.query('SELECT * FROM categories');
            return rows;
        },
        products: async () => {
            const { rows } = await pool.query('SELECT * FROM products');
            return rows;
        },
        restaurants: async () => {
            const { rows } = await pool.query('SELECT * FROM restaurants');
            return rows;
        },
        productOptions: async () => {
            const { rows } = await pool.query('SELECT * FROM product_options');
            return rows;
        },
        productOptionValues: async () => {
            const { rows } = await pool.query('SELECT * FROM product_option_values');
            return rows;
        },
        getProductsByRestaurant: async (_, { restaurantId }) => {
            const result = await pool.query(
                `SELECT p.id, p.name, c.id AS category_id, c.name AS category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.restaurant_id = $1`,
                [restaurantId]
            );

            return result.rows.map(product => ({
                id: product.id,
                name: product.name,
                category: product.category_name ? { id: product.category_id, name: product.category_name } : null
            }));
        },
        getCategoriesByRestaurant: async (_, { restaurantId }) => {
            const { rows } = await pool.query(
                'SELECT * FROM categories WHERE restaurant_id = $1',
                [restaurantId]
            );
            return rows;
        },
        getProductsByCategory: async (_, { categoryId }) => {
            const result = await pool.query(
                'SELECT * FROM products WHERE category_id = $1',
                [categoryId]
            );
            return result.rows.map(row => ({
                ...row,
                categoryId: row.category_id,
                restaurantId: row.restaurant_id
            }));
        },
        getAllRestaurants: async () => {
            const res = await pool.query('SELECT * FROM restaurants');

            return res.rows;
        },
        searchProducts: async (_, {
            term,
            restaurantId,
            categoryId,
            maxPrice,
            orderBy,
            orderDir,
            limit = 20,
            offset = 0
        }) => {
            const conditions = [];
            const values = [];

            if (term) {
                conditions.push(`name ILIKE $${values.length + 1}`);
                values.push(`%${term}%`);
            }
            if (restaurantId) {
                conditions.push(`restaurant_id = $${values.length + 1}`);
                values.push(restaurantId);
            }
            if (categoryId) {
                conditions.push(`category_id = $${values.length + 1}`);
                values.push(categoryId);
            }
            if (maxPrice) {
                conditions.push(`price <= $${values.length + 1}`);
                values.push(maxPrice);
            }

            const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

            const allowedOrderFields = ['name', 'price', 'created_at'];
            const safeOrderBy = allowedOrderFields.includes(orderBy) ? orderBy : 'created_at';
            const safeOrderDir = orderDir?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
            const orderClause = `ORDER BY ${safeOrderBy} ${safeOrderDir}`;

            const baseQuery = `SELECT * FROM products ${whereClause} ${orderClause} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
            const countQuery = `SELECT COUNT(*) FROM products ${whereClause}`;

            const [dataResult, countResult] = await Promise.all([
                pool.query(baseQuery, [...values, limit, offset]),
                pool.query(countQuery, values)
            ]);

            const items = dataResult.rows.map(p => ({
                ...p,
                categoryId: p.category_id ?? null,
                restaurantId: p.restaurant_id ?? null
            }));

            return {
                items,
                totalCount: parseInt(countResult.rows[0].count, 10)
            };
        }
    },

    Mutation: {
        createProduct: async (_, { name, price, imageUrl, restaurantId, categoryId }, context) => {
            const auth = context.reply.request.headers.authorization;
            if (!auth || !auth.startsWith('Bearer ')) throw new Error('Unauthorized');
            const token = auth.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);

            if (payload.role !== 'admin') {
                throw new Error('Forbidden: only admins can create products');
            }

            const result = await pool.query(
                'INSERT INTO products (name, price, image_url, restaurant_id, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [name, price, imageUrl, restaurantId, categoryId]
            );

            const row = result.rows[0];
            return {
                ...row,
                categoryId: row.category_id,
                restaurantId: row.restaurant_id
            };
        },

        updateProduct: async (_, { id, name, price, imageUrl }, context) => {
            const auth = context.reply.request.headers.authorization;
            const token = auth?.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);
            if (payload.role !== 'admin') throw new Error('Forbidden');

            const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
            if (!existing.rows.length) throw new Error('Product not found');

            const product = existing.rows[0];
            const updated = await pool.query(
                `UPDATE products SET name = $1, price = $2, image_url = $3 WHERE id = $4 RETURNING *`,
                [
                    name ?? product.name,
                    price ?? product.price,
                    imageUrl ?? product.image_url,
                    id
                ]
            );

            return updated.rows[0];
        },

        deleteProduct: async (_, { id }, context) => {
            const auth = context.reply.request.headers.authorization;
            const token = auth?.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);
            if (payload.role !== 'admin') throw new Error('Forbidden');

            await pool.query('DELETE FROM products WHERE id = $1', [id]);
            return true;
        },

        createCategory: async (_, { name }, context) => {
            const auth = context.reply.request.headers.authorization;
            const token = auth?.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);
            if (payload.role !== 'admin') throw new Error('Forbidden');

            const result = await pool.query(
                'INSERT INTO categories (name) VALUES ($1) RETURNING *',
                [name]
            );
            return result.rows[0];
        },

        createProductOption: async (_, { name, label, type }, context) => {
            const auth = context.reply.request.headers.authorization;
            const token = auth?.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);
            if (payload.role !== 'admin') throw new Error('Forbidden');

            const result = await pool.query(
                'INSERT INTO product_options (name, label, type) VALUES ($1, $2, $3) RETURNING *',
                [name, label, type]
            );
            return result.rows[0];
        },

        createProductOptionValue: async (_, { value, optionId }, context) => {
            const auth = context.reply.request.headers.authorization;
            const token = auth?.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);
            if (payload.role !== 'admin') throw new Error('Forbidden');

            const result = await pool.query(
                'INSERT INTO product_option_values (value, option_id) VALUES ($1, $2) RETURNING id, value, option_id',
                [value, optionId]
            );

            return {
                id: result.rows[0].id,
                value: result.rows[0].value,
                optionId: result.rows[0].option_id
            };
        },
    }
};