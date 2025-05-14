import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
    link: new HttpLink({
        uri: 'http://10.0.2.2:4000/graphql',  // URI-ul backend-ului GraphQL
    }),
    cache: new InMemoryCache(),
});

export default client;
