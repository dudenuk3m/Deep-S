import React, { useState, useEffect, useRef, useCallback, useContext, createContext } from 'react';
import {
  Activity, Layers, Play, Pause, RotateCcw,
  Shield, Cpu, Maximize2, Droplets, Target,
  Thermometer, Factory, Zap, Sparkles, Sun, Moon, X,
  Eye, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const GE_PURPLE       = '#6022A6';
const GE_PURPLE_LIGHT = '#8B4FD8';
const TEAL_DATA       = '#00c8b4';
const AMBER_WARN      = '#f59e0b';

// Canvas simulation always stays dark (clinical standard)
const GROUND          = '#0e0e10';
const SURFACE         = '#16161a';
const SURFACE2        = '#1e1e24';
const BORDER_DARK     = '#2a2a35';
const BORDER_MID      = '#3a3a48';

const DARK_THEME = {
  bg:           '#0e0e10',
  surface:      '#16161a',
  surface2:     '#1e1e24',
  border:       '#2a2a35',
  borderMid:    '#3a3a48',
  text:         '#f0f0f5',
  textSec:      '#9494aa',
  textMuted:    '#555568',
  isDark:       true,
};

const LIGHT_THEME = {
  bg:           '#f5f4f0',
  surface:      '#ffffff',
  surface2:     '#eeecea',
  border:       '#d8d4cc',
  borderMid:    '#c4bfb6',
  text:         '#0e0e10',
  textSec:      '#3a3848',
  textMuted:    '#888090',
  isDark:       false,
};

const ThemeContext = createContext(DARK_THEME);
const useTheme = () => useContext(ThemeContext);

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
const ThemeToggle = ({ dark, onToggle }) => {
  const snarkDark  = '☀ Burn my retinas';
  const snarkLight = '☾ Back to the void';
  return (
    <button
      onClick={onToggle}
      className="ge-btn"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display:'flex', alignItems:'center', gap:8,
        padding:'5px 12px',
        background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        border:`1px solid ${dark ? BORDER_MID : '#c4bfb6'}`,
        borderRadius:4,
        fontFamily:'DM Mono, monospace', fontSize:9, fontWeight:500,
        letterSpacing:'0.08em', textTransform:'uppercase',
        color: dark ? '#9494aa' : '#3a3848',
        cursor:'pointer', whiteSpace:'nowrap',
        transition:'all 0.2s'
      }}
    >
      {dark ? <Sun size={10} /> : <Moon size={10} />}
      {dark ? snarkDark : snarkLight}
    </button>
  );
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyle = ({ theme }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${theme.bg}; transition: background 0.3s; }
    @keyframes ge-pulse  { 0%,100%{opacity:1;transform:scale(1)}   50%{opacity:0.4;transform:scale(0.85)} }
    @keyframes ge-bounce { 0%,100%{transform:translateY(0)}         50%{transform:translateY(5px)} }
    @keyframes ge-spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .ge-btn { transition: opacity 0.18s ease; cursor: pointer; }
    .ge-btn:hover { opacity: 0.75; }
    .ge-row:hover td { background: rgba(96,34,166,0.07) !important; }
    .deep-si-scroll::-webkit-scrollbar { width: 3px; }
    .deep-si-scroll::-webkit-scrollbar-thumb { background: rgba(96,34,166,0.4); border-radius: 10px; }
    .deep-si-scroll::-webkit-scrollbar-track { background: transparent; }
  `}</style>
);

// ─── SHARED PRIMITIVES ────────────────────────────────────────────────────────
const Header = ({ darkMode, onToggle }) => {
  const t = useTheme();
  return (
  <header style={{ background: t.bg, borderBottom: `1px solid ${t.border}`, transition:'background 0.3s, border-color 0.3s' }}>
    <div style={{ borderBottom: `1px solid ${t.border}`, padding: '12px 32px' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 4, background: `linear-gradient(135deg,${GE_PURPLE} 0%,#3d0e78 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.03em' }}>GE</span>
          </div>
          <div style={{ width: 1, height: 20, background: t.borderMid }} />
          <span style={{ color: t.textSec, fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>HealthCare</span>
          <div style={{ width: 1, height: 20, background: t.borderMid }} />
          <span style={{ color: t.textMuted, fontSize: 11, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Edison Intelligence · CT Imaging</span>
        </div>
        <ThemeToggle dark={darkMode} onToggle={onToggle} />
      </div>
    </div>
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '64px 32px 56px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ height: 2, width: 32, background: GE_PURPLE }} />
        <span style={{ color: GE_PURPLE_LIGHT, fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Detector Technology · Photon Counting CT</span>
      </div>
      <h1 style={{ color: t.text, fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(30px,4.5vw,54px)', fontWeight: 300, lineHeight: 1.12, letterSpacing: '-0.02em', marginBottom: 24, maxWidth: 720, transition:'color 0.3s' }}>
        Counting every photon.<br /><span style={{ fontWeight: 700 }}>Redefining what CT can see.</span>
      </h1>
      <p style={{ color: t.textSec, fontFamily: 'DM Sans, sans-serif', fontSize: 16, lineHeight: 1.7, maxWidth: 600, fontWeight: 300, marginBottom: 40, transition:'color 0.3s' }}>
        Photon-counting detector CT eliminates the scintillator layer — enabling direct conversion, zero electronic noise, and simultaneous multi-energy imaging in a single rotation.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, paddingTop: 32, borderTop: `1px solid ${t.border}` }}>
        {[{ val: '≥30%', label: 'Dose reduction' },{ val: '150 µm', label: 'Pixel resolution' },{ val: '8', label: 'Energy bins' },{ val: '0', label: 'Noise floor' }].map(s => (
          <div key={s.val}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 26, fontWeight: 700, color: t.text, letterSpacing: '-0.02em', transition:'color 0.3s' }}>{s.val}</div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: t.textMuted, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 3, transition:'color 0.3s' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </header>
  );
};

// ─── COLLAPSIBLE REFERENCES ───────────────────────────────────────────────────
const References = () => {
  const [open, setOpen] = useState(false);
  const t = useTheme();
  const refs = [
    { n:1, label:'arXiv:2206.04164', text:'Compton scatter in edge-on silicon detector — Monte Carlo models of 60mm GE/Prismatic geometry.', href:'https://arxiv.org/abs/2206.04164' },
    { n:2, label:'PMC6792007',       text:'Resolution characterisation of silicon-based PCD — 60mm Si vs. few-mm CdTe stopping power equivalence.', href:'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6792007/' },
    { n:3, label:'Med Phys 2024',    text:'Intra-detector Compton scatter — confirms 60mm silicon path length in GE PCD simulations.', href:'https://aapm.onlinelibrary.wiley.com/doi/10.1002/mp.17254' },
    { n:4, label:'PMC10922475',      text:'Deep silicon PCD-CT: first simulation study — GE Revolution Apex geometry with 60mm Si path.', href:'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10922475/' },
    { n:5, label:'SPIE 2020',        text:'Detective quantum efficiency of CdTe and Si PCDs — documents CdTe K-fluorescence vs silicon fluorescence-free advantage.', href:'https://www.spiedigitallibrary.org/conference-proceedings-of-spie/11312/113120T/Detective-quantum-efficiency-of-photon-counting-CdTe-and-Si-detectors/10.1117/12.2549292.short' },
  ];
  return (
    <div style={{ marginTop:24, borderTop:`1px solid ${t.border}`, borderRight:`1px solid ${t.border}`, borderBottom:`1px solid ${t.border}`, borderLeft:`2px solid ${GE_PURPLE}`, borderRadius:6, overflow:'hidden' }}>
      <button onClick={() => setOpen(o => !o)} className="ge-btn" style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', background:t.surface, border:'none', cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontFamily:'DM Mono, monospace', fontSize:9, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:t.textMuted }}>References</span>
          <span style={{ fontFamily:'DM Mono, monospace', fontSize:8, color:GE_PURPLE_LIGHT }}>[1–5]</span>
        </div>
        <span style={{ fontFamily:'DM Mono, monospace', fontSize:11, color:t.textMuted, display:'inline-block', transition:'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </button>
      {open && (
        <div style={{ padding:'4px 20px 16px', background:t.surface, borderTop:`1px solid ${t.border}` }}>
          {refs.map(r => (
            <div key={r.n} style={{ display:'flex', gap:12, marginTop:10, alignItems:'flex-start' }}>
              <span style={{ fontFamily:'DM Mono, monospace', fontSize:9, color:GE_PURPLE_LIGHT, flexShrink:0, minWidth:14, paddingTop:1 }}>[{r.n}]</span>
              <div>
                <a href={r.href} target="_blank" rel="noopener noreferrer" style={{ fontFamily:'DM Mono, monospace', fontSize:9, color:GE_PURPLE_LIGHT, textDecoration:'none', marginRight:6 }}>{r.label}</a>
                <span style={{ fontFamily:'DM Sans, sans-serif', fontSize:11, color:t.textMuted, lineHeight:1.5 }}>{r.text}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Cite = ({ refs }) => (
  <sup style={{ fontFamily:'DM Mono, monospace', fontSize:8, color:GE_PURPLE_LIGHT, letterSpacing:'0.02em', marginLeft:1 }}>
    [{refs.join(',')}]
  </sup>
);

const SectionLabel = ({ number, children }) => {
  const t = useTheme();
  return (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, fontWeight: 500, color: GE_PURPLE_LIGHT, letterSpacing: '0.1em', flexShrink: 0 }}>{number}</span>
    <div style={{ width: 1, height: 16, background: t.borderMid }} />
    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.textSec }}>{children}</span>
    <div style={{ flex: 1, height: 1, background: t.border }} />
  </div>
  );
};

const SpecRow = ({ label, eidVal, pcdVal, mode }) => {
  const t = useTheme();
  const isEID = mode === 'EID';
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 5 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <div style={{ background: isEID ? t.surface2 : t.surface, padding: '8px 10px', borderRadius: '3px 0 0 3px', border: `1px solid ${isEID ? t.borderMid : t.border}`, transition: 'all 0.3s' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 500, color: isEID ? t.text : t.textMuted, transition: 'color 0.3s' }}>{eidVal}</div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 9, color: t.textMuted, marginTop: 2 }}>EID</div>
        </div>
        <div style={{ background: !isEID ? t.surface2 : t.surface, padding: '8px 10px', borderRadius: '0 3px 3px 0', border: `1px solid ${!isEID ? GE_PURPLE : t.border}`, transition: 'all 0.3s' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 500, color: !isEID ? TEAL_DATA : t.textMuted, transition: 'color 0.3s' }}>{pcdVal}</div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 9, color: t.textMuted, marginTop: 2 }}>PCD-CT</div>
        </div>
      </div>
    </div>
  );
};

// ─── 01 · DETECTOR SIMULATION (canvas) ───────────────────────────────────────
const DetectorSim = () => {
  const t = useTheme();
  const [isPlaying, setIsPlaying]     = useState(true);
  const [mode, setMode]               = useState('EID');
  const [threshold, setThreshold]     = useState(35);
  const canvasRef                     = useRef(null);
  const frameRef                      = useRef(0);
  const particles                     = useRef([]);
  const accumulated                   = useRef([]);
  const modeRef                       = useRef(mode);
  const playingRef                    = useRef(isPlaying);
  const thresholdRef                  = useRef(35);
  const countsRef                     = useRef({ photons: 0, noise: 0 });
  const HIST_BINS = 28, HIST_MIN = 0, HIST_WIDTH = 5; // 0–140 keV, 5 keV bins
  const emptyHist = () => new Array(HIST_BINS).fill(0).map(()=>({ signal:0, noise:0 }));
  const histRef                       = useRef(emptyHist());
  const [photonCount, setPhotonCount] = useState(0);
  const [noiseCount,  setNoiseCount]  = useState(0);
  const [histogram,   setHistogram]   = useState(emptyHist());

  useEffect(() => {
    modeRef.current = mode;
    particles.current = []; accumulated.current = [];
    countsRef.current = { photons: 0, noise: 0 };
    histRef.current = emptyHist();
    setPhotonCount(0); setNoiseCount(0);
    setHistogram(emptyHist());
  }, [mode]);
  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { thresholdRef.current = threshold; }, [threshold]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    const draw = () => {
      frameRef.current = requestAnimationFrame(draw);
      if (!playingRef.current) return;
      const W = canvas.width, H = canvas.height, detY = H - 100;
      frame++;
      ctx.fillStyle = '#0e0e10'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle = 'rgba(42,42,53,0.8)'; ctx.lineWidth = 0.5;
      for (let x=0;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,detY-20);ctx.stroke();}
      for (let y=30;y<detY-20;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      const sp=(frame%180)/180, sy=sp*(detY-20);
      const sg=ctx.createLinearGradient(0,sy-20,0,sy+4);
      sg.addColorStop(0,'transparent');sg.addColorStop(1,'rgba(96,34,166,0.07)');
      ctx.fillStyle=sg;ctx.fillRect(0,sy-20,W,24);
      ctx.fillStyle='#555568';ctx.font=`500 9px "DM Mono",monospace`;ctx.fillText('X-RAY SOURCE · 140 kVp · W anode · 3mm Al filter',16,20);

      // Physically-based CT spectrum sampler (140 kVp, tungsten anode, filtered)
      const sampleCTEnergy = () => {
        const kVp = 140, E_min = 20;
        const WKalpha = 58.6, WKbeta = 67.2;
        if (Math.random() < 0.08) {
          return Math.random() < 0.7 ? WKalpha + (Math.random()-0.5)*1.2 : WKbeta + (Math.random()-0.5)*1.5;
        }
        for (let attempt = 0; attempt < 50; attempt++) {
          const E = E_min + Math.random() * (kVp - E_min);
          const kramers = (kVp / E) - 1;
          const muAl = 4.0 * Math.pow(30 / E, 2.7) + 0.06;
          const filter = Math.exp(-muAl * 0.3);
          const prob = kramers * filter / 5.0;
          if (Math.random() < Math.min(prob, 1)) return E;
        }
        return E_min + Math.random() * (kVp - E_min);
      };

      if(Math.random()>0.55){
        const isNoise=Math.random()<0.22;
        const energy = sampleCTEnergy();
        particles.current.push({x:Math.random()*(W-100)+50,y:isNoise?Math.random()*(detY-60)+10:10,energy:isNoise?8+Math.random()*14:energy,speed:isNoise?0:2.5+Math.random()*2.5,type:isNoise?'noise':'photon',life:isNoise?50+Math.random()*50:9999,age:0});
      }
      const toRemove=[];
      particles.current.forEach((p,i)=>{
        p.age++;
        if(p.type==='photon'){
          p.y+=p.speed;
          const r=Math.max(2.5,p.energy/16);
          const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*2.5);
          g.addColorStop(0,'rgba(139,79,216,0.5)');g.addColorStop(1,'transparent');
          ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,r*2.5,0,Math.PI*2);ctx.fill();
          ctx.fillStyle=`rgba(200,170,255,${0.8+p.energy/200})`;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
          if(p.y>=detY-22){
            const m=modeRef.current;
            const bin = Math.max(0, Math.min(HIST_BINS-1, Math.floor((p.energy - HIST_MIN) / HIST_WIDTH)));
            if(m==='EID'){
              accumulated.current.push({x:p.x,energy:p.energy,noise:false});
              countsRef.current.photons++;
              histRef.current[bin].signal++;
            } else if(p.energy>thresholdRef.current){
              accumulated.current.push({x:p.x,energy:p.energy,noise:false});
              countsRef.current.photons++;
              histRef.current[bin].signal++;
            } else {
              histRef.current[bin].noise++;
            }
            toRemove.push(i);
          }
        } else {
          const a=Math.max(0,1-p.age/p.life);
          ctx.fillStyle=`rgba(245,158,11,${a*0.55})`;ctx.fillRect(p.x-2,p.y-2,4,4);
          if(modeRef.current==='EID'&&p.age===1){
            const noiseEnergy = 3+Math.random()*18;
            const bin = Math.max(0, Math.min(HIST_BINS-1, Math.floor((noiseEnergy - HIST_MIN) / HIST_WIDTH)));
            accumulated.current.push({x:p.x,energy:noiseEnergy,noise:true});
            countsRef.current.noise++;
            histRef.current[bin].noise++;
          }
          if(p.age>=p.life)toRemove.push(i);
        }
      });
      for(let i=toRemove.length-1;i>=0;i--)particles.current.splice(toRemove[i],1);
      const m=modeRef.current, dp=ctx.createLinearGradient(0,detY-22,0,detY+22);
      dp.addColorStop(0,'#1a1a22');dp.addColorStop(1,'#121218');
      ctx.fillStyle=dp;ctx.fillRect(0,detY-22,W,44);
      if(m==='PCD'){const eg=ctx.createLinearGradient(0,detY-22,0,detY-18);eg.addColorStop(0,'rgba(0,200,180,0.7)');eg.addColorStop(1,'transparent');ctx.fillStyle=eg;ctx.fillRect(0,detY-22,W,4);}
      else{ctx.fillStyle=BORDER_MID;ctx.fillRect(0,detY-22,W,1);}
      ctx.fillStyle=m==='PCD'?'#00c8b4':'#555568';ctx.font=`600 8.5px "DM Mono",monospace`;
      ctx.fillText(m==='EID'?'ENERGY INTEGRATING DETECTOR  ·  SCINTILLATOR / PHOTODIODE':'PHOTON COUNTING DETECTOR  ·  DIRECT CONVERSION  ·  CdTe SEMICONDUCTOR',16,detY+36);
      if(m==='PCD'){ctx.setLineDash([4,4]);ctx.strokeStyle='rgba(245,158,11,0.4)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,detY-60);ctx.lineTo(W,detY-60);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(245,158,11,0.6)';ctx.font=`500 8px "DM Mono",monospace`;ctx.fillText(`THRESHOLD  E > ${thresholdRef.current} keV`,16,detY-65);}
      const sigY=detY+60;ctx.fillStyle='#0b0b0e';ctx.fillRect(0,detY+22,W,H-(detY+22));
      accumulated.current.slice(-240).forEach(d=>{
        if(m==='EID'){ctx.globalAlpha=0.13;const gr=ctx.createRadialGradient(d.x,sigY,0,d.x,sigY,d.energy*0.4);gr.addColorStop(0,d.noise?'#f59e0b':'#8B4FD8');gr.addColorStop(1,'transparent');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(d.x,sigY,d.energy*0.4,0,Math.PI*2);ctx.fill();}
        else{ctx.globalAlpha=0.35;ctx.fillStyle=TEAL_DATA;ctx.fillRect(d.x-1,sigY-14,2,28);}
        ctx.globalAlpha=1;
      });
      ctx.fillStyle='#333345';ctx.font=`500 8px "DM Mono",monospace`;ctx.fillText('SIGNAL READOUT',16,H-10);
      if(accumulated.current.length>300)accumulated.current.splice(0,60);
      if(frame%15===0){setPhotonCount(countsRef.current.photons);setNoiseCount(countsRef.current.noise);setHistogram([...histRef.current.map(b=>({...b}))]);}
    };
    frameRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(frameRef.current);
  },[]);

  const reset=useCallback(()=>{
    particles.current=[];accumulated.current=[];
    countsRef.current={photons:0,noise:0};
    histRef.current=emptyHist();
    setPhotonCount(0);setNoiseCount(0);
    setHistogram(emptyHist());
  },[]);

  return (
    <div>
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:16, marginBottom:24, paddingBottom:20, borderBottom:`1px solid ${t.border}` }}>
        <div style={{ display:'flex', background:t.surface, border:`1px solid ${t.border}`, borderRadius:4, overflow:'hidden' }}>
          {[['EID','Conventional EID'],['PCD','Photon Counting CT']].map(([val,label])=>(
            <button key={val} onClick={()=>setMode(val)} className="ge-btn" style={{ padding:'8px 20px', fontFamily:'DM Sans, sans-serif', fontSize:11, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', background:mode===val?`linear-gradient(135deg,${GE_PURPLE} 0%,#3d0e78 100%)`:'transparent', color:mode===val?'white':t.textMuted, borderTop:'none', borderLeft:'none', borderBottom:'none', borderRight:val==='EID'?`1px solid ${t.border}`:'none' }}>{label}</button>
          ))}
        </div>

        {mode === 'PCD' && (
          <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, maxWidth:340, padding:'6px 14px', background:t.surface, border:`1px solid ${t.border}`, borderRadius:4 }}>
            <span style={{ fontFamily:'DM Mono, monospace', fontSize:9, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:AMBER_WARN, whiteSpace:'nowrap' }}>Threshold</span>
            <input type="range" min={20} max={100} step={1} value={threshold} onChange={e => { setThreshold(Number(e.target.value)); reset(); }} style={{ flex:1, accentColor:AMBER_WARN, cursor:'pointer', height:2 }} />
            <span style={{ fontFamily:'DM Mono, monospace', fontSize:11, fontWeight:500, color:AMBER_WARN, minWidth:48, textAlign:'right' }}>{threshold} keV</span>
          </div>
        )}

        <div style={{ display:'flex', gap:20, alignItems:'center' }}>
          {[{label:isPlaying?'Pause':'Play',icon:isPlaying?<Pause size={12}/>:<Play size={12}/>,fn:()=>setIsPlaying(p=>!p)},{label:'Reset',icon:<RotateCcw size={12}/>,fn:reset}].map(b=>(
            <button key={b.label} onClick={b.fn} className="ge-btn" style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'DM Sans, sans-serif', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', background:'none', border:'none', color:t.textSec }}>{b.icon}{b.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:24, alignItems:'start' }}>
        <div>
          {/* Canvas — always dark, clinical standard */}
          <div style={{ position:'relative', border:`1px solid ${t.border}`, borderRadius:'6px 6px 0 0', overflow:'hidden', background:GROUND }}>
            <canvas ref={canvasRef} width={880} height={420} style={{ width:'100%', height:'auto', display:'block' }} />
            <div style={{ position:'absolute', bottom:110, right:12, background:'rgba(14,14,16,0.92)', border:`1px solid ${BORDER_DARK}`, borderRadius:4, padding:'10px 14px', fontFamily:'DM Sans, sans-serif', fontSize:10, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', zIndex:10 }}>
              <div style={{ color:'#555568', borderBottom:`1px solid ${BORDER_DARK}`, marginBottom:8, paddingBottom:6, fontSize:9 }}>Legend</div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, color:'#c8aaff' }}><div style={{ width:8,height:8,borderRadius:'50%',background:GE_PURPLE_LIGHT,boxShadow:`0 0 6px ${GE_PURPLE}` }} />X-ray photon</div>
              <div style={{ display:'flex', alignItems:'center', gap:8, color:AMBER_WARN }}><div style={{ width:8,height:8,background:AMBER_WARN,opacity:0.7 }} />Electronic noise</div>
            </div>
            <div style={{ position:'absolute', top:12, right:12, display:'flex', alignItems:'center', gap:7, background:'rgba(14,14,16,0.92)', border:`1px solid ${BORDER_DARK}`, borderRadius:4, padding:'5px 10px' }}>
              <div style={{ width:5,height:5,borderRadius:'50%',background:isPlaying?TEAL_DATA:'#555568',animation:isPlaying?'ge-pulse 1.8s infinite':'none' }} />
              <span style={{ fontFamily:'DM Mono, monospace', fontSize:9, fontWeight:500, letterSpacing:'0.1em', color:isPlaying?TEAL_DATA:'#555568', textTransform:'uppercase' }}>{isPlaying?'Live':'Paused'}</span>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px', background:mode==='PCD'?'rgba(0,200,180,0.07)':'rgba(245,158,11,0.06)', borderLeft:`1px solid ${mode==='PCD'?'rgba(0,200,180,0.18)':'rgba(245,158,11,0.18)'}`, borderRight:`1px solid ${mode==='PCD'?'rgba(0,200,180,0.18)':'rgba(245,158,11,0.18)'}`, borderBottom:`1px solid ${mode==='PCD'?'rgba(0,200,180,0.18)':'rgba(245,158,11,0.18)'}`, transition:'all 0.3s' }}>
            <div style={{ width:5,height:5,borderRadius:'50%',background:mode==='PCD'?TEAL_DATA:AMBER_WARN,flexShrink:0 }} />
            <span style={{ fontFamily:'DM Mono, monospace', fontSize:9, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:mode==='PCD'?TEAL_DATA:AMBER_WARN }}>
              {mode==='EID'?'EID mode — noise and signal integrated indiscriminately':'PCD mode — energy threshold active · sub-threshold events rejected'}
            </span>
          </div>

          {/* Histogram + session counts */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 200px', gap:0, borderLeft:`1px solid ${t.border}`, borderRight:`1px solid ${t.border}`, borderBottom:`1px solid ${t.border}`, borderRadius:'0 0 6px 6px', overflow:'hidden' }}>
            <div style={{ background:t.surface, padding:'14px 16px', borderRight:`1px solid ${t.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ fontFamily:'DM Mono, monospace', fontSize:9, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:t.textMuted }}>Energy Histogram · 140 kVp</span>
                <span style={{ fontFamily:'DM Mono, monospace', fontSize:8, color:t.textMuted }}>5 keV bins</span>
              </div>
              {(() => {
                const RANGE = HIST_BINS * HIST_WIDTH;
                const maxTotal = Math.max(1, ...histogram.map(b => b.signal + b.noise));
                return (
                  <>
                    <div style={{ position:'relative', height:80, marginBottom:4 }}>
                      {mode === 'EID' && (
                        <div style={{ display:'flex', alignItems:'flex-end', height:'100%', gap:1.5 }}>
                          {histogram.map((bin, i) => {
                            const total  = bin.signal + bin.noise;
                            const totalH = Math.round((total / maxTotal) * 80);
                            const noiseH = Math.round((bin.noise / maxTotal) * 80);
                            if (totalH === 0) return <div key={i} style={{ flex:1 }} />;
                            return (
                              <div key={i} style={{ flex:1, height:totalH, position:'relative', borderRadius:'1px 1px 0 0', overflow:'hidden' }}>
                                <div style={{ position:'absolute', bottom:noiseH, left:0, right:0, top:0, background:'#5a4a7a', borderRadius:'1px 1px 0 0' }} />
                                {noiseH > 0 && <div style={{ position:'absolute', bottom:0, left:0, right:0, height:Math.max(noiseH,2), background:AMBER_WARN, opacity:0.75 }} />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {mode === 'PCD' && (
                        <div style={{ display:'flex', alignItems:'flex-end', height:'100%', gap:1.5 }}>
                          {histogram.map((bin, i) => {
                            const binKeV = HIST_MIN + i * HIST_WIDTH;
                            const total  = bin.signal + bin.noise;
                            const barH   = Math.round((total / maxTotal) * 80);
                            const below  = binKeV < threshold;
                            return <div key={i} style={{ flex:1, height:barH, background:below?AMBER_WARN:TEAL_DATA, opacity:below?0.6:1, borderRadius:'1px 1px 0 0', transition:'height 0.25s ease, background 0.25s ease' }} />;
                          })}
                        </div>
                      )}
                      {[{keV:58.6,label:'Kα'},{keV:67.2,label:'Kβ'}].map(l=>(
                        <div key={l.label} style={{ position:'absolute', bottom:0, top:0, left:`${(l.keV/RANGE)*100}%`, width:1, background:'rgba(139,79,216,0.4)', pointerEvents:'none' }}>
                          <div style={{ position:'absolute', bottom:2, left:2, fontFamily:'DM Mono, monospace', fontSize:6, color:'rgba(139,79,216,0.7)', whiteSpace:'nowrap' }}>W {l.label}</div>
                        </div>
                      ))}
                      {mode === 'PCD' && (
                        <div style={{ position:'absolute', bottom:0, top:0, left:`${(threshold/RANGE)*100}%`, width:1.5, background:AMBER_WARN, boxShadow:`0 0 5px ${AMBER_WARN}`, pointerEvents:'none' }}>
                          <div style={{ position:'absolute', top:0, left:4, fontFamily:'DM Mono, monospace', fontSize:7, color:AMBER_WARN, whiteSpace:'nowrap' }}>{threshold} keV</div>
                        </div>
                      )}
                      {mode === 'EID' && (
                        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:Math.max(2, Math.round((histogram.reduce((s,b)=>s+b.noise,0)/Math.max(1,histogram.reduce((s,b)=>s+b.signal+b.noise,0)))*80*0.4)), borderTop:`1px dashed rgba(245,158,11,0.4)`, pointerEvents:'none' }} />
                      )}
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      {['0','35','70','105','140 keV'].map(l=><span key={l} style={{ fontFamily:'DM Mono, monospace', fontSize:7, color:t.textMuted }}>{l}</span>)}
                    </div>
                    {mode === 'EID' ? (
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ width:12, height:8, borderRadius:1, background:'#5a4a7a', position:'relative', overflow:'hidden' }}>
                          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:AMBER_WARN, opacity:0.75 }} />
                        </div>
                        <span style={{ fontFamily:'DM Sans, sans-serif', fontSize:9, color:t.textMuted }}>Integrated signal</span>
                        <div style={{ width:8, height:8, borderRadius:1, background:AMBER_WARN, opacity:0.75, marginLeft:8 }} />
                        <span style={{ fontFamily:'DM Sans, sans-serif', fontSize:9, color:AMBER_WARN }}>Noise floor — inseparable</span>
                      </div>
                    ) : (
                      <div style={{ display:'flex', gap:12 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{ width:8,height:8,borderRadius:1,background:TEAL_DATA }} /><span style={{ fontFamily:'DM Sans, sans-serif', fontSize:9, color:t.textMuted }}>Accepted</span></div>
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{ width:8,height:8,borderRadius:1,background:AMBER_WARN,opacity:0.6 }} /><span style={{ fontFamily:'DM Sans, sans-serif', fontSize:9, color:t.textMuted }}>Rejected below {threshold} keV</span></div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div style={{ background:t.surface, padding:'14px 16px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <div style={{ fontFamily:'DM Mono, monospace', fontSize:9, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:t.textMuted, marginBottom:14 }}>Session Counts</div>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontFamily:'DM Sans, sans-serif', fontSize:10, color:t.textMuted, marginBottom:4 }}>Photons detected</div>
                <div style={{ fontFamily:'DM Mono, monospace', fontSize:22, fontWeight:500, color:GE_PURPLE_LIGHT, letterSpacing:'-0.02em' }}>{photonCount}</div>
              </div>
              {mode==='EID'
                ?<div><div style={{ fontFamily:'DM Sans, sans-serif', fontSize:10, color:t.textMuted, marginBottom:4 }}>Noise integrated</div><div style={{ fontFamily:'DM Mono, monospace', fontSize:22, fontWeight:500, color:AMBER_WARN, letterSpacing:'-0.02em' }}>{noiseCount}</div></div>
                :<div style={{ fontFamily:'DM Sans, sans-serif', fontSize:10, color:t.textMuted, fontStyle:'italic', lineHeight:1.5 }}>Noise events<br/>rejected at threshold.</div>
              }
            </div>
          </div>

          <p style={{ marginTop:10, fontSize:11, color:t.textMuted, fontFamily:'DM Sans, sans-serif', fontStyle:'italic', lineHeight:1.6 }}>
            Fig. 1 — Particle simulation. Purple glows = X-ray photons (size ∝ energy). Amber squares = electronic noise.{mode==='EID'?' Both contribute to the signal readout layer.':` Only photons above the ${threshold} keV threshold reach the readout layer.`}
          </p>
        </div>

        {/* Sidebar */}
        <div>
          <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:6, padding:'20px 18px', marginBottom:16 }}>
            <div style={{ fontFamily:'DM Sans, sans-serif', fontSize:10, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:t.textMuted, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <Activity size={12} style={{ color:GE_PURPLE_LIGHT }} /> Detector Specifications
            </div>
            <SpecRow label="Pixel pitch"            eidVal="~500 µm"       pcdVal="100–150 µm"       mode={mode} />
            <SpecRow label="Resolution (UHR mode)"  eidVal="~7 lp/mm"      pcdVal="~16 lp/mm"        mode={mode} />
            <SpecRow label="Electronic noise floor" eidVal="Present"        pcdVal="Zero"             mode={mode} />
            <SpecRow label="Energy channels"        eidVal="1 (broadband)" pcdVal="4–8 simultaneous" mode={mode} />
            <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${t.border}` }}>
              <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:10, color:t.textMuted, lineHeight:1.6 }}>Resolution at 10% MTF. Pixel pitch: NAEOTOM Alpha 100–150 µm vs. GE Revolution ~500 µm.</p>
            </div>
          </div>
          <div style={{ borderLeft:`2px solid ${GE_PURPLE}`, paddingLeft:14 }}>
            <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:13, lineHeight:1.65, color:t.textSec, fontStyle:'italic' }}>"PCD-CT counts individual photons like a Geiger counter — not a light meter."</p>
            <span style={{ fontFamily:'DM Sans, sans-serif', fontSize:10, color:t.textMuted, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginTop:6, display:'block' }}>Nature Reviews Radiology, 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── 02 · SPECTRAL DECOMPOSITION ─────────────────────────────────────────────
const SpectralViz = () => {
  const t = useTheme();
  const [active, setActive] = useState('composite');
  const layers = [
    { id:'composite', label:'Composite',      sub:'Full spectrum — all energies',       color:t.textSec,       desc:'Conventional CT collapses all photon energies into a single greyscale Hounsfield scale. Bone, iodine, and soft tissue share the same readout channel.' },
    { id:'bone',      label:'Calcium / Bone', sub:'High-energy bins · 80–140 keV',      color:'#60a5fa',       desc:"Above ~80 keV, photoelectric absorption preferentially captures calcium's signature. Bone structures and calcified plaques are extracted cleanly from soft tissue." },
    { id:'iodine',    label:'Iodine K-edge',  sub:'Contrast agent · K-edge 33.2 keV',   color:GE_PURPLE_LIGHT, desc:"Iodine's K-edge at 33.2 keV creates a sharp attenuation jump. PCD-CT straddles this threshold to isolate contrast-filled vessels — enabling virtual non-contrast reconstructions without a second scan." },
    { id:'fat',       label:'Fat / Water',    sub:'Low-energy separation · 40–60 keV',  color:TEAL_DATA,       desc:'Hydrogen-rich lipids and free water diverge at low energies, enabling non-invasive fat quantification and precise tissue characterisation for oncology staging.' },
  ];
  const cur = layers.find(l=>l.id===active);
  // SVG cross-section — always dark (clinical scan aesthetic)
  const cols = {
    composite:{ body:'#1e1e28', spine:'#2a2a38', organs:'#252530', aorta:'#333345' },
    bone:     { body:'rgba(30,30,40,0.4)', spine:'#1d3f8a', organs:'rgba(37,37,48,0.3)', aorta:'rgba(51,51,69,0.3)' },
    iodine:   { body:'rgba(30,30,40,0.3)', spine:'rgba(42,42,56,0.3)', organs:'rgba(37,37,48,0.4)', aorta:GE_PURPLE },
    fat:      { body:'rgba(30,30,40,0.3)', spine:'rgba(42,42,56,0.3)', organs:TEAL_DATA, aorta:'rgba(51,51,69,0.3)' },
  };
  const c = cols[active];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48 }}>
      <div>
        <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:15, lineHeight:1.72, color:t.textSec, marginBottom:28, fontWeight:300 }}>PCD-CT sorts photons into simultaneous energy bins — like a prism splitting white light. Each bin reveals tissue chemistry invisible to conventional CT.</p>
        <div style={{ border:`1px solid ${t.border}`, borderRadius:6, overflow:'hidden' }}>
          {layers.map(l=>(
            <button key={l.id} onClick={()=>setActive(l.id)} className="ge-btn" style={{ display:'block', width:'100%', textAlign:'left', padding:'14px 18px', background:active===l.id?t.surface2:t.surface, borderTop:'none', borderRight:'none', borderLeft:`3px solid ${active===l.id?l.color:'transparent'}`, borderBottom:`1px solid ${t.border}`, transition:'all 0.2s' }}>
              <span style={{ display:'block', fontFamily:'DM Sans, sans-serif', fontWeight:600, fontSize:12, color:active===l.id?l.color:t.textSec, marginBottom:3 }}>{l.label}</span>
              <span style={{ display:'block', fontFamily:'DM Sans, sans-serif', fontSize:11, color:t.textMuted, fontStyle:'italic' }}>{l.sub}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop:20, padding:'16px 18px', background:t.surface, borderLeft:`3px solid ${cur.color}`, borderRadius:'0 4px 4px 0', transition:'border-color 0.4s, background 0.3s' }}>
          <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:13, lineHeight:1.72, color:t.textSec, fontWeight:300 }}>{cur.desc}</p>
        </div>
      </div>
      <div>
        <div style={{ background:SURFACE, border:`1px solid ${BORDER_DARK}`, borderRadius:6, padding:16, marginBottom:8 }}>
          <svg viewBox="0 0 280 280" style={{ width:'100%', maxWidth:280 }}>
            <rect width="280" height="280" fill={SURFACE} />
            <rect x="1" y="1" width="278" height="278" fill="none" stroke={BORDER_DARK} strokeWidth="1" />
            {Array.from({length:14}).map((_,i)=><line key={i} x1="0" y1={i*20} x2="280" y2={i*20} stroke={BORDER_DARK} strokeWidth="0.4" />)}
            <ellipse cx="140" cy="140" rx="116" ry="106" fill={c.body} stroke={BORDER_MID} strokeWidth="1" style={{transition:'fill 0.4s'}} />
            {active==='fat'&&<ellipse cx="140" cy="140" rx="104" ry="94" fill="none" stroke={TEAL_DATA} strokeWidth="6" strokeDasharray="5 3" opacity="0.5" />}
            <circle cx="90" cy="125" r="27" fill={active==='fat'?'rgba(0,200,180,0.22)':c.organs} stroke={BORDER_MID} strokeWidth="0.5" style={{transition:'fill 0.4s'}} />
            <circle cx="192" cy="120" r="23" fill={active==='fat'?'rgba(0,200,180,0.22)':c.organs} stroke={BORDER_MID} strokeWidth="0.5" style={{transition:'fill 0.4s'}} />
            <ellipse cx="140" cy="152" rx="22" ry="20" fill={c.spine} stroke={active==='bone'?'#60a5fa':BORDER_MID} strokeWidth={active==='bone'?1.5:0.5} style={{transition:'all 0.4s'}} />
            {active==='bone'&&Array.from({length:4}).map((_,i)=><ellipse key={i} cx="140" cy="140" rx={78-i*12} ry={68-i*10} fill="none" stroke="#60a5fa" strokeWidth="2" opacity={0.2+i*0.08} strokeDasharray="6 4" />)}
            <ellipse cx="140" cy="108" rx="13" ry="11" fill={c.aorta} stroke={active==='iodine'?GE_PURPLE_LIGHT:BORDER_MID} strokeWidth={active==='iodine'?2:0.5} style={{transition:'all 0.4s'}} />
            {active==='iodine'&&<ellipse cx="140" cy="108" rx="13" ry="11" fill="none" stroke={GE_PURPLE_LIGHT} strokeWidth="6" opacity="0.2" />}
            <rect x="182" y="8" width="90" height="20" rx="2" fill={cur.color} opacity="0.9" />
            <text x="227" y="22" fill={GROUND} fontSize="7.5" fontFamily="DM Mono, monospace" fontWeight="600" textAnchor="middle" letterSpacing="0.08em">{active==='composite'?'ALL ENERGIES':active==='bone'?'80–140 keV':active==='iodine'?'33 keV K-EDGE':'40–60 keV'}</text>
            <text x="8" y="274" fill="#555568" fontSize="7" fontFamily="DM Mono, monospace" fontWeight="500" letterSpacing="0.06em">AXIAL VIEW · {active.toUpperCase()} CHANNEL</text>
          </svg>
        </div>
        <p style={{ fontSize:11, fontFamily:'DM Sans, sans-serif', fontStyle:'italic', color:t.textMuted, marginBottom:20 }}>Fig. 2 — Simulated axial cross-section. Active channel highlighted.</p>
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:6, padding:'16px' }}>
          <div style={{ fontFamily:'DM Mono, monospace', fontSize:9, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:t.textMuted, marginBottom:12 }}>Photon Count Spectrum (keV)</div>
          <div style={{ display:'flex', alignItems:'flex-end', height:52, gap:2 }}>
            {Array.from({length:24}).map((_,i)=>{
              const keV=i*5+20;
              const isAct=active==='composite'?true:active==='bone'?keV>=80:active==='iodine'?(keV>=30&&keV<=40):(keV>=40&&keV<=60);
              const h=Math.max(5,Math.round(32*Math.exp(-((keV-58)**2)/1600)+7));
              return <div key={i} style={{ flex:1,height:h,background:isAct?cur.color:t.borderMid,opacity:isAct?1:0.3,transition:'all 0.4s',borderRadius:'1px 1px 0 0',minWidth:4 }} />;
            })}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
            <span style={{ fontSize:9, fontFamily:'DM Mono, monospace', color:t.textMuted }}>20 keV</span>
            <span style={{ fontSize:9, fontFamily:'DM Mono, monospace', color:t.textMuted }}>140 keV</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── 03 · DEEP SILICON ARCHITECTURE (button-triggered animation) ──────────────
