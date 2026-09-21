// Print-media regression probe for the recruiter-facing /resume route.
//
// The root layout correctly renders the ICP filing on every web route. The resume is also a
// print-to-PDF surface, where that same root footer must disappear or it can become stray CV
// content / an extra page. This probe exercises real Chrome print media rather than grepping CSS.
//
// Usage:
//   npm run build && PORT=3111 npm run start:next
//   npm run check:resume-print
import { spawn } from "node:child_process";

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const url = process.argv.find((arg) => arg.startsWith("http")) ?? "http://localhost:3111/resume";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connect(port) {
  for (let i = 0; i < 80; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((target) => target.type === "page");
      if (page) return page;
    } catch {
      // Chrome is still starting.
    }
    await sleep(250);
  }
  throw new Error("headless Chrome did not expose a page target - set CHROME_PATH?");
}

const port = 9900 + (process.pid % 80);
const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=/tmp/quarkspace-print-cdp-${port}`,
  "about:blank",
], { stdio: "ignore" });

chrome.on("error", (error) => {
  console.error(`cannot launch Chrome: ${error.message}`);
  process.exit(2);
});

try {
  const target = await connect(port);
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));

  let seq = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, (message) => message.error
      ? reject(new Error(`${method}: ${message.error.message}`))
      : resolve(message.result));
    ws.send(JSON.stringify({ id, method, params }));
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setEmulatedMedia", { media: "print" });
  await send("Page.navigate", { url });
  await sleep(3000);

  const expression = `(() => {
    const shown = (el) => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    const filing = document.querySelector("body > footer");
    const toolbar = document.querySelector("main > div:first-child");
    const paper = document.querySelector("main > article");
    const visibleButtons = [...document.querySelectorAll("button")].filter(shown).length;
    return JSON.stringify({
      title: document.title,
      filingPresent: !!filing,
      filingDisplay: filing ? getComputedStyle(filing).display : null,
      toolbarPresent: !!toolbar,
      toolbarDisplay: toolbar ? getComputedStyle(toolbar).display : null,
      paperPresent: !!paper,
      visibleButtons,
    });
  })()`;

  const { result } = await send("Runtime.evaluate", { expression, returnByValue: true });
  const report = JSON.parse(result.value);
  console.log(JSON.stringify(report, null, 2));

  const errors = [];
  if (!report.paperPresent) errors.push("resume paper missing");
  if (!report.filingPresent) errors.push("root filing missing from DOM - web filing contract may have regressed");
  if (report.filingDisplay !== "none") errors.push(`site filing remains printable (display=${report.filingDisplay})`);
  if (!report.toolbarPresent) errors.push("resume toolbar missing from DOM");
  if (report.toolbarDisplay !== "none") errors.push(`resume toolbar remains printable (display=${report.toolbarDisplay})`);
  if (report.visibleButtons !== 0) errors.push(`${report.visibleButtons} interactive button(s) remain visible in print media`);

  ws.close();

  if (errors.length) {
    for (const error of errors) console.error(`FAIL ${error}`);
    process.exitCode = 1;
  } else {
    console.log("resume print contract passed");
  }
} finally {
  chrome.kill();
}
