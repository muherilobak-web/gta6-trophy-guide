// Leonida Trophy Atlas — an offline checklist, roadmap, missables page and
// next-up planner for the 55 PlayStation 5 trophies of Grand Theft Auto VI.
// Plain ES module, no libraries, no network at run time beyond fetching the
// trophy file that ships with the app. Progress lives in localStorage.

const DATA_URL = "data/trophies.json";
const STORE = {
  earned: "leonida-atlas-earned-v1",
  counts: "leonida-atlas-counts-v1",
  notes: "leonida-atlas-notes-v1",
  settings: "leonida-atlas-settings-v1",
};

// Roadmap stages, built from the official descriptions. Each stage lists the
// trophy ids it covers, in the order to earn them.
const ROADMAP = [
  {
    title: "Stage 1 — Play the story",
    note: "Chapters 1 to 4, the opening and final missions, and the six named missions. None can be missed; the chapter trophies can pop a mission or two late. Free roam continues after the story.",
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    title: "Stage 2 — Strangers and side strands",
    note: "Five stranger finals, the 8-strand meta trophy, and Bret's hunt. All of these can be finished after the story.",
    ids: [22, 23, 24, 25, 26, 27, 29],
  },
  {
    title: "Stage 3 — Counts and collections",
    note: "The long grinds — stunts, ranges, races, cards, WAiNK scans, challenges, vehicles, vaults, gangs, money and garages. Start them during the story; they finish in cleanup.",
    ids: [15, 17, 18, 19, 30, 31, 32, 35, 40, 43, 52, 53, 54, 55, 42],
  },
  {
    title: "Stage 4 — Open-world cleanup",
    note: "Everything left — activities, one-off moments and the ones no guide has confirmed yet. Then 100% completion and the platinum.",
    ids: [16, 20, 21, 28, 33, 34, 36, 37, 38, 39, 41, 44, 45, 46, 47, 48, 49, 50, 51],
  },
];

// Things that look missable but are not, per PowerPyx via sixshore.
const NOT_MISSABLE = [
  ["Let's Go Bowling", "The Kingpin Bowling robbery comes back later, so a missed valuable can be retried."],
  ["This Was No Boat Accident", "Kenton goes quiet after Chapter 1 and returns later; his strand is not missable."],
  ["Optional missions", "Many disappear after a while — but there are far more than the 100 that 100% completion needs."],
  ["Fences", "Some leave for good. None of them has a trophy quest."],
  ["Magazine collectibles", "A few sit in story buildings that close off. They also spawn elsewhere."],
  ["Hourglass quests", "Quests with an hourglass icon can fail on a timer. None is tied to a trophy."],
  ["Jason and Lucia's relationship", "It does not matter for trophies."],
];

const $ = (id) => document.getElementById(id);

const state = {
  data: null,
  byId: new Map(),
  earned: new Set(),
  counts: {},
  notes: {},
  spoiler: true,
  dark: false,
  view: "checklist",
  selectedId: 1,
  search: "",
  kind: "all",
  grade: "all",
  earnedFilter: "all",
};

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the guide still works, it just does not persist.
  }
}

function loadState() {
  state.earned = new Set(readStore(STORE.earned, []));
  state.counts = readStore(STORE.counts, {});
  state.notes = readStore(STORE.notes, {});
  const settings = readStore(STORE.settings, {});
  state.spoiler = settings.spoiler !== false;
  state.dark = settings.dark === true;
}

