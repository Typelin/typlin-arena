import { useRef, useState } from 'react'
import { shedFrom } from '../engine/bridge'

const KINDS = ['网站 / 小程序', '应用 / 系统', '自动化 / AI', '改版 / 维护', '还没想好']
const WHEN = ['不着急', '一两个月内', '尽快']

function buildBrief(kinds: string[], idea: string, when: string) {
  const lines = [
    '【咲梦信息科技工作室 · 需求简述】',
    `想做的类型：${kinds.length ? kinds.join('、') : '（还没选）'}`,
    `想法：${idea.trim() || '（还没写）'}`,
    `时间：${when}`,
  ]
  return lines.join('\n')
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    ta.remove()
    return ok
  }
}

export function Letter() {
  const [kinds, setKinds] = useState<string[]>([])
  const [idea, setIdea] = useState('')
  const [when, setWhen] = useState(WHEN[0])
  const [msg, setMsg] = useState('')
  const btn = useRef<HTMLButtonElement>(null)
  const timer = useRef(0)

  const toggle = (k: string) => setKinds((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]))
  const brief = buildBrief(kinds, idea, when)

  const copy = async () => {
    const ok = await copyText(brief)
    setMsg(ok ? '已复制，贴给我们就好。' : '复制没成功，请在右边的信笺里手动选中复制。')
    if (ok) shedFrom(btn.current, 22)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMsg(''), 3600)
  }

  return (
    <div className="letter">
      <div className="letter-form">
        <fieldset>
          <legend>想做什么</legend>
          <div className="chips">
            {KINDS.map((k) => (
              <button key={k} type="button" className="chip" aria-pressed={kinds.includes(k)} onClick={() => toggle(k)}>
                {k}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="field">
          <span>写下你的想法</span>
          <textarea
            value={idea}
            maxLength={400}
            rows={5}
            placeholder="例如：想给小店做一个能预约的页面……一两句话就够。"
            onChange={(e) => setIdea(e.target.value)}
          />
        </label>
        <fieldset>
          <legend>什么时候要</legend>
          <div className="chips">
            {WHEN.map((w) => (
              <button key={w} type="button" className="chip" aria-pressed={when === w} onClick={() => setWhen(w)}>
                {w}
              </button>
            ))}
          </div>
        </fieldset>
        <button ref={btn} type="button" className="cta" onClick={copy}>
          复制需求简述
        </button>
        <p className="toast" role="status">
          {msg}
        </p>
      </div>
      <figure className="paper" aria-label="需求简述预览">
        <pre>{brief}</pre>
        <figcaption>咲 · 梦 — 写好的信笺</figcaption>
      </figure>
    </div>
  )
}
