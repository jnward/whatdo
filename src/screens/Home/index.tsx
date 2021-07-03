import React, { useRef, useState, useEffect } from 'react';
import { Animated, FlatList, Alert, View, KeyboardAvoidingView, ScrollView, SafeAreaView, Text, TextInput, Button, AppState, AppStateStatus, AppStateStatic, StyleSheet, RecyclerViewBackedScrollViewBase } from 'react-native';
import * as Linking from 'expo-linking';

import { LinearGradient } from 'expo-linear-gradient';

import * as Notifications from 'expo-notifications';

import { useIsFocused } from '@react-navigation/native';

import LogConsole from './components/LogConsole';
import LogContainer from './components/LogContainer';
import LogContainerPlaceholder from './components/LogContainerPlaceholder';
import Log from './components/Log';

import { db } from '../../utils/Database';

import { styles } from '../../styles';
import { requestPermissionsAsync } from 'expo-notifications';

import { useSafeAreaInsets } from 'react-native-safe-area-context';




const EARLIEST_HOUR = 10;
const LATEST_HOUR = 22;

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
        "insert into daily_log (body, timestamp) values ('test', datetime('now', '-1 day', 'localtime'));";
    executeQuery(createLog, []);
}

async function init() {

    // Notification handler if user recieves a note while in app
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    executeQuery("drop table log;")
    await initDB();
    // executeQuery("select * from log");
    // executeQuery("select datetime(timestamp, 'localtime');")


}

