import { useRef, useState, type PointerEvent } from 'react'
import { LETTER } from '../data/content'
import { bloomAt } from './Garden'
import { Logo } from './Logo'
import { Reveal } from './Reveal'

export function Letter() {
  const [name, setName] = useState('')
  const [about, setAbout] = useState('')
  const [body, setBody] = useState('')
  const [stamped, setStamped] = useState(false)
  const [pressing, setPressing] = useState(false)
  const [notice, setNotice] = useState('')
  const pad = useRef<HTMLButtonElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const stamp = () => {
    if (stamped || pressing) return
    setPressing(true)
    window.setTimeout(() => {
      setStamped(true)
      setPressing(false)
      setNotice('章已按下。可以投出。')
      const r = box.current?.getBoundingClientRect()
      if (r) bloomAt(r.left + r.width / 2, r.top + r.height / 2)
    }, 520)
  }

  const send = () => {
    if (!name.trim() && !about.trim() && !body.trim()) {
      setNotice(LETTER.needWords)
      return
    }
    if (!stamped) {
      setNotice(LETTER.needStamp)
      return
    }
    const subject = encodeURIComponent(`【咲梦】${name || '未具名'} · ${about || '一封信'}`)
    const mail = encodeURIComponent(
      `${body}\n\n—— ${name || '未具名'}\n想开的事：${about || '（未写）'}\n（已盖章）`,
    )
    window.location.href = `mailto:${LETTER.email}?subject=${subject}&body=${mail}`
  }

  const onPadDown = (e: PointerEvent<HTMLButtonElement>) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPadMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return
    const target = box.current?.getBoundingClientRect()
    if (!target) return
    const over =
      e.clientX >= target.left &&
      e.clientX <= target.right &&
      e.clientY >= target.top &&
      e.clientY <= target.bottom
    if (over) e.currentTarget.classList.add('is-over')
    else e.currentTarget.classList.remove('is-over')
  }
  const onPadUp = (e: PointerEvent<HTMLButtonElement>) => {
    const target = box.current?.getBoundingClientRect()
    const over =
      target &&
      e.clientX >= target.left &&
      e.clientX <= target.right &&
      e.clientY >= target.top &&
      e.clientY <= target.bottom
    dragging.current = false
    e.currentTarget.classList.remove('is-over')
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    if (over) stamp()
  }

  return (
    <Reveal as="section" className="section letter-sec" id="letter">
      <p className="kicker">
        <span>{LETTER.kicker}</span>
        <i />
        LETTER
      </p>
      <h2>{LETTER.title}</h2>
      <p className="lead">{LETTER.lead}</p>

      <div className="letter">
        <p className="letter-to">{LETTER.honorific}</p>
        <label>
          {LETTER.fields.name}
          <input
            id="letter-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={LETTER.placeholders.name}
          />
        </label>
        <label>
          {LETTER.fields.about}
          <input
            id="letter-about"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder={LETTER.placeholders.about}
          />
        </label>
        <label>
          {LETTER.fields.body}
          <textarea
            id="letter-body"
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={LETTER.placeholders.body}
          />
        </label>

        <div className="letter-foot">
          <p className="letter-close">此致 · 春安</p>
          <div
            ref={box}
            className={`stamp-box${stamped ? ' is-stamped' : ''}${pressing ? ' is-pressing' : ''}`}
          >
            {stamped ? (
              <Logo variant="mark" alt="已盖章" className="stamp-imprint" />
            ) : (
              <span>{LETTER.stampHint}</span>
            )}
          </div>
        </div>
      </div>

      <div className="letter-actions">
        <button
          ref={pad}
          type="button"
          className="inkpad"
          onPointerDown={onPadDown}
          onPointerMove={onPadMove}
          onPointerUp={onPadUp}
          onPointerCancel={onPadUp}
          onClick={() => stamp()}
          disabled={stamped}
        >
          <Logo variant="mark" alt="" className="inkpad-logo" />
          <span>{stamped ? '已盖' : LETTER.stampAction}</span>
        </button>
        <button className="btn btn-ink" type="button" onClick={send}>
          {LETTER.send}
        </button>
        <a className="mail-link" href={`mailto:${LETTER.email}`}>
          {LETTER.email}
        </a>
      </div>
      <p className="hint" aria-live="polite">
        {notice || '也可把左边印章拖进信纸右下角。'}
      </p>
    </Reveal>
  )
}