const DeepSiliconSection = () => {
  const t = useTheme();
  const [progress, setProgress] = useState(0);
  const [running,  setRunning]  = useState(false);
  const rafRef    = useRef(null);
  const startRef  = useRef(null);
  const DURATION  = 4200; // ms for full 62mm traversal

  const fire = () => {
    if (running) return;
    setProgress(0);
    setRunning(true);
    startRef.current = null;
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pv = Math.min(elapsed / DURATION, 1);
      setProgress(pv);
      if (pv < 1) rafRef.current = requestAnimationFrame(step);
      else setRunning(false);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setProgress(0);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const pv = progress;

  return (
    <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:8, overflow:'hidden' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
        <div style={{ borderRight:`1px solid ${t.border}`, display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'20px 24px 16px', background: t.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)', borderBottom:`1px solid ${t.border}`, flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontFamily:'DM Mono, monospace', fontSize:9, fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase', color:GE_PURPLE_LIGHT }}>Interaction Trace</span>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={fire} disabled={running} className="ge-btn" style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 14px', background:running?'rgba(96,34,166,0.15)':`linear-gradient(135deg,${GE_PURPLE} 0%,#3d0e78 100%)`, border:`1px solid ${running?t.borderMid:GE_PURPLE}`, borderRadius:4, color:running?t.textMuted:'white', fontFamily:'DM Mono, monospace', fontSize:9, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', opacity:running?0.5:1 }}>
                  <Zap size={10} /> {running ? 'Running…' : 'Fire Photon'}
                </button>
                <button onClick={reset} className="ge-btn" style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:'transparent', border:`1px solid ${t.border}`, borderRadius:4, color:t.textMuted, fontFamily:'DM Mono, monospace', fontSize:9, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  <RotateCcw size={9} /> Reset
                </button>
              </div>
            </div>
            <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:11, color:t.textMuted }}>Fire a photon through both detectors — compare absorption depth and K-fluorescence scatter.</p>
          </div>

          {/* Static-height trace panel — no scroll needed */}
          <div style={{ flex:1, overflowY:'hidden', overflowX:'hidden', padding:'24px 32px', position:'relative', minHeight:380 }}>
            {/* Fixed-height columns — proportional to actual detector depths */}
            <div style={{ display:'flex', gap:40, justifyContent:'center', height:'100%', alignItems:'stretch' }}>

              {/* CdTe column — animates fast (2mm ≈ 3% of Si path), then K-fluorescence scatter */}
              <div style={{ width:88, display:'flex', flexDirection:'column', alignItems:'center' }}>
                <span style={{ fontFamily:'DM Mono, monospace', fontSize:9, fontWeight:500, color:AMBER_WARN, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>CdTe</span>
                <div style={{ flex:1, width:'100%', background:'rgba(245,158,11,0.04)', border:`1px solid rgba(245,158,11,0.25)`, borderRadius:6, position:'relative', overflow:'hidden', minHeight:380 }}>
                  {/* Lattice grid — matches purple grid size and translucency */}
                  <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(245,158,11,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.07) 1px,transparent 1px)', backgroundSize:'18px 18px', pointerEvents:'none' }} />
                  {/* CdTe fills only top 3.2% (2mm/62mm) of column — beam completes at that mark */}
                  {(() => {
                    const cdteEnd = 0.032; // 2mm as fraction of 62mm column height
                    const cdtePv = Math.min(pv / cdteEnd, 1); // 0→1 over first 3.2% of animation
                    const scattered = pv > cdteEnd;
                    return (
                      <>
                        {/* Absorption zone highlight */}
                        <div style={{ position:'absolute', top:0, left:0, right:0, height:'3.2%', background:'rgba(245,158,11,0.08)', borderBottom:`1px dashed rgba(245,158,11,0.3)` }} />
                        <div style={{ position:'absolute', top:'3.2%', right:4, fontFamily:'DM Mono, monospace', fontSize:7, color:'rgba(245,158,11,0.4)', marginTop:2 }}>2mm limit</div>

                        {/* Beam trace — only within absorption zone */}
                        {pv > 0 && (
                          <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:2, background:`linear-gradient(to bottom,${AMBER_WARN},rgba(245,158,11,0.4))`, boxShadow:`0 0 10px ${AMBER_WARN}`, height:`${Math.min(cdtePv * 3.2, 3.2)}%`, borderRadius:1, transition:'height 0.04s linear' }} />
                        )}

                        {/* Photon head — travels fast, stops at 2mm mark */}
                        {pv > 0 && !scattered && (
                          <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', top:`${cdtePv * 3.2}%`, marginTop:-8, zIndex:10, pointerEvents:'none' }}>
                            <div style={{ width:14, height:14, borderRadius:'50%', background:'white', boxShadow:`0 0 20px 5px ${AMBER_WARN}` }} />
                          </div>
                        )}

                        {/* K-fluorescence scatter — rays burst from absorption point */}
                        {scattered && (
                          <>
                            {/* Central absorbed dot */}
                            <div style={{ position:'absolute', left:'50%', top:'3.2%', transform:'translate(-50%,-50%)', width:10, height:10, borderRadius:'50%', background:AMBER_WARN, boxShadow:`0 0 16px 4px ${AMBER_WARN}`, zIndex:10 }} />
                            {/* Scatter rays at various angles */}
                            {[30,75,110,150,200,250,300,340].map((deg,i)=>{
                              const rad = deg * Math.PI / 180;
                              const len = 30 + (i%3)*18;
                              const x2 = Math.cos(rad)*len;
                              const y2 = Math.sin(rad)*len;
                              const age = Math.min((pv - cdteEnd) / 0.12, 1);
                              return (
                                <div key={deg} style={{ position:'absolute', left:'50%', top:'3.2%', transform:'translate(-50%,-50%)', pointerEvents:'none', zIndex:9 }}>
                                  <svg width={len*2+10} height={len*2+10} style={{ position:'absolute', left:-(len+5), top:-(len+5), overflow:'visible' }}>
                                    <line
                                      x1={len+5} y1={len+5}
                                      x2={len+5+x2*age} y2={len+5+y2*age}
                                      stroke={AMBER_WARN} strokeWidth="1.5"
                                      strokeOpacity={0.6 * (1 - age * 0.3)}
                                      strokeDasharray="3 2"
                                    />
                                    {age > 0.8 && (
                                      <circle
                                        cx={len+5+x2*age} cy={len+5+y2*age} r="3"
                                        fill={AMBER_WARN} opacity={0.5}
                                      />
                                    )}
                                  </svg>
                                </div>
                              );
                            })}
                            {/* Escape label */}
                            <div style={{ position:'absolute', top:'12%', left:'50%', transform:'translateX(-50%)', textAlign:'center', whiteSpace:'nowrap' }}>
                              <div style={{ fontFamily:'DM Mono, monospace', fontSize:7, color:AMBER_WARN, opacity:0.8 }}>K-fluorescence</div>
                              <div style={{ fontFamily:'DM Mono, monospace', fontSize:7, color:t.textMuted, marginTop:1 }}>escape photons</div>
                            </div>
                          </>
                        )}

                        {/* Depth marker at 2mm */}
                        <div style={{ position:'absolute', left:0, top:'3.2%', width:'100%', display:'flex', alignItems:'center', gap:4, paddingRight:4 }}>
                          <div style={{ flex:1, borderTop:`1px dashed rgba(245,158,11,0.3)` }} />
                          <span style={{ fontFamily:'DM Mono, monospace', fontSize:7, color:'rgba(245,158,11,0.5)', whiteSpace:'nowrap' }}>2mm</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div style={{ marginTop:8, padding:'5px 8px', background:'rgba(245,158,11,0.05)', border:`1px solid rgba(245,158,11,0.2)`, borderRadius:4, textAlign:'center' }}>
                  <div style={{ fontFamily:'DM Mono, monospace', fontSize:8, color:AMBER_WARN }}>2 mm</div>
                  <div style={{ fontFamily:'DM Mono, monospace', fontSize:7, color:t.textMuted, marginTop:2 }}>K-fluor. escape</div>
                </div>
              </div>

              {/* Deep Silicon column — 62mm, fills remaining height */}
              <div style={{ width:88, display:'flex', flexDirection:'column', alignItems:'center', flex:1, maxWidth:88, alignSelf:'stretch' }}>
                <span style={{ fontFamily:'DM Mono, monospace', fontSize:9, fontWeight:500, color:GE_PURPLE_LIGHT, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Deep Si</span>
                <div style={{ flex:1, width:'100%', background:'rgba(96,34,166,0.04)', border:`1px solid rgba(96,34,166,0.2)`, borderRadius:6, position:'relative', overflow:'hidden' }}>
                  {/* Lattice grid */}
                  <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(96,34,166,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(96,34,166,0.07) 1px,transparent 1px)', backgroundSize:'18px 18px', pointerEvents:'none' }} />
                  {/* Beam trace */}
                  <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:2, background:`linear-gradient(to bottom,${GE_PURPLE_LIGHT},${TEAL_DATA})`, boxShadow:`0 0 10px ${GE_PURPLE}`, height:`${pv*100}%`, borderRadius:1, transition:'height 0.04s linear' }} />
                  {/* Photon head */}
                  {pv > 0 && pv < 1 && (
                    <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', top:`${pv*100}%`, marginTop:-8, zIndex:10, pointerEvents:'none' }}>
                      <div style={{ width:14, height:14, borderRadius:'50%', background:'white', boxShadow:'0 0 20px 5px white' }} />
                    </div>
                  )}
                  {/* Interaction sparks */}
                  {Array.from({length:20}).map((_,i)=>(
                    <div key={i} style={{ position:'absolute', left:'50%', top:`${(i/20)*100}%`, marginLeft:i%2===0?12:-18, opacity:pv>(i/20)?1:0, transition:'opacity 0.15s', pointerEvents:'none' }}>
                      <div style={{ width:5, height:5, borderRadius:'50%', background:TEAL_DATA, boxShadow:`0 0 6px ${TEAL_DATA}`, animation:pv>(i/20)?'ge-pulse 1.2s infinite':'none' }} />
                    </div>
                  ))}
                  {/* Depth markers */}
                  {[10,20,30,40,50,60].map(mm=>(
                    <div key={mm} style={{ position:'absolute', left:0, top:`${(mm/62)*100}%`, width:'100%', display:'flex', alignItems:'center', gap:4, paddingRight:4 }}>
                      <div style={{ flex:1, borderTop:`1px dashed rgba(96,34,166,0.2)` }} />
                      <span style={{ fontFamily:'DM Mono, monospace', fontSize:7, color:'rgba(139,79,216,0.5)', whiteSpace:'nowrap' }}>{mm}mm</span>
                    </div>
                  ))}
                  {/* Completion glow at bottom */}
                  {pv >= 1 && (
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:24, background:`linear-gradient(to top,rgba(0,200,180,0.3),transparent)` }} />
                  )}
                </div>
                <div style={{ marginTop:8, padding:'5px 8px', background:'rgba(96,34,166,0.06)', border:`1px solid rgba(96,34,166,0.2)`, borderRadius:4, textAlign:'center' }}>
                  <div style={{ fontFamily:'DM Mono, monospace', fontSize:8, color:GE_PURPLE_LIGHT }}>62 mm</div>
                  <div style={{ fontFamily:'DM Mono, monospace', fontSize:7, color:t.textMuted, marginTop:2 }}>full absorption</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer counter */}
          <div style={{ padding:'14px 24px', background: t.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.05)', borderTop:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div>
              <div style={{ fontFamily:'DM Mono, monospace', fontSize:22, fontWeight:500, color: pv>=1 ? TEAL_DATA : GE_PURPLE_LIGHT, letterSpacing:'-0.02em', transition:'color 0.4s' }}>{Math.round(pv*62)}mm</div>
              <div style={{ fontFamily:'DM Mono, monospace', fontSize:8, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.12em' }}>
                {pv >= 1 ? 'Full absorption — signal captured' : pv > 0 ? 'Penetration depth' : 'Awaiting photon'}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:'DM Sans, sans-serif', fontSize:10, fontWeight:600, color: pv>=1 ? TEAL_DATA : t.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', transition:'color 0.4s' }}>
                {pv >= 1 ? '✦ Detection Complete' : 'Direct Signal Conversion'}
              </div>
              <div style={{ fontFamily:'DM Mono, monospace', fontSize:8, color:GE_PURPLE_LIGHT, marginTop:2, letterSpacing:'0.08em' }}>11N Electronic Purity</div>
            </div>
          </div>
        </div>

        {/* RIGHT — context panels */}
        <div style={{ padding:'32px', overflowY:'auto', display:'flex', flexDirection:'column', gap:28 }}>
          <div>
            <h2 style={{ fontFamily:'DM Sans, sans-serif', fontSize:28, fontWeight:700, color:t.text, lineHeight:1.15, letterSpacing:'-0.02em', marginBottom:16 }}>
              Solving the<br /><span style={{ color:GE_PURPLE_LIGHT }}>Density Gap</span>
            </h2>
            <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:14, lineHeight:1.75, color:t.textSec, fontWeight:300 }}>
              Cadmium Telluride (Z=48) stops photons quickly in just 2mm but suffers K-fluorescence escape — where secondary X-rays degrade spatial resolution. Silicon (Z=14) is lighter, so it uses an edge-on geometry with a 60mm absorption path — 30× longer — achieving equivalent stopping power without the fluorescence penalty.
            </p>
          </div>

          {[
            { icon:<Target size={18}/>, color:'rgba(96,34,166,0.15)', iconColor:GE_PURPLE_LIGHT, title:'Zero Pulse Pile-up', body:"Silicon's charge collection speed handles photon fluxes exceeding 500 million counts per second per mm² — far beyond what CdTe can sustain at clinical CT rates." },
            { icon:<Zap size={18}/>, color:'rgba(0,200,180,0.08)', iconColor:TEAL_DATA, title:'11N Lattice Purity', body:'Eleven-nines purity (99.999999999%) means fewer crystal defects, lower dark current, and identical signal response across every pixel in the detector array.' },
            { icon:<Factory size={18}/>, color: t.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', iconColor:t.textSec, title:'300mm Industrial Scale', body:"Silicon fabrication leverages the global 300mm semiconductor supply chain — the same infrastructure behind consumer processors — providing cost trajectory and yield stability that CdTe's manual crystal growth cannot match." },
          ].map((card,i)=>(
            <div key={i} style={{ padding:'20px', background:card.color, border:`1px solid ${t.border}`, borderRadius:8, display:'flex', gap:16, alignItems:'flex-start' }}>
              <div style={{ width:36, height:36, borderRadius:8, background: t.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:card.iconColor }}>{card.icon}</div>
              <div>
                <div style={{ fontFamily:'DM Sans, sans-serif', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:card.iconColor, marginBottom:6 }}>{card.title}</div>
                <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:12, color:t.textMuted, lineHeight:1.65, fontWeight:300 }}>{card.body}</p>
              </div>
            </div>
          ))}

          <div style={{ background: t.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)', border:`1px solid ${t.border}`, borderRadius:8, padding:'20px' }}>
            <div style={{ fontFamily:'DM Mono, monospace', fontSize:9, color:t.textMuted, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:16 }}>Material Purity</div>
            {[
              { label:'Silicon lattice (11N)',  pct:100, val:'99.999999999%', color:GE_PURPLE_LIGHT },
              { label:'CdTe compound (~4N)',    pct:42,  val:'~99.99%',       color:AMBER_WARN },
            ].map(b=>(
              <div key={b.label} style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontFamily:'DM Sans, sans-serif', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:t.textMuted }}>{b.label}</span>
                  <span style={{ fontFamily:'DM Mono, monospace', fontSize:11, color:b.color }}>{b.val}</span>
                </div>
                <div style={{ height:2, background:t.border, borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${b.pct}%`, background:b.color, borderRadius:2 }} />
                </div>
              </div>
            ))}
            
            {/* N-Notation Legend */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px dashed ${t.border}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <div style={{ width:12, height:12, borderRadius:'50%', background:GE_PURPLE_LIGHT, opacity:0.2, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ width:4, height:4, borderRadius:'50%', background:GE_PURPLE_LIGHT }} />
                </div>
                <div style={{ fontFamily:'DM Mono, monospace', fontSize:8, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em' }}>The "N" Purity Scale</div>
              </div>
              
              <div style={{ display:'flex', justifyContent:'space-between', gap:4, marginBottom:16 }}>
                {[1, 2, 3, 4, 11].map((n, idx) => (
                  <div key={n} style={{ flex:1, textAlign:'center', position:'relative' }}>
                    <div style={{ fontFamily:'DM Mono, monospace', fontSize:11, fontWeight:600, color: n === 11 ? GE_PURPLE_LIGHT : t.textSec, marginBottom:4 }}>{n}N</div>
                    <div style={{ height:4, background: n === 11 ? GE_PURPLE_LIGHT : t.border, borderRadius:2, opacity: n === 11 ? 1 : 0.4, marginBottom:6 }} />
                    <div style={{ fontFamily:'DM Mono, monospace', fontSize:7, color:t.textMuted, whiteSpace:'nowrap' }}>
                      {n === 1 ? '90%' : n === 11 ? '99.9...%' : n === 2 ? '99%' : `99.${'9'.repeat(n-2)}%`}
                    </div>
                    {idx < 4 && (
                      <div style={{ position:'absolute', top:18, right:-2, color:t.border, fontSize:8 }}>·</div>
                    )}
                  </div>
                ))}
              </div>

              <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:10, color:t.textMuted, lineHeight:1.6, margin:0, fontWeight:300 }}>
                In materials science, <strong style={{ color:t.textSec }}>"N"</strong> is shorthand for the number of nines in the percentage. Each additional "N" represents a <strong style={{ color:GE_PURPLE_LIGHT }}>10× reduction</strong> in impurities. 11N silicon is nearly perfect — essentially one foreign atom per 100 billion.
              </p>
            </div>

            <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:10, color:t.textMuted, lineHeight:1.6, marginTop:16, opacity:0.6 }}>
              Note: Purity bar is illustrative of the orders-of-magnitude difference (7 nines vs 4 nines). Not linearly proportional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── K-FLUORESCENCE EXPLAINER ─────────────────────────────────────────────────
const KFluorescenceSection = () => {
  const t = useTheme();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [maximized, setMaximized] = useState(null); // 'blur' | 'spectrum' | null
  const timerRef = useRef(null);

  const steps = [
    {
      id: 0,
      label: 'X-ray enters CdTe',
      short: 'Photon enters',
      desc: 'An X-ray photon from the CT beam enters the CdTe detector. Because CdTe has a high atomic number (Cd: Z=48, Te: Z=52), it\'s very good at stopping photons — that\'s why it\'s used.',
      color: GE_PURPLE_LIGHT,
    },
    {
      id: 1,
      label: 'Photoelectric absorption',
      short: 'Absorbed',
      desc: 'The photon is absorbed by a cadmium or tellurium atom. The atom\'s energy is released as a cloud of electrons — this is the signal we want. So far, so good.',
      color: TEAL_DATA,
    },
    {
      id: 2,
      label: 'Characteristic X-ray emitted',
      short: 'Ghost photon born',
      desc: 'Here\'s the problem. When the atom is ionised, it releases a secondary "characteristic" X-ray — a K-fluorescence photon. For CdTe, this ghost photon has ~23–27 keV of energy. It travels a few millimetres before being absorbed again.',
      color: AMBER_WARN,
    },
    {
      id: 3,
      label: 'Ghost photon mis-registered',
      short: 'Wrong address',
      desc: 'The ghost photon lands in a neighbouring pixel — perhaps 1–3mm away. That pixel now registers a false event at the wrong location and wrong energy. The detector can\'t tell the difference. Result: spatial blur and energy smearing across the image.',
      color: '#f87171',
    },
  ];

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep(s => { if (s >= 3) { setPlaying(false); return 3; } return s + 1; });
      }, 1800);
    }
    return () => clearInterval(timerRef.current);
  }, [playing]);

  const cur = steps[step];

  // ── Animated SVG diagram ────────────────────────────────────────────────────
  const Diagram = () => {
    const W = 420, H = 260;
    const detX = 80, detW = 260, detH = 160, detY = 50;
    const photonX = 30, photonY = detY + 50;
    const absX = detX + 60, absY = detY + 50;
    const ghostEndX = absX + 110, ghostEndY = detY + 110;

    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', maxWidth:440, display:'block' }}>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171" />
          </marker>
        </defs>
        {/* Background */}
        <rect width={W} height={H} fill={SURFACE} rx="6" />

        {/* Detector body */}
        <rect x={detX} y={detY} width={detW} height={detH} fill="rgba(245,158,11,0.05)" stroke="rgba(245,158,11,0.3)" strokeWidth="1" rx="4" />

        {/* Lattice grid inside detector */}
        {Array.from({length:13}).map((_,i)=>(
          <line key={`v${i}`} x1={detX+i*22} y1={detY} x2={detX+i*22} y2={detY+detH} stroke="rgba(245,158,11,0.07)" strokeWidth="0.5" />
        ))}
        {Array.from({length:8}).map((_,i)=>(
          <line key={`h${i}`} x1={detX} y1={detY+i*22} x2={detX+detW} y2={detY+i*22} stroke="rgba(245,158,11,0.07)" strokeWidth="0.5" />
        ))}

        {/* Pixel grid lines (coarser) */}
        {[0,1,2,3].map(i=>(
          <rect key={i} x={detX + i*65} y={detY} width={65} height={detH} fill="none" stroke="rgba(245,158,11,0.2)" strokeWidth="1" />
        ))}

        {/* Detector label */}
        <text x={detX+detW/2} y={detY+detH+16} textAnchor="middle" fill="rgba(245,158,11,0.5)" fontSize="8" fontFamily="DM Mono, monospace" letterSpacing="0.1em">CdTe DETECTOR  ·  PIXEL ARRAY</text>

        {/* STEP 0+: Incoming photon */}
        {step >= 0 && (
          <>
            <line x1={photonX} y1={photonY} x2={step===0?absX-10:absX} y2={photonY} stroke={GE_PURPLE_LIGHT} strokeWidth="2" />
            <circle cx={step===0?absX-14:absX} cy={photonY} r="6" fill="white" style={{ filter:`drop-shadow(0 0 6px ${GE_PURPLE_LIGHT})` }} />
            <text x={photonX} y={photonY-10} fill={GE_PURPLE_LIGHT} fontSize="7" fontFamily="DM Mono, monospace" letterSpacing="0.08em">X-RAY PHOTON</text>
          </>
        )}

        {/* STEP 1+: Absorption event */}
        {step >= 1 && (
          <>
            {/* Absorption burst */}
            {[0,45,90,135,180,225,270,315].map((deg,i)=>{
              const r = deg*Math.PI/180;
              const len = 14 + (i%2)*6;
              return <line key={deg} x1={absX} y1={absY} x2={absX+Math.cos(r)*len} y2={absY+Math.sin(r)*len} stroke={TEAL_DATA} strokeWidth="1.5" opacity="0.7" />;
            })}
            <circle cx={absX} cy={absY} r="7" fill={TEAL_DATA} opacity="0.9" style={{ filter:`drop-shadow(0 0 8px ${TEAL_DATA})` }} />
            <text x={absX+2} y={absY-22} fill={TEAL_DATA} fontSize="7" fontFamily="DM Mono, monospace" letterSpacing="0.06em">ABSORBED</text>
            <text x={absX+2} y={absY-13} fill={TEAL_DATA} fontSize="7" fontFamily="DM Mono, monospace" opacity="0.7">(signal electrons)</text>
          </>
        )}

        {/* STEP 2+: K-fluorescence ghost photon path */}
        {step >= 2 && (
          <>
            <line x1={absX} y1={absY} x2={step===2?absX+70:ghostEndX} y2={step===2?absY+40:ghostEndY}
              stroke={AMBER_WARN} strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx={step===2?absX+72:ghostEndX} cy={step===2?absY+42:ghostEndY} r="5"
              fill={AMBER_WARN} opacity="0.9" style={{ filter:`drop-shadow(0 0 8px ${AMBER_WARN})` }} />
            <text x={absX+20} y={absY+30} fill={AMBER_WARN} fontSize="7" fontFamily="DM Mono, monospace" letterSpacing="0.06em">K-FLUORESCENCE</text>
            <text x={absX+20} y={absY+40} fill={AMBER_WARN} fontSize="7" fontFamily="DM Mono, monospace" opacity="0.7">(~26 keV ghost)</text>
          </>
        )}

        {/* STEP 3: Wrong pixel registration */}
        {step >= 3 && (
          <>
            {/* Wrong pixel highlight */}
            <rect x={detX+130} y={detY} width={65} height={detH} fill="rgba(248,113,113,0.12)" stroke="#f87171" strokeWidth="1.5" rx="1" />
            <text x={detX+130+32} y={detY+detH/2-6} textAnchor="middle" fill="#f87171" fontSize="8" fontFamily="DM Mono, monospace">WRONG</text>
            <text x={detX+130+32} y={detY+detH/2+6} textAnchor="middle" fill="#f87171" fontSize="8" fontFamily="DM Mono, monospace">PIXEL</text>

            {/* Correct pixel */}
            <rect x={detX+65} y={detY} width={65} height={detH} fill="rgba(0,200,180,0.08)" stroke={TEAL_DATA} strokeWidth="1" strokeDasharray="3 2" rx="1" />
            <text x={detX+65+32} y={detY+detH/2} textAnchor="middle" fill={TEAL_DATA} fontSize="7" fontFamily="DM Mono, monospace">TRUE ORIGIN</text>

            {/* Offset annotation */}
            <line x1={absX} y1={detY+detH+28} x2={ghostEndX} y2={detY+detH+28} stroke="#f87171" strokeWidth="1" markerEnd="url(#arr)" />
            <line x1={absX} y1={detY+detH+24} x2={absX} y2={detY+detH+32} stroke="#f87171" strokeWidth="1" />
            <line x1={ghostEndX} y1={detY+detH+24} x2={ghostEndX} y2={detY+detH+32} stroke="#f87171" strokeWidth="1" />
            <text x={(absX+ghostEndX)/2} y={detY+detH+40} textAnchor="middle" fill="#f87171" fontSize="7" fontFamily="DM Mono, monospace">~1–3 mm mis-registration</text>
          </>
        )}

        {/* Step indicator dots */}
        {steps.map((s,i)=>(
          <circle key={i} cx={W/2 - 30 + i*20} cy={H-12} r="4"
            fill={i<=step ? s.color : 'rgba(255,255,255,0.1)'}
            style={{ transition:'fill 0.3s' }} />
        ))}
      </svg>
    );
  };

  // ── Consequence diagram: blur ────────────────────────────────────────────────
  const BlurDiagram = () => (
    <svg viewBox="0 0 320 180" style={{ width:'100%', maxWidth:320, display:'block' }}>
      <rect width="320" height="180" fill={SURFACE} rx="6" />

      {/* True signal */}
      <text x="70" y="20" textAnchor="middle" fill={TEAL_DATA} fontSize="8" fontFamily="DM Mono, monospace" letterSpacing="0.06em">TRUE SIGNAL</text>
      {[0,1,2,3,4,5,6].map(i=>{
        const heights = [4,8,14,40,14,8,4];
        const h = heights[i];
        return <rect key={i} x={36+i*12} y={130-h} width={10} height={h} fill={TEAL_DATA} opacity="0.9" rx="1" />;
      })}
      <text x="70" y="148" textAnchor="middle" fill={t.textMuted} fontSize="7" fontFamily="DM Mono, monospace">Sharp · correct position</text>

      {/* Divider */}
      <line x1="160" y1="10" x2="160" y2="170" stroke={t.border} strokeWidth="1" strokeDasharray="4 3" />

      {/* Blurred signal (after K-escape) */}
      <text x="245" y="20" textAnchor="middle" fill={AMBER_WARN} fontSize="8" fontFamily="DM Mono, monospace" letterSpacing="0.06em">AFTER K-ESCAPE</text>
      {[0,1,2,3,4,5,6,7,8,9,10].map(i=>{
        const heights = [2,3,5,8,14,22,24,18,11,6,3];
        const h = heights[i];
        return <rect key={i} x={188+i*10} y={130-h} width={8} height={h}
          fill={i>=3&&i<=7?AMBER_WARN:GE_PURPLE_LIGHT} opacity={i>=3&&i<=7?0.6:0.4} rx="1" />;
      })}
      <text x="245" y="148" textAnchor="middle" fill={t.textMuted} fontSize="7" fontFamily="DM Mono, monospace">Blurred + ghost counts</text>

      {/* Labels */}
      <text x="70" y="168" textAnchor="middle" fill={t.textMuted} fontSize="6" fontFamily="DM Mono, monospace">(Silicon — no K-escape)</text>
      <text x="245" y="168" textAnchor="middle" fill={t.textMuted} fontSize="6" fontFamily="DM Mono, monospace">(CdTe — ghost pixels)</text>
    </svg>
  );

  // ── Energy spectrum artifact ─────────────────────────────────────────────────
  const EscapePeakChart = () => {
    // Simplified spectrum showing true peak and K-escape artifact peak
    const bars = Array.from({length:30}).map((_,i)=>{
      const keV = i*3+20;
      // True bremsstrahlung-like peak around 60 keV
      const signal = Math.max(0, 28*Math.exp(-((keV-62)**2)/300) + 6*Math.exp(-((keV-59)**2)/8));
      // K-escape artifact: shifted ~26 keV lower (Cd K-edge ~26 keV)
      const escape = Math.max(0, 8*Math.exp(-((keV-36)**2)/40));
      return { keV, signal, escape };
    });
    const maxVal = Math.max(...bars.map(b=>b.signal+b.escape));
    const H_bars = 70;

    return (
      <svg viewBox="0 0 320 140" style={{ width:'100%', maxWidth:320, display:'block' }}>
        <defs>
          <marker id="arr2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={AMBER_WARN} />
          </marker>
        </defs>
        <rect width="320" height="140" fill={SURFACE} rx="6" />
        <text x="160" y="14" textAnchor="middle" fill={t.textMuted} fontSize="8" fontFamily="DM Mono, monospace" letterSpacing="0.06em">ENERGY SPECTRUM — CdTe DETECTOR</text>

        {/* Bars */}
        <g transform="translate(25,35)">
          {bars.map((b,i)=>{
            const sigH = Math.round((b.signal/maxVal)*H_bars);
            const escH = Math.round((b.escape/maxVal)*H_bars);
            const x = i*9;
            return (
              <g key={i}>
                <rect x={x} y={H_bars-sigH} width={7} height={sigH} fill={GE_PURPLE_LIGHT} opacity="0.8" />
                {escH>1&&<rect x={x} y={H_bars-sigH-escH} width={7} height={escH} fill={AMBER_WARN} opacity="0.75" />}
              </g>
            );
          })}
          
          {/* True peak annotation */}
          <g transform="translate(126, -5)">
            <line x1="0" y1="0" x2="0" y2="10" stroke={GE_PURPLE_LIGHT} strokeWidth="1" strokeDasharray="2 1" />
            <text x="4" y="2" fill={GE_PURPLE_LIGHT} fontSize="7" fontFamily="DM Mono, monospace" fontWeight="bold">TRUE PEAK</text>
            <text x="4" y="10" fill={GE_PURPLE_LIGHT} fontSize="6" fontFamily="DM Mono, monospace">62 keV</text>
          </g>

          {/* Escape peak annotation */}
          <g transform="translate(48, 15)">
            <line x1="0" y1="0" x2="0" y2="25" stroke={AMBER_WARN} strokeWidth="1" strokeDasharray="2 1" />
            <text x="-4" y="5" textAnchor="end" fill={AMBER_WARN} fontSize="7" fontFamily="DM Mono, monospace" fontWeight="bold">GHOST PEAK</text>
            <text x="-4" y="13" textAnchor="end" fill={AMBER_WARN} fontSize="6" fontFamily="DM Mono, monospace">36 keV</text>
          </g>

          {/* Arrow showing shift */}
          <path d="M 120,20 Q 84,10 54,20" fill="none" stroke={AMBER_WARN} strokeWidth="1" strokeDasharray="3 2" markerEnd="url(#arr2)" />
          <text x="87" y="8" textAnchor="middle" fill={AMBER_WARN} fontSize="6" fontFamily="DM Mono, monospace">−26 keV shift</text>

          {/* X axis */}
          <line x1="0" y1={H_bars+2} x2="270" y2={H_bars+2} stroke={t.border} strokeWidth="0.5" />
          <text x="0" y={H_bars+12} fill={t.textMuted} fontSize="6.5" fontFamily="DM Mono, monospace">20 keV</text>
          <text x="240" y={H_bars+12} fill={t.textMuted} fontSize="6.5" fontFamily="DM Mono, monospace">110 keV</text>
        </g>

        {/* Legend */}
        <g transform="translate(25,125)">
          <rect x="0" y="0" width="8" height="8" fill={GE_PURPLE_LIGHT} opacity="0.8" />
          <text x="12" y="7" fill={t.textMuted} fontSize="7" fontFamily="DM Sans, sans-serif">True signal</text>
          <rect x="90" y="0" width="8" height="8" fill={AMBER_WARN} opacity="0.75" />
          <text x="102" y="7" fill={t.textMuted} fontSize="7" fontFamily="DM Sans, sans-serif">K-escape artifact</text>
        </g>
      </svg>
    );
  };

  return (
    <div>
      {/* Intro */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, marginBottom:48 }}>
        <div>
          <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:15, lineHeight:1.78, color:t.textSec, fontWeight:300, marginBottom:20 }}>
            Imagine you're trying to photograph a single raindrop — but every time the drop hits the sensor, it splashes and sends a tiny ghost droplet flying 2mm sideways, which also triggers the sensor. You'd end up with a blurry image and ghost readings in the wrong places.
          </p>
          <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:15, lineHeight:1.78, color:t.textSec, fontWeight:300 }}>
            That's K-fluorescence escape — and it's the fundamental physics reason why CdTe detectors blur images, and why silicon doesn't.
          </p>
        </div>
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:6, padding:'16px 20px' }}>
          <div style={{ fontFamily:'DM Mono, monospace', fontSize:9, color:t.textMuted, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12 }}>The Numbers</div>
          {[
            { label:'Cd K-fluorescence energy', val:'~23 keV', sub:'Ghost photon energy released', color:AMBER_WARN },
            { label:'Mean free path in CdTe',   val:'~1–3 mm', sub:'How far ghost travels before re-absorption', color:AMBER_WARN },
            { label:'Si K-fluorescence energy', val:'~1.7 keV', sub:'Immediately re-absorbed — never escapes', color:TEAL_DATA },
            { label:'Mean free path in Si',     val:'~1 µm', sub:'10,000× shorter than in CdTe', color:TEAL_DATA },
          ].map(item=>(
            <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${t.border}` }}>
              <div>
                <div style={{ fontFamily:'DM Sans, sans-serif', fontSize:11, fontWeight:600, color:t.textSec, marginBottom:2 }}>{item.label}</div>
                <div style={{ fontFamily:'DM Sans, sans-serif', fontSize:10, color:t.textMuted, fontStyle:'italic' }}>{item.sub}</div>
              </div>
              <div style={{ fontFamily:'DM Mono, monospace', fontSize:16, fontWeight:500, color:item.color, flexShrink:0, marginLeft:16 }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-step diagram */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:8, overflow:'hidden', marginBottom:32 }}>
        {/* Header */}
        <div style={{ padding:'16px 24px', borderBottom:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'DM Mono, monospace', fontSize:9, color:t.textMuted, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:4 }}>Step-by-step · What happens inside CdTe</div>
            <div style={{ fontFamily:'DM Sans, sans-serif', fontSize:14, fontWeight:600, color:cur.color, transition:'color 0.3s' }}>{cur.label}</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>{ setPlaying(false); setStep(s=>Math.max(0,s-1)); }} className="ge-btn"
              style={{ padding:'5px 12px', background:'transparent', border:`1px solid ${t.border}`, borderRadius:4, color:t.textMuted, fontFamily:'DM Mono, monospace', fontSize:9, cursor:'pointer' }}>← Prev</button>
            <button onClick={()=>{ setStep(0); setPlaying(true); }} className="ge-btn"
              style={{ padding:'5px 12px', background:`linear-gradient(135deg,${GE_PURPLE} 0%,#3d0e78 100%)`, border:'none', borderRadius:4, color:'white', fontFamily:'DM Mono, monospace', fontSize:9, cursor:'pointer' }}>▶ Play</button>
            <button onClick={()=>{ setPlaying(false); setStep(s=>Math.min(3,s+1)); }} className="ge-btn"
              style={{ padding:'5px 12px', background:'transparent', border:`1px solid ${t.border}`, borderRadius:4, color:t.textMuted, fontFamily:'DM Mono, monospace', fontSize:9, cursor:'pointer' }}>Next →</button>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0 }}>
          {/* Diagram */}
          <div style={{ padding:'24px', borderRight:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Diagram />
          </div>

          {/* Step nav + description */}
          <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:0 }}>
            {steps.map((s,i)=>(
              <button key={i} onClick={()=>{ setPlaying(false); setStep(i); }} className="ge-btn"
                style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'12px 0', background:'transparent', borderTop:'none', borderLeft:'none', borderRight:'none', borderBottom:`1px solid ${t.border}`, textAlign:'left', cursor:'pointer' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, border:`2px solid ${i<=step?s.color:t.border}`, background:i===step?s.color:'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.3s', marginTop:1 }}>
                  <span style={{ fontFamily:'DM Mono, monospace', fontSize:8, color:i===step?'white':t.textMuted, fontWeight:700 }}>{i+1}</span>
                </div>
                <div>
                  <div style={{ fontFamily:'DM Sans, sans-serif', fontSize:12, fontWeight:600, color:i===step?s.color:t.textSec, marginBottom:4, transition:'color 0.3s' }}>{s.short}</div>
                  {i===step&&<p style={{ fontFamily:'DM Sans, sans-serif', fontSize:12, lineHeight:1.65, color:t.textMuted, fontWeight:300, margin:0 }}>{s.desc}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Consequence panels */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:32 }}>
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:8, padding:'20px', position:'relative' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div style={{ fontFamily:'DM Mono, monospace', fontSize:9, color:t.textMuted, letterSpacing:'0.12em', textTransform:'uppercase' }}>Spatial Consequence · Image Blur</div>
            <button onClick={() => setMaximized('blur')} style={{ background:'none', border:'none', color:t.textMuted, cursor:'pointer', padding:4, borderRadius:4, transition:'background 0.2s' }} className="hover:bg-white/5">
              <Maximize2 size={14} />
            </button>
          </div>
          <BlurDiagram />
          <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:12, lineHeight:1.65, color:t.textMuted, marginTop:12, fontWeight:300 }}>
            A point source of X-rays appears sharp in silicon (left) but smeared across neighbouring pixels in CdTe (right) due to ghost photon mis-registration. This directly limits spatial resolution.
          </p>
        </div>
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:8, padding:'20px', position:'relative' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div style={{ fontFamily:'DM Mono, monospace', fontSize:9, color:t.textMuted, letterSpacing:'0.12em', textTransform:'uppercase' }}>Spectral Consequence · Ghost Energy Peak</div>
            <button onClick={() => setMaximized('spectrum')} style={{ background:'none', border:'none', color:t.textMuted, cursor:'pointer', padding:4, borderRadius:4, transition:'background 0.2s' }} className="hover:bg-white/5">
              <Maximize2 size={14} />
            </button>
          </div>
          <EscapePeakChart />
          <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:12, lineHeight:1.65, color:t.textMuted, marginTop:12, fontWeight:300 }}>
            K-escape creates a phantom peak ~26 keV below the true photon energy. Photons that should register at 62 keV appear at ~36 keV — contaminating spectral bins and corrupting material decomposition.
          </p>
        </div>
      </div>

      {/* Maximized Modal */}
      <AnimatePresence>
        {maximized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.85)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}
            onClick={() => setMaximized(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:40, maxWidth:900, width:'100%', position:'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setMaximized(null)}
                style={{ position:'absolute', top:20, right:20, border:'none', color:t.textMuted, cursor:'pointer', padding:8, borderRadius:'50%', background:t.surface2 }}
              >
                <X size={20} />
              </button>

              <div style={{ fontFamily:'DM Mono, monospace', fontSize:10, color:t.textMuted, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:24 }}>
                {maximized === 'blur' ? 'Spatial Consequence · Image Blur' : 'Spectral Consequence · Ghost Energy Peak'}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:40, alignItems:'center' }}>
                <div style={{ width:'100%' }}>
                  {maximized === 'blur' ? (
                    <div style={{ transform:'scale(1.2)', transformOrigin:'center' }}><BlurDiagram /></div>
                  ) : (
                    <div style={{ transform:'scale(1.2)', transformOrigin:'center' }}><EscapePeakChart /></div>
                  )}
                </div>
                <div>
                  <h3 style={{ fontFamily:'DM Sans, sans-serif', fontSize:18, fontWeight:600, color:t.text, marginBottom:16 }}>
                    {maximized === 'blur' ? 'Spatial Resolution Degradation' : 'Spectral Contamination'}
                  </h3>
                  <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:14, lineHeight:1.7, color:t.textSec, fontWeight:300 }}>
                    {maximized === 'blur'
                      ? 'The K-fluorescence ghost photon travels a few millimetres before being re-absorbed. If it lands in a neighbouring pixel, it triggers a false count at that location. This "splashing" of signal creates a fundamental limit on spatial resolution in CdTe detectors, regardless of how small the physical pixels are made.'
                      : 'When a K-fluorescence photon escapes the original interaction site, the energy it carries (~26 keV) is lost from the primary signal. This results in a "ghost" peak appearing in the energy spectrum at a lower energy level. This spectral smearing makes it difficult to accurately separate materials like iodine and bone, as their energy signatures become mixed.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Silicon contrast callout */}
      <div style={{ background: t.isDark?'rgba(0,200,180,0.06)':'rgba(0,200,180,0.05)', border:`1px solid rgba(0,200,180,0.2)`, borderRadius:8, padding:'20px 24px', display:'grid', gridTemplateColumns:'auto 1fr', gap:20, alignItems:'center' }}>
        <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(0,200,180,0.12)', border:`2px solid ${TEAL_DATA}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontSize:20 }}>⚛</span>
        </div>
        <div>
          <div style={{ fontFamily:'DM Sans, sans-serif', fontSize:13, fontWeight:700, color:TEAL_DATA, marginBottom:6, letterSpacing:'0.04em' }}>Why silicon is immune</div>
          <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:13, lineHeight:1.7, color:t.textSec, fontWeight:300, margin:0 }}>
            Silicon's K-fluorescence photon carries only ~1.7 keV — far too little energy to travel even 1 micrometre before being re-absorbed in the same pixel. There is no ghost, no mis-registration, no blur. This is not an engineering fix — it's a fundamental consequence of silicon's low atomic number (Z=14 vs Cd Z=48). GE's edge-on geometry simply uses enough silicon depth to stop the original photon completely.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── 05 · CLINICAL IMPACT ─────────────────────────────────────────────────────
