"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { usePathname } from "next/navigation";
import { FilterBar, type FilterValues } from "./FilterBar";
import { Pagination } from "./Pagination";
import { LaporanCard } from "./LaporanCard";
import { EmptyState } from "./illustrations/EmptyState";
import { getLaporanList } from "@/lib/api";
import type {
  KategoriLaporan,
  LaporanListParams,
  LaporanSummary,
  PaginatedResponse,
  StatusLaporan,
} from "@/lib/types";

interface Props {
  initialData: PaginatedResponse<LaporanSummary>;
  initialParams: LaporanListParams;
}

function buildQueryString(params: LaporanListParams): string {
  const qs = new URLSearchParams();
  if (params.kategori) qs.set("kategori", params.kategori);
  if (params.wilayah) qs.set("wilayah", params.wilayah);
  if (params.status) qs.set("status", params.status);
  if (params.sort) qs.set("sort", params.sort);
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  if (params.q) qs.set("q", params.q);
  return qs.toString();
}

function sameParams(a: LaporanListParams, b: LaporanListParams): boolean {
  return (
    a.kategori === b.kategori &&
    a.wilayah === b.wilayah &&
    a.status === b.status &&
    a.sort === b.sort &&
    a.page === b.page &&
    a.q === b.q
  );
}

export function LaporanListClient({ initialData, initialParams }: Props) {
  const pathname = usePathname();
  const [params, setParams] = useState<LaporanListParams>(initialParams);

  const { data, isLoading } = useSWR(
    ["laporan-list", params.kategori, params.wilayah, params.status, params.sort, params.page, params.q],
    () => getLaporanList(params),
    {
      // Only the very first render (matching the server-fetched params) gets
      // fallback data — every filter/page change after that is a genuine
      // client-side SWR fetch, per PORTAL.md §1's "SWR untuk filter
      // interaktif di client".
      fallbackData: sameParams(params, initialParams) ? initialData : undefined,
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  // Keep the URL bar shareable/bookmarkable without triggering a Next.js
  // server round-trip — that round-trip is exactly what SWR is meant to
  // replace here.
  useEffect(() => {
    const qs = buildQueryString(params);
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [params, pathname]);

  function handleFilterChange(next: FilterValues) {
    setParams((prev) => ({
      ...prev,
      kategori: (next.kategori as KategoriLaporan) || undefined,
      wilayah: next.wilayah || undefined,
      status: (next.status as StatusLaporan) || undefined,
      sort: (next.sort as "terbaru" | "urgensi") || undefined,
      page: 1,
    }));
  }

  function handlePageChange(page: number) {
    setParams((prev) => ({ ...prev, page }));
  }

  function handleClearQuery() {
    setParams((prev) => ({ ...prev, q: undefined, page: 1 }));
  }

  const filterValue: FilterValues = {
    kategori: params.kategori ?? "",
    wilayah: params.wilayah ?? "",
    status: params.status ?? "",
    sort: params.sort ?? "terbaru",
  };

  const result = data ?? initialData;

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <FilterBar
        value={filterValue}
        onChange={handleFilterChange}
        query={params.q}
        onClearQuery={params.q ? handleClearQuery : undefined}
      />

      <div className={isLoading ? "opacity-60 transition-opacity" : "transition-opacity"}>
        {result.data.length === 0 ? (
          <EmptyState
            title="Tidak ada laporan yang cocok"
            description="Coba ubah atau hapus salah satu filter untuk melihat lebih banyak laporan."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {result.data.map((laporan, i) => (
              <LaporanCard key={laporan.id} laporan={laporan} animationDelayMs={i * 50} />
            ))}
          </div>
        )}

        <div className="mt-8">
          <Pagination page={result.page} totalPages={result.total_pages} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
}
