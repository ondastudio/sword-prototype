import { useState, useEffect, useRef } from 'react'
import styles from './HomePage.module.css'
import CareOpsPanel from './CareOpsPanel'

// ── Solution-section orbit cluster (unchanged — stitched from the
//    existing page so the video + solution circles still land at the end). ──
const CLUSTER_CENTER = { x: 371, y: 364 }
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
const ORBIT_PARAMS = ORBIT_CIRCLES.map(c => ({
  orbitR: Math.hypot(c.cx - CLUSTER_CENTER.x, c.cy - CLUSTER_CENTER.y),
  baseAngle: Math.atan2(c.cy - CLUSTER_CENTER.y, c.cx - CLUSTER_CENTER.x),
}))
// Settled-state target (Figma node 7079:20971): 8 equal-size circles on a
// uniform octagon. Radius 335 from cluster center, circle radius 61.72px.
// SETTLED_ANGLES[i] is the nearest 45° multiple to (baseAngle + π) — i.e.
// the slot each circle is closest to at the end of the half-turn rotation.
const SETTLED_RADIUS = 335
const SETTLED_CIRCLE_R = 61.72
const SETTLED_ANGLES = [
  3 * Math.PI / 2, // i=0 → 270°
  7 * Math.PI / 4, // i=1 → 315°
  2 * Math.PI,     // i=2 → 360°
  Math.PI / 4,     // i=3 →  45°
  5 * Math.PI / 4, // i=4 → 225°
  Math.PI,         // i=5 → 180°
  3 * Math.PI / 4, // i=6 → 135°
  Math.PI / 2,     // i=7 →  90°
]
// Two focus dots: the first hosts CareOpsPanel, then the whole ring rotates
// +π/4 around CLUSTER_CENTER (offmenu.design-style transition) and the second
// dot — which rotates into the same fixed position dot 5 used to occupy —
// hosts the Sword AI Managers video. SETTLED_ANGLES[6] (3π/4) + π/4 = π, so
// dot 6 lands exactly on the focus position EXP_FROZEN_(CX|CY) carried over
// from the original single-focus implementation. Reference: offmenu.design.
const FIRST_EXPANDING_IDX  = 5
const SECOND_EXPANDING_IDX = 6
const RING_ROTATION_ANGLE  = Math.PI / 4
// Cluster scale at the end of each zoom-approach. At ZOOM_SCALE=5 the focus
// circle visually occupies ~43% of a 1440-wide viewport while the cluster's
// CLUSTER_CENTER ends up well off-screen to the right.
const ZOOM_SCALE = 5
const EXP_FROZEN_ANGLE = SETTLED_ANGLES[FIRST_EXPANDING_IDX]
const EXP_FROZEN_CX = CLUSTER_CENTER.x + SETTLED_RADIUS * Math.cos(EXP_FROZEN_ANGLE)
const EXP_FROZEN_CY = CLUSTER_CENTER.y + SETTLED_RADIUS * Math.sin(EXP_FROZEN_ANGLE)

const remap = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a)))

