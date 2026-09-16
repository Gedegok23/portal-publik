import Link from "next/link";
import { FileText, CheckCircle2, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaporanCard } from "@/components/LaporanCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { HeroIllustration } from "@/components/illustrations/HeroIllustration";
import { getLaporanList, getStatistikRingkas } from "@/lib/api";
import { KATEGORI_CONFIG, KATEGORI_ORDER, SITE_TAGLINE } from "@/lib/constants";

export default async function BerandaPage() {
  const [statistik, terbaru] = await Promise.all([
    getStatistikRingkas(),
    getLaporanList({ sort: "terbaru", page: 1 }),
  ]);

  const preview = terbaru.data.slice(0, 6);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 animate-float-slow rounded-full bg-blue-100/60 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 animate-float rounded-full bg-teal-100/50 blur-3xl"
          style={{ animationDelay: "1.5s" }}
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-16 sm:py-20 lg:grid-cols-[1fr_360px]">
          <div>
            <h1 className="max-w-2xl text-3xl font-bold text-gray-900 sm:text-4xl">
              Portal Publik
            </h1>
            <p className="mt-3 max-w-xl text-lg text-gray-600">{SITE_TAGLINE}</p>

            <form action="/laporan" className="mt-8 flex max-w-xl gap-2">
              <label htmlFor="search" className="sr-only">
                Cari laporan
              </label>
              <input
                id="search"
                name="q"
                type="search"
                placeholder="Cari berdasarkan kata kunci, lokasi, atau kategori"
                className="w-full rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm shadow-sm"
              />
              <Button type="submit">Cari</Button>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {KATEGORI_ORDER.map((k) => (
                <Link
                  key={k}
                  href={`/laporan?kategori=${k}`}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium shadow-sm transition-transform hover:scale-105 ${KATEGORI_CONFIG[k].tint}`}
                >
                  <span aria-hidden>{KATEGORI_CONFIG[k].icon}</span>
                  {KATEGORI_CONFIG[k].label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <HeroIllustration />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox
            icon={<FileText size={22} className="text-primary" aria-hidden />}
            label="Total laporan"
            value={<AnimatedCounter value={statistik.total_laporan} />}
          />
          <StatBox
            icon={<CheckCircle2 size={22} className="text-accent" aria-hidden />}
            label="Laporan selesai"
            value={<AnimatedCounter value={statistik.jumlah_selesai} />}
          />
          <StatBox
            icon={<Clock3 size={22} className="text-violet-600" aria-hidden />}
            label="Rata-rata waktu respons"
            value={<AnimatedCounter value={statistik.rata_rata_respons_jam} decimals={1} suffix=" jam" />}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Laporan Terbaru</h2>
          <Link href="/laporan" className="text-sm font-medium text-primary hover:underline">
            Lihat semua
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((laporan, i) => (
            <LaporanCard key={laporan.id} laporan={laporan} animationDelayMs={i * 60} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
        {icon}
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}