const ClinicalImageSharp = () => (
  <svg viewBox="0 0 400 300" style={{ width:'100%', height:'100%', display:'block' }}>
    {/* Lung parenchyma / Vessel background */}
    <g opacity="0.15">
      {Array.from({length:40}).map((_,i)=>(
        <circle key={i} cx={Math.random()*400} cy={Math.random()*300} r={Math.random()*2} fill="white" />
      ))}
      {Array.from({length:10}).map((_,i)=>(
        <path key={i} d={`M ${Math.random()*400},${Math.random()*300} Q ${Math.random()*400},${Math.random()*300} ${Math.random()*400},${Math.random()*300}`} fill="none" stroke="white" strokeWidth="0.5" />
      ))}
    </g>

    {/* Coronary Artery */}
    <path d="M 50,150 Q 200,130 350,170" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="44" strokeLinecap="round" />
    <path d="M 50,150 Q 200,130 350,170" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="36" strokeLinecap="round" />
    
    {/* Stent (Sharp) */}
    <g transform="translate(150, 135) rotate(-5)">
      {/* Stent mesh pattern */}
      {Array.from({length:10}).map((_,i) => (
        <React.Fragment key={i}>
          <rect x={i*10} y={0} width={0.8} height={30} fill={TEAL_DATA} opacity="0.9" />
          <path d={`M ${i*10},0 L ${i*10+10},30 M ${i*10+10},0 L ${i*10},30`} stroke={TEAL_DATA} strokeWidth="0.4" opacity="0.5" />
        </React.Fragment>
      ))}
      <rect x={0} y={0} width={100} height={30} fill="none" stroke={TEAL_DATA} strokeWidth="1.2" rx="2" />
      <text x="50" y="-8" textAnchor="middle" fill={TEAL_DATA} fontSize="7" fontFamily="DM Mono, monospace" letterSpacing="0.1em">STENT STRUTS CLEAR</text>
    </g>
    
    {/* Calcification/Plaque */}
    <circle cx="130" cy="142" r="5" fill="white" opacity="0.95" style={{ filter:'drop-shadow(0 0 4px white)' }} />
    <text x="110" y="130" fill="white" fontSize="6" fontFamily="DM Mono, monospace">CALCIFICATION</text>
    <circle cx="270" cy="158" r="3.5" fill="white" opacity="0.9" />
  </svg>
);

