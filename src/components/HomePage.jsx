import { useState, useEffect, useRef } from 'react'
import styles from './HomePage.module.css'

// Cluster center (within the 725×743 orbitCluster container)
const CLUSTER_CENTER = { x: 371, y: 364 }

// Each circle's position in the SVG — drives orbital radius + initial angle
const ORBIT_CIRCLES = [
  { cx: 512.031,  cy: 677.846,  r: 65.5834 },
  { cx: 273.671,  cy: 616.283,  r: 65.5834 },
  { cx: 113.091,  cy: 446.018,  r: 65.5834 },
  { cx:  65.5834, cy: 204.469,  r: 65.5834 },
  { cx: 676.682,  cy: 522.565,  r: 49.1875 },
  { cx: 629.168,  cy: 281.009,  r: 32.7917 },
  { cx: 468.59,   cy: 110.745,  r: 32.7917 },
  { cx: 230.237,  cy:  49.1875, r: 49.1875 },
]

// Precompute each circle's orbital radius and initial angle from the cluster center
const ORBIT_PARAMS = ORBIT_CIRCLES.map(c => ({
  orbitR: Math.hypot(c.cx - CLUSTER_CENTER.x, c.cy - CLUSTER_CENTER.y),
  baseAngle: Math.atan2(c.cy - CLUSTER_CENTER.y, c.cx - CLUSTER_CENTER.x),
}))

// Which circle expands — index 0 (large, r=65.6, ends up upper-center at full orbit)
const EXPANDING_IDX = 4
// CSS position of the cluster container (matches .orbitCluster)
const CLUSTER_LEFT = 330
const CLUSTER_TOP  = 95
// Frozen orbital angle when expansion starts (orbitRotation = π)
const EXP_FROZEN_ANGLE = ORBIT_PARAMS[EXPANDING_IDX].baseAngle + Math.PI
const EXP_FROZEN_CX = CLUSTER_CENTER.x + ORBIT_PARAMS[EXPANDING_IDX].orbitR * Math.cos(EXP_FROZEN_ANGLE)
const EXP_FROZEN_CY = CLUSTER_CENTER.y + ORBIT_PARAMS[EXPANDING_IDX].orbitR * Math.sin(EXP_FROZEN_ANGLE)

const LINE1 = [
  { text: 'Intelligence', delay: 1.0  },
  { text: 'from',         delay: 1.35 },
  { text: 'first',        delay: 1.7  },
  { text: 'contact',      delay: 2.05 },
]
const LINE2 = [
  { text: 'to',           delay: 2.55 },
  { text: 'proactive',    delay: 2.9  },
  { text: 'care,',        delay: 3.25 },
]

// Smooth remap: returns 0→1 as value goes from a→b
function remap(value, a, b) {
  return Math.max(0, Math.min(1, (value - a) / (b - a)))
}