function executeQuery(q: string, params: Array<any>=[]) {
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

// async function executeQueryAsync(q: string, params: Array<any>=[]) {
//     var rows;
//     await db.transaction(
//         async tx => { rows = await tx.executeSql(
//             q,
//             [],
//             async (tx, res) => { return res },
//             (tx, res) => { console.log('Error', res); return true; }
//         )}
//     );
//     console.log('return', rows);
//     return rows;
// }

function initDB() {
    const createLogTable =
        "create table if not exists daily_log (" +
        "id integer primary key autoincrement not null, " +
        "body text, " +
        "timestamp datetime default (datetime('now', 'localtime'))" +
        ");";

    const createTimeTable = 
        "create table if not exists start_end_time (" +
        "id integer primary key not null, " +
        "hour integer default 10, " +
        "startend varchar(5) default 'start'" +
        ");";

    const insertStartTime = 
        "insert into start_end_time (id, hour, startend) values (1, 10, 'start');"

    const insertEndTime = 
        "insert into start_end_time (id, hour, startend) values (2, 20, 'end');"

    const getLogs = 
        "select * from start_end_time;"

    console.log('CREATE LOG TABLE', executeQuery(createLogTable));
    console.log('CREATE TIME TABLE', executeQuery(createTimeTable));
    console.log('CREATE START TIME', executeQuery(insertStartTime));
    console.log('CREATE START TIME', executeQuery(insertEndTime));
    // console.log('CREATE START TIME', await executeQueryAsync(getLogs));


}

function dropDBTables() {
    const q1 = "drop table if exists log;"
    const q2 = "drop table daily_log;"
    const q3 = "drop table start_end_time;";
    executeQuery(q1);
    executeQuery(q2);
    executeQuery(q3);
}

// dropDBTables();
init();  // TODO: put in useEffect?

function getTime(startend: string='start', cb: Function) {
    console.log('getting time', startend);
    const q = "select * from start_end_time where startend=? limit 1;";
    db.transaction(
        tx => { tx.executeSql(
            q,
            [startend],
            (tx, res) => {
                console.log('got time', res.rows.item(0).hour)
                cb(res.rows.item(0)?.hour);
            },
            (tx, res) => {console.log('Error: ', res); return false},
        )}
    );
}

function updateTime(startend: string='start', hour: number) {
    const q = "update table start_end_time set hour=? where startend=?;";
    const params = [startend, hour];
    executeQuery(q, params);
}

function insertLog(body: string) {
    const createLog =
        "insert into daily_log (body) values (?);";
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
    const q = "SELECT timestamp FROM daily_log WHERE timestamp >= datetime('now', 'start of day', 'localtime') AND timestamp < datetime('now', 'start of day', 'localtime', '+1 day');"
    // const q = "SELECT * FROM daily_log order by id desc limit 1;"
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



async function scheduleNewNotifications(earliest_hour: number, latest_hour: number) {
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
    // const startTime = props.startTime;
    // const setStartTime = props.setStartTime;

    const style = styles[props.theme];

    const navigation = props.navigation;
    const [message, setMessage] = useState('init');
    const [noteState, setNoteState] = useState(false);
    const [logState, setLogState] = useState(false);
    const [logsData, setLogsData] = useState([]);
    const [startTime, setStartTime] = useState();
    const [endTime, setEndTime] = useState(4);
    const [dummy, setDummy] = useState('');
    // const [theme, setTheme] = useState(props.theme);
    // const [logText, setLogText] = useState('');
    const scrollHeader = useRef(false);
    const safeAreaInsetTop = useRef(useSafeAreaInsets().top);

    const scrollY = useRef(new Animated.Value(0));
    const ref = useRef();

    const handleScroll = Animated.event(
            [
                {
                    nativeEvent: {
                        contentOffset: { y: scrollY.current },
                    },
                },
            ],
            {
                useNativeDriver: true,
            },
        );

    const getCloser = (value, checkOne, checkTwo) =>
        Math.abs(value - checkOne) < Math.abs(value - checkTwo) ? checkOne : checkTwo;

    // const handleSnap = ({nativeEvent}) => {
    //     console.log('snap');
    //     // flatListRef.current.scrollToOffset({offset: 0});
    //     const offsetY = nativeEvent.contentOffset.y;
    //     if (
    //         !(
    //         translateYNumber.current === 0 ||
    //         translateYNumber.current === -headerHeight / 2
    //         )
    //     ) {
    //         if (flatListRef.current) {
    //         flatListRef.current.scrollToOffset({
    //             offset:
    //             getCloser(translateYNumber.current, -headerHeight, 0) ===
    //             -headerHeight
    //                 ? 0 + headerHeight
    //                 : offsetY - headerHeight,
    //         });
    //         }
    //     }
    //     };
    // const headerHeight = scrollY.current.interpolate({
    //     inputRange: [0, 200],
    //     outputRange: [500, 0],
    //     extrapolate: 'clamp',
    // });

    const headerHeight = 243 + safeAreaInsetTop.current;  //TODO: fix this
    const footerHeight = 100;

    const clampedScrollY = scrollY.current.interpolate({
        inputRange: [0, headerHeight],
        outputRange: [0, headerHeight],
        extrapolateLeft: 'clamp'
    });

    const scrollYClamped = Animated.diffClamp(clampedScrollY, 0, headerHeight);
    const translateY = scrollYClamped.interpolate({
        inputRange: [0, headerHeight],
        outputRange: [0, -headerHeight],
        // extrapolate: 'clamp',
    });




    const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);


    const _getLogData = () => {
        const q = "select * from daily_log order by timestamp desc;"
        db.transaction(
            tx => { tx.executeSql(
                q,
                [],
                (tx, res) => { console.log('LOG DATA', res.rows);_formatLogs(res) },
                (tx, res) => { console.log('ERROR', res); return true; }
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
        console.log('useeffect')
        // translateY.addListener(({value}) => {
        //     console.log('add listener');
        //     translateYNumber.current = value;
        // });
        getTime('start', setStartTime);
        getTime('end', setEndTime);
        return () => {
            translateY.removeAllListeners();
            console.log('remove listeners');
        }
        
    }, [isFocused])

    const [notificationsAllowed, setNotificationsAllowed] = useState(true);


    // handleAppOpen();

    console.log('home theme' ,theme);
    // _getLogData();
    const scrollViewRef = useRef();
    const flatListRef = useRef();
    console.log('ASDFASDFASDFASDF', safeAreaInsetTop.current);

    return (
        <View style={{ flex: 1, width: '100%' }}>
            <KeyboardAvoidingView
                behavior='padding'
                style={{ flex: 1 }}
            >
                {/* <View style={{flex: 1}}> */}
                    {/* <SafeAreaView style={{zIndex: 1, borderWidth: 2, borderColor: 'red'}}> */}
                    {/* <View style={{flex: 1}}> */}
                    <Animated.View style={[style.header, local.header, {flex: 1, transform: [{translateY}]}]}>
                        <View style={[style.header, { height: safeAreaInsetTop.current }]}/>
                        <View style={{flex: 1}}>
                        <Text>You've made it home.</Text>

                        <Button
                            onPress={() => {dropDBTables(); initDB();}}
                            title='Reset DB'
                            color='red'
                        />
                        
                        {/* <Button
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
                        /> */}
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
                        <Button
                            title='settings'
                            onPress={() => navigation.navigate('Settings', {
                                theme: theme,
                                startTime: startTime,
                                endTime: endTime,
                                // updateTime: updateTime,
                            })}
                        />
                        <Text>{`${startTime}, ${endTime}`}</Text>
                        </View>
                    </Animated.View>
                    {/* </View> */}
                    {/* </SafeAreaView> */}
                    {/* <Animated.View style={[style.container, local.container]}> */}
                        {/* {logsData.length ?  */}
                        <View style={{position: 'absolute', width: '100%', flex: 1, height: '100%'}}>
                        <AnimatedFlatList
                            style={[style.container, {flex: 1}]}
                            ListHeaderComponent={<View style={{height: headerHeight}}/>}
                            scrollEventThrottle={16}
                            onScroll={handleScroll}
                            bounces={true}
                            // onScrollEndDrag={() => {console.log('end drag'); translateY.removeAllListeners();}}
                            // onMomentumScrollEnd={handleSnap}
                            contentContainerStyle={[style.container]}
                            ref={ (ref) => { flatListRef.current = ref } }
                            onContentSizeChange={() => {
                                flatListRef.current.scrollToOffset({ offset: 0, animated: true })
                            }}
                            data={logsData}
                            ListEmptyComponent={LogContainerPlaceholder}
                            // <Log key={logData.id} id={logData.id} body={logData.body} timestamp={logData.timestamp} theme={theme}/>
                            renderItem={({item, index, separators}) => (
                                <Log
                                    key={item.id}
                                    id={item.id}
                                    body={item.body}
                                    timestamp={item.timestamp}
                                    theme={theme}
                                />
                            )}
                            />
                            <View style={[local.console, style.console]}>
                                <LogConsole
                                    handleNewLog={_newLog}
                                    logState={logState}
                                    noteState={noteState}
                                    theme={theme}
                                />
                            </View>
                        </View>
                        {/* /> : <LogContainerPlaceholder/> */}
                        {/* {logsData.length ? 
                            <ScrollView
                                ref={scrollViewRef}
                                onContentSizeChange={() => {
                                    scrollViewRef.current.scrollTo({ animated: true })
                                }}
                                >
                                <LogContainer logsData={logsData} theme={theme}/>
                                <View style={{height: 21.5}}/>
                            </ScrollView> : <LogContainerPlaceholder/>
                        } */}
    {/*                <LinearGradient
                        colors={['#43D2FFFF', '#43D2FF00']}
                        style={local.linearGradient}
                    />*/}
                    {/* </Animated.View> */}
                {/* </View> */}

            </KeyboardAvoidingView>
        </View>
    );
}


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
            allowAlert: true, // TODO
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
    console: {
        // position: 'absolute',
        width: '100%',
        bottom: 0,
        zIndex: 1,
    },
    header: {
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderColor: '#000',
        position: 'absolute',
        width: '100%',
        zIndex: 1,
    },
    linearGradient: {
        position: 'absolute',
        width: '100%',
        height: 60,
    },
});
