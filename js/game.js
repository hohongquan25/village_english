// ================== ENGLISH VILLAGE – GAME ENGINE ==================
const TS = 32;
const cv = document.getElementById("game"); let ctx = cv.getContext("2d", { alpha: false });
const $ = (id) => document.getElementById(id);

// ---------- Lưu tiến độ ----------
const SAVE_KEY = "englishVillage.v1";
let save = { xp: 0, srs: {}, lessons: {}, exams: {}, speak: 0, streak: 0, lastDay: "" };
try { Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY)) || {}); } catch (e) {}
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} updateHud(); }
(function streak() {
  const today = new Date().toDateString();
  if (save.lastDay !== today) {
    const y = new Date(Date.now() - 864e5).toDateString();
    save.streak = save.lastDay === y ? save.streak + 1 : 1;
    save.lastDay = today; persist();
  }
})();
function addXp(n) { save.xp += n; persist(); }
function updateHud() {
  $("hud-xp").textContent = save.xp;
  $("hud-learned").textContent = DIALOGUES.filter((x) => (save.srs[x.id]?.box || 0) >= 3).length;
  $("hud-total").textContent = DIALOGUES.length;
  $("hud-streak").textContent = save.streak;
}
function toast(msg) { const t = $("toast"); t.textContent = msg; t.classList.remove("hidden"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add("hidden"), 2200); }

// ---------- Phát âm (Text-to-Speech) ----------
let enVoice = null;
function pickVoice() { const v = speechSynthesis.getVoices(); enVoice = v.find((x) => /en-US/.test(x.lang) && /Female|Aria|Jenny|Google/.test(x.name)) || v.find((x) => /^en/.test(x.lang)) || null; }
if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text, rate = 0.9) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/\/.*?\//g, ""));
  u.lang = "en-US"; u.rate = rate; if (enVoice) u.voice = enVoice;
  speechSynthesis.speak(u);
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------- Bản đồ ----------
// . cỏ  = đường  P quảng trường  f hoa  T cây  W nước  R mái  B tường nhà  D cửa  U đài phun nước
// Y đèn  M sạp chợ  N hàng rào  h bụi cây  F sàn  c thảm  w tường trong  K bàn  L kệ sách  O bảng
const WALK = new Set([".", "=", "f", "F", "c", "D", "P", "C", "A", "k"]);
function grid(w, h, fill) { return Array.from({ length: h }, () => Array(w).fill(fill)); }
function rect(g, x1, y1, x2, y2, t) { for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) g[y][x] = t; }
function house(g, x1, y1, x2, y2, doorX) { rect(g, x1, y1, x2, y1 + 2, "R"); rect(g, x1, y1 + 3, x2, y2, "B"); if (doorX != null) g[y2][doorX] = "D"; }
const hash = (x, y) => (((x * 73856093) ^ (y * 19349663)) >>> 0) % 1000;
const W_ = (g) => g[0].length, H_ = (g) => g.length;

function buildRoom(kind) {
  const W = 30, H = 20, g = grid(W, H, "F");
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x === 0 || x === W - 1 || y <= 1 || y === H - 1) g[y][x] = "w";
  g[H - 1][15] = "D";
  rect(g, 13, 8, 17, 18, "c");
  rect(g, 11, 1, 19, 1, "O");
  if (kind === "study") {
    rect(g, 2, 2, 6, 2, "L"); rect(g, 23, 2, 27, 2, "L");
    [10, 13, 16].forEach((y) => { rect(g, 4, y, 6, y, "K"); rect(g, 9, y, 11, y, "K"); rect(g, 19, y, 21, y, "K"); rect(g, 24, y, 26, y, "K"); });
  } else {
    [5, 11, 18, 24].forEach((x) => rect(g, x - 1, 6, x + 1, 6, "K"));
    [12, 15].forEach((y) => { for (let x = 3; x <= 27; x += 4) if (x < 12 || x > 18) g[y][x] = "K"; });
  }
  return g;
}

let seed = 20261106; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = (a) => a[(rnd() * a.length) | 0];

// ================== THẾ GIỚI LÀNG: đường cong, công trình riêng ==================
const VW_ = 100, VH_ = 65;
// Đường lớn ngang cuối map: vỉa hè hàng 57 và 62, mặt đường 58–61 (làn trên đi sang trái, làn dưới đi sang phải)
const HWY = { walkTop: 57, y0: 58, y1: 61, walkBot: 62, laneW: 59 * TS + 4, laneE: 61 * TS + 4 };
// Đường: [điểm điều khiển], độ rộng (ô)
const ROADS = [
  { w: 2.6, main: true, pts: [[-1, 30], [12, 27], [22, 31], [32, 28], [40, 29], [50, 25], [60, 28], [70, 24], [80, 26], [90, 26], [101, 27]] },
  { w: 2.6, main: true, pts: [[40, -1], [38, 10], [43, 18], [40, 29], [36, 38], [41, 46], [39.5, 57.5]] },
  { w: 1.7, pts: [[2, 14], [14, 15], [24, 12], [32, 14], [38.5, 11.5]] },
  { w: 1.7, pts: [[42, 16], [52, 12.5], [62, 15], [72, 12], [80, 14], [90, 13], [101, 14]] },
  { w: 1.7, pts: [[2, 42], [14, 40.5], [24, 44], [37.5, 41.5]] },
  { w: 1.7, pts: [[40.5, 44.5], [52, 40.5], [63, 44], [80, 41], [90, 42], [101, 41]] },
  { w: 1.2, pts: [[22, 31], [25, 37], [24, 44]] },
  { w: 1.2, pts: [[60, 28], [63.5, 35], [63, 44]] },
  { w: 1.2, pts: [[24, 12], [27.5, 20], [25, 30]] },
  { w: 1.2, pts: [[52, 12.5], [57, 18], [55.5, 26]] },
  { w: 1.2, pts: [[12, 27], [15, 22], [13, 18], [14, 15]] },
  { w: 1.2, pts: [[70, 24], [73, 18], [72, 12]] },
];
ROADS.push({ w: 1.7, pts: [[90, -1], [90.5, 12], [89.5, 26], [90.5, 40], [90, 57.5]] });
const PLAZA = { x: 40, y: 29, r: 5.2 };
const PONDS = [{ x: 71, y: 49, rx: 6, ry: 3.6 }, { x: 8, y: 8.5, rx: 0, ry: 0 }];

// type quyết định kiến trúc. r = [x1, y1, x2, y2]; cửa ở hàng dưới cùng
const BUILDINGS = [
  { type: "school", name: "STUDY ROOM", r: [5, 3, 14, 10], door: 9, enter: "study" },
  { type: "hall", name: "EXAM HALL", r: [63, 2, 74, 9], door: 68, enter: "exam" },
  { type: "bakery", name: "BAKERY", r: [17, 4, 23, 9], door: 20, keeper: ["Anna (Baker)", ["cafe"]] },
  { type: "bookstore", name: "BOOKS", r: [27, 3, 34, 8], door: 30, keeper: ["Mr. Page", ["bookstore"]] },
  { type: "clothes", name: "BOUTIQUE", r: [44, 4, 51, 10], door: 47, keeper: ["Sophie", ["clothes"]] },
  { type: "pharmacy", name: "PHARMACY", r: [54, 4, 60, 10], door: 57, keeper: ["Mr. Lee", ["pharmacy", "health"]] },
  { type: "post", name: "POST", r: [3, 18, 10, 23], door: 7, keeper: ["Postman Pat", ["post"]] },
  { type: "restaurant", name: "RESTAURANT", r: [16, 17, 23, 23], door: 19, keeper: ["Chef Marco", ["restaurant"]] },
  { type: "bank", name: "BANK", r: [29, 17, 35, 23], door: 32, keeper: ["Ms. Grace", ["bank"]] },
  { type: "barber", name: "BARBER", r: [46, 17, 52, 22], door: 49, keeper: ["Leo (Barber)", ["barber"]] },
  { type: "clinic", name: "CLINIC", r: [60, 16, 69, 22], door: 64, keeper: ["Dr. Sam", ["health"]] },
  { type: "cafe", name: "CAFÉ", r: [15, 33, 21, 38], door: 18, keeper: ["Ella (Barista)", ["cafe"]] },
  { type: "flower", name: "FLOWERS", r: [27, 33, 33, 38], door: 30, keeper: ["Rosa", ["flower"]] },
  { type: "toys", name: "TOYS", r: [46, 33, 52, 38], door: 49, keeper: ["Benny", ["toy", "hobby"]] },
  { type: "house", r: [55, 31, 60, 36], door: 57, v: 0 }, { type: "house", r: [66, 30, 71, 35], door: 68, v: 1 },
  { type: "cottage", r: [73, 29, 77, 34], door: 75, v: 2 }, { type: "cottage", r: [4, 46, 9, 51], door: 6, v: 0 },
  { type: "house", r: [15, 47, 21, 52], door: 18, v: 2 }, { type: "cottage", r: [28, 46, 34, 51], door: 31, v: 1 },
  { type: "house", r: [45, 47, 51, 52], door: 48, v: 1 }, { type: "cottage", r: [55, 47, 61, 52], door: 58, v: 2 },
];
BUILDINGS.push(
  { type: "fire", name: "FIRE STATION", r: [82, 3, 88, 10], door: 85, keeper: ["Firefighter Dan 🚒", ["firefighter"]], job: "firefighter" },
  { type: "police", name: "POLICE", r: [92, 3, 97, 10], door: 94, keeper: ["Officer Kate 👮", ["police"]], job: "police" },
  { type: "garage", name: "GARAGE", r: [82, 16, 88, 22], door: 85, keeper: ["Mike (Mechanic) 🔧", ["mechanic"]], job: "mechanic" },
  { type: "workshop", name: "CARPENTER", r: [92, 16, 97, 22], door: 94, keeper: ["Joe (Carpenter) 🪚", ["carpenter"]], job: "carpenter" },
  { type: "tailor", name: "TAILOR", r: [82, 30, 87, 35], door: 84, keeper: ["Mrs. Thu (Tailor) 🧵", ["tailor"]], job: "tailor" },
  { type: "warehouse", name: "WAREHOUSE", r: [92, 45, 97, 50], door: 94, keeper: ["Sam (Delivery) 📦", ["delivery"]], job: "delivery" },
);
const FIELD = [92, 30, 97, 38], SITE = [82, 45, 87, 50], BUS_STOP = [52, 56];
const STALLS = [[4, 33, "fruit"], [7, 33, "market"], [10, 33, "fruit"], [4, 37, "market"], [7, 37, "fruit"], [10, 37, "market"], [36, 25, "fruit"], [44, 25, "market"], [36, 33, "market"], [44, 33, "fruit"]];

function catmull(pts, n = 24) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]); return out;
}
function buildVillage() {
  const w = VW_, h = VH_, g = grid(w, h, ".");
  const inside = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  for (const p of PONDS) if (p.rx) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (((x + .5 - p.x) / p.rx) ** 2 + ((y + .5 - p.y) / p.ry) ** 2 <= 1) g[y][x] = "W";
  g.roadLines = [];
  for (const r of ROADS) {
    const s = catmull(r.pts); g.roadLines.push({ pts: s, w: r.w, main: r.main });
    for (const [sx, sy] of s) for (let y = Math.floor(sy - r.w); y <= sy + r.w; y++) for (let x = Math.floor(sx - r.w); x <= sx + r.w; x++)
      if (inside(x, y) && Math.hypot(x + .5 - sx, y + .5 - sy) <= r.w / 2 + 0.05) g[y][x] = "=";
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (Math.hypot(x + .5 - PLAZA.x, y + .5 - PLAZA.y) <= PLAZA.r) g[y][x] = "P";
  rect(g, 39, 28, 40, 29, "U");
  rect(g, 0, HWY.walkTop, w - 1, HWY.walkTop, "k"); rect(g, 0, HWY.y0, w - 1, HWY.y1, "A"); rect(g, 0, HWY.walkBot, w - 1, HWY.walkBot, "k");
  g.overlap = [];
  for (const b of BUILDINGS) {
    const [x1, y1, x2, y2] = b.r;
    for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) { if (g[y][x] !== ".") g.overlap.push(b.type + "@" + x + "," + y); g[y][x] = "B"; }
    g[y2][b.door] = b.enter ? "D" : "d";
  }
  // Lối nhỏ từ cửa ra đường gần nhất (BFS)
  g.paths = [];
  for (const b of BUILDINGS) {
    const sx = b.door, sy = b.r[3] + 1, prev = new Map([[sx + "," + sy, null]]), q = [[sx, sy]]; let end = null;
    while (q.length && !end) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + "," + ny;
        if (!inside(nx, ny) || prev.has(k)) continue;
        const t = g[ny][nx]; if (t === "=" || t === "P") { prev.set(k, x + "," + y); end = k; break; }
        if (t !== ".") continue; prev.set(k, x + "," + y); q.push([nx, ny]);
      }
    }
    const line = [];
    for (let k = end; k; k = prev.get(k)) { const [x, y] = k.split(",").map(Number); line.unshift([x + .5, y + .5]); if (g[y][x] === ".") g[y][x] = "="; }
    line.unshift([b.door + .5, b.r[3] + 1]); g.paths.push(line);
  }
  for (const [x, y] of STALLS) g[y][x] = "M";
  for (let y = FIELD[1]; y <= FIELD[3]; y++) for (let x = FIELD[0]; x <= FIELD[2]; x++) if (g[y][x] === ".") g[y][x] = "C";
  for (let y = SITE[1]; y <= SITE[3]; y++) for (let x = SITE[0]; x <= SITE[2]; x++) if (g[y][x] === ".") g[y][x] = "S";
  if (g[BUS_STOP[1]][BUS_STOP[0]] === ".") g[BUS_STOP[1]][BUS_STOP[0]] = "Z";
  // Bảng từ vựng trước mỗi công trình / nơi làm việc
  g.boards = []; g.boardAt = {};
  const putBoard = (ox, oy, set, offsets) => {
    for (const [dx, dy] of offsets) {
      const x = ox + dx, y = oy + dy;
      if (g[y]?.[x] !== "." || g.boards.some((b) => Math.abs(b.x - x) + Math.abs(b.y - y) < 3)) continue;
      g[y][x] = "V"; g.boards.push({ x, y, set }); g.boardAt[x + "," + y] = set; return;
    }
  };
  const SIDE = [[2, 1], [-2, 1], [3, 1], [-3, 1], [2, 2], [-2, 2], [1, 2], [-1, 2], [4, 1], [-4, 1], [3, 2], [-3, 2]];
  const RING = []; for (let r = 0; r <= 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r) RING.push([dx, dy]);
  let homeDone = false;
  for (const b of BUILDINGS) {
    let set = { school: "school", hall: "hall" }[b.type] || b.type;
    if (b.type === "house" || b.type === "cottage") { if (homeDone) continue; set = "home"; homeDone = true; }
    if (VOCAB[set]) putBoard(b.door, b.r[3], set, SIDE);
  }
  for (const [set, x, y] of [["farm", 93, 29], ["site", 88, 51], ["pond", 63, 46], ["busstop", 50, 56], ["market", 12, 26], ["plaza", 33, 22], ["road", 25, 56]]) putBoard(x, y, set, RING);
  // Đèn dọc đường chính
  for (const r of g.roadLines.filter((r) => r.main)) for (let i = 0; i < r.pts.length - 1; i += 14) {
    const [ax, ay] = r.pts[i], [bx, by] = r.pts[i + 1], len = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / len, ny = (bx - ax) / len, side = (i / 14) % 2 ? 1 : -1;
    const lx = Math.floor(ax + nx * side * (r.w / 2 + .8)), ly = Math.floor(ay + ny * side * (r.w / 2 + .8));
    if (inside(lx, ly) && g[ly][lx] === ".") g[ly][lx] = "Y";
  }
  // Rừng viền tự nhiên + cây, bụi, hoa
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (g[y][x] !== ".") continue;
    const edge = Math.min(x, y, w - 1 - x, h - 1 - y), band = 1.5 + ((hash(x, y) % 100) / 100) * 2.2;
    const near = [-1, 0, 1].some((a) => [-1, 0, 1].some((c) => ["=", "P", "B", "D", "d", "M", "Y", "U", "C", "S", "Z", "A", "k", "V"].includes(g[y + a]?.[x + c])));
    const r = hash(x * 3, y * 7);
    if (edge < band && !near) g[y][x] = "T";
    else if (!near && r < 95) g[y][x] = "T"; else if (!near && r < 150) g[y][x] = "h"; else if (r > 870) g[y][x] = "f";
  }
  return g;
}

