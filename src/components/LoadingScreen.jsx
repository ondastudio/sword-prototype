import { useEffect, useRef, useState } from 'react'
import styles from './LoadingScreen.module.css'

// Total duration of the sunrise.
const DURATION = 3

// Where the sun's color stops begin warming toward the homepage's cream.
const WARM_START = 0.58

// When the crossfade between the loading stage and the homepage begins.
// Derived so the 1000ms CSS fade ends exactly at t=1 regardless of
// DURATION: handoff = 1 - (fadeMs / (DURATION * 1000)).
const HANDOFF_T = 1 - 1 / DURATION

const KEYS = [
  { t: 0.00, y: 3677, r: 3084, rv: 1318, veil: 1.00 },
  { t: 0.20, y: 2979, r: 2499, rv: 1318, veil: 0.75 },
  { t: 0.55, y: 1650, r: 1400, rv: 1318, veil: 0.28 },
  { t: 1.00, y: 1150, r: 1140, rv: 1200, veil: 0.12 },
]

const VIOLET = [119, 0, 238]
const INDIGO = [33, 1, 65]
const CREAM  = [236, 243, 254]

const lerp = (a, b, t) => a + (b - a) * t
const easeOutCubic = t => 1 - Math.pow(1 - t, 3)
const smoothstep = (a, b, x) => {
  const k = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return k * k * (3 - 2 * k)
}

function sampleKeys(t) {
  const te = easeOutCubic(Math.max(0, Math.min(1, t)))
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i], b = KEYS[i + 1]
    if (te >= a.t && te <= b.t) {
      const local = (te - a.t) / (b.t - a.t)
      return {
        y: lerp(a.y, b.y, local),
        r: lerp(a.r, b.r, local),
        rv: lerp(a.rv, b.rv, local),
        veil: lerp(a.veil, b.veil, local),
      }
    }
  }
  return KEYS[KEYS.length - 1]
}

const rgb = c => `rgb(${c[0]}, ${c[1]}, ${c[2]})`
const lerpRgb = (a, b, t) => [
  Math.round(lerp(a[0], b[0], t)),
  Math.round(lerp(a[1], b[1], t)),
  Math.round(lerp(a[2], b[2], t)),
]

export default function LoadingScreen({ onComplete }) {
  const [gone, setGone] = useState(false)

  const sunRef = useRef()
  const veilRef = useRef()
  const grainRef = useRef()
  const vignetteRef = useRef()

  // Stash onComplete in a ref so the tick effect doesn't re-run on every
  // App re-render that hands us a new callback identity.
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    let raf
    let startTime = null
    let handedOff = false

    // Drives only the sunrise backdrop now — the title lives in HeroTitle
    // at the App level and animates on its own matching timeline so a
    // single DOM node covers both the loading and homepage positions.
    const tick = now => {
      if (startTime == null) startTime = now
      const elapsed = (now - startTime) / 1000
      const t = Math.min(1, elapsed / DURATION)

      const vals = sampleKeys(t)

      const warm = smoothstep(WARM_START, 1.0, t)
      const violet = warm > 0 ? lerpRgb(VIOLET, CREAM, warm) : VIOLET
      const edge   = warm > 0 ? lerpRgb(INDIGO, CREAM, warm) : INDIGO

      if (sunRef.current) {
        sunRef.current.style.background =
          `radial-gradient(${vals.r}px ${vals.rv}px at 50% ${vals.y}px,` +
          ` #ECF3FE 0%, #ECF3FE 58.47%,` +
          ` ${rgb(violet)} 76.80%, ${rgb(edge)} 100%)`
      }

      if (veilRef.current)     veilRef.current.style.opacity     = vals.veil * (1 - warm)
      if (grainRef.current)    grainRef.current.style.opacity    = 0.06 * (1 - warm)
      if (vignetteRef.current) vignetteRef.current.style.opacity = 1 - warm

      if (!handedOff && t >= HANDOFF_T) {
        handedOff = true
        setGone(true)
        onCompleteRef.current?.()
      }

      if (t >= 1) return
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className={`${styles.screen} ${gone ? styles.gone : ''}`}
      aria-hidden={gone}
    >
      <div className={styles.stage}>
        <div ref={sunRef} className={styles.sun} />
        <div ref={veilRef} className={styles.veil} />
        <div ref={vignetteRef} className={styles.vignette} />
        <div ref={grainRef} className={styles.grain} />
      </div>
    </div>
  )
}