const ClinicalImageBlurred = () => (
  <svg viewBox="0 0 400 300" style={{ width:'100%', height:'100%', display:'block' }}>
    {/* Blurred background */}
    <g opacity="0.1" style={{ filter:'blur(3px)' }}>
      {Array.from({length:40}).map((_,i)=>(
        <circle key={i} cx={Math.random()*400} cy={Math.random()*300} r={Math.random()*3} fill="white" />
      ))}
    </g>

    {/* Vessel (Blurred) */}
    <path d="M 50,150 Q 200,130 350,170" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="44" strokeLinecap="round" style={{ filter: 'blur(5px)' }} />
    
    {/* Stent (Blurred / Blooming Artifact) */}
    <g transform="translate(150, 135) rotate(-5)" style={{ filter: 'blur(8px)' }}>
      <rect x={-5} y={-5} width={110} height={40} fill={AMBER_WARN} opacity="0.4" rx="4" />
      <rect x={0} y={0} width={100} height={30} fill="none" stroke={AMBER_WARN} strokeWidth="6" rx="2" />
    </g>
    <g transform="translate(150, 135) rotate(-5)">
      <text x="50" y="-8" textAnchor="middle" fill={AMBER_WARN} fontSize="7" fontFamily="DM Mono, monospace" letterSpacing="0.1em" opacity="0.8">BLOOMING ARTIFACT</text>
    </g>
    
    {/* Calcification (Blurred) */}
    <circle cx="130" cy="142" r="12" fill="white" opacity="0.4" style={{ filter: 'blur(6px)' }} />
    <circle cx="270" cy="158" r="9" fill="white" opacity="0.3" style={{ filter: 'blur(5px)' }} />
  </svg>
);

