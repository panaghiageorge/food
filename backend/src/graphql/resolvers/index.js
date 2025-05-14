import { resolvers as authResolvers } from './auth.js';
import { resolvers as productResolvers } from './product.js';
import { resolvers as cartResolvers } from './cart.js';
import { resolvers as orderResolvers } from './order.js';
import { resolvers as fieldResolvers } from './fields.js';
import { resolvers as menuResolvers } from './menu.js';

export const resolvers = {
    Query: {
        ...authResolvers.Query,
        ...productResolvers.Query,
        ...cartResolvers.Query,
        ...orderResolvers.Query,
        ...menuResolvers.Query,
    },
    Mutation: {
        ...authResolvers.Mutation,
        ...productResolvers.Mutation,
        ...cartResolvers.Mutation,
        ...orderResolvers.Mutation,
    },
    Order: {
        ...fieldResolvers.Order,
    },
};
