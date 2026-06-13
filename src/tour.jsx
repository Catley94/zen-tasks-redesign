// Interactive product tour — coachmark spotlights with explanatory bubbles.
// Dims the frame, cuts a "hole" around a target element (via a big box-shadow),
// and floats a bubble nearby with Back/Next/Skip. Targets are found by
// [data-tour="…"] within the current app frame, so it scopes to one instance.

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { TOKENS, btnReset } from './tokens';
import { Leaf, Close } from './icons';

export const TOUR_STEPS_DESKTOP = [
  { sel: 'spaces', title: 'Your spaces', body: "Keep Personal and Work completely separate. Each space has its own tasks, projects, categories and goals — switch here and the whole app changes with you.", place: 'right' },
  { sel: 'search', title: 'Find anything fast', body: "Search — or press ⌘P — to jump to any screen, project or task without hunting through the sidebar.", place: 'right' },
  { sel: 'nav', title: 'Everything in one map', body: "Focus is your handful of pinned tasks. Today and Calendar handle scheduling. Below sit your Goals, Projects and everyday Categories.", place: 'right' },
  { sel: 'main', title: 'Where things happen', body: "The main view shows whatever you've selected. Click any task to open it — edit the title, write a Markdown description, schedule it, and log updates.", place: 'left', before: (c) => c.onNav('today') },
  { sel: 'zen', title: 'Meet Zen', body: "Your calm companion. Tap here any time to plan your day, surface what's overdue, or talk through a project that's stuck.", place: 'bottom' },
  { sel: 'aimode', title: 'Assistant or Manager', body: "Choose how involved Zen is. Assistant waits to be asked; Manager actively helps shape and tidy your tasks alongside you.", place: 'right' },
  { sel: 'help', title: "Replay anytime", body: "That's the tour! Tap this question mark whenever you'd like to run through it again. Enjoy the quiet.", place: 'bottom' },
];

// Mobile tour drives the app between steps — navigating screens and opening the
// More sheet — so it can showcase things that live a tap away, with full parity.
export const TOUR_STEPS_MOBILE = [
  { sel: 'm-space', title: 'Your space', body: "Personal and Work stay completely separate — each with its own tasks, projects and goals. This badge shows which one you're in.", place: 'bottom', before: (c) => { c.app.closeMoreSheet(); c.onNav('today'); } },
  { sel: 'm-main', title: 'Where things happen', body: "Your current screen. Tap any task to open it — edit it, schedule it, write a Markdown description and log updates.", place: 'bottom' },
  { sel: 'm-nav', title: 'Get around', body: "Today, Calendar, Focus and Zen are always one tap away along the bottom.", place: 'top' },
  { sel: 'm-more', title: 'Everything else', body: "Tap More for the rest — your spaces, Goals, Projects, Categories and Settings. Let me show you.", place: 'top' },
  { sel: 'ms-spaces', title: 'Switch spaces here', body: "Hop between Personal, Work or any space you create — or manage them. The whole app changes with you.", place: 'top', before: (c) => c.app.openMoreSheet() },
  { sel: 'ms-nav', title: 'Your whole map', body: "Every Goal, Project and Category lives here, plus Ask Zen and your Weekly review — all a tap away.", place: 'top', before: (c) => c.app.openMoreSheet() },
  { sel: 'set-ai', title: 'Assistant or Manager', body: "In Settings, choose how involved Zen is. Assistant waits to be asked; Manager actively helps shape and tidy your tasks.", place: 'bottom', before: (c) => { c.app.closeMoreSheet(); c.onNav('settings'); } },
  { sel: 'set-appearance', title: 'Make it yours', body: "Adjust density, the accent pairing, and switch on the dyslexia-friendly font — it restyles the whole app.", place: 'top', before: (c) => c.onNav('settings') },
  { sel: 'm-help', title: 'Replay anytime', body: "That's the tour! Tap this question mark to run through it again whenever you like.", place: 'bottom', before: (c) => { c.app.closeMoreSheet(); c.onNav('today'); } },
];

