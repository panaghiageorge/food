// src/graphql/resolvers/menu.js
import { pool } from '../../db/pool.js';

export const resolvers = {
    Query: {
        getMenuByRestaurant: async (_, { restaurantId }) => {
            const categoryRes = await pool.query(
                'SELECT * FROM categories WHERE restaurant_id = $1',
                [restaurantId]
            );

            const categories = await Promise.all(categoryRes.rows.map(async (category) => {
                const productRes = await pool.query(
                    'SELECT * FROM products WHERE category_id = $1',
                    [category.id]
                );

                return {
                    ...category,
                    restaurantId: category.restaurant_id,
                    products: productRes.rows.map(p => ({
                        ...p,
                        categoryId: p.category_id,
                        restaurantId: p.restaurant_id
                    }))
                };
            }));

            return categories;
        }
    }
};
