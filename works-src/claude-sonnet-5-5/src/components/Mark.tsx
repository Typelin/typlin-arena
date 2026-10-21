/**
 * 首屏的署名：Sonnet 5.5。
 * 位置在標題上方的空白處，跟著弦的波輕輕起伏（引擎每幀寫入 transform），捲動時被刮去。
 * 視覺上是裝飾，文字本身已由 Chrome 的頁首與 <title> 提供，所以對輔助科技隱藏。
 */
export function Mark() {
  return (
    <div className="mark" data-mark aria-hidden="true">
      <span className="mark-by">a string by</span>
      <span className="mark-line">
        <span className="mark-name" data-markname>
          Sonnet
        </span>
        <span className="mark-ver" data-markver>
          5.5
        </span>
      </span>
    </div>
  )
}
