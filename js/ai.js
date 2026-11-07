// ================== AI CHAT: NPC trả lời bằng Claude ==================
// Key được lưu trong localStorage của trình duyệt trên máy bạn và gửi thẳng tới api.anthropic.com.
const AI_KEY = "englishVillage.ai";
const AI_MODELS = [
  ["claude-opus-5-5", "Claude Opus 5.5 – thông minh nhất (mặc định)"],
  ["claude-sonnet-5-5", "Claude Sonnet 5.5 – nhanh, cân bằng"],
  ["claude-haiku-5-5", "Claude Haiku 5.5 – nhanh nhất, rẻ nhất"],
];
// provider: "claudecode" / "antigravity" = qua server.js (tài khoản đã đăng nhập trong CLI), "api" = API key
let aiCfg = { provider: "claudecode", key: "", model: "claude-opus-5-5", ccModel: "", agyModel: "gemini-3.8-flash-low", bridge: "http://localhost:3000" };
const AGY_MODELS_DEFAULT = [["gemini-3.8-flash-low", "Gemini 3.8 Flash (Low) – nhanh nhất"], ["gemini-3.8-flash-medium", "Gemini 3.8 Flash (Medium)"], ["gemini-3.8-flash-high", "Gemini 3.8 Flash (High)"], ["claude-sonnet-4-6", "Claude Sonnet 4.6 (Thinking)"]];
const viaBridge = () => aiCfg.provider === "claudecode" || aiCfg.provider === "antigravity";
const CC_MODELS = [["", "Mặc định của Claude Code"], ["haiku", "Haiku – nhanh nhất"], ["sonnet", "Sonnet – cân bằng"], ["opus", "Opus – thông minh nhất"]];
const bridgeUrl = () => (location.protocol.startsWith("http") ? location.origin : aiCfg.bridge);
const aiReady = () => (aiCfg.provider === "api" ? !!aiCfg.key : true);
const PROVIDERS = ["claudecode", "antigravity", "api"];
try { Object.assign(aiCfg, JSON.parse(localStorage.getItem(AI_KEY)) || {}); } catch (e) {}
const saveAi = () => { try { localStorage.setItem(AI_KEY, JSON.stringify(aiCfg)); } catch (e) {} };

let sdkPromise = null, client = null, clientKey = "";
async function getClient() {
  sdkPromise ||= import("https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.6.0/+esm");
  const { default: Anthropic } = await sdkPromise;
  if (!client || clientKey !== aiCfg.key) { client = new Anthropic({ apiKey: aiCfg.key, dangerouslyAllowBrowser: true }); clientKey = aiCfg.key; }
  return client;
}

