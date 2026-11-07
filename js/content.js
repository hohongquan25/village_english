// ================== NỘI DUNG TỰ SOẠN + SOẠN BÀI + AI SINH BÀI ==================
// Lưu ở localStorage, và ở file content/custom-content.json khi chạy qua server.js
const CUSTOM_KEY = "englishVillage.custom";
const emptyCustom = () => ({ lessons: [], exams: { A1: [], A2: [], B1: [], B2: [] }, dialogues: [], speaking: [], sentences: [], fill: [], updatedAt: 0 });
let CUSTOM = emptyCustom();
try { CUSTOM = normalizeCustom(JSON.parse(localStorage.getItem(CUSTOM_KEY))); } catch (e) {}

function normalizeCustom(c) {
  const e = emptyCustom(); if (!c || typeof c !== "object") return e;
  for (const k of Object.keys(e)) if (k !== "exams" && Array.isArray(c[k])) e[k] = c[k];
  if (c.exams) for (const lv of LEVELS) if (Array.isArray(c.exams[lv])) e.exams[lv] = c.exams[lv];
  e.updatedAt = +c.updatedAt || 0; return e;
}
const serverBase = () => (location.protocol.startsWith("http") ? location.origin : (typeof aiCfg !== "undefined" ? aiCfg.bridge : ""));
async function saveCustom() {
  CUSTOM.updatedAt = Date.now();
  try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(CUSTOM)); } catch (e) {}
  applyCustom();
  try { await fetch(serverBase() + "/api/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(CUSTOM) }); } catch (e) {}
}
async function loadServerCustom() {
  if (!location.protocol.startsWith("http")) return;
  try {
    const r = await fetch("/api/content"); if (!r.ok) return;
    const c = normalizeCustom(await r.json());
    if (c.updatedAt > CUSTOM.updatedAt) { CUSTOM = c; try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(CUSTOM)); } catch (e) {} applyCustom(); }
    else if (CUSTOM.updatedAt > c.updatedAt) saveCustom();
  } catch (e) {}
}

// Gộp nội dung tự soạn vào dữ liệu game (gọi lại được nhiều lần)
const CUSTOM_PHASE = { phase: "⭐ Bài tự soạn", time: "Học bất cứ lúc nào", lessons: [], custom: true };
const CUSTOM_SPEAK = "⭐ Tự soạn";
function applyCustom() {
  CUSTOM_PHASE.lessons = CUSTOM.lessons.map((l, i) => ({ ...l, id: l.id || "U" + i, custom: true }));
  const pi = ROADMAP.indexOf(CUSTOM_PHASE);
  if (CUSTOM_PHASE.lessons.length && pi < 0) ROADMAP.push(CUSTOM_PHASE);
  if (!CUSTOM_PHASE.lessons.length && pi >= 0) ROADMAP.splice(pi, 1);
  allLessons.length = 0; allLessons.push(...ROADMAP.flatMap((p) => p.lessons));
  for (const lv of LEVELS) { EXAMS[lv] = EXAMS[lv].filter((q) => !q.custom).concat(CUSTOM.exams[lv].map((q) => ({ ...q, custom: true }))); }
  for (let i = DIALOGUES.length - 1; i >= 0; i--) if (DIALOGUES[i].custom) DIALOGUES.splice(i, 1);
  CUSTOM.dialogues.forEach((x, i) => DIALOGUES.push({ ...x, id: x.id || "u" + i, custom: true }));
  if (CUSTOM.speaking.length) SPEAKING[CUSTOM_SPEAK] = CUSTOM.speaking.slice(); else delete SPEAKING[CUSTOM_SPEAK];
  if (typeof updateHud === "function") updateHud();
}
applyCustom();
loadServerCustom();

// ---------- Kiểm tra dữ liệu ----------
const isStr = (s) => typeof s === "string" && s.trim().length > 0;
const VALID = {
  lessons: (x) => isStr(x.title) && Array.isArray(x.words) && x.words.length >= 3 && x.words.every((w) => Array.isArray(w) && isStr(w[0]) && isStr(w[1])),
  exams: (x) => isStr(x.q) && Array.isArray(x.opts) && x.opts.length >= 2 && x.opts.every(isStr) && Number.isInteger(x.a) && x.a >= 0 && x.a < x.opts.length && (x.listen == null || isStr(x.listen)),
  dialogues: (x) => ["topic", "en", "vi", "ok", "okVi", "reply"].every((k) => isStr(x[k])) && Array.isArray(x.wrong) && x.wrong.length >= 2 && x.wrong.every(isStr),
  speaking: isStr,
  sentences: (x) => isStr(x.en),
  fill: (x) => isStr(x.s) && x.s.includes("___") && isStr(x.a),
};
const TOPICS = [...new Set(DIALOGUES.map((x) => x.topic))];

