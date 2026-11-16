'use strict';

/* ---------- utilities ---------- */
const KEY = 'skiprep.v1';
const $ = (s, r = document) => r.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => isoOf(new Date());
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return isoOf(d); };
const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
const fmtDate = (s, opts = { weekday: 'short', day: 'numeric', month: 'short' }) => parseISO(s).toLocaleDateString(undefined, opts);
const mmss = secs => { secs = Math.max(0, Math.ceil(secs)); return `${Math.floor(secs / 60)}:${pad(secs % 60)}`; };
const minLabel = m => (m % 1 ? `${Math.floor(m)}:${pad(Math.round((m % 1) * 60))}` : `${m}`) + ' min';

/* ---------- state ---------- */
function fresh() {
  return { start: todayISO(), unit: 'kg', rest: 75, voice: true, done: {}, rounds: {}, weights: {},
    ladder: { rung: 0, log: [], pending: null }, timer: null };
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s === 'object') return Object.assign(fresh(), s, { ladder: Object.assign(fresh().ladder, s.ladder) });
  } catch (e) { /* storage unavailable */ }
  return fresh();
}
let S = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

/* ---------- plan helpers ---------- */
const N_DAYS = DAYS.length;
const dateOf = n => addDays(S.start, n - 1);
const currentDay = () => diffDays(S.start, todayISO()) + 1;
const clampDay = n => Math.min(N_DAYS, Math.max(1, n));

function rungSegments(r, withWarm = true) {
  const R = LADDER[r];
  const segs = [];
  if (withWarm) segs.push({ type: 'walk', secs: WARMUP_MIN * 60, label: 'Warm-up walk' });
  for (let i = 0; i < R.reps; i++) {
    segs.push({ type: 'run', secs: R.run * 60, label: `Run ${i + 1} of ${R.reps}` });
    if (R.walk && i < R.reps - 1) segs.push({ type: 'walk', secs: R.walk * 60, label: 'Walk' });
  }
  if (withWarm) segs.push({ type: 'walk', secs: COOLDOWN_MIN * 60, label: 'Cool-down walk' });
  return segs;
}
function rungLabel(r) {
  const R = LADDER[r];
  if (!R.walk || R.reps === 1) return `${R.run} min easy run`;
  return `${R.reps} × ${minLabel(R.run)} run / ${minLabel(R.walk)} walk`;
}
const rungRunMins = r => LADDER[r].run * LADDER[r].reps;
const logFor = n => S.ladder.log.find(l => l.day === n);
const rungFor = n => (logFor(n) ? logFor(n).rung : S.ladder.rung);