// ---------- Cài đặt ----------
function openAiSettings(after) {
  modal(`<h2>🤖 Cài đặt AI cho NPC</h2>
    <p>Khi kết nối AI, mọi NPC trong làng có thể <b>trò chuyện tự do</b> với bạn bằng tiếng Anh: trả lời đúng vai (thợ bánh, bác sĩ…), dùng từ vựng theo trình độ của bạn và <b>sửa lỗi bằng tiếng Việt</b>.</p>
    <div class="tabs"><button class="small ${aiCfg.provider === "claudecode" ? "active" : ""}" data-p="claudecode">🖥️ Claude Code (local)</button><button class="small ${aiCfg.provider === "antigravity" ? "active" : ""}" data-p="antigravity">🪐 Antigravity CLI</button><button class="small ${aiCfg.provider === "api" ? "active" : ""}" data-p="api">🔑 API key</button></div>
    <div id="p-claudecode" class="${aiCfg.provider === "claudecode" ? "" : "hidden"}">
      <p>Dùng tài khoản Claude bạn đã đăng nhập trong <b>Claude Code</b>, không cần API key. Cần chạy server cầu nối: bấm đúp <b>start.bat</b> (hoặc <code>node server.js</code>) rồi chơi tại <b>http://localhost:3000</b>. Mỗi câu trả lời mất vài giây.</p>
      <label><b>Model</b><br><select id="cc-model" style="width:100%;padding:9px;border-radius:10px;border:2px solid #6b4423;font:inherit">${CC_MODELS.map(([id, n]) => `<option value="${id}" ${id === aiCfg.ccModel ? "selected" : ""}>${n}</option>`).join("")}</select></label>
      ${location.protocol.startsWith("http") ? "" : `<label style="display:block;margin-top:10px"><b>Địa chỉ server</b><br><input id="cc-bridge" value="${esc(aiCfg.bridge)}" style="width:100%;padding:9px;border-radius:10px;border:2px solid #6b4423;font:inherit"></label>`}
    </div>
    <div id="p-antigravity" class="${aiCfg.provider === "antigravity" ? "" : "hidden"}">
      <p>Dùng tài khoản Google bạn đã đăng nhập trong <b>Antigravity CLI</b> (lệnh <code>agy</code>), không cần API key. Cũng cần chạy server cầu nối: bấm đúp <b>start.bat</b> rồi chơi tại <b>http://localhost:3000</b>.</p>
      <label><b>Model</b><br><select id="agy-model" style="width:100%;padding:9px;border-radius:10px;border:2px solid #6b4423;font:inherit">${AGY_MODELS_DEFAULT.map(([id, n]) => `<option value="${id}" ${id === aiCfg.agyModel ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    </div>
    <div id="p-api" class="${aiCfg.provider === "api" ? "" : "hidden"}">
    <p>Lấy API key tại <a href="https://platform.claude.com/settings/keys" target="_blank" rel="noopener">platform.claude.com</a>. Key chỉ lưu trong trình duyệt trên máy này. Đừng dùng cách này nếu bạn đưa game lên mạng cho người khác chơi.</p>
    <label><b>API key</b><br><input id="ai-key" type="password" value="${esc(aiCfg.key)}" placeholder="sk-ant-..." style="width:100%;padding:9px;border-radius:10px;border:2px solid #6b4423;font:inherit"></label>
    <label style="display:block;margin-top:10px"><b>Model</b><br><select id="ai-model" style="width:100%;padding:9px;border-radius:10px;border:2px solid #6b4423;font:inherit">${AI_MODELS.map(([id, n]) => `<option value="${id}" ${id === aiCfg.model ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    </div>
    <div class="row"><button id="ai-save">💾 Lưu</button><button id="ai-test">🧪 Thử kết nối</button><button id="ai-clear" class="small">Xóa key</button></div><div id="ai-msg" style="margin-top:8px"></div>`);
  document.querySelectorAll("#modal-box .tabs button").forEach((b) => (b.onclick = () => {
    aiCfg.provider = b.dataset.p;
    document.querySelectorAll("#modal-box .tabs button").forEach((x) => x.classList.toggle("active", x === b));
    for (const p of PROVIDERS) $("p-" + p).classList.toggle("hidden", aiCfg.provider !== p);
  }));
  fetch(bridgeUrl() + "/api/models?provider=antigravity").then((r) => r.json()).then((d) => {
    const sel = $("agy-model"); if (!sel || !d.models || !d.models.length) return;
    sel.innerHTML = d.models.map((m) => `<option value="${esc(m.id)}" ${m.id === aiCfg.agyModel ? "selected" : ""}>${esc(m.name)}</option>`).join("");
  }).catch(() => {});
  const read = () => { aiCfg.key = $("ai-key").value.trim(); aiCfg.model = $("ai-model").value; aiCfg.ccModel = $("cc-model").value; aiCfg.agyModel = $("agy-model").value; if ($("cc-bridge")) aiCfg.bridge = $("cc-bridge").value.trim().replace(/\/$/, ""); saveAi(); };
  $("ai-save").onclick = () => { read(); toast("Đã lưu cài đặt AI"); if (after) after(); else closeAll(); };
  $("ai-clear").onclick = () => { aiCfg.key = ""; saveAi(); $("ai-key").value = ""; $("ai-msg").textContent = "Đã xóa key."; };
  $("ai-test").onclick = async () => {
    read(); $("ai-msg").textContent = "Đang thử...";
    try { const r = await askClaude("You are a friendly villager.", [{ role: "user", content: "Say hello in 5 words." }]); $("ai-msg").innerHTML = `✅ Kết nối OK: "${esc(r.text)}"`; }
    catch (e) { $("ai-msg").innerHTML = `<span style="color:#c0392b">❌ ${esc(aiError(e))}</span>`; }
  };
}

function aiError(e) {
  const s = e?.status;
  if (s === 401) return "API key không hợp lệ.";
  if (s === 429) return "Gửi quá nhanh hoặc hết hạn mức, đợi một chút rồi thử lại.";
  if (s === 400) return "Yêu cầu không hợp lệ: " + (e.message || "");
  if (s >= 500) return "Máy chủ AI đang bận, thử lại sau.";
  return e?.message || String(e);
}

// ---------- Gọi Claude (streaming) ----------
// opts.raw: không phải chat NPC (VD: sinh bài tập) · opts.maxTokens: độ dài tối đa câu trả lời
async function askClaude(system, messages, onText, opts = {}) {
  if (viaBridge()) {
    const isAgy = aiCfg.provider === "antigravity";
    let r;
    try { r = await fetch(bridgeUrl() + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system, messages, provider: aiCfg.provider, model: isAgy ? aiCfg.agyModel : aiCfg.ccModel, npc: opts.raw ? "✏️ Soạn bài" : askClaude.npc || "NPC", raw: !!opts.raw }) }); }
    catch (e) { throw new Error("Không kết nối được server cầu nối. Hãy chạy 'node server.js' (hoặc start.bat) rồi mở http://localhost:3000"); }
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `Server lỗi ${r.status}`);
    if (onText) onText(data.text);
    return { text: data.text, usage: data.usage, totals: data.totals };
  }
  const c = await getClient();
  const params = { model: aiCfg.model, max_tokens: opts.maxTokens || 1024, system, messages, output_config: { effort: opts.raw ? "medium" : "low" } };
  // Opus/Sonnet: bật fallback phía server khi bị từ chối (Haiku chưa hỗ trợ)
  const useFallback = aiCfg.model !== "claude-haiku-5-5";
  const stream = useFallback
    ? c.beta.messages.stream({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" })
    : c.messages.stream(params);
  if (onText) stream.on("text", onText);
  const msg = await stream.finalMessage();
  if (msg.stop_reason === "refusal") throw new Error("NPC không thể trả lời câu này. Hãy hỏi chuyện khác nhé!");
  const u = msg.usage || {};
  const usage = { input: u.input_tokens || 0, cacheWrite: u.cache_creation_input_tokens || 0, cacheRead: u.cache_read_input_tokens || 0, output: u.output_tokens || 0 };
  usage.total = usage.input + usage.cacheWrite + usage.cacheRead + usage.output;
  return { usage, text: msg.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim() };
}

// ---------- Hồ sơ NPC & trình độ người học ----------
function learnerLevel() {
  const passed = ["B2", "B1", "A2", "A1"].find((lv) => (save.exams[lv] || 0) >= 70);
  return passed ? `CEFR ${passed} (passed the ${passed} exam)` : "absolute beginner (A0-A1). Use very short, very simple sentences and the most common words only";
}
const SHOP_OF = Object.fromEntries((typeof BUILDINGS !== "undefined" ? BUILDINGS : []).filter((b) => b.keeper).map((b) => [b.keeper[0], b.name]));
function npcPersona(n) {
  const shop = SHOP_OF[n.name];
  if (n.tense) return `You are ${n.name.replace(/[^\p{L}\p{N} .()'-]/gu, "").trim()}, a weird but friendly character in "English Village", a 2D game where a Vietnamese learner practices English tenses.
You are ${n.tense.quirk}.

STRICT RULE: every sentence you say must use the ${n.tense.info.vi} tense (${n.tense.tense.replace(/_/g, " ")}: ${n.tense.info.formula}). Ask questions that force the learner to answer in this same tense.
The learner's level: ${learnerLevel()}.
- Stay in your funny character. Reply with 1-2 short sentences and one follow-up question in this tense.

Answer in exactly this format, with these three labels and nothing else:
REPLY: <your answer in English>
VI: <Vietnamese translation of your answer>
FIX: <in Vietnamese: check whether the learner's last message used the ${n.tense.info.vi} tense correctly (verb form, auxiliary, signal words), correct it and give the corrected English sentence; write only "OK" if it was already correct>`;
  const role = n.job ? `You are ${n.job}. Love talking about your daily work: your tasks, tools, working hours, what is hard and what you enjoy, and ask the learner about their own job or dream job.`
    : shop ? `You run the ${shop} in the village and you are standing in front of your shop.`
    : n.name.includes("🍎") || n.name.includes("🛒") ? "You sell goods at a market stall in the village."
    : "You are a villager walking around the village.";
  return `You are ${n.name.replace(/[^\p{L}\p{N} .()'-]/gu, "").trim()}, a character in "English Village", a 2D game where a Vietnamese learner practices everyday English.
${role} Topics you like to talk about: ${n.topics.join(", ")}.

The learner's level: ${learnerLevel()}.

How to talk:
- Stay in character and keep it a natural, friendly everyday conversation.
- Reply with 1-2 short sentences, then usually ask one simple follow-up question so the learner keeps talking.
- Match the learner's level; avoid idioms and rare words unless the level is B1 or higher.
- If the learner writes Vietnamese or mixes languages, answer in simple English and show them how to say it in English.

Answer in exactly this format, with these three labels and nothing else:
REPLY: <your answer in English>
VI: <Vietnamese translation of your answer>
FIX: <in Vietnamese, briefly correct the learner's last message (grammar, word choice, more natural phrasing) and give the corrected English sentence; write only "OK" if it was already correct>`;
}
function parseAi(t) {
  const get = (k) => (t.match(new RegExp(`${k}:\\s*([\\s\\S]*?)(?=\\n(?:REPLY|VI|FIX):|$)`)) || [])[1]?.trim() || "";
  return { reply: get("REPLY") || t.trim(), vi: get("VI"), fix: get("FIX") };
}

// ---------- Giao diện chat ----------
const SR2 = window.SpeechRecognition || window.webkitSpeechRecognition;
function openAiChat(n) {
  if (!aiReady()) return openAiSettings(() => openAiChat(n));
  document.onkeydown = null; busy = true; n.talking = true;
  n.aiHistory ||= [];
  const box = $("dialog"); box.classList.remove("hidden");
  box.innerHTML = `<div class="who">💬 ${esc(n.name)} <small>· Chat tự do với AI</small></div>
    <div id="ai-log" style="max-height:38vh;overflow:auto;margin:8px 0;display:flex;flex-direction:column;gap:8px"></div>
    <div class="row" style="margin-top:4px"><input id="ai-in" placeholder="Gõ tiếng Anh... (Enter để gửi)" autocomplete="off" style="flex:1;min-width:180px;padding:10px 12px;border-radius:12px;border:2px solid #6b4423;font:inherit;font-size:16px">
      ${SR2 ? '<button id="ai-mic" title="Nói">🎙️</button>' : ""}<button id="ai-send">Gửi ➤</button></div>
    <div class="row"><button class="small" id="ai-back">◀ Hội thoại có sẵn</button><button class="small" id="ai-set">⚙️ Cài đặt AI</button><button class="small" id="ai-bye">Tạm biệt (Esc)</button></div>`;
  const log = $("ai-log"), input = $("ai-in");
  const add = (who, html) => { const d = document.createElement("div"); d.style.cssText = who === "me" ? "align-self:flex-end;background:#ffe9b8;border-radius:14px 14px 4px 14px;padding:8px 12px;max-width:85%" : "align-self:flex-start;background:#fff;border:1px solid #e6d6b4;border-radius:14px 14px 14px 4px;padding:8px 12px;max-width:85%"; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; };
  const npcBubble = (p) => `<b>${esc(p.reply)}</b> <button class="small" data-say="${esc(p.reply)}">🔊</button>${p.vi ? `<div class="vi">${esc(p.vi)}</div>` : ""}`;
  for (const m of n.aiHistory) if (!m.content.startsWith("(The learner")) add(m.role === "user" ? "me" : "npc", m.role === "user" ? esc(m.content) : npcBubble(parseAi(m.content)));
  log.onclick = (e) => { const s = e.target.dataset?.say; if (s) speak(s); };

  let sending = false;
  async function send(text) {
    text = text.trim(); if (!text || sending) return;
    sending = true; input.value = ""; $("ai-send").disabled = true;
    add("me", esc(text));
    n.aiHistory.push({ role: "user", content: text });
    const out = add("npc", "<i>...</i>"); let raw = "";
    try {
      askClaude.npc = n.name;
      const r = await askClaude(npcPersona(n), n.aiHistory.slice(-20), (d) => { raw += d; out.innerHTML = `<b>${esc(parseAi(raw).reply)}</b>`; log.scrollTop = log.scrollHeight; });
      const p = parseAi(r.text);
      n.aiHistory.push({ role: "assistant", content: r.text });
      out.innerHTML = npcBubble(p);
      if (r.usage) {
        const u = r.usage, f = (x) => x.toLocaleString("en-US");
        out.insertAdjacentHTML("beforeend", `<div style="font-size:11px;color:#9a8a76;margin-top:4px" title="input ${f(u.input)} · cache ghi ${f(u.cacheWrite)} · cache đọc ${f(u.cacheRead)} · output ${f(u.output)}">🔢 ${f(u.total)} token (vào ${f(u.input + u.cacheWrite + u.cacheRead)} · ra ${f(u.output)})${r.totals ? ` · phiên: ${f(r.totals.total)}` : ""}</div>`);
      }
      if (p.fix && !/^OK\.?$/i.test(p.fix)) add("fix", `<div style="color:#8a5a2b">✏️ <b>Góp ý:</b> ${esc(p.fix)}</div>`).style.background = "#fff8e1";
      speak(p.reply); n.bubble = p.reply.length > 40 ? p.reply.slice(0, 38) + "…" : p.reply; n.bubbleT = 4;
      addXp(5);
    } catch (e) {
      n.aiHistory.pop(); out.innerHTML = `<span style="color:#c0392b">❌ ${esc(aiError(e))}</span>`;
    }
    sending = false; if ($("ai-send")) { $("ai-send").disabled = false; input.focus(); }
  }
  $("ai-send").onclick = () => send(input.value);
  input.onkeydown = (e) => { e.stopPropagation(); if (e.key === "Enter") send(input.value); if (e.key === "Escape") { n.talking = false; closeAll(); } };
  $("ai-back").onclick = () => runChat(n, [], 0);
  $("ai-set").onclick = () => openAiSettings(() => { closeAll(); talkTo(n); });
  $("ai-bye").onclick = () => { n.talking = false; closeAll(); };
  if ($("ai-mic")) $("ai-mic").onclick = () => {
    const r = new SR2(); r.lang = "en-US"; $("ai-mic").textContent = "🔴";
    r.onresult = (e) => send(e.results[0][0].transcript);
    r.onend = () => { if ($("ai-mic")) $("ai-mic").textContent = "🎙️"; };
    r.onerror = (e) => toast("Lỗi micro: " + e.error);
    r.start();
  };
  if (!n.aiHistory.length) {
    const hello = { reply: `Hi! I'm ${n.name.split(" ")[0]}. How are you today?`, vi: "Chào bạn! Hôm nay bạn thế nào?" };
    n.aiHistory.push({ role: "user", content: "(The learner walks up to you.)" }, { role: "assistant", content: `REPLY: ${hello.reply}\nVI: ${hello.vi}\nFIX: OK` });
    add("npc", npcBubble(hello)); speak(hello.reply);
  }
  setTimeout(() => input.focus(), 50);
}
