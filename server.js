// ================== ENGLISH VILLAGE – Cầu nối Claude Code / Antigravity CLI ==================
// Chạy:  node server.js   rồi mở http://localhost:3000
// Mỗi tin nhắn chat của NPC sẽ gọi "claude -p" (Claude Code) hoặc "agy -p" (Antigravity CLI),
// dùng tài khoản bạn đã đăng nhập trong công cụ đó.
// Không cần thư viện ngoài. Tùy chọn môi trường:
//   PORT=3000          cổng server
//   CLAUDE_BIN=claude  đường dẫn tới lệnh claude nếu không tự tìm thấy
//   AGY_BIN=agy        đường dẫn tới lệnh agy nếu không tự tìm thấy
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const PORT = +process.env.PORT || 3000;
// Tìm lệnh claude: biến CLAUDE_BIN → các chỗ cài phổ biến → "claude" trong PATH
function findClaude() {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN;
  const home = os.homedir(), win = process.platform === "win32";
  const candidates = win
    ? [path.join(home, ".local", "bin", "claude.exe"), path.join(process.env.APPDATA || "", "npm", "claude.cmd"), path.join(process.env.LOCALAPPDATA || "", "Programs", "claude", "claude.exe")]
    : [path.join(home, ".local", "bin", "claude"), path.join(home, ".claude", "local", "claude"), "/usr/local/bin/claude", "/opt/homebrew/bin/claude"];
  const hit = candidates.find((p) => { try { return fs.statSync(p).isFile(); } catch (e) { return false; } });
  return hit || "claude";
}
const CLAUDE_BIN = findClaude();
// .exe chạy thẳng (không cần shell); .cmd hoặc lệnh trong PATH trên Windows cần shell
const USE_SHELL = process.platform === "win32" && !/\.exe$/i.test(CLAUDE_BIN);
const BIN = USE_SHELL && /\s/.test(CLAUDE_BIN) && fs.existsSync(CLAUDE_BIN) ? `"${CLAUDE_BIN}"` : CLAUDE_BIN;
const ROOT = __dirname;
// Thư mục trống để Claude Code không đọc file / CLAUDE.md của dự án
const WORKDIR = path.join(os.tmpdir(), "english-village-claude");
fs.mkdirSync(WORKDIR, { recursive: true });
const TIMEOUT_MS = 120000, MAX_PARALLEL = 2;
const MODELS = new Set(["", "sonnet", "opus", "haiku"]);
let running = 0;

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

// Chỉ nhận yêu cầu từ chính game: cùng localhost hoặc mở bằng file:// (Origin "null")
function originOk(req) {
  const o = req.headers.origin;
  return !o || o === "null" || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
}
function send(res, code, body, req) {
  const h = { "Content-Type": "application/json; charset=utf-8" };
  if (req && req.headers.origin) { h["Access-Control-Allow-Origin"] = req.headers.origin; h["Vary"] = "Origin"; }
  res.writeHead(code, h); res.end(JSON.stringify(body));
}

function runClaude(prompt, model) {
  return new Promise((resolve, reject) => {
    const args = ["-p", "--output-format", "json"];
    if (model) args.push("--model", model);
    // shell: true để chạy được claude.cmd (cài qua npm) trên Windows; prompt đi qua stdin nên không lo ký tự đặc biệt
    const child = spawn(BIN, args, { cwd: WORKDIR, shell: USE_SHELL, windowsHide: true });
    let out = "", err = "";
    const timer = setTimeout(() => { child.kill(); reject(new Error("Claude Code phản hồi quá lâu (timeout).")); }, TIMEOUT_MS);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) => { clearTimeout(timer); reject(new Error(e.code === "ENOENT" ? "Không tìm thấy lệnh 'claude'. Hãy cài Claude Code CLI." : e.message)); });
    child.on("close", (code) => {
      clearTimeout(timer);
      let data = null; try { data = JSON.parse(out); } catch (e) {}
      if (data && !data.is_error && typeof data.result === "string") return resolve({ text: data.result.trim(), usage: readUsage(data) });
      const msg = (data && data.result) || err.trim() || out.trim() || `claude thoát với mã ${code}`;
      if (/not recognized|command not found|ENOENT/i.test(msg)) return reject(new Error("Không tìm thấy lệnh 'claude'. Hãy cài Claude Code CLI."));
      if (/log ?in|auth|credential/i.test(msg)) return reject(new Error("Claude Code chưa đăng nhập. Chạy 'claude' trong terminal một lần để đăng nhập."));
      reject(new Error(msg.slice(0, 400)));
    });
    child.stdin.end(prompt);
  });
}

