import React, { useRef, useState, useEffect } from 'react';
import {TextInput, View, KeyboardAvoidingView, StyleSheet} from 'react-native';

export default function LogConsole(props) {
    const handleNewLog = props.handleNewLog;
    const [newLogText, setNewLogText] = useState('');

    return (
        <View
            style={styles.container}
        >
            <View style={ styles.inputBubble }>
                <View style={ styles.inputShadow }>
            <TextInput
                style={styles.input}
                onChangeText={setNewLogText}
                onSubmitEditing={() => {
                    handleNewLog(newLogText);
                    setNewLogText('');
                }}
                value={newLogText}
                placeholder={'What have you been up to?'}
                placeholderTextColor="#B1B1B1"
                enablesReturnKeyAutomatically
            />
            </View>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        borderColor: '#000',
        borderTopWidth: 2,
        padding: 20,
    },
    input: {
        height: 40,
        top: -5.5,
        marginLeft: -3.5,
        marginRight: -2,
        fontSize: 17,
        paddingHorizontal: 12,
    },
    inputBubble: {
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#000',
        height: 40,
        width: '100%',
        backgroundColor: '#B1B1B1'
    },
    inputShadow: {
        backgroundColor: '#fff',
        height: 33,
        marginLeft: 1,
        top: 3,
        borderTopLeftRadius: 16.5,
        borderTopRightRadius: 15,
        borderBottomLeftRadius: 16.5,
        borderBottomRightRadius: 18,
    },
});
