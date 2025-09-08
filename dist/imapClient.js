"use strict";
import Imap from "node-imap";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";
dotenv.config();
const imapConfig1 = {
    user: process.env.EMAIL_USER || "",
    password: process.env.EMAIL_PASS || "",
    host: "imap.gmail.com",
    port: 993,
    tls: true,
};
const imapConfig2 = {
    user: process.env.EMAIL_USER2,
    password: process.env.EMAIL_PASS2,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
};
export function connectIMAP(config, label) {
    const imap = new Imap(config);
    imap.once("ready", () => {
        console.log("✅ IMAP Connected");
        openInbox(imap, (err) => {
            if (err)
                throw err;
            const since = new Date();
            since.setDate(since.getDate() - 30);
            imap.search([["SINCE", since.toDateString()]], (err, results) => {
                if (err)
                    throw err;
                if (!results.length) {
                    console.log(`ℹ️ [${label}] No emails found`);
                    return;
                }
                const f = imap.fetch(results, { bodies: "" });
                f.on("message", (msg) => {
                    msg.on("body", async (stream) => {
                        try {
                            // Convert the stream to a buffer first
                            const chunks = [];
                            stream.on('data', (chunk) => chunks.push(chunk));
                            await new Promise((resolve, reject) => {
                                stream.on('end', resolve);
                                stream.on('error', reject);
                            });
                            const buffer = Buffer.concat(chunks);
                            const parsed = await simpleParser(buffer);
                            console.log("📩 Email:", {
                                from: parsed.from?.text, // ✅ no TS error
                                subject: parsed.subject, // ✅ strongly typed
                                text: parsed.text, // ✅ body as plain text
                            });
                        }
                        catch (err) {
                            console.error("❌ Mail parsing failed:", err);
                        }
                    });
                });
            });
        });
    });
    imap.once("error", (err) => {
        console.error("❌ IMAP Error:", err);
    });
    imap.once("end", () => {
        console.log("📴 Connection ended");
    });
    imap.connect();
}
function openInbox(imap, cb) {
    imap.openBox("INBOX", true, cb);
}
//# sourceMappingURL=imapClient.js.map