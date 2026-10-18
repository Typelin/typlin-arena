import { useRef } from "react";
import { ProjectArt } from "./Graphics";
import { services } from "./data";
const logo = `${import.meta.env.BASE_URL}logo.png`;

export function HeroGarden({
  active,
  onChange,
}: {
  active: number;
  onChange: (index: number) => void;
}) {
  const scene = useRef<HTMLDivElement>(null);
  return (
    <div
      className="garden"
      data-service={active}
      ref={scene}
      onPointerMove={(e) => {
        if (
          e.pointerType !== "mouse" ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const r = e.currentTarget.getBoundingClientRect();
        scene.current?.style.setProperty(
          "--rx",
          `${((e.clientY - r.top - r.height / 2) / r.height) * -7}deg`,
        );
        scene.current?.style.setProperty(
          "--ry",
          `${((e.clientX - r.left - r.width / 2) / r.width) * 9}deg`,
        );
      }}
      onPointerLeave={() => {
        scene.current?.style.setProperty("--rx", "0deg");
        scene.current?.style.setProperty("--ry", "0deg");
      }}
    >
      <div className="garden-orbit" aria-hidden="true">
        <svg viewBox="0 0 660 650" fill="none">
          <circle cx="315" cy="300" r="264" stroke="#cbd0e2" strokeWidth="1" />
          <path
            d="M76 411C5 272 96 86 255 42"
            stroke="#d9a6be"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M423 550C555 492 616 378 572 225"
            stroke="#7687b6"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="562" cy="199" r="5" fill="#b0bbd5" />
          <circle cx="99" cy="458" r="4" fill="#e7adc5" />
          <path
            d="M509 58C509 73 504 78 490 78C504 78 509 84 509 99C509 84 514 78 528 78C514 78 509 73 509 58Z"
            fill="#afb9d5"
          />
        </svg>
      </div>
      <div className="petal-sculpture" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="logo-platform">
        <img
          src={logo}
          alt="咲夢信息科技工作室 SAKIMU TECH STUDIO 原始 LOGO，櫻花與月弧環繞程式符號"
          width="800"
          height="800"
          fetchPriority="high"
        />
        <span className="platform-caption">
          A SMALL STUDIO. A GROWING IDEA.
        </span>
      </div>
      {services.map((s, i) => (
        <button
          key={s.id}
          className={`orbit-tag tag-${i} ${active === i ? "active" : ""}`}
          aria-pressed={active === i}
          aria-label={`探索${s.label}`}
          onClick={() => onChange(i)}
        >
          <span>{s.number}</span>
          {["設計的溫度", "工具的直覺", "品牌的性格"][i]}
          <b>{active === i ? "↗" : "+"}</b>
        </button>
      ))}
      <div className="garden-preview">
        <div className="preview-caption">
          <span className="live-dot" />
          讓想法，有了模樣 <span>0{active + 1}</span>
        </div>
        <div key={active} className="preview-art">
          <ProjectArt theme={["mori", "flow", "sora"][active]} mini />
        </div>
      </div>
      <div className="garden-foot" aria-live="polite">
        <span className="garden-foot-line" />
        <p>{services[active].short}</p>
        <span>{services[active].en}</span>
      </div>
    </div>
  );
}
