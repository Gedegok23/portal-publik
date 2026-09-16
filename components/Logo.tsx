export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="#2563EB" />
      <path
        d="M16 8c-3.3 0-6 2.6-6 6 0 4.5 6 11 6 11s6-6.5 6-11c0-3.4-2.7-6-6-6Z"
        fill="white"
      />
      <circle cx="16" cy="14" r="2.6" fill="#0D9488" />
    </svg>
  );
}
