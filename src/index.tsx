import React from 'react';
import {View,Text} from 'react-native';
import Home from './screens/Home';

export default function Application({navigation, route}) {

    const theme = route.params.theme;
    //const setTheme = route.params.setTheme;

    console.log('Application theme:', theme);

    const _setTheme = (newTheme: string) => {
    	navigation.setParams({
    		theme: newTheme,
    	});
    	//setTheme(newTheme);
    }
    
    return(
        <Home
            theme={theme}
            setTheme={_setTheme}
            navigation={navigation}
        />
    );    
};