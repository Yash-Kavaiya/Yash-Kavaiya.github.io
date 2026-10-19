(function () {
  "use strict";

  const data = window.SITE_DATA || { projects: [], posts: [], categories: [] };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Theme ----------
  const themeBtn = $("#themeToggle");
  const setThemeIcon = () => {
    const light = document.documentElement.getAttribute("data-theme") === "light";
    themeBtn.innerHTML = light ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
  };
  setThemeIcon();
  themeBtn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    setThemeIcon();
  });

  // ---------- Mobile menu ----------
  const menuBtn = $("#menuToggle");
  const navLinks = $("#navLinks");
  const closeMenu = () => {
    navLinks.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
  };
  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });
  $$("a", navLinks).forEach((a) => a.addEventListener("click", closeMenu));

  // ---------- Scroll state: nav border, back-to-top, active link ----------
  const nav = $("#nav");
  const toTop = $("#toTop");
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 8);
    toTop.classList.toggle("is-visible", y > 700);
  }, { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0 }));

  if ("IntersectionObserver" in window) {
    const linkFor = (id) => $(`.nav__links a[href="#${id}"]`);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const link = linkFor(e.target.id);
        if (link && e.isIntersecting) {
          $$(".nav__links a").forEach((a) => a.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((s) => spy.observe(s));
  }

  // ---------- Projects ----------
  const catLabel = Object.fromEntries(data.categories.map((c) => [c.id, c.label]));
  const catIcon = { agents: "fa-robot", cx: "fa-headset", apps: "fa-wand-magic-sparkles", tools: "fa-screwdriver-wrench", fun: "fa-gamepad" };

  function projectCard(p, featured) {
    const links = [];
    if (p.demo) links.push(`<a class="live" href="${esc(p.demo)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live</a>`);
    if (p.video) links.push(`<a href="${esc(p.video)}" target="_blank" rel="noopener"><i class="fa-brands fa-youtube"></i> Video</a>`);
    if (p.repo) links.push(`<a href="${esc(p.repo)}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> Code</a>`);
    if (p.slides) links.push(`<a href="${esc(p.slides)}" target="_blank" rel="noopener"><i class="fa-regular fa-file-pdf"></i> Slides</a>`);
    if (p.extra) links.push(`<a href="${esc(p.extra.url)}" target="_blank" rel="noopener"><i class="fa-solid fa-link"></i> ${esc(p.extra.label)}</a>`);
    return `
      <article class="project${featured ? " project--featured" : ""}">
        <div class="project__top">
          <span class="project__icon"><i class="fa-solid ${catIcon[p.category] || "fa-cube"}"></i></span>
          ${featured ? '<span class="badge">FEATURED</span>' : `<span class="project__cat">${esc(catLabel[p.category] || "")}</span>`}
        </div>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.desc)}</p>
        <div class="chips">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        <div class="project__links">${links.join("")}</div>
      </article>`;
  }

  $("#featuredGrid").innerHTML = data.projects.filter((p) => p.featured).map((p) => projectCard(p, true)).join("");

  const PAGE = 9;
  const state = { cat: "all", q: "", limit: PAGE };
  const grid = $("#projectGrid");
  const empty = $("#projectEmpty");
  const moreBtn = $("#showMore");
  const filters = $("#projectFilters");

  filters.innerHTML = data.categories.map((c) => {
    const n = c.id === "all" ? data.projects.filter((p) => !p.featured).length
                             : data.projects.filter((p) => !p.featured && p.category === c.id).length;
    return `<button class="chip-btn${c.id === "all" ? " is-active" : ""}" data-cat="${c.id}" role="tab">${esc(c.label)} <span class="muted">${n}</span></button>`;
  }).join("");

  function renderProjects() {
    const q = state.q.trim().toLowerCase();
    const list = data.projects.filter((p) => !p.featured)
      .filter((p) => state.cat === "all" || p.category === state.cat)
      .filter((p) => !q || [p.name, p.desc, ...p.tags].join(" ").toLowerCase().includes(q));
    grid.innerHTML = list.slice(0, state.limit).map((p) => projectCard(p, false)).join("");
    empty.hidden = list.length > 0;
    moreBtn.hidden = list.length <= state.limit;
    moreBtn.textContent = `Show more (${list.length - state.limit})`;
  }

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    $$("[data-cat]", filters).forEach((b) => b.classList.toggle("is-active", b === btn));
    state.cat = btn.dataset.cat;
    state.limit = PAGE;
    renderProjects();
  });
  $("#projectSearch").addEventListener("input", (e) => { state.q = e.target.value; state.limit = PAGE; renderProjects(); });
  moreBtn.addEventListener("click", () => { state.limit += PAGE; renderProjects(); });
  renderProjects();

  // ---------- Posts ----------
  const postIcon = { article: "fa-brands fa-medium", linkedin: "fa-brands fa-linkedin-in", x: "fa-brands fa-x-twitter" };
  const postCta = { article: "Read article", linkedin: "View on LinkedIn", x: "View on X" };
  const fmtDate = (d) => {
    if (!d) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }
    return d;
  };
  const postGrid = $("#postGrid");
  function renderPosts(type) {
    postGrid.innerHTML = data.posts.filter((p) => type === "all" || p.type === type).map((p) => `
      <a class="post" href="${esc(p.url)}" target="_blank" rel="noopener">
        <div class="post__meta"><i class="${postIcon[p.type]}"></i><span>${esc(p.source)}</span>${p.date ? `<time>${esc(fmtDate(p.date))}</time>` : ""}</div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.desc)}</p>
        <span class="link">${postCta[p.type]} <i class="fa-solid fa-arrow-right"></i></span>
      </a>`).join("");
  }
  $("#postFilters").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-type]");
    if (!btn) return;
    $$("[data-type]", e.currentTarget).forEach((b) => b.classList.toggle("is-active", b === btn));
    renderPosts(btn.dataset.type);
  });
  renderPosts("all");

  // ---------- Contact form (mailto, no backend needed on GitHub Pages) ----------
  const form = $("#contactForm");
  const note = $("#formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const name = (f.get("name") || "").trim();
    const email = (f.get("email") || "").trim();
    const msg = (f.get("message") || "").trim();
    if (!name || !msg || !/^\S+@\S+\.\S+$/.test(email)) {
      note.textContent = "Please add your name, a valid email and a message.";
      note.classList.add("is-error");
      return;
    }
    note.classList.remove("is-error");
    const subject = `${f.get("subject")} — from ${name}`;
    const body = `${msg}\n\n— ${name} (${email})`;
    window.location.href = `mailto:yash.kavaiya3@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = "Your email app should open now. Thanks for reaching out!";
  });

  // ---------- Copy email ----------
  $$(".copy").forEach((btn) => btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      setTimeout(() => (btn.innerHTML = '<i class="fa-regular fa-copy"></i>'), 1500);
    } catch (e) {}
  }));

  // ---------- Reveal on scroll ----------
  if ("IntersectionObserver" in window) {
    const els = $$(".section__head, .card, .talk, .oss__card, .course, .hack__item, .skill, .impact__item, .about__side");
    els.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }

  $("#year").textContent = new Date().getFullYear();
})();
