import axios from "axios";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

export default async function sendSlackNotification(email) {
  try {
    await axios.post(SLACK_WEBHOOK_URL, {
      text: `:email: New Interested Email!\n*From:* ${email.sender}\n*Subject:* ${email.subject}`
    });
    console.log("Slack notification sent!");
  } catch (err) {
    console.error("Slack error:", err.message);
  }
}
