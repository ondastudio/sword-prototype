// "Platform" overview — sticky scroll-driven two-card section.
//
// Scroll progress (0..1) drives a state machine:
//   A: both collapsed                (entry / dwell)
//   B: card 1 expands wide           (Figma 7182:232)
//   C: card 2 expands wide           (Figma 7163:1892)
//   D: card 2's USE CASES carousel advances slide 01→04
//      (Figma 7261:1481, 7320:577/598/619)
// then the section unsticks.
//
// Clicking the *non*-expanded card scroll-snaps to that card's expanded
// dwell, so users can flip between B and C without scrubbing manually.
// Reverse scroll re-expands the previous card naturally because progress
// is derived from scroll position.

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import DashedCircle from '../DashedCircle';

const oBgLines       = "/assets/platform-bg-lines.svg";
const oIconTriage    = "/assets/platform-icon-triage.svg";
const oIconOrchestr  = "/assets/platform-icon-orchestration.svg";

// Card 1 expanded — benefit pill icons (Figma 7261:1711)
const oPillLoading     = "/assets/platform-pill-loading.svg";
const oPillHome        = "/assets/platform-pill-home.svg";
const oPillCodesandbox = "/assets/platform-pill-codesandbox.svg";
const oPillAmbulance   = "/assets/platform-pill-ambulance.svg";
const oArrowRight02    = "/assets/platform-arrow-right-02.svg";

// Card 1 expanded — MDR seal (Figma 7261:1758)
const oMdrStampCircle  = "/assets/platform-mdr-stamp-circle.svg";
const oMdrStampText    = "/assets/platform-mdr-stamp-text.svg";

// Card 2 expanded — Phase D slide-carousel icons (one per slide)
const oUseTimeHalf  = "/assets/platform-usecase-time-half-pass.svg";
const oUseClock     = "/assets/platform-usecase-clock.svg";
const oUseTradeUp   = "/assets/platform-usecase-trade-up.svg";
const oUseShrink    = "/assets/platform-usecase-arrow-shrink.svg";

// ── Phase boundaries (progress 0..1) ─────────────────────────────────
// 0.00 - 0.05 entry / dwell (both collapsed)
// 0.05 - 0.30 card 1 expands
// 0.30 - 0.45 card 1 dwell
// 0.45 - 0.70 swap: card 2 expands, card 1 collapses
// 0.70 - 1.00 use-cases slide carousel (4 slides, snap per sub-range)
const P_B_START   = 0.05;
const P_B_FULL    = 0.30;
const P_SWAP_S    = 0.45;
const P_SWAP_E    = 0.70;
const P_INNER_END = 1.00;

// Click-snap targets — middle of each card's dwell
const SNAP_CARD1 = (P_B_FULL + P_SWAP_S) / 2;        // 0.375
const SNAP_CARD2 = (P_SWAP_E + P_INNER_END) / 2 - 0.1; // ~0.75 (mid of inner-scroll dwell start)

// Total scroll height of the pinned region
const TOTAL_VH = 400;

// Card layout sizes (px).
//   HUG_W   = minimal card width when the other card is expanded — sized to
//             "hug" the number badge with 24px padding on each side
//             (40 + 24*2 = 88).
//   GAP     = gap between cards.
// Expanded width fills whatever is left in the row.
const HUG_W = 88;
const GAP_W = 20;

// Card 1 expanded — benefit pills (Figma 7261:1711)
const BENEFITS = [
  [oPillLoading,     'No waiting lines for patients',                150],
  [oPillHome,        'Reduced unnecessary hospital visits',          210],
  [oPillCodesandbox, 'Handles peak demand without increasing staff', 225],
  [oPillAmbulance,   'Hospitals focused on real emergencies',        198],
];

