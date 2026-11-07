// ================== CÁC DẠNG BÀI TẬP ==================
// Nối từ · Sắp xếp câu · Nghe & viết lại · Điền từ
// Nội dung lấy tự động từ bài học, hội thoại, câu luyện nói + nội dung bạn tự soạn (CUSTOM).
const normText = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();

const EX_TYPES = {
  match: { icon: "🔗", name: "Nối từ", desc: "Nối từ tiếng Anh với nghĩa tiếng Việt" },
  order: { icon: "🧩", name: "Sắp xếp câu", desc: "Bấm các từ theo đúng thứ tự để tạo câu" },
  dictation: { icon: "🎧", name: "Nghe & viết lại", desc: "Nghe câu rồi gõ lại chính xác" },
  fill: { icon: "✍️", name: "Điền từ", desc: "Điền từ còn thiếu vào chỗ trống" },
};

// ---------- Nguồn câu ----------
function sentencePool() {
  const out = [];
  for (const x of DIALOGUES) { out.push({ en: x.ok, vi: x.okVi }); out.push({ en: x.en, vi: x.vi }); }
  for (const list of Object.values(SPEAKING)) for (const s of list) out.push({ en: s, vi: "" });
  for (const s of CUSTOM.sentences) out.push(s);
  return out.filter((s) => { const n = s.en.split(/\s+/).length; return n >= 3 && n <= 11; });
}
function fillPool() {
  const auto = DIALOGUES.map((x) => {
    const words = x.ok.split(/\s+/);
    const idx = words.map((w, i) => [w.replace(/[^A-Za-z']/g, ""), i]).filter(([w, i]) => w.length >= 3 && i > 0);
    if (!idx.length) return null;
    const [w, i] = idx[(Math.random() * idx.length) | 0];
    return { s: words.map((v, k) => (k === i ? v.replace(w, "___") : v)).join(" "), a: w, vi: x.okVi };
  }).filter(Boolean);
  return [...CUSTOM.fill, ...CUSTOM.fill, ...auto]; // ưu tiên câu tự soạn
}
function matchPool() {
  const ok = (w) => !/\//.test(w[0]);
  const words = allLessons.filter((l) => save.lessons[l.id] || lessonUnlocked(l.id)).flatMap((l) => l.words).filter(ok);
  // Chưa đủ từ (người mới): lấy thêm từ các bài sắp học theo thứ tự lộ trình
  for (const l of allLessons) { if (words.length >= 20) break; for (const w of l.words) if (ok(w) && !words.includes(w)) words.push(w); }
  return words;
}

// ---------- Trung tâm bài tập ----------
function openExercises() {
  const st = save.exStats || {};
  modal(`<h2>🏋️ Phòng luyện tập</h2><p>Mỗi lượt 8 câu, nội dung thay đổi mỗi lần. Từ vựng lấy từ các bài bạn đã mở khóa, câu lấy từ hội thoại trong làng và nội dung bạn tự soạn.</p>
    <div class="levels">${Object.entries(EX_TYPES).map(([k, t]) => `<button class="level" onclick="startExercise('${k}')"><big>${t.icon}</big><b>${t.name}</b><br><small>${t.desc}</small><br><small style="color:#2f9e44">${st[k] ? `Đã làm ${st[k].n} lượt · tốt nhất ${st[k].best}%` : "Chưa làm"}</small></button>`).join("")}</div>
    <div class="row"><button onclick="openRoadmap()">◀ Lộ trình học</button><button onclick="openEditor()">✏️ Soạn bài</button></div>`);
}

function startExercise(type) {
  const N = 8;
  let items;
  if (type === "match") { const pool = shuffle(matchPool()); items = Array.from({ length: 3 }, (_, i) => pool.slice(i * 5, i * 5 + 5)).filter((r) => r.length >= 3); }
  else if (type === "fill") items = shuffle(fillPool()).slice(0, N);
  else items = shuffle(sentencePool()).slice(0, N);
  if (!items.length) return toast("Chưa đủ nội dung cho dạng bài này.");
  let i = 0, right = 0;
  const t = EX_TYPES[type];
  const next = () => {
    if (i >= items.length) {
      const pct = Math.round((right / items.length) * 100);
      save.exStats ||= {}; const s = (save.exStats[type] ||= { n: 0, best: 0 }); s.n++; s.best = Math.max(s.best, pct);
      addXp(Math.round(pct / 5)); persist();
      modal(`<h2>${t.icon} ${t.name}</h2><div class="score">${pct}%</div><p style="text-align:center">Đúng ${right}/${items.length}. ${pct >= 80 ? "🎉 Xuất sắc!" : pct >= 50 ? "👍 Khá tốt, luyện thêm nhé!" : "💪 Cố lên, làm lại lần nữa nhé!"}</p>
        <div class="row" style="justify-content:center"><button onclick="startExercise('${type}')">🔁 Làm lượt mới</button><button onclick="openExercises()">◀ Các dạng bài</button></div>`);
      return;
    }
    modal(`<h2>${t.icon} ${t.name}</h2><div>Câu ${i + 1}/${items.length}</div><div class="bar"><div style="width:${(i / items.length) * 100}%"></div></div><div id="ex-body"></div><div id="ex-fb"></div>`);
    RENDER[type](items[i], $("ex-body"), (ok, html) => {
      if (ok) right++;
      $("ex-fb").innerHTML = `<div class="row">${ok ? "✅ Chính xác!" : "❌ Chưa đúng."} ${html || ""}<button id="ex-next">Tiếp ▶</button></div>`;
      $("ex-next").onclick = () => { i++; next(); };
      $("ex-next").focus();
    });
  };
  next();
}

const inputStyle = "flex:1;min-width:200px;padding:10px 12px;border-radius:12px;border:2px solid #6b4423;font:inherit;font-size:18px";
const RENDER = {
  // Nối 3–5 cặp từ
  match(pairs, el, done) {
    const left = shuffle(pairs.map((p, i) => ({ t: p[0], i }))), right = shuffle(pairs.map((p, i) => ({ t: p[1], i })));
    let sel = null, matched = 0, mistakes = 0;
    el.innerHTML = `<p>Bấm một từ bên trái rồi bấm nghĩa đúng bên phải.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div style="display:grid;gap:8px">${left.map((x) => `<button data-side="l" data-i="${x.i}">${esc(x.t)}</button>`).join("")}</div>
      <div style="display:grid;gap:8px">${right.map((x) => `<button data-side="r" data-i="${x.i}">${esc(x.t)}</button>`).join("")}</div></div>`;
    el.querySelectorAll("button").forEach((b) => (b.onclick = () => {
      if (b.disabled) return;
      if (b.dataset.side === "l") { el.querySelectorAll('[data-side="l"]').forEach((x) => (x.style.outline = "")); sel = b; b.style.outline = "3px solid #f59e0b"; speak(b.textContent, 0.85); return; }
      if (!sel) return toast("Chọn từ bên trái trước");
      if (sel.dataset.i === b.dataset.i) {
        [sel, b].forEach((x) => { x.disabled = true; x.classList.add("ok"); x.style.outline = ""; }); sel = null; matched++;
        if (matched === pairs.length) { const ok = mistakes <= 1; done(ok, `<span class="vi">${mistakes} lần nối sai</span>`); }
      } else { mistakes++; b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 500); }
    }));
  },
  // Sắp xếp các từ thành câu
  order(s, el, done) {
    const words = s.en.split(/\s+/);
    let tiles = shuffle(words.map((w, i) => ({ w, i })));
    if (words.length > 1 && tiles.every((t, k) => t.i === k)) tiles.reverse();
    const answer = [];
    el.innerHTML = `${s.vi ? `<p class="vi">Nghĩa: ${esc(s.vi)}</p>` : `<p><button class="small" id="o-say">🔊 Nghe gợi ý</button></p>`}
      <div id="o-ans" style="min-height:52px;border-bottom:3px dashed #c9a96e;display:flex;flex-wrap:wrap;gap:6px;padding:6px 0;margin-bottom:12px"></div>
      <div id="o-pool" style="display:flex;flex-wrap:wrap;gap:6px"></div><div class="row"><button id="o-check">Kiểm tra</button></div>`;
    if ($("o-say")) $("o-say").onclick = () => speak(s.en);
    const draw = () => {
      $("o-ans").innerHTML = answer.map((t, k) => `<button class="small" data-a="${k}">${esc(t.w)}</button>`).join("");
      $("o-pool").innerHTML = tiles.map((t, k) => `<button class="small" data-p="${k}">${esc(t.w)}</button>`).join("");
      $("o-ans").querySelectorAll("button").forEach((b) => (b.onclick = () => { tiles.push(...answer.splice(+b.dataset.a, 1)); draw(); }));
      $("o-pool").querySelectorAll("button").forEach((b) => (b.onclick = () => { answer.push(...tiles.splice(+b.dataset.p, 1)); draw(); }));
    };
    draw();
    $("o-check").onclick = () => {
      if (tiles.length) return toast("Hãy dùng hết các từ");
      const ok = normText(answer.map((t) => t.w).join(" ")) === normText(s.en);
      $("o-check").disabled = true; speak(s.en);
      done(ok, ok ? "" : `<span>Câu đúng: <b>${esc(s.en)}</b></span>`);
    };
  },
  // Nghe và gõ lại
  dictation(s, el, done) {
    el.innerHTML = `<p>Nghe câu rồi gõ lại. Không cần quan tâm chữ hoa và dấu câu.</p>
      <div class="row"><button id="d-play">🔊 Nghe</button><button class="small" id="d-slow">🐢 Chậm</button></div>
      <div class="row"><input id="d-in" autocomplete="off" style="${inputStyle}" placeholder="Gõ câu bạn nghe được..."><button id="d-check">Kiểm tra</button></div>`;
    $("d-play").onclick = () => speak(s.en); $("d-slow").onclick = () => speak(s.en, 0.6);
    setTimeout(() => speak(s.en), 200);
    const check = () => {
      const v = $("d-in").value; if (!v.trim()) return;
      const r = scoreSpeech(s.en, v); $("d-check").disabled = true; $("d-in").disabled = true;
      done(r.score >= 90, `<span class="diff">${r.html} <small>(${r.score}%)</small>${s.vi ? ` <span class="vi">· ${esc(s.vi)}</span>` : ""}</span>`);
    };
    $("d-check").onclick = check;
    $("d-in").onkeydown = (e) => { e.stopPropagation(); if (e.key === "Enter") check(); };
    $("d-in").focus();
  },
  // Điền từ còn thiếu
  fill(x, el, done) {
    el.innerHTML = `<div class="line" style="font-size:22px;margin:10px 0">${esc(x.s).replace("___", '<span style="color:#e67e22">_____</span>')}</div>
      ${x.vi ? `<p class="vi">Gợi ý: ${esc(x.vi)}</p>` : ""}${x.hint ? `<p class="vi">Từ gốc: ${esc(x.hint)}</p>` : ""}
      <div class="row"><input id="f-in" autocomplete="off" style="${inputStyle}" placeholder="Từ còn thiếu..."><button id="f-check">Kiểm tra</button></div>`;
    const check = () => {
      const v = $("f-in").value; if (!v.trim()) return;
      const answers = String(x.a).split("|").map(normText);
      const ok = answers.includes(normText(v));
      $("f-check").disabled = true; $("f-in").disabled = true;
      const full = x.s.replace("___", String(x.a).split("|")[0]); speak(full);
      done(ok, ok ? "" : `<span>Đáp án: <b>${esc(String(x.a).split("|")[0])}</b> → ${esc(full)}</span>`);
    };
    $("f-check").onclick = check;
    $("f-in").onkeydown = (e) => { e.stopPropagation(); if (e.key === "Enter") check(); };
    $("f-in").focus();
  },
};
