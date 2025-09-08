import sendSlackNotification from "./slack.js";
import triggerWebhook from "./webhook.js";

export async function notifyInterestedEmail(email) {
  await sendSlackNotification(email);
  await triggerWebhook(email);
}
