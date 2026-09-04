const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

function Svg({ className, children }) {
  return (
    <svg viewBox="0 0 24 24" className={className || 'h-5 w-5'} {...base}>
      {children}
    </svg>
  );
}

export const IconDashboard = props => (
  <Svg {...props}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></Svg>
);
export const IconInbox = props => (
  <Svg {...props}><path d="M3 12h4l2 3h6l2-3h4" /><path d="M5.5 5h13l2.5 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7z" /></Svg>
);
export const IconMapPin = props => (
  <Svg {...props}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></Svg>
);
export const IconRoute = props => (
  <Svg {...props}><circle cx="5" cy="18" r="2.3" /><circle cx="19" cy="6" r="2.3" /><path d="M7 18h7a4 4 0 0 0 4-4v-1a4 4 0 0 0-4-4H9" /></Svg>
);
export const IconTags = props => (
  <Svg {...props}><path d="M12 3h6a2 2 0 0 1 2 2v6l-9.5 9.5a2 2 0 0 1-2.8 0L3 15.8a2 2 0 0 1 0-2.8Z" /><circle cx="15.5" cy="7.5" r="1.4" /></Svg>
);
export const IconBed = props => (
  <Svg {...props}><path d="M3 10V6.5A1.5 1.5 0 0 1 4.5 5H9a1.5 1.5 0 0 1 1.5 1.5V10" /><path d="M3 19v-6h18v6" /><path d="M3 15v-1a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1" /><path d="M13.5 10a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 20.5 10" /></Svg>
);
export const IconNews = props => (
  <Svg {...props}><rect x="3" y="4" width="14" height="16" rx="1.5" /><path d="M17 8h4v10a2 2 0 0 1-2 2h-2" /><path d="M6.5 8h7M6.5 11.5h7M6.5 15h4" /></Svg>
);
export const IconFile = props => (
  <Svg {...props}><path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v5h5" /><path d="M8 13h8M8 17h8" /></Svg>
);
export const IconUsers = props => (
  <Svg {...props}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16.5 5.5a3.2 3.2 0 0 1 0 6.2" /><path d="M17.5 14.2a6.5 6.5 0 0 1 4 5.8" /></Svg>
);
export const IconLogout = props => (
  <Svg {...props}><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" /><path d="M15 16l4-4-4-4" /><path d="M19 12H9" /></Svg>
);
export const IconPlus = props => (
  <Svg {...props}><path d="M12 5v14M5 12h14" /></Svg>
);
export const IconPencil = props => (
  <Svg {...props}><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="M14 6l4 4" /></Svg>
);
export const IconTrash = props => (
  <Svg {...props}><path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /><path d="M10 11v6M14 11v6" /></Svg>
);
export const IconSearch = props => (
  <Svg {...props}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Svg>
);
export const IconLoader = props => (
  <Svg {...props}><path d="M20 12a8 8 0 1 1-2.34-5.66" /></Svg>
);
export const IconUpload = props => (
  <Svg {...props}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></Svg>
);
export const IconX = props => (
  <Svg {...props}><path d="M6 6l12 12M18 6L6 18" /></Svg>
);
export const IconChevronLeft = props => (
  <Svg {...props}><path d="M15 6l-6 6 6 6" /></Svg>
);
export const IconChevronRight = props => (
  <Svg {...props}><path d="M9 6l6 6-6 6" /></Svg>
);
export const IconImage = props => (
  <Svg {...props}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="M21 15l-5.2-5.2a2 2 0 0 0-2.8 0L4 19" /></Svg>
);
export const IconMenu = props => (
  <Svg {...props}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>
);
export const IconExternal = props => (
  <Svg {...props}><path d="M14 4h6v6" /><path d="M10 14L20 4" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></Svg>
);
