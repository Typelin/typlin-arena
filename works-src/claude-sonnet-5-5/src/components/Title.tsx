import { forwardRef } from 'react'

export const TITLE = '我只在被撥動時存在'

/** 標題的每個字都是弦上的一顆珠子；位移與旋轉由引擎每幀直接寫入。 */
export const Title = forwardRef<HTMLHeadingElement>(function Title(_, ref) {
  return (
    <h1 ref={ref} className="title" aria-label={TITLE}>
      {[...TITLE].map((ch, i) => (
        <span key={i} data-letter aria-hidden="true">
          {ch}
        </span>
      ))}
    </h1>
  )
})
