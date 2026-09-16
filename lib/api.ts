import type {
  CekStatusResponse,
  LaporanDetail,
  LaporanListParams,
  LaporanMapPoint,
  LaporanSummary,
  PaginatedResponse,
  ScorecardRow,
  StatistikRingkas,
  TrenResponse,
} from "./types";
import {
  MOCK_LAPORAN,
  MOCK_MAP_POINTS,
  MOCK_SCORECARD,
  MOCK_STATISTIK,
  MOCK_TREN,
  findByKodeLacak,
  findLaporanById,
} from "./mock-data";

// Every function here maps 1:1 to an endpoint in PORTAL.md §4:
//   GET /api/public/laporan
//   GET /api/public/laporan/:id
//   GET /api/public/scorecard
//   GET /api/public/tren
//   GET /api/public/cek-status
//
// When the Golang backend is ready, set NEXT_PUBLIC_API_BASE_URL and these
// functions switch from mock data to real fetch calls automatically — no
// page or component code needs to change.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const USE_MOCK = !API_BASE_URL;

const PER_PAGE = 9;

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    // Public read-only endpoints — no auth header per PORTAL.md §4.
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed with status ${res.status}`);
  }
  return res.json();
}

export async function getLaporanList(
  params: LaporanListParams = {}
): Promise<PaginatedResponse<LaporanSummary>> {
  if (USE_MOCK) {
    let items = [...MOCK_LAPORAN];
    if (params.kategori) items = items.filter((l) => l.kategori === params.kategori);
    if (params.wilayah) items = items.filter((l) => l.lokasi_umum === params.wilayah);
    if (params.status) items = items.filter((l) => l.status === params.status);
    if (params.q) {
      const needle = params.q.trim().toLowerCase();
      items = items.filter(
        (l) =>
          l.ringkasan.toLowerCase().includes(needle) ||
          l.lokasi_umum.toLowerCase().includes(needle) ||
          l.kategori.toLowerCase().includes(needle)
      );
    }
    items.sort((a, b) =>
      params.sort === "urgensi"
        ? (b.jumlah_serupa ?? 0) - (a.jumlah_serupa ?? 0)
        : new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );
    const page = params.page ?? 1;
    const start = (page - 1) * PER_PAGE;
    const pageItems = items.slice(start, start + PER_PAGE);
    return {
      data: pageItems,
      page,
      per_page: PER_PAGE,
      total: items.length,
      total_pages: Math.max(1, Math.ceil(items.length / PER_PAGE)),
    };
  }
  const qs = new URLSearchParams();
  if (params.kategori) qs.set("kategori", params.kategori);
  if (params.wilayah) qs.set("wilayah", params.wilayah);
  if (params.status) qs.set("status", params.status);
  if (params.sort) qs.set("sort", params.sort);
  if (params.page) qs.set("page", String(params.page));
  if (params.q) qs.set("q", params.q);
  return apiGet(`/api/public/laporan?${qs.toString()}`);
}

export async function getLaporanDetail(id: string): Promise<LaporanDetail | null> {
  if (USE_MOCK) return findLaporanById(id) ?? null;
  try {
    return await apiGet<LaporanDetail>(`/api/public/laporan/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

export async function getMapPoints(params: { kategori?: string; status?: string } = {}): Promise<LaporanMapPoint[]> {
  // Confirmed against the real backend: GET /api/public/laporan/map accepts
  // the same kategori/wilayah/status/q filters as the list endpoint.
  if (USE_MOCK) {
    return MOCK_MAP_POINTS.filter(
      (p) => (!params.kategori || p.kategori === params.kategori) && (!params.status || p.status === params.status)
    );
  }
  const qs = new URLSearchParams();
  if (params.kategori) qs.set("kategori", params.kategori);
  if (params.status) qs.set("status", params.status);
  return apiGet<LaporanMapPoint[]>(`/api/public/laporan/map?${qs.toString()}`);
}

export async function getScorecard(): Promise<ScorecardRow[]> {
  if (USE_MOCK) return MOCK_SCORECARD;
  return apiGet<ScorecardRow[]>(`/api/public/scorecard`);
}

export async function getTren(): Promise<TrenResponse> {
  if (USE_MOCK) return MOCK_TREN;
  return apiGet<TrenResponse>(`/api/public/tren`);
}

export async function getCekStatus(kode: string): Promise<CekStatusResponse> {
  if (USE_MOCK) {
    const found = findByKodeLacak(kode);
    if (!found) return { ditemukan: false };
    return {
      ditemukan: true,
      status: found.status,
      kategori: found.kategori,
      status_log: found.status_log,
    };
  }
  return apiGet<CekStatusResponse>(`/api/public/cek-status?kode=${encodeURIComponent(kode)}`);
}

export async function getStatistikRingkas(): Promise<StatistikRingkas> {
  // Confirmed against the real backend: GET /api/public/statistik exists
  // and returns exactly this shape.
  if (USE_MOCK) return MOCK_STATISTIK;
  return apiGet<StatistikRingkas>(`/api/public/statistik`);
}
