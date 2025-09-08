// imapClient.ts
import Imap from "node-imap";
import { simpleParser } from "mailparser";
import { indexEmail } from "./elasticsearchClient.js";
import { categorizeEmail } from "./ai/categorize.js";
import { notifyInterestedEmail } from "./notifications/index.js";
import { eventBus } from "./eventBus.js";

/**
 * Connects to an IMAP account, fetches last 30 days of emails,
 * categorizes them with AI, and indexes in Elasticsearch.
 */
export function connectIMAP(config: Imap.Config, label: string) {
  const imap = new Imap(config);

  imap.once("ready", () => {
    console.log(`✅ [${label}] IMAP Connected`);
    openInbox(imap, async (err) => {
      if (err) throw err;

      // 1️⃣ Initial fetch: last 30 days
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - 30);

      imap.search([["SINCE", sinceDate.toDateString()]], async (err, results) => {
        if (err) throw err;
        if (!results.length) {
          console.log(`ℹ️ [${label}] No emails found in last 30 days`);
        } else {
          await fetchAndProcessEmails(imap, results, label, false); // initial backfill: no notifications
        }
      });

      // 2️⃣ Real-time updates using IDLE
      imap.on("mail", async (numNewMsgs) => {
        console.log(`📥 [${label}] ${numNewMsgs} new email(s) received`);
        // Fetch only newest emails
        imap.search([["SINCE", new Date().toDateString()]], async (err, results) => {
          if (err) throw err;
          if (results.length) {
            await fetchAndProcessEmails(imap, [results[results.length - 1]], label, true); // new mail: send notifications
          }
        });
      });
    });
  });

  imap.once("error", (err) => console.error(`❌ [${label}] IMAP Error:`, err));
  imap.once("end", () => console.log(`📴 [${label}] Connection ended`));

  imap.connect();
}

// Open the INBOX folder
function openInbox(imap: Imap, cb: (err: any) => void) {
  imap.openBox("INBOX", true, cb);
}

/**
 * Fetch emails by sequence numbers, parse, categorize, and store
 */
async function fetchAndProcessEmails(imap: Imap, results: number[], label: string, notify: boolean) {
  const fetcher = imap.fetch(results, { bodies: "" });

  fetcher.on("message", (msg) => {
    msg.on("body", async (stream) => {
      try {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        await new Promise<void>((resolve, reject) => {
          stream.on("end", () => resolve());
          stream.on("error", (err) => reject(err));
        });

        const buffer = Buffer.concat(chunks);
        const parsed = await simpleParser(buffer);

        // 1️⃣ Categorize using AI
        const category = await categorizeEmail(parsed.subject || "", parsed.text || "");

        // 2️⃣ Prepare email object for Elasticsearch
        const emailData = {
          ...parsed,
          category,
        };

        console.log(`📩 [${label}] Email:`, {
          from: parsed.from?.text,
          subject: parsed.subject,
          category,
          snippet: parsed.text?.substring(0, 100) + "...",
        });

        // 3️⃣ Index email in Elasticsearch
        try {
          await indexEmail(emailData, label);
          console.log(`✅ [${label}] Email stored in Elasticsearch`);
        } catch (error) {
          console.error(`❌ [${label}] Failed to store email in Elasticsearch:`, error);
        }

        // 4️⃣ Emit SSE event for any new email; send Slack/webhook only for Interested
        try {
          if (notify) {
            const payload = {
              sender: parsed.from?.text || "",
              subject: parsed.subject || "",
              account: label,
              category,
              snippet: parsed.text?.substring(0, 200) || "",
              date: parsed.date || new Date().toISOString(),
            };
            // Emit app-wide event for frontend SSE consumers (all new emails)
            eventBus.emit("new-email", payload);
            // External notifications only for Interested
            if (category === "Interested") {
              await notifyInterestedEmail(payload);
            }
          }
        } catch (err) {
          console.error(`❌ [${label}] Notification failed:`, err);
        }
      } catch (err) {
        console.error(`❌ [${label}] Failed to parse email:`, err);
      }
    });
  });
}
