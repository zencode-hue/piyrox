
export async function sendToTelegram(botToken: string, chatId: string, message: string) {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Telegram Push Failed:", error);
    return false;
  }
}

export async function sendToWebhook(url: string, payload: any) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (error) {
    console.error("Generic Webhook Failed:", error);
    return false;
  }
}
