import { useState, useEffect, useRef } from 'react';
import DashedCircle from '../DashedCircle';

const transImgBlob = "/assets/be91232b-7d93-4b16-8aa1-6abab5851ea3.svg";
const transImgDot  = "/assets/173a864a-cb5e-47af-a073-7a2d703c3d08.svg";
const mtImgArrow = "/assets/c0264b38-1fc4-4208-b203-ebf84e22c43a.svg";

function useParallax(ref, speed) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    let rafId = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      // Larger SETTLE = bigger initial offset AND later alignment, so cards
      // travel more dramatically and "land" closer to the title push moment.
      const SETTLE = 0.7;
      const progress = Math.min(SETTLE, Math.max(0, (vh - center) / vh));
      // Inverted: cards enter the viewport offset (-SETTLE * speed) and settle to 0
      // by the time progress reaches SETTLE — i.e. they "arrive" at the Figma layout
      // rather than drifting away from it.
      setOffset(-(SETTLE - progress) * speed);
    };

    const onScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [ref, speed]);
  return offset;
}

function ParallaxCard({ speed, style, children }) {
  const ref = useRef(null);
  const offset = useParallax(ref, speed);
  const baseTransform = style.transform || '';
  return (
    <div
      ref={ref}
      style={{
        ...style,
        transform: `${baseTransform} translate3d(0, ${offset}px, 0)`.trim(),
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

const TITLE_PIN_VH = 120;
const CARDS_PULL_VH = 80;
// Fraction of viewport the title uses to rise from bottom → center.
// Smaller = rise starts later (title stays below viewport longer).
const RISE_FRACTION = 0.8;

function BackdropLayer() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none', zIndex: 0, overflow: 'clip',
    }}>
      <div style={{
        position: 'sticky', top: 0, width: '100%', height: '100vh',
        background: '#f9f9f9',
      }}>
        <div style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          width: '1154px', height: '804px', opacity: 0.75, maxWidth: '100%',
        }}>
          <div style={{ position: 'absolute', inset: '-23% -16%' }}>
            <img src={transImgBlob} alt="" style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionTransition() {
  const pinRegionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);
  const [riseOffset, setRiseOffset] = useState(0);
  const [pushUp, setPushUp] = useState(0);

  useEffect(() => {
    const GAP_PX = 32;
    let rafId = 0;
    let ticking = false;
    const update = () => {
      ticking = false;
      const pinEl = pinRegionRef.current;
      const titleEl = titleRef.current;
      const cardsEl = cardsRef.current;
      if (!pinEl || !titleEl || !cardsEl) return;
      const vh = window.innerHeight;

      // Rise phase: title's natural viewport center = pinRegion.top + vh/2.
      // Interpolate so that at pinRegion.top = riseSpan the title center sits
      // at vh (viewport bottom), and at pinRegion.top = 0 it sits at vh/2.
      // Smaller RISE_FRACTION delays the rise start.
      const pinRect = pinEl.getBoundingClientRect();
      const riseSpan = vh * RISE_FRACTION;
      const pinTopClamped = Math.max(0, Math.min(riseSpan, pinRect.top));
      setRiseOffset(pinTopClamped * (vh / 2 - riseSpan) / riseSpan);

      const naturalBottom = vh / 2 + titleEl.offsetHeight / 2;
      const cardsRect = cardsEl.getBoundingClientRect();
      const intrusion = (naturalBottom + GAP_PX) - cardsRect.top;
      setPushUp(Math.max(0, intrusion));
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

  return (
    <div style={{ position: 'relative', width: '100%', background: '#f9f9f9' }}>
      <BackdropLayer />

      <div ref={pinRegionRef} style={{ position: 'relative', width: '100%', height: `calc(100vh + ${TITLE_PIN_VH}vh)`, zIndex: 1 }}>
        <div style={{
          position: 'sticky', top: 0, width: '100%', height: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div
            ref={titleRef}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '24px',
              transform: `translateY(${riseOffset - pushUp}px)`,
              willChange: 'transform',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={transImgDot} alt="" aria-hidden="true"
                   style={{ width: '8px', height: '8px', flexShrink: 0 }} />
              <p style={{
                fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: '14px',
                lineHeight: 'normal', textTransform: 'uppercase', color: '#000',
                whiteSpace: 'nowrap', margin: 0,
              }}>
                Scale capcity without scaling costs
              </p>
            </div>
            <p style={{
              fontFamily: "'Instrument Serif', serif", fontSize: '80px',
              lineHeight: 1.05, letterSpacing: '-0.4px', color: '#1f1f1f',
              textAlign: 'center', whiteSpace: 'nowrap', margin: 0,
            }}>
              Unbreakable operations.
              <br aria-hidden="true" />
              Undeniable outcomes.
            </p>
          </div>
        </div>
      </div>

      <div ref={cardsRef} style={{ position: 'relative', zIndex: 1, marginTop: `calc(-${CARDS_PULL_VH}vh)` }}>
        <MetricsCards />
      </div>
    </div>
  );
}

// Layout per Figma 7288:1707 — a fixed 1280×1284 absolute-positioned grid of
// seven cards inside a 1440 max-width wrapper. The section no longer reflows
// below 1280; matches the rest of this page's fixed-width sections.
const CONTENT_W = 1280;
const CONTENT_H = 1332; // 1284 frame + 48px breathing room below CTA

// Shared card fragments
const TITLE_STYLE = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  fontSize: '20px',
  lineHeight: 1.2,
  letterSpacing: '-0.2px',
  color: '#1f1f1f',
  textAlign: 'center',
  margin: 0,
};
const VALUE_STYLE = {
  fontFamily: "'Instrument Serif', serif",
  fontSize: '88px',
  lineHeight: 1.1,
  letterSpacing: '-0.88px',
  color: '#000',
  textAlign: 'center',
  margin: 0,
  whiteSpace: 'nowrap',
};
const CAPTION_STYLE = {
  fontFamily: "'DM Mono', monospace",
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: 1.25,
  letterSpacing: '-0.14px',
  textTransform: 'uppercase',
  color: '#1f1f1f',
  textAlign: 'center',
  margin: 0,
};

// Pink/purple "minus" indicator next to a percentage value. Reused by both
// Surgical complications (#f2d4f0 / pink) and Readmissions (#be95e5 / purple).
function MinusBadge({ bg }) {
  return (
    <div style={{ paddingTop: '14px', flexShrink: 0 }}>
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%',
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ display: 'block', width: '10px', height: '2px', background: '#1f1f1f', borderRadius: '1px' }} />
      </div>
    </div>
  );
}

function MetricsCards() {
  return (
    // 240px padding-top reproduces the breathing room the previous layout had
    // between the rising title and the first card row — the title still gets
    // pushed when the cards block intrudes, just with the same visual gap.
    <div style={{ position: 'relative', width: '100%', background: 'transparent', paddingTop: '240px' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ position: 'relative', width: `${CONTENT_W}px`, height: `${CONTENT_H}px`, margin: '0 auto' }}>

          {/* ── LEFT column ────────────────────────────────────────────── */}

          {/* Calls answered (0,0 / 413×290) */}
          <ParallaxCard
            speed={120}
            style={{
              position: 'absolute', left: '0px', top: '0px',
              width: '413px', height: '290px',
              borderRadius: '24px', overflow: 'hidden',
              padding: '40px 24px',
              display: 'flex', flexDirection: 'column', gap: '40px',
              alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(180deg, #ecedef 0%, #d8f95d 100%)',
              boxSizing: 'border-box',
            }}
          >
            <p style={TITLE_STYLE}>Calls answered</p>
            <p style={VALUE_STYLE}>100%</p>
            <p style={{ ...CAPTION_STYLE, whiteSpace: 'nowrap' }}>Every call covered. All day, all night.</p>
          </ParallaxCard>

          {/* Surgical complications (108,310 / 305×445) */}
          <ParallaxCard
            speed={-80}
            style={{
              position: 'absolute', left: '108px', top: '310px',
              width: '305px', height: '445px',
              borderRadius: '24px', overflow: 'hidden',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              background: 'radial-gradient(ellipse 120% 100% at 50% 0%, rgba(220,221,228,0.4) 0%, rgba(186,166,232,0.3) 100%)',
              padding: '40px 24px',
              display: 'flex', flexDirection: 'column', gap: '24px',
              alignItems: 'center', justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <p style={{ ...TITLE_STYLE, position: 'relative', zIndex: 1 }}>Surgical complications</p>
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/assets/chart-half-circle.svg" alt="" aria-hidden="true"
                   style={{ width: '260px', height: '260px', display: 'block' }} />
              <div style={{ position: 'absolute', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                <p style={VALUE_STYLE}>72%</p>
                <MinusBadge bg="#f2d4f0" />
              </div>
            </div>
            <p style={{ ...CAPTION_STYLE, position: 'relative', zIndex: 1, width: '210px' }}>
              Reduction through proactive prehabilitation
            </p>
          </ParallaxCard>

          {/* Routing speed — NEW (78,775 / 335×509) */}
          <ParallaxCard
            speed={-100}
            style={{
              position: 'absolute', left: '78px', top: '775px',
              width: '335px', height: '509px',
              borderRadius: '24px', overflow: 'hidden',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              // BG sits at lowered alpha — explicit per-channel rather than via
              // an `opacity` rule so child text/glyphs stay fully opaque.
              background: 'rgba(74,137,232,0.3)',
              padding: '40px 32px',
              display: 'flex', flexDirection: 'column', gap: '24px',
              alignItems: 'center', justifyContent: 'flex-start',
              boxSizing: 'border-box',
            }}
          >
            <p style={TITLE_STYLE}>Routing speed</p>
            <p style={VALUE_STYLE}>4x</p>
            {/* 4 concentric lime circles, descending sizes pinned to lower-center
                so they read as "ripples". Offsets match Figma 7288:2579. */}
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              <img src="/assets/chart-routing-c1.svg" alt="" aria-hidden="true"
                   style={{ position: 'absolute', left: 0, top: 0, width: '200px', height: '200px' }} />
              <img src="/assets/chart-routing-c2.svg" alt="" aria-hidden="true"
                   style={{ position: 'absolute', left: '50%', top: 'calc(50% + 25px)', width: '150px', height: '150px', transform: 'translate(-50%, -50%)' }} />
              <img src="/assets/chart-routing-c3.svg" alt="" aria-hidden="true"
                   style={{ position: 'absolute', left: '50%', top: 'calc(50% + 50px)', width: '100px', height: '100px', transform: 'translate(-50%, -50%)' }} />
              <img src="/assets/chart-routing-c4.svg" alt="" aria-hidden="true"
                   style={{ position: 'absolute', left: '50%', top: 'calc(50% + 75px)', width: '50px', height: '50px', transform: 'translate(-50%, -50%)' }} />
            </div>
            <p style={{ ...CAPTION_STYLE, width: '179px' }}>
              Avg. call length: From 2 min. to 30 sec
            </p>
          </ParallaxCard>

          {/* ── MIDDLE column ──────────────────────────────────────────── */}

          {/* ROI (433,0 / 522×596) — overflow:visible so the lime glow border
              isn't clipped at this larger size. */}
          <ParallaxCard
            speed={50}
            style={{
              position: 'absolute', left: '433px', top: '0px',
              width: '522px', height: '596px',
              borderRadius: '24px',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              background: 'rgba(191,192,204,0.35)',
              padding: '40px 24px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'space-between',
              boxSizing: 'border-box',
              overflow: 'visible',
            }}
          >
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0, borderRadius: '25px',
              border: '24px solid #d8f95d', filter: 'blur(12px)',
              pointerEvents: 'none', zIndex: 0,
            }} />
            <p style={{ ...TITLE_STYLE, position: 'relative', zIndex: 1, minWidth: '100%' }}>ROI</p>
            <p style={{ ...VALUE_STYLE, width: '149px', position: 'relative', zIndex: 1 }}>5.2 x</p>
            <img src="/assets/chart-roi-bars.svg" alt="" aria-hidden="true"
                 style={{ width: '362px', height: '267.557px', display: 'block', position: 'relative', zIndex: 1 }} />
            <p style={{ ...CAPTION_STYLE, position: 'relative', zIndex: 1, minWidth: '100%' }}>
              Decrease costs while driving new revenue
            </p>
          </ParallaxCard>

          {/* Workdays saved — NEW (433,616 / 522×325) */}
          <ParallaxCard
            speed={-100}
            style={{
              position: 'absolute', left: '433px', top: '616px',
              width: '522px', height: '325px',
              borderRadius: '24px', overflow: 'hidden',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              background: 'radial-gradient(ellipse 130% 110% at 50% 0%, rgba(220,221,228,0.4) 0%, rgba(186,166,232,0.3) 100%)',
              padding: '40px 24px',
              display: 'flex', flexDirection: 'column', gap: '24px',
              alignItems: 'center', justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            {/* Lime dot-grid pattern from Figma — exported as a tiled SVG with
                a radial fade mask baked in. Centred behind the value. */}
            <img
              src="/assets/chart-workdays-dots.svg"
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '474px', height: '245px',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
            <p style={{ ...TITLE_STYLE, position: 'relative', zIndex: 1, minWidth: '100%' }}>Workdays saved</p>
            <p style={{ ...VALUE_STYLE, position: 'relative', zIndex: 1 }}>686</p>
            <p style={{ ...CAPTION_STYLE, position: 'relative', zIndex: 1, whiteSpace: 'nowrap' }}>
              Admin workdays saved in one year.
            </p>
          </ParallaxCard>

          {/* ── RIGHT column ───────────────────────────────────────────── */}

          {/* Intake (975,0 / 305×487) */}
          <ParallaxCard
            speed={160}
            style={{
              position: 'absolute', left: '975px', top: '0px',
              width: '305px', height: '487px',
              borderRadius: '24px', overflow: 'hidden',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              background: 'rgba(74,137,232,0.3)',
              padding: '40px 32px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <p style={{ ...TITLE_STYLE, minWidth: '100%' }}>Intake</p>
            <div style={{ position: 'relative', width: '223px', height: '228px' }}>
              <img src="/assets/chart-dots-grid.svg" alt="" aria-hidden="true"
                   style={{ width: '223px', height: '228px', display: 'block' }} />
              <p style={{ ...VALUE_STYLE, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>4x</p>
            </div>
            <p style={{ ...CAPTION_STYLE, width: '222px' }}>
              While staff focuses on higher-value care
            </p>
          </ParallaxCard>

          {/* Readmissions — NEW (975,507 / 305×285) */}
          <ParallaxCard
            speed={-80}
            style={{
              position: 'absolute', left: '975px', top: '507px',
              width: '305px', height: '285px',
              borderRadius: '24px', overflow: 'hidden',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              // Radial gradient anchored top-left so the card has soft depth
              // (Figma's frosted look isn't a clean diagonal sweep).
              background: 'radial-gradient(ellipse 140% 130% at 0% 0%, rgba(220,221,228,0.55) 0%, rgba(186,166,232,0.4) 100%)',
              padding: '40px 24px',
              display: 'flex', flexDirection: 'column', gap: '24px',
              alignItems: 'center', justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <p style={TITLE_STYLE}>Readmissions</p>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
              <p style={VALUE_STYLE}>34%</p>
              <MinusBadge bg="#be95e5" />
            </div>
            <p style={{ ...CAPTION_STYLE, width: '222px' }}>
              Up to 34% reduction in 30-day readmissions.
            </p>
          </ParallaxCard>

          {/* CTA — Book a Meeting */}
          <div className="cta-group" style={{
            position: 'absolute', left: '50%', top: '1244px',
            transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center',
          }}>
            <button style={{
              background: '#7700ee', borderRadius: '50px',
              padding: '12px 24px', display: 'flex', alignItems: 'center',
              marginRight: '-1px', border: 'none', cursor: 'pointer',
            }}>
              <p style={{
                fontFamily: "'DM Mono', monospace", fontWeight: 500,
                fontSize: '14px', textTransform: 'uppercase',
                color: '#fff', whiteSpace: 'nowrap', margin: 0,
              }}>
                Book a Meeting
              </p>
            </button>
            <div className="cta-circle" style={{
              background: '#7700ee', borderRadius: '21px',
              width: '42px', height: '42px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg className="cta-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Minister quote section — Figma 7067:28220. A row of four partner logos
// (Hellenic Republic active, three NHS-style cells dimmed) sits above a
// frosted card that pairs the dithered minister portrait with the quote and
// a 10M+ citizens-served stat / case-study CTA on the right.
const mqImgHellenic     = "/assets/partner-hellenic.png";
const mqImgNhsSouthTees = "/assets/partner-nhs-south-tees.png";
const mqImgNhsBlack     = "/assets/partner-nhs-black-country.png";
const mqImgPortrait     = "/assets/minister-portrait.png";
const mqImgLineActive   = "/assets/minister-line-active.svg";
const mqImgLineMuted    = "/assets/minister-line-muted.svg";
const mqImgEyeOff       = "/assets/icon-eye-off.svg";
const mqImgPlus         = "/assets/icon-plus.svg";

const PARTNER_TIMELINE_MS = 8000;
const PARTNER_TABS = ['hellenic', 'confidential'];

function PartnerCell({ state = 'muted', tick, onClick, children }) {
  const isActive = state === 'active';
  const isDisabled = state === 'disabled';
  return (
    <div
      onClick={isDisabled ? undefined : onClick}
      style={{
        flex: '1 1 0',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        opacity: isActive ? 1 : 0.25,
        cursor: isDisabled || !onClick ? 'default' : 'pointer',
        userSelect: 'none',
        transition: 'opacity 300ms ease',
      }}
    >
      {/* Figma 7067:28224 / 28229: 1.5px hairline above each cell. Active cell
          fills purple over the 8s tab timer; the inactive line stays solid
          black at 25% opacity (carried by the parent's opacity wrapper). */}
      <div style={{ width: '290px', height: '1.5px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: isActive ? '#DDBAFF' : '#000' }} />
        {isActive && (
          <div
            key={tick}
            style={{
              position: 'absolute', left: 0, top: 0, height: '100%', width: '100%',
              background: '#7700EE',
              transformOrigin: 'left',
              animation: `partnerCellFill ${PARTNER_TIMELINE_MS}ms linear forwards`,
            }}
          />
        )}
      </div>
      {children}
    </div>
  );
}

function ReadCaseStudyCTA() {
  return (
    <div className="cta-group" style={{ display: 'flex', alignItems: 'center' }}>
      <button type="button" style={{
        height: '40px',
        padding: '12px 24px',
        borderRadius: '50px',
        border: 'none',
        background: '#7700EE',
        color: '#fff',
        fontFamily: "'DM Mono', monospace",
        fontWeight: 500,
        fontSize: '14px',
        textTransform: 'uppercase',
        cursor: 'pointer',
        marginRight: '-1px',
        whiteSpace: 'nowrap',
      }}>
        read case study
      </button>
      <div className="cta-circle" style={{
        width: '40px',
        height: '40px',
        borderRadius: '21px',
        background: '#7700EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <img
          src="/assets/platform-arrow-right.svg"
          alt=""
          aria-hidden="true"
          style={{ width: '24px', height: '24px' }}
        />
      </div>
    </div>
  );
}

function StatPill({ value, iconBg, iconType, pillBg, captionText, captionWidth }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', position: 'relative' }}>
      {/* Highlighter bar — Figma 7223:814: a 129×24 straight lime/purple band
          passing through the bottom of the value glyphs. Width tracks the value
          text only (the caption sits to the right of the bar). */}
      <div style={{
        position: 'absolute',
        left: '-0.83px',
        top: 'calc(50% + 27px)',
        transform: 'translateY(-50%)',
        width: '129px',
        height: '24px',
        background: pillBg,
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8.167px', position: 'relative' }}>
        <p style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '88px',
          lineHeight: 1.1,
          letterSpacing: '-0.88px',
          color: '#000',
          margin: 0,
          whiteSpace: 'nowrap',
        }}>
          {value}
        </p>
        <div style={{ paddingTop: '14.292px' }}>
          <div style={{
            width: '24.5px',
            height: '24.5px',
            borderRadius: '24.5px',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {iconType === 'plus' ? (
              <img src={mqImgPlus} alt="" aria-hidden="true" style={{ width: '16px', height: '16px' }} />
            ) : (
              <span style={{ display: 'block', width: '10px', height: '2px', background: '#1f1f1f', borderRadius: '1px' }} />
            )}
          </div>
        </div>
      </div>
      <p style={{
        fontFamily: "'DM Mono', monospace",
        fontWeight: 500,
        fontSize: '14px',
        lineHeight: 1.25,
        letterSpacing: '-0.14px',
        textTransform: 'uppercase',
        color: '#000',
        margin: 0,
        width: `${captionWidth}px`,
        paddingBottom: '15px',
      }}>
        {captionText}
      </p>
    </div>
  );
}

function HellenicVariant() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <div style={{
        display: 'flex',
        gap: '60px',
        alignItems: 'center',
        width: '772px',
        height: '220px',
        borderRadius: '24px',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        flexShrink: 0,
      }}>
        <div style={{
          width: '203px',
          height: '220px',
          borderRadius: '24px',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
        }}>
          <img
            src={mqImgPortrait}
            alt=""
            style={{
              position: 'absolute',
              left: 'calc(50% - 8.5px)',
              top: 0,
              transform: 'translateX(-50%)',
              width: '220px',
              height: '220px',
              objectFit: 'cover',
            }}
          />
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          width: '509px',
          flexShrink: 0,
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: '24px',
            lineHeight: 1.2,
            letterSpacing: '-0.48px',
            color: '#1f1f1f',
            margin: 0,
            width: '402px',
          }}>
            “We believe Sword can help us rise to this challenge.”
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#000', lineHeight: 1.3 }}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: '18px',
              margin: 0,
            }}>
              Adonis Georgiadis
            </p>
            <p style={{
              fontFamily: "'DM Mono', monospace",
              fontWeight: 500,
              fontSize: '14px',
              letterSpacing: '-0.14px',
              textTransform: 'uppercase',
              margin: 0,
              whiteSpace: 'nowrap',
            }}>
              Minister of Health (Greece)
            </p>
          </div>
        </div>
      </div>

      <div style={{
        flex: '1 1 0',
        alignSelf: 'stretch',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingLeft: '40px',
        boxSizing: 'border-box',
      }}>
        <StatPill
          value="10M"
          iconBg="#d8f95d"
          iconType="plus"
          pillBg="#d8f95d"
          captionText="citizens served"
          captionWidth={82}
        />
        <ReadCaseStudyCTA />
      </div>
    </div>
  );
}

function ConfidentialVariant() {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', width: '100%', gap: '40px' }}>
      <div style={{
        width: '419px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
      }}>
        <p style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '64px',
          lineHeight: 1.05,
          letterSpacing: '-1.28px',
          color: '#1f1f1f',
          margin: 0,
        }}>
          AI Reveals the Revenue Impact of Eligibility Accuracy
        </p>
      </div>

      <div style={{
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '60px',
      }}>
        <div style={{ display: 'flex', gap: '80px', alignItems: 'flex-start' }}>
          <StatPill
            value="$0.5M"
            iconBg="#ddbaff"
            iconType="minus"
            pillBg="#d8f95d"
            captionText="recovered in 3 months"
            captionWidth={93}
          />
          <StatPill
            value="50K"
            iconBg="#d8f95d"
            iconType="plus"
            pillBg="#d8f95d"
            captionText="eligibility checks automated"
            captionWidth={96}
          />
        </div>
        <ReadCaseStudyCTA />
      </div>
    </div>
  );
}

export function SectionMinisterQuote() {
  const [activeTab, setActiveTab] = useState('hellenic');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      const idx = PARTNER_TABS.indexOf(activeTab);
      const next = PARTNER_TABS[(idx + 1) % PARTNER_TABS.length];
      setActiveTab(next);
      setTick(n => n + 1);
    }, PARTNER_TIMELINE_MS);
    return () => clearTimeout(t);
  }, [activeTab, tick]);

  const selectTab = (t) => () => {
    setActiveTab(t);
    setTick(n => n + 1);
  };

  return (
    <section style={{
      background: '#f9f9f9',
      padding: '240px 80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
    }}>
      <style>{`@keyframes partnerCellFill { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
      <div style={{
        width: '100%',
        maxWidth: '1280px',
        display: 'flex',
        flexDirection: 'column',
        gap: '120px',
      }}>

        {/* Partner-logo row */}
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
          <PartnerCell
            state={activeTab === 'hellenic' ? 'active' : 'muted'}
            tick={tick}
            onClick={selectTab('hellenic')}
          >
            <img
              src={mqImgHellenic}
              alt="Hellenic Republic Ministry of Health"
              style={{ height: '54px', width: '185.056px', objectFit: 'contain', display: 'block' }}
            />
          </PartnerCell>

          <PartnerCell
            state={activeTab === 'confidential' ? 'active' : 'muted'}
            tick={tick}
            onClick={selectTab('confidential')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <DashedCircle>
                <img src={mqImgEyeOff} alt="" aria-hidden="true" style={{ width: '24px', height: '24px' }} />
              </DashedCircle>
              <p style={{
                fontFamily: "'DM Mono', monospace",
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: 1.3,
                letterSpacing: '-0.14px',
                textTransform: 'uppercase',
                color: '#000',
                margin: 0,
                whiteSpace: 'nowrap',
              }}>
                confidential
              </p>
            </div>
          </PartnerCell>

          <PartnerCell state="disabled">
            <img
              src={mqImgNhsSouthTees}
              alt="NHS South Tees Hospitals"
              style={{ height: '54px', width: '135px', objectFit: 'cover', display: 'block' }}
            />
          </PartnerCell>

          <PartnerCell state="disabled">
            <img
              src={mqImgNhsBlack}
              alt="NHS Black Country"
              style={{ height: '54px', width: '104px', objectFit: 'contain', objectPosition: 'bottom', display: 'block' }}
            />
          </PartnerCell>
        </div>

        {/* Body — variant swaps with active tab */}
        {activeTab === 'hellenic' ? <HellenicVariant /> : <ConfidentialVariant />}
      </div>
    </section>
  );
}
