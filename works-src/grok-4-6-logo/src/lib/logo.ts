const RAW = `${import.meta.env.BASE_URL}logo.png`

export function rawLogoSrc() {
  return RAW
}

/** Knock near-black pixels out of the original lockup so the garden can show through the moon gate. */
export function knockoutBlack(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        reject(new Error('canvas'))
        return
      }
      ctx.drawImage(img, 0, 0)
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = image.data
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i] ?? 0
        const g = d[i + 1] ?? 0
        const b = d[i + 2] ?? 0
        const a = d[i + 3] ?? 0
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
        if (lum < 14) {
          d[i + 3] = 0
        } else if (lum < 32) {
          d[i + 3] = Math.round(a * ((lum - 14) / 18))
        }
      }
      ctx.putImageData(image, 0, 0)
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('blob'))
          return
        }
        resolve(URL.createObjectURL(blob))
      }, 'image/png')
    }
    img.onerror = () => reject(new Error('logo'))
    img.src = src
  })
}

export function hashWish(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
