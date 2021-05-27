import React, { useState, useEffect, useRef } from 'react';
import { Text, Button } from 'react-native';
import * as Linking from 'expo-linking';

import * as Notifications from 'expo-notifications';
import { requestPermissionsAsync } from 'expo-notifications';

async function checkAllowsNotificationsAsync() {
    const settings = await Notifications.getPermissionsAsync();
    return (
      settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  }


export default function LogConsolePlaceholder() {

    const [notificationsAllowed, setNotificationsAllowed] = useState(true);
    const checkedNotes = useRef(false);

    //const 
    
    useEffect(() => {
        checkAllowsNotificationsAsync().then((doesAllow) => {
            if (doesAllow) {
                setNotificationsAllowed(true);
            } else {
                setNotificationsAllowed(false);
                Notifications.requestPermissionsAsync({
                    ios: {
                        allowAlert: true,
                        allowBadge: true,
                        allowSound: true,
                        allowProvisional: true,
                    },
                });
            }
            checkedNotes.current = true;
        }), [checkedNotes]
    });

    

    return (
        <>
            <Text>{notificationsAllowed ? 'Notifications are allowed' : "Notifications aren't allowed"}</Text>
            {/* {notificationsAllowed ? null : <Button onPress={Linking.openSettings} title='Press here to enable notifications'/>} */}
        </>
    );
}