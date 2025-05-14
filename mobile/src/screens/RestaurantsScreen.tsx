import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@apollo/client';  // For GraphQL
import { useNavigation } from '@react-navigation/native';
import { GET_ALL_RESTAURANTS } from '../graphql/queries';  // Import the query

// Type definition for Restaurant data
type Restaurant = {
    id: string;
    name: string;
    description: string;
    image_url: string;
};

const RestaurantsScreen = () => {
    const navigation = useNavigation();
    const { data, loading, error } = useQuery(GET_ALL_RESTAURANTS);  // Using the GraphQL query to fetch restaurants
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

    // Once the data is fetched, store it in the local state
    useEffect(() => {
        if (data) {
            setRestaurants(data.getAllRestaurants);
        }
    }, [data]);

    // If data is loading, show loading indicator
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading Restaurants...</Text>
            </View>
        );
    }

    // If there is an error, display the error message
    if (error) {
        console.log(error);
        return (
            <View style={styles.centered}>
                <Text>Error: {error.message}</Text>
            </View>
        );
    }


    const handleRestaurantPress = (restaurantId: string) => {
        navigation.navigate('Products', { restaurantId });
    };

    // Render the list of restaurants
    return (
        <FlatList
            data={restaurants}
            keyExtractor={(item) => item.id}  // Each list item will have a unique ID
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleRestaurantPress(item.id)} style={styles.restaurantCard}>
                    <Image source={{ uri: item.image_url }} style={styles.image} />
                    <Text style={styles.restaurantName}>{item.name}</Text>
                    <Text style={styles.restaurantDescription}>{item.description}</Text>
                </TouchableOpacity>
            )}
        />
    );
};

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    restaurantCard: {
        margin: 10,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    restaurantDescription: {
        fontSize: 14,
        color: 'gray',
    },
});

export default RestaurantsScreen;
