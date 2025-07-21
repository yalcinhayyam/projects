const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Generate VAPID keys (do this once and save the keys)
// const vapidKeys = webpush.generateVAPIDKeys();
// console.log(vapidKeys);

// Replace with your actual VAPID keys
const vapidKeys = {
  publicKey: 'BGSVLRmOSW1nD9Wxhepg9MbQ1MNe2WIINJxHCiSwYKXUnq9SB2bq-kLvM7KoG_UNmiNvkplUK-s8gJoUuVOwXi0',
  privateKey: 'KTSNJ0aXJ3bR8lVTJ2xkFF1dF53lM71EZcMI-ueU7SA'
};

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store subscriptions in memory (in production, use a database)
let subscriptions = [];

// server.js'de test endpoint'i
app.get('/test-notification', (req, res) => {
  const subscription = subscriptions[0]; // İlk aboneyi al
  if (!subscription) return res.status(400).send('No subscribers');
  
  webpush.sendNotification(subscription, JSON.stringify({
    title: 'TEST',
    body: 'Direct test notification',
    icon: '/logo192.png'
  }))
  .then(() => res.send('Test sent'))
  .catch(err => res.status(500).send('Error: ' + err.message));
});

app.get('/vapid-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// Endpoint to save subscription
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  console.log('New subscription added:', subscription);
  res.status(201).json({});
});

// Endpoint to send notifications (in real app, this would be protected)
app.post('/send-notification', (req, res) => {
  const notificationPayload = {
    title: 'New Notification',
    body: 'This is a push notification from your app!',
    icon: 'https://example.com/icon.png',
    data: {
      url: 'https://example.com'
    }
  };

  const promises = subscriptions.map(sub => 
    webpush.sendNotification(sub, JSON.stringify(notificationPayload))
      .catch(err => console.error('Error sending notification:', err))
  );

  Promise.all(promises)
    .then(() => res.status(200).json({message: 'Notifications sent'}))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Error sending notifications'});
    });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Public VAPID key: ${vapidKeys.publicKey}`);
});

// const webpush = require('web-push');
// const vapidKeys = webpush.generateVAPIDKeys();
// console.log(vapidKeys);