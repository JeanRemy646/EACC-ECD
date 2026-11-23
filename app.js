(() => {
  let L;
  try {
    L = localStorage.getItem("eacc-lang");
  } catch (e) {}
  if (L !== "fr" && L !== "en")
    L = (navigator.language || "").startsWith("en") ? "en" : "fr";
  const $ = (s, r = document) => [...r.querySelectorAll(s)];
  $("#yr")[0].textContent = new Date().getFullYear();
  const menu = $("#menu")[0],
    nav = $("#nav")[0];
  menu.onclick = () => {
    const o = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", o);
  };
  function validate(f, show = true) {
    const v = (n) => f.elements[n];
    let ok = true;
    const rules = {
      name: v("name").value.trim().length >= 2,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email").value),
      prog: !!v("prog").value,
      msg: v("msg").value.trim().length >= 10,
    };
    for (const k in rules) {
      const bad = !rules[k];
      if (bad) ok = false;
      if (show) {
        v(k).setAttribute("aria-invalid", bad);
        $("#e_" + k)[0].hidden = !bad;
      }
    }
    return ok;
  }
  const root = document.documentElement,
    dm = matchMedia("(prefers-color-scheme: dark)"),
    eff = () => root.dataset.theme || "light",
    tb = $("#theme")[0];
  function upd() {
    const d = eff() === "dark";
    tb.textContent = d ? "☀" : "☾";
    tb.setAttribute(
      "aria-label",
      tb.dataset[L === "fr" ? "labelFr" : "labelEn"],
    );
    tb.title = tb.getAttribute("aria-label");
  }
  tb.onclick = () => {
    const n = eff() === "dark" ? "light" : "dark";
    root.dataset.theme = n;
    try {
      localStorage.setItem("eacc-theme", n);
    } catch (e) {}
    upd();
  };
  dm.addEventListener("change", upd);
  function apply() {
    document.documentElement.lang = L;
    $("img[data-alt-en]").forEach(
      (e) => (e.alt = e.dataset["alt" + (L === "en" ? "En" : "Fr")]),
    );
    $("select option[data-en]").forEach(
      (e) => (e.textContent = e.dataset[L]),
    );
    $("[data-label-fr][data-label-en]").forEach((e) => {
      e.setAttribute("aria-label", e.dataset[L === "fr" ? "labelFr" : "labelEn"]);
    });
    const search = $("#asr")[0];
    if (search) {
      search.placeholder =
        search.dataset[L === "fr" ? "placeholderFr" : "placeholderEn"];
      search.setAttribute(
        "aria-label",
        search.dataset[L === "fr" ? "labelFr" : "labelEn"],
      );
    }
    const title = $("title")[0];
    document.title = title.dataset[L];
    $("meta[name=description]")[0].content =
      $("meta[name=description]")[0].dataset[L];
    upd();
    if (window.renderA) renderA();
    $(".lang button").forEach((b) =>
      b.setAttribute("aria-pressed", b.dataset.l === L),
    );
    const f = $("#contactForm")[0];
    if (f && f.dataset.touched) validate(f);
  }
  $(".lang button").forEach(
    (b) =>
      (b.onclick = () => {
        L = b.dataset.l;
        try {
          localStorage.setItem("eacc-lang", L);
        } catch (e) {}
        apply();
      }),
  );
  apply();
  // photo placeholders
  $("figure.ph img").forEach((i) => {
    const m = () => i.parentNode.classList.add("miss");
    i.addEventListener("error", m);
    if (i.complete && !i.naturalWidth) m();
  });
  // reveal
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12 },
  );
  $(".rv").forEach((e) => io.observe(e));
  // program explorer
  const tabs = $("[role=tab]");
  if (tabs.length) {
    const sel = (t) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute("aria-selected", on);
        x.tabIndex = on ? 0 : -1;
        $("#" + x.getAttribute("aria-controls"))[0].hidden = !on;
      });
      t.focus();
    };
    tabs.forEach((t, i) => {
      t.onclick = () => sel(t);
      t.onkeydown = (e) => {
        const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (k) {
          e.preventDefault();
          sel(tabs[(i + k + tabs.length) % tabs.length]);
        }
      };
    });
    const h = location.hash.slice(1);
    const s = tabs.find((x) => x.id === "tab-" + h);
    if (s) sel(s);
  }
  // contact form
  const f = $("#contactForm")[0];
  if (f) {
    const st = $("#status")[0];
    if (new URLSearchParams(location.search).get("sent") === "1") {
      st.dataset.message = "ok";
      st.style.display = "block";
    }
    f.addEventListener("submit", (e) => {
      f.dataset.touched = 1;
      if (!validate(f)) {
        e.preventDefault();
        f.querySelector("[aria-invalid=true]").focus();
        return;
      }
      f.elements._replyto.value = f.elements.email.value;
    });
    f.addEventListener(
      "blur",
      (e) => {
        f.dataset.touched = 1;
        validate(f);
      },
      true,
    );
  }
  const pg = $("#pg")[0],
    tp = $("#top")[0];
  addEventListener(
    "scroll",
    () => {
      const h = document.documentElement;
      pg.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`;
      tp.hidden = h.scrollTop < 600;
    },
    { passive: true },
  );
  tp.onclick = () => scrollTo({ top: 0, behavior: "smooth" });
  // learning journey
  const jr = $("#journey")[0];
  if (jr) {
    const stages = $("[data-journey-stage]", jr);
    const panels = $("[data-journey-panel]", jr);
    const selectStage = (index, focus = false) => {
      stages.forEach((stage, i) => {
        stage.setAttribute("aria-pressed", i === index);
        panels[i].hidden = i !== index;
      });
      if (focus) stages[index].focus();
    };
    stages.forEach((stage, i) => {
      stage.onclick = () => selectStage(i);
      stage.onkeydown = (event) => {
        const direction = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
        if (direction === undefined) return;
        event.preventDefault();
        selectStage(
          (i + direction + stages.length) % stages.length,
          true,
        );
      };
    });
  }
  // gallery + lightbox
  const gi = $(".gal figure");
  if (gi.length) {
    const lb = $("#lb")[0],
      im = $("#lb img")[0];
    let ix = 0;
    const vis = () => gi.filter((g) => !g.hidden);
    const open = (i) => {
      const v = vis();
      ix = (i + v.length) % v.length;
      const s = v[ix].querySelector("img");
      im.src = s.src;
      im.alt = s.alt;
      if (!lb.open) lb.showModal();
    };
    gi.forEach((g) => {
      g.tabIndex = 0;
      g.onclick = () => open(vis().indexOf(g));
      g.onkeydown = (e) => {
        if (e.key === "Enter") g.onclick();
      };
    });
    $("#lbp")[0].onclick = () => open(ix - 1);
    $("#lbn")[0].onclick = () => open(ix + 1);
    $("#lbc")[0].onclick = () => lb.close();
    lb.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") open(ix - 1);
      if (e.key === "ArrowRight") open(ix + 1);
    });
    lb.onclick = (e) => {
      if (e.target === lb) lb.close();
    };
    $(".flt button").forEach(
      (b) =>
        (b.onclick = () => {
          $(".flt button").forEach((x) =>
            x.setAttribute("aria-pressed", x === b),
          );
          gi.forEach(
            (g) =>
              (g.hidden = b.dataset.c !== "all" && g.dataset.c !== b.dataset.c),
          );
        }),
    );
  }
  // prefill program from ?p=
  if (f) {
    const p = new URLSearchParams(location.search).get("p");
    if (p && f.elements.prog) f.elements.prog.value = p;
  }
  const hero = $(".hero[data-slides]")[0];
  if (hero) {
    const box = document.createElement("div");
    box.className = "hs";
    hero.dataset.slides.split(",").forEach((n, i) => {
      const m = new Image();
      m.src = "images/" + n;
      m.alt = "";
      if (!i) m.className = "on";
      box.append(m);
    });
    hero.prepend(box);
    const im = [...box.children];
    let i = 0,
      pz = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const b = document.createElement("button");
    b.className = "hp";
    b.type = "button";
    const sync = () => {
      b.textContent = pz ? "▶" : "❚❚";
      b.setAttribute("aria-pressed", pz);
      b.setAttribute("aria-label", hero.dataset[L === "fr" ? "labelFr" : "labelEn"]);
    };
    b.onclick = () => {
      pz = !pz;
      sync();
    };
    hero.append(b);
    sync();
    setInterval(() => {
      if (pz || document.hidden) return;
      im[i].classList.remove("on");
      i = (i + 1) % im.length;
      im[i].classList.add("on");
    }, 6500);
  }
  const co = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        const el = e.target,
          T = +el.dataset.count,
          S = el.dataset.suf || "";
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const t0 = performance.now();
        (function f(n) {
          const p = Math.min((n - t0) / 1300, 1);
          el.textContent = Math.round(T * (1 - Math.pow(1 - p, 3))) + S;
          if (p < 1) requestAnimationFrame(f);
        })(t0);
      }),
    { threshold: 0.6 },
  );
  $("[data-count]").forEach((e) => co.observe(e));
  $(".card,ul.obj li").forEach((c) => {
    c.addEventListener("pointerleave", () => {
      c.style.setProperty("--rx", "0deg");
      c.style.setProperty("--ry", "0deg");
    });
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty(
        "--rx",
        ((e.clientY - r.top) / r.height - 0.5) * -9 + "deg",
      );
      c.style.setProperty(
        "--ry",
        ((e.clientX - r.left) / r.width - 0.5) * 9 + "deg",
      );
      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });
  let ly = 0;
  const hd = $("header.nav")[0];
  addEventListener(
    "scroll",
    () => {
      const y = scrollY;
      hd.classList.toggle(
        "hide",
        y > ly && y > 320 && !nav.classList.contains("open"),
      );
      ly = y;
    },
    { passive: true },
  );
  const cp = $("#cp")[0];
  if (cp)
    cp.onclick = async () => {
      try {
        await navigator.clipboard.writeText("+250788610220");
        cp.classList.add("copied");
        setTimeout(() => cp.classList.remove("copied"), 1800);
      } catch (e) {}
    };
  // 3D toy blocks + bouncing ball
  const COL = ["#d94a4a", "#2e9e55", "#3a7bd5", "#f2c230"],
    LET = ["ABC123", "MSBCEA", "123ABC", "SMECBA"];
  function toys(host, specs, sm) {
    const w = document.createElement("div");
    w.className = "toys" + (sm ? " sm" : "");
    w.setAttribute("aria-hidden", "true");
    const t = document.createElement("div");
    t.className = "t3";
    specs.forEach((p, i) => {
      const c = document.createElement("div");
      c.className = "cw";
      c.style.cssText = `--s:${p[0]}px;left:${p[1]}%;top:${p[2]}%;animation-delay:${-i * 1.3}s`;
      c.innerHTML = `<div class="cube" style="--c:${COL[i % 4]};animation-duration:${14 + i * 3}s;animation-delay:${-i * 4}s">${[...LET[i % 4]].map((x) => `<i>${x}</i>`).join("")}</div>`;
      c.onclick = () => {
        c.classList.remove("hop");
        void c.offsetWidth;
        c.classList.add("hop");
      };
      c.addEventListener("animationend", (e) => {
        if (e.animationName === "hop") c.classList.remove("hop");
      });
      t.append(c);
    });
    t.insertAdjacentHTML(
      "beforeend",
      '<div class="bsh"></div><div class="ball"></div>',
    );
    w.append(t);
    host.append(w);
    host.addEventListener("pointermove", (e) => {
      const r = host.getBoundingClientRect(),
        x = (e.clientX - r.left) / r.width - 0.5,
        y = (e.clientY - r.top) / r.height - 0.5;
      t.style.transform = `rotateY(${x * 26}deg) rotateX(${-y * 18}deg)`;
    });
  }
  const th0 = $(".hero")[0];
  if (th0)
    toys(th0, [
      [104, 6, 4],
      [84, 58, 18],
      [74, 24, 54],
      [62, 66, 60],
    ]);
  const th1 = $(".phead")[0];
  if (th1)
    toys(
      th1,
      [
        [64, 20, 12],
        [48, 62, 50],
      ],
      1,
    );
  // announcements
  const ah = $("#annhome")[0],
    al = $("#ann")[0];
  if (ah || al) {
    let cat = "all",
      q = "";
    const list = al || ah;
    const cards = $(".an", list);
    const empty = $(".ann-empty", list)[0];
    cards
      .slice()
      .sort((a, b) => (b.dataset.date || "").localeCompare(a.dataset.date || ""))
      .forEach((card) => list.append(card));
    const formatDate = (date, options) =>
      new Intl.DateTimeFormat(L, options).format(new Date(date + "T12:00:00"));
    window.renderA = () => {
      let shown = 0;
      cards.forEach((card) => {
        const date = card.dataset.date;
        const title = $(`.locale-${L}`, $("h3", card)[0])[0].textContent;
        const body = $(`.locale-${L}`, $("p", card)[0])[0].textContent;
        const matches =
          (!al || cat === "all" || card.dataset.cat === cat) &&
          (!al || (title + " " + body).toLowerCase().includes(q));
        card.hidden = !matches;
        if (matches) shown++;
        if (date) {
          $(".ad b", card)[0].textContent = formatDate(date, {
            day: "numeric",
          });
          $(".ad span", card)[0].textContent = formatDate(date, {
            month: "short",
            year: "2-digit",
          });
          $("time", card)[0].textContent = formatDate(date, {
            dateStyle: "long",
          });
          $("time", card)[0].hidden = false;
          $(".standing", card)[0].hidden = true;
        }
      });
      if (empty) empty.hidden = shown > 0;
    };
    if (al) {
      $(".flt button").forEach(
        (b) =>
          (b.onclick = () => {
            cat = b.dataset.c;
            $(".flt button").forEach((x) =>
              x.setAttribute("aria-pressed", x === b),
            );
            renderA();
          }),
      );
      $("#asr")[0].oninput = (e) => {
        q = e.target.value.toLowerCase();
        renderA();
      };
    }
    renderA();
  }
  // flip cards
  $(".fc").forEach((c) => {
    const t = () =>
      c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") !== "true");
    c.onclick = t;
    c.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        t();
      }
    };
  });
})();
