// Footer — Figma 7067:30775. The "sword Intelligence" logotype is composed
// from the existing per-letter SVGs (kept from the previous footer build,
// since the wordmark is identical across both designs); only the chrome
// above it changed.

const fImgSword    = "/assets/31f72903-7f68-4e31-96cb-e38cd6996181.svg";
const fImgLtrI     = "/assets/fa08636e-bf1f-421c-9be5-6576daff0e67.svg";
const fImgLtrN     = "/assets/7d697561-4578-4ddd-b68d-3edf0a9925ef.svg";
const fImgLtrT     = "/assets/1821cfa7-0466-4ff1-b528-11c02f14a437.svg";
const fImgLtrE     = "/assets/0d2926d6-edc8-43af-9972-4edb4ca77aaf.svg";
const fImgLtrL1    = "/assets/200c457f-4e9b-4688-893b-9d0fab9a7277.svg";
const fImgLtrL2    = "/assets/b4636bd2-0a56-4f99-b8e7-5732ce53647d.svg";
const fImgLtrI2    = "/assets/646f3977-7c81-4f54-9b51-a7eb3e584d3a.svg";
const fImgLtrG     = "/assets/e6e5724b-cfcd-4b38-9d0a-33e148132c2e.svg";
const fImgLtrE2    = "/assets/ba10702e-9010-4da6-a089-422e0aea263f.svg";
const fImgLtrN2    = "/assets/eae1b59b-b641-4dbb-810c-d6086feca087.svg";
const fImgLtrC     = "/assets/483470af-90d7-4c6a-b540-f90733d2478d.svg";
const fImgLtrE3    = "/assets/9416785e-73b5-467d-9ba3-76e7f2b04881.svg";

const fImgArrowUpRt  = "/assets/footer-arrow-up-right.svg";

const F_INTEL_X = 499.02;

const F_LETTERS = [
  [fImgLtrI,  0,       3.27,  48.122,  121.36 ],
  [fImgLtrN,  51.98,  36.72,  97.63,   87.912 ],
  [fImgLtrT,  142.72, 14.56,  53.233,  111.522],
  [fImgLtrE,  197.57, 36.72,  68.512,  89.374 ],
  [fImgLtrL1, 264.28,  0,     46.221,  124.624],
  [fImgLtrL2, 312.48,  0,     46.232,  124.624],
  [fImgLtrI2, 360.22,  4.91,  45.144,  119.7  ],
  [fImgLtrG,  398.56, 23.27,  84.033,  136.605],
  [fImgLtrE2, 478.52, 36.72,  68.501,  89.374 ],
  [fImgLtrN2, 548.03, 36.72,  97.63,   87.912 ],
  [fImgLtrC,  642.71, 36.72,  65.68,   89.385 ],
  [fImgLtrE3, 711.46, 36.72,  68.501,  89.374 ],
];

const monoLabel = {
  fontFamily: "'DM Mono', monospace",
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: 1.3,
  textTransform: 'uppercase',
  color: '#000',
  margin: 0,
  whiteSpace: 'nowrap',
};

export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      width: '100%',
      // Mixed overflow: clip horizontally so the wide blob can't push the
      // body into a sideways scroll, but visible vertically so the lime wash
      // can bleed upward into the section above the footer (per the Figma
      // comp where the gradient fades into the previous section).
      overflowX: 'clip',
      overflowY: 'visible',
      background: '#f9f9f9',
      paddingTop: '80px',
      paddingBottom: '40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Lime gradient wash. Extended above the footer's top edge so the
          fade-from-transparent portion lands inside the previous section,
          producing the soft lime bleed visible in the Figma comp. Also
          extends below the footer so the wash can bleed off the page —
          this requires .intelligence-page to carry padding-bottom so the
          area beneath the footer keeps the light #f9f9f9 backdrop;
          otherwise the blur halo fades into the dark body bg. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 'calc(54.17% - 32px)',
          top: '-200px',
          bottom: '-6.06%',
          transform: 'translateX(-50%)',
          width: '1706px',
          borderRadius: '100px',
          filter: 'blur(50px)',
          background: 'linear-gradient(to bottom, rgba(216,249,93,0) 0%, #d8f95d 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top: headline + social column */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '1440px',
        padding: '0 80px',
        boxSizing: 'border-box',
        display: 'flex',
        gap: '365px',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      }}>
        <p style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '40px',
          lineHeight: 1.1,
          letterSpacing: '-0.4px',
          color: '#000',
          margin: 0,
          width: '382px',
          flexShrink: 0,
        }}>
          Built with care, by people who truly understand it.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '167px', flexShrink: 0 }}>
          <a
            href="#"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
          >
            <span style={monoLabel}>LinkedIn</span>
            <img src={fImgArrowUpRt} alt="" aria-hidden="true" style={{ width: '16px', height: '16px' }} />
          </a>
          <a
            href="https://sword.com"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
          >
            <span style={monoLabel}>Sword.com</span>
            <img src={fImgArrowUpRt} alt="" aria-hidden="true" style={{ width: '16px', height: '16px' }} />
          </a>
        </div>
      </div>

      {/* Bottom block: legal row + giant wordmark */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '1440px',
        padding: '0 80px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '80px',
        marginTop: '160px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1280px',
          borderTop: '1.5px solid #000',
          borderBottom: '1.5px solid #000',
          padding: '24px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <p style={monoLabel}>©2025 Sword Intelligence, Inc.</p>
          <a href="#" style={{ ...monoLabel, textDecoration: 'none' }}>Cookie Settings</a>
          <a href="#" style={{ ...monoLabel, textDecoration: 'none' }}>Privacy Policy</a>
        </div>

        {/* Composed "sword Intelligence" wordmark */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '1280px', height: '160px', flexShrink: 0 }}>
          <div style={{ position: 'absolute', left: 0, top: '1.4px', width: '448.092px', height: '125.874px' }}>
            <img src={fImgSword} alt="sword" style={{ width: '100%', height: '100%' }} />
          </div>
          {F_LETTERS.map(([src, lx, ly, w, h], i) => (
            <div
              key={i}
              style={{ position: 'absolute', left: `${F_INTEL_X + lx}px`, top: `${ly}px`, width: `${w}px`, height: `${h}px` }}
            >
              <img src={src} alt="" style={{ width: '100%', height: '100%' }} />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
