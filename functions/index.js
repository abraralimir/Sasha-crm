
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// This function triggers whenever a new document is created in /notificationRequests
exports.sendChatNotification = functions.firestore
  .document("notificationRequests/{requestId}")
  .onCreate(async (snapshot, context) => {
    const request = snapshot.data();

    // 1. Get the group details to find all members
    const groupDoc = await admin
      .firestore()
      .collection("groups")
      .doc(request.groupId)
      .get();
    
    if (!groupDoc.exists) {
      console.log(`Group ${request.groupId} not found.`);
      return null;
    }
    const groupData = groupDoc.data();
    if (!groupData) {
        console.log(`Group data for ${request.groupId} is empty.`);
        return null;
    }
    const members = groupData.members;

    // 2. Find members who are not the sender
    const recipientIds = members.filter(id => id !== request.senderId);
    if (recipientIds.length === 0) {
      console.log("No recipients to notify.");
      return null;
    }

    // 3. Get the FCM device tokens for each recipient
    const tokens = [];
    for (const userId of recipientIds) {
      const userDoc = await admin.firestore().collection("users").doc(userId).get();
      if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData && userData.fcmToken) {
            tokens.push(userData.fcmToken);
          }
      }
    }

    if (tokens.length === 0) {
      console.log("No FCM tokens found for recipients.");
      return null;
    }

    // 4. Define the push notification payload
    const payload = {
      notification: {
        title: `New message in ${request.groupName}`,
        body: `${request.senderName}: ${request.messageText}`,
        icon: "/icons/icon-192x192.png",
      },
      webpush: {
          fcm_options: {
            link: `/chat/${request.groupId}`
          }
      }
    };

    // 5. Send the notifications
    try {
      console.log(`Sending notification to ${tokens.length} devices.`);
      const response = await admin.messaging().sendToDevice(tokens, payload);
      console.log("Successfully sent message:", response);
      
      // Optional: Clean up tokens that are no longer valid
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          console.error('Failure sending notification to', tokens[index], error);
          // Cleanup the invalid token
          if (error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered') {
            // Unregister the token from your users' database
          }
        }
      });

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      return null;
    }
  });