// ---------- Trang soạn bài ----------
const ED_TABS = {
  lessons: "📖 Bài học", exams: "📝 Câu thi", dialogues: "💬 Hội thoại NPC", speaking: "🎤 Luyện nói", sentences: "🧩 Câu luyện tập", fill: "✍️ Điền từ",
};
const field = (id, label, ph = "", val = "") => `<label style="display:block;margin:6px 0"><b>${label}</b><br><input id="${id}" placeholder="${esc(ph)}" value="${esc(val)}" autocomplete="off" style="width:100%;padding:8px 10px;border-radius:10px;border:2px solid #6b4423;font:inherit"></label>`;
const select = (id, label, opts) => `<label style="display:block;margin:6px 0"><b>${label}</b><br><select id="${id}" style="width:100%;padding:8px;border-radius:10px;border:2px solid #6b4423;font:inherit">${opts.map((o) => `<option>${esc(o)}</option>`).join("")}</select></label>`;
const textarea = (id, label, ph) => `<label style="display:block;margin:6px 0"><b>${label}</b><br><textarea id="${id}" rows="6" placeholder="${esc(ph)}" style="width:100%;padding:8px 10px;border-radius:10px;border:2px solid #6b4423;font:inherit"></textarea></label>`;

const FORMS = {
  lessons: {
    html: () => field("e-title", "Tên bài", "VD: Đồ dùng trong nhà") + textarea("e-words", "Từ vựng, mỗi dòng: tiếng Anh = tiếng Việt (ít nhất 3 dòng)", "table = cái bàn\nchair = cái ghế\nlamp = đèn"),
    read: () => ({ title: $("e-title").value.trim(), words: $("e-words").value.split("\n").map((l) => l.split("=").map((s) => s.trim())).filter((w) => w[0] && w[1]).map((w) => [w[0], w[1]]) }),
    show: (x) => `<b>${esc(x.title)}</b> <small>· ${x.words.length} từ: ${esc(x.words.slice(0, 4).map((w) => w[0]).join(", "))}…</small>`,
  },
  exams: {
    html: () => select("e-lv", "Cấp độ", LEVELS) + field("e-q", "Câu hỏi (dùng ___ cho chỗ trống)", "She ___ to school every day.") + field("e-listen", "Câu cho phần nghe (để trống nếu không phải câu nghe)", "") +
      ["A", "B", "C", "D"].map((L, i) => field("e-o" + i, `Đáp án ${L}`, "")).join("") + select("e-a", "Đáp án đúng", ["A", "B", "C", "D"]),
    read: () => { const opts = [0, 1, 2, 3].map((i) => $("e-o" + i).value.trim()).filter(Boolean); const x = { q: $("e-q").value.trim(), opts, a: "ABCD".indexOf($("e-a").value), lv: $("e-lv").value }; if ($("e-listen").value.trim()) x.listen = $("e-listen").value.trim(); return x; },
    show: (x, lv) => `<small style="color:#a0693a">${lv}</small> ${x.listen ? "🔊 " : ""}<b>${esc(x.q)}</b> <small>→ ${esc(x.opts[x.a])}</small>`,
  },
  dialogues: {
    html: () => select("e-topic", "Chủ đề (NPC phụ trách chủ đề này sẽ hỏi bạn)", TOPICS) + field("e-en", "NPC nói (tiếng Anh)") + field("e-vi", "Nghĩa tiếng Việt") + field("e-ok", "Câu trả lời đúng") + field("e-okvi", "Nghĩa câu trả lời") + field("e-w1", "Câu trả lời sai 1") + field("e-w2", "Câu trả lời sai 2") + field("e-reply", "NPC đáp lại khi bạn trả lời đúng"),
    read: () => ({ topic: $("e-topic").value, en: $("e-en").value.trim(), vi: $("e-vi").value.trim(), ok: $("e-ok").value.trim(), okVi: $("e-okvi").value.trim(), wrong: [$("e-w1").value.trim(), $("e-w2").value.trim()], reply: $("e-reply").value.trim() }),
    show: (x) => `<small style="color:#a0693a">${esc(x.topic)}</small> <b>${esc(x.en)}</b> → ${esc(x.ok)}`,
  },
  speaking: { html: () => field("e-s", "Câu luyện nói", "I'd like to book a table for two."), read: () => $("e-s").value.trim(), show: (x) => `<b>${esc(x)}</b>` },
  sentences: { html: () => field("e-en", "Câu tiếng Anh (dùng cho Sắp xếp câu và Nghe & viết lại)") + field("e-vi", "Nghĩa tiếng Việt (không bắt buộc)"), read: () => ({ en: $("e-en").value.trim(), vi: $("e-vi").value.trim() }), show: (x) => `<b>${esc(x.en)}</b> <small class="vi">${esc(x.vi || "")}</small>` },
  fill: {
    html: () => field("e-s", "Câu có chỗ trống ___", "She ___ coffee every morning.") + field("e-a", "Đáp án (nhiều đáp án đúng thì cách nhau bằng |)", "drinks") + field("e-vi", "Gợi ý tiếng Việt (không bắt buộc)", "Cô ấy uống cà phê mỗi sáng."),
    read: () => ({ s: $("e-s").value.trim(), a: $("e-a").value.trim(), vi: $("e-vi").value.trim() }),
    show: (x) => `<b>${esc(x.s)}</b> <small>→ ${esc(x.a)}</small>`,
  },
};
function customList(tab) { return tab === "exams" ? LEVELS.flatMap((lv) => CUSTOM.exams[lv].map((x, i) => ({ x, lv, i }))) : CUSTOM[tab].map((x, i) => ({ x, i })); }