function dayItems(n) {
  const d = DAYS[n - 1];
  const items = [];
  const m = MORNING[d.morning];
  items.push({ id: 'morning', when: 'Morning', title: m.title, meta: `${m.mins} min`, detail: m.detail });
  if (d.main === 'liftA' || d.main === 'liftB') {
    const L = LIFTS[d.main];
    items.push({ id: 'main', when: 'Workout', kind: 'lift', lift: d.main, title: `${L.name} · ${L.focus}`, meta: `~${L.mins} min` });
  } else if (d.main === 'run') {
    const r = rungFor(n);
    items.push({ id: 'main', when: 'Workout', kind: 'run', title: `Walk–run · Rung ${r + 1}`, meta: `${rungSegments(r).reduce((a, s) => a + s.secs, 0) / 60} min`, detail: rungLabel(r) });
  } else if (d.main === 'tennis') {
    items.push({ id: 'main', when: 'Workout', kind: 'tennis', title: d.easy ? 'Easy tennis' : TENNIS.title, detail: d.easy ? TENNIS.easyDetail : TENNIS.detail });
  }
  if (d.evening) {
    const e = EVENING[d.evening];
    items.push({ id: 'evening', when: 'Evening', title: e.title, meta: `${e.mins} min`, detail: e.detail });
  }
  return items;
}
function dayLabel(n) {
  const d = DAYS[n - 1];
  if (d.main === 'liftA') return { t: 'Lift A', c: 'lift' };
  if (d.main === 'liftB') return { t: d.taper ? 'Lift B · 80%' : 'Lift B', c: d.taper ? 'taper' : 'lift' };
  if (d.main === 'run') return { t: d.easy ? 'Easy walk–run' : 'Walk–run', c: 'run' };
  if (d.main === 'tennis') return { t: d.easy ? 'Easy tennis' : 'Tennis', c: 'tennis' };
  return { t: 'Rest + evening', c: '' };
}
function dayProgress(n) {
  const items = dayItems(n);
  const done = items.filter(i => S.done[`${n}:${i.id}`]).length;
  return { done, total: items.length };
}
function totalProgress() {
  let done = 0, total = 0;
  for (let n = 1; n <= N_DAYS; n++) { const p = dayProgress(n); done += p.done; total += p.total; }
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

/* ---------- rendering ---------- */
const view = $('#view');

function progressCard() {
  const p = totalProgress();
  return `<div class="card">
    <div class="prog-line"><span class="muted small">${p.done} of ${p.total} done</span><strong>${p.pct}%</strong></div>
    <div class="bar"><i style="width:${p.pct}%"></i></div>
  </div>`;
}

function pendingBanner() {
  const p = S.ladder.pending;
  if (!p) return '';
  const l = S.ladder.log[p.idx];
  if (todayISO() <= p.date) {
    return `<div class="banner small"><h3>Morning check tomorrow</h3>
      <p>Your Rung ${l.rung + 1} run felt easy and pain-free. Tomorrow morning, tell the app whether anything aches, and it will decide whether you move up.</p></div>`;
  }
  return `<div class="banner"><h3>Morning check</h3>
    <p class="small">Does anything ache after your last run (Rung ${l.rung + 1}, ${fmtDate(l.date)})?</p>
    <div class="row wrap">
      <button class="btn primary" data-act="ache" data-v="no">No aches</button>
      <button class="btn" data-act="ache" data-v="yes">Something aches</button>
    </div></div>`;
}

function liftBlock(n, liftKey) {
  const L = LIFTS[liftKey];
  const d = DAYS[n - 1];
  // reference day for weight suggestions: the same lift one week earlier
  const prev = n > 7 ? n - 7 : null;
  const unit = S.unit;
  let html = `<p class="detail"><b>Warm-up:</b> ${L.warmup}</p>`;
  for (const ss of L.supersets) {
    const rk = `${n}:${ss.key}`;
    const count = S.rounds[rk] || 0;
    html += `<div class="superset"><div class="ss-head"><b>Superset ${ss.key}</b><span class="tiny muted">${ss.sets} rounds · rest ${S.rest} s</span></div>`;
    for (const ex of ss.ex) {
      const wk = `${n}:${ex.id}`;
      let ph = unit;
      if (ex.load && prev) {
        const pw = parseFloat(S.weights[`${prev}:${ex.id}`]);
        if (!isNaN(pw)) ph = d.taper ? `~${Math.round(pw * 0.8 * 2) / 2}` : `${pw}`;
      }
      html += `<div class="ex"><span class="tag">${ex.id}</span>
        <div><div class="name">${ex.name}</div><div class="reps">${ex.reps}</div></div>
        ${ex.load ? `<input class="wt" inputmode="decimal" aria-label="${ex.name} weight (${unit})" placeholder="${ph}" data-act="weight" data-key="${wk}" value="${S.weights[wk] ?? ''}">` : '<span></span>'}
      </div>`;
    }
    html += `<div class="rounds" role="group" aria-label="Superset ${ss.key} rounds">`;
    for (let i = 0; i < ss.sets; i++) {
      const cls = i < count ? 'on' : i === count ? 'next' : '';
      html += `<button class="dot ${cls}" data-act="round" data-key="${rk}" data-i="${i}" data-sets="${ss.sets}" data-day="${n}" aria-label="Round ${i + 1}${i < count ? ' done' : ''}">${i < count ? '✓' : i + 1}</button>`;
    }
    html += `<span class="tiny muted">Tap when a round is done</span></div></div>`;
  }
  if (d.taper) html += `<p class="tiny muted" style="margin-top:8px">Placeholders show ~80% of what you logged on Day ${prev}.</p>`;
  html += `<ul class="cues">${FORM_CUES.map(c => `<li>${c}</li>`).join('')}</ul>`;
  return html;
}

function runBlock(n) {
  const r = rungFor(n);
  const log = logFor(n);
  let html = `<div style="margin-top:10px">${segBar(rungSegments(r))}</div>`;
  if (log) {
    const res = log.result === 'up' ? 'Moved up a rung' : log.result === 'repeat' ? 'Repeat this rung next time' : 'Waiting on morning check';
    html += `<p class="small" style="margin-top:10px"><b>Logged:</b> ${log.easy ? 'felt easy' : 'felt hard'}, ${log.hurt ? 'something hurt' : 'nothing hurt'}. ${res}.</p>`;
    html += `<button class="btn block" style="margin-top:10px" data-act="startrun" data-day="${n}">Run it again</button>`;
  } else {
    html += `<button class="btn run block" style="margin-top:12px" data-act="startrun" data-day="${n}">▶ Start walk–run timer</button>`;
    html += `<button class="btn ghost block small" style="margin-top:6px" data-act="checkin" data-day="${n}">Done it without the timer? Log it</button>`;
  }
  return html;
}

function segBar(segs) {
  return `<div class="segs" aria-hidden="true">${segs.map(s => `<i class="${s.type === 'run' ? 'r' : 'w'}" style="flex:${s.secs}"></i>`).join('')}</div>`;
}

function renderDay(n, isToday) {
  const d = DAYS[n - 1];
  const items = dayItems(n);
  const p = dayProgress(n);
  const lbl = dayLabel(n);
  let html = `<div class="stack">`;
  if (isToday) html += pendingBanner();
  html += `<div class="dayhead">
    <div><div class="eyebrow">${isToday ? 'Today · ' : ''}${fmtDate(dateOf(n), { weekday: 'long', day: 'numeric', month: 'short' })}</div>
    <h2>Day ${n}</h2><div class="row" style="margin-top:6px"><span class="chip ${lbl.c}">${lbl.t}</span><span class="tiny muted">${p.done}/${p.total} done</span></div></div>
    <div class="daynav"><a href="#day/${n - 1}" aria-label="Previous day" aria-disabled="${n === 1}">‹</a><a href="#day/${n + 1}" aria-label="Next day" aria-disabled="${n === N_DAYS}">›</a></div>
  </div>`;
  if (d.note) html += `<div class="note">${d.note}</div>`;
  html += `<ol class="items">`;
  for (const it of items) {
    const key = `${n}:${it.id}`;
    const done = !!S.done[key];
    html += `<li class="card item ${done ? 'done' : ''}">
      <button class="check" data-act="toggle" data-key="${key}" aria-pressed="${done}" aria-label="Mark ${it.title} done">✓</button>
      <div><div class="when">${it.when}${it.meta ? ` · ${it.meta}` : ''}</div><h3>${it.title}</h3>
      ${it.detail ? `<p class="detail">${it.detail}</p>` : ''}
      ${it.kind === 'lift' ? liftBlock(n, it.lift) : ''}
      ${it.kind === 'run' ? runBlock(n) : ''}
      </div></li>`;
  }
  html += `</ol></div>`;
  return html;
}

function renderToday() {
  const c = currentDay();
  if (c < 1) {
    return `<div class="stack">${progressCard()}<div class="card empty"><h2>Starts in ${1 - c} day${c === 0 ? '' : 's'}</h2>
      <p class="muted">Day 1 is ${fmtDate(S.start, { weekday: 'long', day: 'numeric', month: 'long' })}. You can change the start date in settings.</p>
      <p style="margin-top:14px"><a class="btn" href="#day/1">Preview Day 1</a></p></div></div>`;
  }
  if (c > N_DAYS) {
    const p = totalProgress();
    return `<div class="stack">${pendingBanner()}${progressCard()}<div class="card empty"><h2>First tracks ⛷</h2>
      <p class="muted">The 14 days are over. You finished ${p.done} of ${p.total} sessions. Have a great trip.</p>
      <p style="margin-top:14px"><button class="btn" data-act="settings">Start a new block</button></p></div></div>`;
  }
  return progressCard() + `<div style="height:14px"></div>` + renderDay(c, true);
}

function renderPlan() {
  const c = currentDay();
  let html = `<div class="stack">${progressCard()}`;
  for (let w = 0; w < 2; w++) {
    html += `<div class="week"><h3>Week ${w + 1}</h3><div class="grid">`;
    for (let n = w * 7 + 1; n <= Math.min(N_DAYS, w * 7 + 7); n++) {
      const p = dayProgress(n);
      const l = dayLabel(n);
      html += `<a class="dcard ${n === c ? 'today' : ''} ${p.done === p.total ? 'complete' : ''}" href="#day/${n}">
        <div class="d">${fmtDate(dateOf(n))}</div><div class="t">Day ${n}</div>
        <div class="row between"><span class="chip ${l.c}">${l.t}</span>
        <span class="pips">${Array.from({ length: p.total }, (_, i) => `<i class="${i < p.done ? 'on' : ''}"></i>`).join('')}</span></div></a>`;
    }
    html += `</div></div>`;
  }
  return html + `</div>`;
}

function renderLadder() {
  const cur = S.ladder.rung;
  let html = `<div class="stack">${pendingBanner()}<div class="card">
    <h2 style="font-size:20px;margin-bottom:6px">Walk–run ladder</h2>
    <p class="small muted">Move up a rung only if the last run felt easy, nothing hurt during it, and nothing ached the next morning. Otherwise repeat the rung. Repeating is normal, not a setback.</p>
    <div class="legend" style="margin:12px 0 4px"><span class="lr">Run</span><span class="lw">Walk</span><span>+ ${WARMUP_MIN} min walk either end</span></div>`;
  LADDER.forEach((_, r) => {
    const cls = r === cur ? 'current' : r < cur ? 'passed' : '';
    html += `<div class="rung ${cls}"><span class="n">${r < cur ? '✓' : r + 1}</span>
      <div><div class="lbl"><span>${rungLabel(r)}</span><span class="muted tiny">${rungRunMins(r)} min running</span></div>${segBar(rungSegments(r, false))}</div></div>`;
  });
  html += `<div class="row between" style="margin-top:12px"><span class="small muted">Adjust current rung</span>
    <div class="stepper"><button class="btn" data-act="rung" data-v="-1" aria-label="Down a rung" ${cur === 0 ? 'disabled' : ''}>−</button>
    <button class="btn" data-act="rung" data-v="1" aria-label="Up a rung" ${cur === LADDER.length - 1 ? 'disabled' : ''}>+</button></div></div></div>`;

  const log = S.ladder.log;
  html += `<div class="card"><h3 style="margin-bottom:6px">Run log</h3>`;
  if (!log.length) html += `<p class="small muted">No runs yet. Your first one is on Day 2.</p>`;
  else {
    html += `<ul class="log">${log.slice().reverse().map(l => {
      const res = l.result === 'up' ? '↑ moved up' : l.result === 'repeat' ? '↻ repeat' : '… morning check';
      return `<li><span>Day ${l.day} · Rung ${l.rung + 1}</span><span class="muted">${res}</span></li>`;
    }).join('')}</ul>`;
  }
  return html + `</div></div>`;
}

function renderGuide() {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  let html = `<div class="stack"><div class="card guide">
    <p class="muted small" style="margin-bottom:14px">Morning yoga and Pilates every day, two single-leg lift days with supersets, a walk–run return that builds every session, and evening yoga or Pilates on rest days.</p>
    ${GUIDE.map(g => `<section><h3>${g.h}</h3><p class="small">${g.p}</p></section>`).join('')}
    <section><h3>Form cues</h3><ul class="cues" style="margin-top:4px">${FORM_CUES.map(c => `<li>${c}</li>`).join('')}</ul></section>
  </div>`;
  if (!standalone) {
    html += `<div class="card"><h3 style="margin-bottom:6px">Install on your phone</h3>
      <p class="small muted">iPhone: open this page in Safari, tap Share, then <b>Add to Home Screen</b>. Android: use the browser menu’s <b>Install app</b>. It then works offline and opens full screen.</p>
      ${deferredInstall ? '<button class="btn primary" style="margin-top:10px" data-act="install">Install app</button>' : ''}</div>`;
  }
  return html + `</div>`;
}

function route() {
  const h = location.hash.replace('#', '') || 'today';
  let tab = h.split('/')[0];
  let html;
  if (tab === 'day') {
    const n = clampDay(parseInt(h.split('/')[1], 10) || 1);
    html = renderDay(n, n === currentDay());
    tab = 'plan';
  } else if (tab === 'plan') html = renderPlan();
  else if (tab === 'ladder') html = renderLadder();
  else if (tab === 'guide') html = renderGuide();
  else { tab = 'today'; html = renderToday(); }
  view.innerHTML = html;
  document.querySelectorAll('.tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
}
function rerender() { const y = scrollY; route(); scrollTo(0, y); }

/* ---------- audio / haptics ---------- */
let audioCtx = null;
function ensureAudio() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) { /* no audio */ }
}
function beep(freq = 880, count = 1, dur = 0.16) {
  if (!audioCtx) return;
  for (let i = 0; i < count; i++) {
    const t = audioCtx.currentTime + i * (dur + 0.08);
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = freq; o.type = 'sine';
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(audioCtx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
}
const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* ignore */ } };
function say(text) {
  if (!S.voice || !('speechSynthesis' in window)) return;
  try { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } catch (e) { /* ignore */ }
}

