import { categorizeEmail } from "./ai/categorize.js";

async function testCategorization() {
  const sampleEmails = [
    {
      subject: "Let's schedule a call",
      text: "Hi, are you available on Thursday for a quick meeting?"
    },
    {
      subject: "We are not interested",
      text: "Thanks for reaching out, but we are not interested in this opportunity."
    },
    {
      subject: "Your resume has been shortlisted!",
      text: "Please book a time for your technical interview here: https://cal.com/example"
    },
    {
      subject: "Get rich quick!!!",
      text: "Congratulations, you won a lottery. Click this link now!"
    },
    {
      subject: "Out of office auto-reply",
      text: "I am currently out of the office and will respond after 15th January."
    }
  ];

  for (const email of sampleEmails) {
    const category = await categorizeEmail(email.subject, email.text);
    console.log(`📩 Subject: ${email.subject}`);
    console.log(`   Predicted Category: ${category}\n`);
  }
}

testCategorization();
