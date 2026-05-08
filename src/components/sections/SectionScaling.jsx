// "Scaling care with AI" — Figma 7067:28273. Static vertical list of all four
// stats; the divider line jumps to sit directly above whichever row is active.
// No sticky pinning — section flows naturally and `activeIndex` is driven by
// which row sits closest to the viewport's vertical centre as the user scrolls.

import { useState, useEffect, useLayoutEffect, useRef } from 'react';

const STATS = [
  { value: '900K',  caption: 'Patients' },
  { value: '13.5M', caption: 'AI Sessions' },
  { value: '58',    caption: 'Clinical papers published' },
  { value: '50',    caption: 'Patents granted' },
];

// Number rendered with `font-size: 88px` and `line-height: 1.1` — the visible
// line box ≈ 96.8px. All vertical math derives from this.
const NUM_LINE_BOX_PX = 96.8;
const ROW_GAP_PX = 24;
const ROW_PITCH_PX = NUM_LINE_BOX_PX + ROW_GAP_PX; // 120.8 — row N's top = N * pitch
const LIST_HEIGHT_PX = STATS.length * NUM_LINE_BOX_PX + (STATS.length - 1) * ROW_GAP_PX;
const LINE_HEIGHT_PX = 1.5;

const sImgTopFade   = "/assets/scaling-top-fade.png";
const sImgBotFade   = "/assets/scaling-bottom-fade.png";
const sImgBgPattern = "/assets/scaling-bg-pattern.svg";
const sImgLabelDot  = "/assets/scaling-label-dot.svg";
const sImgPlus      = "/assets/scaling-plus.svg";

// Active row gets full intensity black + lime accent on the plus circle;
// rows further from the active fade through gray-400 → gray-300.
function styleForDistance(distance) {
  if (distance === 0) return { opacity: 1,    color: '#000',    plusBg: '#d8f95d' };
  if (distance === 1) return { opacity: 0.75, color: '#85889c', plusBg: '#faffeb' };
  return                     { opacity: 0.5,  color: '#bfc0cc', plusBg: '#faffeb' };
}

function StatRow({ value, color, opacity, plusBg, numberRef }) {
  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      opacity,
      transition: 'opacity 220ms ease, color 220ms ease',
    }}>
      <p ref={numberRef} style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: '88px',
        lineHeight: 1.1,
        letterSpacing: '-0.88px',
        color,
        margin: 0,
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}>
        {value}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', paddingTop: '11px' }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '24px',
          background: plusBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 220ms ease',
        }}>
          <img src={sImgPlus} alt="" aria-hidden="true" style={{ width: '16px', height: '16px' }} />
        </div>
      </div>
    </div>
  );
}