/* ---------- rest timer ---------- */
const restEl = $('#rest');
let restEnd = 0, restTick = null;
function startRest(secs = S.rest) {
  ensureAudio();
  restEnd = Date.now() + secs * 1000;
  restEl.hidden = false;
  restEl.classList.remove('go');
  clearInterval(restTick);
  drawRest();
  restTick = setInterval(drawRest, 250);
}
function drawRest() {
  const left = (restEnd - Date.now()) / 1000;
  if (left <= 0) {
    clearInterval(restTick);
    restEl.classList.add('go');
    restEl.innerHTML = `<span>Go — next round</span><button data-act="restclose">✕</button>`;
    beep(988, 3); buzz([200, 100, 200]);
    setTimeout(() => { if (restEl.classList.contains('go')) restEl.hidden = true; }, 4000);
    return;
  }
  restEl.innerHTML = `<span>Rest</span><span class="clock">${mmss(left)}</span><button data-act="restadd">+15</button><button data-act="restclose" aria-label="Stop rest timer">✕</button>`;
}

/* ---------- walk–run timer ---------- */
const runEl = $('#runner');
let runTick = null, lastSeg = -1, wakeLock = null;

async function keepAwake() {
  try { if ('wakeLock' in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); } } catch (e) { /* ignore */ }
}
function releaseAwake() { try { wakeLock && wakeLock.release(); } catch (e) { /* ignore */ } wakeLock = null; }

