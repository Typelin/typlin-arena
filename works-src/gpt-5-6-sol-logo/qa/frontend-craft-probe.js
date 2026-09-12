/**
 * frontend-craft baseline probe — v2 (ground-truth rewrite)
 *
 * v1 的三个核心检查是死代码(getComputedStyle(el, ':focus-visible') 对伪类返回空串、
 * document.fonts.status 对懒加载的 @font-face 永远停在 unloaded、对比度从未被计算),
 * 并且会误伤 SKILL.md 自己推荐的字体栈。v2 改为「实测渲染结果」:
 *
 *   - 字体:用 96px 探针 span 量测实际字宽,与 serif / monospace 基准比对,
 *     静态声明不可信,渲染出血肉才算数。
 *   - 焦点:真实调用 .focus() 后读取 computed style,不再猜伪类。
 *   - 对比度:沿父链回溯到 <html> 做 alpha 合成,按 WCAG 相对亮度算真实比值。
 *   - 100vh:递归扫描 @media 嵌套规则与 inline style,桌面断点内的不算违规。
 *   - 状态:可选注入 window.__frontendCraftRuntime = { pageErrors, consoleErrors }
 *     (由 runner 在 evaluate 前注入),捕不到 console 的静态探针也能抓到死应用。
 *
 * 用法(Playwright / Node / 浏览器 Console):
 *   先注入 runtime(可选): await page.evaluate(() => { window.__frontendCraftRuntime = {...} })
 *   再执行:                 const r = await page.evaluate(probeSource + '; __frontendCraftProbe()')
 * 返回 { pass, version, viewport, failures, warnings, stats, quality }。
 * failures.length === 0 始可宣称完工;quality.score / coverage 诚实反映检查覆盖面。
 */