// ---------- Kiến trúc từng loại công trình ----------
const STYLES = {
  school: { wall: "#f3e6c8", roof: "#3d6db3", roofType: "gable", tex: "brick", win: "plain", door: "#6d4c2f", sign: "#2b4c7e" },
  hall: { wall: "#e9e4d8", roof: "#7b1f1f", roofType: "pediment", tex: "stone", win: "tall", door: "#4e342e", sign: "#7b1f1f" },
  bakery: { wall: "#f7d9b0", roof: "#a0522d", roofType: "gable", tex: "plaster", win: "bread", door: "#8b5a2b", awning: ["#e76f51", "#fff4e0"], sign: "#a0522d" },
  bookstore: { wall: "#5b3f7a", roof: "#33264d", roofType: "gable", tex: "wood", win: "books", door: "#2a1d3a", awning: ["#7e57c2", "#d1c4e9"], sign: "#33264d" },
  clothes: { wall: "#ffe4ec", roof: "#d6457a", roofType: "flat", tex: "plaster", win: "clothes", door: "#fff", glassDoor: true, awning: ["#ec407a", "#ffffff"], sign: "#d6457a" },
  pharmacy: { wall: "#f4fbf7", roof: "#2e9e6a", roofType: "flat", tex: "tile", win: "shop", door: "#cfeee0", glassDoor: true, sign: "#2e9e6a" },
  post: { wall: "#ffd9c2", roof: "#d84315", roofType: "gable", tex: "brick", win: "plain", door: "#bf360c", sign: "#d84315" },
  restaurant: { wall: "#8e2424", roof: "#2b2b2b", roofType: "pagoda", tex: "wood", win: "warm", door: "#3e1212", sign: "#1f1f1f" },
  bank: { wall: "#d5dde1", roof: "#607d8b", roofType: "pediment", tex: "stone", win: "tall", door: "#37474f", sign: "#37474f" },
  barber: { wall: "#e3f2fd", roof: "#1565c0", roofType: "flat", tex: "tile", win: "shop", door: "#bbdefb", glassDoor: true, awning: ["#1565c0", "#ffffff"], sign: "#c62828" },
  clinic: { wall: "#ffffff", roof: "#b0bec5", roofType: "flat", tex: "tile", win: "plain", door: "#e3f2fd", glassDoor: true, sign: "#c62828" },
  cafe: { wall: "#d7b899", roof: "#5d4037", roofType: "gable", tex: "wood", win: "warm", door: "#4e342e", awning: ["#2e7d32", "#f1f8e9"], sign: "#3e2723" },
  flower: { wall: "#e8f5e9", roof: "#43a047", roofType: "gable", tex: "plaster", win: "flowers", door: "#81c784", glassDoor: true, awning: ["#66bb6a", "#fce4ec"], sign: "#2e7d32" },
  toys: { wall: "#fff3c4", roof: "#ef5350", roofType: "stripes", tex: "plaster", win: "toys", door: "#ffca28", sign: "#1e88e5" },
  fire: { wall: "#c62828", roof: "#7f1414", roofType: "flat", tex: "brick", win: "plain", door: "#eeeeee", sign: "#b71c1c" },
  police: { wall: "#e3f2fd", roof: "#1a237e", roofType: "flat", tex: "tile", win: "plain", door: "#1a237e", sign: "#1a237e" },
  garage: { wall: "#b0bec5", roof: "#546e7a", roofType: "flat", tex: "tile", win: "shop", door: "#455a64", sign: "#ef6c00" },
  workshop: { wall: "#a1887f", roof: "#5d4037", roofType: "gable", tex: "wood", win: "plain", door: "#4e342e", sign: "#5d4037" },
  tailor: { wall: "#f8bbd0", roof: "#ad1457", roofType: "gable", tex: "plaster", win: "clothes", door: "#880e4f", awning: ["#ad1457", "#fce4ec"], sign: "#ad1457" },
  warehouse: { wall: "#8d6e63", roof: "#4e342e", roofType: "gable", tex: "wood", win: "plain", door: "#3e2723", sign: "#4e342e" },
  house: { wall: "#f6e7c8", roof: ["#5f8f3e", "#c0413a", "#3d6db3"], roofType: "gable", tex: "plaster", win: "home", door: "#8b5a2b" },
  cottage: { wall: "#efe0c0", roof: ["#c9a24a", "#b8913c", "#d4ad55"], roofType: "thatch", tex: "wood", win: "home", door: "#6d4c2f" },
};
const shade = (c, k) => "#" + [1, 3, 5].map((i) => Math.max(0, Math.min(255, parseInt(c.slice(i, i + 2), 16) + k)).toString(16).padStart(2, "0")).join("");
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