function startRun(day) {
  ensureAudio();
  S.timer = { day, rung: rungFor(day), startedAt: Date.now(), pausedAt: null, pausedMs: 0 };
  save();
  openRunner(true);
}
function openRunner(fresh) {
  if (!S.timer) return;
  lastSeg = fresh ? -1 : currentSegIndex();
  runEl.hidden = false;
  document.body.style.overflow = 'hidden';
  keepAwake();
  clearInterval(runTick);
  drawRun();
  runTick = setInterval(drawRun, 250);
}
function runElapsed() {
  const t = S.timer;
  return ((t.pausedAt || Date.now()) - t.startedAt - t.pausedMs) / 1000;
}
function currentSegIndex() {
  const segs = rungSegments(S.timer.rung);
  let e = runElapsed();
  for (let i = 0; i < segs.length; i++) { if (e < segs[i].secs) return i; e -= segs[i].secs; }
  return segs.length;
}
function drawRun() {
  const t = S.timer;
  if (!t) return;
  const segs = rungSegments(t.rung);
  const total = segs.reduce((a, s) => a + s.secs, 0);
  const el = Math.min(runElapsed(), total);
  let acc = 0, idx = segs.length, into = 0;
  for (let i = 0; i < segs.length; i++) { if (el < acc + segs[i].secs) { idx = i; into = el - acc; break; } acc += segs[i].secs; }

  if (idx !== lastSeg) {
    if (idx >= segs.length) { beep(1046, 3, 0.22); buzz([300, 120, 300, 120, 300]); say('Done. Nice work.'); }
    else if (lastSeg !== -1 || idx === 0) {
      const s = segs[idx];
      if (s.type === 'run') { beep(988, 2); buzz([250, 100, 250]); say(`Run, ${Math.round(s.secs / 60)} minutes`); }
      else { beep(587, 1, 0.3); buzz(400); say(s.label === 'Cool-down walk' ? 'Cool down walk' : idx === 0 ? 'Warm up walk' : 'Walk'); }
    }
    lastSeg = idx;
  }

  if (idx >= segs.length) {
    clearInterval(runTick);
    runEl.className = 'runner done';
    runEl.innerHTML = `<div class="top-row"><span>Day ${t.day} · Rung ${t.rung + 1}</span></div>
      <div class="center"><div class="phase">Done</div><div class="clock" style="font-size:72px">${mmss(total)}</div><div class="next">Nice work. Two quick questions.</div></div>
      <div class="ctrls" style="grid-template-columns:1fr"><button class="main" data-act="finishrun">Log this run</button></div>`;
    return;
  }
  const s = segs[idx];
  const next = segs[idx + 1];
  runEl.className = `runner ${s.type}`;
  runEl.innerHTML = `<div class="top-row"><span>Day ${t.day} · Rung ${t.rung + 1}</span><span>${s.label}</span></div>
    <div class="center">
      <div class="phase">${t.pausedAt ? 'Paused' : s.type === 'run' ? 'Run' : 'Walk'}</div>
      <div class="clock">${mmss(s.secs - into)}</div>
      <div class="next">${next ? `Next: ${next.type} ${mmss(next.secs)}` : 'Last one'}</div>
    </div>
    <div class="seg-track">${segs.map((g, i) => `<i class="${g.type === 'run' ? 'r' : ''}" style="flex:${g.secs}"><b style="width:${i < idx ? 100 : i === idx ? (into / g.secs) * 100 : 0}%"></b></i>`).join('')}</div>
    <div class="meta"><span>${mmss(el)} elapsed</span><span>${mmss(total - el)} left</span></div>
    <div class="ctrls">
      <button data-act="runend">End</button>
      <button class="main" data-act="runpause">${t.pausedAt ? 'Resume' : 'Pause'}</button>
      <button data-act="runskip">Skip ›</button>
    </div>`;
}
function closeRunner() {
  clearInterval(runTick);
  runEl.hidden = true;
  document.body.style.overflow = '';
  releaseAwake();
}

