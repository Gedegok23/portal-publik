function EmptyStateIllustration() {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto h-32 w-auto"
      role="img"
      aria-hidden="true"
    >
      <ellipse cx="100" cy="140" rx="60" ry="10" fill="#F3F4F6" />
      <rect x="55" y="30" width="70" height="90" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="2" />
      <rect x="80" y="20" width="20" height="16" rx="4" fill="#D1D5DB" />
      <rect x="68" y="55" width="44" height="7" rx="3.5" fill="#E5E7EB" />
      <rect x="68" y="70" width="34" height="7" rx="3.5" fill="#E5E7EB" />
      <rect x="68" y="85" width="40" height="7" rx="3.5" fill="#E5E7EB" />
      <circle cx="128" cy="95" r="22" fill="#EFF6FF" stroke="#2563EB" strokeWidth="3" />
      <line x1="144" y1="111" x2="158" y2="125" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white/60 p-10 text-center">
      <EmptyStateIllustration />
      <p className="mt-4 font-medium text-gray-700">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}
