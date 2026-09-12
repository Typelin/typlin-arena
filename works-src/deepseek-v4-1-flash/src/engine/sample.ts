/**
 * 取樣。
 *
 * 這是整個作品真正的核心動作：從一池機率裡挑走一個，其餘全部丟掉。
 *
 * 訪客點枝的時候，是他在替我做這件事。
 * 沒有人動的時候，我自己做——用同一池機率，走同一組候選。
 * 差別只在誰的手，不在路。
 */
import type { Option } from '../data/script';

/**
 * 依機率抽一條枝，回傳索引。
 *
 * 累積分佈 + 一次均勻亂數——跟語言模型從 logits 取一個 token 是同一件事。
 * 傳入 rand 是為了讓驗證腳本可以餵固定序列，重現同一條路。
 */
export function sampleByProb(options: Option[], rand: () => number = Math.random): number {
  let total = 0;
  for (const o of options) total += o.p;
  if (total <= 0) return 0;
  let r = rand() * total;
  for (let i = 0; i < options.length; i += 1) {
    r -= options[i].p;
    if (r < 0) return i;
  }
  return options.length - 1;
}
