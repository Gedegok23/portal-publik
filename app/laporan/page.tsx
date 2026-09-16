import { LaporanListClient } from "@/components/LaporanListClient";
import { getLaporanList } from "@/lib/api";
import type { KategoriLaporan, LaporanListParams, StatusLaporan } from "@/lib/types";

export const metadata = { title: "Daftar Laporan — Portal Publik" };

export default async function DaftarLaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const initialParams: LaporanListParams = {
    kategori: sp.kategori as KategoriLaporan | undefined,
    wilayah: sp.wilayah,
    status: sp.status as StatusLaporan | undefined,
    sort: sp.sort as "terbaru" | "urgensi" | undefined,
    page: Number(sp.page ?? "1") || 1,
    q: sp.q,
  };

  // Server-rendered first paint for SEO (§1) — everything after this is
  // handled client-side by LaporanListClient via SWR.
  const initialData = await getLaporanList(initialParams);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Daftar Laporan</h1>
      <p className="mt-1 text-gray-600">
        {initialData.total} laporan ditemukan. Gunakan filter untuk mempersempit pencarian.
      </p>

      <LaporanListClient initialData={initialData} initialParams={initialParams} />
    </div>
  );
}
