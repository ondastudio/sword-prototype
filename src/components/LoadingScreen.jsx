import { useEffect, useState } from 'react'
import styles from './LoadingScreen.module.css'

const ARROW = 'https://www.figma.com/api/mcp/asset/2a51bc86-a820-4f28-9d18-64f09c4f55f7'

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

export default function LoadingScreen({ onComplete }) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Animation is 5s. Give it a beat, then fade out.
    const t = setTimeout(() => {
      setDone(true)
      onComplete?.()
    }, 5200)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <div className={`${styles.screen} ${done ? styles.done : ''}`}>
      <div className={styles.glow} />

      <nav className={styles.nav}>
        <div className={styles.logotype}>
          <img src="/logotype.svg" alt="sword Intelligence" />
        </div>
        <div className={styles.navCenter}>
          <div className={styles.navItem}>
            <span>Solution</span>
            <img src={ARROW} alt="" className={styles.arrow} />
          </div>
          <div className={styles.navItem}>
            <span>Platform</span>
            <img src={ARROW} alt="" className={styles.arrow} />
          </div>
          <div className={styles.navItem}><span>About</span></div>
          <div className={styles.navItem}><span>Insights</span></div>
        </div>
        <button className={styles.cta}>Book a meeting</button>
      </nav>

      <div className={styles.stage}>
        <p className={styles.headline}>
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
            {LINE2.map((w, i) => (
              <span key={w.text}>
                <span className={styles.word} style={{ animationDelay: `${w.delay}s` }}>
                  {w.text}
                </span>
                {i < LINE2.length - 1 ? ' ' : ''}
              </span>
            ))}
          </span>
        </p>
      </div>
    </div>
  )
}
