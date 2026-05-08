import { useEffect, useRef } from 'react';

const C_GRID = 50;
const C_BACK_RGB = [249, 249, 249];
const C_FADE_A = 35 / 255;
const C_MIN_R = 2.5;
const C_DOT_RGB = [216, 249, 93];
const C_DOT_RGB_PRESS = [180, 220, 60];

export default function SectionCTA() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const pressed = useRef(false);
  const raf = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.fillStyle = `rgb(${C_BACK_RGB.join(',')})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    const tick = () => {
      const { x: mx, y: my } = mouse.current;
      const { width: w, height: h } = canvas;
      ctx.fillStyle = `rgba(${C_BACK_RGB.join(',')},${C_FADE_A})`;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < w; i += C_GRID) {
        for (let j = 0; j < h; j += C_GRID) {
          const cx = i + C_GRID / 2;
          const cy = j + C_GRID / 2;
          const d = Math.hypot(cx - mx, cy - my);
          const maxD = C_GRID * 2;
          const r = d < maxD ? C_MIN_R + (C_GRID / 2) / (1 + d / C_GRID) : C_MIN_R;
          const [dr, dg, db] = pressed.current && d < maxD ? C_DOT_RGB_PRESS : C_DOT_RGB;
          ctx.fillStyle = `rgb(${dr},${dg},${db})`;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf.current = requestAnimationFrame(tick);
    };
    resize();
    window.addEventListener('resize', resize);
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const onMove = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
  const onDown = () => { pressed.current = true; };
  const onUp = () => { pressed.current = false; };

  return (
    <div
      style={{ position: 'relative', width: '100%', overflow: 'hidden', background: 'linear-gradient(to bottom, #f9f9f9 0%, rgba(249,249,249,0) 60%)' }}
      onMouseMove={onMove} onMouseLeave={onLeave} onMouseDown={onDown} onMouseUp={onUp}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'block',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)',
          opacity: 0.5,
        }}
      />
      <div style={{ position: 'relative', width: '100%', maxWidth: '1440px', margin: '0 auto', height: '519px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
          <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: '80px', lineHeight: 1.05, letterSpacing: '-0.8px', color: '#000', textAlign: 'center', margin: 0 }}>
            {'Good things come to those'}
            <br />
            {'who '}
            <span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}>
              <span aria-hidden="true" style={{ position: 'absolute', left: '-2px', right: '-2px', bottom: '0.12em', height: '0.36em', background: '#d8f95d', zIndex: 0 }} />
              <span style={{ position: 'relative', zIndex: 1 }}>{'don’t'}</span>
            </span>
            {' wait.'}
          </p>
          <div className="cta-group" style={{ display: 'flex', alignItems: 'center' }}>
            <button style={{ background: '#7700ee', borderRadius: '50px', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '-1px', cursor: 'pointer', border: 'none' }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap' }}>Get started</p>
            </button>
            <div className="cta-circle" style={{ background: '#7700ee', borderRadius: '21px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
