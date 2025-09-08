import axios from "axios";

const GENERIC_WEBHOOK_URL = process.env.GENERIC_WEBHOOK_URL;

export default async function triggerWebhook(email) {
  try {
    await axios.post(GENERIC_WEBHOOK_URL, {
      event: "new_interested_email",
      email: email
    });
    console.log("Generic webhook triggered!");
  } catch (err) {
    console.error("Webhook error:", err.message);
  }
}
