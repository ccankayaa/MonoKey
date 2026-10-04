const paths = {
  dashboard: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  subscriptions: "M3 5h18v14H3z M3 10h18 M7 15h3",
  vault: "M14 7a5 5 0 1 1-4 8L3 22v-4l6-6 M16 8h.01",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2",
  plus: "M12 5v14 M5 12h14", lock: "M5 10h14v11H5z M8 10V7a4 4 0 0 1 8 0v3",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M15 15l6 6",
  bell: "M18 8a6 6 0 0 0-12 0v7l-2 3h16l-2-3z M10 21h4",
  shield: "M12 2l9 4v6c0 5-5 8-9 10-4-2-9-5-9-10V6z M8 12l3 3 5-6",
  logout: "M9 3H3v18h6 M8 12h13 M17 8l4 4-4 4", calendar: "M3 5h18v16H3z M7 2v6 M17 2v6 M3 10h18",
  copy: "M9 9h12v12H9z M15 9V3H3v12h6", eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  link: "M9 15l6-6 M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0 M16 8l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0",
} as const;
export function Icon({ name, size = 20 }: { name: keyof typeof paths; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
