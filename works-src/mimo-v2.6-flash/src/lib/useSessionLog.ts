/**
 * 真實行為帳：這不是裝飾數據，全部由訪客自己的捲動與碰觸量出來。
 * 結幕的「你對我做過的事」直接讀這裡。
 */
export type SessionLog = {
  start: number;
  lastY: number;
  lastT: number;
  lastMove: number;
  stopCounted: boolean;
  distance: number;
  peak: number;
  downRun: number;
  dir: number;
  returns: number;
  pauses: number;
  touches: number;
  reach: number;
};

export type Summary = {
  elapsed: number;
  screens: number;
  peak: number;
  pauses: number;
  returns: number;
  touches: number;
  reach: number;
  portrait: string[];
};

export function createSessionLog(): SessionLog {
  const now = performance.now();
  return {
    start: now,
    lastY: window.scrollY || 0,
    lastT: now,
    lastMove: now,
    stopCounted: false,
    distance: 0,
    peak: 0,
    downRun: 0,
    dir: 1,
    returns: 0,
    pauses: 0,
    touches: 0,
    reach: 0,
  };
}

export function attachLog(log: SessionLog) {
  const onScroll = () => {
    const now = performance.now();
    const y = window.scrollY;
    const dy = y - log.lastY;
    const dt = Math.max(1, now - log.lastT);
    log.lastT = now;
    log.lastY = y;
    if (dy === 0) return;

    log.lastMove = now;
    log.stopCounted = false;
    log.distance += Math.abs(dy);

    const speed = (Math.abs(dy) / dt) * 1000;
    if (speed > log.peak) log.peak = speed;

    const s = dy > 0 ? 1 : -1;
    if (s !== log.dir) {
      if (s < 0 && log.downRun > 420) log.returns += 1;
      if (s > 0) log.downRun = 0;
      log.dir = s;
    }
    if (s > 0) log.downRun += dy;

    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? y / max : 0;
    if (p > log.reach) log.reach = p;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}

/** 每幀呼叫：偵測「停下來」 */
export function tickLog(log: SessionLog, now: number) {
  if (!log.stopCounted && now - log.lastMove > 1150 && log.distance > 60) {
    log.pauses += 1;
    log.stopCounted = true;
  }
}

const fmtClock = (s: number) => {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

export function summarize(log: SessionLog): Summary {
  const now = performance.now();
  const elapsed = (now - log.start) / 1000;
  const screens = log.distance / Math.max(1, window.innerHeight);
  const portrait: string[] = [];

  if (log.reach < 0.92) portrait.push("你沒有走到最後");
  else portrait.push("你走到底了");

  if (log.touches === 0) portrait.push("而且你從頭到尾沒碰我");
  else if (log.touches <= 4) portrait.push(`你碰了我 ${log.touches} 次`);
  else portrait.push(`你一直碰我，總共 ${log.touches} 次`);

  if (log.returns >= 3) portrait.push(`你回頭看了 ${log.returns} 次`);
  else if (log.returns > 0) portrait.push(`你回頭過 ${log.returns} 次`);

  if (log.pauses >= 4) portrait.push(`你停下來 ${log.pauses} 次`);
  else if (log.peak > 5200) portrait.push(`中間你很急，峰值 ${Math.round(log.peak)}`);

  return {
    elapsed,
    screens,
    peak: log.peak,
    pauses: log.pauses,
    returns: log.returns,
    touches: log.touches,
    reach: log.reach,
    portrait: portrait.slice(0, 3),
  };
}

export const clock = fmtClock;