// Scroll a target into the middle of its nearest scrollable ancestor (no scrollIntoView).
function scrollTargetIntoView(el, root) {
  let p = el.parentElement;
  while (p && p !== root) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight + 2) {
      const pr = p.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const target = p.scrollTop + (er.top - pr.top) - (p.clientHeight / 2 - er.height / 2);
      p.scrollTop = Math.max(0, target);
    }
    p = p.parentElement;
  }
}

export function ProductTour({ app, frame, getRoot, onNav = () => {} }) {
  const stepsAll = frame === 'mobile' ? TOUR_STEPS_MOBILE : TOUR_STEPS_DESKTOP;
  // Keep a step if it drives the app (has `before`) or its target is already on screen.
  const [steps, setSteps] = useState(stepsAll);
  useEffect(() => {
    if (!app.tourOpen) return;
    const root = getRoot && getRoot();
    if (!root) { setSteps(stepsAll); return; }
    const present = stepsAll.filter(s => s.before || root.querySelector(`[data-tour="${s.sel}"]`));
    setSteps(present.length ? present : stepsAll);
  }, [app.tourOpen]);
  const i = Math.min(app.tourStep, steps.length - 1);
  const step = steps[i];
  const bubbleRef = useRef(null);
  const [geo, setGeo] = useState(null); // { spot:{top,left,w,h}, bubble:{top,left}, place }
  const lastStep = i >= steps.length - 1;
  const ctx = { app, onNav };

  const measure = useCallback(() => {
    const root = getRoot && getRoot();
    if (!root || !step) return;
    const el = root.querySelector(`[data-tour="${step.sel}"]`);
    if (!el) { setGeo(null); return; }
    const rr = root.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const pad = 6;
    const spot = { top: er.top - rr.top - pad, left: er.left - rr.left - pad, w: er.width + pad * 2, h: er.height + pad * 2 };
    const FW = rr.width, FH = rr.height;
    const bw = bubbleRef.current ? bubbleRef.current.offsetWidth : 312;
    const bh = bubbleRef.current ? bubbleRef.current.offsetHeight : 168;
    const gap = 16;
    // choose placement with room, starting from the step's preference
    const order = [step.place, 'right', 'left', 'bottom', 'top'];
    const fits = {
      right: spot.left + spot.w + gap + bw <= FW,
      left: spot.left - gap - bw >= 0,
      bottom: spot.top + spot.h + gap + bh <= FH,
      top: spot.top - gap - bh >= 0,
    };
    const place = order.find(p => fits[p]) || 'bottom';
    let bTop, bLeft;
    if (place === 'right') { bLeft = spot.left + spot.w + gap; bTop = spot.top + spot.h / 2 - bh / 2; }
    else if (place === 'left') { bLeft = spot.left - gap - bw; bTop = spot.top + spot.h / 2 - bh / 2; }
    else if (place === 'bottom') { bTop = spot.top + spot.h + gap; bLeft = spot.left + spot.w / 2 - bw / 2; }
    else { bTop = spot.top - gap - bh; bLeft = spot.left + spot.w / 2 - bw / 2; }
    bTop = Math.max(12, Math.min(bTop, FH - bh - 12));
    bLeft = Math.max(12, Math.min(bLeft, FW - bw - 12));
    setGeo({ spot, bubble: { top: bTop, left: bLeft }, place });
  }, [step, getRoot]);

  const measureRef = useRef(measure);
  measureRef.current = measure;

  useLayoutEffect(() => {
    if (!app.tourOpen || !step) return;
    let cancelled = false;
    setGeo(null); // hide spotlight until the (possibly navigated) target is located
    try { step.before && step.before(ctx); } catch (e) {}
    let tries = 0;
    const tick = () => {
      if (cancelled) return;
      const root = getRoot && getRoot();
      const el = root && root.querySelector(`[data-tour="${step.sel}"]`);
      if (el) {
        try { scrollTargetIntoView(el, root); } catch (e) {}
        measureRef.current();
        setTimeout(() => !cancelled && measureRef.current(), 90);
      } else if (tries < 16) { tries++; setTimeout(tick, 60); }
    };
    const t = setTimeout(tick, step.before ? 360 : 50);
    const onResize = () => measureRef.current();
    window.addEventListener('resize', onResize);
    return () => { cancelled = true; clearTimeout(t); window.removeEventListener('resize', onResize); };
  }, [app.tourOpen, i]);

  if (!app.tourOpen || !step) return null;

  const finish = () => { app.closeMoreSheet && app.closeMoreSheet(); app.endTour(); };
  const next = () => { if (lastStep) finish(); else app.setTourStep(i + 1); };
  const back = () => app.setTourStep(Math.max(0, i - 1));

  const bubble = (
    <div ref={bubbleRef} style={{ position: 'absolute', width: 312, zIndex: 3,
      top: geo ? geo.bubble.top : -9999, left: geo ? geo.bubble.left : -9999,
      background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radiusLg,
      boxShadow: '0 24px 60px rgba(15,25,15,0.34)', padding: '16px 16px 13px', fontFamily: TOKENS.fontSans,
      animation: 'zenToastIn 0.28s cubic-bezier(0.2,0.8,0.2,1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
        <span style={{ width: 24, height: 24, borderRadius: 999, background: TOKENS.greenTint, color: TOKENS.green, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Leaf size={13}/></span>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: TOKENS.ink, letterSpacing: -0.2, flex: 1 }}>{step.title}</div>
        <button onClick={finish} aria-label="Close tour" style={{ ...btnReset, color: TOKENS.subSoft, width: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center' }}><Close size={13}/></button>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: TOKENS.inkSoft, marginBottom: 14 }}>{step.body}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 5, flex: 1 }}>
          {steps.map((_, n) => (
            <span key={n} onClick={()=>app.setTourStep(n)} style={{ width: n === i ? 18 : 6, height: 6, borderRadius: 999, cursor: 'pointer',
              background: n === i ? TOKENS.green : TOKENS.line, transition: 'all .2s' }}/>
          ))}
        </div>
        {i > 0 && <button onClick={back} style={{ ...btnReset, padding: '6px 12px', borderRadius: 999, color: TOKENS.sub, fontSize: 12.5, fontWeight: 500 }}>Back</button>}
        <button onClick={next} style={{ ...btnReset, padding: '7px 16px', borderRadius: 999, background: TOKENS.green, color: '#fff', fontSize: 12.5, fontWeight: 500 }}>
          {lastStep ? 'Done' : 'Next'}
        </button>
      </div>
      {i === 0 && !lastStep && (
        <button onClick={finish} style={{ ...btnReset, marginTop: 9, color: TOKENS.subSoft, fontSize: 11.5, cursor: 'pointer' }}>Skip tour</button>
      )}
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 120, pointerEvents: 'none' }}>
      {/* click-blocker so the rest of the UI isn't interactable mid-tour */}
      <div onClick={finish} style={{ position: 'absolute', inset: 0, pointerEvents: 'auto', cursor: 'default' }}/>
      {/* spotlight: a transparent box whose huge box-shadow dims everything else */}
      {geo && (
        <div style={{ position: 'absolute', top: geo.spot.top, left: geo.spot.left, width: geo.spot.w, height: geo.spot.h,
          borderRadius: 12, boxShadow: `0 0 0 9999px rgba(16,24,16,0.62)`, outline: `2px solid ${TOKENS.green}`, outlineOffset: 2,
          pointerEvents: 'none', transition: 'top .3s cubic-bezier(0.4,0,0.2,1), left .3s cubic-bezier(0.4,0,0.2,1), width .3s, height .3s', zIndex: 1 }}>
          <div style={{ position: 'absolute', inset: -2, borderRadius: 12, animation: 'tourPulse 2s ease-in-out infinite' }}/>
        </div>
      )}
      <div style={{ pointerEvents: 'auto' }}>{bubble}</div>
    </div>
  );
}

// keyframes for the spotlight pulse
if (!document.getElementById('zen-tour-styles')) {
  const s = document.createElement('style');
  s.id = 'zen-tour-styles';
  s.textContent = `@keyframes tourPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(90,138,58,0.45); } 50% { box-shadow: 0 0 0 6px rgba(90,138,58,0); } }`;
  document.head.appendChild(s);
}