function __frontendCraftProbe() {
  "use strict";
  const version = "2.0.0";
  const failures = [];
  const warnings = [];
  const doc = document;
  const de = doc.documentElement;
  const vw = de.clientWidth;

  // 评分维度登记:exe = 实际执行过的检查数,fail = 其中失败的数目。
  const dims = {
    responsive: { exe: 0, fail: 0, possible: 4 },
    typography: { exe: 0, fail: 0, possible: 5 },
    interaction: { exe: 0, fail: 0, possible: 5 },
    a11y: { exe: 0, fail: 0, possible: 3 },
    resilience: { exe: 0, fail: 0, possible: 3 },
  };
  const hit = (d, ok) => { dims[d].exe++; if (!ok) dims[d].fail++; };

  const GEN = { "sans-serif": 1, serif: 1, monospace: 1, cursive: 1, fantasy: 1 };
  const ACCEPTED_GEN = { "-apple-system": 1, "system-ui": 1, "ui-sans-serif": 1, "ui-serif": 1, "ui-monospace": 1 };

  // ---------- 1. viewport meta ----------
  const vp = doc.querySelector('meta[name="viewport"]');
  if (!vp) {
    failures.push("missing <meta name=\"viewport\"> — 行动装置会以桌面宽度渲染后缩小");
    hit("responsive", false);
  } else {
    const c = (vp.getAttribute("content") || "").toLowerCase();
    const okW = c.includes("width=device-width");
    hit("responsive", okW);
    if (!okW) failures.push("viewport meta 缺 width=device-width: " + c);
    if (/user-scalable\s*=\s*(no|0)/.test(c)) failures.push("viewport 禁用了缩放 (user-scalable=no) — 违反 WCAG 1.4.4");
    const mx = c.match(/maximum-scale\s*=\s*([\d.]+)/);
    if (mx && parseFloat(mx[1]) < 2) failures.push("maximum-scale=" + mx[1] + " 低于 2,等同限制缩放");
  }

  // ---------- 2. 横向溢出 ----------
  const overflowPx = de.scrollWidth - de.clientWidth;
  if (overflowPx > 1) {
    const culprits = [];
    doc.querySelectorAll("*").forEach((el) => {
      if (culprits.length >= 8) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (r.right > vw + 1) {
        const st = getComputedStyle(el);
        const scrollable = st.overflowX === "auto" || st.overflowX === "scroll";
        if (!scrollable) {
          culprits.push(
            el.tagName.toLowerCase() +
              (el.id ? "#" + el.id : "") +
              (el.className && typeof el.className === "string"
                ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
                : "") +
              " right=" + Math.round(r.right) + "px"
          );
        }
      }
    });
    hit("responsive", false);
    failures.push(
      " 横向溢出 " + overflowPx + "px(scrollWidth " + de.scrollWidth +
        " > clientWidth " + de.clientWidth + ")。可疑元素: " +
        (culprits.length ? culprits.join(" | ") : "未定位到单一元素,检查 min-width / 固定宽度 / 未断行长字串")
    );
  } else {
    hit("responsive", true);
  }

  // ---------- 3. 字级 / 行高(锚定分类,不再误伤标题与次级文字) ----------
  const isDisplay = (el) =>
    /^H[1-6]$/.test(el.tagName) ||
    /(title|display|hero|kicker|headline|banner)/i.test((el.className && String(el.className)) || "") ||
    /(title|display|hero|kicker|headline|banner)/i.test(el.id || "");
  const isSecondary = (el) =>
    /^(FIGCAPTION|SMALL)$/.test(el.tagName) ||
    /(caption|note|hint|meta|badge|muted|secondary|helper)/i.test((el.className && String(el.className)) || "");

  const bodyNodes = [];
  const walker = doc.createTreeWalker(doc.body || de, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const p = n.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      const tag = p.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
      const st = getComputedStyle(p);
      if (st.display === "none" || st.visibility === "hidden" || st.opacity === "0") return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node;
  while ((node = walker.nextNode()) && bodyNodes.length < 3000) bodyNodes.push(node);

  let bodyLike = 0;
  let minBodyLH = Infinity;
  let minBodyFs = Infinity;
  const tinyNodes = [];
  bodyNodes.forEach((n) => {
    const len = n.nodeValue.trim().length;
    const p = n.parentElement;
    const st = getComputedStyle(p);
    const fs = parseFloat(st.fontSize);
    if (!fs) return;
    const lh = parseFloat(st.lineHeight);
    const ratio = lh ? lh / fs : null;

    if (len >= 30) {
      if (isDisplay(p)) {
        if (ratio !== null && ratio < 1.1) {
          warnings.push("标题行高过紧 " + ratio.toFixed(2) + ": " + p.tagName.toLowerCase() + " \"" + n.nodeValue.trim().slice(0, 18) + "…\"");
          hit("typography", false);
        } else {
          hit("typography", true);
        }
        return;
      }
      bodyLike++;
      if (isSecondary(p)) {
        // 次级文字地板 12px
        hit("typography", fs >= 12);
        if (fs < 12) failures.push("次级文字低于 12px 地板: " + fs + "px \"" + n.nodeValue.trim().slice(0, 24) + "\"");
        if (ratio !== null && ratio < 1.4) {
          warnings.push("次级文字行高 " + ratio.toFixed(2) + " 偏低");
          hit("typography", false);
        } else {
          hit("typography", true);
        }
        return;
      }
      // 正文地板:16px / 行高 1.5
      hit("typography", fs >= 16);
      if (fs < 16) failures.push("正文字级低于 16px 地板: " + fs + "px \"" + n.nodeValue.trim().slice(0, 24) + "\"");
      minBodyFs = Math.min(minBodyFs, fs);
      if (ratio !== null) minBodyLH = Math.min(minBodyLH, ratio);
      if (ratio !== null) {
        hit("typography", ratio >= 1.5);
        if (ratio < 1.5) failures.push("正文行高比 " + ratio.toFixed(2) + " 低于 1.5 地板: \"" + n.nodeValue.trim().slice(0, 24) + "\"");
      }
    } else if (fs < 12) {
      tinyNodes.push(fs + "px \"" + n.nodeValue.trim().slice(0, 16) + "\"");
    }
  });
  if (tinyNodes.length) warnings.push("极小字 <12px: " + tinyNodes.slice(0, 5).join(", "));

  // ---------- 4. 字体:双测量识别静默 fallback ----------
  const bodyFont = getComputedStyle(doc.body || de).fontFamily;
  const stack = bodyFont.split(",").map((f) => f.trim().replace(/^["']|["']$/g, ""));
  const first = stack[0] || "";
  if (GEN[first] && !ACCEPTED_GEN[first]) {
    failures.push("body font-family 以通用字族「" + first + "」起手 — 等同直接出货系统预设字体,请显式声明现代字体栈");
    hit("typography", false);
  } else {
    const named = stack.filter((f) => !GEN[f] && !ACCEPTED_GEN[f]);
    if (named.length === 0) {
      if (!(GEN[first] && !ACCEPTED_GEN[first])) {
        failures.push("body 未声明任何具体字族(只有通用字族: " + stack.join(",") + ") — 请显式声明现代字体栈");
        hit("typography", false);
      }
    } else {
      // 双测量原语:同一字族分别配 serif 与 monospace 各量一次。
      // 该字族真实存在 -> 两种测量都命中它,宽度相等;
      // 不存在 -> 第一次落到 serif,第二次落到 monospace,宽度必不等。
      // 多字族回退链:只要栈中「任一」声明的字族在当前环境存在,浏览器就会用它
      // 渲染(长回退链是为跨平台保险),命中即通过;全部不存在才算静默 fallback。
      const text = "wwwwmmmmmiiiiilll0000";
      const measure = (family) => {
        const s = document.createElement("span");
        s.textContent = text;
        s.style.cssText = "position:absolute;left:-99999px;top:-99999px;white-space:pre;font-size:96px;font-family:" + family;
        document.body.appendChild(s);
        const w = s.getBoundingClientRect().width;
        s.remove();
        return w;
      };
      let found = null;
      try {
        for (const fam of named) {
          const wSerif = measure('"' + fam + '", serif');
          const wMono = measure('"' + fam + '", monospace');
          if (Math.abs(wSerif - wMono) <= 1) {
            found = fam;
            break;
          }
        }
      } catch (e) {
        warnings.push("字体宽度检测跳过: " + e.message);
      }
      hit("typography", !!found);
      if (!found) {
        failures.push(
          "声明的字族在当前环境全部不存在(实际渲染为通用字体): " + named.slice(0, 4).join(", ") +
            " — 请 self-host 或改用已安装字族"
        );
      }
    }
  }

  // ---------- 5. 焦点可见性:真实 focus + computed style ----------
  const focusables = [...doc.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
    (el) => {
      if (el.disabled || el.getAttribute("aria-disabled") === "true") return false;
      const st = getComputedStyle(el);
      return st.display !== "none" && st.visibility !== "hidden";
    }
  );
  let strippedFocus = 0;
  let focusChecked = 0;
  focusables.slice(0, 24).forEach((el) => {
    focusChecked++;
    try {
      const before = getComputedStyle(el);
      el.focus({ preventScroll: true });
      const st = getComputedStyle(el);
      const noOutline = !st.outlineStyle || st.outlineStyle === "none" || parseFloat(st.outlineWidth) === 0;
      const noShadow = !st.boxShadow || st.boxShadow === "none";
      const noBorderSignal =
        (st.borderStyle === before.borderStyle || (!st.borderStyle && !before.borderStyle)) &&
        (st.borderColor === before.borderColor || (!st.borderColor && !before.borderColor));
      if (noOutline && noShadow && noBorderSignal) strippedFocus++;
      el.blur();
    } catch (e) {
      /* 该元素不可聚焦或已脱离文档,跳过 */
    }
  });
  hit("interaction", focusChecked > 0 ? strippedFocus === 0 : true);
  if (strippedFocus > 0) {
    failures.push(
      strippedFocus + "/" + focusChecked +
        " 个可聚焦元素在真实 focus 下没有 outline / box-shadow / border 任何可见信号(焦点完全不可见)"
    );
  }

  // ---------- 6. 触控目标 >= 44x44(行内链接豁免) ----------
  const isProseLink = (el) => {
    if (el.tagName !== "A") return false;
    const p = el.parentElement;
    if (!p) return false;
    if (!/^(P|LI|DD|BLOCKQUOTE|TD|FIGCAPTION|TH)$/.test(p.tagName)) return false;
    return (p.textContent || "").trim().length > 60;
  };
  const smallTargets = [];
  focusables.forEach((el) => {
    if (smallTargets.length >= 8) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.width < 44 || r.height < 44) {
      if (isProseLink(el) && r.width >= 20 && r.height >= 16) return; // 正文行内链,免检
      smallTargets.push(el.tagName.toLowerCase() + " " + Math.round(r.width) + "x" + Math.round(r.height));
    }
  });
  hit("interaction", smallTargets.length === 0);
  if (smallTargets.length) failures.push("触控目标小于 44x44: " + smallTargets.join(", "));

  // ---------- 7. 图片:alt / 尺寸 / 破损 ----------
  const imgs = [...doc.querySelectorAll("img")];
  const noAlt = imgs.filter((i) => !i.hasAttribute("alt"));
  hit("interaction", noAlt.length === 0);
  if (noAlt.length) failures.push(noAlt.length + "/" + imgs.length + " 张 <img> 没有 alt 属性");
  const noDim = imgs.filter((i) => !i.getAttribute("width") && !i.getAttribute("height") && !i.style.aspectRatio);
  if (noDim.length) warnings.push(noDim.length + "/" + imgs.length + " 张 <img> 未宣告尺寸或 aspect-ratio(CLS 风险)");
  const broken = imgs.filter((i) => i.complete && i.naturalWidth === 0 && !/^data:/i.test(i.src || ""));
  hit("interaction", broken.length === 0);
  if (broken.length) failures.push(broken.length + "/" + imgs.length + " 张 <img> 加载失败(src 指向不存在的资源或已 404)");

  // ---------- 8. 标题层级 ----------
  const heads = [...doc.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1]);
  const h1Count = heads.filter((n) => n === 1).length;
  if (h1Count === 0) {
    failures.push("页面没有 <h1>");
    hit("a11y", false);
  } else {
    hit("a11y", true);
  }
  if (h1Count > 1) warnings.push("有 " + h1Count + " 个 <h1>");
  for (let i = 1; i < heads.length; i++) {
    if (heads[i] - heads[i - 1] > 1) {
      warnings.push("标题层级跳号: h" + heads[i - 1] + " -> h" + heads[i]);
      break;
    }
  }

  // ---------- 9. 100vh 陷阱:递归扫描 + 桌面断点豁免 ----------
  const vhViol = [];
  let dvhCount = 0;
  const walkRules = (rules, desktopScoped) => {
    if (!rules) return;
    [...rules].forEach((r) => {
      let desktop = desktopScoped;
      if (r.media && r.media.mediaText) {
        const mt = r.media.mediaText;
        const m = mt.match(/min-width\s*:\s*(\d+(?:\.\d+)?)\s*(px|em|rem)/i);
        if (m) {
          let v = parseFloat(m[1]);
          if (m[2] !== "px") v *= 16;
          if (v >= 768) desktop = true;
        }
      }
      if (r.style && r.style.cssText) {
        if (/\b100vh\b/.test(r.style.cssText) && !desktop) {
          vhViol.push((r.media && r.media.mediaText ? r.media.mediaText + " " : "top-level ") + (r.selectorText || "?"));
        }
        if (/\b100dvh\b/.test(r.style.cssText)) dvhCount++;
      }
      if (r.cssRules) walkRules(r.cssRules, desktop);
    });
  };
  [...doc.styleSheets].forEach((s) => {
    try {
      walkRules(s.cssRules || [], false);
    } catch (e) {
      /* 跨域样式表读不到,略过 */
    }
  });
  [...doc.querySelectorAll("[style]")].forEach((el) => {
    const t = el.getAttribute("style") || "";
    if (/\b100vh\b/.test(t)) vhViol.push("inline style");
    if (/\b100dvh\b/.test(t)) dvhCount++;
  });
  hit("responsive", vhViol.length === 0);
  if (vhViol.length) {
    failures.push("非桌面断点下使用 100vh(" + vhViol.length + " 处:" + vhViol.slice(0, 3).join(" | ") + ") — 行动浏览器工具列会裁切,改用 100dvh/100svh");
  }
  if (dvhCount) warnings.push("良好实践: 已使用 100dvh " + dvhCount + " 处");

  // ---------- 10. 对比度:alpha 合成 + WCAG 相对亮度(纸面检查,不猜) ----------
  const rgba = (css) => {
    const m = css.match(/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+))?\s*\)/);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  };
  const composite = (s, d) => {
    const a = s.a + d.a * (1 - s.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: (s.r * s.a + d.r * d.a * (1 - s.a)) / a,
      g: (s.g * s.a + d.g * d.a * (1 - s.a)) / a,
      b: (s.b * s.a + d.b * d.a * (1 - s.a)) / a,
      a,
    };
  };
  const effectiveBg = (el) => {
    const chain = [];
    let n = el;
    while (n && n.nodeType === 1) {
      chain.unshift(n);
      n = n.parentElement;
    }
    let cur = null;
    let hasImage = false;
    for (const nd of chain) {
      const st = getComputedStyle(nd);
      if (st.backgroundImage && st.backgroundImage !== "none") hasImage = true;
      const c = rgba(st.backgroundColor);
      if (c) cur = cur ? composite(c, cur) : { r: c.r, g: c.g, b: c.b, a: c.a > 1 ? 1 : c.a };
    }
    if (!cur) cur = { r: 255, g: 255, b: 255, a: 1 };
    return { color: cur, hasImage };
  };
  const lum = (c) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (fg, bg) => {
    const l1 = lum(fg), l2 = lum(bg);
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  };

  const contrastIssues = [];
  const contrastNotes = [];
  let contrastChecked = 0;
  const proseCands = [...doc.querySelectorAll("p,li,figcaption,blockquote,dd,td")].filter((el) => {
    if (el.children.length > 2) return false;
    if ((el.textContent || "").trim().length < 30) return false;
    const st = getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") return false;
    const fs = parseFloat(st.fontSize);
    return fs >= 13 && fs <= 24;
  });
  const h1 = doc.querySelector("h1");
  if (h1) proseCands.unshift(h1);
  for (const el of proseCands.slice(0, 12)) {
    contrastChecked++;
    const st = getComputedStyle(el);
    const bg = effectiveBg(el);
    const fgC = rgba(st.color);
    if (!fgC) continue;
    const r = ratio({ r: fgC.r, g: fgC.g, b: fgC.b }, bg.color);
    const fs = parseFloat(st.fontSize);
    const large = fs >= 24 || (fs >= 18.66 && parseInt(st.fontWeight) >= 700);
    const need = large ? 3 : 4.5;
    const txt = (el.textContent || "").trim().slice(0, 32);
    if (r < need) contrastIssues.push(el.tagName.toLowerCase() + " " + r.toFixed(2) + ":1(需 " + need + ":1)" + (txt ? " \"" + txt + "…\"" : ""));
    if (parseFloat(st.opacity) <= 0.6) contrastNotes.push("opacity " + st.opacity + " 使 " + el.tagName.toLowerCase() + " 实际对比度低于纸面值");
    if (bg.hasImage) contrastNotes.push(el.tagName.toLowerCase() + " 的祖先有 background-image,对比度无法在纸面验证");
  }
  hit("a11y", contrastIssues.length === 0);
  if (contrastIssues.length) failures.push("对比度未达 WCAG AA(" + contrastIssues.slice(0, 3).join(" | ") + ")" + (contrastIssues.length > 3 ? " 等 " + contrastIssues.length + " 处" : ""));
  contrastNotes.slice(0, 2).forEach((s) => warnings.push(s));

  // ---------- 11. reduced-motion 支援 ----------
  let hasReducedRule = false;
  let animCount = 0;
  [...doc.styleSheets].forEach((s) => {
    let txt = "";
    try {
      const dump = (rules) => {
        [...rules].forEach((r) => {
          if (r.cssText) txt += r.cssText + "\n";
          if (r.cssRules) dump(r.cssRules);
        });
      };
      dump(s.cssRules || []);
    } catch (e) {
      /* 跨域样式表,略过 */
    }
    if (/prefers-reduced-motion/i.test(txt)) hasReducedRule = true;
  });
  try {
    animCount = document.getAnimations().filter((a) => a.playState === "running").length;
  } catch (e) {
    /* getAnimations 不可用,跳过 */
  }
  if (animCount > 0 && !hasReducedRule) {
    warnings.push("页面有 " + animCount + " 个运行中的 CSS 动画/transition,但样式表中没有任何 prefers-reduced-motion 处理(检查清单要求支援)");
  }

  // ---------- 12. lang 属性 ----------
  const langOk = !!de.lang;
  hit("a11y", langOk);
  if (!langOk) failures.push("<html> 缺 lang 属性(影响屏幕阅读器发音与 CJK 字体选择)");

  // ---------- 13. 状态与运行时健康(runner 注入) ----------
  const rt = (typeof window !== "undefined" && window.__frontendCraftRuntime) || null;
  if (rt && rt.pageErrors && rt.pageErrors.length) {
    failures.push("运行时 JS 错误 " + rt.pageErrors.length + " 个: " + rt.pageErrors.slice(0, 2).join(" | "));
    hit("resilience", false);
  } else {
    hit("resilience", true);
  }
  const visibleChildren = [...doc.body.children].filter((el) => {
    const st = getComputedStyle(el);
    return st.display !== "none" && st.visibility !== "hidden";
  });
  hit("resilience", visibleChildren.length > 0);
  if (visibleChildren.length === 0) failures.push("body 没有任何可见内容 — 应用可能未挂载(白屏)");
  const hasStateHints =
    /(loading|skeleton|spinner|pulse|empty|error|retry|fallback)/i.test(
      (doc.body.textContent || "") + " " + (doc.body.className || "")
    );
  if (rt && rt.consoleErrors && rt.consoleErrors.length) {
    warnings.push("console.error " + rt.consoleErrors.length + " 个(近因可能已由 JS 错误捕获): " + rt.consoleErrors.slice(0, 2).join(" | "));
  }
  if (!hasStateHints) {
    warnings.push("未检测到 loading / empty / error 状态标识语 — 若含异步数据请补齐三态(Loading/Empty/Error)");
  }

  // ---------- 汇总 ----------
  const ratings = {};
  const executed = [];
  Object.keys(dims).forEach((d) => {
    const v = dims[d];
    ratings[d] = v.exe ? (v.fail === 0 ? 1 : Math.max(0, 1 - v.fail / Math.max(v.exe, 1))) : null;
    if (v.exe) executed.push(d);
  });
  const score = executed.length ? executed.reduce((a, d) => a + ratings[d], 0) / executed.length : 0;
  const possibleTotal = Object.values(dims).reduce((a, d) => a + d.possible, 0);
  const exeTotal = Object.values(dims).reduce((a, d) => a + d.exe, 0);

  return {
    pass: failures.length === 0,
    version,
    viewport: de.clientWidth + "x" + de.clientHeight,
    failures,
    warnings,
    stats: {
      bodyTextNodes: bodyLike,
      minBodyFontSize: minBodyFs === Infinity ? null : minBodyFs,
      minBodyLineHeightRatio: minBodyLH === Infinity ? null : +minBodyLH.toFixed(2),
      bodyFontFamily: bodyFont,
      overflowPx,
      focusableCount: focusables.length,
      focusActuallyChecked: focusChecked,
      imgCount: imgs.length,
      contrastChecked,
      vhViolations: vhViol.length,
      dvhUsages: dvhCount,
      runningAnimations: animCount,
      hasReducedMotionRule: hasReducedRule,
    },
    quality: {
      score: +score.toFixed(2),
      ratings,
      coverage: +(exeTotal / possibleTotal).toFixed(2),
      dimensionsExecuted: executed,
    },
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { __frontendCraftProbe };
}