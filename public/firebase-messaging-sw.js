// This file is intentionally left blank.
// It's a placeholder that will be populated by next-pwa.
// We need to configure a custom service worker to handle Firebase Messaging.

// Scripts for Firebase
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Be sure to replace the config values with your own
const firebaseConfig = {
  apiKey: "AIzaSyAVbbpnCILRyx1kN1wEAz5PNoHFweX-OJc",
  authDomain: "studio-846341198-1cb7b.firebaseapp.com",
  projectId: "studio-846341198-1cb7b",
  storageBucket: "studio-846341198-1cb7b.appspot.com",
  messagingSenderId: "39896202643",
  appId: "1:39896202643:web:6d7402107b1d7b7f9b3c66"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
