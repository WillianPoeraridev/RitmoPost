/* Mock da Evolution API pra testar o cron de WhatsApp sem VPS.
   Uso: node qa/mock-evolution.cjs  → escuta em :8099 e grava qa/results/whatsapp-sent.json */
const http = require("http");
const fs = require("fs");
const path = require("path");

const outFile = path.join(__dirname, "results", "whatsapp-sent.json");
const received = [];

http
  .createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const entry = {
        url: req.url,
        apikey: req.headers["apikey"],
        body: body ? JSON.parse(body) : null,
      };
      received.push(entry);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, JSON.stringify(received, null, 2));
      console.log(`[mock-evolution] ${req.method} ${req.url} → number=${entry.body?.number}`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
    });
  })
  .listen(8099, () => console.log("[mock-evolution] escutando em :8099"));
