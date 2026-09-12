import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { knockoutBlack, rawLogoSrc } from '../lib/logo'

const LogoCtx = createContext(rawLogoSrc())

export function LogoProvider({ children }: { children: ReactNode }) {
  const raw = rawLogoSrc()
  const [src, setSrc] = useState(raw)

  useEffect(() => {
    let dead = false
    let objectUrl = ''
    knockoutBlack(raw)
      .then((url) => {
        if (dead) {
          URL.revokeObjectURL(url)
          return
        }
        objectUrl = url
        setSrc(url)
      })
      .catch(() => {
        if (!dead) setSrc(raw)
      })
    return () => {
      dead = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [raw])

  return <LogoCtx.Provider value={src}>{children}</LogoCtx.Provider>
}

export function useLogoSrc() {
  return useContext(LogoCtx)
}

type LogoProps = {
  variant?: 'lockup' | 'mark'
  alt: string
  className?: string
}

export function Logo({ variant = 'lockup', alt, className }: LogoProps) {
  const src = useLogoSrc()
  if (variant === 'mark') {
    return (
      <span className={`logo-mark${className ? ` ${className}` : ''}`}>
        <img src={src} alt={alt} draggable={false} />
      </span>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`logo logo--lockup${className ? ` ${className}` : ''}`}
      draggable={false}
    />
  )
}