export default function HomePage() {
  const [loaded, setLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const pageRef = useRef()
  const videoRef = useRef()

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 5200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      if (!pageRef.current) return
      const { top, height } = pageRef.current.getBoundingClientRect()
      const scrollable = height - window.innerHeight
      const scrolled = Math.max(0, -top)
      setProgress(Math.min(1, scrolled / scrollable))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Play video when circle fully covers the screen, pause+reset when scrolling back
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const expandP = Math.max(0, Math.min(1, (progress - 0.93) / (1.0 - 0.93)))
    if (expandP >= 1) {
      video.play().catch(() => {})
    } else {
      video.pause()
      video.currentTime = 0
    }
  }, [progress])

  // Hero text: visible at 0, fades out 0.15→0.25
  const heroOpacity = 1 - remap(progress, 0.15, 0.28)

  // Problem text: fades in 0.22→0.32, fades out 0.42→0.55
  const problemOpacity = remap(progress, 0.22, 0.32) * (1 - remap(progress, 0.42, 0.55))

  // Popup: fades in 0.28→0.38, fades out 0.42→0.55
  const popupOpacity = remap(progress, 0.28, 0.38) * (1 - remap(progress, 0.42, 0.55))

  // Dots: visible until 0.45, fade out by 0.60
  const dotsOpacity = 1 - remap(progress, 0.45, 0.60)

  // Border: fades in with problem text, stays on through expansion
  const borderOpacity = remap(progress, 0.22, 0.32)

  // Orb scale: 1 → 12 from progress 0.58 → 1.0
  const orbScale = 1 + remap(progress, 0.58, 1.0) * 11

  // Original circle fades out as expanded shape takes over
  // undefined = let CSS loaded transition handle it; value = overrides during expansion
  const orbInlineOpacity = progress > 0.62 ? 1 - remap(progress, 0.62, 0.78) : undefined

  // Expanded soft shape fades in during expansion
  const orbExpandedOpacity = remap(progress, 0.65, 0.82)

  // Dark end-state fades in, fully opaque before solution circles appear
  const darkBgOpacity = remap(progress, 0.80, 0.92)

  // Solution elements appear as the background darkens, then one circle expands
  const solutionOpacity = remap(progress, 0.86, 0.93)
  // Circles orbit as user scrolls through the solution section, then one expands
  const orbitRotation = remap(progress, 0.86, 0.93) * Math.PI  // 0 → 180°
  const circleExpandProgress = remap(progress, 0.93, 1.0)
  const solutionTextOpacity = 1 - remap(progress, 0.93, 0.97)

  // Expanding circle: translate from its frozen orbital position to viewport center
  const expDeltaX = window.innerWidth  / 2 - (CLUSTER_LEFT + EXP_FROZEN_CX)
  const expDeltaY = window.innerHeight / 2 - (CLUSTER_TOP  + EXP_FROZEN_CY)
  const expFullScale = Math.hypot(window.innerWidth / 2, window.innerHeight / 2) / ORBIT_CIRCLES[EXPANDING_IDX].r + 2


  // Expansion sentence: fades in mid-expansion, fades out before solution appears
  const expansionTextOpacity = remap(progress, 0.66, 0.76) * (1 - remap(progress, 0.79, 0.86))

  return (
    <div
      ref={pageRef}
      className={`${styles.page} ${loaded ? styles.loaded : ''}`}
      style={{ height: '600vh' }}
    >
      <div className={styles.sticky}>

        {/* Sunrise loading glow */}
        <div className={`${styles.glowWrap} ${loaded ? styles.glowWrapDone : ''}`}>
          <div className={styles.glow} />
        </div>

        {/* Mesh background */}
        <div className={styles.mesh} />

        {/* Color border glow */}
        <div className={styles.border} style={{ opacity: borderOpacity }} />

        {/* Nav */}
        <nav className={styles.nav} style={{ opacity: loaded ? heroOpacity : 0 }}>
          <div className={styles.logotype}>
            <img src="/logotype.svg" alt="Sword Intelligence" className={styles.logoImg} />
          </div>
          <div className={styles.navCenter}>
            <div className={styles.navItem}>Solution <span className={styles.chevron}>▾</span></div>
            <div className={styles.navItem}>Platform <span className={styles.chevron}>▾</span></div>
            <div className={styles.navItem}>About</div>
            <div className={styles.navItem}>Insights</div>
          </div>
          <button className={styles.cta}>Book a meeting</button>
        </nav>

        {/* Expanded orb shape — centered on viewport, crossfades in during expansion */}
        <div className={styles.expandedOrb} style={{ opacity: orbExpandedOpacity }} />

        {/* Dark end-state background */}
        <div className={styles.darkBg} style={{ opacity: darkBgOpacity }} />

        {/* Expansion sentence */}
        <p className={styles.expansionText} style={{ opacity: expansionTextOpacity }}>
          <em className={styles.expansionEm}>AI Care</em>
          {' '}
          <span className={styles.expansionBody}>is the force multiplier healthcare needs now.</span>
        </p>

        {/* Orb — pinned, scales up on scroll, fades out as expanded shape takes over */}
        <div
          className={styles.orbWrap}
          style={{ transform: `scale(${orbScale})`, opacity: orbInlineOpacity }}
        >
          {/* Circle layer — always visible */}
          <img src="/orb-circle.svg" alt="" className={styles.orbLayer} />
          {/* Dots layer — fades out on scroll */}
          <img
            src="/orb-dots.svg"
            alt=""
            className={styles.orbLayer}
            style={{ opacity: dotsOpacity }}
          />
        </div>

        {/* Pop-up card */}
        <div className={styles.popup} style={{ opacity: popupOpacity }}>
          <img src="/popup.svg" alt="" className={styles.popupImg} />
        </div>

        {/* Solution elements — appear as dark bg fades in */}
        <div className={styles.solutionLayer} style={{ opacity: solutionOpacity }}>
          <img src="/solution-bg-cluster.svg" alt="" className={styles.solutionBgCluster} />

          {/* Scroll-driven orbit circles — one expands to fill viewport */}
          <div className={styles.orbitCluster}>
            {ORBIT_CIRCLES.map((c, i) => {
              const { orbitR, baseAngle } = ORBIT_PARAMS[i]
              const angle = baseAngle + orbitRotation
              const cx = CLUSTER_CENTER.x + orbitR * Math.cos(angle)
              const cy = CLUSTER_CENTER.y + orbitR * Math.sin(angle)
              const isExpanding = i === EXPANDING_IDX

              const wrapStyle = {
                left: `${cx - c.r}px`,
                top: `${cy - c.r}px`,
                width: `${c.r * 2}px`,
                height: `${c.r * 2}px`,
              }

              if (isExpanding) {
                // Translate finishes at 30% of expansion so the rest is pure
                // symmetric scaling from the viewport center → always a perfect circle
                const tP = Math.min(1, circleExpandProgress / 0.3)
                const tx = tP * expDeltaX
                const ty = tP * expDeltaY
                const sc = 1 + circleExpandProgress * (expFullScale - 1)
                wrapStyle.transform = `translate(${tx}px, ${ty}px) scale(${sc})`
                wrapStyle.zIndex = 2
              } else {
                wrapStyle.opacity = Math.max(0, 1 - circleExpandProgress * 3)
              }

              return (
                <div key={i} className={styles.orbitWrap} style={wrapStyle}>
                  <div className={styles.orbitCircle} />
                  {isExpanding && (
                    <video
                      ref={videoRef}
                      src="/hero-video.webm"
                      poster="/video-poster.png"
                      className={styles.expandVideo}
                      style={{ opacity: Math.min(1, circleExpandProgress * 3) }}
                      playsInline
                      preload="auto"
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div className={styles.solutionLabel} style={{ opacity: solutionTextOpacity }}>
            <span className={styles.solutionDot} />
            <span className={styles.solutionLabelText}>The Solution? Not another tool.</span>
          </div>
          <p className={styles.solutionTitle} style={{ opacity: solutionTextOpacity }}>
            Healthcare's first Modular Intelligence Platform.
          </p>
        </div>

        {/* Hero slide */}
        <div className={styles.slide} style={{ opacity: heroOpacity }}>
          <div className={styles.labelWrap}>
            <div className={styles.label}>
              <span className={styles.dot} />
              AI agents for care management
            </div>
          </div>
          <h1 className={styles.title}>
            <span className={styles.lineRow}>
              {LINE1.map((w, i) => (
                <span key={w.text}>
                  <span className={styles.word} style={{ animationDelay: `${w.delay}s` }}>
                    {w.text}
                  </span>
                  {i < LINE1.length - 1 ? ' ' : ''}
                </span>
              ))}
            </span>
            <span className={styles.lineRow}>
              {LINE2.map((w) => (
                <span key={w.text}>
                  <span className={styles.word} style={{ animationDelay: `${w.delay}s` }}>
                    {w.text}
                  </span>
                  {' '}
                </span>
              ))}
              <em className={styles.atScale}>at scale</em>
            </span>
          </h1>
        </div>

        {/* Problem slide */}
        <div className={styles.slide} style={{ opacity: problemOpacity }}>
          <div className={styles.problemLabelRow}>
            <span className={styles.dot} />
            <span className={styles.problemLabel}>What's wrong?</span>
          </div>
          <h2 className={styles.problemTitle}>
            Healthcare demand is outpacing human capacity.
          </h2>
        </div>

      </div>
    </div>
  )
}
