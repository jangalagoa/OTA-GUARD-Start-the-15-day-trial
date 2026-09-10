/* ═══ OTA Guard v3 — Interactive Demo engine ═══
   Screens injected into #content, mimicking the real Tkinter tabs.
   Sample data only — nothing connects anywhere. */

// ── The 10 real themes (core/theme.py) ─────────────────────────────
const THEMES = {
  "Catppuccin Mocha": {BG:"#1e1e2e",FG:"#cdd6f4",ENTRY_BG:"#313244",SEL_BG:"#45475a",ACCENT:"#89b4fa",GREEN:"#a6e3a1",RED:"#f38ba8",ORANGE:"#fab387",YELLOW:"#f9e2af",desc:"Dark violet & lavender — the most popular right now"},
  "Dracula":          {BG:"#282a36",FG:"#f8f8f2",ENTRY_BG:"#1e1f29",SEL_BG:"#44475a",ACCENT:"#bd93f9",GREEN:"#50fa7b",RED:"#ff5555",ORANGE:"#ffb86c",YELLOW:"#f1fa8c",desc:"Violet & bright pink — pure white text"},
  "Solarized Dark":   {BG:"#002b36",FG:"#eee8d5",ENTRY_BG:"#073642",SEL_BG:"#094657",ACCENT:"#33b8ae",GREEN:"#a8c000",RED:"#ff5555",ORANGE:"#f07828",YELLOW:"#e0b800",desc:"Deep teal & warm cream — easy on the eyes"},
  "Everforest":       {BG:"#1e2718",FG:"#d3c6aa",ENTRY_BG:"#272e22",SEL_BG:"#343f2e",ACCENT:"#a7c080",GREEN:"#83c092",RED:"#e67e80",ORANGE:"#e69875",YELLOW:"#dbbc7f",desc:"Forest green & golden sand — nature theme"},
  "Warm Ember":       {BG:"#1c1210",FG:"#f0e6d3",ENTRY_BG:"#2a1e1a",SEL_BG:"#3a2822",ACCENT:"#e8926e",GREEN:"#7dbb8a",RED:"#d05050",ORANGE:"#e8926e",YELLOW:"#f0c060",desc:"Warm brown & cream — ember tones"},
  "Gruvbox Dark":     {BG:"#282828",FG:"#ebdbb2",ENTRY_BG:"#3c3836",SEL_BG:"#504945",ACCENT:"#83a598",GREEN:"#b8bb26",RED:"#fb4934",ORANGE:"#fe8019",YELLOW:"#fabd2f",desc:"Sand & retro wood — warm, relaxing tones"},
  "Hotel Gold":       {BG:"#1a1625",FG:"#e8d5b7",ENTRY_BG:"#241e35",SEL_BG:"#332846",ACCENT:"#d4af37",GREEN:"#7ec8a0",RED:"#e05a5a",ORANGE:"#e8a87c",YELLOW:"#f5d76e",desc:"Luxury violet & gold — high-end hospitality"},
  "Ocean Blue":       {BG:"#0a192f",FG:"#ccd6f6",ENTRY_BG:"#112240",SEL_BG:"#1d3461",ACCENT:"#64ffda",GREEN:"#64ffda",RED:"#ff6b6b",ORANGE:"#ffa726",YELLOW:"#ffee58",desc:"Marine blue & cyan — modern SaaS dashboards"},
  "High Contrast":    {BG:"#000000",FG:"#ffffff",ENTRY_BG:"#111111",SEL_BG:"#222222",ACCENT:"#00d4ff",GREEN:"#00ff88",RED:"#ff3333",ORANGE:"#ff9500",YELLOW:"#ffe600",desc:"Pure black & white — 21:1 contrast, accessibility"},
  "Light Pro":        {BG:"#f8f9fa",FG:"#212529",ENTRY_BG:"#ffffff",SEL_BG:"#e9ecef",ACCENT:"#0066cc",GREEN:"#198754",RED:"#dc3545",ORANGE:"#fd7e14",YELLOW:"#7d5a00",desc:"White & professional blue — the only light theme"},
};

