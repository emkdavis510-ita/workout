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
const fm = m => (m % 1 ? `${Math.floor(m)}:30` : `${m}:00`);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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
const phaseOf = n => (n <= 7 ? 'Week 1 · Build' : n <= 11 ? 'Week 2 · Sharpen' : 'Week 2 · Taper');

const rungDef = r => (r === 'shakeout' ? SHAKEOUT : LADDER[r]);
const rungName = r => (r === 'shakeout' ? 'Run 4 · Shake-out' : `Run ${r + 1}`);
function rungSegments(r, withWarm = true) {
  const [run, walk, reps] = rungDef(r);
  const segs = [];
  if (withWarm) segs.push({ type: 'walk', secs: WARMUP_MIN * 60, label: 'Warm-up walk' });
  for (let i = 0; i < reps; i++) {
    segs.push({ type: 'run', secs: run * 60, label: `Run ${i + 1} of ${reps}` });
    if (i < reps - 1) segs.push({ type: 'walk', secs: walk * 60, label: 'Walk' });
  }
  if (withWarm) segs.push({ type: 'walk', secs: COOLDOWN_MIN * 60, label: 'Cool-down walk' });
  return segs;
}
const rungMins = r => Math.round(rungSegments(r).reduce((a, s) => a + s.secs, 0) / 60);
const logFor = n => S.ladder.log.find(l => l.day === n);
function runRungFor(n, planned) {
  const log = logFor(n);
  if (log) return log.rung;
  if (planned === 'shakeout') return 'shakeout';
  return Math.min(planned, S.ladder.rung);
}

function blocks(n) {
  const d = DAYS[n - 1];
  const out = [{ key: `${n}:am`, slot: 'am', sess: d.am }];
  for (const m of d.main) {
    if (typeof m === 'string') out.push({ key: `${n}:${m}`, slot: 'main', sess: m });
    else if ('run' in m) out.push({ key: `${n}:run`, slot: 'main', run: runRungFor(n, m.run), planned: m.run });
    else out.push({ key: `${n}:tennis`, slot: 'main', tennis: m });
  }
  if (d.pm) out.push({ key: `${n}:pm`, slot: 'pm', sess: d.pm });
  return out;
}
function dayKind(n) {
  const main = DAYS[n - 1].main;
  if (main.some(m => typeof m === 'string' && SESS[m].lift)) return SESS[main[0]].taper ? 'taper' : 'lift';
  if (main.some(m => typeof m === 'object' && 'run' in m)) return 'run';
  if (main.some(m => typeof m === 'object' && m.tennis)) return 'tennis';
  return 'rest';
}
function dayProgress(n) {
  const b = blocks(n);
  return { done: b.filter(x => S.done[x.key]).length, total: b.length };
}
function totalProgress() {
  let done = 0, total = 0;
  for (let n = 1; n <= N_DAYS; n++) { const p = dayProgress(n); done += p.done; total += p.total; }
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}
function liftGroups(s) {
  const g = [];
  for (const e of s.ex) {
    const k = e[0] === 'Fin' ? 'Fin' : e[0][0];
    let G = g.find(x => x.k === k);
    if (!G) { G = { k, ex: [], sets: parseInt(e[2], 10) || 1 }; g.push(G); }
    G.ex.push(e);
  }
  return g;
}

// Carry over ticks saved by the first version of the app.
(function migrate() {
  for (const k of Object.keys(S.done)) {
    const m = k.match(/^(\d+):(morning|main|evening)$/);
    if (!m) continue;
    const n = +m[1];
    const nk = m[2] === 'morning' ? `${n}:am` : m[2] === 'evening' ? `${n}:pm` : (blocks(n).find(b => b.slot === 'main') || {}).key;
    if (nk && S.done[k] && n <= N_DAYS) S.done[nk] = true;
    delete S.done[k];
  }
  if (typeof S.ladder.rung !== 'number' || S.ladder.rung > LADDER.length - 1) S.ladder.rung = Math.min(LADDER.length - 1, S.ladder.rung | 0);
  save();
})();

/* ---------- rendering ---------- */
const view = $('#view');
const openState = {}; // remembers which session dropdowns you opened or closed