function drawRoof(s, X, Y, W, H, color) {
  const dark = shade(color, -28), light = shade(color, 28);
  switch (s.roofType) {
    case "gable": case "pediment": {
      ctx.fillStyle = color; ctx.fillRect(X - 5, Y, W + 10, H + 4);
      for (let yy = Y + 8, row = 0; yy < Y + H + 2; yy += 8, row++) { ctx.fillStyle = dark; ctx.fillRect(X - 5, yy, W + 10, 2); for (let xx = X - 5 + (row % 2) * 6; xx < X + W + 5; xx += 12) ctx.fillRect(xx, yy - 6, 1.5, 6); }
      ctx.fillStyle = light; ctx.fillRect(X - 5, Y, W + 10, 4);
      ctx.fillStyle = "#0000003a"; ctx.fillRect(X - 5, Y + H, W + 10, 5);
      ctx.fillStyle = "#00000022"; ctx.fillRect(X - 5, Y, 5, H + 4); ctx.fillRect(X + W, Y, 5, H + 4);
      if (s.roofType === "pediment") {
        const cx = X + W / 2, pw = Math.min(W * 0.7, 150);
        ctx.fillStyle = shade(s.wall, 10); ctx.beginPath(); ctx.moveTo(cx - pw / 2, Y + H + 4); ctx.lineTo(cx, Y + H - 26); ctx.lineTo(cx + pw / 2, Y + H + 4); ctx.fill();
        ctx.strokeStyle = shade(s.wall, -40); ctx.lineWidth = 2; ctx.stroke();
      }
      break;
    }
    case "flat": {
      ctx.fillStyle = shade(color, -10); ctx.fillRect(X - 3, Y + 4, W + 6, H);
      ctx.fillStyle = "#cfd2d6"; ctx.fillRect(X + 3, Y + 9, W - 6, H - 10);
      for (let i = 0; i < 40; i++) { ctx.fillStyle = "#00000014"; ctx.fillRect(X + 4 + ((i * 37) % (W - 8)), Y + 10 + ((i * 23) % (H - 12)), 2, 2); }
      ctx.fillStyle = color; ctx.fillRect(X - 3, Y + H - 4, W + 6, 8); ctx.fillStyle = light; ctx.fillRect(X - 3, Y + 4, W + 6, 4);
      ctx.fillStyle = "#90a4ae"; rr(X + W - 30, Y + 14, 18, 12, 2); ctx.fill(); ctx.fillStyle = "#607d8b"; ctx.fillRect(X + W - 27, Y + 17, 12, 2);
      break;
    }
    case "pagoda": {
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(X - 14, Y + H + 6); ctx.quadraticCurveTo(X - 2, Y + H - 2, X + 6, Y + 4); ctx.lineTo(X + W - 6, Y + 4); ctx.quadraticCurveTo(X + W + 2, Y + H - 2, X + W + 14, Y + H + 6); ctx.closePath(); ctx.fill();
      for (let yy = Y + 10; yy < Y + H; yy += 7) { ctx.strokeStyle = "#ffffff18"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X, yy); ctx.lineTo(X + W, yy); ctx.stroke(); }
      ctx.fillStyle = "#d4a017"; ctx.fillRect(X + 4, Y + 1, W - 8, 4); ctx.beginPath(); ctx.arc(X + 6, Y + 3, 4, 0, 7); ctx.arc(X + W - 6, Y + 3, 4, 0, 7); ctx.fill();
      ctx.fillStyle = "#0000004a"; ctx.fillRect(X - 4, Y + H + 2, W + 8, 5);
      break;
    }
    case "thatch": {
      ctx.fillStyle = color; rr(X - 8, Y - 2, W + 16, H + 10, 14); ctx.fill();
      ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
      for (let yy = Y + 4; yy < Y + H + 6; yy += 6) { ctx.beginPath(); for (let xx = X - 6; xx < X + W + 6; xx += 6) { ctx.moveTo(xx, yy); ctx.lineTo(xx + 2, yy + 5); } ctx.stroke(); }
      ctx.fillStyle = light; rr(X + 4, Y - 2, W - 8, 5, 3); ctx.fill();
      ctx.fillStyle = "#0000003a"; ctx.fillRect(X - 6, Y + H + 4, W + 12, 4);
      break;
    }
    case "stripes": {
      const cs = ["#ef5350", "#ffca28", "#42a5f5", "#66bb6a", "#ab47bc"];
      for (let i = 0, xx = X - 5; xx < X + W + 5; xx += 14, i++) { ctx.fillStyle = cs[i % cs.length]; ctx.fillRect(xx, Y, Math.min(14, X + W + 5 - xx), H + 4); }
      ctx.fillStyle = "#ffffff40"; ctx.fillRect(X - 5, Y, W + 10, 4); ctx.fillStyle = "#0000003a"; ctx.fillRect(X - 5, Y + H, W + 10, 5);
      break;
    }
  }
}
function wallTexture(s, X, Y, W, H) {
  const d = shade(s.wall, -18);
  ctx.fillStyle = d;
  if (s.tex === "brick") for (let yy = Y + 6, r = 0; yy < Y + H; yy += 7, r++) { ctx.fillRect(X, yy, W, 1); for (let xx = X + (r % 2) * 7; xx < X + W; xx += 14) ctx.fillRect(xx, yy - 6, 1, 6); }
  else if (s.tex === "wood") for (let xx = X + 6; xx < X + W; xx += 8) ctx.fillRect(xx, Y, 1, H);
  else if (s.tex === "stone") for (let yy = Y + 10, r = 0; yy < Y + H; yy += 11, r++) { ctx.fillRect(X, yy, W, 1.5); for (let xx = X + (r % 2) * 11; xx < X + W; xx += 22) ctx.fillRect(xx, yy - 10, 1.5, 10); }
  else if (s.tex === "tile") for (let yy = Y + 8; yy < Y + H; yy += 8) ctx.fillRect(X, yy, W, 1);
}
function drawWindow(kind, x, y, w, h, lit) {
  ctx.fillStyle = "#5d4037"; ctx.fillRect(x - 2, y - 2, w + 4, h + 5);
  const glass = lit ? "#ffe9a8" : "#a9dcf5"; ctx.fillStyle = glass; ctx.fillRect(x, y, w, h);
  const cx = x + w / 2;
  switch (kind) {
    case "bread": ctx.fillStyle = "#c68642"; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(x + 6 + i * (w - 12) / 2, y + h - 6, 5, 3.5, 0, 0, 7); ctx.fill(); } ctx.fillStyle = "#e0a96d"; ctx.beginPath(); ctx.ellipse(cx, y + h - 12, 7, 3, 0, 0, 7); ctx.fill(); break;
    case "books": for (let i = 0; i < w - 2; i += 4) { ctx.fillStyle = ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71", "#ecf0f1"][(i / 4) % 5]; ctx.fillRect(x + 1 + i, y + h / 2 - 2 + ((i * 7) % 4), 3, h / 2); } ctx.fillStyle = "#5d4037"; ctx.fillRect(x, y + h - 2, w, 2); break;
    case "clothes": [0.3, 0.7].forEach((f, i) => { const mx = x + w * f; ctx.fillStyle = "#555"; ctx.beginPath(); ctx.arc(mx, y + 5, 2.5, 0, 7); ctx.fill(); ctx.fillStyle = i ? "#ab47bc" : "#ec407a"; ctx.beginPath(); ctx.moveTo(mx - 5, y + 8); ctx.lineTo(mx + 5, y + 8); ctx.lineTo(mx + 7, y + h); ctx.lineTo(mx - 7, y + h); ctx.fill(); }); break;
    case "shop": for (let i = 0; i < 2; i++) { ctx.fillStyle = "#ffffffaa"; ctx.fillRect(x + 2, y + 5 + i * 8, w - 4, 1.5); for (let k = 0; k < 4; k++) { ctx.fillStyle = ["#ef5350", "#66bb6a", "#42a5f5", "#ffca28"][(k + i) % 4]; ctx.fillRect(x + 3 + k * (w - 6) / 4, y + 1 + i * 8, 3, 4); } } break;
    case "flowers": for (let k = 0; k < 5; k++) { ctx.fillStyle = ["#e91e63", "#ffeb3b", "#ffffff", "#ff7043", "#ba68c8"][k]; ctx.beginPath(); ctx.arc(x + 3 + k * (w - 6) / 4, y + h - 5 - (k % 2) * 3, 2.5, 0, 7); ctx.fill(); } break;
    case "toys": ctx.fillStyle = "#8d6e63"; ctx.beginPath(); ctx.arc(cx - 4, y + h - 6, 4, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(cx - 4, y + h - 12, 3, 0, 7); ctx.fill(); ctx.fillStyle = "#42a5f5"; ctx.fillRect(cx + 2, y + h - 8, 6, 6); ctx.fillStyle = "#ef5350"; ctx.beginPath(); ctx.arc(cx + 6, y + 6, 3, 0, 7); ctx.fill(); break;
    case "warm": ctx.fillStyle = lit ? "#ffcc80" : "#ffe0b2"; ctx.fillRect(x, y, w, h); ctx.fillStyle = "#b71c1c"; ctx.fillRect(x, y, w, 4); ctx.fillStyle = "#00000033"; ctx.fillRect(cx - 0.5, y, 1, h); break;
    case "tall": ctx.fillStyle = "#ffffff55"; ctx.fillRect(x + 2, y + 2, 3, h - 4); ctx.fillStyle = "#5d4037"; ctx.fillRect(x, y + h / 2, w, 1.5); break;
    default: ctx.fillStyle = "#5d4037"; ctx.fillRect(cx - 1, y, 2, h); ctx.fillRect(x, y + h / 2 - 1, w, 2); if (!lit) { ctx.fillStyle = "#ffffff80"; ctx.fillRect(x + 2, y + 2, 4, 3); }
  }
  if (kind === "home" || kind === "plain") { ctx.fillStyle = "#8d6e63"; ctx.fillRect(x - 3, y + h + 2, w + 6, 3); }
  if (kind === "home") { ctx.fillStyle = "#e57373"; ctx.fillRect(x - 1, y + h + 3, w + 2, 3); }
}
function drawAwning(X, y, W, cols) {
  const n = Math.max(4, Math.round(W / 12)), sw = W / n;
  for (let i = 0; i < n; i++) { ctx.fillStyle = cols[i % 2]; ctx.beginPath(); ctx.moveTo(X + i * sw, y); ctx.lineTo(X + (i + 1) * sw, y); ctx.lineTo(X + (i + 1) * sw + 2, y + 12); ctx.arc(X + i * sw + sw / 2 + 1, y + 12, sw / 2 + 1, 0, Math.PI); ctx.fill(); }
  ctx.fillStyle = "#00000025"; ctx.fillRect(X, y + 14, W, 3);
}
function drawSign(cx, y, text, bg) {
  ctx.font = "bold 10px Nunito, Segoe UI, sans-serif"; ctx.textAlign = "center";
  const w = ctx.measureText(text).width + 14;
  ctx.fillStyle = "#00000040"; rr(cx - w / 2 + 2, y + 2, w, 16, 4); ctx.fill();
  ctx.fillStyle = bg; rr(cx - w / 2, y, w, 16, 4); ctx.fill(); ctx.strokeStyle = "#ffffff70"; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.fillText(text, cx, y + 11.5);
}
function drawBuilding(b) {
  const s = STYLES[b.type], [x1, y1, x2, y2] = b.r, X = x1 * TS, Y = y1 * TS, W = (x2 - x1 + 1) * TS, H = (y2 - y1 + 1) * TS;
  const roofC = Array.isArray(s.roof) ? s.roof[b.v || 0] : s.roof, wallH = Math.min(78, H * 0.5), wy = Y + H - wallH, lit = darkness() > 0.15, dX = b.door * TS;
  ctx.fillStyle = "#00000030"; ctx.beginPath(); ctx.moveTo(X + W, Y + 10); ctx.lineTo(X + W + 14, Y + 22); ctx.lineTo(X + W + 14, Y + H + 8); ctx.lineTo(X + 10, Y + H + 8); ctx.lineTo(X, Y + H); ctx.fill();
  // Tường
  ctx.fillStyle = s.wall; ctx.fillRect(X, wy, W, wallH); wallTexture(s, X, wy, W, wallH);
  ctx.fillStyle = shade(s.wall, -45); ctx.fillRect(X, Y + H - 6, W, 6);
  ctx.fillStyle = "#0000001a"; ctx.fillRect(X, wy, 4, wallH); ctx.fillRect(X + W - 4, wy, 4, wallH);
  // Cột (ngân hàng / phòng thi)
  if (s.roofType === "pediment") for (let cx = X + 12; cx < X + W - 8; cx += 28) { if (Math.abs(cx - dX - 16) < 22) continue; ctx.fillStyle = "#fafafa"; ctx.fillRect(cx, wy + 4, 9, wallH - 10); ctx.fillStyle = "#00000022"; ctx.fillRect(cx + 6, wy + 4, 3, wallH - 10); ctx.fillStyle = "#e0e0e0"; ctx.fillRect(cx - 2, wy + 2, 13, 4); ctx.fillRect(cx - 2, Y + H - 9, 13, 4); }
  // Cửa sổ
  const ww = s.win === "tall" ? 12 : s.awning || s.win === "shop" ? 24 : 18, wh = s.win === "tall" ? 30 : 20, top = wy + (s.awning ? 22 : 14);
  if (s.roofType !== "pediment") for (let wx = X + 10; wx + ww < X + W - 8; wx += ww + 14) { if (wx + ww > dX - 6 && wx < dX + 38) continue; drawWindow(s.win, wx, top, ww, wh, lit); }
  else for (let wx = X + 23; wx + ww < X + W - 8; wx += 28) { if (Math.abs(wx - dX - 10) < 24) continue; drawWindow("tall", wx, wy + 14, 10, wallH - 26, lit); }
  // Cửa
  const dh = Math.min(40, wallH - 12);
  ctx.fillStyle = shade(s.door, -40); ctx.fillRect(dX + 3, Y + H - dh - 3, 26, dh + 3);
  ctx.fillStyle = s.door; ctx.fillRect(dX + 6, Y + H - dh, 20, dh);
  if (s.glassDoor) { ctx.fillStyle = lit ? "#ffe9a8" : "#b3e5fc"; ctx.fillRect(dX + 9, Y + H - dh + 3, 14, dh - 6); ctx.fillStyle = "#ffffff90"; ctx.fillRect(dX + 10, Y + H - dh + 4, 3, dh - 10); }
  else { ctx.fillStyle = "#00000030"; ctx.fillRect(dX + 9, Y + H - dh + 4, 6, dh - 8); ctx.fillRect(dX + 17, Y + H - dh + 4, 6, dh - 8); ctx.fillStyle = "#ffd93d"; ctx.beginPath(); ctx.arc(dX + 22, Y + H - dh / 2, 1.8, 0, 7); ctx.fill(); }
  ctx.fillStyle = "#9e9e9e"; ctx.fillRect(dX + 2, Y + H - 3, 28, 3);
  if (b.enter) { ctx.fillStyle = "#ffd93d"; ctx.font = "14px sans-serif"; ctx.textAlign = "center"; ctx.fillText("▼", dX + 16, Y + H + 14 + Math.sin(perf / 250) * 2); }
  if (s.awning) drawAwning(X + 4, wy + 2, W - 8, s.awning);
  // Mái
  drawRoof(s, X, Y, W, wy - Y, roofC);
  extras(b, s, X, Y, W, H, wy, dX, lit);
  if (b.name) drawSign(X + W / 2, wy - 16 + (s.roofType === "pediment" ? -14 : 0), b.name, s.sign);
}
function extras(b, s, X, Y, W, H, wy, dX, lit) {
  const t = perf / 1000;
  const emoji = (e, ex, ey, sz = 14) => { ctx.font = sz + "px sans-serif"; ctx.textAlign = "center"; ctx.fillText(e, ex, ey); };
  switch (b.type) {
    case "fire": case "garage": {
      const gx = b.type === "fire" ? X + 8 : X + W - 62, gw = 50, gh = Math.min(46, Y + H - wy - 8);
      ctx.fillStyle = "#eceff1"; ctx.fillRect(gx, Y + H - gh, gw, gh); ctx.fillStyle = "#b0bec5"; for (let k = Y + H - gh + 4; k < Y + H; k += 5) ctx.fillRect(gx, k, gw, 1.5);
      if (b.type === "fire") { const on = Math.sin(t * 6) > 0; ctx.fillStyle = on ? "#ff1744" : "#ffcdd2"; ctx.beginPath(); ctx.arc(X + W / 2, Y + 8, 6, 0, 7); ctx.fill(); emoji("🚒", X + W - 18, Y + H - 4, 16); }
      else { ctx.fillStyle = "#212121"; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(X + 14, Y + H - 6 - k * 7, 6, 0, 7); ctx.fill(); } emoji("🔧", X + 40, wy + 16); }
      break;
    }
    case "police": { const on = Math.sin(t * 8) > 0; ctx.fillStyle = on ? "#2962ff" : "#ff1744"; ctx.fillRect(X + W / 2 - 10, Y + 6, 9, 6); ctx.fillStyle = on ? "#ff1744" : "#2962ff"; ctx.fillRect(X + W / 2 + 1, Y + 6, 9, 6); emoji("⭐", X + 18, wy + 18); emoji("🚓", X + W - 18, Y + H - 4, 16); break; }
    case "workshop": for (let k = 0; k < 3; k++) { ctx.fillStyle = "#8d6e63"; ctx.beginPath(); ctx.ellipse(X + W - 16, Y + H - 5 - k * 7, 12, 3.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#d7ccc8"; ctx.beginPath(); ctx.arc(X + W - 27, Y + H - 5 - k * 7, 3, 0, 7); ctx.fill(); } emoji("🪚", X + 16, Y + H - 4); break;
    case "tailor": emoji("🧵", X + 14, Y + H - 4); emoji("✂️", X + W - 14, Y + H - 4); break;
    case "warehouse": emoji("📦", X + 12, Y + H - 2, 16); emoji("📦", X + 26, Y + H - 2, 16); emoji("📦", X + 19, Y + H - 16, 16); emoji("🛵", X + W - 16, Y + H - 2, 18); break;
    case "school": {
      const cx = X + W / 2; ctx.fillStyle = "#f3e6c8"; ctx.fillRect(cx - 14, Y - 26, 28, 30); ctx.fillStyle = "#3d6db3"; ctx.beginPath(); ctx.moveTo(cx - 19, Y - 24); ctx.lineTo(cx, Y - 44); ctx.lineTo(cx + 19, Y - 24); ctx.fill();
      ctx.fillStyle = "#5d4037"; ctx.fillRect(cx - 8, Y - 20, 16, 14); ctx.fillStyle = "#ffc107"; ctx.beginPath(); ctx.arc(cx, Y - 12 + Math.sin(t * 2) * 1, 5, Math.PI, 0); ctx.fill(); ctx.fillRect(cx - 5, Y - 12, 10, 2);
      ctx.fillStyle = "#555"; ctx.fillRect(X + W - 16, Y - 30, 2, 34); ctx.fillStyle = "#e53935"; ctx.beginPath(); ctx.moveTo(X + W - 14, Y - 30); ctx.quadraticCurveTo(X + W - 4, Y - 27 + Math.sin(t * 4) * 2, X + W + 4, Y - 26); ctx.lineTo(X + W - 14, Y - 20); ctx.fill();
      break;
    }
    case "hall": ctx.font = "16px sans-serif"; ctx.textAlign = "center"; ctx.fillText("🎓", X + W / 2, wy - 6); break;
    case "bank": ctx.fillStyle = "#c9a227"; ctx.font = "bold 16px Georgia, serif"; ctx.textAlign = "center"; ctx.fillText("$", X + W / 2, wy - 4); break;
    case "bakery": case "cafe": case "house": case "cottage": {
      if (b.type === "cottage" && (b.v || 0) === 1) break;
      const cx = X + W - 26, cy = Y + 4; ctx.fillStyle = "#8d6e63"; ctx.fillRect(cx, cy - 12, 12, 18); ctx.fillStyle = "#5d4037"; ctx.fillRect(cx - 2, cy - 14, 16, 4);
      if (b.type !== "house" || b.v !== 2) for (let i = 0; i < 4; i++) { const p = (t * 0.6 + i / 4) % 1; ctx.fillStyle = `rgba(230,230,230,${0.7 * (1 - p)})`; ctx.beginPath(); ctx.arc(cx + 6 + Math.sin(p * 6 + i) * 4, cy - 16 - p * 34, 4 + p * 6, 0, 7); ctx.fill(); }
      if (b.type === "cafe") { ctx.font = "13px sans-serif"; ctx.textAlign = "center"; ctx.fillText("☕", dX + 44, Y + H - 4); }
      if (b.type === "bakery") { ctx.font = "13px sans-serif"; ctx.textAlign = "center"; ctx.fillText("🥖", dX - 12, Y + H - 4); }
      break;
    }
    case "bookstore": ctx.fillStyle = "#5d4037"; ctx.fillRect(dX + 34, wy + 8, 14, 2); ctx.fillStyle = "#ffca28"; ctx.fillRect(dX + 38, wy + 10, 10, 13); ctx.fillStyle = "#e65100"; ctx.fillRect(dX + 38, wy + 10, 2, 13); break;
    case "clothes": ctx.font = "14px sans-serif"; ctx.textAlign = "center"; ctx.fillText("👗", X + 14, Y + H - 4); ctx.fillText("👜", X + W - 14, Y + H - 4); break;
    case "pharmacy": case "clinic": {
      const pulse = 0.75 + Math.sin(t * 3) * 0.25, cx = b.type === "pharmacy" ? X + W - 20 : X + 22, cy = wy + 18;
      ctx.fillStyle = b.type === "pharmacy" ? `rgba(46,158,106,${pulse})` : `rgba(198,40,40,${pulse})`; ctx.fillRect(cx - 4, cy - 11, 8, 22); ctx.fillRect(cx - 11, cy - 4, 22, 8);
      if (b.type === "clinic") { ctx.fillStyle = "#e0e0e0"; ctx.beginPath(); ctx.arc(X + W / 2, Y + (wy - Y) / 2 + 4, 16, 0, 7); ctx.fill(); ctx.fillStyle = "#c62828"; ctx.font = "bold 18px sans-serif"; ctx.textAlign = "center"; ctx.fillText("H", X + W / 2, Y + (wy - Y) / 2 + 10); }
      break;
    }
    case "post": { const mx = dX + 40; ctx.fillStyle = "#c62828"; rr(mx, Y + H - 22, 12, 22, 5); ctx.fill(); ctx.fillStyle = "#222"; ctx.fillRect(mx + 2, Y + H - 16, 8, 2); ctx.font = "12px sans-serif"; ctx.textAlign = "center"; ctx.fillText("✉️", X + 16, wy + 14); break; }
    case "restaurant": for (let lx = X + 10; lx < X + W - 4; lx += 26) { const sw = Math.sin(t * 2 + lx) * 2; ctx.strokeStyle = "#222"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx, wy); ctx.lineTo(lx + sw, wy + 8); ctx.stroke(); ctx.fillStyle = lit ? "#ff5252" : "#e53935"; ctx.beginPath(); ctx.ellipse(lx + sw, wy + 13, 5, 6, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#ffd54f"; ctx.fillRect(lx + sw - 2, wy + 7, 4, 2); ctx.fillRect(lx + sw - 2, wy + 18, 4, 2); } break;
    case "barber": { const px = dX - 14, py = Y + H - 34; ctx.fillStyle = "#eee"; rr(px, py, 9, 30, 4); ctx.fill(); ctx.save(); ctx.beginPath(); ctx.rect(px + 1, py + 3, 7, 24); ctx.clip(); for (let k = -4; k < 8; k++) { const o = ((t * 14) % 8) + k * 8; ctx.fillStyle = k % 2 ? "#c62828" : "#1565c0"; ctx.beginPath(); ctx.moveTo(px, py + o); ctx.lineTo(px + 9, py + o - 6); ctx.lineTo(px + 9, py + o - 2); ctx.lineTo(px, py + o + 4); ctx.fill(); } ctx.restore(); ctx.fillStyle = "#9e9e9e"; ctx.fillRect(px - 1, py - 2, 11, 3); ctx.fillRect(px - 1, py + 28, 11, 3); break; }
    case "flower": for (let px = X + 6; px < X + W - 6; px += 18) { if (Math.abs(px - dX - 10) < 20) continue; ctx.fillStyle = "#8d6e63"; ctx.fillRect(px, Y + H - 8, 12, 8); for (let k = 0; k < 3; k++) { ctx.fillStyle = ["#e91e63", "#ffeb3b", "#ab47bc"][(k + px) % 3]; ctx.beginPath(); ctx.arc(px + 2 + k * 4, Y + H - 11, 3, 0, 7); ctx.fill(); } } break;
    case "toys": [[X + 6, "#e53935"], [X + W - 6, "#1e88e5"], [X + W / 2 + 22, "#fdd835"]].forEach(([bx, c], i) => { const by = Y - 18 + Math.sin(t * 2 + i) * 4; ctx.strokeStyle = "#555"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx, Y + 6); ctx.lineTo(bx + Math.sin(t + i) * 3, by + 8); ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(bx + Math.sin(t + i) * 3, by, 7, 9, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#ffffff70"; ctx.beginPath(); ctx.arc(bx - 2 + Math.sin(t + i) * 3, by - 3, 2, 0, 7); ctx.fill(); }); break;
  }
}

// ---------- Vẽ sẵn mặt đất (cỏ, đường cong, quảng trường, hồ) ----------
function prerenderGround(m) {
  const g = m.grid, W = W_(g), H = H_(g), c = document.createElement("canvas"); c.width = W * TS; c.height = H * TS;
  const saved = ctx; ctx = c.getContext("2d");
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) drawGrass(x * TS, y * TS, hash(x, y));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === "f") drawTile("f", x, y);
  const stroke = (pts, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * TS, y * TS) : ctx.moveTo(x * TS, y * TS))); ctx.stroke(); };
  const lines = [...g.roadLines, ...g.paths.map((p) => ({ pts: p, w: 1.0 }))];
  lines.forEach((r) => stroke(r.pts, r.w * TS + 8, "#9c8152"));
  lines.forEach((r) => stroke(r.pts, r.w * TS + 2, "#c9a96e"));
  lines.forEach((r) => stroke(r.pts, r.w * TS - 4, r.main ? "#dcc08a" : "#e0c792"));
  g.roadLines.filter((r) => r.main).forEach((r) => { ctx.setLineDash([10, 14]); stroke(r.pts, 2, "#ffffff40"); ctx.setLineDash([]); });
  for (const r of lines) for (let i = 0; i < r.pts.length; i += 2) { const [x, y] = r.pts[i], hh = hash(i, (x * 10) | 0); ctx.fillStyle = hh % 2 ? "#b8975f" : "#efdcb0"; ctx.fillRect(x * TS + ((hh % 30) - 15) * r.w * 0.5, y * TS + (((hh >> 3) % 30) - 15) * r.w * 0.5, 3, 2); }
  // Đường lớn: vỉa hè, mặt nhựa, vạch kẻ, vạch qua đường
  {
    const W2 = W * TS;
    for (const yy of [HWY.walkTop, HWY.walkBot]) { ctx.fillStyle = "#cfc8b8"; ctx.fillRect(0, yy * TS, W2, TS); ctx.strokeStyle = "#b5ad9b"; ctx.lineWidth = 1; for (let x = 0; x < W2; x += 16) { ctx.beginPath(); ctx.moveTo(x + .5, yy * TS); ctx.lineTo(x + .5, yy * TS + TS); ctx.stroke(); } ctx.fillStyle = "#9e9686"; ctx.fillRect(0, yy === HWY.walkTop ? (yy + 1) * TS - 4 : yy * TS, W2, 4); }
    ctx.fillStyle = "#4a4f55"; ctx.fillRect(0, HWY.y0 * TS, W2, (HWY.y1 - HWY.y0 + 1) * TS);
    for (let i = 0; i < 900; i++) { ctx.fillStyle = i % 2 ? "#555b62" : "#40454b"; ctx.fillRect((i * 97) % W2, HWY.y0 * TS + ((i * 53) % ((HWY.y1 - HWY.y0 + 1) * TS)), 2, 2); }
    ctx.fillStyle = "#eeeeee"; ctx.fillRect(0, HWY.y0 * TS + 3, W2, 2); ctx.fillRect(0, (HWY.y1 + 1) * TS - 5, W2, 2);
    ctx.fillStyle = "#fdd835"; ctx.fillRect(0, 60 * TS - 4, W2, 2.5); ctx.fillRect(0, 60 * TS + 1.5, W2, 2.5);
    for (const cx of [39.5, 90]) for (let k = 0; k < 6; k++) { ctx.fillStyle = "#f5f5f5"; ctx.fillRect(cx * TS - 36 + k * 13, HWY.y0 * TS + 8, 8, (HWY.y1 - HWY.y0 + 1) * TS - 16); }
  }
  // Quảng trường tròn lát đá
  const px = PLAZA.x * TS, py = PLAZA.y * TS, pr = PLAZA.r * TS;
  ctx.fillStyle = "#9c8152"; ctx.beginPath(); ctx.arc(px, py, pr + 5, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(px, py, pr, 0, 7); ctx.clip();
  for (let r = 0; r < pr; r += 14) { ctx.strokeStyle = r % 28 ? "#cfc8b8" : "#c4bca9"; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(px, py, r + 7, 0, 7); ctx.stroke(); }
  ctx.strokeStyle = "#a89f8a"; ctx.lineWidth = 1; for (let r = 14; r < pr; r += 14) { ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.stroke(); const n = Math.round(r / 5); for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2 + r; ctx.beginPath(); ctx.moveTo(px + Math.cos(a) * r, py + Math.sin(a) * r); ctx.lineTo(px + Math.cos(a) * (r + 14), py + Math.sin(a) * (r + 14)); ctx.stroke(); } }
  ctx.restore();
  // Hồ nước
  for (const p of PONDS) if (p.rx) {
    ctx.fillStyle = "#c9b27a"; ctx.beginPath(); ctx.ellipse(p.x * TS, p.y * TS, p.rx * TS + 8, p.ry * TS + 8, 0, 0, 7); ctx.fill();
    const gr = ctx.createRadialGradient(p.x * TS, p.y * TS, 10, p.x * TS, p.y * TS, p.rx * TS); gr.addColorStop(0, "#2b7fc0"); gr.addColorStop(1, "#4fb0e8");
    ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(p.x * TS, p.y * TS, p.rx * TS, p.ry * TS, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = "#e3f4ff"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#3f8f3a"; [[-0.7, -0.5], [0.6, 0.6], [0.2, -0.7]].forEach(([a, b]) => { ctx.beginPath(); ctx.ellipse((p.x + a * p.rx) * TS, (p.y + b * p.ry) * TS, 9, 6, 0, 0.4, 6.0); ctx.lineTo((p.x + a * p.rx) * TS, (p.y + b * p.ry) * TS); ctx.fill(); });
  }
  ctx = saved; m.ground = c;
}

// ---------- Nhân vật ----------
function npc(name, x, y, look, opts) { return Object.assign({ name, x, y, px: x * TS, py: y * TS, tx: x, ty: y, t: 1, dir: "down", look, wander: false, radius: 5, topics: [], bubble: null, bubbleT: 0, nextBubble: 2 + Math.random() * 5, nextMove: 1 + Math.random() * 3, home: { x, y } }, opts); }
const SKINS = ["#ffe0bd", "#ffdbac", "#f1c27d", "#e0ac69", "#c68642", "#8d5524"];
const HAIRS = ["#1f1f1f", "#4a2c12", "#a0522d", "#f5d76e", "#bbbbbb", "#7c2d12", "#ff8c00", "#111827"];
const BODIES = ["#3b82f6", "#f472b6", "#a855f7", "#22c55e", "#eab308", "#14b8a6", "#f97316", "#64748b", "#e11d48", "#0ea5e9", "#84cc16", "#8b5cf6"];
const randLook = (small) => ({ body: pick(BODIES), hair: pick(HAIRS), skin: pick(SKINS), small });
const GENERAL = ["greet", "time", "weather", "family", "hobby", "work", "direction", "health"];
const NAMES = ["Emma", "Noah", "Olivia", "Liam", "Ava", "Lucas", "Mia", "Ethan", "Chloe", "Ryan", "Grace", "Daniel", "Zoe", "Henry", "Lucy", "Max", "Ruby", "Oscar", "Ivy", "Sam", "Nora", "Ben", "Alice", "Jake", "Leo", "Hana"];

function villageNpcs(g) {
  const list = [];
  for (const b of BUILDINGS) if (b.keeper) list.push(npc(b.keeper[0], b.door, b.r[3] + 1, randLook(), { wander: true, radius: 2, topics: b.keeper[1], job: b.job && JOBS[b.job] }));
  // Những người thợ làm việc ngoài trời
  const worker = (name, x, y, topic, radius, look) => list.push(npc(name, x, y, look || randLook(), { wander: true, radius, topics: [topic], job: JOBS[topic] }));
  worker("Farmer Hai 👨‍🌾", 94, 34, "farmer", 3, { body: "#689f38", hair: "#3e2723", skin: "#c68642" });
  worker("Farmer Lan 👩‍🌾", 96, 31, "farmer", 3, { body: "#f9a825", hair: "#1f1f1f", skin: "#e0ac69" });
  worker("Builder Tony 👷", 85, 51, "builder", 3, { body: "#ff6f00", hair: "#ffca28", skin: "#f1c27d" });
  worker("Builder Ana 👷", 81, 47, "builder", 2, { body: "#ff6f00", hair: "#4a2c12", skin: "#ffdbac" });
  worker("Fisherman Bao 🎣", 64, 48, "fisherman", 1, { body: "#0277bd", hair: "#9e9e9e", skin: "#c68642" });
  worker("Gardener Rose 🌻", 34, 32, "gardener", 4, { body: "#2e7d32", hair: "#f5d76e", skin: "#ffe0bd" });
  worker("Cleaner Minh 🧹", 30, 28, "cleaner", 12, { body: "#fb8c00", hair: "#1f1f1f", skin: "#e0ac69" });
  worker("Driver Phong 🚌", 54, 57, "busdriver", 1, { body: "#1565c0", hair: "#111", skin: "#f1c27d" });
  worker("Nurse Linh 💉", 66, 23, "nurse", 2, { body: "#f8f8f8", hair: "#1f1f1f", skin: "#ffdbac" });
  worker("Teacher Ken 📚", 12, 11, "teacher", 3, { body: "#5e35b1", hair: "#4a2c12", skin: "#f1c27d" });
  worker("Officer Nam 👮", 70, 27, "police", 10, { body: "#1a237e", hair: "#111", skin: "#e0ac69" });
  STALLS.forEach(([x, y, t]) => list.push(npc(t === "fruit" ? pick(["Mrs. Rose", "Uncle Ho", "Auntie Mai", "Mr. Fox"]) + " 🍎" : pick(["Mr. Kim", "Mrs. Lan", "Bob", "Nina"]) + " 🛒", x, y + 1, randLook(), { wander: true, radius: 1, topics: [t] })));
  // Nhân vật kỳ lạ: mỗi người chỉ nói một thì
  for (const t of TENSE_NPCS) {
    let p = null;
    for (let r = 0; r < 8 && !p; r++) for (let dy = -r; dy <= r && !p; dy++) for (let dx = -r; dx <= r && !p; dx++) {
      const x = t.x + dx, y = t.y + dy;
      if ((g[y]?.[x] === "." || g[y]?.[x] === "=" || g[y]?.[x] === "P") && !list.some((n) => n.x === x && n.y === y)) p = [x, y];
    }
    if (p) list.push(npc(t.name, p[0], p[1], t.look, { wander: true, radius: 3, topics: ["tense_" + t.tense], tense: t, star: true }));
  }
  list.push(npc("Coach Mia 🎤", 37, 27, { body: "#ef4444", hair: "#ff8c00", skin: "#ffe0bd" }, { role: "speaking", star: true }));
  list.push(npc("Tom", 43, 31, { body: "#3b82f6", hair: "#4a2c12", skin: "#f1c27d" }, { wander: true, topics: ["greet", "time"] }));
  list.push(npc("Mr. Brown", 38, 12, { body: "#78350f", hair: "#bbb", skin: "#e0ac69" }, { wander: true, radius: 10, topics: ["direction", "weather"] }));
  list.push(npc("Kevin", 25, 36, { body: "#22c55e", hair: "#a0522d", skin: "#f1c27d", small: true }, { wander: true, radius: 8, topics: ["greet", "hobby", "weather"] }));
  const roads = []; for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) if (g[y][x] === "=" || g[y][x] === "P") roads.push([x, y]);
  NAMES.forEach((name) => {
    let p; do p = pick(roads); while (list.some((n) => Math.abs(n.x - p[0]) + Math.abs(n.y - p[1]) < 3));
    const tp = [pick(GENERAL), pick(GENERAL)].filter((v, i, a) => a.indexOf(v) === i);
    list.push(npc(name, p[0], p[1], randLook(rnd() < 0.25), { wander: true, radius: 7, topics: tp, roadOnly: true }));
  });
  return list;
}