// Phase D — use-case slides (Figma 7261:1481, 7320:577/598/619).
// Card 02's right column is a 4-slide carousel; scroll progress 0.70..1.00
// drives slide index 0..3. Each entry: [icon, title, subtitle].
// Titles include an explicit `\n` so every slide renders on exactly two lines
// (rendered via `whiteSpace: pre-line`).
const SLIDES = [
  [oUseTimeHalf, 'Waiting & No-shows\nprediction',  'Reduce no-shows and waiting times while increasing capacity and utilization'],
  [oUseClock,    'Surgical\nReadiness',             'Shorten RTT timelines & reduce surgical complications'],
  [oUseTradeUp,  'Proactive Health\nCampaigns',     'Increase patient engagement and close care gaps'],
  [oUseShrink,   'Readmission\nPrevention',         'Reduce 30-day readmissions and post-discharge complications'],
];
const SLIDE_COUNT = SLIDES.length;

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const lerp  = (a, b, t) => a + (b - a) * t;
// Map x∈[a,b] to [0,1] with clamp; smoothstep softens the in/out
const range = (x, a, b) => clamp((x - a) / (b - a), 0, 1);
const smooth = (t) => t * t * (3 - 2 * t);

// ── Card 1 expanded layout (Figma 7261:1711) ─────────────────────────
// Top row: small triage icon (left) + dashed circular arrow button (right).
// Bottom row: title + body on the left, 4 benefit pills stacked on the right.
function ExpandedCard1() {
  // Cursor-following "MEDICAL DEVICE" tooltip on the MDR seal (Figma 7261:1835).
  // Portaled to document.body so viewport-space clientX/Y aren't broken by any
  // transformed ancestor — same pattern as CareOpsPanel.jsx.
  const [tip, setTip] = useState(null);
  const trackTip = (e) => setTip({ x: e.clientX, y: e.clientY });
  const clearTip = () => setTip(null);

  return (
    <>
    <div style={{
      position: 'absolute', inset: 0, padding: '64px',
      display: 'flex', flexDirection: 'column', gap: '40px',
      alignItems: 'flex-start', boxSizing: 'border-box',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        flex: '1 0 0', minHeight: 0, width: '100%',
      }}>
        {/* Top row */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          width: '100%', flexShrink: 0,
        }}>
          <img src={oIconTriage} alt="" aria-hidden="true"
               style={{ width: '97.894px', height: '96px', flexShrink: 0, filter: 'brightness(0)' }} />
          {/* Dashed circle arrow button — visual only, real interaction
              lives on the parent PlatformCard click handler. */}
          <DashedCircle>
            <img src={oArrowRight02} alt="" aria-hidden="true"
                 style={{ width: '24px', height: '24px' }} />
          </DashedCircle>
        </div>

        {/* Bottom row */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: '80px', width: '100%', flexShrink: 0,
        }}>
          {/* Left column: title + body */}
          <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            width: '458px', height: '364px', flexShrink: 0, alignItems: 'flex-start',
          }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <p style={{
                fontFamily: "'Instrument Serif', serif", fontSize: '56px', lineHeight: 1.05,
                letterSpacing: '-0.28px', color: '#000', margin: 0, width: '367px',
              }}>
                Personalized{' '}
                <span style={{
                  // Lime band aligned to the baseline of "Triage" — span 42→83% of
                  // the inline box (24px-tall band sitting on the baseline of a
                  // 58.8px line-box, matching Figma 7261:1756).
                  background: 'linear-gradient(transparent 42%, #d8f95d 42%, #d8f95d 83%, transparent 83%)',
                }}>Triage</span>
                {' '}at Scale
              </p>
              {/* MDR Class IIa Compliant seal — Figma 7261:1758. Hover reveals
                  the cursor-following "MEDICAL DEVICE" tooltip below. */}
              <div
                onMouseEnter={trackTip}
                onMouseMove={trackTip}
                onMouseLeave={clearTip}
                style={{
                  position: 'absolute', left: '156px', bottom: 0,
                  paddingBottom: '10px',
                  cursor: 'help', pointerEvents: 'auto',
                }}
              >
                <div style={{ position: 'relative', width: '113.84px', height: '40px' }}>
                  <img src={oMdrStampCircle} alt="" aria-hidden="true"
                       style={{ position: 'absolute', left: 0, top: 0,
                                width: '39.178px', height: '40px' }} />
                  <img src={oMdrStampText} alt="MDR Class IIa Compliant"
                       style={{ position: 'absolute', left: '49.38px', top: '14.63px',
                                width: '64.465px', height: '20.899px' }} />
                </div>
              </div>
            </div>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '18px',
              lineHeight: 1.2, letterSpacing: '-0.18px', color: '#000', margin: 0, width: '100%',
            }}>
              When patients reach out—by voice, text, or app—they get instantly picked up by
              conversational agents trained to solve admin tasks, evaluate and escalate urgencies,
              and route them to the right care.
            </p>
          </div>

          {/* Right column: 4 benefit pills, right-aligned */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
            justifyContent: 'flex-end', gap: '8px', flex: '1 0 0', minWidth: 0,
          }}>
            {BENEFITS.map(([icon, label, textWidth], i) => (
              <div key={i} style={{
                width: '369px', boxSizing: 'border-box',
                border: '1.5px solid #000', borderRadius: '48px',
                padding: '24px 24px 24px 40px',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '24px',
                overflow: 'hidden', flexShrink: 0,
              }}>
                <p style={{
                  fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '20px',
                  lineHeight: 1.2, letterSpacing: '-0.2px', color: '#000', margin: 0,
                  width: `${textWidth}px`, textAlign: 'right',
                }}>
                  {label}
                </p>
                <div style={{
                  background: '#d8f95d', borderRadius: '60px',
                  padding: '8px', display: 'flex', alignItems: 'center', flexShrink: 0,
                }}>
                  <img src={icon} alt="" aria-hidden="true"
                       style={{ width: '40px', height: '40px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    {tip && typeof document !== 'undefined' && createPortal(
      <div style={{
        position: 'fixed', left: `${tip.x}px`, top: `${tip.y}px`,
        transform: 'translate(16px, 16px)',
        padding: '16px 24px', borderRadius: '24px',
        background: '#d8f95d',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: '14px',
        letterSpacing: '-0.14px', textTransform: 'uppercase',
        color: '#000', whiteSpace: 'nowrap',
        pointerEvents: 'none', zIndex: 100,
      }}>
        medical DEVICE
      </div>,
      document.body,
    )}
    </>
  );
}

// ── Card 2 expanded layout (with inner-scrolling USE CASES) ──────────
// One slide of the carousel (Figma 7261:1481, 7320:577/598/619). Title up
// top, big purple circular icon, "XX/04" indicator, subtitle at bottom.
function Slide({ icon, title, subtitle, index }) {
  const indexLabel = `${String(index + 1).padStart(2, '0')}/${String(SLIDE_COUNT).padStart(2, '0')}`;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#fff', borderRadius: '48px', padding: '32px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      boxSizing: 'border-box', overflow: 'hidden',
    }}>
      <div style={{
        flex: '1 0 0', minHeight: 0, width: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '28px',
          lineHeight: 1.2, letterSpacing: '-0.28px', color: '#000',
          textAlign: 'center', margin: 0, maxWidth: '320px',
          whiteSpace: 'pre-line',
        }}>
          {title}
        </p>
        <div style={{
          background: '#7700EE', borderRadius: '50%',
          width: '168px', height: '168px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {/* Existing platform-usecase-* SVGs ship with a purple fill — flip
              to white via filter so they show as white on the purple disc. */}
          <img src={icon} alt="" aria-hidden="true" style={{
            width: '125px', height: '125px',
            filter: 'brightness(0) invert(1)',
          }} />
        </div>
        <p style={{
          fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: '14px',
          lineHeight: 1.2, letterSpacing: '-0.14px', textTransform: 'uppercase',
          color: '#000', margin: 0, whiteSpace: 'nowrap',
        }}>
          {indexLabel}
        </p>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '20px',
          lineHeight: 1.2, letterSpacing: '-0.2px', color: '#000',
          textAlign: 'center', margin: 0, maxWidth: '380px',
        }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// Carousel: the white card frame stays fixed; only the inner content