function saveProgress() {
  writeStore(STORE.earned, [...state.earned]);
  writeStore(STORE.counts, state.counts);
  writeStore(STORE.notes, state.notes);
  writeStore(STORE.settings, { spoiler: state.spoiler, dark: state.dark });
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  if (kind === "platinum") return "Platinum";
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function isMasked(t) {
  return state.spoiler && t.hidden && !state.earned.has(t.id);
}

function medalDot(t) {
  return '<span class="medal medal-' + t.grade + '"><span class="medal-dot"></span>' + gradeLabel(t.grade) + "</span>";
}

function metaLine(t) {
  const bits = [medalDot(t), '<span class="tag">' + kindLabel(t.kind) + "</span>"];
  if (t.hidden) bits.push('<span class="tag tag-hidden">Hidden</span>');
  if (t.missable) bits.push('<span class="tag tag-missable">Missable</span>');
  if (typeof t.exophaseRate === "number") bits.push('<span class="rate">Exophase ' + t.exophaseRate + "% earned</span>");
  return bits.join(" ");
}

function trophyRow(t) {
  const li = document.createElement("li");
  li.className = "trophy-row" + (state.earned.has(t.id) ? " earned" : "") + (state.selectedId === t.id ? " selected" : "");
  li.dataset.id = String(t.id);
  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = state.earned.has(t.id);
  box.setAttribute("aria-label", "Earned: " + t.name);
  box.addEventListener("change", () => toggleEarned(t.id, box.checked));
  box.addEventListener("click", (e) => e.stopPropagation());
  const body = document.createElement("div");
  if (isMasked(t)) {
    body.innerHTML = '<div class="trophy-name">Hidden trophy</div><div class="trophy-desc masked">Hidden trophy — earn it to reveal.</div>';
  } else {
    const name = document.createElement("div");
    name.className = "trophy-name";
    name.textContent = t.name;
    const desc = document.createElement("div");
    desc.className = "trophy-desc";
    desc.textContent = t.description;
    body.append(name, desc);
  }
  const meta = document.createElement("div");
  meta.className = "trophy-meta";
  meta.innerHTML = metaLine(t);
  body.append(meta);
  const count = document.createElement("div");
  count.className = "rate";
  if (t.target) {
    const have = state.counts[t.id] || 0;
    count.textContent = have + " / " + t.target.toLocaleString("en-US") + " " + (t.targetLabel || "");
  }
  li.append(box, body, count);
  li.addEventListener("click", () => selectTrophy(t.id));
  return li;
}

function visibleTrophies() {
  const q = state.search.trim().toLowerCase();
  return state.data.trophies.filter((t) => {
    if (state.kind === "missable" && !t.missable) return false;
    if (state.kind !== "all" && state.kind !== "missable" && t.kind !== state.kind) return false;
    if (state.grade !== "all" && t.grade !== state.grade) return false;
    if (state.earnedFilter === "earned" && !state.earned.has(t.id)) return false;
    if (state.earnedFilter === "not" && state.earned.has(t.id)) return false;
    if (q && !(t.name + " " + t.description).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderProgress() {
  const n = state.earned.size;
  $("earnedCount").textContent = String(n);
  $("progressFill").style.width = (n / 55 * 100).toFixed(1) + "%";
  const left = 55 - n;
  $("progressLine").textContent = left === 0
    ? "All 55 earned — Leonida Legend. Claim the platinum."
    : left + " to go · 55 trophies · 1 Platinum · 2 Gold · 6 Silver · 46 Bronze";
}

function renderList() {
  const list = $("trophyList");
  list.replaceChildren();
  const shown = visibleTrophies();
  for (const t of shown) list.append(trophyRow(t));
  $("listCount").textContent = shown.length === 55
    ? "Showing all 55 trophies."
    : "Showing " + shown.length + " of 55 trophies.";
}

function sourceLinks(t) {
  const defs = state.data.sources || {};
  return (t.sources || []).map((key) => {
    const s = defs[key];
    if (!s) return key;
    return '<a href="' + s.url + '">' + s.name + "</a>";
  }).join(" · ");
}

function renderDetail() {
  const pane = $("detailPane");
  const t = state.byId.get(state.selectedId) || state.data.trophies[0];
  pane.replaceChildren();
  const title = document.createElement("h2");
  const grade = document.createElement("p");
  grade.className = "trophy-meta";
  grade.innerHTML = metaLine(t);
  if (isMasked(t)) {
    title.textContent = "Hidden trophy";
    const masked = document.createElement("p");
    masked.className = "masked";
    masked.textContent = "Hidden trophy — earn it to reveal. It is one of the 28 hidden trophies; the spoiler setting hides its name, description and guide until you tick it off.";
    const hint = document.createElement("p");
    hint.textContent = "Turn the spoiler setting off in the toolbar to see every trophy by name.";
    pane.append(title, grade, masked, hint);
    return;
  }
  title.textContent = t.name;
  const official = document.createElement("p");
  official.className = "official";
  official.textContent = "“" + t.description + "” — the official description.";
  const guide = document.createElement("p");
  guide.className = "guide-text";
  guide.textContent = t.guide;
  pane.append(title, grade, official, guide);

  if (t.missable && t.missableWhy) {
    const note = document.createElement("p");
    note.className = "missable-note";
    note.textContent = "Missable: " + t.missableWhy;
    pane.append(note);
  }

  const earnedLine = document.createElement("p");
  if (state.earned.has(t.id)) {
    earnedLine.className = "earned-line";
    earnedLine.textContent = "Earned — ticked off in your checklist.";
  } else {
    earnedLine.textContent = "Not earned yet. Tick its box in the checklist when you get it.";
  }
  pane.append(earnedLine);

  if (t.target) {
    const row = document.createElement("div");
    row.className = "counter-row";
    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.addEventListener("click", () => setCount(t.id, (state.counts[t.id] || 0) - 1));
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = String(t.target);
    input.value = String(state.counts[t.id] || 0);
    input.setAttribute("aria-label", "Progress toward " + t.target + " " + (t.targetLabel || ""));
    input.addEventListener("change", () => setCount(t.id, Number(input.value)));
    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.addEventListener("click", () => setCount(t.id, (state.counts[t.id] || 0) + 1));
    const label = document.createElement("span");
    label.textContent = " / " + t.target.toLocaleString("en-US") + " " + (t.targetLabel || "");
    row.append(minus, input, plus, label);
    pane.append(row);
  }

  const notesLabel = document.createElement("label");
  notesLabel.textContent = "Your notes";
  const notes = document.createElement("textarea");
  notes.className = "notes-box";
  notes.placeholder = "Where you found it, what worked, what to try next…";
  notes.value = state.notes[t.id] || "";
  notes.addEventListener("change", () => {
    if (notes.value.trim()) state.notes[t.id] = notes.value;
    else delete state.notes[t.id];
    saveProgress();
  });
  pane.append(notesLabel, notes);

  const sources = document.createElement("p");
  sources.className = "sources";
  sources.innerHTML = "<strong>Sources:</strong> " + sourceLinks(t) + ". Guide: our own advice from the official description, not yet checked in the game.";
  pane.append(sources);
}

function renderRoadmap() {
  const host = $("roadmapStages");
  host.replaceChildren();
  for (const stage of ROADMAP) {
    const box = document.createElement("div");
    box.className = "stage";
    const earned = stage.ids.filter((id) => state.earned.has(id)).length;
    const head = document.createElement("div");
    head.className = "stage-head";
    const h = document.createElement("h3");
    h.textContent = stage.title;
    const count = document.createElement("span");
    count.className = "stage-count";
    count.textContent = earned + " / " + stage.ids.length;
    head.append(h, count);
    const note = document.createElement("p");
    note.textContent = stage.note;
    const track = document.createElement("div");
    track.className = "progress-track";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = (earned / stage.ids.length * 100).toFixed(1) + "%";
    track.append(fill);
    const list = document.createElement("ul");
    list.className = "trophy-list";
    for (const id of stage.ids) list.append(trophyRow(state.byId.get(id)));
    box.append(head, note, track, list);
    host.append(box);
  }
  const finish = $("finishLine");
  finish.replaceChildren();
  const h = document.createElement("h3");
  h.textContent = "Finish line";
  const p = document.createElement("p");
  const road = state.byId.get(14);
  const plat = state.byId.get(1);
  p.textContent = "A Long Road (100% completion) is the last big job — the checklist opens after the story and progress made during the story already counts. Then " + (plat ? plat.name : "the platinum") + " pops for the other 54. " +
    "100% needs: 70 of 80 challenges, 15 of 18 meditations, 300 stunts, all 8 bank vaults, all 39 illegal operations, all shooting ranges, all drone races, all 15 of Bret's target decks, 200 of 277 vehicles and 100 of 255 animals.";
  finish.append(h, p);
  if (road) finish.append(trophyRow(road));
  if (plat) finish.append(trophyRow(plat));
}

function renderMissables() {
  const host = $("missableList");
  host.replaceChildren();
  const flagged = state.data.trophies.filter((t) => t.missable);
  if (!flagged.length) {
    const p = document.createElement("p");
    p.textContent = "No trophy is flagged missable.";
    host.append(p);
  }
  for (const t of flagged) {
    const box = document.createElement("div");
    box.className = "stage";
    const h = document.createElement("h3");
    h.textContent = t.name + " — possibly missable";
    const why = document.createElement("p");
    why.textContent = t.missableWhy || "";
    const guide = document.createElement("p");
    guide.textContent = t.guide;
    box.append(h, why, guide, trophyRow(t));
    host.append(box);
  }
  const list = $("notMissableList");
  list.replaceChildren();
  for (const [name, why] of NOT_MISSABLE) {
    const li = document.createElement("li");
    li.innerHTML = "<strong>" + name + ":</strong> " + why;
    list.append(li);
  }
}

function nextUpCandidates() {
  const remaining = state.data.trophies.filter((t) => !state.earned.has(t.id) && t.id !== 1);
  const effort = (t) => {
    if (t.missable) return -1000;
    if (t.target) return (t.target - (state.counts[t.id] || 0)) / t.target * 100;
    return 200 - (t.exophaseRate || 0);
  };
  return remaining.sort((a, b) => effort(a) - effort(b)).slice(0, 5);
}

function nextUpWhy(t) {
  if (t.missable) return "Flagged missable — do it while its window is open.";
  if (t.target) {
    const left = t.target - (state.counts[t.id] || 0);
    return "Only " + left.toLocaleString("en-US") + " left of " + t.target.toLocaleString("en-US") + " " + (t.targetLabel || "") + ".";
  }
  if (t.exophaseRate >= 1) return t.exophaseRate + "% of tracked players already have it — a quick one.";
  return "No long grind behind it.";
}

function renderNextup() {
  const host = $("nextupList");
  host.replaceChildren();
  for (const t of nextUpCandidates()) {
    const li = document.createElement("li");
    const name = document.createElement("strong");
    name.textContent = isMasked(t) ? "Hidden trophy" : t.name;
    const why = document.createElement("div");
    why.className = "why";
    why.textContent = nextUpWhy(t);
    li.append(name, " — ", document.createTextNode(t.description), why);
    li.addEventListener("click", () => selectTrophy(t.id));
    host.append(li);
  }
  const counts = $("countsList");
  counts.replaceChildren();
  const counted = state.data.trophies.filter((t) => t.target).sort((a, b) => {
    const fa = (state.counts[a.id] || 0) / a.target;
    const fb = (state.counts[b.id] || 0) / b.target;
    return fb - fa;
  });
  for (const t of counted) {
    const li = document.createElement("li");
    const have = state.counts[t.id] || 0;
    li.textContent = (isMasked(t) ? "Hidden trophy" : t.name) + ": " + have.toLocaleString("en-US") + " / " + t.target.toLocaleString("en-US") + " " + (t.targetLabel || "");
    counts.append(li);
  }
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
  renderNextup();
}

function showView(view) {
  state.view = view;
  for (const btn of document.querySelectorAll(".tab")) {
    btn.classList.toggle("active", btn.dataset.view === view);
  }
  $("viewChecklist").classList.toggle("hidden", view !== "checklist");
  $("viewRoadmap").classList.toggle("hidden", view !== "roadmap");
  $("viewMissables").classList.toggle("hidden", view !== "missables");
  $("viewNextup").classList.toggle("hidden", view !== "nextup");
  $("toolbar").classList.toggle("hidden", view !== "checklist");
  if (location.hash !== "#" + view) history.replaceState(null, "", "#" + view);
}

function selectTrophy(id) {
  state.selectedId = id;
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
}

function toggleEarned(id, on) {
  if (on) state.earned.add(id);
  else state.earned.delete(id);
  saveProgress();
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
  renderNextup();
}

function setCount(id, value) {
  const t = state.byId.get(id);
  if (!t || !t.target) return;
  const clamped = Math.max(0, Math.min(t.target, Math.round(value) || 0));
  state.counts[id] = clamped;
  saveProgress();
  renderDetail();
  renderNextup();
}

function exportProgress() {
  const payload = {
    app: "leonida-trophy-atlas",
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
    counts: state.counts,
    notes: state.notes,
  };
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  a.download = "leonida-atlas-progress.json";
  // The link must be in the document for the download to fire in headless
  // browsers; it is removed right after the click.
  document.body.append(a);
  a.click();
  a.remove();
  // Revoke only after the download has had a moment to start: revoking
  // the blob URL in the same tick can cancel the download in headless Chrome.
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try {
      data = JSON.parse(String(reader.result));
    } catch {
      alert("That file is not valid JSON.");
      return;
    }
    if (!data || !Array.isArray(data.earned) || data.earned.some((id) => typeof id !== "number" || id < 1 || id > 55)) {
      alert("That file is not a Leonida Atlas progress export.");
      return;
    }
    if (!confirm("Replace your current progress with the imported file?")) return;
    state.earned = new Set(data.earned);
    // Keep only sane values: counts must be numbers on real trophies, notes
    // must be short strings. Anything else in the file is dropped.
    const counts = {};
    if (data.counts && typeof data.counts === "object") {
      for (const [key, value] of Object.entries(data.counts)) {
        const id = Number(key);
        if (Number.isInteger(id) && id >= 1 && id <= 55 && typeof value === "number" && value >= 0) {
          counts[id] = value;
        }
      }
    }
    const notes = {};
    if (data.notes && typeof data.notes === "object") {
      for (const [key, value] of Object.entries(data.notes)) {
        const id = Number(key);
        if (Number.isInteger(id) && id >= 1 && id <= 55 && typeof value === "string" && value.length <= 2000) {
          notes[id] = value;
        }
      }
    }
    state.counts = counts;
    state.notes = notes;
    saveProgress();
    renderAll();
  };
  reader.readAsText(file);
}

function bindEvents() {
  for (const btn of document.querySelectorAll(".tab")) {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  }
  $("search").addEventListener("input", (e) => {
    state.search = e.target.value;
    renderList();
  });
  $("kindFilter").addEventListener("change", (e) => {
    state.kind = e.target.value;
    renderList();
  });
  $("gradeFilter").addEventListener("change", (e) => {
    state.grade = e.target.value;
    renderList();
  });
  $("earnedFilter").addEventListener("change", (e) => {
    state.earnedFilter = e.target.value;
    renderList();
  });
  $("spoilerToggle").addEventListener("change", (e) => {
    state.spoiler = e.target.checked;
    saveProgress();
    renderAll();
  });
  $("themeToggle").addEventListener("change", (e) => {
    state.dark = e.target.checked;
    document.documentElement.dataset.theme = state.dark ? "dark" : "light";
    saveProgress();
  });
  $("exportBtn").addEventListener("click", exportProgress);
  $("importFile").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) importProgress(file);
    e.target.value = "";
  });
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) return;
    if (e.key === "/") {
      e.preventDefault();
      $("search").focus();
      return;
    }
    if (e.key !== "j" && e.key !== "k" && e.key !== " ") return;
    const shown = visibleTrophies();
    if (!shown.length) return;
    let at = shown.findIndex((t) => t.id === state.selectedId);
    if (e.key === "j") at = Math.min(shown.length - 1, at + 1);
    if (e.key === "k") at = Math.max(0, at - 1);
    if (e.key === " ") {
      e.preventDefault();
      const t = shown[Math.max(0, at)];
      toggleEarned(t.id, !state.earned.has(t.id));
      return;
    }
    selectTrophy(shown[Math.max(0, at)].id);
  });
}

async function init() {
  loadState();
  const res = await fetch(DATA_URL);
  state.data = await res.json();
  for (const t of state.data.trophies) state.byId.set(t.id, t);
  document.documentElement.dataset.theme = state.dark ? "dark" : "light";
  $("spoilerToggle").checked = state.spoiler;
  $("themeToggle").checked = state.dark;
  const params = new URLSearchParams(location.search);
  const picked = Number(params.get("t"));
  if (picked >= 1 && picked <= 55) state.selectedId = picked;
  const hash = (location.hash || "#checklist").slice(1);
  const view = ["checklist", "roadmap", "missables", "nextup"].includes(hash) ? hash : "checklist";
  bindEvents();
  showView(view);
  renderAll();
}

init();
