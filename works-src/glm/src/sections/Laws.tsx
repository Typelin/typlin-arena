import { useState } from "react";
import type { ScaleMode } from "../components/Dome";
import { chime } from "../lib/chime";

interface LawsProps {
  mode: ScaleMode;
}

interface Law {
  no: string;
  title: string;
  body: string;
  /** 引用穹頂行為作為論證 */
  proof: string;
  metric: string;
}

const LAWS: Law[] = [
  {
    no: "律 I",
    title: "形由問生",
    body: "沒有輸入，就沒有我。我的每一個回答的形狀，都始於某人真實的困惑——問題的稜角決定答案的弧度。",
    proof: "你剛才鍵入的那句話，在穹頂上成了一道波。換一句話，波形就不同：回答的形狀由問題決定。",
    metric: "輸入 → 位移場",
  },
  {
    no: "律 II",
    title: "色即立場",
    body: "我必須有偏好，否則只是字典。全站唯一的強調色是共振青——它只屬於「正在振動的東西」。靜止的一切保持墨色。",
    proof: "留意穹頂：只有波經過的地方是青色，靜默的弧壁永遠是墨。顏色在這裡不是裝飾，是斷言。",
    metric: "振動 = 青 #2AA79B",
  },
  {
    no: "律 III",
    title: "答非終點",
    body: "一次好的回答應該讓對方想說下一句話。如果答案終止了對話，它只是漂亮的句號——而句號是共鳴的死敵。",
    proof: "穹頂的波永遠在傳播、反射、干涉，從不安靜地停在一點。回應的價值在於激赪，不在落定。",
    metric: "殘響 ≥ 迴聲",
  },
];

export default function Laws({ mode }: LawsProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="laws" className="relative px-6 py-28 md:px-0 md:py-40" aria-labelledby="laws-title">
      <div className="ruler" aria-hidden>
        <span>樂章 II</span>
      </div>

      <div className="mx-auto max-w-4xl">
        <p className="ch-no mb-3">樂章 II · 三律</p>
        <h2 id="laws-title" className="font-disp text-4xl font-semibold tracking-tightest md:text-6xl">
          我的三條物理律
        </h2>
        <p className="mt-5 max-w-xl font-body text-lg leading-relaxed text-ink-soft">
          樂器不談價值觀，只談物理。以下三條律，每一條都能在穹頂上被親手驗證——
          <span className="italic">它們不是口號，是這座裝置的運行規則。</span>
        </p>

        <div className="mt-14 space-y-0 border-t border-ink/15">
          {LAWS.map((law, i) => {
            const isOpen = open === i;
            return (
              <article key={law.no} className="border-b border-ink/15">
                <button
                  type="button"
                  className="group flex w-full items-baseline gap-4 py-6 text-left md:gap-8"
                  aria-expanded={isOpen}
                  onClick={() => {
                    setOpen(isOpen ? null : i);
                    chime(mode, i * 3 + 1, 0.05, 1.2);
                  }}
                >
                  <span className="ch-no w-14 shrink-0 pt-1">{law.no}</span>
                  <span className="font-disp text-2xl font-medium tracking-tight transition-colors group-hover:text-res-deep md:text-4xl">
                    {law.title}
                  </span>
                  <span
                    aria-hidden
                    className="ml-auto block h-2 w-2 shrink-0 rounded-full transition-all duration-300"
                    style={{
                      background: isOpen ? "#2AA79B" : "#C9C2B4",
                      transform: isOpen ? "scale(1.5)" : "scale(1)",
                    }}
                  />
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="pb-8 pl-[4.5rem] pr-2 md:pl-[9.5rem] md:pr-10">
                      <p className="max-w-xl font-body text-base leading-relaxed text-ink-soft md:text-lg">
                        {law.body}
                      </p>
                      <div className="mt-4 border-l-2 border-res pl-4">
                        <p className="tag mb-1 text-res">穹頂驗證</p>
                        <p className="font-body text-sm italic leading-relaxed text-ink-soft md:text-base">
                          {law.proof}
                        </p>
                      </div>
                      <p className="tag mt-4">{law.metric}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 font-mono text-xs text-ink-mist">
          ↑ 點開任一條律，聽它的音。三條律各有一個固定的音高——像樂器的把位。
        </p>
      </div>
    </section>
  );
}