// ================== Antigravity CLI (agy) ==================
// agy -p "<prompt>" --output-format json  →  { status, response, usage: { input_tokens, output_tokens, thinking_tokens, cache_read_tokens, total_tokens } }
function findAgy() {
  if (process.env.AGY_BIN) return process.env.AGY_BIN;
  const home = os.homedir(), win = process.platform === "win32";
  const candidates = win
    ? [path.join(process.env.LOCALAPPDATA || "", "agy", "bin", "agy.exe"), path.join(home, ".gemini", "bin", "agy.exe"), path.join(home, ".local", "bin", "agy.exe")]
    : [path.join(home, ".local", "bin", "agy"), path.join(home, ".gemini", "bin", "agy"), "/usr/local/bin/agy", "/opt/homebrew/bin/agy"];
  return candidates.find((p) => { try { return fs.statSync(p).isFile(); } catch (e) { return false; } }) || "agy";
}
const AGY_BIN = findAgy();
const AGY_SHELL = process.platform === "win32" && !/\.exe$/i.test(AGY_BIN);
const AGY_WORKDIR = path.join(os.tmpdir(), "english-village-agy");
fs.mkdirSync(AGY_WORKDIR, { recursive: true });
const AGY_MISSING = "Không tìm thấy lệnh 'agy'. Hãy cài Antigravity CLI.";

function runAgy(prompt, model) {
  return new Promise((resolve, reject) => {
    // Prompt phải đi kèm ngay sau -p (agy không đọc prompt từ stdin ở chế độ text/json)
    const args = ["--output-format", "json", "--disable-slash-commands", "--print-timeout", "110s"];
    if (model) args.push("--model", model);
    args.push("-p", prompt);
    const child = spawn(AGY_BIN, args, { cwd: AGY_WORKDIR, shell: AGY_SHELL, windowsHide: true });
    let out = "", err = "";
    const timer = setTimeout(() => { child.kill(); reject(new Error("Antigravity phản hồi quá lâu (timeout).")); }, TIMEOUT_MS);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) => { clearTimeout(timer); reject(new Error(e.code === "ENOENT" ? AGY_MISSING : e.message)); });
    child.on("close", (code) => {
      clearTimeout(timer);
      let data = null; try { data = JSON.parse(out.slice(out.indexOf("{"))); } catch (e) {}
      if (data && data.status === "SUCCESS" && typeof data.response === "string") {
        const u = data.usage || {};
        const usage = { input: u.input_tokens || 0, cacheWrite: 0, cacheRead: u.cache_read_tokens || 0, output: (u.output_tokens || 0) + (u.thinking_tokens || 0), cost: null };
        usage.total = u.total_tokens || usage.input + usage.cacheRead + usage.output;
        return resolve({ text: data.response.trim(), usage });
      }
      const msg = (data && (data.error || data.response)) || err.trim() || out.trim() || `agy thoát với mã ${code}`;
      if (/not recognized|command not found|ENOENT/i.test(msg)) return reject(new Error(AGY_MISSING));
      if (/auth|sign ?in|log ?in|credential/i.test(msg)) return reject(new Error("Antigravity CLI chưa đăng nhập. Chạy 'agy' trong terminal một lần để đăng nhập."));
      reject(new Error(String(msg).slice(0, 400)));
    });
  });
}
function runAgyCmd(args) {
  return new Promise((resolve, reject) => {
    const c = spawn(AGY_BIN, args, { cwd: AGY_WORKDIR, shell: AGY_SHELL, windowsHide: true });
    let out = ""; c.stdout.on("data", (d) => (out += d)); c.stderr.on("data", (d) => (out += d));
    c.on("error", () => reject(new Error(AGY_MISSING)));
    c.on("close", (code) => (code === 0 ? resolve(out.trim()) : reject(new Error(AGY_MISSING))));
  });
}
let agyModelsCache = null;
async function agyModels() {
  if (agyModelsCache) return agyModelsCache;
  const out = await runAgyCmd(["models"]);
  const list = out.split(/\r?\n/).map((l) => l.split("\t")).filter((p) => p.length >= 2 && /^[\w.\-]+$/.test(p[0].trim())).map(([id, name]) => ({ id: id.trim(), name: name.trim() }));
  return (agyModelsCache = list);
}
// Windows giới hạn độ dài dòng lệnh (~32.000 ký tự): bỏ bớt tin nhắn cũ nếu prompt quá dài
function fitForCommandLine(system, messages) {
  let msgs = messages.slice(-20), p = buildPrompt(system, msgs);
  while (p.length > 24000 && msgs.length > 2) { msgs = msgs.slice(2); p = buildPrompt(system, msgs); }
  return p;
}

