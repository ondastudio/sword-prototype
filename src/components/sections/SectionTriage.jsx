// "Trusted by the most regulated industry in the world." — Figma 7312:1329.
// Replaces the previous "clinically rigorous" version. The file is kept under
// the same name so IntelligencePage's existing import keeps working.

const A = (p) => `/assets/${p}`;

// Pill width is 240×80; logo wrapper is 160×45 inside it. Each badge is sized
// per the Figma spec (some are a single combined SVG, some are logo + text
// with absolute positions inside a 160×45 box).

function Pill({ children, padX = 0 }) {
  return (
    <div style={{
      width: '240px',
      height: '80px',
      borderRadius: '24px',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(2px)',
      WebkitBackdropFilter: 'blur(2px)',
      overflow: 'visible',
      paddingLeft: padX ? `${padX}px` : 0,
      paddingRight: padX ? `${padX}px` : 0,
      boxSizing: 'border-box',
    }}>
      {/* Lime glow halo: a 15px ring blurred to 8px */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '24px',
          border: '15px solid #d8f95d',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      />
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '160px',
        height: '45px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}

// Single combined SVG centered in the 160×45 logo wrapper.
function Single({ src, w, h, alt }) {
  return <img src={src} alt={alt} style={{ width: `${w}px`, height: `${h}px` }} />;
}

// Logo + text positioned inside the 160×45 logo wrapper using the offsets from
// the Figma comp (top-left origin).
function LogoText({ logo, text }) {
  return (
    <div style={{ position: 'relative', width: '160px', height: '45px' }}>
      <img
        src={logo.src}
        alt=""
        style={{
          position: 'absolute',
          left: `${logo.x}px`,
          top: `${logo.y}px`,
          width: `${logo.w}px`,
          height: `${logo.h}px`,
        }}
      />
      <img
        src={text.src}
        alt={text.alt}
        style={{
          position: 'absolute',
          left: `${text.x}px`,
          top: `${text.y}px`,
          width: `${text.w}px`,
          height: `${text.h}px`,
        }}
      />
    </div>
  );
}

// HITRUST has the logo stacked over a "Certified" word — 89.348×45 inner block.
function HitrustCertified() {
  return (
    <div style={{
      width: '89.348px',
      height: '45px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '7.838px',
    }}>
      <img src={A('trust-hitrust-logo.svg')} alt="HITRUST"
           style={{ width: '74.649px', height: '21.77px' }} />
      <img src={A('trust-hitrust-certified.svg')} alt="Certified"
           style={{ width: '55.549px', height: '7.584px' }} />
    </div>
  );
}

// Cyber Essentials Plus — shield (with mask-image clip) + wordmark.
function CyberEssentials() {
  return (
    <div style={{ position: 'relative', width: '160px', height: '45px' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '1.6px',
          width: '53.643px',
          height: '41.906px',
          WebkitMaskImage: `url(${A('trust-cyber-shield-mask.svg')})`,
          maskImage: `url(${A('trust-cyber-shield-mask.svg')})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: '53.641px 41.907px',
          maskSize: '53.641px 41.907px',
        }}
      >
        <img
          src={A('trust-cyber-shield.svg')}
          alt=""
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <img
        src={A('trust-cyber-essentials-text.svg')}
        alt="Cyber Essentials Plus"
        style={{
          position: 'absolute',
          left: '62.25px',
          top: '2.55px',
          width: '68.828px',
          height: '40px',
        }}
      />
    </div>
  );
}

const ROW_1 = (
  <>
    <Pill padX={8}>
      <Single src={A('trust-iso13485-combined.svg')} w={116.791} h={45}
              alt="ISO 13485 Accredited" />
    </Pill>
    <Pill>
      <LogoText
        logo={{ src: A('trust-stars-circle.svg'), x: 0, y: 0, w: 44.074, h: 45 }}
        text={{ src: A('trust-mdr-text.svg'),     x: 55.55, y: 16.46, w: 72.523, h: 23.511,
                alt: 'MDR Class IIa Compliant' }}
      />
    </Pill>
    <Pill>
      <Single src={A('trust-iso27001-combined.svg')} w={115.992} h={45}
              alt="ISO 27001 Accredited" />
    </Pill>
    <Pill>
      <Single src={A('trust-aicpa-soc2-combined.svg')} w={112.287} h={45}
              alt="AICPA SOC 2 Compliant" />
    </Pill>
    <Pill>
      <Single src={A('trust-nhs-combined.svg')} w={122.58} h={23.763}
              alt="NHS Compliant" />
    </Pill>
  </>
);

const ROW_2 = (
  <>
    <Pill padX={8}>
      <Single src={A('trust-dtac-combined.svg')} w={106.48} h={45}
              alt="DTAC Certified" />
    </Pill>
    <Pill>
      <LogoText
        logo={{ src: A('trust-mhra-logo.svg'), x: 0, y: 0, w: 45.109, h: 45 }}
        text={{ src: A('trust-mhra-text.svg'),  x: 57.34, y: 14.19, w: 59.785, h: 21,
                alt: 'MHRA Class I & IIa' }}
      />
    </Pill>
    <Pill>
      <Single src={A('trust-health-canada-combined.svg')} w={92.208} h={45}
              alt="Health Canada Class I" />
    </Pill>
    <Pill padX={8}>
      <LogoText
        logo={{ src: A('trust-fda-logo.svg'), x: 0, y: 1.4, w: 52.999, h: 21.512 }}
        text={{ src: A('trust-fda-text.svg'),  x: 64.05, y: 0, w: 68.628, h: 22,
                alt: 'FDA Class 2 Certification' }}
      />
    </Pill>
    <Pill>
      <HitrustCertified />
    </Pill>
  </>
);

const ROW_3 = (
  <>
    <Pill>
      <Single src={A('trust-hipaa-combined.svg')} w={128.148} h={47.874}
              alt="HIPAA Compliant" />
    </Pill>
    <Pill>
      <LogoText
        logo={{ src: A('trust-gdpr-stars-circle.svg'),    x: 0, y: 0, w: 44.074, h: 45 }}
        text={{ src: A('trust-gdpr-compliant-text.svg'),  x: 55.95, y: 12.07, w: 52.101, h: 22,
                alt: 'GDPR Compliant' }}
      />
    </Pill>
    <Pill>
      <Single src={A('trust-nhs-dcb-combined.svg')} w={137.615} h={30.598}
              alt="NHS DCB0129 DCB0160" />
    </Pill>
    <Pill>
      <CyberEssentials />
    </Pill>
  </>
);

const PILLARS = [
  {
    icon: A('icon-workflow-circle.svg'),
    iconSize: 40,
    title: 'Proven in practice',
    body: "Our AI has been tested and certified across the world's most demanding regulatory frameworks.",
  },
  {
    icon: A('icon-file-validation.svg'),
    iconSize: 32,
    title: 'Clinically reviewed',
    body: 'Every decision our AI makes has been scrutinized by clinical experts.',
  },
  {
    icon: A('icon-security.svg'),
    iconSize: 32,
    title: 'Built for privacy.',
    body: "Your patients' data is protected by the strictest standards in existence.",
  },
];

export default function SectionTriage() {
  return (
    <section style={{
      background: '#f9f9f9',
      padding: '160px 80px 200px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '120px',
      boxSizing: 'border-box',
    }}>
      {/* Title */}
      <div style={{ width: '100%', maxWidth: '1280px', display: 'flex', justifyContent: 'center' }}>
        <p style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '56px',
          lineHeight: 1.05,
          letterSpacing: '-0.28px',
          color: '#000',
          textAlign: 'center',
          width: '681px',
          margin: 0,
        }}>
          Trusted by the most regulated industry in the world.
        </p>
      </div>

      {/* Badge pyramid: 5 + 5 + 4, third row centered */}
      <div style={{
        width: '100%',
        maxWidth: '1280px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>{ROW_1}</div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>{ROW_2}</div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>{ROW_3}</div>
      </div>

      {/* 3-column pillars */}
      <div style={{
        width: '100%',
        maxWidth: '1280px',
        display: 'flex',
        gap: '24px',
        alignItems: 'stretch',
        height: '218px',
      }}>
        {PILLARS.map((p, i) => (
          <div
            key={i}
            style={{
              flex: '1 1 0',
              minWidth: 0,
              height: '100%',
              borderLeft: '1.5px solid #000',
              padding: '0 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            {/* Lime circle icon container */}
            <div style={{
              background: '#d8f95d',
              padding: '8px',
              borderRadius: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src={p.icon}
                alt=""
                aria-hidden="true"
                style={{ width: `${p.iconSize}px`, height: `${p.iconSize}px`, display: 'block' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: '20px',
                lineHeight: 1.2,
                letterSpacing: '-0.4px',
                color: '#000',
                margin: 0,
              }}>
                {p.title}
              </p>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: '18px',
                lineHeight: 1.2,
                letterSpacing: '-0.36px',
                color: '#000',
                margin: 0,
              }}>
                {p.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
