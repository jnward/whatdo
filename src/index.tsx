import React from 'react';
import {View,Text} from 'react-native';
import Home from './screens/Home';

export default function Application(props) {

    const theme = props.theme;
    const setTheme = props.setTheme;
    
    return(
        <Home theme={theme} setTheme={setTheme}/>
    );    
};