function hero(highlight) {
  const p = totalProgress();
  const W = 600, H = 190;
  const pts = DAYS.map((_, i) => { const t = i / 13; return [W * (0.06 + 0.86 * t), H * (0.16 + 0.62 * t) + Math.sin(t * 9) * H * 0.05]; });
  const fin = [W * 0.965, H * 0.9];
  const ridge = `M0,${H} L0,${H * 0.35} L${W * 0.12},${H * 0.08} L${W * 0.24},${H * 0.22} L${W * 0.38},${H * 0.02} L${W * 0.55},${H * 0.3} L${W * 0.7},${H * 0.18} L${W * 0.86},${H * 0.5} L${W},${H * 0.62} L${W},${H} Z`;
  const marks = pts.map((pt, i) => {
    const n = i + 1, pr = dayProgress(n), done = pr.done === pr.total, cur = n === highlight;
    return `<a href="#day/${n}" aria-label="Day ${n}${done ? ', done' : ''}"><circle cx="${pt[0]}" cy="${pt[1]}" r="11" fill="${done ? '#0b3d6b' : '#fff'}" stroke="${cur ? '#d7262e' : '#0b3d6b'}" stroke-width="${cur ? 4.5 : 2.5}"/>${done ? '' : `<text x="${pt[0]}" y="${pt[1] + 4}" text-anchor="middle">${n}</text>`}</a>`;
  }).join('');
  return `<section class="hero">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Progress down the mountain: ${p.done} of ${p.total} sessions done">
      <path d="${ridge}" fill="#ffffff" opacity=".96"/>
      <path d="M${W * 0.38},${H * 0.02} L${W * 0.55},${H * 0.3} L${W * 0.42},${H * 0.24} Z" fill="#c9dbec"/>
      <path d="M${W * 0.12},${H * 0.08} L${W * 0.24},${H * 0.22} L${W * 0.16},${H * 0.2} Z" fill="#c9dbec"/>
      <path d="M${pts.map(q => q.join(',')).join(' L')} L${fin.join(',')}" fill="none" stroke="#0b3d6b" stroke-width="3" stroke-dasharray="6 6" opacity=".55"/>
      ${marks}
      <rect x="${fin[0] - 9}" y="${fin[1] - 26}" width="3" height="26" fill="#0b3d6b"/><path d="M${fin[0] - 6},${fin[1] - 26} l18,6 l-18,6 Z" fill="#d7262e"/>
    </svg>
    <div class="prog"><span>${p.done} of ${p.total} sessions done</span><b>${p.pct}%</b></div>
    <div class="bar"><i style="width:${p.pct}%"></i></div>
  </section>`;
}

function pendingBanner() {
  const p = S.ladder.pending;
  if (!p) return '';
  const l = S.ladder.log[p.idx];
  if (!l) { S.ladder.pending = null; save(); return ''; }
  if (todayISO() <= p.date) {
    return `<div class="banner small"><h3>Morning check tomorrow</h3>
      <p>${rungName(l.rung)} felt easy and pain-free. Tomorrow morning, tell the app whether anything aches, and it will decide whether you move up.</p></div>`;
  }
  return `<div class="banner"><h3>Morning check</h3>
    <p class="small">Does anything ache after your last run (${rungName(l.rung)}, ${fmtDate(l.date)})?</p>
    <div class="row wrap">
      <button class="btn primary" data-act="ache" data-v="no">No aches</button>
      <button class="btn" data-act="ache" data-v="yes">Something aches</button>
    </div></div>`;
}

function exRow(name, dose, cue, label, extra = '') {
  const info = EX[name];
  return `<li class="exr">
    <div class="exh"><span class="n">${label ? `<span class="lb">${label}</span>` : ''}${esc(name)}</span><span class="s">${esc(dose)}</span></div>
    ${cue ? `<p class="c">${esc(cue)}</p>` : ''}
    ${info ? `<p class="tg"><b>Targets</b>${esc(info.m)}</p><p class="tg sk"><b>On skis</b>${esc(info.ski)}</p>` : ''}
    ${extra}
  </li>`;
}
const listBody = rows => `<ul class="exl">${rows.map(r => exRow(r[0], r[1], r[2])).join('')}</ul>`;

