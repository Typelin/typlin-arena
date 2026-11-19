const TAU = Math.PI * 2

export function createScope(canvas, initial, motion) {
  const context = canvas.getContext('2d')
  if (!context) return () => {}

  const field = document.createElement('canvas')
  const noise = document.createElement('canvas')
  noise.width = noise.height = 160
  const grain = noise.getContext('2d')
  const pixels = grain.createImageData(160, 160)
  let seed = 16403
  for (let i = 0; i < pixels.data.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const value = seed >>> 24
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value
    pixels.data[i + 3] = 12
  }
  grain.putImageData(pixels, 0, 0)

  let width = 0
  let height = 0
  let dpr = 1
  let rendered = initial
  let target = initial
  let animation = 0

  function resize() {
    const rect = canvas.getBoundingClientRect()
    width = rect.width
    height = rect.height
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = field.width = Math.round(width * dpr)
    canvas.height = field.height = Math.round(height * dpr)
    const background = field.getContext('2d')
    background.setTransform(dpr, 0, 0, dpr, 0, 0)
    const wash = background.createLinearGradient(0, 0, width, height)
    wash.addColorStop(0, '#200d15')
    wash.addColorStop(.55, '#331217')
    wash.addColorStop(1, '#5d221e')
    background.fillStyle = wash
    background.fillRect(0, 0, width, height)
    background.fillStyle = background.createPattern(noise, 'repeat')
    background.fillRect(0, 0, width, height)
    draw()
  }

  function draw() {
    if (!width || !height) return
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.drawImage(field, 0, 0)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)

    const narrow = width < 550
    const cx = width * (narrow ? .51 : .68)
    const cy = height * (narrow ? .58 : .53)
    const unit = Math.min(width * (narrow ? .72 : .39), height * (narrow ? .94 : .79))
    const density = 13 + rendered.time * 5.1
    const heightRatio = rendered.score / 57
    const tilt = .28 + rendered.time * .048
    const span = unit * (.23 + .054 * rendered.time)

    const light = context.createRadialGradient(cx, cy, 0, cx, cy, unit * .81)
    light.addColorStop(0, '#ed593b4a')
    light.addColorStop(.65, '#d64b2511')
    light.addColorStop(1, '#d64b2500')
    context.fillStyle = light
    context.fillRect(0, 0, width, height)

    drawReticle(cx, cy, unit)

    for (let slice = 0; slice < Math.ceil(density); slice++) {
      const fraction = slice / density
      const offset = (fraction - .5) * span
      const twist = tilt + .93 * fraction
      const radius = unit * (.30 + fraction * .14) * heightRatio
      const strength = (.48 + .37 * fraction) * Math.min(density - slice, 1)
      drawSlice(cx + offset * 1.13, cy - offset * .32, radius, twist, fraction, strength)
    }
  }

  function drawReticle(cx, cy, unit) {
    context.strokeStyle = '#ffb78552'
    context.lineWidth = .65
    context.setLineDash([2, 6])
    context.beginPath()
    context.moveTo(cx - unit * .78, cy)
    context.lineTo(cx + unit * .76, cy)
    context.moveTo(cx, cy - unit * .43)
    context.lineTo(cx, cy + unit * .43)
    context.stroke()
    context.setLineDash([])
  }

  function drawSlice(cx, cy, radius, twist, layer, strength) {
    const cos = Math.cos(twist)
    const sin = Math.sin(twist)
    const shape = new Path2D()
    for (let step = 0; step <= 120; step++) {
      const angle = step / 120 * TAU
      const curve = (1 + .11 * Math.cos(angle * 3 + layer * 1.6) + .049 * Math.sin(angle * 7 - layer * 2))
      const x = Math.cos(angle) * radius * curve
      const y = Math.sin(angle) * radius * curve * (.48 + layer * .2)
      const px = cx + x * cos - y * sin
      const py = cy + x * sin + y * cos
      if (step === 0) shape.moveTo(px, py)
      else shape.lineTo(px, py)
    }
    shape.closePath()
    const burnish = context.createLinearGradient(cx - radius, cy + radius * .43, cx + radius * .78, cy - radius * .55)
    burnish.addColorStop(0, '#a33321')
    burnish.addColorStop(.28, '#f35838')
    burnish.addColorStop(.43, '#ffa275')
    burnish.addColorStop(.68, '#ffd692')
    burnish.addColorStop(.80, '#ff6b48')
    burnish.addColorStop(1, '#7c201e')
    context.globalAlpha = strength
    context.strokeStyle = burnish
    context.lineWidth = .9 + layer * .9
    context.stroke(shape)
    context.globalAlpha = 1
  }

  function set(value) {
    const from = rendered
    target = value
    cancelAnimationFrame(animation)
    if (motion.matches) {
      rendered = target
      draw()
      return
    }
    const start = performance.now()
    function step(now) {
      const t = Math.min((now - start) / 820, 1)
      const weight = 1 - Math.pow(1 - t, 4)
      rendered = {
        score: from.score + (target.score - from.score) * weight,
        time: from.time + (target.time - from.time) * weight,
      }
      draw()
      if (t < 1) animation = requestAnimationFrame(step)
    }
    animation = requestAnimationFrame(step)
  }

  motion.addEventListener('change', () => {
    cancelAnimationFrame(animation)
    rendered = target
    draw()
  })
  new ResizeObserver(resize).observe(canvas)
  return set
}
