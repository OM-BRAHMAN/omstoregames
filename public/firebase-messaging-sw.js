// Firebase Cloud Messaging Service Worker for OM.COM
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCdV3pPwu8Ug7bXL8_8H8aOKnC9pFpAXzE",
  authDomain: "omcom-9aa9b.firebaseapp.com",
  projectId: "omcom-9aa9b",
  storageBucket: "omcom-9aa9b.firebasestorage.app",
  messagingSenderId: "724459194015",
  appId: "1:724459194015:web:d6eda8d36cbf6011afc4aa",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'OM.COM New Game Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'A new Android game has just arrived on OM.COM!',
    icon: '/icon.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
