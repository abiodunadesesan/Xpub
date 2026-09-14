/** Stylized Girne map — Puzzle Inn–inspired tilt graphic for X Pub. */
export function XPubMap({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 720 640"
      className={className}
      role="img"
      aria-label="Map showing X Pub on Şht. Fehmi Ercan Street, Girne"
    >
      <defs>
        <linearGradient id="mapSea" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#061018" />
          <stop offset="100%" stopColor="#0a1620" />
        </linearGradient>
        <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="720" height="640" fill="url(#mapSea)" />

      <g
        fill="none"
        stroke="#d4af37"
        strokeOpacity="0.55"
        strokeWidth="2"
        filter="url(#mapGlow)"
      >
        <path d="M40 520 L280 80 L680 120" />
        <path d="M20 420 L300 60 L700 200" />
        <path d="M60 580 L360 140 L700 340" />
        <path d="M120 600 L420 220 L700 460" />
        <path d="M80 120 L200 560" />
        <path d="M180 40 L320 600" />
        <path d="M300 20 L460 620" />
        <path d="M420 40 L580 600" />
        <path d="M540 80 L680 520" />
        <path d="M100 300 L640 260" strokeOpacity="0.35" />
        <path d="M140 380 L680 340" strokeOpacity="0.3" />
      </g>

      <path
        d="M480 40 C560 120, 620 200, 700 280 L700 40 Z"
        fill="#0d2840"
        opacity="0.55"
      />
      <path
        d="M500 60 C580 140, 640 220, 700 300"
        fill="none"
        stroke="#fae900"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeDasharray="6 8"
      />

      <g fontFamily="Ubuntu, Helvetica, sans-serif" fontSize="13" fill="#f5f5f5">
        <g transform="translate(88,140)">
          <rect width="18" height="18" fill="#fae900" />
          <text x="24" y="14" fill="white" opacity="0.9">
            Girne Harbour
          </text>
        </g>
        <g transform="translate(520,160)">
          <rect width="18" height="18" fill="#fae900" />
          <text x="24" y="14" fill="white" opacity="0.9">
            Kyrenia Castle
          </text>
        </g>
        <g transform="translate(70,470)">
          <rect width="18" height="18" fill="#fae900" />
          <text x="24" y="14" fill="white" opacity="0.9">
            Fehmi Ercan St
          </text>
        </g>
        <g transform="translate(480,500)">
          <rect width="18" height="18" fill="#fae900" />
          <text x="24" y="14" fill="white" opacity="0.9">
            Nightlife Strip
          </text>
        </g>
      </g>

      <g transform="translate(310,290)">
        <line
          x1="-90"
          y1="8"
          x2="-18"
          y2="8"
          stroke="#fae900"
          strokeWidth="2"
          strokeDasharray="3 5"
        />
        <text
          x="-96"
          y="14"
          textAnchor="end"
          fill="#fae900"
          fontFamily="Invasion2000, monospace"
          fontSize="28"
          filter="url(#mapGlow)"
        >
          X Pub
        </text>
        <g filter="url(#mapGlow)">
          <path
            d="M0 -22 L6 -6 L22 -6 L10 4 L14 20 L0 10 L-14 20 L-10 4 L-22 -6 L-6 -6 Z"
            fill="#fae900"
          />
          <circle cx="0" cy="0" r="4" fill="#000" />
        </g>
        <text
          x="0"
          y="42"
          textAnchor="middle"
          fill="white"
          opacity="0.7"
          fontFamily="Ubuntu, Helvetica, sans-serif"
          fontSize="12"
        >
          No:13 · Girne
        </text>
      </g>
    </svg>
  );
}