// (title, icon, indicator, subtitle) swaps when `activeSlide` changes.
// The swap is instantaneous — no cross-fade, no horizontal slide.
function SlideCarousel({ activeSlide, onPrev, onNext }) {
  const isFirst = activeSlide === 0;
  const isLast  = activeSlide === SLIDE_COUNT - 1;

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
    }}>
      <Slide
        icon={SLIDES[activeSlide][0]}
        title={SLIDES[activeSlide][1]}
        subtitle={SLIDES[activeSlide][2]}
        index={activeSlide}
      />

      {/* Arrow nav (hit-targets sit above the slide content) */}
      <ArrowButton dir="left"  disabled={isFirst} onClick={onPrev} />
      <ArrowButton dir="right" disabled={isLast}  onClick={onNext} />
    </div>
  );
}

function ArrowButton({ dir, disabled, onClick }) {
  const isLeft = dir === 'left';
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); if (!disabled) onClick?.(); }}
      aria-label={isLeft ? 'Previous use case' : 'Next use case'}
      aria-disabled={disabled || undefined}
      style={{
        position: 'absolute', top: 'calc(50% - 20px)',
        ...(isLeft ? { left: '6px' } : { right: '6px' }),
        width: '40px', height: '40px',
        background: 'transparent', border: 'none', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.25 : 1,
        zIndex: 2,
      }}
    >
      <img src={oArrowRight02} alt="" aria-hidden="true" style={{
        width: '24px', height: '24px',
        transform: isLeft ? 'rotate(180deg)' : 'none',
      }} />
    </button>
  );
}

