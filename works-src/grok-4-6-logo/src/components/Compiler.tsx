import { useMemo, useState } from 'react'
import { COMPILE } from '../data/content'
import { hashWish } from '../lib/logo'
import { bloomAt } from './Garden'
import { Logo } from './Logo'
import { Reveal } from './Reveal'

type Result = {
  source: string
  tokens: string[]
  emit: string
  type: string
}

function tokenize(text: string) {
  return text
    .trim()
    .split(/(\s+)/)
    .filter((t) => t.length && !/^\s+$/.test(t))
}

function compile(source: string): Result {
  const tokens = tokenize(source)
  const h = hashWish(source)
  const emit = COMPILE.emits[h % COMPILE.emits.length] ?? COMPILE.emits[0]
  return {
    source,
    tokens,
    emit: emit ?? '',
    type: `Bloom<'${source.slice(0, 12)}${source.length > 12 ? '…' : ''}'>`,
  }
}

export function Compiler() {
  const [draft, setDraft] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  const run = (text: string) => {
    const src = text.trim()
    if (!src) return
    setResult(compile(src))
    bloomAt(window.innerWidth * 0.5, window.innerHeight * 0.55)
  }

  const petals = useMemo(() => {
    if (!result) return []
    const n = Math.min(10, Math.max(5, result.source.length))
    return Array.from({ length: n }, (_, i) => i)
  }, [result])

  return (
    <Reveal as="section" className="section compile-sec" id="compile">
      <p className="kicker">
        <span>{COMPILE.kicker}</span>
        <i />
        COMPILE
      </p>
      <h2>{COMPILE.title}</h2>
      <p className="lead">{COMPILE.lead}</p>

      <form
        className="slip"
        onSubmit={(e) => {
          e.preventDefault()
          run(draft)
        }}
      >
        <label className="slip-label" htmlFor="wish">
          花笺
        </label>
        <input
          id="wish"
          value={draft}
          maxLength={42}
          placeholder={COMPILE.placeholder}
          onChange={(e) => setDraft(e.target.value)}
          autoComplete="off"
        />
        <div className="chips">
          {COMPILE.chips.map((c) => (
            <button key={c} type="button" onClick={() => { setDraft(c); run(c) }}>
              {c}
            </button>
          ))}
        </div>
        <button className="btn btn-ink" type="submit" disabled={!draft.trim()}>
          {COMPILE.action}
        </button>
      </form>

      {result && (
        <div className="emit" role="status">
          <div className="emit-wreath" aria-hidden="true">
            {petals.map((i) => (
              <span
                key={i}
                className="emit-petal"
                style={{ ['--i' as string]: String(i), ['--n' as string]: String(petals.length) }}
              />
            ))}
            <Logo variant="mark" alt="" className="emit-logo" />
          </div>
          <dl className="emit-log">
            <div>
              <dt>source</dt>
              <dd>「{result.source}」</dd>
            </div>
            <div>
              <dt>lex</dt>
              <dd>
                {result.tokens.length} tokens
                <span className="token-row">
                  {result.tokens.map((t, i) => (
                    <code key={`${i}-${t}`}>{t}</code>
                  ))}
                </span>
              </dd>
            </div>
            <div>
              <dt>type</dt>
              <dd>
                <code>{result.type}</code>
              </dd>
            </div>
            <div>
              <dt>emit</dt>
              <dd>{result.emit}</dd>
            </div>
            <div>
              <dt>note</dt>
              <dd>warning: 花期不可延期</dd>
            </div>
          </dl>
        </div>
      )}
    </Reveal>
  )
}