// ── Demo state ──────────────────────────────────────────────────────
const state = {
  scanning:false, lastScan:"today 09:12",
  rows:[
    {ota:"Booking.com",  room:"Double Room",         disp:4457, target:4320, floor:1400, ceil:4000, ok:true,  note:"Within limits"},
    {ota:"Agoda",        room:"Double Room",         disp:3890, target:4320, floor:1400, ceil:4000, ok:false, note:"Below floor"},
    {ota:"Airbnb",       room:"Double Room",         disp:4412, target:4320, floor:1400, ceil:4000, ok:true,  note:"Within limits"},
    {ota:"Expedia",      room:"Deluxe Double",       disp:4680, target:4550, floor:1600, ceil:4500, ok:false, note:"Above ceiling"},
    {ota:"Goibibo",      room:"Deluxe Double",       disp:4512, target:4550, floor:1600, ceil:4500, ok:true,  note:"Within limits"},
    {ota:"Booking.com",  room:"Double with Balcony", disp:4610, target:4550, floor:1600, ceil:4500, ok:true,  note:"Within limits"},
    {ota:"Agoda",        room:"Suite",               disp:6900, target:6800, floor:2400, ceil:7000, ok:true,  note:"Within limits"},
  ],
  submissions:[
    {t:"today 09:12", s:"ok",   txt:"✅ 3 rates sent and verified — Double Room → ₹4,320 (Sep 07–21) · Booking.com, Agoda, Airbnb"},
    {t:"today 08:40", s:"part", txt:"🟠 1 of 2 rates departed — Deluxe Double → ₹4,550 (Sep 07–21) · Expedia verified, Goibibo retried next cycle"},
    {t:"yesterday 23:10", s:"fail", txt:"✗ Preflight failed ×3 — Brave memory-saver put the CM tab to sleep. Segments re-taken at the next cycle."},
  ],
  extralog:[
    {c:"info", t:"09:02  Grid read — 5 rooms · 9 OTAs · 532 prices (passive read)"},
    {c:"ok",   t:"09:11  ✓ Sent and verified — Agoda · Double Room → ₹4,320 (Sep 07–21) — POST proof captured"},
    {c:"ok",   t:"09:11  ✓ Grid check: displayed ₹4,318 — on target (Δ −2)"},
  ],
  cmLoaded:false, locked:true, paired:false, theme:"Catppuccin Mocha",
};

const $ = s => document.querySelector(s);
const inr = n => "₹" + n.toLocaleString("en-IN");

function toast(msg){
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove("show"), 2600);
}
function openModal(html){ $("#modalBox").innerHTML = html; $("#modalOverlay").classList.add("open"); }
function closeModal(){ $("#modalOverlay").classList.remove("open"); }
function sec(title, body){ return `<div class="section"><div class="sec-title">${title}</div><div class="sec-body">${body}</div></div>`; }

// ── Theme application ───────────────────────────────────────────────
function applyTheme(name){
  state.theme = name;
  const t = THEMES[name];
  const r = document.documentElement.style;
  for (const k of ["BG","FG","ENTRY_BG","SEL_BG","ACCENT","GREEN","RED","ORANGE","YELLOW"]) r.setProperty("--"+k, t[k]);
  document.querySelectorAll(".theme-card").forEach(c => c.classList.toggle("active", c.dataset.theme === name));
}

