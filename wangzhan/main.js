/* ==========================================================================
   Loss 下降中 · 个人主页 交互脚本
   零依赖，原生 JS。所有需要你改的东西都集中在下面 SITE 配置里。
   ========================================================================== */

/* ==========================================================================
   ① 配置区 —— 上传前只需要改这里
   ========================================================================== */
const SITE = {
  // 你的名字（会以打字机效果出现）
  name: "Loss 下降中",

  // GitHub 用户名：改成你自己的，例如 "loss-descent"
  githubUser: "your-github-username",

  // 邮箱
  email: "huangtianhao2026@stu.gdou.edu.cn",
};

/* ==========================================================================
   ② 工具函数
   ========================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* ==========================================================================
   ③ 应用配置：GitHub 链接 / 邮箱链接
   ========================================================================== */
function applyConfig() {
  const gh = $("#linkGithub");
  if (gh) {
    if (SITE.githubUser && SITE.githubUser !== "your-github-username") {
      gh.href = `https://github.com/${SITE.githubUser}`;
    } else {
      gh.href = "https://github.com";
    }
  }

  const mail = $("#linkMail");
  if (mail) mail.href = `mailto:${SITE.email}`;

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
}

/* ==========================================================================
   ④ 滚动揭示
   ========================================================================== */
function initReveal() {
  const items = $$(".reveal");
  if (!items.length) return;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    // threshold 用 0：只要露出一点点就算可见。
    // 用比例阈值会让"很高的元素"永远达不到比例而卡在隐藏状态。
    // rootMargin 底部留 -6% 只是为了错开节奏，仍保留一点边界余量。
    { threshold: 0, rootMargin: "0px 0px -6% 0px" }
  );

  items.forEach((el) => io.observe(el));

  // 每个元素都挂一个独立保险：进入视口一段时间后仍未显示，就强制显示。
  // 动画失败可以接受，内容看不见不可以接受。
  items.forEach((el, i) => {
    window.setTimeout(() => {
      el.classList.add("is-visible");
    }, 900 + i * 40);
  });
}

/* ==========================================================================
   ⑤ 打字机：名字
   ========================================================================== */
function initTypedName() {
  const el = $("#typedName");
  if (!el) return;

  const text = SITE.name;

  if (prefersReducedMotion) {
    el.textContent = text;
    return;
  }

  // 主标题用渐变文字，打字时逐字增长
  el.textContent = "";
  let i = 0;

  const step = () => {
    if (i > text.length) return;
    el.textContent = text.slice(0, i);
    i += 1;
    window.setTimeout(step, 95 + Math.random() * 70);
  };

  // 等页面淡入后再开始
  window.setTimeout(step, 620);
}

/* ==========================================================================
   ⑥ 数字滚动
   ========================================================================== */
function initCounters() {
  const counters = $$(".counter");
  if (!counters.length) return;

  const run = (el) => {
    const target = Number(el.dataset.target || 0);
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    };

    requestAnimationFrame(tick);
  };

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    counters.forEach((el) => {
      el.textContent = String(Number(el.dataset.target || 0));
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0, rootMargin: "0px 0px -20% 0px" }
  );

  counters.forEach((el) => io.observe(el));
}

/* ==========================================================================
   ⑦ 技能进度条
   ========================================================================== */
function initSkillBars() {
  const skills = $$(".skill");
  if (!skills.length) return;

  const fill = (el) => {
    const bar = $(".skill__bar > i", el);
    if (!bar) return;
    const level = Math.max(0, Math.min(100, Number(el.dataset.level || 0)));
    bar.style.width = level + "%";
  };

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    skills.forEach(fill);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        fill(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0, rootMargin: "0px 0px -14% 0px" }
  );

  skills.forEach((el) => io.observe(el));
}

/* ==========================================================================
   ⑧ 伪终端：逐行输出
   ========================================================================== */
const TERMINAL_LINES = [
  { html: '<span class="t-prompt">$</span> git init', delay: 340 },
  { html: '<span class="t-dim">Initialized empty Git repository in ~/loss-descent/.git/</span>', delay: 260 },
  { html: '<span class="t-prompt">$</span> git add .', delay: 380 },
  { html: '<span class="t-prompt">$</span> git commit -m <span class="t-ok">"feat: 第一个真正上线的项目"</span>', delay: 420 },
  { html: '<span class="t-dim">[main (root-commit) a1b2c3d] feat: 第一个真正上线的项目</span>', delay: 300 },
  { html: '<span class="t-dim"> 4 files changed, 1286 insertions(+)</span>', delay: 240 },
  { html: '<span class="t-prompt">$</span> git push origin main', delay: 400 },
  { html: '<span class="t-ok">✓ pushed — loss is descending…</span>', delay: 320 },
  { html: '<span class="t-warn">!</span> <span class="t-dim">状态：还没收敛，但每一步都在变小。</span>', delay: 300 },
];

function initTerminal() {
  const body = $("#terminalBody");
  if (!body) return;

  if (prefersReducedMotion) {
    body.innerHTML = TERMINAL_LINES.map((l) => l.html).join("\n");
    return;
  }

  let idx = 0;

  const next = () => {
    if (idx >= TERMINAL_LINES.length) return;
    const line = TERMINAL_LINES[idx];
    body.innerHTML += (idx > 0 ? "\n" : "") + line.html;
    idx += 1;
    window.setTimeout(next, line.delay);
  };

  // 屏幕进入视野后再开始
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          window.setTimeout(next, 500);
        });
      },
      { threshold: 0 }
    );
    io.observe(body);
  } else {
    next();
  }
}

