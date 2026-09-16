"use client";

import dynamic from "next/dynamic";
import useSWR from "swr";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FilterBar, type FilterValues } from "@/components/FilterBar";
import { getMapPoints } from "@/lib/api";

// Leaflet touches `window` at import time, so it must never run during SSR.
const PetaLaporan = dynamic(
  () => import("@/components/PetaLaporan").then((m) => m.PetaLaporan),
  { ssr: false, loading: () => <MapPlaceholder /> }
);

function MapPlaceholder() {
  return (
    <div className="skeleton-shimmer flex h-full w-full animate-shimmer items-center justify-center">
      <span className="rounded-full bg-white/80 px-4 py-1.5 text-sm text-gray-500 shadow-sm">
        Memuat peta…
      </span>
    </div>
  );
}

export default function PetaPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const kategori = searchParams.get("kategori") ?? "";
  const status = searchParams.get("status") ?? "";

  const { data: points, isLoading } = useSWR(
    ["map-points", kategori, status],
    () => getMapPoints({ kategori: kategori || undefined, status: status || undefined }),
    { revalidateOnFocus: false }
  );

  function handleFilterChange(next: FilterValues) {
    const params = new URLSearchParams();
    if (next.kategori) params.set("kategori", next.kategori);
    if (next.status) params.set("status", next.status);
    router.replace(params.toString() ? `${pathname}?${params}` : pathname, { scroll: false });
  }

  const filterValue: FilterValues = { kategori, wilayah: "", status, sort: "terbaru" };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Peta Laporan</h1>
      <p className="mt-1 text-gray-600">
        Lokasi laporan ditampilkan secara umum, bukan alamat presisi, untuk menjaga privasi pelapor.
      </p>

      {/* Mobile: filter panel stacks as a normal block above the map.
          md+: it becomes the floating overlay the spec describes (§3.3). */}
      <div className="mt-6 flex flex-col gap-4 md:relative md:block">
        <div className="md:absolute md:left-4 md:top-4 md:z-[1000] md:w-72">
          <FilterBar value={filterValue} onChange={handleFilterChange} showWilayah={false} showSort={false} />
        </div>

        <div className="h-[560px] w-full overflow-hidden rounded-lg border border-gray-200">
          {isLoading || !points ? <MapPlaceholder /> : <PetaLaporan points={points} />}
        </div>
      </div>
    </div>
  );
}
