// src/screens/ProductListScreen.tsx
import React from 'react';
import { View, Text, FlatList, SectionList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { gql, useQuery } from '@apollo/client';

// Interogare GraphQL pe frontend
const GET_PRODUCTS_BY_RESTAURANT = gql`
  query($restaurantId: ID!) {
    getProductsByRestaurant(restaurantId: $restaurantId) {
      id
      name
      category {
        id
        name
      }
    }
  }
`;


const ProductListScreen = () => {
    const route = useRoute();
    const { restaurantId } = route.params;

    const { loading, error, data } = useQuery(GET_PRODUCTS_BY_RESTAURANT, {
        variables: { restaurantId },
    });

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;

    // Group products by category
    console.log('data', data);
    const products = data?.getProductsByRestaurant || [];  // Safe check for undefined

    const groupedProducts = products.reduce((acc, product) => {
        if (!product.category) return acc; // Skip product if no category
        const categoryName = product.category.name;
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(product);
        return acc;
    }, {});

    const sections = Object.keys(groupedProducts).map((category) => ({
        title: category,
        data: groupedProducts[category],
    }));

    return (
        <View>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View>
                        <Text>{item.name}</Text>
                    </View>
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <Text>{title}</Text>
                )}
            />
        </View>
    );
};

export default ProductListScreen;
