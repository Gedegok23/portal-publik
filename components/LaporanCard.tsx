import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { CategoryCover } from "./illustrations/CategoryCover";
import { KATEGORI_CONFIG } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import type { LaporanSummary } from "@/lib/types";

export function LaporanCard({
  laporan,
  animationDelayMs = 0,
}: {
  laporan: LaporanSummary;
  animationDelayMs?: number;
}) {
  const kategori = KATEGORI_CONFIG[laporan.kategori];

  return (
    <Link
      href={`/laporan/${laporan.id}`}
      style={{ animationDelay: `${animationDelayMs}ms` }}
      className="group block animate-fade-in-up overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg"
    >
      <div className="relative">
        <CategoryCover kategori={laporan.kategori} />
        <div className="absolute right-3 top-3">
          <StatusBadge status={laporan.status} className="shadow-sm" />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${kategori.tint}`}
            aria-hidden
          >
            {kategori.icon}
          </span>
          <span className="text-sm font-medium text-gray-700">{kategori.label}</span>
        </div>

        <p className="mt-3 text-[15px] leading-snug text-gray-900 transition-colors group-hover:text-primary">
          {laporan.ringkasan}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} className="shrink-0" aria-hidden />
            {laporan.lokasi_umum}
          </span>
          <span aria-hidden>·</span>
          <span>{formatRelativeTime(laporan.tanggal)}</span>
        </div>

        {laporan.jumlah_serupa > 0 && (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            <Users size={12} aria-hidden />
            {laporan.jumlah_serupa} laporan serupa
          </span>
        )}
      </div>
    </Link>
  );
}
