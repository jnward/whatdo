import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Application from './src';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackScreen } from './src/navigations';

export default function App() {
    //const [theme, setTheme] = useState('light');

    return (
        <NavigationContainer>
            <View style={styles.container}>
                {/*<Application theme={theme} setTheme={setTheme}/>*/}
                <RootStackScreen/>
                <StatusBar style="auto" />
            </View>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
