
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

    // 3. This part is now handled by OneSignal by setting the external_user_id

    // 4. Define the OneSignal notification payload
    const notification = {
      contents: {
        en: `${request.senderName}: ${request.messageText}`,
      },
      headings: {
        en: `New message in ${request.groupName}`
      },
      // Send to users by their user ID in your system
      include_external_user_ids: recipientIds,
      // Fallback for devices that haven't been associated with a user ID
      // included_segments: ["Subscribed Users"], 
      
      // URL to open when the notification is clicked
      web_url: `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com/chat/${request.groupId}`,
      
      // Icon
      web_push_icon: `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com/icons/icon-192x192.png`,
    };

    // 5. Send the notification using the OneSignal REST API
    try {
      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          // IMPORTANT: You need to add your OneSignal REST API Key to your environment variables
          'Authorization': `Basic ${functions.config().onesignal.api_key}`,
        },
        body: JSON.stringify({
            ...notification,
            app_id: functions.config().onesignal.app_id,
        }),
      });
      
      console.log("OneSignal response:", await response.json());
      return response;

    } catch (error) {
      console.error("Error sending OneSignal notification:", error);
      return null;
    }
  });