// ── SCREEN 1 — OTA price block ──────────────────────────────────────
function screenBlocage(){
  const rows = state.rows.map((r,i)=>{
    const gap = r.disp - r.target;
    const st = Math.abs(gap) <= 100 ? `<span class="st-ok">✓ OK</span>`
             : (gap < 0 ? `<span class="st-gap">▼ below target</span>` : `<span class="st-warn">▲ above target</span>`);
    return `<tr><td>${i+1}</td><td>${r.ota}</td><td>${r.room}</td>
      <td>${inr(r.disp)}</td><td>${inr(r.target)}</td>
      <td style="color:${gap<0?'var(--RED)':'var(--ORANGE)'}">${gap>0?'+':''}${gap}</td><td>${st}</td></tr>`;
  }).join("");
  const gaps = state.rows.filter(r=>!r.ok).length;
  const subs = state.submissions.map(s=>`<div class="subm ${s.s}"><span class="t">${s.t}</span><br>${s.txt}</div>`).join("");
  return `
  ${sec("OTA detected from Brave", `
    <div class="row between">
      <div>
        <span class="chip"><span class="dot"></span>Booking.com</span>
        <span class="chip"><span class="dot"></span>Agoda</span>
        <span class="chip"><span class="dot"></span>Airbnb</span>
        <span class="chip"><span class="dot"></span>Expedia</span>
        <span class="chip"><span class="dot"></span>Goibibo</span>
        <span class="chip off"><span class="dot"></span>MakeMyTrip (not used now)</span>
      </div>
      <button class="btn" onclick="toast('Brave tabs re-detected — 5 OTA pages found.')">↻ Re-detect</button>
    </div>`)}
  ${sec("Floor/ceiling protection", `
    <div class="row">
      <label class="chk"><input type="checkbox" checked> Automatic monitoring during scanning (alert only)</label>
      <label class="chk"><input type="checkbox" id="chkAutoPush" checked> Automatic sending to Channel Manager</label>
    </div>
    <div class="row small muted">After each scan, prices below the floor or above the ceiling are reported here — and corrected automatically if sending is enabled.</div>
    <div class="row small muted">⚠ Some OTA promotions (e.g. Genius) apply on their side and cannot always be overridden — disclosed during the trial.</div>`)}
  ${sec("Scan", `
    <div class="row">
      <span class="small muted">Trigger:</span>
      <label class="chk"><input type="radio" name="trig" checked> Manual — I click myself</label>
      <label class="chk"><input type="radio" name="trig"> Once a day at a fixed time <input type="time" value="06:00" style="width:90px"></label>
      <label class="chk"><input type="radio" name="trig"> Every <input type="number" value="30" min="5" style="width:64px"> min</label>
      <span class="small muted">for:</span> <input type="number" value="60" style="width:64px"> <span class="small muted">day(s)</span>
    </div>
    <div class="row between">
      <div class="row" style="margin:0">
        <button class="btn primary" id="btnScan" onclick="runScan()">🔍 OTA Guard scan</button>
        <button class="btn danger" id="btnStop" onclick="stopScan()" disabled>⏹ Stop</button>
        <span class="small muted">Last scan: ${state.lastScan}</span>
      </div>
      <span class="small muted">weekends +10% · period Sep 07 → Oct 31</span>
    </div>
    <div class="row"><div class="progress"><div id="scanBar"></div></div><span class="small" id="scanPct"></span></div>`)}
  ${sec(`Results of the last scan:`, `
    <table class="tv"><thead><tr><th>#</th><th>OTA</th><th>Room</th><th>Displayed</th><th>Target</th><th>Gap</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="row between" style="margin-top:9px">
      <span class="small muted">Double-click a row → correct that room only. Corrections converge to the target through the CM (max 25%/cycle).</span>
      <button class="btn warn" id="btnFix" onclick="runPush()" ${gaps? "":"disabled"}>Correct all (${gaps})</button>
    </div>
    <div class="row"><div class="progress"><div id="pushBar"></div></div><span class="small" id="pushPct"></span></div>`)}
  ${sec("📋 Latest submissions to Channel Manager", `
    <div class="small muted" style="margin-bottom:6px">Trace of every push to the CM — manual or automatic.</div>${subs}`)}`;
}

