import type { KategoriLaporan } from "@/lib/types";
import { KATEGORI_CONFIG } from "@/lib/constants";

// Each category gets a distinct, original vector motif (not a downloaded
// photo) so every card has real visual content without requiring a photo
// field the API contract doesn't provide for list items (see PORTAL.md §4 —
// only the detail endpoint has foto_sebelum/foto_sesudah, and only for
// completed reports).

function Motif({ kategori }: { kategori: KategoriLaporan }) {
  switch (kategori) {
    case "infrastruktur":
      return (
        <g>
          <rect x="20" y="70" width="160" height="8" rx="4" fill="white" fillOpacity="0.5" />
          <path d="M90 30 L110 30 L118 60 L82 60 Z" fill="white" fillOpacity="0.9" />
          <rect x="93" y="38" width="14" height="6" fill="currentColor" />
          <rect x="93" y="48" width="14" height="6" fill="currentColor" />
        </g>
      );
    case "kesehatan":
      return (
        <g>
          <circle cx="100" cy="50" r="34" fill="white" fillOpacity="0.25" />
          <rect x="88" y="34" width="24" height="32" rx="6" fill="white" fillOpacity="0.95" />
          <rect x="94" y="42" width="12" height="16" fill="currentColor" />
          <rect x="90" y="46" width="20" height="8" fill="currentColor" />
        </g>
      );
    case "sosial":
      return (
        <g>
          <circle cx="85" cy="45" r="16" fill="white" fillOpacity="0.9" />
          <circle cx="115" cy="45" r="16" fill="white" fillOpacity="0.6" />
          <path d="M65 78c0-12 9-20 20-20s20 8 20 20" fill="white" fillOpacity="0.9" />
          <path d="M95 78c0-12 9-20 20-20s20 8 20 20" fill="white" fillOpacity="0.6" />
        </g>
      );
    case "lingkungan":
      return (
        <g>
          <rect x="96" y="60" width="8" height="24" fill="white" fillOpacity="0.9" />
          <circle cx="100" cy="42" r="26" fill="white" fillOpacity="0.9" />
          <circle cx="78" cy="55" r="16" fill="white" fillOpacity="0.6" />
          <circle cx="122" cy="55" r="16" fill="white" fillOpacity="0.6" />
        </g>
      );
    case "keamanan":
      return (
        <g>
          <path
            d="M100 24c14 6 24 8 34 8 0 30-14 46-34 54-20-8-34-24-34-54 10 0 20-2 34-8Z"
            fill="white"
            fillOpacity="0.9"
          />
          <path d="M90 56l7 7 15-16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      );
    case "lainnya":
    default:
      return (
        <g>
          <rect x="70" y="24" width="60" height="72" rx="8" fill="white" fillOpacity="0.9" />
          <rect x="80" y="38" width="40" height="6" rx="3" fill="currentColor" />
          <rect x="80" y="52" width="40" height="6" rx="3" fill="currentColor" />
          <rect x="80" y="66" width="26" height="6" rx="3" fill="currentColor" />
        </g>
      );
  }
}

export function CategoryCover({ kategori }: { kategori: KategoriLaporan }) {
  const config = KATEGORI_CONFIG[kategori];
  return (
    <svg
      viewBox="0 0 200 100"
      xmlns="http://www.w3.org/2000/svg"
      className="h-28 w-full"
      style={{ color: config.hex }}
      role="img"
      aria-label={`Ilustrasi kategori ${config.label}`}
    >
      <rect width="200" height="100" fill={config.hex} />
      <circle cx="20" cy="90" r="26" fill="white" fillOpacity="0.08" />
      <circle cx="185" cy="15" r="20" fill="white" fillOpacity="0.08" />
      <Motif kategori={kategori} />
    </svg>
  );
}