function ExpandedCard2({ activeSlide, onPrev, onNext }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, padding: '64px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      alignItems: 'stretch', boxSizing: 'border-box',
    }}>
      {/* Top row: small orchestration icon (left) + dashed-circle arrow
          affordance (right). Mirrors ExpandedCard1's top row. */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: '-4px', flexShrink: 0, width: '100%',
      }}>
        <img src={oIconOrchestr} alt="" aria-hidden="true"
             style={{ width: '96.437px', height: '96px', flexShrink: 0 }} />
        <DashedCircle>
          <img src={oArrowRight02} alt="" aria-hidden="true"
               style={{ width: '24px', height: '24px' }} />
        </DashedCircle>
      </div>

      {/* Bottom row: text column (left, 458×348) + slide carousel (right, 506×480).
          Items align to the bottom of the 480-tall row, so the carousel fills the
          full height while the text column sits below it visually. */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: '80px',
        height: '480px', flexShrink: 0, width: '100%',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          width: '458px', height: '348px', flexShrink: 0, alignItems: 'flex-start',
        }}>
          {/* Title with a 220×24 white highlight bar tucked behind the second line. */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
            <div aria-hidden="true" style={{
              position: 'absolute', left: 0, top: 'calc(50% + 29px)',
              transform: 'translateY(-50%)',
              width: '220px', height: '24px', background: '#fff',
              pointerEvents: 'none',
            }} />
            <p style={{
              position: 'relative',
              fontFamily: "'Instrument Serif', serif", fontSize: '48px', lineHeight: 1.05,
              letterSpacing: '-0.24px', color: '#000', margin: 0, width: '238px',
            }}>
              Proactive Care Orchestration
            </p>
          </div>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '18px',
            lineHeight: 1.2, letterSpacing: '-0.18px', color: '#000', margin: 0, width: '100%',
          }}>
            Your population is continuously monitored using data you already
            hold—claims, discharge records, referrals— and while your team handles
            what's urgent, our agents manage everything that was about to be.
          </p>
        </div>

        {/* Slide carousel — fixed white frame, content swaps instantly per scroll. */}
        <div style={{ width: '506px', height: '480px', flexShrink: 0, position: 'relative' }}>
          <SlideCarousel
            activeSlide={activeSlide}
            onPrev={onPrev}
            onNext={onNext}
          />
        </div>
      </div>
    </div>
  );
}