// ── Scan / push simulations ─────────────────────────────────────────
function runScan(){
  if (state.scanning) return;
  state.scanning = true;
  const bar = $("#scanBar"), pct = $("#scanPct"), btn = $("#btnScan"), stop = $("#btnStop");
  btn.disabled = true; stop.disabled = false;
  const otas = ["Booking.com","Agoda","Airbnb","Expedia","Goibibo"];
  let i = 0;
  const tick = () => {
    if (!state.scanning) return;
    const p = Math.round(++i / otas.length * 100);
    bar.style.width = p + "%"; pct.textContent = `Analysing ${otas[Math.min(i-1,4)]}… ${p}%`;
    if (i < otas.length) setTimeout(tick, 620);
    else { bar.style.width="100%"; pct.textContent = "Scan complete — 7 rates captured · 2 gaps found";
      state.lastScan = "just now"; state.scanning = false; btn.disabled = false; stop.disabled = true;
      toast("Scan complete — 2 gaps detected."); refresh(); }
  };
  tick();
}
function stopScan(){
  state.scanning = false;
  const bar = $("#scanBar"), pct = $("#scanPct");
  if (bar){ bar.style.width="100%"; bar.style.background="var(--ORANGE)"; }
  if (pct) pct.textContent = "⏹ Stop requested — current OTA finished, remaining ones not started. Partial results kept.";
  const b = $("#btnScan"); if (b) b.disabled = false;
  const s = $("#btnStop"); if (s) s.disabled = true;
  toast("Scan stopped — partial results kept.");
}
function runPush(){
  const bar = $("#pushBar"), pct = $("#pushPct"), btn = $("#btnFix");
  btn.disabled = true;
  let p = 0;
  const tick = () => {
    p += 25; bar.style.width = p + "%"; pct.textContent = `⏳ Sending correction to Channel Manager… ${p}%`;
    if (p < 100) setTimeout(tick, 550);
    else {
      pct.textContent = "✅ Envois terminés — verified on the grid";
      state.rows.forEach(r => { if(!r.ok){ r.disp = r.target; r.ok = true; r.note="Within limits"; } });
      state.submissions.unshift({t:"just now", s:"ok",
        txt:"✅ 2 rates sent and verified — Double Room/Agoda → ₹4,320 · Deluxe Double/Expedia → ₹4,550 (Sep 07–21)"});
      toast("Corrections pushed and verified ✅"); refresh();
    }
  };
  tick();
}

// ── SCREEN 2 — Extranet Direct ──────────────────────────────────────
function screenExtranet(){
  const gridRows = [["Double Room",4320,4320,4320,4320],["Deluxe Double",4550,4550,4550,4550],
                    ["Double with Balcony",4550,4550,4610,4550],["Suite",6800,6800,6800,6800]]
    .map(r=>`<tr><td>${r[0]}</td>${r.slice(1).map(v=>`<td>${inr(v)}</td>`).join("")}</tr>`).join("");
  return `
  ${sec("0. Channel Manager active — only one at a time", `
    <div class="row between">
      <div><b>channelmanager_com_au</b> <span class="small muted">— domain: app.channelmanager.com.au</span>
      <div class="small muted">Change takes effect at the next start. Adapter: OTASheet grid + BulkUpdate form.</div></div>
      <button class="btn" onclick="toast('3 adapters available — channelmanager_com_au is active.')">Change</button>
    </div>`)}
  ${sec("1. Channel Manager status — passive reading", `
    <div class="row between">
      <span class="small muted">Re-opens or re-reads the OTASheet tab — the rate grid is the source of truth.</span>
      <button class="btn primary" onclick="loadCm()">📥 Load state</button>
    </div>
    <div id="cmState">${state.cmLoaded ? cmStateHtml() : '<div class="gap-note">Not loaded — click “Load state”.</div>'}</div>`)}
  ${sec("2. Execution — one task at a time", `
    <div class="row">
      <span class="small muted">Room:</span><select><option>Double Room</option><option>Deluxe Double</option><option>Suite</option></select>
      <span class="small muted">OTA:</span><select><option>Agoda</option><option>Booking.com</option><option>Expedia</option></select>
      <span class="small muted">Price:</span><input type="number" value="1400" style="width:90px">
      <span class="small muted">From:</span><input type="date" value="2026-09-07" style="width:130px">
      <span class="small muted">To:</span><input type="date" value="2026-09-21" style="width:130px">
      <button class="btn warn" onclick="runTask()">▶ Execute</button>
    </div>
    <div class="small muted">Room, OTA, price and dates are mandatory. The real send asks for confirmation — this demo does nothing.</div>`)}
  ${sec("3. Action log", `<div class="log" id="xlog">${state.extralog.map(l=>`<div class="${l.c}">${l.t}</div>`).join("")}</div>`)}`;
}
function cmStateHtml(){
  return `<div class="small muted" style="margin:2px 0 6px">✓ Grid read — 5 rooms · 9 OTAs · 532 prices · <b>today 09:02</b> (passive read)</div>
  <table class="tv"><thead><tr><th>Room</th><th>Sep 07</th><th>Sep 08</th><th>Sep 09 (we)</th><th>Sep 10</th></tr></thead><tbody>
  ${[["Double Room",4320,4320,4752,4320],["Deluxe Double",4550,4550,5005,4550],["Double with Balcony",4550,4550,5005,4550],["Suite",6800,6800,7480,6800]]
    .map(r=>`<tr><td>${r[0]}</td>${r.slice(1).map(v=>`<td>${inr(v)}</td>`).join("")}</tr>`).join("")}
  </tbody></table>`;
}
function loadCm(){
  const el = $("#cmState");
  el.innerHTML = '<div class="gap-note">⏳ Reading the grid passively…</div>';
  setTimeout(()=>{ state.cmLoaded = true; el.innerHTML = cmStateHtml();
    state.extralog.unshift({c:"info", t:"just now  Grid read — 5 rooms · 9 OTAs · 532 prices"});
    toast("Channel Manager state loaded — 532 prices read."); }, 900);
}
function runTask(){
  state.extralog.unshift({c:"warn", t:"just now  ⏳ Executing — Double Room · Agoda · ₹1,400 (Sep 07–21)…"});
  setTimeout(()=>{ state.extralog.unshift({c:"ok", t:"just now  ✓ Sent and verified — grid now shows ₹1,402 (Δ +2, OTA rounding)"});
    toast("Task executed and verified ✓"); refresh(); }, 1300);
  refresh();
}

