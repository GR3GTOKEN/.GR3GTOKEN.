export default async function handler(req, res) {
  const TELEGRAM_BOT = "8565350380:AAGJHdDxkvx1pdo1FMUmncvKnHq_iPfUMSY"; // replace with your Bot token
  const ADMIN_CHAT_ID = "5126266116";       // replace with your numeric chat ID

  // message sent from your website, or fallback if none
  const message = req.body?.message || "✅ Test message from website";

  // send message to Telegram
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: message })
  });

  // respond to the request
  res.status(200).send("OK");
}
