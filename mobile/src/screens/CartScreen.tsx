import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import CustomHeader from '../components/CustomHeader';

const CartScreen: React.FC = () => {
    return (
        <SafeAreaView>
            <CustomHeader title="Coș de Cumpărături" />
            <Text>Coș de Cumpărături</Text>
        </SafeAreaView>
    );
};

export default CartScreen;