/* ---------- sheets ---------- */
const sheetEl = $('#sheet');
function openSheet(html) { sheetEl.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`; sheetEl.hidden = false; }
function closeSheet() { sheetEl.hidden = true; sheetEl.innerHTML = ''; }

let checkin = null;
function openCheckin(day) {
  checkin = { day, rung: S.timer && S.timer.day === day ? S.timer.rung : rungFor(day), easy: null, hurt: null };
  drawCheckin();
}
function drawCheckin() {
  const c = checkin;
  const b = (k, v, t) => `<button data-act="ci" data-k="${k}" data-v="${v}" aria-pressed="${c[k] === v}">${t}</button>`;
  openSheet(`<h2>How was Rung ${c.rung + 1}?</h2>
    <div class="q"><p>Did the run feel easy?</p><div class="seg">${b('easy', true, 'Yes, easy')}${b('easy', false, 'No, it was hard')}</div></div>
    <div class="q"><p>Did anything hurt during it?</p><div class="seg">${b('hurt', false, 'Nothing hurt')}${b('hurt', true, 'Something hurt')}</div></div>
    <p class="small muted" style="margin:12px 0">The third check, aches the next morning, will show up on tomorrow’s Today screen.</p>
    <div class="row"><button class="btn ghost" data-act="sheetclose">Cancel</button>
    <button class="btn primary" style="flex:1" data-act="cisave" ${c.easy === null || c.hurt === null ? 'disabled' : ''}>Save</button></div>`);
}
function saveCheckin() {
  const c = checkin;
  S.ladder.log = S.ladder.log.filter(l => l.day !== c.day);
  if (S.ladder.pending) S.ladder.pending = null;
  const entry = { day: c.day, date: todayISO(), rung: c.rung, easy: c.easy, hurt: c.hurt, result: null };
  S.ladder.log.push(entry);
  S.ladder.log.sort((a, b) => a.day - b.day);
  const idx = S.ladder.log.indexOf(entry);
  if (c.easy && !c.hurt && !DAYS[c.day - 1].easy) S.ladder.pending = { date: todayISO(), idx };
  else entry.result = 'repeat';
  S.ladder.rung = c.rung;
  S.done[`${c.day}:main`] = true;
  S.timer = null;
  save();
  closeSheet(); closeRunner(); rerender();
}

function openSettings() {
  openSheet(`<h2>Settings</h2>
    <label class="field"><span>Day 1 date</span><input type="date" data-set="start" value="${S.start}"></label>
    <label class="field"><span>Weight unit</span><select data-set="unit"><option ${S.unit === 'kg' ? 'selected' : ''}>kg</option><option ${S.unit === 'lb' ? 'selected' : ''}>lb</option></select></label>
    <label class="field"><span>Superset rest</span><select data-set="rest">${[60, 75, 90].map(v => `<option value="${v}" ${S.rest === v ? 'selected' : ''}>${v} s</option>`).join('')}</select></label>
    <label class="field"><span>Spoken run/walk cues</span><input type="checkbox" data-set="voice" ${S.voice ? 'checked' : ''} style="width:22px;height:22px"></label>
    <div class="field"><span>Back up progress</span><button class="btn" data-act="export">Export</button></div>
    <label class="field"><span>Restore from backup</span><input type="file" accept="application/json" data-act="import" style="max-width:180px"></label>
    <div class="field" style="border:0"><span>Clear everything</span><button class="btn" data-act="reset" style="color:var(--run)">Reset</button></div>
    <button class="btn primary block" style="margin-top:8px" data-act="sheetclose">Done</button>`);
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (!t) { if (e.target === sheetEl) closeSheet(); return; }
  const a = t.dataset.act;
  switch (a) {
    case 'toggle': {
      const k = t.dataset.key;
      S.done[k] = !S.done[k];
      if (S.done[k]) buzz(15);
      save(); rerender(); break;
    }
    case 'round': {
      const k = t.dataset.key, i = +t.dataset.i, n = +t.dataset.day;
      const count = S.rounds[k] || 0;
      if (i < count) S.rounds[k] = i;
      else {
        S.rounds[k] = i + 1;
        const L = LIFTS[DAYS[n - 1].main];
        const all = L.supersets.every(ss => (S.rounds[`${n}:${ss.key}`] || 0) >= ss.sets);
        if (all) { S.done[`${n}:main`] = true; restEl.hidden = true; clearInterval(restTick); beep(1046, 2); }
        else startRest();
      }
      save(); rerender(); break;
    }
    case 'restadd': restEnd += 15000; drawRest(); break;
    case 'restclose': clearInterval(restTick); restEl.hidden = true; break;
    case 'startrun': startRun(+t.dataset.day); break;
    case 'runpause': {
      const tm = S.timer;
      if (tm.pausedAt) { tm.pausedMs += Date.now() - tm.pausedAt; tm.pausedAt = null; ensureAudio(); }
      else tm.pausedAt = Date.now();
      save(); drawRun(); break;
    }
    case 'runskip': {
      const segs = rungSegments(S.timer.rung);
      const idx = currentSegIndex();
      const end = segs.slice(0, idx + 1).reduce((x, s) => x + s.secs, 0);
      S.timer.pausedMs -= (end - runElapsed()) * 1000;
      save(); drawRun(); break;
    }
    case 'runend':
      if (confirm('End this run? You can still log it.')) { S.timer.pausedAt = S.timer.pausedAt || Date.now(); save(); closeRunner(); openCheckin(S.timer.day); }
      break;
    case 'finishrun': openCheckin(S.timer.day); break;
    case 'checkin': openCheckin(+t.dataset.day); break;
    case 'ci': checkin[t.dataset.k] = t.dataset.v === 'true'; drawCheckin(); break;
    case 'cisave': saveCheckin(); break;
    case 'ache': {
      const p = S.ladder.pending;
      const l = S.ladder.log[p.idx];
      l.ache = t.dataset.v === 'yes';
      if (l.ache) l.result = 'repeat';
      else { l.result = 'up'; S.ladder.rung = Math.min(LADDER.length - 1, l.rung + 1); }
      S.ladder.pending = null;
      save(); rerender(); break;
    }
    case 'rung': S.ladder.rung = Math.min(LADDER.length - 1, Math.max(0, S.ladder.rung + +t.dataset.v)); save(); rerender(); break;
    case 'settings': openSettings(); break;
    case 'sheetclose':
      closeSheet();
      if (S.timer && checkin && runEl.hidden) { /* cancelled check-in: discard timer */ S.timer = null; save(); }
      rerender(); break;
    case 'export': {
      const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement('a'), { href: url, download: `ski-prep-${todayISO()}.json` });
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      break;
    }
    case 'reset':
      if (confirm('Clear all progress, weights and run logs? This cannot be undone.')) { S = fresh(); save(); closeSheet(); route(); }
      break;
    case 'install':
      if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; }
      break;
  }
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.act === 'weight') { const v = t.value.trim(); if (v) S.weights[t.dataset.key] = v; else delete S.weights[t.dataset.key]; save(); }
  else if (t.dataset.act === 'import' && t.files[0]) {
    t.files[0].text().then(txt => {
      const data = JSON.parse(txt);
      if (!data || !data.ladder) throw new Error('bad');
      S = Object.assign(fresh(), data); save(); closeSheet(); route();
    }).catch(() => alert('That file doesn’t look like a Ski Prep backup.'));
  } else if (t.dataset.set) {
    const k = t.dataset.set;
    if (k === 'start' && t.value) S.start = t.value;
    else if (k === 'unit') S.unit = t.value;
    else if (k === 'rest') S.rest = +t.value;
    else if (k === 'voice') S.voice = t.checked;
    save(); rerender();
  }
});

document.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheetEl.hidden) closeSheet(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if (!runEl.hidden) { keepAwake(); drawRun(); }
    rerender(); // day may have rolled over
  }
});
addEventListener('hashchange', () => { route(); scrollTo(0, 0); });

let deferredInstall = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });

/* ---------- boot ---------- */
route();
if (S.timer) openRunner(false);
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
