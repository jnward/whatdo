import React, { useState } from 'react';
import { View, SafeAreaView, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Application from '../../src';
import { styles } from '../styles';


const RootStack = createStackNavigator();

function Settings({ navigation, route }) {
	const [theme, setTheme] = useState(route.params.theme);
	console.log('params theme', route.params.theme);
	const style = styles[theme];
	// navigation.setParams({
 //    	selectedTheme: 'dark',
 //    });
	return (
		<SafeAreaView style={[style.container, { height: '100%', width: '100%', flex: 1}]}>
			<Text>Hello!</Text>
			<Button
				title={theme === 'dark' ? '* dark theme' : 'dark theme'}
				onPress={() => {
					//navigation.setParams({ theme: 'dark'});
					setTheme('dark');
				}}
			/>
			<Button
				title={theme === 'light' ? '* light theme' : 'light theme'}
				onPress={() => {
					//navigation.setParams({ theme: 'light'});
					setTheme('light');
				}}
			/>
			<Button
				title='go back'
				onPress={() => {
					navigation.navigate({
						name: 'Main',
						params: {theme: theme},
						merge: true,
					});
				}}
			/>

		</SafeAreaView>
	)
}

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
					initialParams={{ theme: 'light' }}
					options={{ headerShown: false }}
				/>
				<RootStack.Screen
					name="Settings"
					component={Settings}
					initialParams={{ theme: 'light' }}
					options={{ headerShown: false }}
				/>
			</RootStack.Navigator>
		</View>
	);
}