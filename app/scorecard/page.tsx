import { ScorecardTable } from "@/components/ScorecardTable";
import { getScorecard } from "@/lib/api";

export const metadata = { title: "Scorecard Instansi — Portal Publik" };

export default async function ScorecardPage() {
  const data = await getScorecard();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Scorecard Instansi</h1>
      <p className="mt-1 max-w-2xl text-gray-600">
        Diurutkan dari yang tercepat menyelesaikan laporan ke yang paling lambat, sebagai bentuk
        akuntabilitas publik.
      </p>

      <div className="mt-6">
        <ScorecardTable data={data} />
      </div>
    </div>
  );
}
