// Atlas Trigger: onNewMessage
// Fires when a new message is added to a conversation
// Sends FCM push notification to other participants

exports = async function(changeEvent) {
  const { fullDocument, operationType } = changeEvent;
  
  // Only process insert operations (new messages)
  if (operationType !== 'insert') return;
  
  try {
    const conversation = fullDocument;
    const latestMessage = conversation.messages[conversation.messages.length - 1];
    
    if (!latestMessage) return;
    
    const senderId = latestMessage.senderId.toString();
    const senderName = latestMessage.senderName;
    const messageText = latestMessage.text;
    
    // Get FCM tokens for other participants
    const otherParticipants = conversation.participants.filter(
      p => p.userId.toString() !== senderId
    );
    
    if (otherParticipants.length === 0) return;
    
    // Get user collection to fetch FCM tokens from Bloom database
    const usersCollection = context.services.get("mongodb-atlas").db("Bloom").collection("User");
    
    for (const participant of otherParticipants) {
      const user = await usersCollection.findOne(
        { _id: participant.userId },
        { projection: { "preferences.fcmToken": 1, "preferences.notifications": 1 } }
      );
      
      if (!user?.preferences?.fcmToken || !user?.preferences?.notifications) {
        continue;
      }
      
      // Send FCM notification
      await sendFCMNotification(
        user.preferences.fcmToken,
        senderName,
        messageText,
        conversation._id.toString()
      );
    }
    
    console.log(`Notifications sent for message in conversation ${conversation._id}`);
    
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// Send FCM notification
async function sendFCMNotification(fcmToken, senderName, messageText, conversationId) {
  const httpService = context.services.get("http");
  const fcmServerKey = context.values.get("FCM_SERVER_KEY");
  
  const payload = {
    to: fcmToken,
    notification: {
      title: `New message from ${senderName}`,
      body: messageText.substring(0, 100),
      sound: "default",
      badge: "1"
    },
    data: {
      conversationId: conversationId,
      type: "chat_message",
      click_action: "FLUTTER_NOTIFICATION_CLICK"
    },
    priority: "high"
  };
  
  try {
    const response = await httpService.post({
      url: "https://fcm.googleapis.com/fcm/send",
      body: payload,
      headers: {
        "Authorization": `key=${fcmServerKey}`,
        "Content-Type": "application/json"
      }
    });
    
    const result = JSON.parse(response.body.text());
    
    if (result.failure > 0) {
      console.error("FCM notification failed:", result.results);
    } else {
      console.log("FCM notification sent successfully");
    }
    
  } catch (error) {
    console.error("Error sending FCM:", error);
  }
}
