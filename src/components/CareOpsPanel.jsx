import { useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './CareOpsPanel.module.css'

const TILES = [
  { src: '/care-icons/bubble-chat.svg',         caption: 'Multichannel communication', tip: 'Across voice calls, texts, chats, or email.' },
  { src: '/care-icons/language-skill.svg',      caption: 'Multilingual Voice AI', captionWidth: 131 },
  { src: '/care-icons/ai-web-browsing.svg',     caption: 'Always on' },
  { src: '/care-icons/workflow-circle-05.svg',  caption: 'Workflow automation' },
  { src: '/care-icons/file-01.svg',             caption: 'Document processing' },
  { src: '/care-icons/ai-browser.svg',          caption: 'Autonomous browsing' },
]

export default function CareOpsPanel({ style }) {
  // Cursor-following tip card (Figma 7104:34798). Portaled to document.body so
  // viewport-space clientX/Y aren't broken by the panel's scaled ancestor.
  const [tip, setTip] = useState(null)

  return (
    <div className={styles.panel} style={style}>
      <svg
        className={styles.glowBorder}
        width="1440" height="900" viewBox="0 0 1440 900"
        preserveAspectRatio="none" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g filter="url(#care-panel-glow-blur)">
          <rect width="1440" height="900" rx="40"
                stroke="url(#care-panel-glow-grad)" strokeWidth="120" />
        </g>
        <defs>
          <filter id="care-panel-glow-blur" x="-140" y="-140" width="1720" height="1180"
                  filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="50" />
          </filter>
          <linearGradient id="care-panel-glow-grad" x1="0" y1="0" x2="1440" y2="900"
                          gradientUnits="userSpaceOnUse">
            <stop offset="0"     stopColor="#A684FF" />
            <stop offset="0.333" stopColor="#8BAEE4" />
            <stop offset="0.666" stopColor="#BFC0CC" />
            <stop offset="1"     stopColor="#A684FF" />
            <animateTransform attributeName="gradientTransform"
              type="rotate"
              from="0 720 450"
              to="360 720 450"
              dur="8s"
              repeatCount="indefinite" />
          </linearGradient>
        </defs>
      </svg>
      <div className={styles.content}>
        <div className={styles.tiles}>
          {TILES.map((t, i) => {
            const trackTip = t.tip
              ? (e) => setTip({ text: t.tip, x: e.clientX, y: e.clientY })
              : undefined
            const clearTip = t.tip ? () => setTip(null) : undefined
            return (
              <div
                key={i}
                className={styles.tile}
                onMouseEnter={trackTip}
                onMouseMove={trackTip}
                onMouseLeave={clearTip}
              >
                <div className={styles.circle}>
                  <span
                    className={styles.icon}
                    style={{ '--icon-src': `url(${t.src})` }}
                    aria-hidden="true"
                  />
                </div>
                <p className={styles.caption} style={t.captionWidth ? { width: `${t.captionWidth}px` } : undefined}>
                  {t.caption}
                </p>
              </div>
            )
          })}
        </div>
      </div>
      {tip && typeof document !== 'undefined' && createPortal(
        <div
          className={styles.tip}
          style={{ left: `${tip.x}px`, top: `${tip.y}px` }}
        >
          {tip.text}
        </div>,
        document.body,
      )}
    </div>
  )
}