// ── SCREEN 3 — My Hotel ─────────────────────────────────────────────
function screenHotel(){
  const rooms = [["Double Room",4,1400,4000],["Deluxe Double",3,1600,4500],["Double with Balcony",2,1600,4500],["Suite",1,2400,7000]]
    .map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${inr(r[2])}</td><td>${inr(r[3])}</td></tr>`).join("");
  return `
  ${sec("Hotel profile", `
    <div class="grid2">
      <div class="row"><span class="small muted" style="width:110px">Hotel name</span><input type="text" value="Lisboa Palace Goa" style="flex:1"></div>
      <div class="row"><span class="small muted" style="width:110px">City</span><input type="text" value="Goa" style="flex:1"></div>
      <div class="row"><span class="small muted" style="width:110px">Country</span><input type="text" value="India" style="flex:1"></div>
      <div class="row"><span class="small muted" style="width:110px">Currency</span><select><option>INR</option><option>USD</option><option>EUR</option></select></div>
      <div class="row"><span class="small muted" style="width:110px">Check-in</span><input type="text" value="14:00" style="width:100px"><span class="small muted">(24 h or AM/PM)</span></div>
      <div class="row"><span class="small muted" style="width:110px">Check-out</span><input type="text" value="10:00" style="width:100px"><span class="small muted">(24 h or AM/PM)</span></div>
    </div>`)}
  ${sec("Room types — floor & ceiling prices", `
    <div class="small muted" style="margin-bottom:6px">The floor price is the minimum displayed rate acceptable — your safeguard against selling at a loss. The ceiling is the maximum.</div>
    <table class="tv"><thead><tr><th>Room name</th><th>Number of rooms</th><th>Floor price</th><th>Ceiling price</th></tr></thead><tbody>${rooms}</tbody></table>
    <div class="row between">
      <span class="small muted">“Number of rooms” = the inventory of this room type — not a room number.</span>
      <button class="btn primary" onclick="toast('Hotel profile saved.')">💾 Save</button>
    </div>`)}`;
}

// ── SCREEN 4 — Channel Manager ──────────────────────────────────────
function screenCM(){
  return `
  ${sec("Transport — how corrections reach your Channel Manager", `
    <div class="row">
      <label class="chk"><input type="radio" name="tr" checked onchange="refresh()"> <b>API mode</b> — direct machine-to-machine, needs a key</label>
      <label class="chk"><input type="radio" name="tr" onchange="refresh()"> <b>Extranet Direct</b> — through your own browser session, no key (≤ 20 rooms)</label>
    </div>`)}
  ${sec("API connection — channelmanager.com.au", `
    <div class="grid2">
      <div class="row"><span class="small muted" style="width:120px">Hotel ID / Code</span><input type="text" value="GXA-24817" style="flex:1"></div>
      <div class="row"><span class="small muted" style="width:120px">Auth Code / API key</span><input type="text" value="••••••••••••••••••••" style="flex:1"></div>
    </div>
    <div class="row between">
      <button class="btn primary" onclick="toast('✅ Connected — Rate Update ✓ · Room Info ✓ · OTA Info ✓')">🔑 Test connection</button>
      <span class="st-ok small">● Connected — all required functions granted</span>
    </div>
    <div class="gap-note">⚠ Many providers charge extra for API access — ask before ordering the key. No API? Use Extranet Direct mode.</div>`)}
  ${sec("Required API functions", `
    <table class="tv"><thead><tr><th>API function</th><th>Used by OTA Guard for</th><th>Required</th></tr></thead><tbody>
      <tr><td>Rate Update</td><td>Sending corrected rates to the OTAs</td><td class="st-ok">Yes</td></tr>
      <tr><td>Room Info</td><td>Retrieving rooms and rate plans (mapping)</td><td class="st-ok">Yes</td></tr>
      <tr><td>OTA Info</td><td>Retrieving connected OTAs and codes (targeting)</td><td class="st-ok">Yes</td></tr>
      <tr><td>Inventory Update</td><td>Sending availability</td><td class="st-idle">Optional</td></tr>
      <tr><td>Restriction Update</td><td>Sending restrictions (min stay, stop-sell)</td><td class="st-idle">Optional</td></tr>
    </tbody></table>`)}
  ${sec("Per-OTA strategy (what gets sent)", `
    <div class="small muted" style="margin-bottom:6px">The strategy prices are what OTA Guard sends to the CM for each OTA. Weekends +10%.</div>
    <table class="tv"><thead><tr><th>OTA</th><th>Base price</th><th>Weekend</th><th>Status</th></tr></thead><tbody>
      <tr><td>Booking.com</td><td>${inr(4320)}</td><td>${inr(4752)}</td><td class="st-ok">✓ active</td></tr>
      <tr><td>Agoda</td><td>${inr(4320)}</td><td>${inr(4752)}</td><td class="st-ok">✓ active</td></tr>
      <tr><td>Expedia</td><td>${inr(4550)}</td><td>${inr(5005)}</td><td class="st-ok">✓ active</td></tr>
      <tr><td>Goibibo</td><td>${inr(4550)}</td><td>${inr(5005)}</td><td class="st-ok">✓ active</td></tr>
    </tbody></table>`)}`;
}

// ── SCREEN 5 — Seasonal rates ───────────────────────────────────────
function screenSeasonal(){
  return `
  <div class="row between">
    <span class="small muted">Seasonal periods override the base strategy for their dates. 🔒 Locked periods are skipped by corrections — both transports.</span>
    <button class="btn primary" onclick="toast('New seasonal period — pick dates and prices (demo).')">＋ New seasonal period</button>
  </div>
  <div class="season ${state.locked?"locked":""}">
    <div class="hd">
      <span class="nm">🎄 Christmas &amp; New Year</span>
      <span class="row" style="margin:0">
        <span class="badge on">Active</span>
        <span class="badge lock">${state.locked ? "🔒 Locked" : "🔓 Unlocked"}</span>
        <button class="btn" onclick="toggleLock()">${state.locked ? "🔓 Unlock corrections" : "🔒 Lock corrections"}</button>
      </span>
    </div>
    <div class="small muted" style="margin:5px 0">Period: Dec 20 → Jan 05 · recurring every year · weekends +10% kept</div>
    <table class="tv"><thead><tr><th>Room</th><th>Normal</th><th>Seasonal</th></tr></thead><tbody>
      <tr><td>Double Room</td><td>${inr(4320)}</td><td>${inr(5900)}</td></tr>
      <tr><td>Deluxe Double</td><td>${inr(4550)}</td><td>${inr(6200)}</td></tr>
      <tr><td>Suite</td><td>${inr(6800)}</td><td>${inr(9400)}</td></tr>
    </tbody></table>
  </div>
  <div class="season">
    <div class="hd">
      <span class="nm">🪔 Diwali week</span>
      <span class="badge on">Active</span>
    </div>
    <div class="small muted" style="margin-top:5px">Period: Oct 18 → Oct 24 · one-off · Double Room ${inr(5100)} · Deluxe ${inr(5350)} · Suite ${inr(7900)}</div>
  </div>`;
}
function toggleLock(){ state.locked = !state.locked; refresh();
  toast(state.locked ? "🔒 Period locked — corrections will skip it." : "🔓 Period unlocked — corrections resume."); }

// ── SCREEN 6 — Settings ─────────────────────────────────────────────
function screenSettings(){
  const themes = Object.entries(THEMES).map(([n,t])=>`
    <div class="theme-card ${n===state.theme?"active":""}" data-theme="${n}" onclick="applyTheme('${n}')">
      <div class="nm">${n}</div><div class="sw">
        <i style="background:${t.BG}"></i><i style="background:${t.ENTRY_BG}"></i><i style="background:${t.SEL_BG}"></i>
        <i style="background:${t.ACCENT}"></i><i style="background:${t.GREEN}"></i><i style="background:${t.ORANGE}"></i></div>
      <div class="ds">${t.desc}</div>
    </div>`).join("");
  return `
  ${sec("Theme — applied live, like in the real app", `<div class="themes">${themes}</div>`)}
  ${sec("Language", `
    <div class="row"><select><option>English</option><option>Français</option><option>हिन्दी</option><option>ไทย</option><option>Bahasa Indonesia</option><option>Español</option><option>Deutsch</option><option>Français… (14 languages available)</option></select>
    <span class="small muted">The whole interface translates instantly — no restart.</span></div>`)}
  ${sec("Monitoring", `
    <div class="row">
      <span class="small muted">Interval:</span><input type="number" value="30" style="width:70px"><span class="small muted">min (≥5)</span>
      <span class="small muted">Duration:</span><input type="number" value="60" style="width:70px"><span class="small muted">days</span>
      <span class="small muted">Min gap:</span><input type="number" value="100" style="width:90px"><span class="small muted">INR</span>
      <span class="small muted">Max attempts:</span><input type="number" value="3" style="width:64px">
    </div>
    <div class="row between">
      <span class="small muted">Weekend days: Fri + Sat (+10%) · week starts Monday</span>
      <button class="btn primary" onclick="toast('Settings saved.')">💾 Save settings</button>
    </div>`)}`;
}

// ── SCREEN 7 — Mobile app ───────────────────────────────────────────
function screenMobile(){
  const qr = Array.from({length:121}, (_,i)=>`<i class="${(i*7%13>4)?"":"w"}"></i>`).join("");
  return `
  <div class="grid2-uneven">
    <div>
      ${sec("Firebase gateway", `
        <div class="row between">
          <span class="st-ok small">● Service account loaded — project <b>ota-guard-demo</b></span>
          <button class="btn" onclick="toast('Service account JSON loaded and encrypted locally (DPAPI).')">Load JSON</button>
        </div>
        <div class="row between">
          <span class="small muted">Gateway listening for phone orders — fail-safe if not configured.</span>
          <button class="btn primary" onclick="toast('✅ Gateway listening — order round-trip OK.')">Test connection</button>
        </div>`)}
      ${sec("Pair your phone", `
        <div class="row">
          <div class="qr">${qr}</div>
          <div style="flex:1">
            <div class="small muted" style="margin-bottom:6px">Scan this QR with the OTA Guard mobile app, or enter the code:</div>
            <div class="card" style="font-family:Consolas,monospace;font-size:16px;text-align:center;letter-spacing:3px">${state.paired ? "PAIRED ✓" : "OTG-2026-DEMO"}</div>
            <div class="row" style="margin-top:9px">
              <button class="btn primary" onclick="pairPhone()">${state.paired ? "Paired ✓" : "📱 Pair phone"}</button>
              <span class="small muted">The phone can then trigger scans and receive gap alerts.</span>
            </div>
          </div>
        </div>`)}
    </div>
    <div>
      ${sec("Phone preview", `
        <div class="phone">
          <div style="font-weight:700; font-size:12px;">🛡️ OTA Guard</div>
          <div class="notif"><b>⚠ Gap detected</b><br>Agoda · Double Room displayed ₹3,890 — below floor ₹4,000<br><span style="opacity:.7">09:12</span></div>
          <div class="notif">✅ <b>Corrected</b><br>₹4,320 sent to Channel Manager — verified on the grid<br><span style="opacity:.7">09:13</span></div>
          <div class="notif">📅 <b>Seasonal period locked</b><br>Christmas — corrections skipped<br><span style="opacity:.7">08:00</span></div>
        </div>`)}
    </div>
  </div>`;
}
function pairPhone(){ state.paired = true; refresh(); toast("Phone paired — gateway listening."); }

// ── Modals ──────────────────────────────────────────────────────────
function aboutModal(){
  openModal(`
    <img src="assets/logo.svg" alt="OTA Guard">
    <h3>OTA Guard v3.0.4</h3>
    <p><b>Build</b> 2026-08-31 · <b>LISBOA PVT</b> — New Delhi, India</p>
    <p><b>Machine ID:</b> OTG-DEMO-2026 <span class="small muted">(demo)</span></p>
    <p><b>License:</b> Free trial — 12 day(s) remaining</p>
    <p class="small muted">Monitor → Verify → Control. OTA Guard observes the rates actually displayed,
    documents every gap and corrects through your own Channel Manager — by API or via your own extranet session.</p>
    <p class="small muted">Contact: otaguard@proton.me</p>
    <div class="m-actions"><button class="btn primary" onclick="closeModal()">Close</button></div>`);
}
function assistantModal(){
  openModal(`
    <h3>🧭 Configuration Assistant</h3>
    <p>The guided wizard walks through the whole setup in 7 steps:</p>
    <p>1. Hotel profile → 2. Your OTAs (detected from Brave) → 3. Target prices per room →
    4. Channel Manager connection (API or Extranet Direct) → 5. Floor/ceiling &amp; auto-correction →
    6. Seasonal periods → 7. Review &amp; start monitoring.</p>
    <p class="small muted">In this demo the wizard is illustrative — the tabs above are fully explorable.</p>
    <div class="m-actions"><button class="btn primary" onclick="closeModal()">Got it</button></div>`);
}
function quitModal(){
  openModal(`
    <h3>⏻ Quit OTA Guard?</h3>
    <p>Monitoring would stop — gaps would no longer be detected or corrected.</p>
    <p class="small muted">(This is a demo — nothing is actually running 🙂)</p>
    <div class="m-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn danger" onclick="closeModal(); toast('Demo only — the real app closes safely, queues included.')">Quit</button>
    </div>`);
}

// ── Router ──────────────────────────────────────────────────────────
const SCREENS = { blocage:screenBlocage, extranet:screenExtranet, hotel:screenHotel,
                  cm:screenCM, seasonal:screenSeasonal, settings:screenSettings, mobile:screenMobile };
function refresh(){
  const active = document.querySelector(".tab-btn.active").dataset.screen;
  $("#content").innerHTML = SCREENS[active]();
}
document.querySelectorAll(".tab-btn").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".tab-btn").forEach(x=>x.classList.remove("active"));
  b.classList.add("active"); refresh();
}));
$("#btnAbout").addEventListener("click", aboutModal);
$("#btnAssistant").addEventListener("click", assistantModal);
$("#btnQuit").addEventListener("click", quitModal);
$("#modalOverlay").addEventListener("click", e => { if (e.target.id === "modalOverlay") closeModal(); });

applyTheme("Catppuccin Mocha");

// Deep-link: #extranet, #settings… preselects a tab (also handy for demo links)
const h = location.hash.slice(1);
if (SCREENS[h]) {
  document.querySelectorAll(".tab-btn").forEach(x => x.classList.toggle("active", x.dataset.screen === h));
}
refresh();
