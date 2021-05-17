import React, { useRef, useState, useEffect } from 'react';
import {TextInput, View, KeyboardAvoidingView, StyleSheet} from 'react-native';

export default function LogConsole(props) {
    const handleNewLog = props.handleNewLog;
    const [newLogText, setNewLogText] = useState('');

    return (
        <View
            style={styles.container}
        >
            <TextInput
                style={styles.input}
                onChangeText={setNewLogText}
                onSubmitEditing={() => {
                    handleNewLog(newLogText);
                    setNewLogText('');
                }}
                value={newLogText}
            />
        </View>
    );
}


const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    // paddingTop: 300,
    borderColor: 'red',
    borderWidth: 1,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    width: 200,
    borderColor: 'blue',
  },
});