function liftBody(n, sk) {
  const s = SESS[sk];
  const prev = n > 7 ? n - 7 : null;
  let html = '';
  for (const G of liftGroups(s)) {
    const rk = `${n}:${G.k}`;
    const count = Math.min(S.rounds[rk] || 0, G.sets);
    html += `<div class="ss"><div class="ss-head"><b>${G.k === 'Fin' ? 'Finisher' : `Superset ${G.k}`}</b><span class="tiny muted">${G.sets} rounds${G.k === 'Fin' ? '' : ` · rest ${S.rest} s`}</span></div><ul class="exl">`;
    for (const [label, name, dose, cue, load] of G.ex) {
      let extra = '';
      if (load) {
        const wk = `${n}:${label}`;
        let ph = '';
        if (prev) {
          const pw = parseFloat(S.weights[`${prev}:${label}`]);
          if (!isNaN(pw)) ph = s.taper ? `~${Math.round(pw * 0.8 * 2) / 2}` : `${pw}`;
        }
        extra = `<label class="wtl">Weight <input class="wt" inputmode="decimal" placeholder="${ph}" data-act="weight" data-key="${wk}" value="${esc(S.weights[wk] ?? '')}" aria-label="${esc(name)} weight in ${S.unit}"> ${S.unit}${ph ? `<span class="tiny muted">${s.taper ? '80% of' : 'last week:'} Day ${prev}</span>` : ''}</label>`;
      }
      html += exRow(name, dose, cue, label, extra);
    }
    html += `</ul><div class="rounds" role="group" aria-label="${G.k} rounds">`;
    for (let i = 0; i < G.sets; i++) {
      const cls = i < count ? 'on' : i === count ? 'next' : '';
      html += `<button class="dot ${cls}" data-act="round" data-key="${rk}" data-i="${i}" data-day="${n}" data-sess="${sk}" aria-label="Round ${i + 1}${i < count ? ' done' : ''}">${i < count ? '✓' : i + 1}</button>`;
    }
    html += `<span class="tiny muted">Tap when a round is done</span></div></div>`;
  }
  html += `<ul class="cues">${FORM_CUES.map(c => `<li>${c}</li>`).join('')}</ul>`;
  return html;
}

function runBody(n, b) {
  const r = b.run;
  const [run, walk, reps] = rungDef(r);
  const log = logFor(n);
  let html = '';
  if (r !== 'shakeout' && r !== b.planned && !log) html += `<p class="note">The plan says ${rungName(b.planned)}, but the ladder has you repeating ${rungName(r)}. That’s normal.</p>`;
  html += listBody([
    ['Brisk walk warm-up', `${WARMUP_MIN} min`, ''],
    ['Intervals', `${reps} × (${fm(run)} run + ${fm(walk)} walk)`, 'Run at conversational pace. You should be able to speak in full sentences.'],
    ['Walk cool-down', `${COOLDOWN_MIN} min`, ''],
  ]);
  html += `<div class="segs" aria-hidden="true" style="margin-top:12px">${segBar(rungSegments(r))}</div>`;
  if (log) {
    const res = { up: 'Moved up a rung', repeat: 'Repeat this rung next time', done: 'Shake-out done' }[log.result] || 'Waiting on the morning check';
    html += `<p class="small" style="margin-top:10px"><b>Logged:</b> ${log.easy ? 'felt easy' : 'felt hard'}, ${log.hurt ? 'something hurt' : 'nothing hurt'}. ${res}.</p>
      <button class="btn block" style="margin-top:10px" data-act="startrun" data-day="${n}">Run it again</button>`;
  } else {
    html += `<button class="btn run block" style="margin-top:12px" data-act="startrun" data-day="${n}">▶ Start walk–run timer</button>
      <button class="btn ghost block small" style="margin-top:6px" data-act="checkin" data-day="${n}">Done it without the timer? Log it</button>`;
  }
  return html;
}
const segBar = segs => segs.map(s => `<i class="${s.type === 'run' ? 'r' : 'w'}" style="flex:${s.secs}"></i>`).join('');

