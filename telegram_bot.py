import requests

TELEGRAM_BOT = "8565350380:AAGJHdDxkvx1pdo1FMUmncvKnHq_iPfUMSY"
ADMIN_CHAT_ID = "5126266116"

def sendToTelegram(message):
url = f'https://api.telegram.org/bot{"8565350380:AAGJHdDxkvx1pdo1FMUmncvKnHq_iPfUMSY"}/sendMessage'
payload = {
'chat_id': ADMIN_CHAT_ID,
'text': message
}
response = requests.post(url, json=payload)
if response.status_code == 200:
print("Message sent ✅")
else:
print(f"Error sending message: {response.text}")

# Example usage
sendToTelegram("Hello, this is a test message from my bot!")