function openEditor(tab = "lessons") {
  const F = FORMS[tab], list = customList(tab);
  modal(`<h2>✏️ Soạn bài</h2>
    <p>Nội dung bạn thêm sẽ xuất hiện ngay trong game. ${location.protocol.startsWith("http") ? "Đang lưu vào file <code>content/custom-content.json</code> qua server." : "Đang lưu trong trình duyệt. Chạy qua <b>start.bat</b> để lưu thành file."}</p>
    <div class="tabs" style="flex-wrap:wrap">${Object.entries(ED_TABS).map(([k, n]) => `<button class="small ${k === tab ? "active" : ""}" onclick="openEditor('${k}')">${n} (${customList(k).length})</button>`).join("")}</div>
    <div style="background:#fff;border:1px solid #e6d6b4;border-radius:12px;padding:10px 14px">
      ${F.html()}
      <div class="row"><button id="e-add">➕ Thêm</button><button id="e-ai">🤖 Sinh bằng AI</button></div><div id="e-msg"></div>
    </div>
    <h3>Đã soạn (${list.length})</h3>
    ${list.length ? list.map((r) => `<div class="lesson"><span>${F.show(r.x, r.lv)}</span><button class="small" data-del="${r.lv || ""}:${r.i}">🗑️</button></div>`).join("") : "<p><i>Chưa có nội dung nào.</i></p>"}
    <div class="row"><button onclick="openExercises()">🏋️ Luyện tập</button><button onclick="openRoadmap()">◀ Lộ trình học</button></div>`);
  $("e-add").onclick = () => {
    let x = F.read(), lv = null;
    if (tab === "exams") { lv = x.lv; delete x.lv; }
    if (!VALID[tab](x)) { $("e-msg").innerHTML = `<span style="color:#c0392b">Chưa đủ thông tin hoặc sai định dạng, kiểm tra lại các ô nhé.</span>`; return; }
    if (tab === "exams") CUSTOM.exams[lv].push(x); else CUSTOM[tab].push(x);
    saveCustom(); toast("✅ Đã thêm"); openEditor(tab);
  };
  $("e-ai").onclick = () => openAiGenerate(tab);
  document.querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => {
    const [lv, i] = b.dataset.del.split(":");
    if (!confirm("Xóa mục này?")) return;
    if (tab === "exams") CUSTOM.exams[lv].splice(+i, 1); else CUSTOM[tab].splice(+i, 1);
    saveCustom(); openEditor(tab);
  }));
}

