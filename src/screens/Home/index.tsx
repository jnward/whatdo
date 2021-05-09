import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Button, AppState, AppStateStatus, AppStateStatic, StyleSheet } from 'react-native';

import * as Notifications from 'expo-notifications';

const EARLIEST_HOUR = 10;
const LATEST_HOUR = 22;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Notifications.addNotificationReceivedListener(notification => {
//     handleAppOpen();
// });

function test() {
    console.log('test');
    Notifications.presentNotificationAsync({
        body: "What're you doing right now?",
    })
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
        await Notifications.scheduleNotificationAsync({
            content: {
                body: `What're you doing right now?`,
            },
            trigger: {
                weekday: i,
                hour: EARLIEST_HOUR + Math.floor(Math.random() * (LATEST_HOUR - EARLIEST_HOUR)),
                minute: Math.floor(Math.random() * 60),
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


export default function Home() {

    let myMessage = 'init';
    const [message, setMessage] = useState(myMessage);

    // handleAppOpen();

    return (
        <View>
            <Text>You've made it home.</Text>
            <Button
                onPress={test}
                title='Send notification now'
                color='blue'
            />
            <Button
                onPress={test2}
                title='Schedule notifications'
                color='purple'
            />
            <Text>{message}</Text>
            <AppStateExample setMessage={ setMessage }/>
        </View>
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
        console.log(notifiedToday);
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

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
