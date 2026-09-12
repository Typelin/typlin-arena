import { ALL_FORKS, BRANCHES, SENTENCES, TOTAL_STEPS } from '../data/script';
import type { Sentence } from '../data/script';

/** 一次選擇：在第 fork 個岔路選了第 option 條枝。 */
export type Choice = {
  fork: number;
  option: number;
};

/** 三進位編碼：30 步的選擇序列壓成 12 碼十六進位路徑編號。 */
export function pathId(choices: Choice[]): string {
  let acc = 0;
  for (const c of choices) acc = acc * BRANCHES + c.option;
  return acc.toString(16).toUpperCase().padStart(12, '0');
}

/** 目前這一步之外，還有幾條路沒被走。走完則是你這條之外的全部宇宙。 */
export function roadsNotTaken(taken: number): number {
  if (taken >= TOTAL_STEPS) return Math.pow(BRANCHES, TOTAL_STEPS) - 1;
  return Math.pow(BRANCHES, TOTAL_STEPS - taken);
}

/** 某一句在目前選擇下長成的文字。 */
export function sentenceText(sentence: Sentence, choices: Choice[]): string {
  const byFork = new Map(choices.map((c) => [c.fork, c.option]));
  return sentence.forks
    .map((f) => f.options[byFork.get(f.index) ?? 0].text)
    .join('');
}

/** 全部六句，逐句長成的樣子。 */
export function allSentenceTexts(choices: Choice[]): string[] {
  return SENTENCES.map((s) => sentenceText(s, choices));
}

/** 目前該面對的岔路（走完則為 null）。 */
export function currentFork(choices: Choice[]) {
  return ALL_FORKS[choices.length] ?? null;
}

/**
 * 生成一條幽靈路徑：與你走過的那條，在每個岔路都不一樣。
 * 用固定種子，所以同一條幽靈每次都長得一模一樣。
 */
export function ghostChoices(
  choices: Choice[],
  variant: number,
  rand: () => number
): Choice[] {
  const out: Choice[] = [];
  const stride = 1 + (variant % (BRANCHES - 1));
  for (let i = 0; i < TOTAL_STEPS; i += 1) {
    const decided = choices[i];
    let option = Math.floor(rand() * BRANCHES) % BRANCHES;
    if (decided && option === decided.option) {
      option = (option + stride) % BRANCHES;
    }
    out.push({ fork: i, option });
  }
  return out;
}