// ---------- AI sinh bài tập ----------
const GEN_SPEC = {
  lessons: (o) => `${o.count} vocabulary lessons about "${o.topic}" at CEFR ${o.level}. Each item: {"title": "<Vietnamese lesson title>", "words": [["<English word or phrase>", "<Vietnamese meaning>"], ...8 pairs]}`,
  exams: (o) => `${o.count} multiple-choice exam questions at exactly CEFR ${o.level}, topic "${o.topic}", mixing grammar and vocabulary; about 1 in 4 should be listening questions. Each item: {"q": "<question, use ___ for a blank; for listening questions write '🔊 Nghe và chọn câu đúng' or '🔊 Nghe và chọn câu trả lời phù hợp'>", "listen": "<sentence to be read aloud, ONLY for listening questions>", "opts": ["4 options"], "a": <index 0-3 of the correct option>}. Exactly one option must be correct; vary the position of the correct answer.`,
  dialogues: (o) => `${o.count} short everyday dialogue exchanges at CEFR ${o.level} about "${o.topic}". Use "topic": "${o.dlgTopic}". Each item: {"topic": "${o.dlgTopic}", "en": "<what the villager says>", "vi": "<Vietnamese>", "ok": "<a natural correct learner reply>", "okVi": "<Vietnamese>", "wrong": ["<2 wrong replies: grammatically wrong or not answering the question>"], "reply": "<villager's short follow-up>"}`,
  speaking: (o) => `${o.count} useful sentences for speaking practice at CEFR ${o.level} about "${o.topic}", 5-14 words each. Each item is a plain string.`,
  sentences: (o) => `${o.count} natural sentences at CEFR ${o.level} about "${o.topic}", 4-11 words each, for word-order and dictation exercises. Each item: {"en": "<sentence>", "vi": "<Vietnamese meaning>"}`,
  fill: (o) => `${o.count} fill-in-the-blank items at CEFR ${o.level} about "${o.topic}", each testing one grammar or vocabulary point. Each item: {"s": "<sentence with exactly one ___>", "a": "<the missing word; if several answers are acceptable separate them with |>", "vi": "<Vietnamese meaning of the full sentence>"}`,
};
function extractJsonArray(t) {
  const s = t.indexOf("["), e = t.lastIndexOf("]");
  if (s < 0 || e <= s) throw new Error("AI không trả về danh sách hợp lệ, thử lại nhé.");
  return JSON.parse(t.slice(s, e + 1));
}
function openAiGenerate(tab) {
  if (typeof aiReady !== "function" || !aiReady()) return openAiSettings(() => openAiGenerate(tab));
  const curLevel = ["B2", "B1", "A2", "A1"].find((lv) => (save.exams[lv] || 0) >= 70);
  const suggest = curLevel ? LEVELS[Math.min(3, LEVELS.indexOf(curLevel) + 1)] : "A1";
  modal(`<h2>🤖 AI sinh bài: ${ED_TABS[tab]}</h2>
    <p>AI (${{ claudecode: "Claude Code qua server", antigravity: "Antigravity CLI qua server", api: "Claude API" }[aiCfg.provider]}) sẽ soạn nội dung, bạn xem lại rồi chọn những mục muốn lưu.</p>
    ${select("g-level", "Cấp độ", LEVELS)}
    ${field("g-topic", "Chủ đề", "VD: đi siêu thị, phỏng vấn xin việc, thì hiện tại hoàn thành...", "daily life")}
    ${tab === "dialogues" ? select("g-dtopic", "Gán cho nhóm NPC có chủ đề", TOPICS) : ""}
    ${select("g-count", "Số lượng", tab === "lessons" ? ["1", "2", "3"] : ["5", "10", "15"])}
    <div class="row"><button id="g-go">✨ Sinh nội dung</button><button onclick="openEditor('${tab}')">◀ Quay lại</button></div><div id="g-out" style="margin-top:12px"></div>`);
  $("g-level").value = suggest;
  $("g-go").onclick = async () => {
    const o = { level: $("g-level").value, topic: $("g-topic").value.trim() || "daily life", count: +$("g-count").value, dlgTopic: $("g-dtopic") ? $("g-dtopic").value : "" };
    const out = $("g-out"); out.innerHTML = "<i>⏳ AI đang soạn... (qua Claude Code / Antigravity có thể mất 10–40 giây)</i>"; $("g-go").disabled = true;
    try {
      const system = "You write English-learning content for Vietnamese learners. Content must be accurate, natural, and appropriate for the requested CEFR level. Vietnamese translations must be natural Vietnamese. Respond with only a JSON array and no other text.";
      const r = await askClaude(system, [{ role: "user", content: `Create ${GEN_SPEC[tab](o)}\nReturn a JSON array.` }], null, { raw: true, maxTokens: 8000 });
      const items = extractJsonArray(r.text).map((x) => (tab === "exams" && x && x.listen === "" ? (delete x.listen, x) : x)).filter((x) => VALID[tab](x));
      if (!items.length) throw new Error("AI trả về nội dung không đúng định dạng, thử lại nhé.");
      const F = FORMS[tab];
      out.innerHTML = `<h3>Kết quả (${items.length}) ${r.usage ? `<small style="color:#9a8a76">· ${r.usage.total.toLocaleString("en-US")} token</small>` : ""}</h3>
        ${items.map((x, i) => `<label class="lesson" style="cursor:pointer;justify-content:flex-start"><input type="checkbox" checked data-g="${i}"> <span>${F.show(x, o.level)}</span></label>`).join("")}
        <div class="row"><button id="g-save">💾 Lưu các mục đã chọn</button></div>`;
      $("g-save").onclick = () => {
        const pick = [...out.querySelectorAll("[data-g]")].filter((c) => c.checked).map((c) => items[+c.dataset.g]);
        if (tab === "exams") CUSTOM.exams[o.level].push(...pick); else CUSTOM[tab].push(...pick);
        saveCustom(); toast(`✅ Đã lưu ${pick.length} mục`); openEditor(tab);
      };
    } catch (e) { out.innerHTML = `<span style="color:#c0392b">❌ ${esc(e.message ? aiError(e) : String(e))}</span>`; }
    if ($("g-go")) $("g-go").disabled = false;
  };
}