export default function HomePage({ loaded = false }) {
  // Driven from App.jsx so the homepage's crossfade-in is in lockstep
  // with the loading screen's crossfade-out — no step-reveal blink.
  const [progress, setProgress] = useState(0)
  const pageRef = useRef()

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

  // Prototype scroll ranges, plus stitched solution/video tail at the end.
  //   0.00 → 0.12  state 0: nav + elements illustration
  //   0.12 → 0.24  state 1: Intro2 "What's wrong" crossfades in, glow border fades in
  //   0.24 → 0.38  state 2: pop-up card appears, orb/ring still floating
  //   0.38 → 0.64  state 3: orb expansion (card+ring fade, dark core grows, mid-text bell)
  //   0.64 → 0.78  stitched: solution circles fade in + first half-rotation
  //   0.78 → 0.84  stitched: circles settle into uniform octagon (Figma 7079:20971)
  //   0.84 → 0.91  phase 1: zoom into dot 5 → CareOpsPanel reveal → contract +
  //                          cluster zooms back to 1× (panel + zoom-out parallel)
  //   0.91 → 0.94  ring rotates +π/4 around CLUSTER_CENTER at 1× scale (offmenu.design-
  //                style transition; dot 6 lands at the original focus position)
  //   0.94 → 1.00  phase 2: zoom into dot 6 → video plays inside the masked dot
  const elementsOpacity = 1 - remap(progress, 0.12, 0.24)
  const intro2Opacity   = remap(progress, 0.12, 0.24) * (1 - remap(progress, 0.38, 0.46))
  // Glow border now persists through the orb expansion, dark core, and the
  // solution-circles scene — fades out as the focus circle expands and fades
  // back in as it contracts. Tied to circleExpandProgress (defined later) via
  // the same triangle, so the round-trip stays in sync.
  const expandT         = remap(progress, 0.38, 0.64)
  // Mesh-gradient backdrop for the post-orb phase. Reveals at the peak of
  // the dark gradient (expandT 0.7 → 1.0, scroll ~0.58 → 0.64) and stays
  // at full opacity as the persistent backdrop behind the cluster.
  const meshBgOpacity   = remap(expandT, 0.7, 1.0)

  // ── Unified orb morph ──
  // One element drives all three "steps" by interpolating size and vertical
  // center over scroll progress:
  //   scene 0 (opening):   big (≈79vh), centered 105px below viewport bottom
  //                         — mirrors the original .heroOrb framing
  //   scene 1-2 (intro2):  30.13vw, bottom-anchored with center at vh-307px
  //   scene 3 (expansion): 140vmax, centered at viewport middle
  // Ring is invisible in scene 0, fades in alongside Intro2, then fades out
  // right before expansion starts.
  const mix = (a, b, t) => a + (b - a) * t
  const openToIntroT = remap(progress, 0.00, 0.24)

  const vwPx = typeof window !== 'undefined' ? window.innerWidth  : 1440
  const vhPx = typeof window !== 'undefined' ? window.innerHeight : 900

  // Scene 0 size is kept at the exact fixed px the pre-merge .heroOrbCore
  // used (712.607). Matching it in vh made the orb shrink on laptops, which
  // didn't match the original hero framing.
  const ORB_OPEN_SIZE_PX   = 712.607
  const ORB_REST_SIZE_PX   = 0.3013 * vwPx               // 30.13vw
  const ORB_EXPAND_SIZE_PX = 1.40 * Math.max(vwPx, vhPx) // 140vmax

  // Single agent2 pair covers every scene. The ring scales 1.2834× in step 0
  // to match Figma's hero framing (914.564 / 712.607), back to 1× at rest.
  // The orb scales 1.342× in step 0 so the agent2 circle (r=104 in a 279
  // viewBox ≈ 74.55% of its bounding box) grows to fill the 712.607px
  // step-0 container — then interpolates back to its native rest size.
  const STEP0_RING_RATIO = 914.564 / 712.607  // ≈ 1.2834
  const STEP0_ORB_RATIO  = 279 / 208          // ≈ 1.3413

  const preExpandSize = mix(ORB_OPEN_SIZE_PX, ORB_REST_SIZE_PX, openToIntroT)
  const orbSizePx     = mix(preExpandSize,    ORB_EXPAND_SIZE_PX, expandT)

  // Vertical center expressed as offset from viewport top.
  const ORB_OPEN_CENTER_Y   = vhPx           // exactly on viewport bottom → 50% of the orb peeks in
  const ORB_REST_CENTER_Y   = vhPx - 307     // 307px above viewport bottom
  const ORB_EXPAND_CENTER_Y = vhPx / 2

  const preExpandCenterY = mix(ORB_OPEN_CENTER_Y, ORB_REST_CENTER_Y, openToIntroT)
  const orbCenterY       = mix(preExpandCenterY, ORB_EXPAND_CENTER_Y, expandT)

  const orbTopPx = orbCenterY - orbSizePx / 2

  // ── Intro2 phases A → B → C (between scene 1 and the orb expansion) ──
  // Phase A (0.12–0.20): orb sits at the rest position with heavy blur, ring
  // hidden, no paragraph yet. Phase B (0.20–0.28): blur dissipates as the ring
  // resolves and paragraph 1 slides up from the bottom-right. Phase C (0.28–
  // 0.36): paragraph 2 fades in and paragraph 1 dims to 25%; orb is sharp.
  // The vertical separator line grows from the bottom up over phase B; only
  // once it's at full height (progress 0.28) does paragraph 1 begin to rise.
  const lineGrowT         = remap(progress, 0.20, 0.28)
  const paragraph1Reveal  = remap(progress, 0.28, 0.32)
  const paragraph1Opacity = Math.max(0.25, 1 - remap(progress, 0.32, 0.36) * 0.75)
  const paragraph2Reveal  = remap(progress, 0.32, 0.36)

  // Ring fades with expansion and counter-shrinks so it reads as collapsing
  // while the container grows. Entrance is delayed to phase B so the ring
  // resolves alongside the blur dissipation.
  const ringOpacity = remap(progress, 0.20, 0.28) * Math.max(0, 1 - expandT / 0.25)
  const ringRatioBase = mix(STEP0_RING_RATIO, 1, openToIntroT)
  const ringScale = expandT > 0
    ? (1 - expandT) * ringRatioBase * (ORB_REST_SIZE_PX / orbSizePx)
    : ringRatioBase

  // Agent unblur is a left → right reveal: a backdrop-blur layer covers the
  // whole agent circle, then its mask retreats from left to right between
  // progress 0.16 and 0.28. revealX is the position of the mask's hard edge,
  // overshooting the [0, 100]% range so the feather lands fully off-circle
  // at both ends.
  const revealX = -12 + remap(progress, 0.16, 0.28) * 124

  const orbCoreScale = mix(STEP0_ORB_RATIO, 1, openToIntroT)

  // Mid-expansion centered text bell (fades in 0.30→0.55, out 0.75→0.95 of expandT)
  const textOpacity = Math.max(0, Math.min(
    (expandT - 0.30) / 0.25,
    (0.95 - expandT) / 0.20,
    1,
  ))
  const textScale = 0.96 + 0.04 * Math.max(0, Math.min((expandT - 0.30) / 0.25, 1))

  // Dark core opacity tracks expandT directly; full-bleed wash fills from 0.7→1
  const darkCoreOpacity = expandT
  const darkWashOpacity = Math.max(0, Math.min((expandT - 0.7) / 0.3, 1))

  // Solution-circles section (unchanged from prior implementation) —
  // picks up once the dark-purple wash is solid.
  const solutionOpacity = remap(progress, 0.64, 0.78)
  const orbitRotation = remap(progress, 0.64, 0.78) * Math.PI
  const settleProgress = remap(progress, 0.78, 0.84)

  // Post-settle sequence (two-focus, with ring rotation between them):
  //   0.84 → 0.86  zoom1 in       (cluster 1× → 5× around dot 5)
  //   0.86 → 0.88  expand1 fwd    (dot 5 grows to fill viewport with CareOpsPanel)
  //   0.88 → 0.91  HOLD           (panel sits fully expanded; ~15vh of scroll
  //                                where all 6 icons stay clearly visible)
  //   0.91 → 0.93  expand1 bwd    (panel contracts back to a dot)
  //   0.92 → 0.94  zoom1 bwd      (cluster zooms back to 1×, parallels the panel
  //                                contract so the ring is fully re-formed by 0.94)
  //   0.94 → 0.96  ring rotation  (cluster at 1×; each dot's angle shifts by +π/4
  //                                around CLUSTER_CENTER — dot 6 ends at angle π)
  //   0.96 → 0.97  zoom2 in       (cluster 1× → 5× around the focus position; dot 6
  //                                is now the dot that lives there)
  //   0.97 → 1.00  expand2 fwd    (dot 6 grows to fill viewport with the video)
  const zoom1Fwd       = remap(progress, 0.84, 0.86)
  const expand1Fwd     = remap(progress, 0.86, 0.88)
  const expand1Bwd     = remap(progress, 0.91, 0.93)
  const zoom1Bwd       = remap(progress, 0.92, 0.94)
  const ringRotationT  = remap(progress, 0.94, 0.96)
  const zoom2Fwd       = remap(progress, 0.96, 0.97)
  const expand2Fwd     = remap(progress, 0.97, 1.00)
  // Cluster zoom progresses through three phases (offmenu.design reference,
  // see https://www.offmenu.design/):
  //   1. zoom1Fwd (0.84-0.86): 0 → 1 (full zoom into dot 5)
  //   2. zoom1Bwd (0.89-0.91): 1 → 0.5 — only contracts halfway, so the cluster
  //      stays partially scaled during the ring rotation. Avoids the snap-back
  //      to 1× that the previous implementation did.
  //   3. zoom2Fwd (0.94-0.96): 0.5 → 1 (continues into rotated dot 6)
  // Branching on zoom2Fwd>0 keeps the transition continuous: at the boundary
  // both formulas evaluate to 0.5.
  const zoomProgress =
    zoom2Fwd > 0
      ? mix(0.5, 1, zoom2Fwd)
      : zoom1Fwd * (1 - zoom1Bwd * 0.5)
  const expand1Progress      = expand1Fwd * (1 - expand1Bwd)
  const expand2Progress      = expand2Fwd
  const circleExpandProgress = Math.max(expand1Progress, expand2Progress)
  // Title fades out before the ring scales and stays gone for the rest of the
  // sequence — no flash-back during the rotation interlude (the ring doesn't
  // fully return to 1× anymore, so re-showing the title would feel out of place).
  const solutionTextOpacity = 1 - remap(progress, 0.82, 0.84)
  // Label starts centered with the title (Figma 7082:27919) and rises to its
  // pinned top:120px slot as the ring begins to scale (zoom1Fwd, 0.84-0.86).
  // Eased with smoothstep so the motion has a soft start and finish.
  const easeInOut = t => t * t * (3 - 2 * t)
  const LABEL_TOP_PINNED = 120
  const labelTopCentered = vhPx / 2 - 112
  const labelTop = mix(labelTopCentered, LABEL_TOP_PINNED, easeInOut(zoom1Fwd))
  // Label fades out as the video reveal grows — its 'inside the dot' overlay
  // sits on top of the video clip and would otherwise read across the phone-
  // call mockup. Stays fully visible during the panel reveal (expand2Progress
  // is 0 throughout that phase) and during the ring-rotation interlude.
  const labelVideoOpacity = 1 - expand2Progress
  // Glow border tracks panel coverage: gone while the panel/video covers the
  // viewport, restored in between.
  const borderOpacity = remap(progress, 0.10, 0.22) * (1 - circleExpandProgress)

  // Zoom-approach transform applied to the whole .orbitCluster. Origin at the
  // focus circle's settled position so scaling keeps it pinned, then a translate
  // brings that origin to viewport center. After the zoom phase the cluster is
  // at ZOOM_SCALE with its CLUSTER_CENTER (the rotation axis) pushed to the
  // far right of the viewport.
  //
  // Translate (centering) is decoupled from scale: it ramps up with zoom1Fwd
  // and STAYS at full centering — even while the cluster contracts back to 3×
  // for the rotation interlude. That keeps the focus dot pinned at viewport
  // center the whole time (offmenu.design's "focus stays put, neighbors swing
  // in from the edges" feel). Only the scale changes 1→5→3→5.
  const clusterScale = mix(1, ZOOM_SCALE, zoomProgress)
  const clusterTx = (CLUSTER_CENTER.x - EXP_FROZEN_CX) * zoom1Fwd
  const clusterTy = (CLUSTER_CENTER.y - EXP_FROZEN_CY) * zoom1Fwd
  const expFullScale = Math.hypot(
    (typeof window !== 'undefined' ? window.innerWidth  : 1440) / 2,
    (typeof window !== 'undefined' ? window.innerHeight : 900)  / 2,
  ) / SETTLED_CIRCLE_R + 2
  // During expansion the cluster is already at ZOOM_SCALE, so the wrap-level
  // scale only needs to grow the focus circle from ZOOM_SCALE × base up to
  // the full-viewport scale. Combined visual scale = clusterScale * wrapScale.
  // Each focus dot has its own expansion progress; the per-dot wrap-scale is
  // applied below in the orbit-cluster map.
  const expand1WrapScale = mix(1, expFullScale / ZOOM_SCALE, expand1Progress)
  const expand2WrapScale = mix(1, expFullScale / ZOOM_SCALE, expand2Progress)
  // For the label-mask clip-path radius we want whichever focus is currently
  // expanding (only one is active at a time).
  const activeWrapScale = Math.max(expand1WrapScale, expand2WrapScale)

  // Viewport-space center and radius of the active focus dot — drives the
  // clip-path on a black-text overlay of the solution label so the label
  // reads white outside the dot and black inside it. Both expansion phases
  // land their focus dot at the same local position (EXP_FROZEN_CX/CY),
  // because dot 6's post-rotation angle equals dot 5's settled angle.
  // Cluster transform: scale around (EXP_FROZEN_CX, EXP_FROZEN_CY), then translate.
  // The focus-position offset from the transform origin is zero, so the scale
  // term collapses out and only the translate contributes.
  const _focusXfCx = EXP_FROZEN_CX + clusterTx
  const _focusXfCy = EXP_FROZEN_CY + clusterTy
  // .orbitCluster is anchored at viewport center via 50%/50% + (-371,-364) margins.
  const focusVpCx = vwPx / 2 - 371 + _focusXfCx
  const focusVpCy = vhPx / 2 - 364 + _focusXfCy
  const focusVpR  = SETTLED_CIRCLE_R * clusterScale * activeWrapScale

  return (
    <div
      ref={pageRef}
      className={`${styles.page} ${loaded ? styles.loaded : ''}`}
      style={{ height: '600vh' }}
    >
      <div className={styles.sticky}>

        {/* Light background that carries the first three scroll states */}
        <div className={styles.bg} />

        {/* Hero mesh-gradient wash — the opening scene's backdrop. Fades
            out in lockstep with the rest of state-0 content so Intro2
            lands on the flat cream bg underneath. */}
        <img
          className={styles.heroMesh}
          src="/hero-mesh.png"
          alt=""
          aria-hidden="true"
          style={{ opacity: elementsOpacity }}
        />

        {/* Opening scene copy — label + subtitle. The headline itself lives
            in App-level HeroTitle so it can be a single element that
            morphs continuously from the loading position into this one. */}
        <div className={styles.opening} style={{ opacity: elementsOpacity }}>
          <div className={styles.heroLabel}>
            <span className={styles.heroLabelDot} />
            <span className={styles.heroLabelText}>
              AI agents for triage and care orchestration
            </span>
          </div>
          <p className={styles.heroSubtitle}>
            Scale your capacity, stay ahead of patient needs, and run
            unbreakable operations.
          </p>
        </div>

        {/* Intro2 scene label — crossfades in with the "What's wrong?" headline
            and replaces the path-rendered label baked into Intro2.svg, so it
            inherits the site's standard 14px/500 DM Mono treatment. */}
        <div className={styles.heroLabel} style={{ opacity: intro2Opacity }}>
          <span className={styles.heroLabelDot} />
          <span className={styles.heroLabelText}>What's wrong?</span>
        </div>

        {/* Partner strip — sits above the orb at the bottom of the hero. */}
        <div
          className={styles.heroPartners}
          style={{ opacity: elementsOpacity }}
        >
          <p className={styles.partnersCaption}>
            Built by the #1 AI Care company. Proven at scale. Ready for your teams.
          </p>
        </div>

        {/* Main navbar — visible only in the opening scene; crossfades out
            as the user scrolls and hands off to the compact pill below. */}
        <nav
          className={styles.heroNav}
          aria-label="Primary"
          style={{
            opacity: elementsOpacity,
            pointerEvents: elementsOpacity > 0.5 ? 'auto' : 'none',
          }}
          aria-hidden={elementsOpacity < 0.5}
        >
          <img className={styles.navLogotype} src="/logotype.svg" alt="Sword Intelligence" />
          <div className={styles.navPages}>
            <button type="button" className={styles.navPage}>
              <span>Solution</span>
              <img className={styles.navPageArrow} src="/arrow-down.svg" alt="" aria-hidden="true" />
            </button>
            <button type="button" className={styles.navPage}>
              <span>Platform</span>
              <img className={styles.navPageArrow} src="/arrow-down.svg" alt="" aria-hidden="true" />
            </button>
            <button type="button" className={styles.navPage}>
              <span>About</span>
            </button>
            <button type="button" className={styles.navPage}>
              <span>Resources</span>
            </button>
            <button type="button" className={styles.navPage}>
              <span>Customers</span>
            </button>
          </div>
          <button type="button" className={styles.navCta}>
            Book a meeting
          </button>
        </nav>

        {/* "What's wrong?" headline. Crossfades in alongside the matching
            DOM label via intro2Opacity. Replaces the Instrument-Serif paths
            that used to live inside Intro2.svg so the type can be sized at
            the spec'd 80px / 105% line-height. */}
        <p
          className={styles.intro2Headline}
          style={{ opacity: intro2Opacity }}
        >
          Healthcare demand is outpacing human capacity.
        </p>

        {/* Right-side paragraph block — bottom-anchored stack with a vertical
            line separator. Phase B reveals paragraph 1 (rises + fades in),
            phase C reveals paragraph 2 and dims paragraph 1 to 25%. */}
        <div
          className={styles.intro2Paragraphs}
          style={{ opacity: intro2Opacity }}
          aria-hidden={paragraph1Reveal < 0.5 && paragraph2Reveal < 0.5}
        >
          <div
            className={styles.intro2ParagraphLine}
            style={{ transform: `scaleY(${lineGrowT})` }}
          />
          <div className={styles.intro2ParagraphCol}>
            <p
              className={styles.intro2Paragraph}
              style={{
                opacity: paragraph1Reveal * paragraph1Opacity,
                transform: `translateY(${(1 - paragraph1Reveal) * 40}px)`,
              }}
            >
              When every decision depends on humans, the first bottleneck is{' '}
              <strong>access</strong>.
            </p>
            <p
              className={styles.intro2Paragraph}
              style={{
                opacity: paragraph2Reveal,
                transform: `translateY(${(1 - paragraph2Reveal) * 40}px)`,
              }}
            >
              As a result, problems are detected too late: care is{' '}
              <strong>reactive</strong>.
            </p>
          </div>
        </div>

        {/* Unified orb — one element morphs across all three "steps". Its
            size and vertical center interpolate between scene 0 (big, just
            below the fold), scene 1-2 (small, bottom-anchored) and scene 3
            (huge, centered). The ring of dots fades in with Intro2 and out
            again right before the orb begins to expand. */}
        <div
          className={styles.agent}
          style={{
            width: `${orbSizePx}px`,
            height: `${orbSizePx}px`,
            top: `${orbTopPx}px`,
          }}
        >
          <div className={styles.agentFloat}>
            {/* Single ring shape used across every scene — two orb variants
                crossfade to drive the color transition from the lavender
                step-0 gradient (#7647B7 → #BBA5FF, Figma node 6742:8270) to
                the darker rest gradient (#5610B7 → #BBA5FF). Both share the
                same scale so the silhouette stays continuous. */}
            {/* Disable picker hits on the orb once the focus circle starts
                expanding — otherwise the full-bleed orb sits above the
                CareOpsPanel and steals every elementsFromPoint hit. */}
            <img
              className={styles.agentOrb}
              src="/agent2-orb-step0.svg"
              alt=""
              style={{
                opacity: 1 - openToIntroT,
                transform: `scale(${orbCoreScale})`,
                pointerEvents: circleExpandProgress > 0 ? 'none' : undefined,
              }}
            />
            <img
              className={styles.agentOrb}
              src="/agent2-orb.svg"
              alt=""
              style={{
                opacity: openToIntroT,
                transform: `scale(${orbCoreScale})`,
                pointerEvents: circleExpandProgress > 0 ? 'none' : undefined,
              }}
            />
            <img
              className={styles.agentRing}
              src="/agent2-ring.svg"
              alt=""
              aria-hidden="true"
              style={{
                opacity: ringOpacity,
                transform: `rotate(${progress * 180}deg) scale(${ringScale})`,
                pointerEvents: circleExpandProgress > 0 ? 'none' : undefined,
              }}
            />
            <div
              className={styles.agentReveal}
              aria-hidden="true"
              style={{ '--reveal-x': `${revealX}%` }}
            />
          </div>
        </div>

        {/* Animated glow border — a blurred gradient stroke around the
            viewport. Two variants stacked: the opening palette (purple +
            lime) crossfades into the cool solution-scene palette as the
            "Healthcare's first Modular Intelligence Platform" view takes
            over (tracks solutionOpacity, 0→1 over 0.64→0.86). */}
        <svg
          className={styles.glowBorder}
          style={{ opacity: borderOpacity * (1 - solutionOpacity) }}
          width="1440" height="900" viewBox="0 0 1440 900"
          preserveAspectRatio="none" fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <g filter="url(#glow-border-blur-1)">
            <rect width="1440" height="900" rx="40"
                  stroke="url(#glow-border-grad-1)" strokeWidth="120" />
          </g>
          <defs>
            <filter id="glow-border-blur-1" x="-140" y="-140" width="1720" height="1180"
                    filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="50" />
            </filter>
            {/* color-interpolation="linearRGB" switches the gradient's
                midtone math from sRGB (which lands on lavender/pink
                between #7700EE and #ECFCAE) to linear-light, which lands
                on a neutral light-violet instead. Keeps the gradient to
                exactly the 3 spec'd stops without introducing pink. */}
            <linearGradient id="glow-border-grad-1" x1="0" y1="0" x2="1440" y2="900"
                            gradientUnits="userSpaceOnUse"
                            colorInterpolation="linearRGB">
              <stop offset="0"        stopColor="#7700EE" />
              <stop offset="0.509615" stopColor="#ECFCAE" />
              <stop offset="1"        stopColor="#7700EE" />
              <animateTransform attributeName="gradientTransform"
                type="rotate"
                from="0 720 450"
                to="360 720 450"
                dur="8s"
                repeatCount="indefinite" />
            </linearGradient>
          </defs>
        </svg>

        {/* Solution-scene glow border — cooler palette (#A684FF → #8BAEE4
            → #BFC0CC → #A684FF) crossfades in with solutionOpacity. */}
        <svg
          className={styles.glowBorder}
          style={{ opacity: borderOpacity * solutionOpacity }}
          width="1440" height="900" viewBox="0 0 1440 900"
          preserveAspectRatio="none" fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <g filter="url(#glow-border-blur-2)">
            <rect width="1440" height="900" rx="40"
                  stroke="url(#glow-border-grad-2)" strokeWidth="120" />
          </g>
          <defs>
            <filter id="glow-border-blur-2" x="-140" y="-140" width="1720" height="1180"
                    filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="50" />
            </filter>
            <linearGradient id="glow-border-grad-2" x1="0" y1="0" x2="1440" y2="900"
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

        {/* Next-phase backdrop. Fades in inside the dark gradient
            (expandT 0.7 → 1.0) so the transition into the AI Care
            Managers scene feels continuous, then persists as the
            backdrop behind the cluster. Figma 7300:560. */}
        <img
          className={styles.solutionBgMesh}
          src="/solution-bg-mesh.png"
          alt=""
          style={{ opacity: meshBgOpacity }}
        />

        {/* Mid-expansion centered text — Figma 7067:24701. */}
        <p
          className={styles.midText}
          style={{
            opacity: textOpacity,
            transform: `translate(-50%, -50%) scale(${textScale})`,
          }}
        >
          AI Care is the force multiplier healthcare needs now.
        </p>

        {/* Dark core — radial from center, fades in as orb takes over */}
        <div
          className={styles.darkCore}
          style={{ opacity: darkCoreOpacity }}
          aria-hidden="true"
        >
          <div className={styles.darkWash} style={{ opacity: darkWashOpacity }} />
        </div>

        {/* ── Stitched solution-circles + video tail ──
            Sits above the dark core so it becomes the readable surface
            once orb expansion completes. */}
        <div className={styles.solutionLayer} style={{ opacity: solutionOpacity }}>
          <img src="/solution-bg-cluster.svg" alt="" className={styles.solutionBgCluster} />

          {/* White-text label, sits below the orbit cluster in DOM order so the
              expanding focus circle (panel) covers it. The masked black overlay
              after the cluster fills in the covered area, keeping the label
              readable: white outside the dot, black inside it. */}
          <div className={styles.solutionLabel} style={{ top: `${labelTop}px`, opacity: labelVideoOpacity }}>
            <span className={styles.solutionDot} />
            <span className={styles.solutionLabelText}>AI Care Managers</span>
          </div>
          <p className={styles.solutionTitle} style={{ opacity: solutionTextOpacity }}>
            The first intelligent<br />
            care ops system.
          </p>

          <div
            className={styles.orbitCluster}
            style={{
              transformOrigin: `${EXP_FROZEN_CX}px ${EXP_FROZEN_CY}px`,
              transform: `translate(${clusterTx}px, ${clusterTy}px) scale(${clusterScale})`,
            }}
          >
            {ORBIT_CIRCLES.map((c, i) => {
              const { orbitR: baseOrbitR, baseAngle } = ORBIT_PARAMS[i]
              // Rotation phase blends with settle: at the end of the half-turn
              // each circle pulls toward its uniform octagon slot (radius 335,
              // size 61.72) while the orbit angle slides to a 45° multiple.
              // After settle, the +π/4 ring rotation between the two reveals is
              // baked into each dot's angle directly — no cluster-level rotate.
              const rotAngle = baseAngle + orbitRotation
              const settledAngle = SETTLED_ANGLES[i] + ringRotationT * RING_ROTATION_ANGLE
              const angle = mix(rotAngle, settledAngle, settleProgress)
              const orbitR = mix(baseOrbitR, SETTLED_RADIUS, settleProgress)
              const cR = mix(c.r, SETTLED_CIRCLE_R, settleProgress)
              const cx = CLUSTER_CENTER.x + orbitR * Math.cos(angle)
              const cy = CLUSTER_CENTER.y + orbitR * Math.sin(angle)
              const isFirstFocus  = i === FIRST_EXPANDING_IDX
              const isSecondFocus = i === SECOND_EXPANDING_IDX

              const wrapStyle = {
                left: `${cx - cR}px`,
                top: `${cy - cR}px`,
                width: `${cR * 2}px`,
                height: `${cR * 2}px`,
              }

              if (isFirstFocus || isSecondFocus) {
                // Cluster transform already centers the focus on the viewport;
                // wrap-level scale only carries it the rest of the way during
                // its own expansion phase. The "other" focus sits dormant at
                // its rotated octagon slot whenever its sibling is mid-reveal.
                const myWrap = isFirstFocus ? expand1WrapScale : expand2WrapScale
                const myExp  = isFirstFocus ? expand1Progress  : expand2Progress
                const otherExp = isFirstFocus ? expand2Progress : expand1Progress
                wrapStyle.transform = `scale(${myWrap})`
                wrapStyle.zIndex = 2
                if (myExp === 0) wrapStyle.opacity = 1 - otherExp
              } else {
                // Non-focus circles are hidden only while a panel/video covers
                // the viewport. They stay visible during zoom approaches and
                // the ring-rotation moment, so the orbit_circles read as a
                // real ring orbiting CLUSTER_CENTER between the two reveals.
                wrapStyle.opacity = 1 - circleExpandProgress
              }

              // Size the panel/video at real viewport pixels and counter-scale
              // it against the cluster × wrap transform so its 160px tiles,
              // 20px caption, etc. land at exactly viewport size on screen.
              const myWrapForFill =
                isFirstFocus  ? expand1WrapScale :
                isSecondFocus ? expand2WrapScale : 1
              const fillStyle = {
                width: `${vwPx}px`,
                height: `${vhPx}px`,
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) scale(${1 / (clusterScale * myWrapForFill)})`,
              }

              return (
                <div key={i} className={styles.orbitWrap} style={wrapStyle}>
                  <div className={styles.orbitCircle} />
                  {isFirstFocus && expand1Progress > 0 && (
                    <CareOpsPanel
                      style={{
                        ...fillStyle,
                        opacity: Math.min(1, expand1Progress * 3),
                      }}
                    />
                  )}
                  {isSecondFocus && expand2Fwd > 0 && (
                    <video
                      className={styles.expandVideo}
                      src="https://cdn.swordhealth.tech/assets/assets/intelligence/videos/Sword_AI_Managers_H264_v2.webm"
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        ...fillStyle,
                        opacity: Math.min(1, expand2Fwd * 3),
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Black-text duplicate of the label, clipped to the focus dot's
              viewport-space circle. Layered above the panel so the section of
              the label inside the dot reads black on the panel's light fill. */}
          <div
            className={styles.solutionLabelMask}
            style={{
              clipPath: `circle(${Math.max(0, focusVpR)}px at ${focusVpCx}px ${focusVpCy}px)`,
              WebkitClipPath: `circle(${Math.max(0, focusVpR)}px at ${focusVpCx}px ${focusVpCy}px)`,
            }}
            aria-hidden="true"
          >
            <div className={styles.solutionLabel} style={{ top: `${labelTop}px`, opacity: labelVideoOpacity }}>
              <span className={styles.solutionDot} />
              <span className={`${styles.solutionLabelText} ${styles.solutionLabelTextDark}`}>
                AI Care Managers
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
