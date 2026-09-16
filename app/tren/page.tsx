import { CategoryBarChart, PeriodLineChart } from "@/components/TrendChart";
import { getTren } from "@/lib/api";

export const metadata = { title: "Tren & Statistik — Portal Publik" };

export default async function TrenPage() {
  const tren = await getTren();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Tren &amp; Statistik</h1>

      <div className="mt-6 rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Ringkasan Minggu Ini</p>
        <p className="mt-2 text-gray-800">{tren.ringkasan_naratif}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Laporan per Kategori</h2>
          <div className="mt-4">
            <CategoryBarChart data={tren.per_kategori} />
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Tren Laporan per Periode</h2>
          <div className="mt-4">
            <PeriodLineChart data={tren.per_periode} />
          </div>
        </div>
      </div>
    </div>
  );
}
