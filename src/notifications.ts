import { Expo } from 'expo-server-sdk';
const expo = new Expo()

const sendPushNotification = async (expoPushToken: any) => {
  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error(`expo-push-token is not a valid Expo push token`)
  }
  const messages = []
  const message = {
    to: expoPushToken,
    data: { extraData: 'Some data' },
    title: 'Sent by backend server',
    body: 'This push notification was sent by a backend server!',
  }
  messages.push(message)
  const chunks = expo.chunkPushNotifications(messages)
  const tickets = []

  try {
    (async () => {
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
          tickets.push(...ticketChunk)
        } catch (error) {
          console.error(error)
        }
      }
    })()
  } catch (error) {
    console.error(error)
  }
}