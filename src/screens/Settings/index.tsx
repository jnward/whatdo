import React, { useState } from 'react';
import { SafeAreaView, View, Text, Button } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { styles } from '../../styles';
import { db } from '../../utils/Database';

export default function Settings({ navigation, route }) {
	const [theme, setTheme] = useState(route.params.theme);
	const [startTime, setStartTime] = useState(route.params.startTime);
    const [endTime, setEndTime] = useState(route.params.endTime);
	// const updateTime = route.params.updateTime;
	console.log('params theme', route.params.theme);
	const style = styles[theme];
	// navigation.setParams({
 //    	selectedTheme: 'dark',
 //    });

	function _updateTime(startend: string='start', hour: number) {
		const q = "update start_end_time set hour=? where startend=?;";
		const params = [hour, startend];
		db.transaction(
			tx => { tx.executeSql(
				q,
				params,
				(tx, res) => {console.log(res)},
				(tx, res) => {console.log('Error: ', res); return false},
			)}
		);
	}

	return (
		<SafeAreaView style={[style.container, { height: '100%', width: '100%', flex: 1}]}>
			<Text>Hello!</Text>
			<Text>Start Time: {`${startTime}`}</Text>
            <Text>End Time: {`${endTime}`}</Text>
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
				title='update start time'
				onPress={() => {
					const rand = Math.floor(Math.random() * 12) + 1;
					_updateTime('start', rand);
					setStartTime(rand);
				}}
			/>
            <Button
				title='update end time'
				onPress={() => {
					const rand = Math.floor(Math.random() * 12) + 1;
					_updateTime('end', rand);
					setEndTime(rand);
				}}
			/>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                <Text style={{right: 50}}>When do you start your day?</Text>
                <Picker
                    selectedValue={startTime}
                    onValueChange={(itemValue: number, itemIndex) => {
                        _updateTime('start', itemValue);
                        setStartTime(itemValue);
                    }}
                    style={{width: 140, right: 40}}
                >

                    <Picker.Item label='12:00 PM' value={0}/>
                    <Picker.Item label='1:00 AM' value={1}/>
                    <Picker.Item label='2:00 AM' value={2}/>
                    <Picker.Item label='3:00 AM' value={3}/>
                    <Picker.Item label='4:00 AM' value={4}/>
                    <Picker.Item label='5:00 AM' value={5}/>
                    <Picker.Item label='6:00 AM' value={6}/>
                    <Picker.Item label='7:00 AM' value={7}/>
                    <Picker.Item label='8:00 AM' value={8}/>
                    <Picker.Item label='9:00 AM' value={9}/>
                    <Picker.Item label='10:00 AM' value={10}/>
                    <Picker.Item label='11:00 AM' value={11}/>
                </Picker>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                <Text style={{right: 50}}>When does your day end?</Text>
                <Picker
                    selectedValue={endTime}
                    onValueChange={(itemValue: number, itemIndex) => {
                        _updateTime('end', itemValue);
                        setEndTime(itemValue);
                    }}
                    style={{width: 140, right: 40}}
                >
                    <Picker.Item label='12:00 AM' value={11}/>
                    <Picker.Item label='1:00 PM' value={12}/>
                    <Picker.Item label='2:00 PM' value={13}/>
                    <Picker.Item label='3:00 PM' value={14}/>
                    <Picker.Item label='4:00 PM' value={15}/>
                    <Picker.Item label='5:00 PM' value={16}/>
                    <Picker.Item label='6:00 PM' value={17}/>
                    <Picker.Item label='7:00 PM' value={18}/>
                    <Picker.Item label='8:00 PM' value={19}/>
                    <Picker.Item label='9:00 PM' value={20}/>
                    <Picker.Item label='10:00 PM' value={21}/>
                    <Picker.Item label='11:00 PM' value={22}/>
                    <Picker.Item label='12:00 PM' value={23}/>
                </Picker>
            </View>
			<Button
				title='go back'
				onPress={() => {
					navigation.navigate({
						name: 'Main',
						params: {
							theme: theme,
						},
						merge: true,
					});
				}}
			/>

			

		</SafeAreaView>
	)
}