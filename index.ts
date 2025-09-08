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
