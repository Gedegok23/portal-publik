export function NotFoundIllustration() {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto h-40 w-auto"
      role="img"
      aria-hidden="true"
    >
      <ellipse cx="120" cy="175" rx="70" ry="10" fill="#F3F4F6" />

      <rect x="115" y="60" width="10" height="110" rx="5" fill="#D1D5DB" />

      <g className="animate-float">
        <path
          d="M80 60c0-24 18-42 40-42s40 18 40 42c0 34-40 74-40 74s-40-40-40-74Z"
          fill="#EFF6FF"
          stroke="#2563EB"
          strokeWidth="3"
        />
        <text
          x="120"
          y="70"
          textAnchor="middle"
          fontSize="28"
          fontWeight="700"
          fill="#2563EB"
          fontFamily="sans-serif"
        >
          ?
        </text>
      </g>

      <circle cx="45" cy="120" r="6" fill="#5EEAD4" />
      <circle cx="195" cy="140" r="8" fill="#93C5FD" />
      <circle cx="200" cy="90" r="4" fill="#FDE68A" />
    </svg>
  );
}
