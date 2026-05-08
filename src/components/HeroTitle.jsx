import { useEffect, useRef, useState } from 'react'
import styles from './HeroTitle.module.css'

// One single title element animates from its loading position (centered,
// 96px, cream) to its homepage position (top: 192px, 72px, black), then
// fades out as the user scrolls into Intro2. Replaces what used to be
// two separate renderings (LoadingScreen.tagline + HomePage.heroTitle)
// that crossfaded at the handoff.

const DURATION = 3      // matches LoadingScreen's sunrise timeline
const WARM_START = 0.58 // matches LoadingScreen's color-transform start

const WORDS = [
  { text: 'Instant', t: 0.02 },
  { sp: true, t: 0.12 },
  { text: 'access', t: 0.12 },
  { sp: true, t: 0.22 },
  { text: 'to', t: 0.22 },
  { br: true, t: 0.32 },
  { text: 'intelligent', t: 0.32 },
  { sp: true, t: 0.42 },
  { text: 'care.', t: 0.42 },
]

const TITLE_START_SIZE = 96
const TITLE_END_SIZE   = 80
const TITLE_END_TOP    = 166
const TITLE_END_HEIGHT = TITLE_END_SIZE * 1.05 * 2

const CREAM = [236, 243, 254]
const BLACK = [0, 0, 0]

const lerp = (a, b, t) => a + (b - a) * t
const easeOutCubic = t => 1 - Math.pow(1 - t, 3)
const smoothstep = (a, b, x) => {
  const k = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return k * k * (3 - 2 * k)
}
const rgb = c => `rgb(${c[0]}, ${c[1]}, ${c[2]})`
const lerpRgb = (a, b, t) => [
  Math.round(lerp(a[0], b[0], t)),
  Math.round(lerp(a[1], b[1], t)),
  Math.round(lerp(a[2], b[2], t)),
]

const remap = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a)))

export default function HeroTitle({ loaded }) {
  const titleRef = useRef()
  const wordRefs = useRef([])
  const [scrollOpacity, setScrollOpacity] = useState(1)

  // Loading-phase tick: drives position, size, color, and the per-word
  // reveals. Each word, space, and line break toggles display based on
  // its threshold. When a new token enters layout and shifts the already-
  // visible words, we FLIP: snapshot their X, apply the class, measure the
  // new X, then write an inverse translateX and remove it on the next
  // frame so the CSS transition eases the slide.
  useEffect(() => {
    let raf
    let startTime = null
    const prevIn = new Array(WORDS.length).fill(false)

    const tick = now => {
      if (startTime == null) startTime = now
      const elapsed = (now - startTime) / 1000
      const t = Math.min(1, elapsed / DURATION)
      const warm = smoothstep(WARM_START, 1.0, t)

      if (titleRef.current) {
        const riseT = easeOutCubic(t)
        const startCenterY = window.innerHeight / 2
        const endCenterY   = TITLE_END_TOP + TITLE_END_HEIGHT / 2
        titleRef.current.style.top      = lerp(startCenterY, endCenterY, riseT) + 'px'
        titleRef.current.style.fontSize = lerp(TITLE_START_SIZE, TITLE_END_SIZE, riseT) + 'px'
        titleRef.current.style.color    =
          warm > 0 ? rgb(lerpRgb(CREAM, BLACK, warm)) : rgb(CREAM)
      }

      // Diff against the previous frame's visibility to decide if a FLIP
      // pass is needed.
      const nextIn = wordRefs.current.map((el, i) =>
        el != null && t >= (WORDS[i].t ?? 0.48)
      )
      const changed = nextIn.some((v, i) => v !== prevIn[i])

      if (changed) {
        // Snapshot X of elements that were visible before the mutation —
        // their positions are what we need to preserve visually.
        const oldX = new Map()
        wordRefs.current.forEach((el, i) => {
          if (el && prevIn[i]) oldX.set(el, el.getBoundingClientRect().left)
        })

        wordRefs.current.forEach((el, i) => {
          if (!el) return
          if (nextIn[i]) el.classList.add(styles.in)
          else el.classList.remove(styles.in)
        })

        // Invert: freeze each prior word at its old position with no
        // transition so the shift is imperceptible.
        oldX.forEach((prevX, el) => {
          const newX = el.getBoundingClientRect().left
          const dx = prevX - newX
          if (Math.abs(dx) > 0.5) {
            el.style.transition = 'none'
            el.style.transform = `translateX(${dx}px)`
          }
        })

        // Play: next frame, restore the CSS transition and drop the
        // inline transform so it eases back to 0.
        requestAnimationFrame(() => {
          oldX.forEach((_, el) => {
            el.style.transition = ''
            el.style.transform = ''
          })
        })

        for (let i = 0; i < nextIn.length; i++) prevIn[i] = nextIn[i]
      }

      if (t >= 1) return
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Post-loading: mirror HomePage's elementsOpacity so the title fades
  // out on scroll in lockstep with the rest of the opening scene.
  useEffect(() => {
    if (!loaded) return
    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0
      const scrollable = 5 * window.innerHeight // HomePage .page is 600vh
      const progress = Math.min(1, Math.max(0, scrollY / scrollable))
      setScrollOpacity(1 - remap(progress, 0.12, 0.24))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [loaded])

  return (
    <h1
      ref={titleRef}
      className={styles.heroTitle}
      aria-label="Instant access to intelligent care."
      style={{ opacity: scrollOpacity }}
    >
      {WORDS.map((w, i) => {
        if (w.sp)
          return (
            <span
              key={i}
              ref={el => (wordRefs.current[i] = el)}
              className={styles.sp}
            />
          )
        if (w.br)
          return (
            <span
              key={i}
              ref={el => (wordRefs.current[i] = el)}
              className={styles.br}
            />
          )
        return (
          <span
            key={i}
            ref={el => (wordRefs.current[i] = el)}
            className={`${styles.word} ${w.italic ? styles.italic : ''}`}
          >
            <span className={styles.wordInner}>{w.text}</span>
          </span>
        )
      })}
    </h1>
  )
}
