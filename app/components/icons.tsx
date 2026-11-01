type Props = { className?: string };

const base = "h-5 w-5";

export const Icon = {
  check: ({ className = base }: Props) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  arrow: ({ className = base }: Props) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  ),
  phone: ({ className = base }: Props) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.8 2.1z" />
    </svg>
  ),
  mail: ({ className = base }: Props) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="m3 7 9 6 9-6" />
    </svg>
  ),
  clock: ({ className = base }: Props) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5.3l3.3 2" />
    </svg>
  ),
  shield: ({ className = base }: Props) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l8 3v5.5c0 4.6-3.3 8.8-8 10-4.7-1.2-8-5.4-8-10V6z" /><path d="m9 12 2 2 4-4" />
    </svg>
  ),
  truck: ({ className = base }: Props) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 16V7a1 1 0 0 1 1-1h10v10M14 10h4l3 3.5V16" /><circle cx="7.5" cy="17.5" r="2" /><circle cx="17" cy="17.5" r="2" />
    </svg>
  ),
  camera: ({ className = base }: Props) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.4" />
    </svg>
  ),
  spinner: ({ className = base }: Props) => (
    <svg viewBox="0 0 24 24" className={`${className} spinner`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  ),
  car: ({ className = base }: Props) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 15v2.5M20 15v2.5M3 14l1.4-4.6A2 2 0 0 1 6.3 8h11.4a2 2 0 0 1 1.9 1.4L21 14v3H3z" /><circle cx="7" cy="14" r="1" /><circle cx="17" cy="14" r="1" />
    </svg>
  ),
  bike: ({ className = base }: Props) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5.5" cy="16.5" r="3.5" /><circle cx="18.5" cy="16.5" r="3.5" /><path d="M5.5 16.5 10 9h5l2 3M9 9h4" />
    </svg>
  ),
  caravan: ({ className = base }: Props) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h13a4 4 0 0 1 4 4v6H3z" /><path d="M20 17h2" /><circle cx="8" cy="17" r="2" /><rect x="6" y="10" width="5" height="4" rx="1" />
    </svg>
  ),
  trailer: ({ className = base }: Props) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 14h15v-4H2zM17 12h3l2 2M2 14h15" /><circle cx="7" cy="17" r="2" /><circle cx="14" cy="17" r="2" />
    </svg>
  ),
};
