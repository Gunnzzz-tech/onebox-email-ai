// index.ts
import dotenv from "dotenv";
import Imap from "node-imap";
import { connectIMAP } from "./imapClient.js";

dotenv.config();

console.log("🚀 Starting Onebox Email Aggregator...");

const imapConfig1: Imap.Config = {
  user: process.env.EMAIL_USER || "",
  password: process.env.EMAIL_PASS || "",
  host: "imap.gmail.com",
  port: 993,
  tls: true,
};

const imapConfig2: Imap.Config = {
  user: process.env.EMAIL_USER2 || "",
  password: process.env.EMAIL_PASS2 || "",
  host: "imap.gmail.com",
  port: 993,
  tls: true,
};

// Connect both accounts
connectIMAP(imapConfig1, "Account1");
connectIMAP(imapConfig2, "Account2");
const app = express();
const PORT = process.env.PORT || 4000;

app.get("/", (_req, res) => {
  res.send("✅ Onebox Email Aggregator is running on Railway!");
});

app.listen(PORT, () => {
  console.log(`🌍 Server running on http://localhost:${PORT}`);
});

