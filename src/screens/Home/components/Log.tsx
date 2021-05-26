import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { styles } from '../../../styles';


export default function Log(props) {
    const body = props.body;
    const timestamp = props.timestamp;
    const theme = props.theme;
    const style = styles[theme];
    console.log(props.id);
    return (
    	<View style={{marginTop: 4}}>
	        <Text style={[local.logTimestamp, style.logBody]}>{timestamp}</Text>
	        <View style={local.logArea}>
	        	<View style={[local.logShadow, style.logShadow]}>
			    	<View style={[local.log, style.log]}>
			        	<Text style={[local.logBody, style.logBody]}>{body}</Text>
			        </View>
		    	</View>
		    </View>
        </View>
    );
}

const local = StyleSheet.create({
	log: {
		borderWidth: 3,
		borderRadius: 20,
		minHeight: 40,
		right: 2,
		bottom: 3,
		// shadowColor: '#000000',
		// shadowRadius: 10,
		// shadowOpacity: 0.3,
		// shadowOffset: { height: 4, width: 4}
	},
	logArea: {
		flex: 1,
	},
	logTimestamp: {
		fontSize: 12,
		textAlign: 'right',
		right: 31,
	},
	logBody: {
		fontSize: 17,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	logShadow: {
		borderRadius: 20,
		minHeight: 40,
		marginHorizontal: 18,
		left: 2,
		top: 3,
	}

});