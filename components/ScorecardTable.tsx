import type { ScorecardRow } from "@/lib/types";

function formatJam(jam: number) {
  if (jam < 24) return `${jam.toFixed(1)} jam`;
  return `${(jam / 24).toFixed(1)} hari`;
}

export function ScorecardTable({ data }: { data: ScorecardRow[] }) {
  return (
    <>
      {/* Mobile (§6 checklist: table becomes cards on small screens) */}
      <div className="space-y-3 md:hidden">
        {data.map((row, i) => (
          <div
            key={row.instansi_id}
            className={`rounded-lg border p-4 shadow-sm ${
              i === 0 ? "border-teal-200 bg-teal-50/40" : "border-gray-100 bg-white"
            }`}
          >
            <p className="font-medium text-gray-900">{row.nama_instansi}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="text-gray-500">Ditangani</dt>
                <dd className="mt-0.5 font-medium text-gray-800">{row.jumlah_ditangani}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Respons</dt>
                <dd className="mt-0.5 font-medium text-gray-800">{formatJam(row.rata_rata_respons_jam)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Selesai</dt>
                <dd className="mt-0.5 font-medium text-gray-800">{formatJam(row.rata_rata_penyelesaian_jam)}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      {/* Desktop/tablet: full table */}
      <div className="hidden overflow-x-auto rounded-lg border border-gray-100 shadow-sm md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Instansi</th>
              <th className="px-4 py-3 font-medium">Laporan ditangani</th>
              <th className="px-4 py-3 font-medium">Rata-rata respons</th>
              <th className="px-4 py-3 font-medium">Rata-rata penyelesaian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, i) => (
              <tr key={row.instansi_id} className={i === 0 ? "bg-teal-50/40" : undefined}>
                <td className="px-4 py-3 font-medium text-gray-900">{row.nama_instansi}</td>
                <td className="px-4 py-3 text-gray-700">{row.jumlah_ditangani}</td>
                <td className="px-4 py-3 text-gray-700">{formatJam(row.rata_rata_respons_jam)}</td>
                <td className="px-4 py-3 text-gray-700">{formatJam(row.rata_rata_penyelesaian_jam)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
