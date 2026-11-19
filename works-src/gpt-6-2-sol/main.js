import '@fontsource-variable/space-grotesk/wght.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import './style.css'
import { createScope } from './scope.js'
import { efforts, renderRecord } from './record.js'

const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
const score = document.querySelector('#big-score')
const time = document.querySelector('#scope-time')
const timeRule = document.querySelector('#time-rule')
const effort = document.querySelector('#scope-effort')
const status = document.querySelector('#measurement')
const inputs = [...document.querySelectorAll('input[name="effort"]')]
const initial = efforts[Number(inputs.find(input => input.checked).value)]
const setScope = createScope(document.querySelector('#scope-picture'), initial, motion)

function showMeasurement(row) {
  score.textContent = row.score
  time.textContent = row.time
  timeRule.style.setProperty('--time', `${row.time / 8 * 100}%`)
  effort.textContent = row.name.toUpperCase()
  status.textContent = `${row.name}，${row.score} 分，每題 ${row.time} 分鐘。`
}

showMeasurement(initial)
for (const input of inputs) {
  input.addEventListener('change', () => {
    const row = efforts[Number(input.value)]
    showMeasurement(row)
    setScope(row)
  })
}

const matrix = document.querySelector('.blind-matrix')
for (let index = 0; index < 100; index++) {
  const mark = document.createElement('i')
  if (index < 55) mark.className = 'blind-mark'
  matrix.append(mark)
}

renderRecord(document.querySelector('#record-content'))