// ---------- Thống kê token ----------
function readUsage(d) {
  const u = d.usage || {};
  const r = {
    input: u.input_tokens || 0,
    cacheWrite: u.cache_creation_input_tokens || 0,
    cacheRead: u.cache_read_input_tokens || 0,
    output: u.output_tokens || 0,
    cost: typeof d.total_cost_usd === "number" ? d.total_cost_usd : null,
  };
  r.total = r.input + r.cacheWrite + r.cacheRead + r.output;
  return r;
}
const totals = { messages: 0, input: 0, cacheWrite: 0, cacheRead: 0, output: 0, total: 0, cost: 0 };
const LOG_FILE = path.join(ROOT, "token-usage.csv");
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, "time,npc,model,seconds,input,cache_write,cache_read,output,total,cost_usd_equivalent\n");
const fmt = (n) => n.toLocaleString("en-US");
function logUsage(npc, model, secs, u) {
  totals.messages++; for (const k of ["input", "cacheWrite", "cacheRead", "output", "total"]) totals[k] += u[k]; totals.cost += u.cost || 0;
  console.log(`[chat] ${npc} · ${secs}s · in ${fmt(u.input)} + cache ghi ${fmt(u.cacheWrite)} + cache đọc ${fmt(u.cacheRead)} · out ${fmt(u.output)} · tổng ${fmt(u.total)} token` + (u.cost != null ? ` · ≈ $${u.cost.toFixed(4)}` : ""));
  console.log(`       Phiên này: ${totals.messages} tin nhắn · ${fmt(totals.total)} token` + (totals.cost ? ` · ≈ $${totals.cost.toFixed(4)}` : ""));
  fs.appendFile(LOG_FILE, [new Date().toISOString(), JSON.stringify(npc), model || "default", secs, u.input, u.cacheWrite, u.cacheRead, u.output, u.total, u.cost ?? ""].join(",") + "\n", () => {});
}

// Ghép vai NPC + lịch sử hội thoại thành một prompt cho claude -p
function buildPrompt(system, messages) {
  const lines = messages.map((m) => (m.role === "user" ? `LEARNER: ${m.content}` : `YOU (NPC): ${m.content}`));
  return `${system}

This is a role-play chat inside a language-learning game. Do not use any tools, do not read or write files, just reply in character.

Conversation so far:
${lines.join("\n\n")}

Write your next message as the NPC, using exactly the REPLY / VI / FIX format described above.`;
}