// ── Minimal layout shown when this card is the off-state during another's
// expansion. The card is too narrow to fit the full collapsed content, so we
// just surface the number badge at top-center.
function MinimalLayout({ number }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, padding: '64px 0',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between', boxSizing: 'border-box',
    }}>
      <NumberBadge n={number} />
      {/* Dashed "+" affordance — Figma 7261:1848. Visual cue that the card
          can be expanded; actual click handling lives on the parent
          PlatformCard. */}
      <DashedCircle>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 4V20M20 12H4" stroke="#000" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </DashedCircle>
    </div>
  );
}

// ── Collapsed layout (Figma 7067:26440) ──────────────────────────────
// Top: badge + title + subtitle. Middle: icon. Bottom: CTA.
function CollapsedLayout({ number, icon, iconWidth, iconHeight, title, subtitle }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, padding: '64px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between', boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', flexShrink: 0, width: '386px' }}>
        <NumberBadge n={number} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
          <p style={{
            fontFamily: "'Instrument Serif', serif", fontSize: '48px', lineHeight: 1.05,
            letterSpacing: '-0.24px', color: '#000', margin: 0, whiteSpace: 'nowrap',
          }}>
            {title}
          </p>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '20px', lineHeight: 1.05,
            letterSpacing: '-0.1px', color: '#000', margin: 0, maxWidth: '460px',
          }}>
            {subtitle}
          </p>
        </div>
      </div>
      <img src={icon} alt="" aria-hidden="true"
           style={{
             width: `${iconWidth}px`, height: `${iconHeight}px`, flexShrink: 0,
             // Icon SVG ships with a purple (#7700EE) fill; the Figma collapsed
             // card renders the dots in black. brightness(0) converts the purple
             // through to a flat black without touching the asset.
             filter: 'brightness(0)',
           }} />
      <MoreDetailsCta />
    </div>
  );
}