function blockHTML(n, b) {
  const done = !!S.done[b.key];
  let title, tag, fmt = '', body, open = false;
  if (b.sess) {
    const s = SESS[b.sess];
    title = s.t; tag = s.d; fmt = s.fmt || ''; open = !!(s.lift || s.open);
    body = s.lift ? liftBody(n, b.sess) : listBody(s.ex);
  } else if ('run' in b) {
    const [run, walk] = rungDef(b.run);
    title = `${rungName(b.run)} · ${fm(run)} run / ${fm(walk)} walk`;
    tag = `about ${rungMins(b.run)} min`;
    fmt = b.run === 'shakeout'
      ? 'Shake-out: shorter and easier than Run 3, just to loosen your legs before skiing.'
      : 'Only move to this rung if the previous run passed the three checks in the ladder. Otherwise repeat the last rung.';
    open = true;
    body = runBody(n, b);
  } else {
    title = b.tennis.tennis; tag = b.tennis.n;
    body = listBody([['Tennis', DAYS[n - 1].t === 'Easy tennis' ? 'easy rallying' : 'as normal', '']]);
  }
  if (b.key in openState) open = openState[b.key];
  return `<div class="blk ${done ? 'done' : ''}">
    <div class="bh"><div><h3>${title}</h3><span class="tag">${tag}</span></div>
    <button class="chk" data-act="toggle" data-key="${b.key}" aria-pressed="${done}" aria-label="Mark ${esc(title)} done">✓</button></div>
    <details data-key="${b.key}" ${open ? 'open' : ''}><summary>Show the session</summary>${fmt ? `<p class="fmt">${fmt}</p>` : ''}${body}</details>
  </div>`;
}

function renderDay(n, isToday) {
  const d = DAYS[n - 1];
  const bl = blocks(n);
  const p = dayProgress(n);
  const slot = (name, list) => (list.length ? `<p class="slot">${name}</p>${list.map(b => blockHTML(n, b)).join('')}` : '');
  return `<div class="stack">
    ${isToday ? pendingBanner() : ''}
    <div class="dayhead">
      <div class="row between"><span class="phase ${n <= 7 ? 'b' : ''}">${phaseOf(n)}</span>
      <div class="daynav"><a href="#day/${n - 1}" aria-label="Previous day" aria-disabled="${n === 1}">‹</a><a href="#day/${n + 1}" aria-label="Next day" aria-disabled="${n === N_DAYS}">›</a></div></div>
      <div class="eyebrow" style="margin-top:10px">${isToday ? 'Today · ' : ''}${fmtDate(dateOf(n), { weekday: 'long', day: 'numeric', month: 'short' })} · ${p.done}/${p.total} done</div>
      <h2>Day ${n} · ${d.t}</h2>
      <p class="why">${d.w}</p>
    </div>
    <div>
      ${slot('Morning', bl.filter(b => b.slot === 'am'))}
      ${slot('Main session', bl.filter(b => b.slot === 'main'))}
      ${slot('Evening', bl.filter(b => b.slot === 'pm'))}
    </div>
    ${n === N_DAYS ? `<p class="why"><b>${DAY15}</b></p>` : ''}
  </div>`;
}

function renderToday() {
  const c = currentDay();
  if (c < 1) {
    return `${hero(0)}<div class="card empty"><h2>Starts in ${1 - c} day${c === 0 ? '' : 's'}</h2>
      <p class="muted">Day 1 is ${fmtDate(S.start, { weekday: 'long', day: 'numeric', month: 'long' })}. You can change the start date in settings.</p>
      <p style="margin-top:14px"><a class="btn" href="#day/1">Preview Day 1</a></p></div>`;
  }
  if (c > N_DAYS) {
    const p = totalProgress();
    return `${hero(0)}<div class="stack">${pendingBanner()}<div class="card empty"><h2>First tracks ⛷</h2>
      <p class="muted">The 14 days are over. You finished ${p.done} of ${p.total} sessions. Have a great trip.</p>
      <p style="margin-top:14px"><button class="btn" data-act="settings">Start a new block</button></p></div></div>`;
  }
  return hero(c) + renderDay(c, true);
}

function renderPlan() {
  const c = currentDay();
  let html = hero(c) + '<div class="stack">';
  for (let w = 0; w < 2; w++) {
    html += `<div class="week"><h3>Week ${w + 1}</h3><div class="grid">`;
    for (let n = w * 7 + 1; n <= Math.min(N_DAYS, w * 7 + 7); n++) {
      const p = dayProgress(n);
      html += `<a class="dcard ${n === c ? 'today' : ''} ${p.done === p.total ? 'complete' : ''}" href="#day/${n}">
        <div class="d">${fmtDate(dateOf(n))}</div><div class="t">Day ${n}</div>
        <span class="chip ${dayKind(n)}">${DAYS[n - 1].t}</span>
        <span class="pips">${Array.from({ length: p.total }, (_, i) => `<i class="${i < p.done ? 'on' : ''}"></i>`).join('')}</span></a>`;
    }
    html += '</div></div>';
  }
  return html + '</div>';
}

