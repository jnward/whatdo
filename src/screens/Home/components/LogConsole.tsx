import React, { useRef, useState, useEffect } from 'react';
import { TextInput, Text, View, TouchableOpacity, KeyboardAvoidingView, StyleSheet, Keyboard } from 'react-native';
import { styles } from '../../../styles';


export default function LogConsole(props) {
    const handleNewLog = props.handleNewLog;
    const logState = props.logState;
    const noteState = props.noteState;
    const [newLogText, setNewLogText] = useState('');
    const theme = props.theme;
    const style = styles[theme];



    return (
        <View
            style={local.container}
        >
            { logState ?
                <Text>U sent log! :D</Text> :
                !noteState ? 
                <Text>Wait for note :O</Text> :
                <>
                    <View style={ [local.inputShadow, style.inputShadow] }>
                        <View style={ [local.inputBubble, style.inputBubble] }>
                            <TextInput
                                style={local.input}
                                onChangeText={setNewLogText}
                                value={newLogText}
                                placeholder={'What have you been up to?'}
                                placeholderTextColor="#B1B1B1"
                                enablesReturnKeyAutomatically
                                multiline
                                scrollEnabled={false}
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={local.button}
                        onPress={() => {
                            if (!newLogText) { Keyboard.dismiss(); return; };
                            handleNewLog(newLogText);
                            setNewLogText('');
                            Keyboard.dismiss();
                        }}
                    >
                        <Text style={local.buttonText}>Log</Text>
                    </TouchableOpacity>
                </>
            }
        </View>

    );
}


const local = StyleSheet.create({
    container: {
        justifyContent: "center",
        borderColor: '#000',
        borderTopWidth: 2,
        padding: 20,
        flexDirection: 'row',
    },
    input: {
        minHeight: 33,
        top: 0,
        // marginLeft: -3.5,
        // marginRight: -2,
        fontSize: 17,
        paddingHorizontal: 12,
        // borderWidth: 1,
        borderColor: 'red',
        paddingBottom: 8,
    },
    inputShadow: {
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#000',
        minHeight: 40,
        backgroundColor: '#B1B1B1',
        flex: 1,
        marginRight: 16,
    },
    inputBubble: {
        minHeight: 33,
        marginBottom: 3,
        marginLeft: 1,
        top: 3,
        borderTopLeftRadius: 16.5,
        borderTopRightRadius: 15,
        borderBottomLeftRadius: 16.5,
        borderBottomRightRadius: 18,
    },
    button: {
        borderWidth: 2,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignSelf: 'flex-end',
    },
    buttonText: {
        fontSize: 17,
        paddingHorizontal: 12
    }
});
