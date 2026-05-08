import { useEffect, useState } from 'react'
import styles from './NavPill.module.css'

// Compact pill navbar that lives at the App level so it stays visible
// throughout the entire site — across HomePage's sticky region and through
// IntelligencePage. Mirrors HomePage's elementsOpacity formula so the
// crossfade with the opening-scene full navbar still works.
//
// HomePage is 600vh tall. Its scroll-progress fades elementsOpacity from
// 1 → 0 between progress 0.12 and 0.24, where progress = scrolled /
// (600vh - 100vh) = scrolled / 500vh. So we compute the pill's opacity
// directly from scrollY against the same window.

const clamp = (n, a, b) => Math.max(a, Math.min(b, n))
const remap = (x, a, b) => clamp((x - a) / (b - a), 0, 1)

export default function NavPill({ loaded }) {
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight
      const scrollable = 5 * vh // HomePage .page is 600vh, sticky range = 500vh
      const progress = clamp((window.scrollY || 0) / scrollable, 0, 1)
      const elementsOpacity = 1 - remap(progress, 0.12, 0.24)
      setOpacity(1 - elementsOpacity)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Hidden until the loading screen finishes its handoff, in lockstep with
  // HomePage's `.loaded .sticky { opacity: 1 }` crossfade.
  const visible = loaded
  const interactive = visible && opacity > 0.5

  return (
    <nav
      className={styles.navPillWrap}
      aria-label="Primary"
      style={{
        opacity: visible ? opacity : 0,
        pointerEvents: interactive ? 'auto' : 'none',
      }}
      aria-hidden={!interactive}
    >
      <div className={styles.navPill}>
        <img className={styles.navLogo} src="/sword-mark.svg" alt="Sword" />
        <button type="button" className={styles.navPillMenu}>
          <span>Menu</span>
          <img
            className={styles.navPillMenuIcon}
            src="/ai-menu.svg"
            alt=""
            aria-hidden="true"
          />
        </button>
        <button type="button" className={styles.navCta}>
          Book a meeting
        </button>
      </div>
    </nav>
  )
}