// ================== XE CỘ TRÊN ĐƯỜNG LỚN ==================
const BUS_STOP_X = BUS_STOP[0] * TS + 16;
function makeVehicles() {
  const W = VW_ * TS, list = [];
  const add = (kind, dir, x, speed, color) => list.push({ kind, dir, x, speed, cur: speed, color, len: { bus: 124, truck: 96, car: 56, moto: 30 }[kind], laneY: dir < 0 ? HWY.laneW : HWY.laneE, stop: 0, cool: 0, honk: 0 });
  add("bus", -1, W * 0.75, 70, "#fbc02d");
  add("bus", 1, W * 0.2, 70, "#43a047");
  [["#e53935", -1, 0.1], ["#1e88e5", -1, 0.4], ["#ffffff", -1, 0.92], ["#8e24aa", 1, 0.5], ["#ff7043", 1, 0.7], ["#263238", 1, 0.95]].forEach(([c, d, f]) => add("car", d, W * f, 95 + Math.random() * 45, c));
  [[-1, 0.28, "#d81b60"], [1, 0.35, "#00897b"], [1, 0.82, "#3949ab"], [-1, 0.6, "#f4511e"]].forEach(([d, f, c]) => add("moto", d, W * f, 115 + Math.random() * 30, c));
  add("truck", 1, W * 0.05, 65, "#6d4c41");
  return list;
}
function updateVehicles(dt) {
  const vs = map().vehicles, W = W_(map().grid) * TS;
  const pcx = player.px + 16, prow = Math.round(player.py / TS);
  for (const v of vs) {
    v.honk = Math.max(0, v.honk - dt); v.cool = Math.max(0, v.cool - dt);
    if (v.stop > 0) { v.stop -= dt; v.cur = 0; continue; }
    let target = v.speed;
    // Giữ khoảng cách với xe phía trước cùng làn
    for (const o of vs) {
      if (o === v || o.dir !== v.dir) continue;
      const ahead = (o.x - v.x) * v.dir; if (ahead <= 0) continue; // chỉ xét xe phía trước
      const gap = ahead - (o.len + v.len) / 2;
      if (gap < 30) target = 0; else if (gap < 110) target = Math.min(target, o.cur);
    }
    // Dừng khi người chơi đi ngang trước đầu xe
    const inLane = v.dir < 0 ? prow >= HWY.y0 && prow <= HWY.y0 + 1 : prow >= HWY.y1 - 1 && prow <= HWY.y1;
    const rel = (pcx - v.x) * v.dir;
    if (inLane && rel > -v.len / 2 && rel < v.len / 2 + 70) { target = 0; if (v.honk <= 0 && v.cur > 20) v.honk = 1.6; }
    v.cur += (target - v.cur) * Math.min(1, dt * (target < v.cur ? 6 : 1.5));
    const before = v.x;
    v.x += v.dir * v.cur * dt;
    // Xe buýt dừng ở trạm
    if (v.kind === "bus" && v.cool <= 0 && (before - BUS_STOP_X) * (v.x - BUS_STOP_X) <= 0) { v.stop = 5; v.cool = 12; v.cur = 0; v.x = BUS_STOP_X; }
    // Ra khỏi map thì quay lại từ đầu bên kia, đợi nếu chỗ xuất hiện đang có xe
    if ((v.dir > 0 && v.x > W + 160) || (v.dir < 0 && v.x < -160)) {
      const entry = v.dir > 0 ? -160 : W + 160;
      if (!vs.some((o) => o !== v && o.dir === v.dir && Math.abs(o.x - entry) < (o.len + v.len) / 2 + 60)) v.x = entry;
      else v.x -= v.dir * v.cur * dt;
    }
  }
}
function drawVehicle(v) {
  const night = darkness() > 0.15, t = perf / 1000;
  ctx.save(); ctx.translate(v.x, v.laneY); ctx.scale(v.dir, 1);
  ctx.fillStyle = "#00000040"; ctx.beginPath(); ctx.ellipse(0, 6, v.len / 2 + 4, 6, 0, 0, 7); ctx.fill();
  const wheel = (x, r) => { ctx.fillStyle = "#1b1b1b"; ctx.beginPath(); ctx.arc(x, 2, r, 0, 7); ctx.fill(); ctx.fillStyle = "#9e9e9e"; ctx.beginPath(); ctx.arc(x, 2, r * 0.45, 0, 7); ctx.fill(); ctx.strokeStyle = "#616161"; ctx.lineWidth = 1; const a = (v.x / r) * (v.dir); ctx.beginPath(); ctx.moveTo(x, 2); ctx.lineTo(x + Math.cos(a) * r * 0.45, 2 + Math.sin(a) * r * 0.45); ctx.stroke(); };
  const lights = (fx, fy, bx, by) => { ctx.fillStyle = night ? "#fffde7" : "#fff59d"; ctx.fillRect(fx, fy, 4, 5); ctx.fillStyle = v.cur < 10 || night ? "#ff1744" : "#c62828"; ctx.fillRect(bx, by, 3, 5); };
  if (v.kind === "car") {
    ctx.fillStyle = v.color; rr(-28, -16, 56, 17, 6); ctx.fill();
    ctx.fillStyle = shade(v.color, 25); rr(-15, -29, 30, 15, 7); ctx.fill();
    ctx.fillStyle = night ? "#455a64" : "#90caf9"; rr(-12, -26, 11, 10, 3); ctx.fill(); rr(1, -26, 11, 10, 3); ctx.fill();
    ctx.fillStyle = "#00000025"; ctx.fillRect(-28, -6, 56, 3);
    lights(24, -12, -28, -12); wheel(-16, 6); wheel(16, 6);
  } else if (v.kind === "bus") {
    ctx.fillStyle = v.color; rr(-62, -40, 124, 40, 7); ctx.fill();
    ctx.fillStyle = shade(v.color, -35); ctx.fillRect(-62, -12, 124, 5);
    ctx.fillStyle = night ? "#ffe082" : "#b3e5fc"; for (let k = 0; k < 6; k++) { rr(-56 + k * 17, -34, 13, 14, 2); ctx.fill(); }
    ctx.fillStyle = night ? "#ffe082" : "#b3e5fc"; rr(48, -34, 12, 18, 3); ctx.fill();
    const open = v.stop > 0; ctx.fillStyle = open ? "#263238" : shade(v.color, -20); ctx.fillRect(34, -32, 11, 30); if (!open) { ctx.fillStyle = "#b3e5fc"; ctx.fillRect(35, -30, 9, 12); }
    ctx.fillStyle = "#212121"; rr(-20, -47, 50, 9, 2); ctx.fill(); ctx.fillStyle = "#ffab00"; ctx.font = "bold 7px sans-serif"; ctx.textAlign = "center";
    ctx.save(); ctx.scale(v.dir, 1); ctx.fillText(v.dir < 0 ? "CITY ◀" : "▶ VILLAGE", 5 * v.dir, -40.5); ctx.restore();
    lights(58, -10, -62, -10); wheel(-40, 8); wheel(40, 8);
  } else if (v.kind === "truck") {
    ctx.fillStyle = v.color; rr(-48, -38, 64, 36, 3); ctx.fill(); ctx.fillStyle = shade(v.color, 20); ctx.fillRect(-46, -36, 60, 3);
    ctx.fillStyle = "#ef6c00"; rr(16, -28, 30, 26, 5); ctx.fill(); ctx.fillStyle = night ? "#455a64" : "#90caf9"; rr(30, -25, 12, 11, 2); ctx.fill();
    ctx.save(); ctx.scale(v.dir, 1); ctx.fillStyle = "#fff"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center"; ctx.fillText("📦 DELIVERY", -16 * v.dir, -17); ctx.restore();
    lights(44, -12, -48, -14); wheel(-32, 7); wheel(-14, 7); wheel(32, 7);
  } else {
    // Xe máy + người lái
    wheel(-11, 6); wheel(12, 6);
    ctx.fillStyle = v.color; rr(-12, -10, 24, 8, 3); ctx.fill(); ctx.fillStyle = "#37474f"; ctx.fillRect(9, -16, 3, 9);
    ctx.fillStyle = "#3e2723"; ctx.fillRect(-4, -24, 8, 14);
    ctx.fillStyle = "#ffdbac"; ctx.beginPath(); ctx.arc(1, -28, 5, 0, 7); ctx.fill();
    ctx.fillStyle = v.color; ctx.beginPath(); ctx.arc(1, -29, 5.5, Math.PI, 0); ctx.fill();
    lights(13, -12, -14, -10);
  }
  ctx.restore();
  if (v.honk > 0) { ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#fff"; const w = 44; ctx.beginPath(); ctx.roundRect(v.x - w / 2, v.laneY - 64, w, 16, 8); ctx.fill(); ctx.fillStyle = "#d32f2f"; ctx.fillText("Beep! 📯", v.x, v.laneY - 52); }
  if (v.kind === "bus" && v.stop > 0) { ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#000a"; ctx.beginPath(); ctx.roundRect(v.x - 62, v.laneY - 70, 124, 17, 8); ctx.fill(); ctx.fillStyle = "#ffd93d"; ctx.fillText("🚏 Bus stop! " + Math.ceil(v.stop) + "s", v.x, v.laneY - 58); }
}

const VILLAGE_GRID = buildVillage();
const MAPS = {
  village: {
    name: "🏡 Village", grid: VILLAGE_GRID, outdoor: true, fountain: { x: 39, y: 28 }, buildings: BUILDINGS,
    doors: BUILDINGS.filter((b) => b.enter).map((b) => ({ x: b.door, y: b.r[3], to: b.enter, sx: 15, sy: 18 })),
    labels: [{ x: 40, y: 22.6, t: "⛲ VILLAGE SQUARE" }, { x: 7.5, y: 31.4, t: "🍎 MARKET" }, { x: 95, y: 29.4, t: "🌾 FARM" }, { x: 85, y: 44.2, t: "🏗️ BUILDING SITE" }, { x: 90, y: 1.6, t: "🛠️ WORK DISTRICT" }, { x: 71, y: 45, t: "🎣 FISHING POND" }, { x: 52.5, y: 54.4, t: "🚏 BUS STOP" }, { x: 20, y: 56.5, t: "🛣️ VILLAGE ROAD" }],
    npcs: villageNpcs(VILLAGE_GRID),
  },
  study: {
    name: "📚 Study Room", grid: buildRoom("study"),
    doors: [{ x: 15, y: 19, to: "village", sx: 9, sy: 11 }],
    labels: [{ x: 15.5, y: 1.1, t: "YOUR ROADMAP" }],
    objects: [{ x: 2, y: 2, w: 5, action: "notebook", label: "📒 Sổ tay" }, { x: 23, y: 2, w: 5, action: "notebook", label: "📒 Sổ tay" }],
    npcs: [npc("Ms. Linh (Teacher)", 15, 4, { body: "#0ea5e9", hair: "#1f1f1f", skin: "#ffdbac" }, { role: "teacher", star: true })],
  },
  exam: {
    name: "📝 Exam Hall", grid: buildRoom("exam"),
    doors: [{ x: 15, y: 19, to: "village", sx: 68, sy: 10 }],
    labels: [{ x: 15.5, y: 1.1, t: "CEFR EXAMS" }, { x: 5.5, y: 4.2, t: "A1" }, { x: 11.5, y: 4.2, t: "A2" }, { x: 18.5, y: 4.2, t: "B1" }, { x: 24.5, y: 4.2, t: "B2" }],
    npcs: [
      npc("Examiner A1", 5, 5, { body: "#16a34a", hair: "#333", skin: "#f1c27d" }, { role: "exam", level: "A1" }),
      npc("Examiner A2", 11, 5, { body: "#0891b2", hair: "#7c4a1e", skin: "#ffdbac" }, { role: "exam", level: "A2" }),
      npc("Examiner B1", 18, 5, { body: "#9333ea", hair: "#111", skin: "#e0ac69" }, { role: "exam", level: "B1" }),
      npc("Examiner B2", 24, 5, { body: "#dc2626", hair: "#ccc", skin: "#c68642" }, { role: "exam", level: "B2" }),
    ],
  },
};

MAPS.village.vehicles = makeVehicles();
for (const m of Object.values(MAPS)) {
  const spots = [...m.npcs.map((n) => [n.x, n.y]), ...Object.values(MAPS).flatMap((o) => o.doors.filter((d) => MAPS[d.to] === m).map((d) => [d.sx, d.sy]))];
  for (const [x, y] of spots) if (!WALK.has(m.grid[y][x])) m.grid[y][x] = m.outdoor ? "." : "F";
}
const player = { x: 40, y: 32, px: 40 * TS, py: 32 * TS, tx: 40, ty: 32, t: 1, dir: "down", look: { body: "#f59e0b", hair: "#222", skin: "#f1c27d" }, name: "You" };
let mapId = "village";
const map = () => MAPS[mapId];
let busy = false; // đang mở hội thoại / bảng

function blocked(x, y, self) {
  const g = map().grid; if (x < 0 || y < 0 || x >= W_(g) || y >= H_(g)) return true;
  if (!WALK.has(map().grid[y][x])) return true;
  if (self !== player && (player.tx === x && player.ty === y)) return true;
  return map().npcs.some((n) => n !== self && ((n.tx === x && n.ty === y) || (n.x === x && n.y === y)));
}
function startMove(e, dx, dy) {
  e.dir = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
  const nx = e.x + dx, ny = e.y + dy;
  if (blocked(nx, ny, e)) return false;
  if (e !== player && map().grid[ny][nx] === "D") return false;
  if (e.roadOnly && !["=", "P"].includes(map().grid[ny][nx])) return false;
  e.tx = nx; e.ty = ny; e.t = 0; return true;
}
function stepEntity(e, dt, speed) {
  if (e.t >= 1) return false;
  e.t = Math.min(1, e.t + dt / speed);
  e.px = (e.x + (e.tx - e.x) * e.t) * TS; e.py = (e.y + (e.ty - e.y) * e.t) * TS;
  if (e.t >= 1) { e.x = e.tx; e.y = e.ty; return true; }
  return false;
}
function goMap(id, sx, sy) {
  mapId = id; Object.assign(player, { x: sx, y: sy, tx: sx, ty: sy, px: sx * TS, py: sy * TS, t: 1, dir: id === "village" ? "down" : "up" });
  $("hud-place").textContent = map().name; snapCamera();
  toast(`Bạn đã vào ${map().name}`);
}

// ---------- Input ----------
const keys = {};
const KEYMAP = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeAll(); return; }
  if (busy) return;
  if (KEYMAP[e.key]) { keys[KEYMAP[e.key]] = true; e.preventDefault(); }
  if (e.key === "e" || e.key === "E" || e.key === " " || e.key === "Enter") { e.preventDefault(); interact(); }
});
addEventListener("keyup", (e) => { if (KEYMAP[e.key]) keys[KEYMAP[e.key]] = false; });
document.querySelectorAll("#pad button").forEach((b) => {
  const k = b.dataset.k;
  const on = (ev) => { ev.preventDefault(); if (busy) return; if (k === "act") interact(); else keys[k] = true; };
  const off = () => { if (k !== "act") keys[k] = false; };
  b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off);
});

