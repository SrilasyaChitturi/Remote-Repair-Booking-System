const admin = require("../firebase");

async function sendNotification(token, title, body) {
  if (!token) return;

  const message = {
    token,
    notification: {
      title,
      body,
    },
  };

  try {
    await admin.messaging().send(message);
    console.log("🔔 Notification sent");
  } catch (err) {
    console.error("❌ Notification error:", err.message);
  }
}

module.exports = sendNotification;
