import Imap from "node-imap";
import dotenv from "dotenv";

dotenv.config();

async function testEmailConnection() {
  console.log('🔍 Testing email connections...\n');

  const emailConfigs = [
    {
      user: process.env.EMAIL_USER || "",
      password: process.env.EMAIL_PASS || "",
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      label: "Gmail Account"
    },
    {
      user: process.env.EMAIL_USER2 || "",
      password: process.env.EMAIL_PASS2 || "",
      host: "imap.gmail.com", // correct host
      port: 993,
      tls: true,
      label: "Gmail Account"
    }
  ];

  let connectedAccounts = 0;

  for (const config of emailConfigs) {
    if (!config.user || !config.password) {
      console.log(`⚠️ Skipping ${config.label} - missing credentials`);
      continue;
    }

    console.log(`🔌 Testing connection to ${config.label}: ${config.user}`);

    try {
      const testImap = new Imap(config);

      await new Promise((resolve, reject) => {
        testImap.once("ready", () => {
          console.log(`✅ ${config.label} connected successfully!`);
          connectedAccounts++;
          testImap.end();
          resolve(true);
        });

        testImap.once("error", (err) => {
          console.log(`❌ ${config.label} connection failed:`, err.message);
          reject(err);
        });

        testImap.connect();
      });
    } catch (error: any) {
      console.log(`❌ ${config.label} connection failed:`, error.message);
    }
  }

  console.log(`\n📊 Summary: ${connectedAccounts} account(s) connected successfully`);

  if (connectedAccounts > 0) {
    console.log('\n🚀 Ready to start email monitoring! Run: npm start');
  } else {
    console.log('\n❌ No accounts connected. Please check your credentials in .env file');
  }
}

testEmailConnection();
