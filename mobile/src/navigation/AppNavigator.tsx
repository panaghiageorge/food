import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from "../components/primaryComponents/Icon/Icon";

// Screens
import RestaurantsScreen from '../screens/RestaurantsScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductListScreen from '../screens/ProductListScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, size, color }: { name: string; size: number; color: string }) => (
    <Icon
        name={name}
        size={size}
        color={color}
        style={{tintColor: color}}
    />
);

const RestaurantsStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="Restaurants"
            component={RestaurantsScreen}
            options={{ headerShown: false }}/>
        <Stack.Screen
            name="Products"
            component={ProductListScreen}
            options={{ headerShown: false }}/>
    </Stack.Navigator>
);

const CartStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{ headerShown: false }}/>
    </Stack.Navigator>
);

const ProfileStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="Account"
            component={ProfileScreen}
            options={{ headerShown: false }} />
    </Stack.Navigator>
);

const AppNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Restaurants') {
                        iconName = 'store';
                    } else if (route.name === 'Cart') {
                        iconName = 'cart';
                    } else if (route.name === 'Account') {
                        iconName = 'user';
                    }
                    color = focused ? '#000' : 'grey';
                    return <TabBarIcon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#000',
                tabBarInactiveTintColor: 'grey',
                tabBarStyle: { height: 60, backgroundColor: '#fff' },
                tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Restaurants" component={RestaurantsStack} />
            <Tab.Screen name="Cart" component={CartStack} />
            <Tab.Screen name="Account" component={ProfileStack} />
        </Tab.Navigator>
    );
};

export default AppNavigator;
