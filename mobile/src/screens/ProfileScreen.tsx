import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import CustomHeader from '../components/CustomHeader';

const ProfileScreen: React.FC = () => {
    return (
        <SafeAreaView>
            <CustomHeader title="Login" />
            <Text>Login / Contul Meu</Text>
        </SafeAreaView>
    );
};

export default ProfileScreen;
