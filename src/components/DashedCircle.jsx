import styles from './DashedCircle.module.css'

// Reusable 40×40 circular CTA affordance with a dotted ring border (Figma
// 7347:7965) that crossfades to a solid thin black ring on hover (Figma
// 7347:7966). Replaces inline `border: 2px dashed #000` patterns scattered
// across SectionOrchestration / SectionModular / SectionTransitionQuote so
// they all share one consistent treatment.
//
// Usage: <DashedCircle><img src="..." /></DashedCircle>
//
// The `style` and `className` props pass through so callers can layer extra
// styles (e.g. opacity for a disabled state, or absolute positioning).
export default function DashedCircle({ children, className, style }) {
  return (
    <div
      className={`${styles.dashedCircle}${className ? ` ${className}` : ''}`}
      style={style}
    >
      <img className={styles.ring} src="/assets/cta-stroke-dotted.svg" alt="" aria-hidden="true" />
      <img className={`${styles.ring} ${styles.ringHover}`} src="/assets/cta-stroke-solid.svg" alt="" aria-hidden="true" />
      <span className={styles.content}>{children}</span>
    </div>
  )
}