/* ==========================================================================
   ⑨ 导航：滚动状态 / 移动端菜单 / 当前区块高亮
   ========================================================================== */
function initNav() {
  const nav = $("#nav");
  const toggle = $("#navToggle");
  const links = $(".nav__links");
  const progress = $("#scrollProgress");

  const onScroll = () => {
    const y = window.scrollY || window.pageYOffset;

    if (nav) nav.classList.toggle("is-scrolled", y > 12);

    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (y / h) * 100 : 0;
      progress.style.width = pct.toFixed(2) + "%";
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // 点击链接后自动收起
    $$("a", links).forEach((a) => {
      a.addEventListener("click", () => {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 当前区块高亮
  const sections = $$("main section[id]");
  const navAnchors = $$('.nav__links a[href^="#"]');

  if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navAnchors.forEach((a) => {
            const active = a.getAttribute("href") === `#${id}`;
            a.style.color = active ? "#fff" : "";
          });
        });
      },
      { threshold: 0.1, rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((s) => io.observe(s));
  }
}

/* ==========================================================================
   ⑩ 背景粒子画布（"Loss 曲线"意象：光点向低谷汇聚）
   ========================================================================== */
function initCanvas() {
  const canvas = $("#bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let particles = [];
  let rafId = null;
  let running = false;

  const mouse = { x: -9999, y: -9999, active: false };

  const COLORS = ["78,225,193", "91,140,255", "176,108,255"];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function build() {
    // 根据屏幕面积决定粒子数，移动端更少
    const base = Math.round((w * h) / 26000);
    const count = Math.max(26, Math.min(96, base));

    particles = Array.from({ length: count }, () => spawn());
  }

  function spawn() {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      // 基础速度很小，形成缓慢漂浮感
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22 + 0.06, // 略微向下 = "下降"
      r: Math.random() * 1.7 + 0.6,
      color,
      alpha: Math.random() * 0.5 + 0.25,
      // 每个粒子自己的呼吸相位
      phase: Math.random() * Math.PI * 2,
      speed: 0.006 + Math.random() * 0.01,
    };
  }

  const LINK_DIST = 132;

  function frame() {
    ctx.clearRect(0, 0, w, h);

    // 先画粒子间连线
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > LINK_DIST * LINK_DIST) continue;

        const d = Math.sqrt(d2);
        const t = 1 - d / LINK_DIST;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${a.color},${(t * 0.14).toFixed(3)})`;
        ctx.lineWidth = 0.6;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // 再画粒子本体
    particles.forEach((p) => {
      p.phase += p.speed;
      p.x += p.vx;
      p.y += p.vy;

      // 鼠标轻微吸引，形成"被牵引"的手感
      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 26000 && d2 > 1) {
          const f = (1 - d2 / 26000) * 0.02;
          p.x += dx * f;
          p.y += dy * f;
        }
      }

      // 环绕边界
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      const a = p.alpha * (0.62 + 0.38 * Math.sin(p.phase));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${a.toFixed(3)})`;
      ctx.fill();

      // 光晕
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${(a * 0.07).toFixed(3)})`;
      ctx.fill();
    });

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  // 尺寸变化（防抖）
  let rt = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(rt);
    rt = window.setTimeout(resize, 180);
  });

  // 页面不可见时停掉动画，省电
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (prefersReducedMotion === false) start();
  });

  // 鼠标位置
  window.addEventListener(
    "pointermove",
    (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!mouse.active) {
        mouse.active = true;
        document.body.classList.add("has-cursor");
      }

      const spot = $(".cursor-spot");
      if (spot) {
        spot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    },
    { passive: true }
  );

  resize();

  if (prefersReducedMotion) {
    // 静态画一帧，不做动画
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha.toFixed(3)})`;
      ctx.fill();
    });
    return;
  }

  start();
}

/* ==========================================================================
   ⑪ 卡片跟随鼠标的微倾斜（只给没有触屏的精细指针）
   ========================================================================== */
function initTilt() {
  if (prefersReducedMotion) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const cards = $$(".skill, .log, .contact__item:not(.contact__item--static)");

  cards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

/* ==========================================================================
   ⑫ 启动
   每个模块独立 try/catch：任何一个出错，其余照常运行，
   并且保证页面内容最终可见（内容可见性优先于动效）。
   ========================================================================== */
function boot() {
  const modules = [
    ["config", applyConfig],
    ["nav", initNav],
    ["reveal", initReveal],
    ["typedName", initTypedName],
    ["counters", initCounters],
    ["skillBars", initSkillBars],
    ["terminal", initTerminal],
    ["canvas", initCanvas],
    ["tilt", initTilt],
  ];

  modules.forEach(([label, fn]) => {
    try {
      fn();
    } catch (err) {
      console.error(`[site] 模块 "${label}" 初始化失败：`, err);
    }
  });

  // 最终兜底：无论如何，让人能看到内容
  window.setTimeout(() => {
    const hidden = $$(".reveal").filter(
      (el) => !el.classList.contains("is-visible")
    );
    // 如果 1.5 秒后仍有大量元素没显示，说明观察器没生效，直接全部显示
    if (hidden.length > 3) {
      hidden.forEach((el) => el.classList.add("is-visible"));
    }
  }, 1500);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}