function interact() {
  const fx = player.x + (player.dir === "left" ? -1 : player.dir === "right" ? 1 : 0);
  const fy = player.y + (player.dir === "up" ? -1 : player.dir === "down" ? 1 : 0);
  const boardAt = map().grid.boardAt || {};
  if (boardAt[fx + "," + fy]) return openVocabBoard(boardAt[fx + "," + fy]);
  let best = null, bd = 99;
  for (const n of map().npcs) {
    const dist = Math.hypot(n.x - player.x, n.y - player.y) - (n.x === fx && n.y === fy ? 0.5 : 0);
    if (dist < bd) { bd = dist; best = n; }
  }
  if (best && bd <= 2.3) return talkTo(best);
  const nearBoard = (map().grid.boards || []).find((b) => Math.abs(b.x - player.x) <= 1 && Math.abs(b.y - player.y) <= 1);
  if (nearBoard) return openVocabBoard(nearBoard.set);
  for (const o of map().objects || []) if (player.x >= o.x - 1 && player.x <= o.x + o.w && Math.abs(player.y - o.y) <= 1.5) return openNotebook();
  toast("Không có ai ở gần. Hãy lại gần NPC rồi bấm E.");
}
function closeAll() { document.onkeydown = null; map().npcs.forEach((n) => (n.talking = false)); $("dialog").classList.add("hidden"); $("modal").classList.add("hidden"); busy = false; for (const k in keys) keys[k] = false; if (window.speechSynthesis) speechSynthesis.cancel(); stopRec(); }

// ---------- Hội thoại NPC (Spaced Repetition) ----------
const INTERVALS = [0.5, 3, 15, 60, 360, 1440, 4320]; // phút
function pickDialogue(topics, exclude) {
  const now = Date.now();
  const pool = DIALOGUES.filter((x) => topics.includes(x.topic) && !exclude.includes(x.id));
  const scored = pool.map((x) => { const s = save.srs[x.id]; return { x, due: s ? s.due : now - 1, box: s ? s.box : -1 }; });
  scored.sort((a, b) => (a.due <= now) === (b.due <= now) ? a.box - b.box || a.due - b.due : a.due <= now ? -1 : 1);
  const top = scored.slice(0, 3);
  return top[(Math.random() * top.length) | 0]?.x || pool[0];
}
function grade(id, ok) {
  const s = save.srs[id] || { box: 0, due: 0, seen: 0, right: 0 };
  s.seen++; if (ok) { s.right++; s.box = Math.min(s.box + 1, INTERVALS.length - 1); } else s.box = 0;
  s.due = Date.now() + INTERVALS[s.box] * 60000; save.srs[id] = s; persist();
}

function talkTo(n) {
  n.dir = player.x < n.x ? "left" : player.x > n.x ? "right" : player.y < n.y ? "up" : "down";
  if (n.role === "teacher") return openRoadmap();
  if (n.role === "exam") return openExamIntro(n.level);
  if (n.role === "speaking") return openSpeaking();
  busy = true; n.talking = true;
  runChat(n, [], 0);
}
function runChat(n, used, round) {
  const dlg = pickDialogue(n.topics, used); used.push(dlg.id);
  const box = $("dialog"); box.classList.remove("hidden");
  const opts = shuffle([{ t: dlg.ok, ok: true, vi: dlg.okVi }, ...dlg.wrong.map((t) => ({ t, ok: false }))]);
  const s = save.srs[dlg.id];
  box.innerHTML = `
    <div class="who">${esc(n.name)} ${s ? `<small style="opacity:.6">· đã gặp ${s.seen} lần</small>` : `<small style="color:#2f9e44">· câu mới!</small>`}</div>
    <div class="line">"${esc(dlg.en)}" <button class="small" id="b-say">🔊</button> <button class="small" id="b-vi">Dịch</button></div>
    <div class="vi hidden" id="vi">${esc(dlg.vi)}</div>
    ${n.tense ? `<div style="background:#ede7f6;border-radius:10px;padding:6px 10px;margin:6px 0;font-size:13px">📐 <b>Tôi chỉ nói thì ${esc(n.tense.info.vi)}!</b> Hãy trả lời bằng đúng thì này.
      <details><summary style="cursor:pointer">Xem công thức</summary><b>${esc(n.tense.info.formula)}</b><br>Dùng khi: ${esc(n.tense.info.use)}<br>Dấu hiệu: <i>${esc(n.tense.info.signal)}</i></details></div>` : ""}
    <div class="opts">${opts.map((o, i) => `<button data-i="${i}">${i + 1}. ${esc(o.t)}</button>`).join("")}</div>
    <div class="row"><button class="small" id="b-ai">💬 Chat tự do (AI)</button><button class="small" id="b-bye">Tạm biệt (Esc)</button></div>`;
  $("b-ai").onclick = () => openAiChat(n);
  speak(dlg.en);
  $("b-say").onclick = () => speak(dlg.en);
  $("b-vi").onclick = () => $("vi").classList.toggle("hidden");
  $("b-bye").onclick = () => { n.talking = false; closeAll(); };
  const btns = box.querySelectorAll(".opts button");
  const choose = (i) => {
    const o = opts[i]; grade(dlg.id, o.ok);
    btns.forEach((b, j) => { b.disabled = true; if (opts[j].ok) b.classList.add("ok"); else if (j === i) b.classList.add("bad"); });
    if (o.ok) { addXp(10); speak(dlg.reply); } else speak(dlg.ok);
    const next = document.createElement("div");
    next.innerHTML = `
      <div class="line" style="margin-top:10px">${o.ok ? "✅" : "❌ Câu đúng: <b>" + esc(dlg.ok) + "</b><br>"} ${esc(n.name.split(" ")[0])}: "${esc(o.ok ? dlg.reply : "No worries, try again next time!")}"</div>
      <div class="vi">${esc(dlg.ok)} = ${esc(dlg.okVi)}</div>
      <div class="row">${round < 2 ? '<button id="b-next">Nói tiếp ▶ (Enter)</button>' : ""}<button id="b-end">Tạm biệt 👋</button></div>`;
    box.appendChild(next);
    document.onkeydown = (e) => { if (e.key === "Enter" && $("b-next")) { e.stopPropagation(); $("b-next").click(); } };
    if ($("b-next")) $("b-next").onclick = () => { document.onkeydown = null; runChat(n, used, round + 1); };
    $("b-end").onclick = () => { document.onkeydown = null; n.talking = false; speak("Bye! See you!"); closeAll(); };
  };
  btns.forEach((b) => (b.onclick = () => choose(+b.dataset.i)));
  document.onkeydown = (e) => { const k = +e.key; if (k >= 1 && k <= opts.length && !btns[0].disabled) choose(k - 1); };
}

