export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 420 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full max-w-md"
      role="img"
      aria-label="Ilustrasi laporan warga yang ditinjau dan diselesaikan"
    >
      {/* soft backdrop blob */}
      <ellipse cx="210" cy="190" rx="170" ry="150" fill="#EFF6FF" />

      {/* map pin, floating */}
      <g className="animate-float">
        <path
          d="M100 120c0-22 18-40 40-40s40 18 40 40c0 30-40 68-40 68s-40-38-40-68Z"
          fill="#0D9488"
          opacity="0.15"
        />
        <path
          d="M108 118c0-18 14-32 32-32s32 14 32 32c0 24-32 54-32 54s-32-30-32-54Z"
          fill="#0D9488"
        />
        <circle cx="140" cy="118" r="12" fill="white" />
      </g>

      {/* report card */}
      <g className="animate-float-slow" style={{ animationDelay: "0.6s" }}>
        <rect x="170" y="110" width="180" height="150" rx="16" fill="white" stroke="#E5E7EB" strokeWidth="2" />
        <rect x="192" y="136" width="90" height="10" rx="5" fill="#2563EB" />
        <rect x="192" y="158" width="136" height="8" rx="4" fill="#E5E7EB" />
        <rect x="192" y="174" width="110" height="8" rx="4" fill="#E5E7EB" />
        <rect x="192" y="200" width="70" height="24" rx="12" fill="#DCFCE7" />
        <rect x="202" y="208" width="50" height="8" rx="4" fill="#16A34A" />
      </g>

      {/* checkmark badge */}
      <g className="animate-float" style={{ animationDelay: "1.1s" }}>
        <circle cx="320" cy="105" r="26" fill="#16A34A" />
        <path
          d="M309 105l8 8 16-16"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* base line / ground shadow */}
      <ellipse cx="230" cy="300" rx="130" ry="14" fill="#DBEAFE" opacity="0.6" />

      {/* small scattered dots for texture */}
      <circle cx="90" cy="240" r="5" fill="#93C5FD" />
      <circle cx="350" cy="230" r="4" fill="#5EEAD4" />
      <circle cx="330" cy="280" r="6" fill="#BFDBFE" />
    </svg>
  );
}
