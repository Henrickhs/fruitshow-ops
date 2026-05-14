export function BrandLogo({ compact = false, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        className={compact ? 'h-14 w-14 shrink-0' : 'h-24 w-32 shrink-0'}
        viewBox="0 0 180 140"
        role="img"
        aria-label="Logo Açaí FruitShow"
      >
        <defs>
          <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#130318" floodOpacity="0.25" />
          </filter>
        </defs>
        <path
          d="M83 13c10 9 17 21 16 35-13-2-24-10-31-22 2-6 7-10 15-13Z"
          fill="#75bd43"
        />
        <path
          d="M38 31c17-1 31 5 40 18-16 8-34 5-46-8 1-4 3-7 6-10Z"
          fill="#8ed24e"
        />
        <path
          d="M123 31c-13 3-24 12-31 26 15 5 32 0 41-13-1-6-5-10-10-13Z"
          fill="#9ed95b"
        />
        <path
          d="M29 72c-9-14 2-26 18-27 7-15 25-18 37-8 12-13 35-8 39 10 18 2 27 18 17 33 10 15 1 31-16 33-5 17-26 22-39 11-14 9-34 3-39-13-17-4-24-22-17-39Z"
          fill="#2d0c32"
          stroke="#7fbd42"
          strokeWidth="5"
          filter="url(#logo-shadow)"
        />
        <circle cx="76" cy="48" r="18" fill="#5b237d" />
        <circle cx="96" cy="45" r="18" fill="#6f2a86" />
        <circle cx="107" cy="61" r="17" fill="#57206f" />
        <circle cx="84" cy="66" r="18" fill="#823c97" />
        <path
          d="M46 83c22 13 56 17 91 5"
          fill="none"
          stroke="#ffffff"
          strokeDasharray="8 9"
          strokeLinecap="round"
          strokeOpacity="0.38"
          strokeWidth="2"
        />
        <text
          x="91"
          y="80"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="42"
          fontWeight="900"
          fill="#fff8c9"
          stroke="#5b237d"
          strokeWidth="6"
          paintOrder="stroke"
        >
          Açaí
        </text>
        <text
          x="91"
          y="111"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="31"
          fontWeight="900"
          fill="#ffe94d"
          stroke="#5b237d"
          strokeWidth="5"
          paintOrder="stroke"
        >
          FruitShow
        </text>
      </svg>
      {showText && !compact && (
        <div>
          <p className="text-lg font-black leading-tight">FruitShow Ops</p>
          <p className="text-xs text-acai-100">Açaí FruitShow</p>
        </div>
      )}
    </div>
  );
}