// ---------- Modal tiện ích ----------
function modal(html) { busy = true; $("modal").classList.remove("hidden"); $("modal-box").innerHTML = `<button class="close small" onclick="closeAll()">✖ Đóng</button>` + html; }
$("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeAll(); });

// ---------- PHÒNG HỌC: Lộ trình ----------
const allLessons = ROADMAP.flatMap((p) => p.lessons);
function lessonUnlocked(id) { const i = allLessons.findIndex((l) => l.id === id); return i === 0 || allLessons[i]?.custom || save.lessons[allLessons[i - 1].id]; }
function openRoadmap() {
  speak("Welcome to class! Let's study together.");
  const done = allLessons.filter((l) => save.lessons[l.id]).length;
  const pct = Math.round((done / allLessons.length) * 100);
  const nextL = allLessons.find((l) => !save.lessons[l.id]);
  let html = `<h2>📚 Lộ trình học của bạn</h2>
    <p>Lộ trình dành cho người <b>mất gốc</b>: đi từ phát âm, từ vựng cơ bản → A1 → A2 → B1 → B2 (~30 tuần). Mỗi ngày: <b>1 bài học</b> + <b>nói chuyện với 5 NPC</b> trong làng + <b>5 phút luyện nói</b> với Coach Mia.</p>
    <div>Hoàn thành: <b>${done}/${allLessons.length}</b> bài (${pct}%)</div><div class="bar"><div style="width:${pct}%"></div></div>
    <div class="row">${nextL ? `<button onclick="openLesson('${nextL.id}')">▶ Học tiếp: ${esc(nextL.title)}</button>` : "<b>🎉 Bạn đã hoàn thành toàn bộ lộ trình!</b>"}<button onclick="openExercises()">🏋️ Luyện tập</button><button onclick="openEditor()">✏️ Soạn bài</button></div>`;
  ROADMAP.forEach((p) => {
    const pd = p.lessons.filter((l) => save.lessons[l.id]).length;
    html += `<h3>${esc(p.phase)} <small style="color:#999">· ${p.time} · ${pd}/${p.lessons.length}</small></h3>`;
    p.lessons.forEach((l) => {
      const ok = save.lessons[l.id], un = lessonUnlocked(l.id);
      html += `<div class="lesson ${ok ? "done" : ""} ${un ? "" : "locked"}"><span>${ok ? "✅" : un ? "📖" : "🔒"} ${l.id.slice(1)}. ${esc(l.title)} ${ok ? `<small>(${ok}%)</small>` : ""}</span>
        ${un ? `<button class="small" onclick="openLesson('${l.id}')">${ok ? "Ôn lại" : "Học"}</button>` : ""}</div>`;
    });
  });
  html += `<h3>📈 Thống kê</h3><p>Câu giao tiếp đã gặp: <b>${Object.keys(save.srs).length}</b>/${DIALOGUES.length} · Câu luyện nói đạt: <b>${save.speak}</b> · Bài thi: ${Object.entries(save.exams).map(([k, v]) => `${k}: ${v}%`).join(", ") || "chưa thi"}</p>`;
  modal(html);
}
function openLesson(id) {
  const l = allLessons.find((x) => x.id === id);
  modal(`<h2>📖 ${esc(l.title)}</h2><p>Bấm vào từng thẻ để nghe phát âm. Đọc to theo 3 lần, sau đó làm bài kiểm tra nhỏ (đạt ≥ 75% để mở bài tiếp theo).</p>
    <div class="words">${l.words.map((w) => `<div class="word" onclick="speak('${w[0].replace(/'/g, "\\'")}', .8)"><b>🔊 ${esc(w[0])}</b>${esc(w[1])}</div>`).join("")}</div>
    <div class="row"><button onclick="lessonQuiz('${id}')">📝 Làm bài kiểm tra</button><button onclick="openRoadmap()">◀ Lộ trình</button></div>`);
}
function lessonQuiz(id) {
  const l = allLessons.find((x) => x.id === id);
  const qs = shuffle(l.words).map((w) => {
    const rev = Math.random() < 0.5; // en->vi hoặc vi->en
    const wrong = shuffle(l.words.filter((x) => x !== w)).slice(0, 3);
    const opts = shuffle([w, ...wrong]);
    return { q: rev ? `"${w[1]}" trong tiếng Anh là?` : `"${w[0]}" nghĩa là?`, opts: opts.map((o) => (rev ? o[0] : o[1])), a: opts.indexOf(w), say: w[0] };
  });
  runQuiz(qs, `📝 Kiểm tra: ${l.title}`, (pct) => {
    if (pct >= 75) { if (!save.lessons[id] || save.lessons[id] < pct) save.lessons[id] = pct; addXp(30); }
    persist();
    return pct >= 75 ? "🎉 Đạt! Bài tiếp theo đã mở khóa." : "Chưa đạt 75%. Ôn lại từ vựng rồi thử lại nhé!";
  }, () => openRoadmap());
}

// ---------- Engine làm bài trắc nghiệm (dùng chung) ----------
function runQuiz(qs, title, onDone, back) {
  let i = 0, right = 0;
  const show = () => {
    if (i >= qs.length) {
      const pct = Math.round((right / qs.length) * 100);
      const msg = onDone(pct);
      modal(`<h2>${esc(title)}</h2><div class="score">${pct}%</div><p style="text-align:center">Đúng ${right}/${qs.length}. ${msg}</p><div class="row" style="justify-content:center"><button id="q-back">◀ Quay lại</button></div>`);
      $("q-back").onclick = back; return;
    }
    const q = qs[i];
    modal(`<h2>${esc(title)}</h2><div>Câu ${i + 1}/${qs.length}</div><div class="bar"><div style="width:${(i / qs.length) * 100}%"></div></div>
      <div class="line" style="font-size:20px;margin:10px 0">${esc(q.q)}</div>
      ${q.listen ? `<button id="q-listen">🔊 Nghe (bấm để nghe lại)</button> <button class="small" id="q-slow">🐢 Chậm</button>` : ""}
      <div class="opts" style="display:grid;gap:8px;margin-top:12px">${q.opts.map((o, j) => `<button data-j="${j}">${String.fromCharCode(65 + j)}. ${esc(o)}</button>`).join("")}</div><div id="q-fb"></div>`);
    if (q.listen) { speak(q.listen); $("q-listen").onclick = () => speak(q.listen); $("q-slow").onclick = () => speak(q.listen, 0.6); }
    const bs = $("modal-box").querySelectorAll(".opts button");
    bs.forEach((b) => (b.onclick = () => {
      const j = +b.dataset.j, ok = j === q.a; if (ok) right++;
      bs.forEach((x, k) => { x.disabled = true; if (k === q.a) x.classList.add("ok"); else if (k === j) x.classList.add("bad"); });
      if (q.say) speak(q.say);
      $("q-fb").innerHTML = `<div class="row">${ok ? "✅ Chính xác!" : "❌ Chưa đúng."} ${q.listen ? `<span class="vi">Câu gốc: "${esc(q.listen)}"</span>` : ""}<button id="q-next">Tiếp ▶</button></div>`;
      $("q-next").onclick = () => { i++; show(); };
    }));
  };
  show();
}

// ---------- PHÒNG THI ----------
const LEVELS = ["A1", "A2", "B1", "B2"];
const LEVEL_DESC = { A1: "Sơ cấp – giới thiệu bản thân, câu đơn giản", A2: "Sơ trung – quá khứ, tương lai, so sánh", B1: "Trung cấp – hiện tại hoàn thành, điều kiện", B2: "Trung cao – bị động, tường thuật, đảo ngữ" };
function examUnlocked(lv) { const i = LEVELS.indexOf(lv); return i === 0 || (save.exams[LEVELS[i - 1]] || 0) >= 70; }
function openExamIntro(focus) {
  speak("Welcome to the exam hall. Good luck!");
  modal(`<h2>📝 Phòng thi CEFR</h2><p>Mỗi lần thi bốc ngẫu nhiên tối đa <b>15 câu</b> từ ngân hàng câu hỏi (ngữ pháp, từ vựng, nghe), nên mỗi lần là một đề khác nhau. Đạt <b>≥ 70%</b> để mở cấp độ tiếp theo. Gợi ý: hoàn thành các giai đoạn tương ứng trong Phòng học trước khi thi.</p>
    <div class="levels">${LEVELS.map((lv) => {
      const un = examUnlocked(lv), sc = save.exams[lv];
      return `<button class="level" ${un ? `onclick="startExam('${lv}')"` : "disabled"} style="${lv === focus ? "outline:3px solid #f59e0b" : ""}">
        <big>${un ? "" : "🔒 "}${lv}</big><small>${LEVEL_DESC[lv]}</small><br><small>Ngân hàng: ${EXAMS[lv].length} câu</small><br><b>${sc != null ? `Điểm cao nhất: ${sc}% ${sc >= 70 ? "🏅" : ""}` : "Chưa thi"}</b></button>`;
    }).join("")}</div>`);
}
function startExam(lv) {
  const qs = shuffle(EXAMS[lv]).slice(0, 15).map((q) => { const order = shuffle(q.opts.map((_, i) => i)); return { ...q, opts: order.map((i) => q.opts[i]), a: order.indexOf(q.a) }; });
  runQuiz(qs, `Bài thi ${lv}`, (pct) => {
    save.exams[lv] = Math.max(save.exams[lv] || 0, pct); addXp(pct >= 70 ? 100 : 20); persist();
    return pct >= 70 ? `🏅 Chúc mừng! Bạn đạt trình độ ${lv}.` : "Chưa đạt 70%. Hãy học thêm ở Phòng học rồi quay lại!";
  }, () => openExamIntro(lv));
}

// ---------- BẢNG TỪ VỰNG ----------
function openVocabBoard(set) {
  const V = VOCAB[set]; if (!V) return;
  save.vocab ||= {}; const st = (save.vocab[set] ||= { best: 0 }); persist();
  const hl = (ex, w) => esc(ex).replace(new RegExp("\\b(" + w.split(" ")[0].replace(/[^a-z]/gi, "") + "\\w*)", "i"), "<b style='color:#c0392b'>$1</b>");
  modal(`<h2>📋 Bảng từ vựng: ${V.title}</h2>
    <p>${V.words.length} từ mới. Bấm 🔊 để nghe từ và câu ví dụ. Làm bài kiểm tra nhanh đạt ≥ 80% để nhận ⭐ cho bảng này. ${st.best ? `<b>Điểm cao nhất: ${st.best}%${st.best >= 80 ? " ⭐" : ""}</b>` : ""}</p>
    <div class="row" style="margin:0 0 10px"><button id="vb-all">🔊 Đọc tất cả</button><button id="vb-quiz">📝 Kiểm tra nhanh</button></div>
    <div style="display:grid;gap:8px">${V.words.map(([w, ipa, pos, vi, ex, exVi], i) => `
      <div style="background:#fff;border:1px solid #e6d6b4;border-radius:12px;padding:10px 14px">
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
          <span style="font-size:20px;font-weight:800;color:#6b4423">${esc(w)}</span>
          <button class="small" data-say="${esc(w)}">🔊</button>
          <span style="color:#7a6a58">${esc(ipa)}</span>
          <span style="background:#e8f5e9;color:#2e7d32;border-radius:999px;padding:1px 8px;font-size:12px;font-weight:700">${POS_VI[pos] || pos}</span>
          <span style="font-weight:700">→ ${esc(vi)}</span>
        </div>
        <div style="margin-top:6px">📝 ${hl(ex, w)} <button class="small" data-say="${esc(ex)}">🔊</button></div>
        <div class="vi">${esc(exVi)}</div>
      </div>`).join("")}</div>`);
  $("modal-box").onclick = (e) => { const t = e.target.dataset?.say; if (t) speak(t, 0.85); };
  $("vb-all").onclick = async () => { for (const [w, , , , ex] of V.words) { speak(w + ". " + ex, 0.85); await new Promise((r) => { const u = () => (speechSynthesis.speaking ? setTimeout(u, 200) : r()); setTimeout(u, 400); }); if ($("modal").classList.contains("hidden")) break; } };
  $("vb-quiz").onclick = () => vocabQuiz(set);
}
function vocabQuiz(set) {
  const V = VOCAB[set], words = V.words;
  const qs = shuffle(words).map(([w, , , vi, ex], i) => {
    const kind = i % 3; // 0: nghĩa, 1: Anh ← Việt, 2: điền vào câu ví dụ
    const others = shuffle(words.filter((x) => x[0] !== w)).slice(0, 3);
    if (kind === 0) { const opts = shuffle([vi, ...others.map((o) => o[3])]); return { q: `"${w}" nghĩa là gì?`, opts, a: opts.indexOf(vi), say: w }; }
    if (kind === 1) { const opts = shuffle([w, ...others.map((o) => o[0])]); return { q: `"${vi}" trong tiếng Anh là?`, opts, a: opts.indexOf(w), say: w }; }
    const blank = ex.replace(new RegExp("\\b" + w.split(" ")[0].replace(/[^a-z]/gi, "") + "\\w*", "i"), "___");
    const opts = shuffle([w, ...others.map((o) => o[0])]);
    return { q: blank.includes("___") ? `Điền từ: ${blank}` : `"${vi}" trong tiếng Anh là?`, opts, a: opts.indexOf(w), say: ex };
  });
  runQuiz(qs, `📝 Từ vựng: ${V.title}`, (pct) => {
    const st = (save.vocab[set] ||= { best: 0 }); const first = st.best < 80 && pct >= 80;
    st.best = Math.max(st.best, pct); addXp(first ? 40 : 10); persist();
    return pct >= 80 ? "⭐ Xuất sắc! Bạn đã thuộc bảng từ này." : "Ôn lại bảng từ rồi thử lại để nhận ⭐ nhé!";
  }, () => openVocabBoard(set));
}

// ---------- SỔ TAY (ôn tập câu đã gặp) ----------
function openNotebook() {
  const rows = DIALOGUES.filter((x) => save.srs[x.id]).sort((a, b) => save.srs[a.id].box - save.srs[b.id].box);
  modal(`<h2>📒 Sổ tay giao tiếp</h2><p>Các câu bạn đã gặp trong làng. Câu yếu (🔴) sẽ được NPC hỏi lại sớm hơn.</p>
    ${rows.length ? rows.map((x) => { const b = save.srs[x.id].box; return `<div class="lesson"><span>${b >= 3 ? "🟢" : b >= 1 ? "🟡" : "🔴"} <b>${esc(x.en)}</b> → ${esc(x.ok)}<br><small class="vi">${esc(x.vi)} → ${esc(x.okVi)}</small></span><button class="small" onclick="speak(${esc(JSON.stringify(x.en + " " + x.ok))})">🔊</button></div>`; }).join("") : "<p><i>Chưa có câu nào. Ra làng nói chuyện với NPC nhé!</i></p>"}`);
}

// ---------- LUYỆN NÓI với Coach Mia ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;
function stopRec() { try { rec && rec.abort(); } catch (e) {} rec = null; }
function openSpeaking(cat = Object.keys(SPEAKING)[0], idx = null) {
  const list = SPEAKING[cat]; if (idx == null) idx = (Math.random() * list.length) | 0;
  const sent = list[idx];
  modal(`<h2>🎤 Coach Mia – Luyện nói</h2>
    <div class="tabs">${Object.keys(SPEAKING).map((c) => `<button class="small ${c === cat ? "active" : ""}" onclick="openSpeaking('${c}')">${c}</button>`).join("")}</div>
    <p>1) Nghe mẫu &nbsp; 2) Bấm 🎙️ và đọc to &nbsp; 3) Xem điểm phát âm</p>
    <div class="line" style="font-size:26px;margin:14px 0"><b>${esc(sent)}</b></div>
    <div class="row"><button onclick="speak(${esc(JSON.stringify(sent))})">🔊 Nghe mẫu</button><button onclick="speak(${esc(JSON.stringify(sent))}, .6)">🐢 Nghe chậm</button>
      <button class="mic" id="mic">🎙️ Bắt đầu nói</button><button onclick="openSpeaking('${cat}', ${(idx + 1) % list.length})">Câu khác ▶</button></div>
    <div id="sp-res" style="margin-top:14px"></div>
    ${SR ? "" : `<p style="color:#c0392b">⚠️ Trình duyệt chưa hỗ trợ nhận diện giọng nói. Hãy dùng <b>Google Chrome</b> hoặc <b>Microsoft Edge</b>.</p>`}`);
  speak(sent);
  $("mic").onclick = () => {
    if (!SR) return;
    stopRec(); speechSynthesis.cancel();
    rec = new SR(); rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 3;
    $("mic").textContent = "🔴 Đang nghe..."; $("sp-res").innerHTML = "";
    rec.onresult = (e) => {
      const alts = Array.from(e.results[0]).map((r) => r.transcript);
      const best = alts.map((a) => scoreSpeech(sent, a)).sort((a, b) => b.score - a.score)[0];
      const good = best.score >= 80;
      if (good) { save.speak++; addXp(15); }
      $("sp-res").innerHTML = `<div class="score" style="color:${good ? "#2f9e44" : best.score >= 50 ? "#e67e22" : "#c0392b"}">${best.score}%</div>
        <p class="diff">${best.html}</p><p class="vi">Máy nghe được: "${esc(best.heard)}"</p>
        <p>${good ? "🎉 Excellent! Phát âm rất tốt." : best.score >= 50 ? "👍 Khá tốt! Chú ý các từ gạch đỏ, nghe chậm rồi thử lại." : "💪 Thử lại nhé! Nghe chậm và đọc từng từ rõ ràng."}</p>`;
      speak(good ? "Excellent!" : best.score >= 50 ? "Good job! Try again." : "Let's try again.");
    };
    rec.onerror = (e) => { $("sp-res").innerHTML = `<p style="color:#c0392b">Lỗi micro: ${esc(e.error)}. Hãy cho phép trình duyệt dùng micro (cần mở qua http://localhost hoặc file trên Chrome).</p>`; };
    rec.onend = () => { if ($("mic")) $("mic").textContent = "🎙️ Nói lại"; };
    rec.start();
  };
}
function scoreSpeech(target, heard) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9' ]/g, " ").split(/\s+/).filter(Boolean);
  const t = norm(target), h = norm(heard);
  // LCS để so khớp từ
  const dp = Array.from({ length: t.length + 1 }, () => Array(h.length + 1).fill(0));
  for (let i = 1; i <= t.length; i++) for (let j = 1; j <= h.length; j++) dp[i][j] = t[i - 1] === h[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const hit = new Set(); let i = t.length, j = h.length;
  while (i > 0 && j > 0) { if (t[i - 1] === h[j - 1]) { hit.add(i - 1); i--; j--; } else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--; }
  const score = Math.round((dp[t.length][h.length] / Math.max(t.length, h.length)) * 100);
  const words = target.split(/\s+/);
  return { score, heard, html: words.map((w, k) => `<span class="${hit.has(k) ? "hit" : "miss"}">${esc(w)}</span>`).join(" ") };
}

// ---------- Vẽ ----------
let dpr = 1, zoom = 2, camX = 0, camY = 0, VW = 0, VH = 0;
const fog = document.createElement("canvas"), fctx = fog.getContext("2d");
function resize() {
  dpr = window.devicePixelRatio || 1; VW = innerWidth; VH = innerHeight;
  cv.width = VW * dpr; cv.height = VH * dpr; fog.width = VW; fog.height = VH;
  zoom = Math.max(0.8, Math.min(1.6, Math.min(VH / (20 * TS), VW / (28 * TS)))) * userZoom;
}
let userZoom = 1;
try { userZoom = +localStorage.getItem("ev.zoom") || 1; } catch (e) {}
function setZoom(z) { userZoom = Math.max(0.6, Math.min(1.8, z)); try { localStorage.setItem("ev.zoom", userZoom); } catch (e) {} resize(); snapCamera(); toast(`🔍 Zoom ${Math.round(userZoom * 100)}%`); }
addEventListener("keydown", (e) => { if (busy) return; if (e.key === "+" || e.key === "=") setZoom(userZoom + 0.1); if (e.key === "-" || e.key === "_") setZoom(userZoom - 0.1); if (e.key === "0") setZoom(1); });
addEventListener("wheel", (e) => { if (!busy) setZoom(userZoom + (e.deltaY < 0 ? 0.1 : -0.1)); }, { passive: true });
addEventListener("resize", resize); resize();

function darkness() {
  const hr = new Date().getHours() + new Date().getMinutes() / 60;
  if (hr >= 20 || hr < 5) return 0.5;
  if (hr >= 18) return (hr - 18) / 2 * 0.5;
  if (hr < 7) return (7 - hr) / 2 * 0.5;
  return 0;
}
const shadeHex = (c, k) => '#' + [1, 3, 5].map((i) => Math.max(0, Math.min(255, parseInt(c.slice(i, i + 2), 16) + k)).toString(16).padStart(2, '0')).join('');
const roofCache = {};
function roofColor(x, y) {
  if (mapId !== 'village') return ['#b5452f', '#a03a26'];
  const b = BUILDINGS.find((b) => x >= b.r[0] && x <= b.r[2] && y >= b.r[1] && y <= b.r[3]);
  const c = b ? b.roof : '#b5452f';
  return roofCache[c] || (roofCache[c] = [c, shadeHex(c, -22)]);
}
const is = (x, y, t) => map().grid[y]?.[x] === t;

