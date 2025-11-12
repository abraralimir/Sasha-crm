
// A service worker file is required to show notifications when the app is in the background.
// This file is intentionally kept simple to allow for easy customization.

// To learn more about how to customize this file, see the following link:
// https://firebase.google.com/docs/cloud-messaging/js/receive

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// This is the config from your web app.
// It's needed to initialize the Firebase app in the service worker.
const firebaseConfig = {
  "projectId": "studio-846341198-1cb7b",
  "appId": "1:39896202643:web:6d7402107b1d7b7f9b3c66",
  "apiKey": "AIzaSyAVbbpnCILRyx1kN1wEAz5PNoHFweX-OJc",
  "authDomain": "studio-846341198-1cb7b.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "39896202643"
};


firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
