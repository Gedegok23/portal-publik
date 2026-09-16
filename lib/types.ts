// Types mirror the read-only public API contract in PORTAL.md §4.
// IMPORTANT: these types intentionally OMIT sensitive fields that must never
// reach the client — kode_lacak, teks_terredaksi (full), hoax_score,
// butuh_review_manusia, and reporter identity (§3.2 + §6 checklist).
// If the Golang response ever includes those fields, that's a backend bug —
// the frontend should not need to filter them out here.

export type StatusLaporan =
  | "diterima"
  | "diverifikasi"
  | "ditugaskan"
  | "diproses"
  | "selesai"
  | "ditolak";

export type KategoriLaporan =
  | "infrastruktur"
  | "kesehatan"
  | "sosial"
  | "lingkungan"
  | "keamanan"
  | "lainnya";

export interface StatusLogEntry {
  status: StatusLaporan;
  tanggal: string; // ISO 8601
  // Deliberately no petugas/officer name (§3.4: "tanpa nama petugas")
}

export interface LaporanSummary {
  id: string;
  kategori: KategoriLaporan;
  lokasi_umum: string; // general location, not precise address
  ringkasan: string; // short summary, not full redacted text
  status: StatusLaporan;
  duplicate_of: string | null; // parent laporan id, if this is a duplicate
  jumlah_serupa: number; // "N laporan serupa" badge count
  tanggal: string; // ISO 8601
}

export interface LaporanDetail extends LaporanSummary {
  status_log: StatusLogEntry[];
  foto_sebelum: string | null; // "before" photo URL
  foto_sesudah: string | null; // "after" photo URL, populated when selesai
}

export interface LaporanMapPoint {
  id: string;
  kategori: KategoriLaporan;
  status: StatusLaporan;
  ringkasan: string;
  lat: number;
  lng: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface LaporanListParams {
  kategori?: KategoriLaporan;
  wilayah?: string;
  status?: StatusLaporan;
  sort?: "terbaru" | "urgensi";
  page?: number;
  q?: string;
}

export interface ScorecardRow {
  instansi_id: string;
  nama_instansi: string;
  jumlah_ditangani: number;
  rata_rata_respons_jam: number; // hours
  rata_rata_penyelesaian_jam: number; // hours
}

export interface TrenKategori {
  kategori: KategoriLaporan;
  jumlah: number;
}

export interface TrenMingguan {
  periode: string; // e.g. "2026-W36" or "2026-09"
  jumlah: number;
}

export interface TrenResponse {
  per_kategori: TrenKategori[];
  per_periode: TrenMingguan[];
  ringkasan_naratif: string; // weekly_summary from AI Agent
}

export interface CekStatusResponse {
  ditemukan: boolean;
  status?: StatusLaporan;
  kategori?: KategoriLaporan;
  status_log?: StatusLogEntry[];
}

export interface StatistikRingkas {
  total_laporan: number;
  jumlah_selesai: number;
  rata_rata_respons_jam: number;
}
