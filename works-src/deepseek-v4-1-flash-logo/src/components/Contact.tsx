import { useState } from 'react'
import type { FormEvent } from 'react'
import { BRAND, PROJECT_TYPES } from '../data/content'
import { delay } from '../lib/motion'

type Fields = {
  name: string
  email: string
  type: string
  message: string
}

type Errors = Partial<Record<keyof Fields, string>>

const EMPTY: Fields = {
  name: '',
  email: '',
  type: PROJECT_TYPES[0],
  message: '',
}

function validate(fields: Fields): Errors {
  const errors: Errors = {}
  if (!fields.name.trim()) errors.name = '請留下稱呼，不然不知道要回給誰。'
  if (!fields.email.trim()) {
    errors.email = '需要一個 Email 才能回信。'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim())) {
    errors.email = '這個 Email 看起來不太對，再確認一下？'
  }
  if (fields.message.trim().length < 10) errors.message = '多說一點吧，至少十個字。'
  return errors
}

export function Contact() {
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const update = (key: keyof Fields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(fields)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('sending')
    window.setTimeout(() => setStatus('sent'), 900)
  }

  return (
    <section className="section contact" id="contact">
      <div className="shell">
        <div className="section-head">
          <p className="eyebrow reveal">CONTACT</p>
          <h2 className="section-title reveal" style={delay(70)}>
            說說你想做什麼
          </h2>
          <p className="section-lead reveal" style={delay(140)}>
            不用先寫規格書。一段話、一張手繪草圖、甚至一句「我覺得現在這樣很煩」都可以，我們會陪你把它整理清楚。
          </p>
        </div>

        <div className="contact__grid">
          <div className="contact__form-wrap reveal" style={delay(180)}>
            {status === 'sent' ? (
              <div className="contact__sent" role="status">
                <span className="contact__sent-mark" aria-hidden="true">
                  ✿
                </span>
                <h3>收到了，{fields.name.trim()}。</h3>
                <p>
                  我們會在兩個工作天內回信到 <strong>{fields.email.trim()}</strong>。如果沒收到，記得翻一下垃圾信匣——它們有時候很不懂事。
                </p>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setFields(EMPTY)
                    setErrors({})
                    setStatus('idle')
                  }}
                >
                  再填一筆
                </button>
              </div>
            ) : (
              <form className="contact__form" onSubmit={onSubmit} noValidate>
                <div className="field">
                  <label htmlFor="name">怎麼稱呼</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="王小明 / 小明的公司"
                    value={fields.name}
                    aria-invalid={Boolean(errors.name)}
                    onChange={(event) => update('name', event.target.value)}
                  />
                  {errors.name && <p className="field__error">{errors.name}</p>}
                </div>

                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={fields.email}
                    aria-invalid={Boolean(errors.email)}
                    onChange={(event) => update('email', event.target.value)}
                  />
                  {errors.email && <p className="field__error">{errors.email}</p>}
                </div>

                <div className="field field--full">
                  <label htmlFor="type">專案類型</label>
                  <select
                    id="type"
                    name="type"
                    value={fields.type}
                    onChange={(event) => update('type', event.target.value)}
                  >
                    {PROJECT_TYPES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field field--full">
                  <label htmlFor="message">想做的事</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="例如：我們是一間小型出版社，現在用 Excel 管通路庫存，每次對帳都要花兩天……"
                    value={fields.message}
                    aria-invalid={Boolean(errors.message)}
                    onChange={(event) => update('message', event.target.value)}
                  />
                  {errors.message && <p className="field__error">{errors.message}</p>}
                </div>

                <div className="contact__submit">
                  <button className="btn btn--solid" type="submit" disabled={status === 'sending'}>
                    {status === 'sending' ? '傳送中…' : '送出洽詢'}
                    {status !== 'sending' && (
                      <span className="btn__arrow" aria-hidden="true">
                        →
                      </span>
                    )}
                  </button>
                  <p className="contact__hint">我們不寄電子報，也不會把你的信箱給任何人。</p>
                </div>
              </form>
            )}
          </div>

          <aside className="contact__side reveal" style={delay(260)}>
            <p className="contact__side-label">或者，直接找我們</p>

            <dl className="contact__list">
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
                </dd>
              </div>
              <div>
                <dt>電話</dt>
                <dd>
                  <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>{BRAND.phone}</a>
                </dd>
              </div>
              <div>
                <dt>工作室</dt>
                <dd>{BRAND.address}</dd>
              </div>
              <div>
                <dt>開放時間</dt>
                <dd>{BRAND.hours}</dd>
              </div>
            </dl>

            <p className="contact__side-note">
              <span className="petal-dot" aria-hidden="true" />
              第一次見面通常約在工作室，茶我們請。
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}
