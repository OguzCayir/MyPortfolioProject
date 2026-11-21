// Toy bi-objective VRP solved live with an NSGA-II-style loop (mutation only).
// Objectives: f1 = total distance, f2 = longest single route. Both minimised.
(() => {
  const N_CUST = 16, N_VAN = 3, POP = 40, MAX_GEN = 400;
  const COLORS = ["#0b5cad", "#c2410c", "#15803d"];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const mapC = document.getElementById("map");
  const frontC = document.getElementById("front");
  const genEl = document.getElementById("gen");
  const readout = document.getElementById("readout");
  const toggleBtn = document.getElementById("toggle");

  let rand, pts, pop, gen, running, selected, front;
  let visible = true, scheduled = false, userPicked = false;
  function kick() { if (!scheduled && running && visible) { scheduled = true; requestAnimationFrame(loop); } }

  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // genome: customers 1..N plus (N_VAN-1) separators (0 = back to depot)
  function routesOf(g) {
    const routes = [[]];
    for (const v of g) v === 0 ? routes.push([]) : routes[routes.length - 1].push(v);
    return routes;
  }

  function evaluate(g) {
    let total = 0, longest = 0;
    for (const r of routesOf(g)) {
      let d = 0, prev = pts[0];
      for (const c of r) { d += dist(prev, pts[c]); prev = pts[c]; }
      d += dist(prev, pts[0]);
      if (r.length === 0) d = 0;
      total += d; longest = Math.max(longest, d);
    }
    return [total, longest];
  }

  function mutate(g) {
    const c = g.slice();
    const i = Math.floor(rand() * c.length), j = Math.floor(rand() * c.length);
    if (rand() < 0.5) { [c[i], c[j]] = [c[j], c[i]]; }
    else { const [a, b] = i < j ? [i, j] : [j, i]; c.splice(a, b - a + 1, ...c.slice(a, b + 1).reverse()); }
    return c;
  }

  const dominates = (a, b) => a.f[0] <= b.f[0] && a.f[1] <= b.f[1] && (a.f[0] < b.f[0] || a.f[1] < b.f[1]);

  function sortFronts(P) {
    const fronts = [[]];
    P.forEach(p => { p.S = []; p.n = 0; });
    for (const p of P) {
      for (const q of P) {
        if (dominates(p, q)) p.S.push(q); else if (dominates(q, p)) p.n++;
      }
      if (p.n === 0) { p.rank = 0; fronts[0].push(p); }
    }
    let k = 0;
    while (fronts[k].length) {
      const next = [];
      for (const p of fronts[k]) for (const q of p.S) if (--q.n === 0) { q.rank = k + 1; next.push(q); }
      fronts.push(next); k++;
    }
    fronts.pop();
    return fronts;
  }

  function crowding(F) {
    F.forEach(p => (p.cd = 0));
    for (let m = 0; m < 2; m++) {
      F.sort((a, b) => a.f[m] - b.f[m]);
      const span = F[F.length - 1].f[m] - F[0].f[m] || 1;
      F[0].cd = F[F.length - 1].cd = Infinity;
      for (let i = 1; i < F.length - 1; i++) F[i].cd += (F[i + 1].f[m] - F[i - 1].f[m]) / span;
    }
  }

  const better = (a, b) => (a.rank !== b.rank ? a.rank < b.rank : a.cd > b.cd) ? a : b;

  function step() {
    const kids = [];
    for (let i = 0; i < POP; i++) {
      const p = better(pop[Math.floor(rand() * POP)], pop[Math.floor(rand() * POP)]);
      let g = mutate(p.g);
      if (rand() < 0.3) g = mutate(g);
      kids.push({ g, f: evaluate(g) });
    }
    const all = pop.concat(kids);
    const fronts = sortFronts(all);
    const next = [];
    for (const F of fronts) {
      crowding(F);
      if (next.length + F.length <= POP) next.push(...F);
      else { F.sort((a, b) => b.cd - a.cd); next.push(...F.slice(0, POP - next.length)); break; }
    }
    pop = next; gen++;
    front = pop.filter(p => p.rank === 0).sort((a, b) => a.f[0] - b.f[0]);
    // dedupe identical objective vectors
    front = front.filter((p, i) => i === 0 || p.f[0] !== front[i - 1].f[0] || p.f[1] !== front[i - 1].f[1]);
    // follow a balanced middle solution until the visitor picks one themselves
    if (!userPicked) selected = Math.floor(front.length / 2);
    if (selected >= front.length) selected = front.length - 1;
  }

  function init(seed) {
    rand = mulberry32(seed);
    pts = [{ x: 0.5, y: 0.5 }];
    for (let i = 0; i < N_CUST; i++) pts.push({ x: 0.08 + rand() * 0.84, y: 0.08 + rand() * 0.84 });
    pop = [];
    for (let i = 0; i < POP; i++) {
      const g = Array.from({ length: N_CUST }, (_, k) => k + 1).concat(Array(N_VAN - 1).fill(0));
      for (let k = g.length - 1; k > 0; k--) { const j = Math.floor(rand() * (k + 1)); [g[k], g[j]] = [g[j], g[k]]; }
      pop.push({ g, f: evaluate(g) });
    }
    gen = 0; selected = 0; front = [];
    sortFronts(pop); pop.forEach(p => (p.cd = 0));
    step();
    selected = Math.floor(front.length / 2);
  }

  function sizeCanvas(c) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = c.clientWidth;
    if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(w * dpr); }
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [ctx, w];
  }

  function drawMap() {
    const [ctx, w] = sizeCanvas(mapC);
    ctx.clearRect(0, 0, w, w);
    // stylised river, purely decorative
    ctx.strokeStyle = "#dbe7f3"; ctx.lineWidth = w * 0.05; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0, w * 0.62);
    ctx.bezierCurveTo(w * 0.3, w * 0.45, w * 0.45, w * 0.85, w * 0.7, w * 0.66);
    ctx.bezierCurveTo(w * 0.85, w * 0.55, w * 0.95, w * 0.7, w, w * 0.6); ctx.stroke();
    ctx.strokeStyle = "#eeece6"; ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      ctx.beginPath(); ctx.moveTo((i * w) / 8, 0); ctx.lineTo((i * w) / 8, w); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, (i * w) / 8); ctx.lineTo(w, (i * w) / 8); ctx.stroke();
    }
    const sol = front[selected];
    if (sol) {
      routesOf(sol.g).forEach((r, k) => {
        if (!r.length) return;
        ctx.strokeStyle = COLORS[k % 3]; ctx.lineWidth = 2.2; ctx.lineJoin = "round";
        ctx.beginPath(); ctx.moveTo(pts[0].x * w, pts[0].y * w);
        r.forEach(c => ctx.lineTo(pts[c].x * w, pts[c].y * w));
        ctx.lineTo(pts[0].x * w, pts[0].y * w); ctx.stroke();
      });
    }
    ctx.fillStyle = "#16181d";
    for (let i = 1; i < pts.length; i++) { ctx.beginPath(); ctx.arc(pts[i].x * w, pts[i].y * w, 3.5, 0, 7); ctx.fill(); }
    ctx.fillRect(pts[0].x * w - 6, pts[0].y * w - 6, 12, 12);
    ctx.font = "11px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#4f5561";
    ctx.fillText("depot ■  customers ●", 8, w - 8);
  }

  let bounds = null;
  function drawFront() {
    const [ctx, w] = sizeCanvas(frontC);
    ctx.clearRect(0, 0, w, w);
    const pad = 34;
    const xs = pop.map(p => p.f[0]), ys = pop.map(p => p.f[1]);
    // bounds ease towards current population so the plot stays readable
    const tgt = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    bounds = bounds && !reduceMotion ? bounds.map((b, i) => b + (tgt[i] - b) * 0.15) : tgt;
    const [x0, x1, y0, y1] = bounds;
    const sx = v => pad + ((v - x0) / (x1 - x0 || 1)) * (w - pad * 1.6);
    const sy = v => w - pad - ((v - y0) / (y1 - y0 || 1)) * (w - pad * 1.6);
    ctx.strokeStyle = "#d9d6cc"; ctx.beginPath();
    ctx.moveTo(pad, pad * 0.5); ctx.lineTo(pad, w - pad); ctx.lineTo(w - pad * 0.5, w - pad); ctx.stroke();
    ctx.fillStyle = "#4f5561"; ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.fillText("total distance →", pad + 4, w - pad + 18);
    ctx.save(); ctx.translate(14, w - pad - 4); ctx.rotate(-Math.PI / 2); ctx.fillText("longest route →", 0, 0); ctx.restore();
    ctx.fillStyle = "rgba(79,85,97,.28)";
    pop.forEach(p => { if (p.rank) { ctx.beginPath(); ctx.arc(sx(p.f[0]), sy(p.f[1]), 2.5, 0, 7); ctx.fill(); } });
    ctx.strokeStyle = "#0b5cad"; ctx.lineWidth = 1.5; ctx.beginPath();
    front.forEach((p, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, sx(p.f[0]), sy(p.f[1])));
    ctx.stroke();
    front.forEach((p, i) => {
      ctx.fillStyle = "#0b5cad"; ctx.beginPath(); ctx.arc(sx(p.f[0]), sy(p.f[1]), 4, 0, 7); ctx.fill();
      if (i === selected) {
        ctx.strokeStyle = "#c2410c"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(sx(p.f[0]), sy(p.f[1]), 9, 0, 7); ctx.stroke(); ctx.lineWidth = 1.5;
      }
    });
    ctx.fillStyle = "#16181d"; ctx.textAlign = "right"; ctx.fillText("Pareto front (" + front.length + ")", w - 8, 14); ctx.textAlign = "left";
    frontC._sx = sx; frontC._sy = sy;
  }

  function updateReadout() {
    const s = front[selected];
    if (!s) return;
    readout.textContent = `distance ${(s.f[0] * 100).toFixed(0)} · longest ${(s.f[1] * 100).toFixed(0)}`;
  }

  function render() { drawMap(); drawFront(); genEl.textContent = "gen " + gen; }

  function loop() {
    scheduled = false;
    if (running && gen < MAX_GEN) { step(); if (gen % 10 === 0) updateReadout(); }
    if (gen >= MAX_GEN && running) { running = false; toggleBtn.textContent = "Run"; }
    render();
    kick();
  }

  function start(seed) {
    userPicked = false; init(seed); bounds = null;
    if (reduceMotion) {
      // no animation: solve up front, show the final front
      while (gen < MAX_GEN) step();
      running = false; toggleBtn.textContent = "Run";
      render(); updateReadout();
    } else {
      running = true; toggleBtn.textContent = "Pause"; kick();
    }
  }

  frontC.addEventListener("click", e => {
    const r = frontC.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    let best = 0, bd = Infinity;
    front.forEach((p, i) => { const d = Math.hypot(frontC._sx(p.f[0]) - x, frontC._sy(p.f[1]) - y); if (d < bd) { bd = d; best = i; } });
    selected = best; userPicked = true; updateReadout(); render();
  });
  frontC.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") selected = Math.max(0, selected - 1);
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") selected = Math.min(front.length - 1, selected + 1);
    else return;
    userPicked = true; e.preventDefault(); updateReadout(); render();
  });
  toggleBtn.addEventListener("click", () => {
    if (running) { running = false; toggleBtn.textContent = "Run"; return; }
    if (gen >= MAX_GEN) gen = 0;
    running = true; toggleBtn.textContent = "Pause"; kick();
  });
  document.getElementById("reset").addEventListener("click", () => { running = false; start((Math.random() * 1e9) | 0); });
  addEventListener("resize", () => render());
  // only animate while the demo is on screen (battery + main thread)
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; kick(); }).observe(frontC);

  start(2026);
})();
