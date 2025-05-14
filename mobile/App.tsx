import React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './src/graphql/ApolloClient';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';  // Import NavigationContainer

const App = () => {
    return (
        <ApolloProvider client={client}>
            <NavigationContainer>  {/* Wrap with NavigationContainer for navigation */}
                <AppNavigator />  {/* Your app's main navigator */}
            </NavigationContainer>
        </ApolloProvider>
    );
};

export default App;
