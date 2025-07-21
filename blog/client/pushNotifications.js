export function requestPermission() {
  return new Promise(async (resolve, reject) => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      reject("Push bildirimleri desteklenmiyor");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        resolve();
      } else {
        reject("Bildirim izni reddedildi");
      }
    } catch (err) {
      reject(err);
    }
  });
}

export async function subscribeToPushNotifications() {
  try {
    await requestPermission();
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.REACT_APP_VAPID_PUBLIC_KEY,
    });

    return subscription;
  } catch (err) {
    console.error("Push aboneliği hatası:", err);
    throw err;
  }
}

export function listenForPushNotifications(callback) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "NOTIFICATION") {
        callback(event.data.payload);
      }
    });
  }
}