let skipGrass = false;
function drawGrass(X, Y, h) {
  if (skipGrass) return;
  ctx.fillStyle = h % 3 ? "#7cc55a" : "#76bd52"; ctx.fillRect(X, Y, TS, TS);
  ctx.fillStyle = "#8ed26a"; ctx.fillRect(X + (h % 23), Y + (h % 19), 2, 2); ctx.fillRect(X + (h % 13) + 10, Y + (h % 11) + 14, 2, 2);
  if (h % 5 === 0) { ctx.fillStyle = "#5fa83a"; ctx.fillRect(X + 8, Y + 14, 2, 5); ctx.fillRect(X + 11, Y + 12, 2, 7); ctx.fillRect(X + 22, Y + 22, 2, 5); }
}
function drawTile(t, x, y) {
  const X = x * TS, Y = y * TS, h = hash(x, y);
  switch (t) {
    case ".": drawGrass(X, Y, h); break;
    case "f": drawGrass(X, Y, h); ["#ff6b9d", "#ffd93d", "#ffffff", "#c084fc"].forEach((c, i) => { if ((h + i) % 2) return; ctx.fillStyle = c; const a = 6 + ((h * (i + 3)) % 20), b = 6 + ((h * (i + 7)) % 20); ctx.beginPath(); ctx.arc(X + a, Y + b, 3, 0, 7); ctx.fill(); ctx.fillStyle = "#f59e0b"; ctx.fillRect(X + a - 1, Y + b - 1, 2, 2); }); break;
    case "=": {
      ctx.fillStyle = "#dcc08a"; ctx.fillRect(X, Y, TS, TS);
      ctx.fillStyle = "#c9a96e"; ctx.fillRect(X + (h % 24), Y + (h % 21), 4, 3); ctx.fillRect(X + (h % 17) + 6, Y + (h % 9) + 18, 3, 2);
      ctx.fillStyle = "#0000000f"; if (!is(x, y - 1, "=") && !is(x, y - 1, "P")) ctx.fillRect(X, Y, TS, 3); if (!is(x - 1, y, "=") && !is(x - 1, y, "P")) ctx.fillRect(X, Y, 3, TS);
      break;
    }
    case "P": case "U": ctx.fillStyle = (x + y) % 2 ? "#ddd6c6" : "#d2cab8"; ctx.fillRect(X, Y, TS, TS); ctx.strokeStyle = "#b9b09c"; ctx.lineWidth = 1; ctx.strokeRect(X + .5, Y + .5, 15, 15); ctx.strokeRect(X + 16.5, Y + 16.5, 15, 15); ctx.strokeRect(X + 16.5, Y + .5, 15, 15); ctx.strokeRect(X + .5, Y + 16.5, 15, 15); break;
    case "T": {
      drawGrass(X, Y, h);
      ctx.fillStyle = "#0000002a"; ctx.beginPath(); ctx.ellipse(X + 17, Y + 28, 13, 5, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#6b4423"; ctx.fillRect(X + 13, Y + 16, 6, 13);
      const g = [["#2e7d32", "#388e3c", "#66bb6a"], ["#33691e", "#558b2f", "#8bc34a"], ["#1b5e20", "#2e7d32", "#4caf50"]][h % 3];
      ctx.fillStyle = g[0]; ctx.beginPath(); ctx.arc(X + 16, Y + 10, 15, 0, 7); ctx.fill();
      ctx.fillStyle = g[1]; ctx.beginPath(); ctx.arc(X + 12, Y + 6, 10, 0, 7); ctx.arc(X + 21, Y + 9, 9, 0, 7); ctx.fill();
      ctx.fillStyle = g[2]; ctx.beginPath(); ctx.arc(X + 10, Y + 2, 4, 0, 7); ctx.fill();
      if (h % 7 === 0) { ctx.fillStyle = "#e53935"; ctx.beginPath(); ctx.arc(X + 20, Y + 12, 2.5, 0, 7); ctx.arc(X + 9, Y + 13, 2.5, 0, 7); ctx.fill(); }
      break;
    }
    case "h": drawGrass(X, Y, h); ctx.fillStyle = "#0000002a"; ctx.beginPath(); ctx.ellipse(X + 16, Y + 26, 12, 4, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#3f8f3a"; ctx.beginPath(); ctx.arc(X + 10, Y + 18, 8, 0, 7); ctx.arc(X + 22, Y + 18, 8, 0, 7); ctx.arc(X + 16, Y + 12, 9, 0, 7); ctx.fill(); ctx.fillStyle = "#5cb85c"; ctx.beginPath(); ctx.arc(X + 13, Y + 9, 3, 0, 7); ctx.fill(); if (h % 2) { ctx.fillStyle = "#f06292"; ctx.fillRect(X + 18, Y + 15, 3, 3); ctx.fillRect(X + 9, Y + 20, 3, 3); } break;
    case "W": {
      ctx.fillStyle = "#3a9ad9"; ctx.fillRect(X, Y, TS, TS);
      ctx.fillStyle = "#2f88c7"; ctx.fillRect(X, Y + 20, TS, 12);
      const o = Math.sin(perf / 600 + x * .7 + y) * 3;
      ctx.strokeStyle = "#a7dcff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X + 4 + o, Y + 12); ctx.quadraticCurveTo(X + 10 + o, Y + 8, X + 16 + o, Y + 12); ctx.stroke();
      if ((h + ((perf / 400) | 0)) % 17 === 0) { ctx.fillStyle = "#fff"; ctx.fillRect(X + 20, Y + 22, 2, 2); }
      ctx.fillStyle = "#e8f6ff"; if (!is(x, y - 1, "W")) ctx.fillRect(X, Y, TS, 3); if (!is(x, y + 1, "W")) ctx.fillRect(X, Y + 29, TS, 3); if (!is(x - 1, y, "W")) ctx.fillRect(X, Y, 3, TS); if (!is(x + 1, y, "W")) ctx.fillRect(X + 29, Y, 3, TS);
      break;
    }
    case "R": {
      const [c1, c2] = roofColor(x, y);
      ctx.fillStyle = c1; ctx.fillRect(X, Y, TS, TS);
      ctx.fillStyle = c2; for (let r = 0; r < 4; r++) ctx.fillRect(X + (r % 2) * 8, Y + r * 8 + 6, TS, 2);
      ctx.fillStyle = "#ffffff22"; if (!is(x, y - 1, "R")) ctx.fillRect(X, Y, TS, 4);
      if (!is(x, y + 1, "R")) { ctx.fillStyle = "#0000004a"; ctx.fillRect(X, Y + 28, TS, 4); }
      if (!is(x - 1, y, "R")) { ctx.fillStyle = "#00000030"; ctx.fillRect(X, Y, 3, TS); }
      if (!is(x + 1, y, "R")) { ctx.fillStyle = "#00000030"; ctx.fillRect(X + 29, Y, 3, TS); }
      break;
    }
    case "B": {
      ctx.fillStyle = "#f6e7c8"; ctx.fillRect(X, Y, TS, TS);
      ctx.fillStyle = "#8b5a2b"; if (!is(x - 1, y, "B") && !is(x - 1, y, "D") && !is(x - 1, y, "d")) ctx.fillRect(X, Y, 4, TS); if (!is(x + 1, y, "B") && !is(x + 1, y, "D") && !is(x + 1, y, "d")) ctx.fillRect(X + 28, Y, 4, TS);
      if (!is(x, y + 1, "B") && !is(x, y + 1, "D") && !is(x, y + 1, "d")) { ctx.fillStyle = "#a1887f"; ctx.fillRect(X, Y + 26, TS, 6); }
      if (h % 3 !== 0 && is(x, y + 1, "B")) {
        const lit = darkness() > 0.15;
        ctx.fillStyle = lit ? "#ffe082" : "#8fd3f4"; ctx.fillRect(X + 8, Y + 8, 16, 14);
        ctx.fillStyle = "#6b4423"; ctx.fillRect(X + 15, Y + 8, 2, 14); ctx.fillRect(X + 8, Y + 14, 16, 2); ctx.fillRect(X + 6, Y + 22, 20, 3);
        if (!lit) { ctx.fillStyle = "#ffffff70"; ctx.fillRect(X + 9, Y + 9, 4, 3); }
      }
      break;
    }
    case "D": case "d":
      if (mapId === "village") { ctx.fillStyle = "#f6e7c8"; ctx.fillRect(X, Y, TS, TS); ctx.fillStyle = "#6d4c2f"; ctx.fillRect(X + 5, Y + 2, 22, 30); ctx.fillStyle = "#8b5a2b"; ctx.fillRect(X + 8, Y + 5, 16, 27); ctx.fillStyle = "#ffd93d"; ctx.beginPath(); ctx.arc(X + 20, Y + 19, 2, 0, 7); ctx.fill(); }
      else { ctx.fillStyle = "#8b5a2b"; ctx.fillRect(X, Y, TS, TS); ctx.fillStyle = "#fffc"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center"; ctx.fillText("EXIT", X + 16, Y + 20); }
      break;
    case "Y": drawGrass(X, Y, h); ctx.fillStyle = "#0000002a"; ctx.beginPath(); ctx.ellipse(X + 16, Y + 29, 6, 2, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#37474f"; ctx.fillRect(X + 14, Y + 2, 4, 28); ctx.fillRect(X + 10, Y + 28, 12, 3); ctx.fillStyle = darkness() > 0.1 ? "#fff59d" : "#eceff1"; ctx.fillRect(X + 10, Y - 6, 12, 10); ctx.fillStyle = "#37474f"; ctx.fillRect(X + 9, Y - 8, 14, 3); break;
    case "M": {
      drawGrass(X, Y, h);
      ctx.fillStyle = "#8b5a2b"; ctx.fillRect(X - 2, Y + 12, TS + 4, 16); ctx.fillRect(X, Y - 12, 3, 26); ctx.fillRect(X + 29, Y - 12, 3, 26);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? "#fff" : ["#e53935", "#1e88e5", "#43a047", "#fb8c00"][(x / 2) % 4]; ctx.fillRect(X - 4 + i * 10, Y - 16, 10, 10); }
      ["#e53935", "#fdd835", "#7cb342", "#fb8c00"].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X + 5 + i * 7, Y + 14, 3.5, 0, 7); ctx.fill(); });
      break;
    }
    case "C": {
      ctx.fillStyle = "#8d6e4a"; ctx.fillRect(X, Y, TS, TS); ctx.fillStyle = "#7a5c3c"; ctx.fillRect(X, Y + 13, TS, 6);
      const sway = Math.sin(perf / 700 + x) * 1.5, crop = (x + y) % 3;
      for (let k = 0; k < 3; k++) {
        const px = X + 5 + k * 11; ctx.strokeStyle = "#4caf50"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, Y + 26); ctx.quadraticCurveTo(px + sway, Y + 18, px + sway * 2, Y + 8); ctx.stroke();
        ctx.fillStyle = "#66bb6a"; ctx.beginPath(); ctx.ellipse(px + sway, Y + 14, 4, 2, -0.6, 0, 7); ctx.fill();
        if (crop === 1) { ctx.fillStyle = "#e53935"; ctx.beginPath(); ctx.arc(px + sway * 2, Y + 10, 3, 0, 7); ctx.fill(); } else if (crop === 2) { ctx.fillStyle = "#fdd835"; ctx.fillRect(px + sway * 2 - 1, Y + 4, 3, 7); }
      }
      break;
    }
    case "S": {
      ctx.fillStyle = "#d7c4a3"; ctx.fillRect(X, Y, TS, TS);
      if ((x + y) % 2 === 0) { ctx.fillStyle = "#b5533c"; for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) ctx.fillRect(X + 3 + k * 14 + (r % 2) * 6, Y + 18 + r * 4, 11, 3); }
      ctx.strokeStyle = "#78909c"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X + 4, Y - 14); ctx.lineTo(X + 4, Y + 30); ctx.moveTo(X + 28, Y - 14); ctx.lineTo(X + 28, Y + 30); ctx.moveTo(X + 4, Y + 2); ctx.lineTo(X + 28, Y + 2); ctx.moveTo(X + 4, Y - 12); ctx.lineTo(X + 28, Y + 2); ctx.stroke();
      ctx.fillStyle = "#ffb300"; ctx.fillRect(X + 2, Y + 1, 28, 3);
      if (h % 4 === 0) { ctx.fillStyle = "#9e9e9e"; ctx.beginPath(); ctx.ellipse(X + 16, Y + 26, 9, 4, 0, 0, 7); ctx.fill(); }
      break;
    }
    case "Z": drawGrass(X, Y, h); ctx.fillStyle = "#6d4c2f"; ctx.fillRect(X + 2, Y + 18, 24, 4); ctx.fillRect(X + 4, Y + 22, 3, 7); ctx.fillRect(X + 21, Y + 22, 3, 7); ctx.fillStyle = "#455a64"; ctx.fillRect(X + 26, Y - 14, 3, 44); ctx.fillStyle = "#1e88e5"; ctx.beginPath(); ctx.roundRect(X + 16, Y - 22, 22, 14, 3); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "bold 8px sans-serif"; ctx.textAlign = "center"; ctx.fillText("BUS", X + 27, Y - 12); break;
    case "V": {
      drawGrass(X, Y, h);
      const set = map().grid.boardAt?.[x + "," + y], st = save.vocab?.[set], icon = VOCAB[set] ? [...VOCAB[set].title][0] : "📋";
      ctx.fillStyle = "#0000002a"; ctx.beginPath(); ctx.ellipse(X + 16, Y + 30, 14, 3, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#6d4c2f"; ctx.fillRect(X + 5, Y + 4, 3, 26); ctx.fillRect(X + 24, Y + 4, 3, 26);
      ctx.fillStyle = "#8d6e4a"; ctx.beginPath(); ctx.roundRect(X - 2, Y - 16, 36, 26, 3); ctx.fill();
      ctx.fillStyle = "#fff8e1"; ctx.fillRect(X + 1, Y - 13, 30, 20);
      ctx.fillStyle = "#2e7d32"; ctx.fillRect(X + 1, Y - 13, 30, 7);
      ctx.fillStyle = "#fff"; ctx.font = "bold 6px sans-serif"; ctx.textAlign = "center"; ctx.fillText("NEW WORDS", X + 16, Y - 7.5);
      ctx.font = "11px sans-serif"; ctx.fillText(icon, X + 16, Y + 5);
      if (st && st.best >= 80) { ctx.font = "10px sans-serif"; ctx.fillText("⭐", X + 30, Y - 14); }
      else if (!st) { ctx.fillStyle = "#e53935"; ctx.beginPath(); ctx.arc(X + 31, Y - 15, 3.5 + Math.sin(perf / 200) * 0.8, 0, 7); ctx.fill(); }
      break;
    }
    case "N": drawGrass(X, Y, h); ctx.fillStyle = "#a1887f"; ctx.fillRect(X, Y + 12, TS, 3); ctx.fillRect(X, Y + 20, TS, 3); ctx.fillStyle = "#8d6e63"; ctx.fillRect(X + 4, Y + 6, 4, 22); ctx.fillRect(X + 20, Y + 6, 4, 22); break;
    case "F": ctx.fillStyle = (x + y) % 2 ? "#c9955c" : "#c08a51"; ctx.fillRect(X, Y, TS, TS); ctx.fillStyle = "#00000014"; ctx.fillRect(X, Y + 31, TS, 1); ctx.fillRect(X + ((y % 2) * 16), Y, 1, TS); break;
    case "c": ctx.fillStyle = mapId === "exam" ? "#7b2d3b" : "#2d5a7b"; ctx.fillRect(X, Y, TS, TS); ctx.fillStyle = "#ffffff18"; ctx.fillRect(X + 2, Y + 2, 2, 2); ctx.fillStyle = "#e0b84c"; if (!is(x - 1, y, "c")) ctx.fillRect(X, Y, 3, TS); if (!is(x + 1, y, "c")) ctx.fillRect(X + 29, Y, 3, TS); if (!is(x, y - 1, "c")) ctx.fillRect(X, Y, TS, 3); break;
    case "w": ctx.fillStyle = mapId === "exam" ? "#cfd8dc" : "#ead7b2"; ctx.fillRect(X, Y, TS, TS); ctx.fillStyle = "#00000022"; ctx.fillRect(X, Y + 26, TS, 6); ctx.fillStyle = "#ffffff30"; ctx.fillRect(X, Y, TS, 2); break;
    case "O": ctx.fillStyle = "#ead7b2"; ctx.fillRect(X, Y, TS, TS); ctx.fillStyle = "#6b4423"; ctx.fillRect(X, Y - 22, TS, TS + 16); ctx.fillStyle = "#2f4f3a"; ctx.fillRect(X + (is(x - 1, y, "O") ? 0 : 3), Y - 19, TS - (is(x - 1, y, "O") ? 0 : 3) - (is(x + 1, y, "O") ? 0 : 3), TS + 10); break;
    case "K": ctx.fillStyle = (x + y) % 2 ? "#c9955c" : "#c08a51"; ctx.fillRect(X, Y, TS, TS); ctx.fillStyle = "#00000025"; ctx.fillRect(X + 2, Y + 24, TS - 4, 6); ctx.fillStyle = "#8b5a2b"; ctx.fillRect(X, Y + 4, TS, 18); ctx.fillStyle = "#a0693a"; ctx.fillRect(X, Y + 4, TS, 4); ctx.fillStyle = "#6b4423"; ctx.fillRect(X + 3, Y + 22, 4, 8); ctx.fillRect(X + 25, Y + 22, 4, 8); if (h % 3 === 0) { ctx.fillStyle = "#fff"; ctx.fillRect(X + 8, Y + 8, 12, 9); ctx.fillStyle = "#90a4ae"; ctx.fillRect(X + 10, Y + 10, 8, 1); ctx.fillRect(X + 10, Y + 13, 6, 1); } break;
    case "L": ctx.fillStyle = "#5d3a1a"; ctx.fillRect(X, Y - 18, TS, TS + 18); for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) { ctx.fillStyle = ["#e74c3c", "#3498db", "#f1c40f", "#2ecc71", "#9b59b6"][(h + r * 4 + k) % 5]; ctx.fillRect(X + 3 + k * 7, Y - 15 + r * 15, 5, 12); } break;
  }
}
function drawFountain() {
  const f = map().fountain, X = f.x * TS, Y = f.y * TS, cx = X + TS, cy = Y + TS;
  ctx.fillStyle = "#0000002a"; ctx.beginPath(); ctx.ellipse(cx, cy + 6, 34, 26, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#9e9e9e"; ctx.beginPath(); ctx.arc(cx, cy, 31, 0, 7); ctx.fill();
  ctx.fillStyle = "#bdbdbd"; ctx.beginPath(); ctx.arc(cx, cy - 2, 29, 0, 7); ctx.fill();
  ctx.fillStyle = "#4fb3ff"; ctx.beginPath(); ctx.arc(cx, cy - 2, 24, 0, 7); ctx.fill();
  ctx.fillStyle = "#9e9e9e"; ctx.beginPath(); ctx.arc(cx, cy - 4, 7, 0, 7); ctx.fill();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + perf / 900, r = 6 + ((perf / 50 + i * 13) % 16);
    ctx.fillStyle = "#e3f4ff"; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy - 4 + Math.sin(a) * r * 0.7 - 6, 2, 0, 7); ctx.fill();
  }
  ctx.fillStyle = "#ffffffcc"; ctx.beginPath(); ctx.arc(cx, cy - 16 + Math.sin(perf / 150) * 2, 3, 0, 7); ctx.fill();
}
function drawChar(e) {
  const X = e.px, Y = e.py, L = e.look, s = L.small ? 0.85 : 1;
  const walk = e.t < 1 ? Math.sin(e.t * Math.PI * 2) : 0, bob = Math.abs(walk) * -1.5;
  ctx.save(); ctx.translate(X + 16, Y + 16 + (L.small ? 2 : 0)); ctx.scale(s, s);
  ctx.fillStyle = "#00000033"; ctx.beginPath(); ctx.ellipse(0, 14, 10, 4, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#3e3e55"; ctx.fillRect(-6, 7 + walk * 2, 5, 7); ctx.fillRect(1, 7 - walk * 2, 5, 7);
  ctx.fillStyle = "#222"; ctx.fillRect(-6, 12 + walk * 2, 5, 2); ctx.fillRect(1, 12 - walk * 2, 5, 2);
  ctx.fillStyle = L.body; ctx.beginPath(); ctx.roundRect(-9, -4 + bob, 18, 13, 4); ctx.fill();
  ctx.fillStyle = "#00000022"; ctx.fillRect(-9, 5 + bob, 18, 4);
  ctx.fillStyle = L.skin; ctx.fillRect(-12, -2 + bob - walk * 2, 3, 8); ctx.fillRect(9, -2 + bob + walk * 2, 3, 8);
  ctx.fillStyle = L.skin; ctx.beginPath(); ctx.arc(0, -11 + bob, 9, 0, 7); ctx.fill();
  ctx.fillStyle = L.hair;
  if (e.dir === "up") { ctx.beginPath(); ctx.arc(0, -11 + bob, 9.5, 0, 7); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(0, -13 + bob, 9.5, Math.PI, 0); ctx.fill(); ctx.fillRect(-9.5, -14 + bob, 3, 7); ctx.fillRect(6.5, -14 + bob, 3, 7);
    const ox = e.dir === "left" ? -3 : e.dir === "right" ? 3 : 0;
    ctx.fillStyle = "#222"; ctx.fillRect(-4 + ox, -11 + bob, 2, 3); ctx.fillRect(2 + ox, -11 + bob, 2, 3);
    ctx.fillStyle = "#f4a3a3aa"; if (e.dir === "down") { ctx.fillRect(-7, -7 + bob, 3, 2); ctx.fillRect(4, -7 + bob, 3, 2); } }
  ctx.restore();
  ctx.font = "bold 10px Segoe UI, sans-serif"; ctx.textAlign = "center";
  const label = e === player ? "⭐ YOU" : e.name;
  const w = ctx.measureText(label).width + 10;
  ctx.fillStyle = e === player ? "#f59e0bdd" : e.star ? "#ef4444dd" : "#000000aa";
  ctx.beginPath(); ctx.roundRect(X + 16 - w / 2, Y - 20, w, 14, 7); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillText(label, X + 16, Y - 9.5);
  if (e.star && e !== player) { ctx.fillStyle = "#ffd93d"; ctx.font = "14px sans-serif"; ctx.fillText("❗", X + 16, Y - 24 + Math.sin(perf / 250) * 2); }
}
function drawBubble(n) {
  if (!n.bubble) return;
  ctx.font = "12px Segoe UI, sans-serif"; ctx.textAlign = "center";
  const w = ctx.measureText(n.bubble).width + 16, X = n.px + 16, Y = n.py - (n.star ? 40 : 26);
  ctx.fillStyle = "#fff"; ctx.strokeStyle = "#33333388"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(X - w / 2, Y - 22, w, 20, 10); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X - 4, Y - 2.5); ctx.lineTo(X, Y + 4); ctx.lineTo(X + 4, Y - 2.5); ctx.fill();
  ctx.fillStyle = "#222"; ctx.fillText(n.bubble, X, Y - 8);
}
function drawLabel(l) {
  ctx.font = "bold 11px Segoe UI, sans-serif"; ctx.textAlign = "center";
  const w = ctx.measureText(l.t).width + 16, X = l.x * TS, Y = l.y * TS;
  ctx.fillStyle = "#00000030"; ctx.beginPath(); ctx.roundRect(X - w / 2 + 2, Y - 12, w, 20, 5); ctx.fill();
  ctx.fillStyle = "#5b3a1e"; ctx.beginPath(); ctx.roundRect(X - w / 2, Y - 14, w, 20, 5); ctx.fill();
  ctx.strokeStyle = "#d9a86c"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = "#fff5e0"; ctx.fillText(l.t, X, Y);
}

