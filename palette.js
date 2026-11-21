// Command palette (Ctrl/⌘ K or "/"). Optional extra: every item is also a normal link on the page.
(function () {
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  if (isMac) document.querySelectorAll(".kbd-hint").forEach((k) => (k.textContent = "⌘K"));

  const dlg = document.getElementById("palette");
  const input = document.getElementById("pal-input");
  const list = document.getElementById("pal-list");
  const go = (id) => () => {
    const el = document.getElementById(id);
    el.scrollIntoView();
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };
  const ITEMS = [
    { label: "Live demo: Pareto front", hint: "#demo", act: () => document.getElementById("front").focus() },
    { label: "Research: dissertation", hint: "#research", act: go("research") },
    { label: "Route: operations → AI", hint: "#route", act: go("route") },
    { label: "Projects: ls ~/work", hint: "#work", act: go("work") },
    { label: "Skills", hint: "#skills", act: go("skills") },
    { label: "Outside work", hint: "#beyond", act: go("beyond") },
    { label: "Email Oguz", hint: "mailto", act: () => (location.href = "mailto:oguzcayir99@gmail.com") },
    { label: "Open GitHub", hint: "link", act: () => (location.href = "https://github.com/OguzCayir") },
    { label: "Open LinkedIn", hint: "link", act: () => (location.href = "https://www.linkedin.com/in/oguz-kagan-cayir/") },
  ];
  let shown = ITEMS, sel = 0;

  function draw() {
    const q = input.value.toLowerCase();
    shown = ITEMS.filter((i) => i.label.toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = "";
    shown.forEach((it, i) => {
      const li = document.createElement("li");
      li.id = "opt" + i;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", i === sel);
      const a = document.createElement("span"); a.textContent = it.label;
      const b = document.createElement("span"); b.className = "hint"; b.textContent = it.hint;
      li.append(a, b);
      li.addEventListener("click", () => choose(i));
      list.appendChild(li);
    });
    input.setAttribute("aria-activedescendant", shown.length ? "opt" + sel : "");
  }
  function choose(i) { const it = shown[i]; dlg.close(); if (it) it.act(); }
  function open() { if (dlg.open) return; input.value = ""; sel = 0; draw(); dlg.showModal(); input.focus(); }

  document.getElementById("open-palette").addEventListener("click", open);
  document.addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) { e.preventDefault(); open(); }
  });
  input.addEventListener("input", () => { sel = 0; draw(); });
  input.addEventListener("keydown", (e) => {
    const n = Math.max(1, shown.length);
    if (e.key === "ArrowDown") { sel = (sel + 1) % n; draw(); e.preventDefault(); }
    if (e.key === "ArrowUp") { sel = (sel - 1 + n) % n; draw(); e.preventDefault(); }
    if (e.key === "Enter") { e.preventDefault(); choose(sel); }
  });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
})();
