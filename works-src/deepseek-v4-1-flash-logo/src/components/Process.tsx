import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { PROCESS } from '../data/content'
import { delay } from '../lib/motion'

export function Process() {
  const [active, setActive] = useState(0)
  const current = PROCESS[active]

  const onTablistKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown'
    const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp'
    if (!forward && !backward) return
    event.preventDefault()
    const next = forward
      ? Math.min(active + 1, PROCESS.length - 1)
      : Math.max(active - 1, 0)
    setActive(next)
    document.getElementById(`process-tab-${next}`)?.focus()
  }

  return (
    <section className="section process" id="process">
      <div className="shell">
        <div className="section-head">
          <p className="eyebrow reveal">HOW WE WORK</p>
          <h2 className="section-title reveal" style={delay(70)}>
            一株軟體的花期
          </h2>
          <p className="section-lead reveal" style={delay(140)}>
            我們把專案分成四季。不是為了浪漫，是因為每個階段的判斷標準真的不一樣——春天問對問題，夏天才不會白做工。
          </p>
        </div>

        <div className="process__layout reveal" style={delay(200)}>
          <div
            className="process__tabs"
            role="tablist"
            aria-label="專案流程階段"
            onKeyDown={onTablistKeyDown}
          >
            {PROCESS.map((step, index) => (
              <button
                key={step.season}
                type="button"
                role="tab"
                id={`process-tab-${index}`}
                aria-selected={active === index}
                aria-controls="process-panel"
                tabIndex={active === index ? 0 : -1}
                className={`process__tab${active === index ? ' is-active' : ''}`}
                onClick={() => setActive(index)}
              >
                <span className="process__tab-season">{step.season}</span>
                <span className="process__tab-text">
                  <span className="process__tab-name">{step.name}</span>
                  <span className="process__tab-latin">{step.latin}</span>
                </span>
              </button>
            ))}
          </div>

          <div
            className="process__panel"
            id="process-panel"
            role="tabpanel"
            aria-labelledby={`process-tab-${active}`}
            key={active}
          >
            <span className="process__watermark" aria-hidden="true">
              {current.season}
            </span>

            <p className="process__when">{current.when}</p>
            <h3 className="process__title">
              {current.name}
              <span className="process__title-latin">{current.latin}</span>
            </h3>
            <p className="process__body">{current.body}</p>

            <div className="process__outputs">
              <p className="process__outputs-label">這個階段的產出</p>
              <ul>
                {current.outputs.map((output) => (
                  <li key={output}>
                    <span className="process__bullet" aria-hidden="true" />
                    {output}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
