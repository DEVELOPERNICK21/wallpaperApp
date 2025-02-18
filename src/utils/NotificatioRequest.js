import messaging from '@react-native-firebase/messaging';
import {Alert, Platform} from 'react-native';
import notifee, {AndroidImportance} from '@notifee/react-native';

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Notification permission granted.');
  }
}

async function displayNotification(title, body) {
  await notifee.requestPermission();

  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title,
    body,
    android: {channelId: 'default', importance: AndroidImportance.HIGH},
  });
}

messaging().onMessage(async remoteMessage => {
  displayNotification(
    remoteMessage.notification.title,
    remoteMessage.notification.body,
  );
});

export {requestUserPermission};
