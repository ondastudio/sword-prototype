import { useState, useEffect, useRef } from 'react';
import DashedCircle from '../DashedCircle';

const mImgEllipse67      = "/assets/173a864a-cb5e-47af-a073-7a2d703c3d08.svg";
const mImgDots           = "/assets/24dde0d6-cb1b-47da-b204-da820e511550.svg";
const mImgCalendar       = "/assets/4de81e3e-3f00-40a4-9bca-bafc34ae630b.svg";
const mImgArrowLeft      = "/assets/504c80fd-cc91-4a93-bbbd-fa9bbec6f0e1.svg";
const mImgArrowRight     = "/assets/493cddd4-3312-4a3e-bd5b-3a516b48a9dc.svg";
const mImgPlusSign       = "/assets/f6d3e5de-7372-4b08-93ce-7bb83e1e5a34.svg";
const mImgEpic           = "/assets/1ff8d4d7-20e4-4d3d-952d-167f615e2816.svg";
const mImgAdvancedMDa    = "/assets/c4092fb0-32af-40e6-8750-53bbe8333489.svg";
const mImgAdvancedMDb    = "/assets/6d8f7151-3974-4a96-8bfa-512339ca0390.svg";
const mImgCernerMask     = "/assets/218fd6f4-6a10-4fbc-8293-51d120142cec.png";
const mImgElationMask    = "/assets/156129cd-bcb2-449d-b6ba-7016d1e89bde.png";
const mImgEcwMask        = "/assets/05240f33-8748-43b7-9fce-f6f665d45234.png";
const mImgGreenway       = "/assets/df7c1f69-9be8-4409-adfd-c98a1c35c8d9.svg";
const mImgMeditech       = "/assets/88a0019a-8efa-4c7c-b1a6-5ceb558c7ee6.svg";
const mImgNextech        = "/assets/f6542446-251d-4eee-a880-661afd2bcc47.svg";
const mImgModMedMask     = "/assets/a3bf543e-65b5-4da9-9fc9-7673a434db4f.svg";
const mImgModMedImg      = "/assets/2cb978cc-1b9f-4ada-801c-c3a1576d9842.svg";
const mImgAthenaWordmark = "/assets/e9820719-bcb4-498d-8e82-a4d55a5fb214.svg";
const mImgAthenaLeaf     = "/assets/e2134e99-c2f0-4fed-854d-2ae57ebf8920.svg";
const mImgTruBridgeMask  = "/assets/4963f93d-d052-4766-ac44-029736508f15.svg";
const mImgTruBridgeImg   = "/assets/28488a17-bb66-411f-950f-28317841f1e5.svg";
const mImgViradigm       = "/assets/7e33b2ed-67e1-4176-b838-aed538d7473c.svg";
const mImgCtaArrow       = "/assets/icon-plus-sign.svg";
const mImgIconCall       = "/assets/icon-call.svg";
const mImgIconText       = "/assets/icon-text-font.svg";
const mImgIconVoice      = "/assets/icon-voice.svg";
const mImgChannelsScrollbar = "/assets/modular-channels-scrollbar.svg";