export default function SectionScaling() {
  const listRef = useRef(null);
  const firstNumberRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [firstNumberWidth, setFirstNumberWidth] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (firstNumberRef.current) {
        setFirstNumberWidth(firstNumberRef.current.offsetWidth);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    let rafId = 0;
    let ticking = false;
    const update = () => {
      ticking = false;
      const el = listRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vhHalf = window.innerHeight / 2;
      // Active = whichever row's centre is closest to viewport centre. Naturally
      // settles at row 0 before the section scrolls into view and at the last
      // row after it has scrolled past.
      let bestI = 0;
      let bestDist = Infinity;
      for (let i = 0; i < STATS.length; i++) {
        const rowCentre = rect.top + i * ROW_PITCH_PX + NUM_LINE_BOX_PX / 2;
        const dist = Math.abs(rowCentre - vhHalf);
        if (dist < bestDist) { bestDist = dist; bestI = i; }
      }
      setActiveIndex((cur) => (cur === bestI ? cur : bestI));
    };
    const onScroll = () => {
      if (!ticking) { rafId = requestAnimationFrame(update); ticking = true; }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Line sits centred in the gap directly above the active row (jumps, no transition).
  const lineTop = activeIndex * ROW_PITCH_PX - ROW_GAP_PX / 2 - LINE_HEIGHT_PX / 2;
  // Caption is centred vertically on the active number's line box.
  const captionTop = activeIndex * ROW_PITCH_PX + NUM_LINE_BOX_PX / 2;
  // Line widens from the first number's width (row 0) to the section's full
  // content width (row N-1), so the divider grows toward the page margin as
  // the user scrolls through the stats.
  const lineProgress = STATS.length === 1 ? 1 : activeIndex / (STATS.length - 1);
  const lineMinWidthPx = firstNumberWidth || 200; // fallback before first measurement
  const lineWidth = `calc(${lineMinWidthPx}px + (100% - ${lineMinWidthPx}px) * ${lineProgress})`;

  return (
    <section style={{
      position: 'relative',
      background: '#f9f9f9',
      padding: '120px 80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '120px',
      overflow: 'clip',
      boxSizing: 'border-box',
    }}>
      {/* Background dot/grid pattern — Figma original dimensions, behind everything */}
      <img
        src={sImgBgPattern}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: 'calc(50% - 132.92px)',
          transform: 'translate(-50%, -50%)',
          width: '1964.272px',
          height: '1498.163px',
          maxWidth: 'none',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top + bottom soft fades */}
      <img
        src={sImgTopFade}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1440px',
          height: '120px',
          objectFit: 'cover',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <img
        src={sImgBotFade}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1440px',
          height: '120px',
          objectFit: 'cover',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Header row: title left, paragraph right */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '1280px',
        maxWidth: '100%',
        display: 'flex',
        gap: '133px',
        alignItems: 'flex-end',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flexShrink: 0, position: 'relative' }}>
          {/* Lime highlight strip behind "done that" — Figma 7337:5512 */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            left: '220px',
            top: 'calc(50% + 58px)',
            transform: 'translateY(-50%)',
            width: '176px',
            height: '24px',
            background: '#d8f95d',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
            <img src={sImgLabelDot} alt="" aria-hidden="true" style={{ width: '6px', height: '6px' }} />
            <p style={{
              fontFamily: "'DM Mono', monospace",
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'uppercase',
              color: '#000',
              margin: 0,
              whiteSpace: 'nowrap',
            }}>
              Built inside Sword Health, the #1 AI Care company
            </p>
          </div>
          <p style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '56px',
            lineHeight: 1.05,
            letterSpacing: '-0.28px',
            color: '#000',
            margin: 0,
            width: '519px',
            position: 'relative',
            zIndex: 1,
          }}>
            Scaling care with AI:<br />
            been there, done that<span style={{ fontStyle: 'italic' }}>.</span>
          </p>
        </div>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: '20px',
          lineHeight: 1.3,
          letterSpacing: '-0.2px',
          color: '#000',
          margin: 0,
          width: '628px',
        }}>
          On the journey to freeing over 700k people from pain, Sword Health{' '}
          hit the same wall every healthcare organization does: non-clinical work. Instead of throwing more staff at the problem, we built AI in-house to take on operations safely, effectively, and at scale.
        </p>
      </div>

      {/* Stat list — all four numbers always visible; rows positioned absolutely
          so list height stays fixed regardless of which row is active. */}
      <div
        ref={listRef}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: `${LIST_HEIGHT_PX}px`,
        }}
      >
        {STATS.map((s, i) => {
          const distance = Math.abs(i - activeIndex);
          const { opacity, color, plusBg } = styleForDistance(distance);
          return (
            <div
              key={s.value}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${i * ROW_PITCH_PX}px`,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <StatRow value={s.value} color={color} opacity={opacity} plusBg={plusBg} numberRef={i === 0 ? firstNumberRef : undefined} />
            </div>
          );
        })}

        {/* Divider line — sits just above the active row; widens as the
            active row advances so the last row reaches the section margin. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            top: `${lineTop}px`,
            transform: 'translateX(-50%)',
            width: lineWidth,
            maxWidth: '100%',
            height: `${LINE_HEIGHT_PX}px`,
            background: '#000',
            pointerEvents: 'none',
            zIndex: 1,
            transition: 'width 220ms ease',
          }}
        />

        {/* Caption — sits to the right of the active number, vertically centred on it */}
        <p
          key={activeIndex}
          style={{
            position: 'absolute',
            left: 'calc(50% + 130px)',
            top: `${captionTop}px`,
            transform: 'translateY(-50%)',
            width: '180px',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: '24px',
            lineHeight: 1.2,
            letterSpacing: '-0.24px',
            color: '#000',
            margin: 0,
            zIndex: 2,
            animation: 'sectionScalingCaptionFade 220ms ease',
          }}
        >
          {STATS[activeIndex].caption}
        </p>
        <style>{`@keyframes sectionScalingCaptionFade { from { opacity: 0; } to { opacity: 1; } }`}</style>
      </div>

      {/* Closing paragraph */}
      <p style={{
        position: 'relative',
        zIndex: 2,
        fontFamily: "'Inter', sans-serif",
        fontWeight: 400,
        fontSize: '24px',
        lineHeight: 1.2,
        letterSpacing: '-0.2px',
        color: '#180634',
        textAlign: 'center',
        width: '662px',
        maxWidth: '100%',
        margin: 0,
      }}>
        We proved AI Care Managers can run operations end-to-end across millions of sessions. Now we're ready to do it again, with you.
      </p>
    </section>
  );
}
