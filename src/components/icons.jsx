// Minimal inline SVG icons.
import React from 'react';

const mkI = (paths) => ({ size = 16, stroke = 1.6, style = {}, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'block', flexShrink: 0, ...style }} {...rest}>{paths}</svg>
);

export const Leaf = mkI(<><path d="M11 20A7 7 0 0 1 4 13c0-5 5-10 14-9 1 9-4 16-9 17Z"/><path d="M4 20c3-5 6-7 11-9"/></>);
export const Sparkles = mkI(<><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/></>);
export const User = mkI(<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>);
export const Check = mkI(<polyline points="4 12 10 18 20 6"/>);
export const ChevR = mkI(<polyline points="9 6 15 12 9 18"/>);
export const ChevD = mkI(<polyline points="6 9 12 15 18 9"/>);
export const ChevL = mkI(<polyline points="15 6 9 12 15 18"/>);
export const Moon = mkI(<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z"/>);
export const Plus = mkI(<><path d="M12 5v14M5 12h14"/></>);
export const Close = mkI(<><path d="M6 6l12 12M18 6L6 18"/></>);
export const Calendar = mkI(<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>);
export const Home = mkI(<><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2Z"/></>);
export const Target = mkI(<><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/></>);
export const Folder = mkI(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>);
export const Settings = mkI(<><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2L5.1 6l-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5A7 7 0 0 0 19 12Z"/></>);
export const Help = mkI(<><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></>);
export const Mic = mkI(<><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></>);
export const Send = mkI(<path d="M4 12l17-8-5 18-5-7-7-3Z"/>);
export const Flame = mkI(<path d="M12 3s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s-1 4 2 4 3-3 2-5-3-2-3-6 3 0 3 0Z"/>);
export const Dot = mkI(<circle cx="12" cy="12" r="4" fill="currentColor"/>);
export const ListTodo = mkI(<><path d="M4 6h12M4 12h12M4 18h12"/><circle cx="20" cy="6" r="1" fill="currentColor"/><circle cx="20" cy="12" r="1" fill="currentColor"/><circle cx="20" cy="18" r="1" fill="currentColor"/></>);
export const Edit = mkI(<><path d="M4 20h4l10-10-4-4L4 16Z"/><path d="M14 6l4 4"/></>);
export const Arr = mkI(<><path d="M5 12h14M13 6l6 6-6 6"/></>);
export const MoreV = mkI(<><circle cx="12" cy="5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/></>);
export const Pin = mkI(<><path d="M12 3v8l3 3v2h-6v-2l3-3V3M10 3h4M12 16v5"/></>);
export const Bell = mkI(<><path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z"/><path d="M10 20a2 2 0 0 0 4 0"/></>);
export const Search = mkI(<><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></>);
export const Grid = mkI(<><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></>);
export const Tag = mkI(<><path d="M4 4h7l9 9-7 7-9-9V4Z"/><circle cx="8.3" cy="8.3" r="1.2" fill="currentColor"/></>);
export const Heart = mkI(<path d="M12 20s-7-4.4-7-10a3.8 3.8 0 0 1 7-2.2A3.8 3.8 0 0 1 19 10c0 5.6-7 10-7 10Z"/>);
export const Bag = mkI(<><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></>);
export const Wallet = mkI(<><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 11h18"/><circle cx="16.5" cy="15" r="1.1" fill="currentColor"/></>);
export const Trash = mkI(<><path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13"/></>);
export const CalToday = mkI(<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/><circle cx="12" cy="15" r="2.4" fill="currentColor"/></>);
export const CalMonth = mkI(<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/><path d="M7.5 13h1.5M11.25 13h1.5M15 13h1.5M7.5 16.5h1.5M11.25 16.5h1.5M15 16.5h1.5"/></>);
export const Clock = mkI(<><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></>);
