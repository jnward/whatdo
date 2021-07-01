import React, { useState } from 'react';
import { View, SafeAreaView, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Application from '../../src';
import { styles } from '../styles';
import Settings from '../screens/Settings';

import { db } from '../utils/Database';


const RootStack = createStackNavigator();

export function RootStackScreen() {
	// const [theme, setTheme] = useState('light');
	// const _setTheme = (newTheme: string) => {
	// 	//setTheme(newTheme);
	// 	//console.log(newTheme);
	// 	//console.log("updated theme: ", theme);
	// }
	return (
		<View style={{width: '100%', height: '100%'}}>
			<RootStack.Navigator mode="modal">
				<RootStack.Screen
					name="Main"
					component={Application}
					initialParams={{
						theme: 'light',
					}}
					options={{ headerShown: false }}
				/>
				<RootStack.Screen
					name="Settings"
					component={Settings}
					initialParams={{
						theme: 'light',
					}}
					options={{ headerShown: false }}
				/>
			</RootStack.Navigator>
		</View>
	);
}