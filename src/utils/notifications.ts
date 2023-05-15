import { Expo, ExpoPushMessage } from 'expo-server-sdk'

const expo = new Expo()

export const sendPushNotifications = async (pushTokens: (string | null)[], message: ExpoPushMessage) => {
  let messages = []
  for (const pushToken of pushTokens) {

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`)
      continue
    }
  
    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      ...message,
      to: pushToken
    })
  }

  const chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  (async () => {
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
        tickets.push(...ticketChunk)
      } catch (error) {
        console.error(error)
      }
    }
  })();
}