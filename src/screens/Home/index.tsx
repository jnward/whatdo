import React, { useRef, useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, ScrollView, Text, TextInput, Button, AppState, AppStateStatus, AppStateStatic, StyleSheet } from 'react-native';

import * as Notifications from 'expo-notifications';
import * as SQLite from 'expo-sqlite';

import LogConsole from './components/LogConsole';
import Log from './components/Log';

import { styles } from '../../styles';
// TODO: ask perms for notifs

const EARLIEST_HOUR = 10;
const LATEST_HOUR = 22;

const db = SQLite.openDatabase('whatdo');

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
    console.log(notes);
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


// const _handleAppStateChange = async (nextAppState: AppStateStatus) => {
//     if (
//         appState.match(/inactive|background/) &&
//         nextAppState === "active"
//     ) {
//         const notifiedToday = await checkNotifiedToday();
//         const newMessage = notifiedToday ? "Recieved notification today!" : "Still waiting ...";
//         // setMessage(newMessage);
//         // handleAppOpen();

//     }
//     appState = nextAppState;
//     // setAppStateVisible(appState.current);
//     console.log("AppState~~~", appState);
// };


// let appState: String = AppState.currentState;
// AppState.addEventListener("change", _handleAppStateChange);


export default function Home(props) {
    const theme = props.theme;
    const setTheme = props.setTheme;
    const style = styles[props.theme];
    const [message, setMessage] = useState('init');
    const [logs, setLogs] = useState([]);
    // const [logText, setLogText] = useState('');

    const _getLogData = () => {
        const q = "select * from log;"
        db.transaction(
            tx => { tx.executeSql(
                q,
                [],
                (tx, res) => { _makeLogs(res) },
                (tx, res) => { console.log(res); return true; }
            ); }
        );
    }

    const _makeLogs = (res: SQLite.SQLResultSet) => {
        let newLogs = [];
        for (let i = 0; i < res.rows.length; i++) {
            const row = res.rows.item(i);
            console.log(row);
            const newLog = <Log key={row.id} body={row.body} timestamp={row.timestamp} theme={theme}/>;
            newLogs.push(newLog);
        }
        console.log("NEWLOGS: ", newLogs)
        setLogs(newLogs);
    }

    const _newLog = (body: String) => {
        insertLog(body);
        _getLogData();
    }



    // handleAppOpen();

    console.log(theme);

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
                <View style={[style.header, local.header, {justifyContent: 'center'}]}>
                    <Button
                        title='change'
                        onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    />
                </View>
                <View style={[style.container, local.container]}>
                    <ScrollView>
                        <LogContainer logs={logs}/>
                    </ScrollView>
                </View>
                <View style={[style.console]}>
                    <Text>You've made it home.</Text>
                    <Button
                        onPress={test}
                        title='Log notifications'
                        color='blue'
                    />
                    <Text>{message}</Text>
                    <AppStateExample setMessage={ setMessage }/>
                    
        {/*            <Button
                        onPress={ _getLogData }
                        title="Press me!"
                    />*/}
        {/*            <Button
                        onPress={() => {insertLog(logText)}}
                        title="Make new log"
                    />*/}

                    <LogConsole handleNewLog={ _newLog }/>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}



// function getLogs() {
//     executeQuery("select * from log;");
// }


const LogContainer = (props) => {
    const logs = props.logs;
    // console.log(logs);
    return (
        <>{logs}</>
    );
}





const AppStateExample = (props) => {
    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);

    useEffect(() => {
        AppState.addEventListener("change", _handleAppStateChange);
        Notifications.addNotificationReceivedListener(notification => {
            _handleAppOpen();
        });

        return () => {
            AppState.removeEventListener("change", _handleAppStateChange);
        }
    }, []);

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

    const _handleAppOpen = async () => {
        console.log('App was opened');

        const notifiedToday = await checkNotifiedToday();
        const newMessage = notifiedToday ? "Recieved notification today!" : "Still waiting ...";
        console.log(newMessage);
        props.setMessage(newMessage);
        // return;
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
        height: 100,
    }
})  ;
