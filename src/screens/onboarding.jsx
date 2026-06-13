// Onboarding — first-run flow. Renders its own chrome (no sidebar) while the
// user names a goal, says why it matters, and sketches the rough phases.

import React, { useState } from 'react';
import { TOKENS, btnReset } from '../lib/tokens';
import { Sparkles, Leaf, Arr } from '../components/icons';

function OnboardingScreen({ app, variant, frame, onNav, onAsk }) {
  const [step, setStep] = useState(0);
  const steps = variant === 'a'
    ? [{t:"What are you trying to build?", sub:"One honest sentence.", ph:"Build something I'm proud of", help:"This becomes your North Star — visible everywhere, changeable anytime."},
       {t:"Why does it matter to you?", sub:"A note from you, to you.", ph:"This feels different — it's for me, not a client.", help:"Zen will remind you of this when things get hard."},
       {t:"What are the rough phases?", sub:"3 is plenty.", ph:"Ship Zen Tasks MVP\nRecord the EP\nWrite the kids book", help:"You can rearrange these later. Only one is active at a time."}]
    : [{t:"Let's begin.", sub:"This takes about 3 minutes.", ph:"", help:""},
       {t:"A goal worth pursuing", sub:"Something you'd be proud to finish this year.", ph:"Build something I'm proud of", help:""},
       {t:"Break it into phases", sub:"One sequenced step at a time.", ph:"Ship Zen Tasks MVP\nRecord the EP\nWrite the kids book", help:""},
       {t:"Ready.", sub:"Zen will check in quietly. You can always ask for more.", ph:"", help:""}];
  const s = steps[step];

  const body = (
    <div style={{ padding: '30px 30px 40px', maxWidth: 600, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 26 }}>
        {steps.map((_,i)=><div key={i} style={{ flex:1, height: 3, borderRadius: 999, background: i<=step ? TOKENS.green : TOKENS.lineSoft }}/>)}
      </div>
      {variant === 'a' && <div style={{ fontSize: 11, color: TOKENS.teal, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>Step {step+1} of {steps.length}</div>}
      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 500, letterSpacing: -0.4 }}>{s.t}</h2>
      {s.sub && <div style={{ fontSize: 14, color: TOKENS.sub, marginTop: 6 }}>{s.sub}</div>}
      {s.ph && (
        <textarea defaultValue={s.ph} style={{ width: '100%', marginTop: 20, minHeight: 120, background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: 14, fontFamily: TOKENS.fontSans, fontSize: 14, lineHeight: 1.5, color: TOKENS.ink, resize: 'vertical', outline: 'none' }}/>
      )}
      {s.help && <div style={{ fontSize: 12.5, color: TOKENS.sub, marginTop: 10, padding: '10px 14px', background: TOKENS.tealTint, borderRadius: TOKENS.radiusSm, display: 'flex', gap: 8, alignItems: 'flex-start' }}><Sparkles size={12} style={{ color: TOKENS.teal, marginTop: 2 }}/>{s.help}</div>}
      <div style={{ display: 'flex', gap: 10, marginTop: 28, alignItems: 'center' }}>
        {step > 0 && <button onClick={()=>setStep(step-1)} style={{ ...btnReset, padding: '10px 16px', fontSize: 13, color: TOKENS.sub }}>Back</button>}
        <div style={{ flex:1 }}/>
        <button onClick={()=>setStep(Math.min(steps.length-1, step+1))} style={{ ...btnReset, padding: '10px 18px', borderRadius: 999, background: TOKENS.green, color: TOKENS.bg, fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {step === steps.length-1 ? 'Begin' : 'Next'}<Arr size={13}/>
        </button>
      </div>
    </div>
  );

  // no sidebar during onboarding
  return (
    <div style={{ width: frame==='mobile'?360:1200, height: 760, background: TOKENS.bg, color: TOKENS.ink, fontFamily: TOKENS.fontSans, fontSize: 14, position: 'relative', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: TOKENS.green, color: TOKENS.bg, display: 'grid', placeItems: 'center' }}><Leaf size={14}/></div>
        <div style={{ fontWeight: 600 }}>Zen</div>
        <div style={{ flex: 1 }}/>
        <button style={{ ...btnReset, fontSize: 12, color: TOKENS.sub }}>Skip</button>
      </header>
      {body}
    </div>
  );
}

export { OnboardingScreen };
