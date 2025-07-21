// frontend/public/service-worker.js (Service Worker dosyası)
self.addEventListener("push", (event) => {
  const data = event.data.json();
  console.log("Push notification received:", data);

  const options = {
    body: data.body,
    icon: "/images/icon.png", // İsteğe bağlı
    // actions: [{ action: 'explore', title: 'Explore this new content' }], // İsteğe bağlı butonlar
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(
      "https://yourblog.com/posts/" + event.notification.data.relatedItemId
    ) // Tıklanınca açılacak sayfa
  );
});