const CONTENT_FILE = path.join(ROOT, "content", "custom-content.json");
function readBody(req, limit = 200000) {
  return new Promise((resolve, reject) => {
    let b = ""; req.on("data", (d) => { b += d; if (b.length > limit) { reject(new Error("too large")); req.destroy(); } });
    req.on("end", () => resolve(b)); req.on("error", reject);
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    if (!originOk(req)) return send(res, 403, { error: "Origin không được phép" });
    if (req.method === "OPTIONS") {
      res.writeHead(204, { "Access-Control-Allow-Origin": req.headers.origin || "null", "Access-Control-Allow-Methods": "GET, POST", "Access-Control-Allow-Headers": "Content-Type" });
      return res.end();
    }
    if (url.pathname === "/api/models") {
      if (url.searchParams.get("provider") !== "antigravity") return send(res, 200, { models: [] }, req);
      try { return send(res, 200, { models: await agyModels() }, req); }
      catch (e) { return send(res, 200, { models: [], error: e.message }, req); }
    }
    if (url.pathname === "/api/health") {
      try { const v = url.searchParams.get("provider") === "antigravity" ? await runAgyCmd(["--version"]) : await runVersion(); return send(res, 200, { ok: true, version: v }, req); }
      catch (e) { return send(res, 200, { ok: false, error: e.message }, req); }
    }
    if (url.pathname === "/api/content") {
      if (req.method === "GET") {
        fs.readFile(CONTENT_FILE, "utf8", (err, data) => { let c = {}; try { c = JSON.parse(data); } catch (e) {} send(res, 200, c, req); });
        return;
      }
      if (req.method === "POST") {
        let c; try { c = JSON.parse(await readBody(req, 5e6)); } catch (e) { return send(res, 400, { error: "Dữ liệu không hợp lệ" }, req); }
        if (!c || typeof c !== "object" || Array.isArray(c)) return send(res, 400, { error: "Dữ liệu không hợp lệ" }, req);
        fs.mkdirSync(path.dirname(CONTENT_FILE), { recursive: true });
        if (fs.existsSync(CONTENT_FILE)) fs.copyFileSync(CONTENT_FILE, CONTENT_FILE + ".bak");
        fs.writeFileSync(CONTENT_FILE, JSON.stringify(c, null, 2));
        console.log(`[content] Đã lưu nội dung tự soạn → ${path.relative(ROOT, CONTENT_FILE)}`);
        return send(res, 200, { ok: true }, req);
      }
    }
    if (url.pathname === "/api/chat" && req.method === "POST") {
      if (running >= MAX_PARALLEL) return send(res, 429, { error: "Đang xử lý tin nhắn khác, đợi chút nhé." }, req);
      let body; try { body = JSON.parse(await readBody(req)); } catch (e) { return send(res, 400, { error: "Dữ liệu không hợp lệ" }, req); }
      const { system, messages, model = "", npc = "NPC", raw = false, provider = "claudecode" } = body || {};
      const isAgy = provider === "antigravity";
      const modelOk = isAgy ? model === "" || /^[\w.\-]{1,60}$/.test(model) : MODELS.has(model);
      if (typeof system !== "string" || !Array.isArray(messages) || !modelOk) return send(res, 400, { error: "Thiếu system/messages hoặc model sai" }, req);
      running++;
      const t0 = Date.now();
      try {
        const prompt = raw ? `${system}\n\nDo not use any tools and do not read or write files.\n\n${messages.map((m) => m.content).join("\n\n")}` : isAgy ? fitForCommandLine(system, messages) : buildPrompt(system, messages.slice(-20));
        const { text, usage } = isAgy ? await runAgy(prompt, model) : await runClaude(prompt, model);
        logUsage(String(npc).slice(0, 40), (isAgy ? "agy:" : "claude:") + (model || "default"), ((Date.now() - t0) / 1000).toFixed(1), usage);
        send(res, 200, { text, usage, totals }, req);
      } catch (e) { console.log("[chat] lỗi:", e.message); send(res, 500, { error: e.message }, req); }
      finally { running--; }
      return;
    }
    return send(res, 404, { error: "Not found" }, req);
  }
  // File tĩnh của game
  let p = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname)));
  if (!p.startsWith(ROOT) || /server\.js$|node_modules|\.csv$/.test(p)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(data);
  });
}).listen(PORT, "127.0.0.1", () => {
  console.log(`\n🏡 English Village đang chạy: http://localhost:${PORT}`);
  console.log(`🤖 Cầu nối Claude Code: dùng lệnh "${CLAUDE_BIN}" (thư mục làm việc: ${WORKDIR})`);
  runVersion().then((v) => console.log(`✅ Tìm thấy Claude Code ${v}`)).catch((e) => console.log(`⚠️  ${e.message}`));
  console.log(`🪐 Cầu nối Antigravity CLI: dùng lệnh "${AGY_BIN}"`);
  runAgyCmd(["--version"]).then((v) => console.log(`✅ Tìm thấy Antigravity CLI ${v}`)).catch((e) => console.log(`⚠️  ${e.message}`));
});

function runVersion() {
  return new Promise((resolve, reject) => {
    const c = spawn(BIN, ["--version"], { shell: USE_SHELL, windowsHide: true });
    let out = ""; c.stdout.on("data", (d) => (out += d)); c.stderr.on("data", (d) => (out += d));
    c.on("error", () => reject(new Error("Không tìm thấy lệnh 'claude'. Hãy cài Claude Code CLI.")));
    c.on("close", (code) => (code === 0 ? resolve(out.trim()) : reject(new Error("Không tìm thấy lệnh 'claude'. Hãy cài Claude Code CLI."))));
  });
}