// ---------- Vòng lặp ----------
let perf = 0, last = performance.now();
function update(dt) {
  if (stepEntity(player, dt, 0.15)) {
    const door = (map().doors || []).find((d) => d.x === player.x && d.y === player.y);
    if (door) goMap(door.to, door.sx, door.sy);
  }
  if (!busy && player.t >= 1) {
    const dx = keys.left ? -1 : keys.right ? 1 : 0, dy = dx ? 0 : keys.up ? -1 : keys.down ? 1 : 0;
    if (dx || dy) startMove(player, dx, dy);
  }
  if (map().vehicles) updateVehicles(dt);
  for (const n of map().npcs) {
    stepEntity(n, dt, 0.4);
    const near = Math.hypot(n.x - player.x, n.y - player.y);
    if (n.wander && !n.talking && n.t >= 1 && (n.nextMove -= dt) <= 0) {
      n.nextMove = 1.5 + Math.random() * 3;
      if (near > 2) {
        const dirs = shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]);
        if (Math.hypot(n.x - n.home.x, n.y - n.home.y) > n.radius) dirs.sort((a, b) => Math.hypot(n.x + a[0] - n.home.x, n.y + a[1] - n.home.y) - Math.hypot(n.x + b[0] - n.home.x, n.y + b[1] - n.home.y));
        for (const [ax, ay] of dirs) if (startMove(n, ax, ay)) break;
      } else n.dir = player.x < n.x ? "left" : player.x > n.x ? "right" : player.y < n.y ? "up" : "down";
    }
    if (n.bubble && (n.bubbleT -= dt) <= 0) n.bubble = null;
    if ((n.nextBubble -= dt) <= 0) {
      n.nextBubble = 5 + Math.random() * 6;
      if (near < 9 && !busy) {
        if (n.role === "speaking") n.bubble = ["Let's practice speaking! 🎤", "Repeat after me!", "Talk to me!"][(Math.random() * 3) | 0];
        else if (n.role === "teacher") n.bubble = "Ready for today's lesson?";
        else if (n.role === "exam") n.bubble = `${n.level} exam here!`;
        else { const tp = n.topics[(Math.random() * n.topics.length) | 0]; const arr = AMBIENT[tp]; n.bubble = arr[(Math.random() * arr.length) | 0]; }
        n.bubbleT = 3;
      }
    }
  }
  // Camera mượt
  const g = map().grid, mw = W_(g) * TS, mh = H_(g) * TS, vw = VW / zoom, vh = VH / zoom;
  const tx = mw <= vw ? -(vw - mw) / 2 : Math.max(0, Math.min(mw - vw, player.px + 16 - vw / 2));
  const ty = mh <= vh ? -(vh - mh) / 2 : Math.max(0, Math.min(mh - vh, player.py + 16 - vh / 2));
  const k = Math.min(1, dt * 8); camX += (tx - camX) * k; camY += (ty - camY) * k;
}
function snapCamera() { camX = 1e9; camY = 1e9; const g = map().grid, vw = VW / zoom, vh = VH / zoom; const mw = W_(g) * TS, mh = H_(g) * TS;
  camX = mw <= vw ? -(vw - mw) / 2 : Math.max(0, Math.min(mw - vw, player.px + 16 - vw / 2));
  camY = mh <= vh ? -(vh - mh) / 2 : Math.max(0, Math.min(mh - vh, player.py + 16 - vh / 2)); }

function render() {
  const g = map().grid, W = W_(g), H = H_(g);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = map().outdoor ? "#2f5d2a" : "#1a1410"; ctx.fillRect(0, 0, VW, VH);
  const s = dpr * zoom, ox = Math.round(-camX * s), oy = Math.round(-camY * s);
  ctx.setTransform(s, 0, 0, s, ox, oy);
  const x0 = Math.max(0, Math.floor(camX / TS) - 1), y0 = Math.max(0, Math.floor(camY / TS) - 1);
  const x1 = Math.min(W - 1, Math.ceil((camX + VW / zoom) / TS) + 1), y1 = Math.min(H - 1, Math.ceil((camY + VH / zoom) / TS) + 1);
  if (map().ground) {
    const sx = x0 * TS, sy = y0 * TS, sw = (x1 - x0 + 1) * TS, sh = (y1 - y0 + 1) * TS;
    ctx.drawImage(map().ground, sx, sy, sw, sh, sx, sy, sw, sh);
    skipGrass = true;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const t = g[y][x];
      if (t === "T" || t === "h" || t === "Y" || t === "M" || t === "C" || t === "S" || t === "Z" || t === "V") drawTile(t, x, y);
      else if (t === "W" && (hash(x, y) + ((perf / 300) | 0)) % 23 === 0) { ctx.fillStyle = "#ffffffcc"; ctx.fillRect(x * TS + 12, y * TS + 14, 6, 2); }
    }
    skipGrass = false;
  } else for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) drawTile(g[y][x], x, y);
  if (map().fountain) drawFountain();
  for (const o of map().objects || []) { ctx.fillStyle = "#000a"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center"; ctx.fillText(o.label, (o.x + o.w / 2) * TS, (o.y + 1) * TS + 12); }
  if (mapId === "study") { ctx.fillStyle = "#fff"; ctx.font = "13px Segoe UI"; ctx.textAlign = "center"; const done = allLessons.filter((l) => save.lessons[l.id]).length; ctx.fillText(`Progress: ${done}/${allLessons.length} lessons`, 15.5 * TS, 1.6 * TS); }
  const vx0 = camX - 200, vx1 = camX + VW / zoom + 200, vy0 = camY - 200, vy1 = camY + VH / zoom + 300;
  const items = [...map().npcs, player].filter((e) => e.px > vx0 && e.px < vx1 && e.py > vy0 && e.py < vy1).map((e) => ({ k: e.py + TS, f: () => drawChar(e) }));
  for (const b of map().buildings || []) if (b.r[2] * TS + 40 > vx0 && b.r[0] * TS - 40 < vx1 && b.r[3] * TS + 40 > vy0 && b.r[1] * TS - 60 < vy1) items.push({ k: (b.r[3] + 1) * TS, f: () => drawBuilding(b) });
  for (const v of map().vehicles || []) if (v.x + 80 > vx0 && v.x - 80 < vx1 && v.laneY > vy0 && v.laneY - 60 < vy1) items.push({ k: v.laneY + 4, f: () => drawVehicle(v) });
  items.sort((a, b) => a.k - b.k).forEach((i) => i.f());
  for (const l of map().labels || []) drawLabel(l);
  map().npcs.forEach(drawBubble);
  const nearB = !busy && (map().grid.boards || []).some((b) => Math.abs(b.x - player.x) <= 1 && Math.abs(b.y - player.y) <= 1);
  if (nearB) { ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#000c"; ctx.beginPath(); ctx.roundRect(player.px - 12, player.py + 34, 56, 15, 7); ctx.fill(); ctx.fillStyle = "#7cf27c"; ctx.fillText("[E] 📋 Words", player.px + 16, player.py + 45); }
  else if (!busy && map().npcs.some((n) => Math.hypot(n.x - player.x, n.y - player.y) <= 2.3)) {
    ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#000c"; ctx.beginPath(); ctx.roundRect(player.px - 8, player.py + 34, 48, 15, 7); ctx.fill(); ctx.fillStyle = "#ffd93d"; ctx.fillText("[E] Talk", player.px + 16, player.py + 45);
  }
  // Ánh sáng ngày / đêm
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const dk = map().outdoor ? darkness() : 0;
  if (dk > 0) {
    fctx.globalCompositeOperation = "source-over"; fctx.clearRect(0, 0, VW, VH);
    fctx.fillStyle = `rgba(15,20,60,${dk})`; fctx.fillRect(0, 0, VW, VH);
    fctx.globalCompositeOperation = "destination-out";
    const hole = (wx, wy, r) => { const sx = (wx - camX) * zoom, sy = (wy - camY) * zoom, R = r * zoom; const gr = fctx.createRadialGradient(sx, sy, 0, sx, sy, R); gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)"); fctx.fillStyle = gr; fctx.fillRect(sx - R, sy - R, R * 2, R * 2); };
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y][x] === "Y") hole(x * TS + 16, y * TS, 90);
    hole(player.px + 16, player.py + 16, 70);
    for (const v of map().vehicles || []) hole(v.x + v.dir * (v.len / 2 + 30), v.laneY - 8, 60);
    ctx.drawImage(fog, 0, 0, VW, VH);
  }
  const vg = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.45, VW / 2, VH / 2, Math.max(VW, VH) * 0.75);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.35)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  if (map().outdoor) drawMinimap(g, W, H);
}
function drawMinimap(g, W, H) {
  const sc = Math.max(2, Math.min(4, Math.floor(VW / 6 / W))), mw = W * sc, mh = H * sc, X = VW - mw - 16, Y = 64;
  ctx.fillStyle = "#000a"; ctx.beginPath(); ctx.roundRect(X - 6, Y - 6, mw + 12, mh + 12, 10); ctx.fill();
  const col = { ".": "#7cc55a", f: "#7cc55a", h: "#4a9a40", T: "#2e6b2a", "=": "#dcc08a", P: "#ddd6c6", U: "#4fb3ff", W: "#3a9ad9", R: "#b5452f", B: "#c8553d", D: "#ffd93d", d: "#8b5a2b", Y: "#7cc55a", M: "#fb8c00", N: "#a1887f", C: "#8d6e4a", S: "#bcaaa4", Z: "#1e88e5", A: "#4a4f55", k: "#cfc8b8", V: "#ffca28" };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { ctx.fillStyle = col[g[y][x]] || "#555"; ctx.fillRect(X + x * sc, Y + y * sc, sc, sc); }
  for (const n of map().npcs) { ctx.fillStyle = n.star ? "#ef4444" : "#fff"; ctx.fillRect(X + n.x * sc - 1, Y + n.y * sc - 1, sc + 2, sc + 2); }
  ctx.fillStyle = "#ffd93d"; ctx.beginPath(); ctx.arc(X + player.x * sc + sc / 2, Y + player.y * sc + sc / 2, sc + 1.5, 0, 7); ctx.fill(); ctx.strokeStyle = "#000"; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = "#fff8"; ctx.strokeRect(X + (camX / TS) * sc, Y + (camY / TS) * sc, (VW / zoom / TS) * sc, (VH / zoom / TS) * sc);
}
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; perf = now;
  update(dt); render(); requestAnimationFrame(loop);
}
prerenderGround(MAPS.village);
updateHud();
snapCamera();
requestAnimationFrame(loop);
setTimeout(() => toast("👋 Welcome to English Village! Lại gần NPC và bấm E để nói chuyện."), 300);
