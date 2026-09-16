import type { KategoriLaporan, StatusLaporan } from "./types";

// Single source of truth for status colors — must stay identical to the
// Dashboard app per PORTAL.md §2. If the Dashboard changes its palette,
// change it here AND there, deliberately, not by accident.
export const STATUS_CONFIG: Record<
  StatusLaporan,
  { label: string; hex: string; badgeClass: string; solidClass: string }
> = {
  diterima: {
    label: "Diterima",
    hex: "#F59E0B",
    badgeClass: "bg-amber-100 text-amber-800",
    solidClass: "bg-amber-500 text-white",
  },
  diverifikasi: {
    label: "Diverifikasi",
    hex: "#0EA5E9",
    badgeClass: "bg-sky-100 text-sky-800",
    solidClass: "bg-sky-500 text-white",
  },
  ditugaskan: {
    label: "Ditugaskan",
    hex: "#2563EB",
    badgeClass: "bg-blue-100 text-blue-800",
    solidClass: "bg-blue-600 text-white",
  },
  diproses: {
    label: "Diproses",
    hex: "#7C3AED",
    badgeClass: "bg-violet-100 text-violet-800",
    solidClass: "bg-violet-600 text-white",
  },
  selesai: {
    label: "Selesai",
    hex: "#16A34A",
    badgeClass: "bg-green-100 text-green-800",
    solidClass: "bg-green-600 text-white",
  },
  ditolak: {
    label: "Ditolak",
    hex: "#6B7280",
    badgeClass: "bg-gray-100 text-gray-700",
    solidClass: "bg-gray-500 text-white",
  },
};

export const STATUS_ORDER: StatusLaporan[] = [
  "diterima",
  "diverifikasi",
  "ditugaskan",
  "diproses",
  "selesai",
  "ditolak",
];

export const KATEGORI_CONFIG: Record<
  KategoriLaporan,
  { label: string; icon: string; tint: string; solid: string; bar: string; hex: string }
> = {
  infrastruktur: {
    label: "Infrastruktur",
    icon: "🚧",
    tint: "bg-orange-100 text-orange-700",
    solid: "bg-orange-600 text-white",
    bar: "bg-orange-500",
    hex: "#F97316",
  },
  kesehatan: {
    label: "Kesehatan",
    icon: "🏥",
    tint: "bg-rose-100 text-rose-700",
    solid: "bg-rose-600 text-white",
    bar: "bg-rose-500",
    hex: "#F43F5E",
  },
  sosial: {
    label: "Sosial",
    icon: "🤝",
    tint: "bg-purple-100 text-purple-700",
    solid: "bg-purple-600 text-white",
    bar: "bg-purple-500",
    hex: "#A855F7",
  },
  lingkungan: {
    label: "Lingkungan",
    icon: "🌳",
    tint: "bg-green-100 text-green-700",
    solid: "bg-green-600 text-white",
    bar: "bg-green-500",
    hex: "#22C55E",
  },
  keamanan: {
    label: "Keamanan",
    icon: "🛡️",
    tint: "bg-blue-100 text-blue-700",
    solid: "bg-blue-600 text-white",
    bar: "bg-blue-500",
    hex: "#3B82F6",
  },
  lainnya: {
    label: "Lainnya",
    icon: "📋",
    tint: "bg-gray-100 text-gray-700",
    solid: "bg-gray-600 text-white",
    bar: "bg-gray-400",
    hex: "#9CA3AF",
  },
};

export const KATEGORI_ORDER: KategoriLaporan[] = [
  "infrastruktur",
  "kesehatan",
  "sosial",
  "lingkungan",
  "keamanan",
  "lainnya",
];

// Palembang kecamatan (sub-districts) — single source of truth for the
// wilayah filter and mock data, so the two never drift apart.
export const WILAYAH_OPTIONS = [
  "Kecamatan Ilir Barat I",
  "Kecamatan Ilir Timur II",
  "Kecamatan Kemuning",
  "Kecamatan Plaju",
  "Kecamatan Sukarami",
  "Kecamatan Kalidoni",
];

// Palembang city center — used as the default map view.
export const CITY_CENTER: [number, number] = [-2.9761, 104.7754];

export const SITE_NAME = "Portal Publik";
export const SITE_TAGLINE =
  "Transparansi layanan publik — pantau laporan warga dari pengaduan sampai selesai.";