const ClinicalImpactSection = () => {
  const t = useTheme();
  const [sliderPos, setSliderPos] = useState(50);

  const pillars = [
    {
      icon: <Maximize2 size={20} />,
      title: "Ultra-High Resolution",
      subtitle: "Visualizing the Invisible",
      body: "Deep Silicon supports ultra-high (~0.2 mm) isotropic resolution through fine detector architecture and reduced fluorescence-related signal spread, enabling clearer visualization of lung parenchyma, coronary stents, and inner ear structures."
    },
    {
      icon: <ShieldCheck size={20} />,
      title: "Dose Efficiency",
      subtitle: "Safety by Design",
      body: "High signal fidelity and efficient low-energy performance support diagnostic-quality imaging at reduced radiation doses, particularly for pediatric and screening applications."
    },
    {
      icon: <Activity size={20} />,
      title: "Material Quantification",
      subtitle: "Absolute Precision",
      body: "Improved spectral fidelity with reduced energy distortion supports more accurate iodine mapping and virtual non-contrast imaging, advancing CT toward more quantitative diagnostic capabilities."
    }
  ];

  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', minHeight: 480 }}>
        {/* Left: Interactive Comparison */}
        <div style={{ borderRight: `1px solid ${t.border}`, padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 22, fontWeight: 700, color: t.text, marginBottom: 8 }}>Clinical Comparison</h3>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: t.textSec, lineHeight: 1.6 }}>
              Slide to compare standard PCCT (with K-escape blur) against Deep Silicon's sharp, high-fidelity reconstruction. Note the "blooming" artifact reduction in the stent.
            </p>
          </div>

          <div style={{ flex: 1, position: 'relative', background: GROUND, borderRadius: 12, overflow: 'hidden', border: `1px solid ${t.borderMid}` }}>
            {/* The "Images" (SVG Mockups) */}
            <div style={{ position: 'absolute', inset: 0 }}>
               {/* Base Image: Sharp (Deep Silicon) */}
               <ClinicalImageSharp />
               
               {/* Overlay Image: Blurred (Standard) */}
               <div style={{ 
                 position: 'absolute', 
                 inset: 0, 
                 clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                 transition: 'none'
               }}>
                 <ClinicalImageBlurred />
               </div>
            </div>

            {/* Slider Handle */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              bottom: 0, 
              left: `${sliderPos}%`, 
              width: 2, 
              background: 'white', 
              zIndex: 20,
              pointerEvents: 'none'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'white',
                border: `4px solid ${GE_PURPLE}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display:'flex', gap:2 }}>
                  <div style={{ width:2, height:8, background:GE_PURPLE, borderRadius:1 }} />
                  <div style={{ width:2, height:8, background:GE_PURPLE, borderRadius:1 }} />
                </div>
              </div>
            </div>

            {/* Labels */}
            <div style={{ position:'absolute', bottom:16, left:16, background:'rgba(0,0,0,0.6)', padding:'4px 10px', borderRadius:4, zIndex:30, backdropFilter:'blur(4px)' }}>
              <span style={{ fontFamily:'DM Mono, monospace', fontSize:9, color:'white', textTransform:'uppercase', letterSpacing:'0.1em' }}>Standard PCCT</span>
            </div>
            <div style={{ position:'absolute', bottom:16, right:16, background:'rgba(0,0,0,0.6)', padding:'4px 10px', borderRadius:4, zIndex:30, backdropFilter:'blur(4px)' }}>
              <span style={{ fontFamily:'DM Mono, monospace', fontSize:9, color:TEAL_DATA, textTransform:'uppercase', letterSpacing:'0.1em' }}>Deep Silicon</span>
            </div>

            {/* Invisible Range Input */}
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderPos} 
              onChange={(e) => setSliderPos(parseInt(e.target.value))}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'ew-resize',
                zIndex: 40
              }}
            />
          </div>
        </div>

        {/* Right: Clinical Pillars */}
        <div style={{ padding: '40px', background: t.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {pillars.map((p, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: t.isDark ? 'rgba(139,79,216,0.1)' : 'rgba(139,79,216,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GE_PURPLE_LIGHT }}>
                  {p.icon}
                </div>
                <div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: t.text }}>{p.title}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: GE_PURPLE_LIGHT, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{p.subtitle}</div>
                </div>
              </div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: t.textSec, lineHeight: 1.6, fontWeight: 300 }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── 06 · COMPARISON TABLE ────────────────────────────────────────────────────
const ComparisonTable = () => {
  const t = useTheme();
  const rows = [
    { metric: 'Detection Principle', eid: 'Energy integration (scintillator + photodiode)', pcd: 'Direct conversion (semiconductor)', highlight: false },
    { metric: 'Spatial Resolution', eid: 'Limited by pixel size (~500 µm)', pcd: 'Ultra-high resolution (~150 µm)', highlight: true },
    { metric: 'Electronic Noise', eid: 'Integrated into signal (lowers SNR)', pcd: 'Eliminated via energy thresholding', highlight: true },
    { metric: 'Spectral Information', eid: 'None (broadband integration)', pcd: 'Multi-energy bins (simultaneous)', highlight: true },
    { metric: 'Contrast-to-Noise Ratio', eid: 'Standard', pcd: 'Significantly improved (up to 40%)', highlight: false },
    { metric: 'Radiation Dose', eid: 'Standard', pcd: 'Reduced (better detector efficiency)', highlight: false },
    { metric: 'Material Decomposition', eid: 'Limited (requires dual-source/layer)', pcd: 'Inherent and precise', highlight: true },
  ];

  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: t.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderBottom: `1px solid ${t.borderMid}` }}>
            <th style={{ textAlign: 'left', padding: '16px 24px', color: t.textMuted, fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Parameter</th>
            <th style={{ textAlign: 'left', padding: '16px 24px', color: t.textMuted, fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Conventional EID</th>
            <th style={{ textAlign: 'left', padding: '16px 24px', color: GE_PURPLE_LIGHT, fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Photon Counting CT</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: i === rows.length - 1 ? 'none' : `1px solid ${t.border}`, background: r.highlight ? (t.isDark ? 'rgba(139,79,216,0.03)' : 'rgba(139,79,216,0.02)') : 'transparent' }}>
              <td style={{ padding: '16px 24px', color: t.textSec, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500 }}>{r.metric}</td>
              <td style={{ padding: '16px 24px', color: t.textMuted, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 300 }}>{r.eid}</td>
              <td style={{ padding: '16px 24px', color: r.highlight ? GE_PURPLE_LIGHT : t.textSec, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: r.highlight ? 600 : 400 }}>{r.pcd}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const theme = darkMode ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{ minHeight:'100vh', background:theme.bg, color:theme.text }}>
        <GlobalStyle theme={theme} />
        <Header darkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} />
        <main style={{ maxWidth:1140, margin:'0 auto', padding:'64px 32px' }}>
          <section style={{ marginBottom:80 }}>
            <SectionLabel number="01">Interactive Detector Simulation</SectionLabel>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, marginBottom: 48, marginTop: 12 }}>
              <div>
                <h4 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 24, fontWeight: 700, color: theme.text, marginBottom: 12, lineHeight: 1.1 }}>Ultra-High Resolution</h4>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: theme.textSec, lineHeight: 1.6, fontWeight: 300 }}>
                  Visualizing the invisible. PCDs eliminate the 'noise floor' of scintillators, enabling sub-0.2mm isotropic resolution for fine anatomical structures and micro-calcifications.
                </p>
              </div>
              <div>
                <h4 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 24, fontWeight: 700, color: theme.text, marginBottom: 12, lineHeight: 1.1 }}>Dose Efficiency</h4>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: theme.textSec, lineHeight: 1.6, fontWeight: 300 }}>
                  Safety by design. Inherent electronic noise rejection allows for diagnostic-quality imaging at significantly lower radiation doses, particularly critical for pediatric and screening protocols.
                </p>
              </div>
              <div>
                <h4 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 24, fontWeight: 700, color: theme.text, marginBottom: 12, lineHeight: 1.1 }}>Spectral Clarity</h4>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: theme.textSec, lineHeight: 1.6, fontWeight: 300 }}>
                  Absolute precision. Simultaneous multi-energy capture enables precise tissue characterization and material quantification in a single scan without spectral overlap.
                </p>
              </div>
            </div>

            <DetectorSim />
          </section>
          <section style={{ marginBottom:80 }}>
            <SectionLabel number="02">Spectral Decomposition</SectionLabel>
            <SpectralViz />
          </section>
          <section style={{ marginBottom:80 }}>
            <SectionLabel number="03">Deep Silicon Architecture</SectionLabel>
            <DeepSiliconSection />
          </section>
          <section style={{ marginBottom:80 }}>
            <SectionLabel number="04">Clinical Impact</SectionLabel>
            <ClinicalImpactSection />
          </section>
          <section style={{ marginBottom:80 }}>
            <SectionLabel number="05">K-Fluorescence Escape</SectionLabel>
            <KFluorescenceSection />
          </section>
          <section style={{ marginBottom:80 }}>
            <SectionLabel number="06">Technology Comparison</SectionLabel>
            <ComparisonTable />
          </section>
        </main>
      </div>
    </ThemeContext.Provider>
  );
}
