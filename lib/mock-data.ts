import type {
  LaporanDetail,
  LaporanMapPoint,
  LaporanSummary,
  ScorecardRow,
  StatusLogEntry,
  TrenResponse,
} from "./types";
import { KATEGORI_ORDER, STATUS_ORDER, WILAYAH_OPTIONS } from "./constants";

// --- Deterministic fake data so the UI has something real to render against
// while the Golang API is being built. Replace by pointing lib/api.ts at the
// real backend — nothing in the page components needs to change.

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

const rand = seededRandom(42);

function buildStatusLog(finalStatus: StatusLogEntry["status"], startDaysAgo: number): StatusLogEntry[] {
  const idx = STATUS_ORDER.indexOf(finalStatus);
  const steps = STATUS_ORDER.slice(0, idx + 1).filter((s) => s !== "ditolak" || finalStatus === "ditolak");
  const log: StatusLogEntry[] = [];
  let daysAgo = startDaysAgo;
  for (const status of steps) {
    log.push({
      status,
      tanggal: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    });
    daysAgo = Math.max(0, daysAgo - Math.round(1 + rand() * 3));
  }
  return log;
}

export const MOCK_LAPORAN: LaporanDetail[] = Array.from({ length: 42 }).map((_, i) => {
  const kategori = KATEGORI_ORDER[i % KATEGORI_ORDER.length];
  const status = STATUS_ORDER[Math.floor(rand() * STATUS_ORDER.length)];
  const daysAgo = Math.floor(rand() * 60);
  const isDuplicateParent = i % 9 === 0;
  return {
    id: `LP-${1000 + i}`,
    kategori,
    lokasi_umum: WILAYAH_OPTIONS[i % WILAYAH_OPTIONS.length],
    ringkasan:
      kategori === "infrastruktur"
        ? "Jalan berlubang mengganggu lalu lintas kendaraan roda dua dan roda empat."
        : kategori === "kesehatan"
        ? "Antrean layanan puskesmas dilaporkan tidak sesuai nomor urut."
        : kategori === "lingkungan"
        ? "Tumpukan sampah belum diangkut lebih dari seminggu."
        : kategori === "sosial"
        ? "Bantuan sosial belum diterima oleh warga terdaftar di wilayah ini."
        : kategori === "keamanan"
        ? "Penerangan jalan umum mati sehingga area rawan pada malam hari."
        : "Laporan warga menunggu tindak lanjut dari instansi terkait.",
    status,
    duplicate_of: !isDuplicateParent && i % 5 === 0 ? `LP-${1000 + (i - (i % 9 || 9))}` : null,
    jumlah_serupa: isDuplicateParent ? 2 + (i % 4) : 0,
    tanggal: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    status_log: buildStatusLog(status, daysAgo),
    foto_sebelum: status === "selesai" ? "https://picsum.photos/seed/before" + i + "/600/400" : null,
    foto_sesudah: status === "selesai" ? "https://picsum.photos/seed/after" + i + "/600/400" : null,
  };
});

export const MOCK_MAP_POINTS: LaporanMapPoint[] = MOCK_LAPORAN.map((l, i) => ({
  id: l.id,
  kategori: l.kategori,
  status: l.status,
  ringkasan: l.ringkasan,
  // scattered around central Palembang for demo purposes
  lat: -2.9761 + (rand() - 0.5) * 0.15,
  lng: 104.7754 + (rand() - 0.5) * 0.15,
}));

export const MOCK_SCORECARD: ScorecardRow[] = [
  { instansi_id: "dinas-pu", nama_instansi: "Dinas Pekerjaan Umum", jumlah_ditangani: 128, rata_rata_respons_jam: 6.2, rata_rata_penyelesaian_jam: 72 },
  { instansi_id: "dinas-kesehatan", nama_instansi: "Dinas Kesehatan", jumlah_ditangani: 94, rata_rata_respons_jam: 4.8, rata_rata_penyelesaian_jam: 48 },
  { instansi_id: "dinas-sosial", nama_instansi: "Dinas Sosial", jumlah_ditangani: 61, rata_rata_respons_jam: 9.1, rata_rata_penyelesaian_jam: 120 },
  { instansi_id: "dlh", nama_instansi: "Dinas Lingkungan Hidup", jumlah_ditangani: 77, rata_rata_respons_jam: 5.5, rata_rata_penyelesaian_jam: 36 },
  { instansi_id: "satpol-pp", nama_instansi: "Satpol PP", jumlah_ditangani: 53, rata_rata_respons_jam: 11.4, rata_rata_penyelesaian_jam: 96 },
].sort((a, b) => a.rata_rata_penyelesaian_jam - b.rata_rata_penyelesaian_jam);

export const MOCK_TREN: TrenResponse = {
  per_kategori: KATEGORI_ORDER.map((kategori) => ({
    kategori,
    jumlah: MOCK_LAPORAN.filter((l) => l.kategori === kategori).length,
  })),
  per_periode: Array.from({ length: 8 }).map((_, i) => ({
    periode: `Minggu ${i + 1}`,
    jumlah: 10 + Math.floor(rand() * 25),
  })),
  ringkasan_naratif:
    "Jumlah laporan minggu ini relatif stabil dibanding minggu sebelumnya, dengan kategori infrastruktur tetap mendominasi. Waktu respons rata-rata membaik tipis dibanding bulan lalu.",
};

export function findLaporanById(id: string): LaporanDetail | undefined {
  return MOCK_LAPORAN.find((l) => l.id === id);
}

export function findByKodeLacak(kode: string): LaporanDetail | undefined {
  // In the real backend, kode_lacak is a private lookup token distinct from
  // the public id — it must never be returned to the client, only a status
  // result derived from it (see CekStatusResponse in lib/types.ts).
  return MOCK_LAPORAN.find((l) => l.id.toLowerCase() === kode.trim().toLowerCase());
}

export const MOCK_STATISTIK = {
  total_laporan: MOCK_LAPORAN.length,
  jumlah_selesai: MOCK_LAPORAN.filter((l) => l.status === "selesai").length,
  rata_rata_respons_jam: 6.8,
};