function renderLadder() {
  const cur = S.ladder.rung;
  const rungRow = (r, cls, badge, note) => {
    const [run, walk, reps] = rungDef(r);
    return `<div class="rung ${cls}"><span class="n">${badge}</span>
      <div><div class="lbl"><span>${rungName(r)} · ${reps} × ${fm(run)} run / ${fm(walk)} walk</span><span class="muted tiny">${note}</span></div>
      <div class="segs">${segBar(rungSegments(r, false))}</div></div></div>`;
  };
  let html = `<div class="stack">${pendingBanner()}<div class="card">
    <h2 class="sec">Walk–run ladder</h2>
    <p class="small muted">Red is running, grey is walking. Move up a rung only if the last run felt easy, nothing hurt during it, and nothing ached the next morning. Otherwise repeat the rung. Repeating is normal, not a setback.</p>
    <div class="legend" style="margin:12px 0 4px"><span class="lr">Run</span><span class="lw">Walk</span><span>+ ${WARMUP_MIN} min walk either end</span></div>`;
  LADDER.forEach((_, r) => { html += rungRow(r, r === cur ? 'current' : r < cur ? 'passed' : '', r < cur ? '✓' : r + 1, `${rungMins(r)} min`); });
  html += rungRow('shakeout', 'shake', '4', 'Day 14 only');
  html += `<div class="row between" style="margin-top:12px"><span class="small muted">Adjust current rung</span>
    <div class="stepper"><button class="btn" data-act="rung" data-v="-1" aria-label="Down a rung" ${cur === 0 ? 'disabled' : ''}>−</button>
    <button class="btn" data-act="rung" data-v="1" aria-label="Up a rung" ${cur === LADDER.length - 1 ? 'disabled' : ''}>+</button></div></div></div>`;
  const log = S.ladder.log;
  html += '<div class="card"><h3 style="margin-bottom:6px">Run log</h3>';
  if (!log.length) html += '<p class="small muted">No runs yet. Your first one is on Day 2.</p>';
  else {
    html += `<ul class="log">${log.slice().reverse().map(l => {
      const res = { up: '↑ moved up', repeat: '↻ repeat', done: '✓ done' }[l.result] || '… morning check';
      return `<li><span>Day ${l.day} · ${rungName(l.rung)}</span><span class="muted">${res}</span></li>`;
    }).join('')}</ul>`;
  }
  return html + '</div></div>';
}

