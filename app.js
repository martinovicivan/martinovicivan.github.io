/* app.js — renders content.js as a Jupyter-style notebook whose cells
   "type and execute" as they scroll into view. No dependencies. */
(() => {
  "use strict";

  const S = window.SITE;
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const pyStr = s => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  const pretty = u => {
    try { u = decodeURI(u); } catch (e) { /* keep as is */ }
    return u.replace(/^mailto:/, "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  };
  const href = (key, url) => (key === "email" && !url.startsWith("mailto:") ? "mailto:" + url : url);
  const ext = (url, label) => `<a href="${esc(url)}"${/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── tiny Python highlighter ───────────────────────────────────────────────
  const KW = new Set("and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield".split(" "));
  const CONST = new Set(["True", "False", "None"]);
  const BUILTIN = new Set("print len range enumerate zip sorted map filter list dict set tuple str int float open super isinstance display".split(" "));
  const TOKEN = /(#[^\n]*)|((?:[rRbBuUfF]{1,2})?(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(@[A-Za-z_][\w.]*)|(\d+(?:\.\d+)?)|([A-Za-z_]\w*)|(\s+)|(.)/g;

  function tokenize(src) {
    const out = [];
    let m, prev = "";
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(src))) {
      const [t, cmt, str, deco, num, id, ws, other] = m;
      let cls = "";
      if (cmt) cls = "cmt";
      else if (str) cls = "str";
      else if (deco) cls = "deco";
      else if (num) cls = "num";
      else if (id) {
        const rest = src.slice(TOKEN.lastIndex);
        if (CONST.has(id)) cls = "num";
        else if (KW.has(id)) cls = "kw";
        else if (prev === "def") cls = "fn";
        else if (prev === "class") cls = "cls";
        else if (id === "self") cls = "self";
        else if (rest[0] === "(") cls = BUILTIN.has(id) ? "builtin" : /^[A-Z]/.test(id) ? "cls" : "fn";
        else if (/^=(?!=)/.test(rest) && (prev === "(" || prev === ",")) cls = "param";
        else if (BUILTIN.has(id)) cls = "builtin";
        else if (/^[A-Z]/.test(id)) cls = "cls";
      } else if (other && /[=+\-*/%<>!&|^~]/.test(other)) cls = "op";
      out.push([cls, t]);
      if (!ws) prev = t;
    }
    return out;
  }

  function renderTokens(tokens, k = Infinity) {
    let html = "", n = 0;
    for (const [cls, t] of tokens) {
      if (n >= k) break;
      const part = n + t.length > k ? t.slice(0, k - n) : t;
      n += part.length;
      html += cls ? `<span class="t-${cls}">${esc(part)}</span>` : esc(part);
    }
    return html;
  }

  // ── helpers for outputs ───────────────────────────────────────────────────
  const isMe = a => {
    const n = a.replace(/[*†‡]/g, "").trim();
    return n === S.name || (S.nameAliases || []).includes(n);
  };
  const initials = S.name.split(/\s+/).map(w => w[0]).slice(0, 2).join("");
  const linkEntries = () => Object.entries(S.links || {}).filter(([, v]) => v);

  function autoBib(p) {
    const clean = a => a.replace(/[*†‡]/g, "").trim();
    const last = clean(p.authors[0]).split(/\s+/).pop().normalize("NFD").toLowerCase().replace(/[^a-z]/g, "");
    const word = ((p.title.match(/[A-Za-z]{4,}/) || ["paper"])[0]).toLowerCase();
    const type = p.type || (/arxiv|journal|transactions/i.test(p.venueFull || p.venue) ? "article" : "inproceedings");
    const field = type === "article" ? "journal" : type.endsWith("thesis") ? "school" : "booktitle";
    return `@${type}{${last}${p.year}${word},\n  title     = {${p.title}},\n  author    = {${p.authors.map(clean).join(" and ")}},\n  ${field.padEnd(9)} = {${p.venueFull || p.venue}},\n  year      = {${p.year}}\n}`;
  }

  // ── cell definitions ──────────────────────────────────────────────────────
  // kind: "markdown" | "code" | "empty". Code cells provide code(state) and render(state).
  // Each notebook (tab) has its own list; cell ids must be unique across notebooks.
  const defs = [];

  defs.push({
    id: "top", kind: "markdown", file: "README.md", ext: "md",
    src: () => `# ${S.name}\n**${S.position}** · ${S.affiliationShort}\n\n*This page is a live notebook — scroll to execute the cells, or press ▶▶ to run them all.*`,
    html: () => `<h1>${esc(S.name)}</h1>
      <p class="tagline"><b>${esc(S.position)}</b> · ${esc(S.affiliation)}</p>
      <p class="hint">This page is a live notebook — scroll to execute the cells<span class="desktop-only">, or press <kbd>▶▶</kbd> to run them all</span>.</p>`,
  });

  defs.push({
    id: "about", kind: "code", title: "About", file: "about.py", ext: "py", result: true,
    code: () => {
      const ints = S.interests.map(pyStr);
      const intsCode = ints.join(", ").length < 46 ? `[${ints.join(", ")}]` : `[\n        ${ints.join(",\n        ")},\n    ]`;
      return `from research import Researcher\n\nme = Researcher(\n    name=${pyStr(S.name)},\n    position=${pyStr(S.position)},\n    affiliation=${pyStr(S.affiliationShort)},\n    interests=${intsCode},\n)\nme`;
    },
    render: () => `<div class="about">
        <div class="about-photo">${S.photo ? `<img src="${esc(S.photo)}" alt="Photo of ${esc(S.name)}">` : `<div class="avatar">${esc(initials)}</div>`}</div>
        <div class="about-text">
          ${S.bio.map(p => `<p>${p}</p>`).join("")}
          <div class="pills">${linkEntries().map(([k, v]) => `<a class="pill" href="${esc(href(k, v))}"${/^https?:/.test(v) ? ' target="_blank" rel="noopener"' : ""}>${esc(k)} <span aria-hidden="true">${v.startsWith("#") ? "→" : "↗"}</span></a>`).join("")}${S.cvPdf ? `<a class="pill" href="${esc(S.cvPdf)}" target="_blank" rel="noopener">cv.pdf <span aria-hidden="true">↓</span></a>` : ""}</div>
        </div>
      </div>`,
  });

  if (S.news && S.news.length) defs.push({
    id: "news", kind: "code", title: "News", file: "news.csv", ext: "csv", result: true, init: { all: false },
    code: st => `import pandas as pd\n\nnews = pd.read_csv("news.csv", parse_dates=["date"])\n${st.all ? "news" : `news.head(${S.newsShown})`}`,
    render: st => {
      const rows = st.all ? S.news : S.news.slice(0, S.newsShown);
      const more = S.news.length > S.newsShown;
      return `<div class="df-wrap"><table class="df">
          <thead><tr><th></th><th>date</th><th>news</th></tr></thead>
          <tbody>${rows.map((n, i) => `<tr><th>${i}</th><td class="date">${esc(n.date)}</td><td>${n.text}</td></tr>`).join("")}</tbody>
        </table></div>
        <div class="df-foot">${st.all ? `[${S.news.length} rows × 2 columns]` : `${rows.length} of ${S.news.length} rows`}${more ? ` · <button class="linkish" data-act="news-toggle">${st.all ? "show fewer" : "show all"}</button>` : ""}</div>`;
    },
  });

  // the selected/all toggle only appears once some paper is marked selected: true
  const hasSelected = (S.publications || []).some(p => p.selected);
  if (S.publications && S.publications.length) defs.push({
    id: "publications", kind: "code", title: "Publications", file: "papers.bib", ext: "bib", result: true, init: { all: !hasSelected },
    code: st => `papers = load_bib("papers.bib")\n${st.all ? `papers.sort_values("year", ascending=False)` : `papers.filter(selected=True)`}`,
    render: st => {
      const all = S.publications;
      const sel = all.filter(p => p.selected);
      const list = st.all ? [...all].sort((a, b) => b.year - a.year) : sel;
      let html = !hasSelected ? "" : `<div class="widget" role="group" aria-label="Filter publications">
          <button data-act="pubs-sel" class="${st.all ? "" : "on"}" aria-pressed="${!st.all}">selected (${sel.length})</button>
          <button data-act="pubs-all" class="${st.all ? "on" : ""}" aria-pressed="${st.all}">all (${all.length})</button>
        </div>`;
      let year = null;
      for (const p of list) {
        if (st.all && p.year !== year) { year = p.year; html += `<div class="pub-year"># ── ${year} ──</div>`; }
        const l = p.links || {};
        const main = l.project || l.pdf || l.openreview || l.arxiv || "";
        html += `<article class="pub">
            <div class="pub-side">
              <span class="venue">${esc(p.venue)}</span>
              ${p.award ? `<span class="award">★ ${esc(p.award)}</span>` : ""}
              ${p.image ? `<img class="pub-thumb" src="${esc(p.image)}" alt="" loading="lazy">` : ""}
            </div>
            <div class="pub-body">
              <h3 class="pub-title">${main ? ext(main, esc(p.title)) : esc(p.title)}</h3>
              <div class="pub-authors">${p.authors.map(a => (isMe(a) ? `<span class="me">${esc(a)}</span>` : esc(a))).join(", ")}</div>
              <div class="pub-meta">${esc(p.venueFull || p.venue)}, ${p.year}${p.authors.some(a => a.includes("*")) ? ` <span class="eq">· * equal contribution</span>` : ""}</div>
              <div class="pub-links">
                ${p.abstract ? `<button class="btn" data-act="abs" aria-expanded="false">abs</button>` : ""}
                ${Object.entries(p.links || {}).filter(([, v]) => v).map(([k, v]) => ext(v, esc(k)).replace("<a ", '<a class="btn" ')).join("")}
                <button class="btn" data-act="bib" aria-expanded="false">bib</button>
              </div>
              ${p.abstract ? `<div class="pub-abs" hidden>${p.abstract}</div>` : ""}
              <div class="pub-bib" hidden><pre>${esc(p.bibtex || autoBib(p))}</pre><button class="btn copy" data-act="copy">copy</button></div>
            </div>
          </article>`;
      }
      return html;
    },
  });

  if (S.teaching && S.teaching.length) defs.push({
    id: "teaching", kind: "code", title: "Teaching", file: "teaching.py", ext: "py",
    code: () => `for course in teaching:\n    print(f"{course.term:<9} {course.name:<28} {course.role}")`,
    render: () => `<div class="stdout">${S.teaching.map(t => `<div class="line">
          <span class="term">${esc(t.term)}</span>
          <span class="name">${t.url ? ext(t.url, esc(t.course)) : esc(t.course)}</span>
          <span class="role">${esc(t.role)}</span>
        </div>`).join("")}</div>`,
  });

  defs.push({
    id: "contact", kind: "code", title: "Contact", file: "contact.json", ext: "json", result: true,
    code: () => `me.contact`,
    render: () => {
      const entries = linkEntries().filter(([k]) => k !== "cv").map(([k, v]) => [k, ext(href(k, v), esc(pretty(v)))]);
      if (S.office) entries.push(["office", esc(S.office)]);
      return `<div class="pyrepr">${entries.map(([k, v], i) =>
        `<div>${i === 0 ? "{" : "&nbsp;"}<span class="k">'${esc(k)}'</span>: <span class="v">'${v}'</span>${i === entries.length - 1 ? "}" : ","}</div>`).join("")}</div>`;
    },
  });

  defs.push({ id: "end", kind: "empty", comment: S.endComment || "" });

  // a "## Title" markdown cell above every titled code cell; it takes over the section id
  const withHeadings = list => list.flatMap(d => !d.title ? [d] : [
    { id: d.id, section: d.id, kind: "markdown", heading: true, src: () => `## ${d.title}`, html: () => `<h2>${esc(d.title)}</h2>` },
    { ...d, id: `${d.id}-code`, section: d.id },
  ]);

  const NB = [{ key: "main", file: S.notebook, title: S.name, defs: withHeadings(defs) }];

  // ── cv.ipynb ──────────────────────────────────────────────────────────────
  const cvEntries = list => `<div class="cv-list">${list.map(e => `<article class="cv-entry">
      <div class="cv-when">${esc(e.when)}</div>
      <div class="cv-what">
        <h3 class="cv-title">${e.title}</h3>
        <div class="cv-org">${e.org}${e.place ? ` <span class="place">· ${esc(e.place)}</span>` : ""}</div>
        ${e.items && e.items.length ? `<ul class="cv-items">${e.items.map(i => `<li>${i}</li>`).join("")}</ul>` : ""}
      </div>
    </article>`).join("")}</div>`;

  if (S.cv) {
    const cvDefs = [{
      id: "cv", kind: "markdown", file: "README.md", ext: "md",
      src: () => `# Curriculum Vitae\n**${S.name}** · ${S.position} · ${S.affiliationShort}${S.cv.updated ? `\n\n*Last updated ${S.cv.updated}.*` : ""}`,
      html: () => `<h1>Curriculum Vitae</h1>
        <p class="tagline"><b>${esc(S.name)}</b> · ${esc(S.position)} · ${esc(S.affiliationShort)}</p>
        ${S.cv.updated ? `<p class="hint">Last updated ${esc(S.cv.updated)}.</p>` : ""}
        ${S.cvPdf ? `<p class="md-actions"><a class="btn" href="${esc(S.cvPdf)}" download>download as PDF ↓</a></p>` : ""}`,
    }];
    if (S.cv.education && S.cv.education.length) cvDefs.push({
      id: "cv-education", kind: "code", title: "Education", file: "education.yaml", ext: "yaml", result: true,
      code: () => `from cv import CV\n\ncv = CV.from_yaml("cv.yaml")\ncv.education`,
      render: () => cvEntries(S.cv.education),
    });
    if (S.cv.experience && S.cv.experience.length) cvDefs.push({
      id: "cv-experience", kind: "code", title: "Experience", file: "experience.yaml", ext: "yaml", result: true,
      code: () => `cv.experience`,
      render: () => cvEntries(S.cv.experience),
    });
    if (S.publications && S.publications.length) cvDefs.push({
      id: "cv-publications", kind: "code", title: "Publications", file: "papers.bib", ext: "bib", result: true,
      code: () => `cv.publications = load_bib("papers.bib")\ncv.publications.sort_values("year", ascending=False)`,
      render: () => `<ol class="cv-pubs" reversed>${[...S.publications].sort((a, b) => b.year - a.year).map(p => {
        const l = p.links || {};
        const url = l.pdf || l.openreview || l.arxiv || l.project || "";
        return `<li>${p.authors.map(a => (isMe(a) ? `<b>${esc(a)}</b>` : esc(a))).join(", ")}. ${url ? ext(url, esc(p.title)) : esc(p.title)}. <i>${esc(p.venueFull || p.venue)}</i>, ${p.year}.${p.award ? ` <span class="cv-award">★ ${esc(p.award)}</span>` : ""}</li>`;
      }).join("")}</ol>${S.publications.some(p => p.authors.some(a => a.includes("*"))) ? `<div class="df-foot">* equal contribution</div>` : ""}`,
    });
    if (S.cv.awards && S.cv.awards.length) cvDefs.push({
      id: "cv-awards", kind: "code", title: "Awards", file: "awards.csv", ext: "csv", result: true,
      code: () => `cv.awards.sort_values("date", ascending=False)`,
      render: () => `<div class="df-wrap"><table class="df">
          <thead><tr><th></th><th>date</th><th>award</th></tr></thead>
          <tbody>${S.cv.awards.map((a, i) => `<tr><th>${i}</th><td class="date">${esc(a.date)}</td><td><b>${a.award}</b>${a.details ? `<div class="df-sub">${a.details}</div>` : ""}</td></tr>`).join("")}</tbody>
        </table></div>`,
    });
    cvDefs.push({ id: "cv-end", kind: "empty", comment: S.cv.hobbies ? `# hobbies: ${S.cv.hobbies}` : "" });
    NB.push({ key: "cv", file: "cv.ipynb", title: `CV · ${S.name}`, defs: withHeadings(cvDefs) });
  }

  // ── build DOM ─────────────────────────────────────────────────────────────
  const root = $("#notebook");
  const byEl = new Map();
  let current = null; // the visible notebook

  const meta = $('meta[name="description"]');
  if (meta && S.description) meta.content = S.description;

  for (const nb of NB) {
    nb.page = document.createElement("div");
    nb.page.className = "nb-page";
    nb.page.hidden = true;
    nb.cells = [];
    nb.execCount = 0;
    for (const def of nb.defs) {
      const el = document.createElement("section");
      el.className = `cell ${def.kind}-cell${def.heading ? " heading-cell" : ""}`;
      el.id = def.id;
      const c = { def, el, nb, st: { ...(def.init || {}) }, state: "idle", shown: "" };

      if (def.kind === "markdown") {
        el.innerHTML = `<div class="prompt" aria-hidden="true"></div>
          <div class="md-body">${def.html()}</div>
          <div class="editor md-src" hidden aria-hidden="true"><pre></pre></div>`;
        $(".md-src pre", el).innerHTML = renderTokens([["md", def.src()]]);
        el.addEventListener("dblclick", () => toggleMarkdown(c, true));
      } else if (def.kind === "code") {
        el.innerHTML = `<div class="prompt prompt-in" aria-hidden="true">In [ ]:</div>
          <div class="editor" aria-hidden="true"><pre class="ghost"></pre><pre class="live"></pre></div>
          <div class="prompt prompt-out" aria-hidden="true"></div>
          <div class="output">${def.render(c.st)}</div>`;
        c.prompt = $(".prompt-in", el);
        c.outPrompt = $(".prompt-out", el);
        c.ghost = $(".ghost", el);
        c.live = $(".live", el);
        c.out = $(".output", el);
        c.ghost.innerHTML = renderTokens(tokenize(def.code(c.st)));
      } else {
        el.innerHTML = `<div class="prompt prompt-in" aria-hidden="true">In [ ]:</div>
          <div class="editor" aria-hidden="true"><pre>${def.comment ? renderTokens(tokenize(def.comment)) : ""}<span class="caret"></span></pre></div>`;
      }
      nb.page.appendChild(el);
      nb.cells.push(c);
      byEl.set(el, c);
    }
    const foot = document.createElement("footer");
    foot.className = "nb-foot";
    foot.innerHTML = `<span class="t-cmt"># ${S.footer}</span>`;
    nb.page.appendChild(foot);
    root.appendChild(nb.page);
  }

  // tabs + explorer tree (only the open notebook is expanded)
  const pdfLink = S.links && /\.pdf$/i.test(S.links.cv || "") ? S.links.cv : "";
  function renderChrome() {
    $("#tabs").innerHTML = NB.map(nb => `<a class="tab${nb === current ? " active" : ""}" href="#${nb.cells[0].def.id}"><span class="ext" data-ext="ipynb">nb</span>${esc(nb.file)}${nb === current ? '<span class="x" aria-hidden="true">×</span>' : ""}</a>`).join("") +
      (pdfLink ? `<a class="tab" href="${esc(pdfLink)}" target="_blank" rel="noopener"><span class="ext" data-ext="pdf">pdf</span>cv.pdf</a>` : "");
    $("#files").innerHTML = NB.map(nb => `<li><a class="file nbfile${nb === current ? " open" : ""}" href="#${nb.cells[0].def.id}"><span class="ext" data-ext="ipynb">nb</span>${esc(nb.file)}</a></li>` +
      (nb !== current ? "" : nb.cells.filter(c => c.def.file).map(c =>
        `<li><a class="file sub" href="#${c.def.section || c.def.id}" data-target="${c.def.section || c.def.id}"><span class="ext" data-ext="${c.def.ext}">${c.def.ext}</span>${c.def.file}</a></li>`).join(""))).join("") +
      (pdfLink ? `<li><a class="file nbfile" href="${esc(pdfLink)}" target="_blank" rel="noopener"><span class="ext" data-ext="pdf">pdf</span>cv.pdf</a></li>` : "");
  }
  $("#folder").textContent = "▾ " + S.notebook.replace(/\.ipynb$/, "");
  $("#side-foot").innerHTML = S.updated ? `<span class="t-cmt"># updated ${esc(S.updated)}</span>` : "";

  // ── kernel / execution engine ─────────────────────────────────────────────
  let running = false, interrupted = false;
  const queue = [];

  function setKernel(state) {
    document.body.dataset.kernel = state;
    $("#kstat").textContent = { idle: "Idle", busy: "Busy", restarting: "Restarting…" }[state];
  }
  const setPrompt = (c, n) => { c.prompt.textContent = `In [${n}]:`; };

  function draw(c, tokens, k, caret) {
    c.live.innerHTML = renderTokens(tokens, k) + (caret ? '<span class="caret"></span>' : "");
  }

  function animate(c, tokens, from, to, msPerChar) {
    return new Promise(resolve => {
      const n = Math.abs(to - from);
      if (!n) return resolve();
      const dur = Math.min(1100, Math.max(160, n * msPerChar));
      const t0 = performance.now();
      const step = now => {
        const f = interrupted ? 1 : Math.min(1, (now - t0) / dur);
        draw(c, tokens, Math.round(from + (to - from) * f), true);
        f < 1 ? requestAnimationFrame(step) : resolve();
      };
      requestAnimationFrame(step);
    });
  }

  async function execute(c, fast) {
    c.state = "running";
    c.el.classList.add("running");
    setPrompt(c, "*");
    const code = c.def.code(c.st);
    const tokens = tokenize(code);
    const wasShown = c.el.classList.contains("executed");
    c.el.classList.remove("executed");
    c.ghost.innerHTML = renderTokens(tokens);

    if (fast) draw(c, tokens, code.length, false);
    else {
      // backspace to the common prefix, then type the rest
      const old = c.shown;
      let p = 0;
      while (p < old.length && p < code.length && old[p] === code[p]) p++;
      if (old.length > p) await animate(c, tokenize(old), old.length, p, 5);
      await animate(c, tokens, p, code.length, 9);
      draw(c, tokens, code.length, false);
    }
    c.shown = code;

    await sleep(fast ? 40 : wasShown ? 160 : 320);
    c.out.innerHTML = c.def.render(c.st);
    const n = ++c.nb.execCount;
    setPrompt(c, n);
    c.outPrompt.textContent = c.def.result ? `Out[${n}]:` : "";
    c.el.classList.remove("running");
    c.el.classList.add("executed");
    c.state = "done";
  }

  function enqueue(c, { fast = false } = {}) {
    if (c.def.kind !== "code" || c.state === "queued" || c.state === "running") return;
    c.state = "queued";
    setPrompt(c, "*");
    queue.push({ c, fast });
    pump();
  }

  async function pump() {
    if (running) return;
    running = true;
    setKernel("busy");
    while (queue.length) {
      const { c, fast } = queue.shift();
      await execute(c, fast || reduceMotion || interrupted || queue.length >= 2);
    }
    interrupted = false;
    running = false;
    setKernel("idle");
  }

  async function restart() {
    setKernel("restarting");
    queue.forEach(q => (q.c.state = "idle"));
    queue.length = 0;
    interrupted = true;
    while (running) await sleep(30);
    interrupted = false;
    current.execCount = 0;
    for (const c of current.cells) {
      if (c.def.kind !== "code") continue;
      c.state = "idle";
      c.st = { ...(c.def.init || {}) };
      c.shown = "";
      c.el.classList.remove("executed", "running");
      c.prompt.textContent = "In [ ]:";
      c.outPrompt.textContent = "";
      c.live.innerHTML = "";
      c.ghost.innerHTML = renderTokens(tokenize(c.def.code(c.st)));
      c.out.innerHTML = c.def.render(c.st);
    }
    setKernel("busy");
    window.scrollTo({ top: 0, behavior: "instant" });
    await sleep(450);
    setKernel("idle");
    runVisible();
  }


  // ── markdown raw/rendered toggle (double-click, like Jupyter) ─────────────
  function toggleMarkdown(c, raw) {
    $(".md-body", c.el).hidden = raw;
    $(".md-src", c.el).hidden = !raw;
    c.el.classList.toggle("editing", raw);
  }

  // ── active cell tracking ──────────────────────────────────────────────────
  let active = null;
  function setActive(c) {
    if (c === active) return;
    if (active) active.el.classList.remove("active");
    active = c;
    c.el.classList.add("active");
    document.querySelectorAll(".file[data-target]").forEach(f => f.classList.toggle("active", f.dataset.target === (c.def.section || c.def.id)));
    $("#sb-cell").textContent = `Cell ${current.cells.indexOf(c) + 1} of ${current.cells.length}`;
  }
  function updateActive() {
    const y = innerHeight * 0.4;
    const cells = current.cells;
    let best = cells[0];
    for (const c of cells) if (c.el.getBoundingClientRect().top <= y) best = c;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) best = cells[cells.length - 1];
    setActive(best);
  }
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; updateActive(); runVisible(); });
  }, { passive: true });

  // sticky offsets
  function measure() {
    const root = document.documentElement.style;
    root.setProperty("--chrome-h", $("#chrome").offsetHeight + "px");
  }
  addEventListener("resize", () => { measure(); runVisible(); });

  // ── interactions ──────────────────────────────────────────────────────────
  const goTo = c => c && c.el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });

  function switchTo(nb) {
    if (current) current.page.hidden = true;
    if (active) active.el.classList.remove("active");
    active = null;
    current = nb;
    nb.page.hidden = false;
    document.title = nb.title;
    renderChrome();
    measure();
  }

  // every in-page link (#id) goes through here: it may live in another notebook
  function navigate(id, { push = true } = {}) {
    const el = id && document.getElementById(id);
    const nb = (el && NB.find(n => n.page.contains(el))) || NB[0];
    const target = el && nb.page.contains(el) ? el : nb.cells[0].el;
    const switching = nb !== current;
    if (switching) switchTo(nb);
    if (push) history[switching ? "pushState" : "replaceState"](null, "", "#" + target.id);
    if (!switching) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    else if (target === nb.cells[0].el) window.scrollTo({ top: 0, behavior: "instant" });
    else { target.scrollIntoView({ behavior: "instant", block: "start" }); pinTo(target); }
    updateActive();
    const c = byEl.get(target);
    if (c) enqueue(c);
    runVisible();
  }

  // run cells as they scroll into view (top above 85% of the viewport height)
  function runVisible() {
    for (const c of current.cells) {
      const r = c.el.getBoundingClientRect();
      if (c.state === "idle" && r.top < innerHeight * 0.85 && r.bottom > 0) enqueue(c);
    }
  }

  // after an instant jump, late layout shifts (web fonts, images) would push the target
  // under the header: keep it aligned for a moment unless the visitor scrolls
  let pin = null;
  function pinTo(el) {
    pin = { el, y: scrollY };
    setTimeout(() => (pin = null), 3000);
  }
  new ResizeObserver(() => {
    if (!pin || Math.abs(scrollY - pin.y) > 1) return (pin = null);
    pin.el.scrollIntoView({ behavior: "instant", block: "start" });
    pin.y = scrollY;
  }).observe(root);

  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
    const id = decodeURIComponent(a.getAttribute("href").slice(1));
    if (!id) return;
    e.preventDefault();
    navigate(id);
  });
  addEventListener("popstate", () => navigate(decodeURIComponent(location.hash.slice(1)), { push: false }));

  function runAndAdvance() {
    const cells = current.cells;
    const c = active || cells[0];
    if (c.def.kind === "markdown") toggleMarkdown(c, false);
    if (c.def.kind === "code") enqueue(c, { fast: c.state === "done" });
    goTo(cells[cells.indexOf(c) + 1]);
  }

  root.addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const c = byEl.get(b.closest(".cell"));
    const act = b.dataset.act;
    if (act === "news-toggle") { c.st.all = !c.st.all; enqueue(c); }
    else if (act === "pubs-sel" || act === "pubs-all") {
      const all = act === "pubs-all";
      if (c.st.all !== all) { c.st.all = all; enqueue(c); }
    } else if (act === "abs" || act === "bib") {
      const panel = $(".pub-" + act, b.closest(".pub"));
      panel.hidden = !panel.hidden;
      b.classList.toggle("on", !panel.hidden);
      b.setAttribute("aria-expanded", String(!panel.hidden));
    } else if (act === "copy") {
      const text = $("pre", b.parentElement).textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(
        () => { b.textContent = "copied ✓"; setTimeout(() => (b.textContent = "copy"), 1400); },
        () => { b.textContent = "select & copy"; });
    }
  });

  $("#btn-run").addEventListener("click", runAndAdvance);
  $("#btn-runall").addEventListener("click", () => current.cells.forEach(c => c.state === "idle" && enqueue(c, { fast: true })));
  $("#btn-stop").addEventListener("click", () => { if (running) interrupted = true; });
  $("#btn-restart").addEventListener("click", restart);
  const themeBtn = $("#btn-theme");
  const labelTheme = () => {
    const label = document.documentElement.dataset.theme === "light" ? "Switch to dark theme" : "Switch to light theme";
    themeBtn.title = label;
    themeBtn.setAttribute("aria-label", label);
  };
  themeBtn.addEventListener("click", () => {
    const t = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = t;
    labelTheme();
    try { localStorage.setItem("nb-theme", t); } catch (e) { /* storage unavailable */ }
  });
  labelTheme();

  addEventListener("keydown", e => {
    if (e.target.closest("input, textarea, [contenteditable]") || e.ctrlKey || e.metaKey || e.altKey) return;
    const cells = current.cells;
    const i = cells.indexOf(active);
    if (e.key === "Enter" && e.shiftKey) { e.preventDefault(); runAndAdvance(); }
    else if (e.key === "j") goTo(cells[Math.min(cells.length - 1, i + 1)]);
    else if (e.key === "k") goTo(cells[Math.max(0, i - 1)]);
    else if (e.key === "Escape" && active && active.def.kind === "markdown") toggleMarkdown(active, false);
  });

  // ── go ────────────────────────────────────────────────────────────────────
  setKernel("idle");
  navigate(decodeURIComponent(location.hash.slice(1)), { push: false });
  if (reduceMotion) NB.forEach(nb => nb.cells.forEach(c => enqueue(c, { fast: true })));
  if (document.fonts) document.fonts.ready.then(measure);
})();
