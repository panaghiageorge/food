// src/components/CustomHeader.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CustomHeader = ({ title }: { title: string }) => {
    return (
        <View style={styles.headerContainer}>
            <Text style={styles.headerText}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default CustomHeader;