function renderGuide() {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  let html = `<div class="stack"><div class="card guide">
    <h2 class="sec">How the plan fits together</h2>
    <p class="muted small" style="margin-bottom:14px">Morning yoga and Pilates every day, two single-leg lift days with supersets, a walk–run return that builds every session, and evening yoga or Pilates on rest days.</p>
    ${GUIDE.map(g => `<section><h3>${g.h}</h3><p class="small">${g.p}</p></section>`).join('')}
    <section><h3>Form cues</h3><ul class="cues" style="margin-top:4px">${FORM_CUES.map(c => `<li>${c}</li>`).join('')}</ul></section>
  </div>`;
  if (!standalone) {
    html += `<div class="card"><h3 style="margin-bottom:6px">Install on your phone</h3>
      <p class="small muted">iPhone: open this page in Safari, tap Share, then <b>Add to Home Screen</b>. Android: use the browser menu’s <b>Install app</b>. It then works offline and opens full screen.</p>
      ${deferredInstall ? '<button class="btn primary" style="margin-top:10px" data-act="install">Install app</button>' : ''}</div>`;
  }
  return html + '</div>';
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
    restEl.innerHTML = '<span>Go — next round</span><button data-act="restclose">✕</button>';
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
const runBlockFor = day => blocks(day).find(b => 'run' in b);

function startRun(day) {
  ensureAudio();
  S.timer = { day, rung: runBlockFor(day).run, startedAt: Date.now(), pausedAt: null, pausedMs: 0 };
  save();
  openRunner(true);
}
function openRunner(isNew) {
  if (!S.timer) return;
  lastSeg = isNew ? -1 : currentSegIndex();
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
      if (s.type === 'run') { beep(988, 2); buzz([250, 100, 250]); say(`Run, ${fm(s.secs / 60).replace(':00', '').replace(':30', ' and a half')} minutes`); }
      else { beep(587, 1, 0.3); buzz(400); say(s.label === 'Cool-down walk' ? 'Cool down walk' : idx === 0 ? 'Warm up walk' : 'Walk'); }
    }
    lastSeg = idx;
  }

  if (idx >= segs.length) {
    clearInterval(runTick);
    runEl.className = 'runner done';
    runEl.innerHTML = `<div class="top-row"><span>Day ${t.day} · ${rungName(t.rung)}</span></div>
      <div class="center"><div class="phase">Done</div><div class="clock" style="font-size:72px">${mmss(total)}</div><div class="next">Nice work. Two quick questions.</div></div>
      <div class="ctrls" style="grid-template-columns:1fr"><button class="main" data-act="finishrun">Log this run</button></div>`;
    return;
  }
  const s = segs[idx];
  const next = segs[idx + 1];
  runEl.className = `runner ${s.type}`;
  runEl.innerHTML = `<div class="top-row"><span>Day ${t.day} · ${rungName(t.rung)}</span><span>${s.label}</span></div>
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
  checkin = { day, rung: S.timer && S.timer.day === day ? S.timer.rung : runBlockFor(day).run, easy: null, hurt: null };
  drawCheckin();
}
function drawCheckin() {
  const c = checkin;
  const b = (k, v, t) => `<button data-act="ci" data-k="${k}" data-v="${v}" aria-pressed="${c[k] === v}">${t}</button>`;
  openSheet(`<h2>How was ${rungName(c.rung)}?</h2>
    <div class="q"><p>Did the run feel easy?</p><div class="seg">${b('easy', true, 'Yes, easy')}${b('easy', false, 'No, it was hard')}</div></div>
    <div class="q"><p>Did anything hurt during it?</p><div class="seg">${b('hurt', false, 'Nothing hurt')}${b('hurt', true, 'Something hurt')}</div></div>
    <p class="small muted" style="margin:12px 0">${c.rung === 'shakeout' ? 'This is the shake-out, so it doesn’t move the ladder.' : 'The third check, aches the next morning, will show up on tomorrow’s Today screen.'}</p>
    <div class="row"><button class="btn ghost" data-act="sheetclose">Cancel</button>
    <button class="btn primary" style="flex:1" data-act="cisave" ${c.easy === null || c.hurt === null ? 'disabled' : ''}>Save</button></div>`);
}
function saveCheckin() {
  const c = checkin;
  S.ladder.log = S.ladder.log.filter(l => l.day !== c.day);
  S.ladder.pending = null;
  const entry = { day: c.day, date: todayISO(), rung: c.rung, easy: c.easy, hurt: c.hurt, result: null };
  S.ladder.log.push(entry);
  S.ladder.log.sort((a, b) => a.day - b.day);
  if (c.rung === 'shakeout') entry.result = 'done';
  else {
    S.ladder.rung = c.rung;
    if (c.easy && !c.hurt) S.ladder.pending = { date: todayISO(), idx: S.ladder.log.indexOf(entry) };
    else entry.result = 'repeat';
  }
  S.done[`${c.day}:run`] = true;
  S.timer = null;
  checkin = null;
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
    <div class="field" style="border:0"><span>Clear everything</span><button class="btn" data-act="reset" style="color:var(--red)">Reset</button></div>
    <button class="btn primary block" style="margin-top:8px" data-act="sheetclose">Done</button>`);
}

/* ---------- events ---------- */
document.addEventListener('toggle', e => {
  if (e.target.matches && e.target.matches('details[data-key]')) openState[e.target.dataset.key] = e.target.open;
}, true);

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
      const k = t.dataset.key, i = +t.dataset.i, n = +t.dataset.day, sk = t.dataset.sess;
      const count = S.rounds[k] || 0;
      if (i < count) S.rounds[k] = i;
      else {
        S.rounds[k] = i + 1;
        const all = liftGroups(SESS[sk]).every(G => (S.rounds[`${n}:${G.k}`] || 0) >= G.sets);
        if (all) { S.done[`${n}:${sk}`] = true; restEl.hidden = true; clearInterval(restTick); ensureAudio(); beep(1046, 2); }
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
      if (S.timer && checkin && runEl.hidden) { S.timer = null; save(); }
      checkin = null;
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
    if (sheetEl.hidden && !document.activeElement?.matches?.('input')) rerender(); // day may have rolled over
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