const M_LOGOS = [
  { key: 'epic', row: 1, render: () => (
    <div style={{ position: 'relative', width: '73.067px', height: '35px', overflow: 'hidden', flexShrink: 0 }}>
      <img src={mImgEpic} alt="Epic" style={{ position: 'absolute', inset: '11.29% 0 11.26% 1.33%', width: 'calc(100% - 1.33%)', height: '77.45%' }} />
    </div>
  )},
  { key: 'advmd', row: 1, render: () => (
    <div style={{ position: 'relative', width: '136.933px', height: '35px', overflow: 'hidden', flexShrink: 0 }}>
      <img src={mImgAdvancedMDa} alt="" style={{ position: 'absolute', inset: '10.16% 68.26% 10.16% 0' }} />
      <img src={mImgAdvancedMDb} alt="" style={{ position: 'absolute', inset: '49.73% 0 11.4% 19.25%' }} />
    </div>
  )},
  { key: 'cerner', row: 1, render: () => (
    <div style={{ position: 'relative', width: '125.747px', height: '35px', flexShrink: 0 }}>
      <div style={{ position: 'absolute', left: '-0.01px', top: '1.96px', width: '125.747px', height: '30.851px', background: '#000',
        WebkitMaskImage: `url(${mImgCernerMask})`, maskImage: `url(${mImgCernerMask})`,
        WebkitMaskSize: '125.91px 30.961px', maskSize: '125.91px 30.961px',
        WebkitMaskPosition: '0.023px 0.016px', maskPosition: '0.023px 0.016px',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' }} />
    </div>
  )},
  { key: 'elation', row: 1, render: () => (
    <div style={{ position: 'relative', width: '100.129px', height: '35px', flexShrink: 0 }}>
      <div style={{ position: 'absolute', left: 0, top: '2.09px', width: '100.129px', height: '30.67px', background: '#000',
        WebkitMaskImage: `url(${mImgElationMask})`, maskImage: `url(${mImgElationMask})`,
        WebkitMaskSize: '100.129px 30.52px', maskSize: '100.129px 30.52px',
        WebkitMaskPosition: '0.016px 0.07px', maskPosition: '0.016px 0.07px',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' }} />
    </div>
  )},
  { key: 'ecw', row: 2, render: () => (
    <div style={{ position: 'relative', width: '151.186px', height: '35px', flexShrink: 0 }}>
      <div style={{ position: 'absolute', left: '0.01px', top: '7.96px', width: '151.186px', height: '19.124px', background: '#000',
        WebkitMaskImage: `url(${mImgEcwMask})`, maskImage: `url(${mImgEcwMask})`,
        WebkitMaskSize: '151.188px 19.17px', maskSize: '151.188px 19.17px',
        WebkitMaskPosition: '0.016px -0.023px', maskPosition: '0.016px -0.023px',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' }} />
    </div>
  )},
  { key: 'greenway', row: 2, render: () => (
    <div style={{ position: 'relative', width: '183.119px', height: '35px', overflow: 'hidden', flexShrink: 0 }}>
      <img src={mImgGreenway} alt="Greenway Health" style={{ position: 'absolute', inset: '13.39% -0.01% 13.76% 0.01%' }} />
    </div>
  )},
  { key: 'meditech', row: 2, render: () => (
    <div style={{ position: 'relative', width: '171.933px', height: '35px', flexShrink: 0 }}>
      <img src={mImgMeditech} alt="Meditech" style={{ position: 'absolute', inset: '0 0 0.81% 0' }} />
    </div>
  )},
  { key: 'nextech', row: 2, render: () => (
    <div style={{ position: 'relative', width: '120.515px', height: '35px', overflow: 'hidden', flexShrink: 0 }}>
      <img src={mImgNextech} alt="Nextech" style={{ position: 'absolute', inset: '22.17% 0.08% 21.78% 0' }} />
    </div>
  )},
  { key: 'modmed', row: 3, render: () => (
    <div style={{ position: 'relative', width: '105.361px', height: '35px', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: '7.21% 0.6% 6.78% 0',
        WebkitMaskImage: `url(${mImgModMedMask})`, maskImage: `url(${mImgModMedMask})`,
        WebkitMaskSize: '104.723px 30.103px', maskSize: '104.723px 30.103px',
        WebkitMaskPosition: '0 0', maskPosition: '0 0',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' }}>
        <img src={mImgModMedImg} alt="ModMed" style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  )},
  { key: 'athena', row: 3, render: () => (
    <div style={{ position: 'relative', width: '184.021px', height: '35px', overflow: 'hidden', flexShrink: 0 }}>
      <img src={mImgAthenaWordmark} alt="athenahealth" style={{ position: 'absolute', inset: '25.92% 0 20.66% 12.47%' }} />
      <img src={mImgAthenaLeaf} alt="" style={{ position: 'absolute', inset: '21.12% 89.83% 21.2% 0' }} />
    </div>
  )},
  { key: 'trubridge', row: 3, render: () => (
    <div style={{ position: 'relative', width: '183.66px', height: '35px', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: '8.84% 0.02% 8.92% 0',
        WebkitMaskImage: `url(${mImgTruBridgeMask})`, maskImage: `url(${mImgTruBridgeMask})`,
        WebkitMaskSize: '183.66px 28.866px', maskSize: '183.66px 28.866px',
        WebkitMaskPosition: '0 -0.023px', maskPosition: '0 -0.023px',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' }}>
        <img src={mImgTruBridgeImg} alt="TruBridge" style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  )},
  { key: 'viradigm', row: 3, render: () => (
    <div style={{ position: 'relative', width: '140.18px', height: '35px', overflow: 'hidden', flexShrink: 0 }}>
      <img src={mImgViradigm} alt="Viradigm" style={{ position: 'absolute', inset: '6.16% 0 5.8% 0' }} />
    </div>
  )},
];

const M_ROW1 = M_LOGOS.filter(l => l.row === 1);
const M_ROW2 = M_LOGOS.filter(l => l.row === 2);
const M_ROW3 = M_LOGOS.filter(l => l.row === 3);

function MLogoRow({ logos, direction = 'ltr', borderBottom = false }) {
  // Each row marquees its logo strip horizontally. The strip is duplicated so
  // translating -50% wraps seamlessly. Direction picks the scroll side.
  const doubled = [...logos, ...logos];
  const anim = direction === 'rtl' ? 'ehrRTL 24s linear infinite' : 'ehrLTR 24s linear infinite';
  const fade = 'linear-gradient(to right, transparent 0, #000 32px, #000 calc(100% - 32px), transparent 100%)';
  return (
    <div style={{
      borderBottom: borderBottom ? '1.5px solid #000' : 'none',
      flex: '1 0 0', minHeight: 0, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '0 8px',
      width: '100%', boxSizing: 'border-box',
    }}>
      <div style={{
        overflow: 'hidden', width: '100%',
        WebkitMaskImage: fade, maskImage: fade,
      }}>
        <div style={{
          display: 'flex', gap: '32.938px', alignItems: 'center',
          animation: anim, flexShrink: 0, willChange: 'transform',
        }}>
          {doubled.map((logo, i) => (
            <div key={`${logo.key}-${i}`} style={{ flexShrink: 0 }}>{logo.render()}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MPlusButton({ left, top }) {
  return (
    <div style={{ position: 'absolute', left, top, width: '40px', height: '40px',
      border: '1px solid rgba(0,0,0,0.35)', borderRadius: '32px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', zIndex: 1 }}>
      <img src={mImgPlusSign} alt="" style={{ width: '24px', height: '24px' }} />
    </div>
  );
}

const M_EASING = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const M_DUR = '0.9s';

export default function SectionModular() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          setVisible(true);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.6, 0.75, 1], rootMargin: '0px 0px -15% 0px' }
    );
    const sentinel = el.querySelector('[data-modular-sentinel]');
    observer.observe(sentinel || el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', background: '#f9f9f9', overflow: 'hidden' }}>
      <style>{`
        @keyframes ehrLTR { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes ehrRTL { from { transform: translateX(-50%); } to { transform: translateX(0); } }
      `}</style>
      <div style={{ position: 'absolute', left: '50%', top: '80px', transform: 'translateX(-50%)',
        width: '95%', bottom: '80px',
        background: '#d8f95d', borderRadius: '100px', pointerEvents: 'none',
        filter: 'blur(50px)' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '1440px', margin: '0 auto', height: '900px' }}>
        <div data-modular-sentinel style={{ position: 'absolute', left: 0, right: 0, top: '295px', height: '374px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '50%', top: '120px', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '813px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={mImgEllipse67} alt="" style={{ width: '8px', height: '8px', flexShrink: 0 }} />
            <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '-0.14px', color: '#000', whiteSpace: 'nowrap' }}>
              Designed for the complexities of care
            </p>
          </div>
          <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: '52px', lineHeight: '1.05', letterSpacing: '-0.26px', color: '#000', textAlign: 'center', width: '813px' }}>
            An intelligent system to solve any challenge.
          </p>
        </div>
        <div style={{ position: 'absolute', left: '273px', top: '364px', width: '220px', height: '237px', border: '1.5px solid #000', borderRadius: '24px', zIndex: 0 }} />
        <div style={{ position: 'absolute', left: '513px', top: '295px', width: '414px', height: '374px', border: '1.5px solid #000', borderRadius: '24px', zIndex: 0 }} />
        <div style={{ position: 'absolute', left: '947px', top: '342px', width: '220px', height: '280px', border: '1.5px solid #000', borderRadius: '24px', zIndex: 0 }} />
        <MPlusButton left="363px" top="462px" />
        <MPlusButton left="700px" top="462px" />
        <MPlusButton left="1037px" top="462px" />

        <div style={{
          position: 'absolute', left: '273px', top: '364px', width: '220px', height: '237px', zIndex: 2,
          transition: `transform ${M_DUR} ${M_EASING}, opacity ${M_DUR} ease`,
          transform: visible ? 'translateX(0)' : 'translateX(-379px)',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
        }}>
          <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: '#faffeb', borderRadius: '24px', padding: '16px 24px 16px 16px', display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'flex-start', position: 'relative' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '18px', lineHeight: '1.3', letterSpacing: '-0.18px', color: '#000', whiteSpace: 'nowrap' }}>Channels</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', width: '100%' }}>
              {[{ label: 'Phone calls', w: '171px', icon: mImgIconCall }, { label: 'SMS', w: '107px', icon: mImgIconText }, { label: 'Voice Message', w: '190px', icon: mImgIconVoice }].map(({ label, w, icon }) => (
                <div key={label} style={{ display: 'flex', height: '40px', alignItems: 'center', overflow: 'hidden', padding: '0 8px', borderRadius: '24px', width: w, position: 'relative', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '40px', flexShrink: 0, width: '32px', height: '32px' }}>
                    <img src={icon} alt="" style={{ width: '24px', height: '24px' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px', padding: '4px 12px', flexShrink: 0 }}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: '14px', lineHeight: '1.2', letterSpacing: '-0.14px', textTransform: 'uppercase', color: '#000', whiteSpace: 'nowrap' }}>{label}</p>
                  </div>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '40px', border: '10px solid #d8f95d', filter: 'blur(4px)', pointerEvents: 'none' }} />
                </div>
              ))}
            </div>
            <img src={mImgChannelsScrollbar} alt="" aria-hidden="true" style={{ position: 'absolute', right: '8px', top: 'calc(50% + 0.5px)', transform: 'translateY(-50%)', width: '8px', height: '56px' }} />
          </div>
        </div>

        <div style={{
          position: 'absolute', left: '513px', top: '295px', width: '414px', height: '374px', zIndex: 2,
          transition: `transform ${M_DUR} ${M_EASING} 0.08s, opacity ${M_DUR} ease 0.08s`,
          transform: visible ? 'translateY(0)' : 'translateY(517px)',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
        }}>
          <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: 'rgba(250,255,235,0.5)', backdropFilter: 'blur(20px)', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '9px', padding: '8px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', height: '52px', padding: '8px 0', flexShrink: 0 }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '18px', lineHeight: '1.3', letterSpacing: '-0.18px', color: '#000' }}>EHR</p>
            </div>
            <MLogoRow logos={M_ROW1} direction="rtl" borderBottom />
            <MLogoRow logos={M_ROW2} direction="ltr" borderBottom />
            <MLogoRow logos={M_ROW3} direction="rtl" />
          </div>
        </div>

        <div style={{
          position: 'absolute', left: '947px', top: '342px', width: '220px', height: '280px', zIndex: 2,
          transition: `transform ${M_DUR} ${M_EASING} 0.04s, opacity ${M_DUR} ease 0.04s`,
          transform: visible ? 'translateX(0)' : 'translateX(393px)',
          opacity: visible ? 1 : 0,
        }}>
          <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', background: 'rgba(139,174,228,0.25)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <div style={{ background: '#faffeb', borderRadius: '18px', flex: '1 0 0', width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '16px 8px', boxSizing: 'border-box', position: 'relative' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '18px', lineHeight: '1.3', letterSpacing: '-0.18px', color: '#000', whiteSpace: 'nowrap', position: 'relative', zIndex: 1 }}>AI Skills</p>
              <div style={{ width: '62px', height: '62px', position: 'relative', flexShrink: 0, zIndex: 1 }}>
                <img src={mImgCalendar} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
              </div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: '14px', lineHeight: '1.2', letterSpacing: '-0.14px', textTransform: 'uppercase', color: '#000', whiteSpace: 'nowrap', position: 'relative', zIndex: 1 }}>Scheduling reasoning</p>
              <div style={{ position: 'absolute', left: '50%', top: '-0.5px', transform: 'translateX(-50%)', width: '204px', height: '209px', borderRadius: '18px', border: '10px solid #d8f95d', filter: 'blur(4px)', pointerEvents: 'none' }} />
            </div>
            <div style={{ display: 'flex', padding: '4px', borderRadius: '32px', width: '100%', boxSizing: 'border-box', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                <DashedCircle style={{ opacity: 0.25 }}>
                  <img src={mImgArrowLeft} alt="" style={{ width: '24px', height: '24px', transform: 'scaleX(-1)', filter: 'invert(1)' }} />
                </DashedCircle>
                <div style={{ flex: '1 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', borderRadius: '24px' }}>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 400, fontSize: '14px', lineHeight: '1.2', letterSpacing: '-0.14px', textTransform: 'uppercase', color: '#000', whiteSpace: 'nowrap' }}>01/10</p>
                </div>
                <DashedCircle>
                  <img src={mImgArrowRight} alt="" style={{ width: '24px', height: '24px', filter: 'invert(1)' }} />
                </DashedCircle>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: '360px', top: '709px', width: '720px' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '18px', lineHeight: '1.3', letterSpacing: '-0.18px', color: '#000', textAlign: 'center' }}>
            Built from modular blocks—interaction channels, AI skills, guardrails, clinical knowledge—all ready to integrate into your existing EHR, CRM, and compliance layers. Expanding to new workflows is as simple as recombining what's already there.
          </p>
        </div>

        <div className="cta-group" style={{ position: 'absolute', left: '50%', top: '820px', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center' }}>
          <div style={{ background: '#4a89e8', borderRadius: '50px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', marginRight: '-1px', flexShrink: 0 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: '14px', lineHeight: 'normal', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap' }}>
              Tell us what you need
            </p>
          </div>
          <div className="cta-circle" style={{ background: '#4a89e8', borderRadius: '21px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img className="cta-arrow" src={mImgCtaArrow} alt="" style={{ width: '24px', height: '24px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
