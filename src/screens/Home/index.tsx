import React, { useRef, useState, useEffect } from 'react';
import { Alert, View, KeyboardAvoidingView, ScrollView, SafeAreaView, Text, TextInput, Button, AppState, AppStateStatus, AppStateStatic, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';

import { LinearGradient } from 'expo-linear-gradient';

import * as Notifications from 'expo-notifications';
import * as SQLite from 'expo-sqlite';

import { useIsFocused } from '@react-navigation/native';

import LogConsole from './components/LogConsole';
import LogContainer from './components/LogContainer';
import LogContainerPlaceholder from './components/LogContainerPlaceholder';
import Log from './components/Log';

import { styles } from '../../styles';
import { requestPermissionsAsync } from 'expo-notifications';
// TODO: ask perms for notifs

const EARLIEST_HOUR = 10;
const LATEST_HOUR = 22;

const db = SQLite.openDatabase('whatdo');


function sendNote() {
    console.log('sending note!');
    Notifications.scheduleNotificationAsync({
        content: {
          title: 'test',
          body: "test",
        },
        trigger: null,
      });
}

function scheduleOldNote() {
    const today = new Date();
    const weekday = today.getDay() + 1;
    const hour = today.getHours();
    const minute = today.getMinutes();
    const newMinute = (minute - 1) % 60;
    const newHour = minute ? hour : hour - 1;
    console.log(`Scheduling weekly note one minute ago for ${newHour} ${newMinute}`);
    Notifications.scheduleNotificationAsync({
        content: {
            title: 'test',
            body: 'Scheduled for one minute ago',
        },
        trigger: {
            weekday: weekday,
            hour: newHour,
            minute: newMinute,
            repeats: true,
        }
    })
}

function schedule2SecondNote() {
    const today = new Date();
    const weekday = today.getDay() + 1;
    const hour = today.getHours();
    const minute = today.getMinutes();
    const second = today.getSeconds();
    const newSecond = (second + 2) % 60;
    const newMinute = newSecond ? minute : (minute + 1) % 60;
    const newHour = newMinute ? hour : hour + 1;
    console.log(`Scheduling weekly note two seconds from now for ${newHour} ${newMinute} ${newSecond}`);
    Notifications.scheduleNotificationAsync({
        content: {
            title: 'test',
            body: 'Scheduled in two seconds',
        },
        trigger: {
            weekday: weekday,
            hour: newHour,
            minute: newMinute,
            second: newSecond,
            repeats: true,
        }
    })
}

function insertLogYesterday() {
    const createLog =
        "insert into log (body, timestamp) values ('test', datetime('now', '-1 day', 'localtime'));";
    executeQuery(createLog, []);
}

function init() {

    // Notification handler if user recieves a note while in app
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    executeQuery("drop table log;")
    initDB();
    // executeQuery("select * from log");
    // executeQuery("select datetime(timestamp, 'localtime');")


}
// Notifications.addNotificationReceivedListener(notification => {
//     handleAppOpen();
// });

function executeQuery(q: String, params: Array<any>=[]) {
    // console.log(q, params);
    db.transaction(
        tx => { tx.executeSql(
            q,
            params,
            (tx, res) => {  },
            (tx, res) => { return true; }
        ); }
    );
}

function initDB() {
    const createLogTable =
        "create table if not exists log (" +
        "id integer primary key autoincrement not null, " +
        "body text, " +
        "timestamp datetime default (datetime('now', 'localtime'))" +
        ");";

    executeQuery(createLogTable);
}

init();

function insertLog(body: String) {
    const createLog =
        "insert into log (body) values (?);";
    executeQuery(createLog, [body]);
}

async function test() {
    const notes = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Notifications:');
    for(let note of notes) {
        console.log(note);
    }
    //console.log(notes);
}

function test2() {
    console.log('test2');
    Notifications.scheduleNotificationAsync({
        content: {
            body: "What're you doing right now?",
        },
        trigger: {
            weekday: 7,
            hour: 22,
            minute: 50,
            repeats: true,
        }
    });
}

function clearNotes() {
    console.log('clearing notifications');
    Notifications.cancelAllScheduledNotificationsAsync();
}

// async function handleAppOpen() {
//     console.log('App was opened');
//     const notifiedToday = await checkNotifiedToday();
//     console.log(notifiedToday);
//     if (notifiedToday) {
//         console.log("scheduling new notifications");
//         await Notifications.cancelAllScheduledNotificationsAsync();
//         await scheduleNewNotifications();
//     } else {
//         console.log("Not notified yet");
//     }
//     return
// }

async function checkNotifiedToday() {
    const oldNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const today = new Date();
    const weekday = today.getDay() + 1;
    const hour = today.getHours();
    const minute = today.getMinutes();
    for (const note of oldNotifications) {
        const notifiedToday = note.trigger?.dateComponents?.weekday === weekday &&
                              note.trigger?.dateComponents?.hour <= hour &&
                              note.trigger?.dateComponents?.minute <= minute;
        if (notifiedToday) {
            return true;
        }
    }
    return false;
}


function getLastLog() {
    //const q = "SELECT strftime('%s', timestamp) as unixtime FROM log ORDER BY timestamp DESC LIMIT 1;"
    const q = "SELECT timestamp FROM log WHERE timestamp >= datetime('now', 'start of day', 'localtime') AND timestamp < datetime('now', 'start of day', 'localtime', '+1 day');"
    //const q = "select datetime('now', 'localtime'), datetime('now', 'start of day'), datetime('now', 'start of day', '+1 day');"
    return new Promise(resolve => {
        db.transaction(
            tx => { tx.executeSql(
                q,
                [],
                (tx, res) => { resolve(res.rows) },
                (tx, res) => { console.log(res); return true; }
            ); }
        );
    });
}

async function checkLoggedToday() {
    const rows = await getLastLog();
    console.log(rows);
    return rows.length > 0;
}



async function scheduleNewNotifications() {
    const today = new Date();
    const weekday = today.getDay() + 1;
    // const weekday = 4;
    const hour = today.getHours();
    const minute = today.getMinutes();
    for (const i of [...Array(6).keys()].map(x => (x+weekday)%7+1)) {
        //const noteHour = EARLIEST_HOUR + Math.floor(Math.random() * (LATEST_HOUR - EARLIEST_HOUR));
        const noteMinute = Math.floor(Math.random() * 60);
        const noteHour = 12;
        // const noteMinute = 1;
        await Notifications.scheduleNotificationAsync({
            content: {
                //body: `weekday: ${i} hour: ${noteHour} minute: ${noteMinute}`,
                body: "What're you doing right now?"
            },
            trigger: {
                weekday: i,
                hour: noteHour,
                minute: noteMinute,
                repeats: true,
            }
        });
    }
    // await Notifications.scheduleNotificationAsync({
    //     content: {
    //         body: `What're you doing right now?`,
    //     },
    //     trigger: {
    //         weekday: weekday,
    //         hour: EARLIEST_HOUR + Math.floor(Math.random() * (Math.min(LATEST_HOUR, hour) - EARLIEST_HOUR)),
    //         minute: Math.floor(Math.random() * minute),
    //         repeats: true,
    //     }
    // });
    console.log("Minute:", minute, minute*Math.random());
}


async function checkAllowsNotificationsAsync() {
    const settings = await Notifications.getPermissionsAsync();
    return (
      settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  }




export default function Home(props) {
    const theme = props.theme;
    const setTheme = props.setTheme;
    const style = styles[props.theme];

    const navigation = props.navigation;
    const [message, setMessage] = useState('init');
    const [noteState, setNoteState] = useState(false);
    const [logState, setLogState] = useState(false);
    const [logsData, setLogsData] = useState([]);
    const [dummy, setDummy] = useState('');
    // const [theme, setTheme] = useState(props.theme);
    // const [logText, setLogText] = useState('');

    const _getLogData = () => {
        const q = "select * from log order by timestamp;"
        db.transaction(
            tx => { tx.executeSql(
                q,
                [],
                (tx, res) => { _formatLogs(res) },
                (tx, res) => { console.log(res); return true; }
            ); }
        );
    }

    const _formatLogs = (res: SQLite.SQLResultSet) => {
        let newLogs = [];
        for (let i = 0; i < res.rows.length; i++) {
            const row = res.rows.item(i);
            // console.log(row);
            // const newLog = <Log key={row.id} id={row.id} body={row.body} timestamp={row.timestamp} theme={theme}/>;
            newLogs.push(row);
        }
        console.log("NEWLOGS: ", newLogs)
        setLogsData(newLogs);
    }

    // const _makeLogs = (data: any) => {

    // }

    const _newLog = (body: String) => {
        insertLog(body);
        setLogState(true);
        _getLogData();
    }

    const isFocused = useIsFocused();

    useEffect(() => {
        _getLogData();
    }, [isFocused])

    const [notificationsAllowed, setNotificationsAllowed] = useState(true);


    // handleAppOpen();

    console.log('home theme' ,theme);
    // _getLogData();
    const scrollViewRef = useRef();

    return (
        <View style={{ flex:1, width: '100%' }}>
            <KeyboardAvoidingView
                behavior='padding'
                style={{ flex: 1 }}
            >
    {/*            <TextInput
                    style={styles.input}
                    onChangeText={setLogText}
                    onSubmitEditing={() => {
                        insertLog(logText);
                        _getLogData();
                        setLogText('');
                    }}
                    value={logText}
                />*/}
                <SafeAreaView style={[style.header, local.header, {justifyContent: 'center'}]}>
                    <Text>You've made it home.</Text>
                    <Button
                        onPress={test}
                        title='Log scheduled notifications'
                        color='blue'
                    />
                    <Button
                        onPress={sendNote}
                        title='Send one-off note'
                        color='blue'
                    />
                    <Button
                        onPress={scheduleOldNote}
                        title='Schedule note one minute ago'
                        color='blue'
                    />
                    <Button
                        onPress={schedule2SecondNote}
                        title='Schedule note two seconds from now'
                        color='green'
                    />
                    <Button
                        onPress={clearNotes}
                        title='Clear all notes'
                        color='red'
                    />
                    <Button
                        onPress={insertLogYesterday}
                        title='Add log from yesterday'
                        color='green'
                    />
                    {notificationsAllowed ? 
                        null : <Button
                                    onPress={Linking.openSettings}
                                    title='Press here to enable notifications'
                               />
                    }
                    <Text>{JSON.stringify({note: noteState, log: logState})}</Text>
                    <AppStateLogic
                        setNoteState={setNoteState}
                        setLogState={setLogState}
                        setNotificationsAllowed={setNotificationsAllowed}
                    />
{/*                    <Button
                        title='change'
                        onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    />*/}
                    <Button
                        title='settings'
                        onPress={() => navigation.navigate('Settings', {
                            theme: theme,
                        })}
                    />
                </SafeAreaView>
                <View style={[style.container, local.container]}>
                    {logsData.length ? 
                        <ScrollView
                            ref={scrollViewRef}
                            onContentSizeChange={() => {
                                scrollViewRef.current.scrollToEnd({ animated: true })
                            }}
                            >
                            <LogContainer logsData={logsData} theme={theme}/>
                            <View style={{height: 21.5}}/>
                        </ScrollView> : <LogContainerPlaceholder/>
                    }
{/*                <LinearGradient
                    colors={['#43D2FFFF', '#43D2FF00']}
                    style={local.linearGradient}
                />*/}
                </View>
                <View style={[style.console]}>
                    
                    
        {/*            <Button
                        onPress={ _getLogData }
                        title="Press me!"
                    />*/}
        {/*            <Button
                        onPress={() => {insertLog(logText)}}
                        title="Make new log"
                    />*/}

                    <LogConsole handleNewLog={_newLog} theme={theme}/>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}



// function getLogs() {
//     executeQuery("select * from log;");
// }








const AppStateLogic = (props) => {
    const setNoteState = props.setNoteState;
    const setLogState = props.setLogState;
    const setNotificationsAllowed = props.setNotificationsAllowed;
    const appState = useRef(AppState.currentState);
    const notificationListener = useRef();
    const [appStateVisible, setAppStateVisible] = useState(appState.current);
    const checkedNotes = useRef(false);
    useEffect(() => {
        _handleAppOpen();
        AppState.addEventListener("change", _handleAppStateChange);
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('got a notification!');
            _handleAppOpen();
        });

        return () => {
            AppState.removeEventListener("change", _handleAppStateChange);
            Notifications.removeNotificationSubscription(notificationListener.current);
        }
    }, [checkedNotes]);

    const _handleAppStateChange = async (nextAppState: AppStateStatus) => {
        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            await _handleAppOpen();

        }
        appState.current = nextAppState;
        setAppStateVisible(appState.current);
        console.log("AppState", appState.current);
    };

    

    //const 

    const requestPermissions = () => Notifications.requestPermissionsAsync({
        ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowProvisional: true,
        },
    }).then((permissions) => {
        console.log(permissions);
        if (permissions.status === 'granted') {
            setNotificationsAllowed(true);
        } else {
            setNotificationsAllowed(false);
            Linking.openSettings();
        }
    });

    const _verifyNotificationPermissions = async () => checkAllowsNotificationsAsync().then((doesAllow) => {
        if (doesAllow) {
            setNotificationsAllowed(true);
        } else {
            setNotificationsAllowed(false);
            if (!checkedNotes.current) {
                Alert.alert(
                    'Welcome to WhatDo!',
                    "WhatDo works by sending you a notification once per day asking \
what you're doing. Make sure you enable notifications!",
                    [{
                        text: "Let's go!",
                        onPress: requestPermissions,
                    },
                    {
                        text: "I'm not ready...",
                        style: 'destructive',
                    }]
                );
            }
        }
        checkedNotes.current = true;
    });
    

    const _handleAppOpen = async () => {
        console.log('App was opened');
        _verifyNotificationPermissions();

        const notifiedToday = await checkNotifiedToday();
        const loggedToday = await checkLoggedToday();
        //const newMessage = notifiedToday ? "Recieved notification today!" : "Still waiting ...";
        setNoteState(notifiedToday);
        setLogState(loggedToday);
    
        return;
        if (notifiedToday) {
            console.log("scheduling new notifications");
            await Notifications.cancelAllScheduledNotificationsAsync();
            await scheduleNewNotifications();
        } else {
            console.log("Not notified yet");
        }
        return
    }

    return null;
}

const local = StyleSheet.create({
    container: {
        flex: 1,
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
    },
    header: {
        borderBottomWidth: 2,
        borderColor: '#000',
    },
    linearGradient: {
        position: 'absolute',
        width: '100%',
        height: 60,
    },
});