function NumberBadge({ n }) {
  return (
    <div style={{
      width: '40px', height: '40px', borderRadius: '50px', border: '1.5px solid #000',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <p style={{
        fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: '14px',
        textTransform: 'uppercase', color: '#000', margin: 0,
      }}>
        {n}
      </p>
    </div>
  );
}

// Collapsed-card CTA per Figma 7067:26440 — "more details" + plus glyph.
function MoreDetailsCta() {
  return (
    // pointerEvents: 'auto' overrides the parent collapsed-layer wrapper's
    // 'none' so :hover fires and the cta-circle slides. The CTA itself has
    // no click handler — it's just a visual affordance.
    <div className="cta-group" style={{ display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}>
      <button type="button" tabIndex={-1} style={{
        height: '40px', padding: '12px 24px', borderRadius: '50px', border: 'none',
        background: '#7700EE', color: '#fff',
        fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: '14px',
        textTransform: 'uppercase', cursor: 'pointer', marginRight: '-1px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        more details
      </button>
      <div className="cta-circle" style={{
        width: '40px', height: '40px', borderRadius: '21px', background: '#7700EE',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 4V20M20 12H4" stroke="#fff" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

// ── Card wrapper that crossfades expanded/collapsed/minimal layouts ──
// `expandedT` = this card's expansion (0..1)
// `othersT`   = the OTHER card's expansion (drives minimal vs full collapsed)
function PlatformCard({
  width, expandedT, othersT, kind, onClick, clickable,
  activeSlide, onPrevSlide, onNextSlide,
}) {
  // Figma 7067:26440 — Triage card is lime; Orchestration takes the
  // lavender that previously framed Triage, keeping the two cards visually
  // distinct.
  const background = kind === 1
    ? 'linear-gradient(135deg, rgba(226,239,167,0.4) 0%, rgba(200,214,141,0.4) 50%, rgba(226,239,167,0.4) 100%)'
    : 'linear-gradient(135deg, rgba(216,202,255,0.4) 0%, rgba(185,168,238,0.4) 50%, rgba(216,202,255,0.4) 100%)';

  const collapsedProps = kind === 1
    ? { number: '01', icon: oIconTriage,    iconWidth: 191.332, iconHeight: 187.631,
        title: 'AI Triage',           subtitle: 'Scaling access to care' }
    : { number: '02', icon: oIconOrchestr,  iconWidth: 191.008, iconHeight: 190.149,
        title: 'AI Care Orchestration', subtitle: 'Making care proactive at scale' };

  // Off-state opacity = 1 - self's expansion. Within that, split between full
  // collapsed (when other is also collapsed) and minimal (when other expanded).
  const offT       = 1 - expandedT;
  const collapsedO = offT * (1 - othersT);
  const minimalO   = offT * othersT;

  return (
    <div
      onClick={clickable ? onClick : undefined}
      style={{
        width: `${width}px`,
        flex: '0 0 auto',
        minWidth: 0,
        height: '700px',
        borderRadius: '24.5px',
        overflow: 'hidden',
        background,
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        position: 'relative',
        boxSizing: 'border-box',
        cursor: clickable ? 'pointer' : 'default',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, opacity: collapsedO, willChange: 'opacity', pointerEvents: 'none' }}>
        <CollapsedLayout {...collapsedProps} />
      </div>
      <div style={{ position: 'absolute', inset: 0, opacity: minimalO, willChange: 'opacity', pointerEvents: 'none' }}>
        <MinimalLayout number={collapsedProps.number} />
      </div>
      <div style={{ position: 'absolute', inset: 0, opacity: expandedT, willChange: 'opacity', pointerEvents: expandedT > 0.5 ? 'auto' : 'none' }}>
        {kind === 1
          ? <ExpandedCard1 />
          : <ExpandedCard2
              activeSlide={activeSlide}
              onPrev={onPrevSlide}
              onNext={onNextSlide}
            />}
      </div>
    </div>
  );
}

export default function SectionOrchestration() {
  const outerRef     = useRef(null);
  const stickyRef    = useRef(null);
  const sectionRef   = useRef(null);
  const cardsRowRef  = useRef(null);
  const [progress, setProgress] = useState(0);
  const [containerW, setContainerW] = useState(0);
  // Sticky top offset (negative). Calibrated so the cards row sits at the
  // viewport's vertical center the moment the sticky pins. Derived from
  // section/cards layout — see effect below.
  const [stickyTop, setStickyTop] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const outer = outerRef.current;
      if (!outer) return;
      const r = outer.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      // Animation progress is measured over the *pinned* range. The pin
      // starts when outer.top reaches `stickyTop` (a small negative offset)
      // and continues for `total` more pixels, so we shift the numerator
      // by `-stickyTop` to align progress 0 with the engagement moment.
      setProgress(clamp((-r.top + stickyTop) / total, 0, 1));
    };

    const onScroll = () => {
      if (!ticking) { rafId = requestAnimationFrame(update); ticking = true; }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      cancelAnimationFrame(rafId);
    };
  }, [stickyTop]);

  // Compute the sticky `top` so that, when the sticky pins, the cards row
  // is centered vertically in the viewport. Result: section sticks only
  // once the cards reach screen-center during the user's scroll.
  useEffect(() => {
    if (!sectionRef.current || !cardsRowRef.current) return;
    const compute = () => {
      const section = sectionRef.current;
      const cards   = cardsRowRef.current;
      if (!section || !cards) return;
      const sectionRect = section.getBoundingClientRect();
      const cardsRect   = cards.getBoundingClientRect();
      const cardsCenterInSection = (cardsRect.top - sectionRect.top) + cardsRect.height / 2;
      // sticky.top + cardsCenterInSticky = viewport.h / 2, where the section
      // is flex-centered in the sticky window so cardsCenterInSticky
      // simplifies to (sticky.h - section.h) / 2 + cardsCenterInSection.
      // Net (with sticky.h = window.innerHeight):
      //   stickyTop = section.h / 2 - cardsCenterInSection
      setStickyTop(sectionRect.height / 2 - cardsCenterInSection);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(sectionRef.current);
    ro.observe(cardsRowRef.current);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, []);

  // Track cards row width so we can compute exact pixel widths for each card
  // (minimal hugs the badge; expanded fills the rest).
  useEffect(() => {
    if (!cardsRowRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setContainerW(e.contentRect.width);
    });
    ro.observe(cardsRowRef.current);
    return () => ro.disconnect();
  }, []);

  // Derive per-card state from progress
  const { card1W, card2W, card1Exp, card2Exp, activeSlide, card1Click, card2Click } = useMemo(() => {
    // Card 1 expansion factor: 0 before B_START, 1 between B_FULL..SWAP_S, then back to 0 by SWAP_E
    const tCard1 = (() => {
      if (progress < P_B_START) return 0;
      if (progress < P_B_FULL)  return smooth(range(progress, P_B_START, P_B_FULL));
      if (progress < P_SWAP_S)  return 1;
      if (progress < P_SWAP_E)  return 1 - smooth(range(progress, P_SWAP_S, P_SWAP_E));
      return 0;
    })();
    // Card 2 expansion factor: 0 until SWAP_S, ramps to 1 by SWAP_E, then stays at 1
    const tCard2 = (() => {
      if (progress < P_SWAP_S)  return 0;
      if (progress < P_SWAP_E)  return smooth(range(progress, P_SWAP_S, P_SWAP_E));
      return 1;
    })();

    // Pixel widths.
    //   equalW    — both cards split the row evenly (Phase A).
    //   expandedW — active card fills whatever's left after the hugged peer.
    //   minimalW  — peer card hugged to the badge.
    // Each card lerps from `equalW → minimalW` as the OTHER expands, then
    // from that base → `expandedW` as it itself expands. Result: at any t,
    // `card1W + GAP_W + card2W ≈ containerW`.
    const equalW    = Math.max(0, (containerW - GAP_W) / 2);
    const expandedW = Math.max(0, containerW - GAP_W - HUG_W);
    const card1Base = lerp(equalW, HUG_W, tCard2);
    const card2Base = lerp(equalW, HUG_W, tCard1);
    const w1 = lerp(card1Base, expandedW, tCard1);
    const w2 = lerp(card2Base, expandedW, tCard2);

    // Slide carousel: split the [P_SWAP_E .. P_INNER_END] budget into
    // SLIDE_COUNT equal sub-ranges. The integer index (0..SLIDE_COUNT-1)
    // updates instantly when scroll crosses a sub-range boundary — no
    // intra-slide interpolation, the swap is instantaneous.
    const slideT = range(progress, P_SWAP_E, P_INNER_END);
    const rawIdx = slideT * SLIDE_COUNT;
    const idx    = clamp(Math.floor(rawIdx), 0, SLIDE_COUNT - 1);

    // A card is clickable to *switch to it* only when the other is expanded
    return {
      card1W: w1, card2W: w2,
      card1Exp: tCard1, card2Exp: tCard2,
      activeSlide: idx,
      card1Click: tCard2 > 0.5 && tCard1 < 0.5,
      card2Click: tCard1 > 0.5 && tCard2 < 0.5,
    };
  }, [progress, containerW]);

  const scrollTo = (snapProgress) => {
    const outer = outerRef.current;
    if (!outer) return;
    const r = outer.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const targetY = window.scrollY + r.top + snapProgress * total;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  // Snap to the midpoint of slide *i*'s sub-range so the slide is fully
  // visible (localT≈0 from the next slide's perspective).
  const slideSnapProgress = (i) =>
    P_SWAP_E + ((i + 0.5) / SLIDE_COUNT) * (P_INNER_END - P_SWAP_E);
  const goPrevSlide = () => activeSlide > 0 && scrollTo(slideSnapProgress(activeSlide - 1));
  const goNextSlide = () => activeSlide < SLIDE_COUNT - 1 && scrollTo(slideSnapProgress(activeSlide + 1));

  return (
    <div ref={outerRef} style={{ position: 'relative', width: '100%', height: `${TOTAL_VH}vh` }}>
      <div ref={stickyRef} style={{
        position: 'sticky',
        top: `${stickyTop}px`,
        height: '100vh',
        overflowX: 'clip',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <section ref={sectionRef} style={{
          position: 'relative',
          background: '#f9f9f9',
          width: '100%',
          padding: '120px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '64px',
          overflowX: 'clip',
          boxSizing: 'border-box',
        }}>
          {/* Lavender blurred blob — bleeds full width, centered */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '50%',
              top: 'calc(50% - 173px)',
              transform: 'translate(-50%, -50%)',
              width: '1376px',
              height: '1374px',
              background: '#e4dcff',
              filter: 'blur(50px)',
              borderRadius: '100px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Decorative line pattern that drifts behind the cards — centered */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '50%',
              top: '213px',
              transform: 'translateX(-50%)',
              marginLeft: '-551px',
              width: '1101.341px',
              height: '840px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <div style={{ position: 'absolute', inset: '-14.95% -11.4%' }}>
              <img src={oBgLines} alt="" style={{ width: '100%', height: '100%' }} />
            </div>
          </div>

          {/* Inner wrapper — constrains content to 1440 max with 80px side padding */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 80px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '64px',
          }}>
            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '56px',
                lineHeight: 1.05,
                letterSpacing: '-0.28px',
                color: '#000',
                textAlign: 'center',
                width: '774px',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}>
                {`Two solutions.\nOne continuous patient journey.`}
              </p>
            </div>

            {/* Curly fork arrow — both arms full-opacity when both cards are
                collapsed (Figma 7084:29883, State A). Right arm fades to 0.25
                when card 1 expands (State B, Figma 7261:1704); left arm fades
                to 0.25 when card 2 expands (State C, Figma 7186:2252). The
                crossfade tracks scroll because card1Exp/card2Exp are already
                smoothstepped from progress. */}
            <div style={{ width: '65px', height: '40px', flexShrink: 0 }}>
              <svg
                viewBox="0 0 65 40"
                fill="none"
                aria-hidden="true"
                style={{ width: '100%', height: '100%', display: 'block' }}
              >
                <g style={{ opacity: 1 - 0.75 * card1Exp }}>
                  <path
                    d="M56.6667 30C53.0113 30 49.7915 30 48.2623 29.779C43.6697 29.1154 39.6176 27.021 36.6667 24.0073"
                    stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <path
                    d="M53.3333 35C54.3447 34.017 58.3333 31.4005 58.3333 30C58.3333 28.5995 54.3447 25.983 53.3333 25"
                    stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </g>
                <g style={{ opacity: 1 - 0.75 * card2Exp }}>
                  <path
                    d="M33.3333 5V8.46153C33.3333 11.7964 33.3333 13.4639 33.0912 14.8591C31.7578 22.5392 25.1557 28.5627 16.7377 29.779C15.2085 30 11.9886 30 8.33333 30"
                    stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <path
                    d="M11.6667 35C10.6553 34.017 6.66667 31.4005 6.66667 30C6.66667 28.5995 10.6553 25.983 11.6667 25"
                    stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </g>
              </svg>
            </div>

            {/* Two cards */}
            <div ref={cardsRowRef} style={{
              display: 'flex',
              gap: `${GAP_W}px`,
              alignItems: 'stretch',
              width: '100%',
              flex: '0 0 auto',
            }}>
              <PlatformCard
                kind={1}
                width={card1W}
                expandedT={card1Exp}
                othersT={card2Exp}
                clickable={card1Click}
                onClick={() => scrollTo(SNAP_CARD1)}
              />
              <PlatformCard
                kind={2}
                width={card2W}
                expandedT={card2Exp}
                othersT={card1Exp}
                clickable={card2Click}
                activeSlide={activeSlide}
                onPrevSlide={goPrevSlide}
                onNextSlide={goNextSlide}
                onClick={() => scrollTo(SNAP_CARD2)}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
