"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { KATEGORI_CONFIG, KATEGORI_ORDER, STATUS_CONFIG, STATUS_ORDER, WILAYAH_OPTIONS } from "@/lib/constants";
import clsx from "clsx";

export interface FilterValues {
  kategori: string;
  wilayah: string;
  status: string;
  sort: string;
}

interface FilterBarProps {
  /** Controlled mode (used by the SWR-driven /laporan list): pass current values + a change handler. */
  value?: FilterValues;
  onChange?: (next: FilterValues) => void;
  /** Optional active free-text search term, with a way to clear it. */
  query?: string;
  onClearQuery?: () => void;
  /** §3.3: the map page only filters by kategori/status, not wilayah/sort. */
  showWilayah?: boolean;
  showSort?: boolean;
}

const ALL_TINT = "bg-gray-100 text-gray-700";
const ALL_SOLID = "bg-gray-800 text-white";

export function FilterBar({
  value,
  onChange,
  query,
  onClearQuery,
  showWilayah = true,
  showSort = true,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Controlled mode: filter state lives in the parent (SWR-driven), no URL navigation here.
  const isControlled = value !== undefined && onChange !== undefined;

  const kategori = isControlled ? value!.kategori : searchParams.get("kategori") ?? "";
  const wilayah = isControlled ? value!.wilayah : searchParams.get("wilayah") ?? "";
  const status = isControlled ? value!.status : searchParams.get("status") ?? "";
  const sort = isControlled ? value!.sort : searchParams.get("sort") ?? "terbaru";

  function updateParam(key: keyof FilterValues, val: string) {
    if (isControlled) {
      onChange!({ kategori, wilayah, status, sort, [key]: val });
      return;
    }
    // Uncontrolled mode (used by /peta): drive filters through the URL.
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    params.delete("page"); // reset pagination whenever filters change
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      {query && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
          <span>
            Menampilkan hasil untuk <strong>&ldquo;{query}&rdquo;</strong>
          </span>
          {onClearQuery && (
            <button
              type="button"
              onClick={onClearQuery}
              className="shrink-0 rounded-lg p-1 hover:bg-blue-100"
              aria-label="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Kategori</p>
        <div className="flex flex-wrap gap-2">
          <ChipButton
            active={kategori === ""}
            onClick={() => updateParam("kategori", "")}
            label="Semua"
            tint={ALL_TINT}
            solid={ALL_SOLID}
          />
          {KATEGORI_ORDER.map((k) => (
            <ChipButton
              key={k}
              active={kategori === k}
              onClick={() => updateParam("kategori", k)}
              label={`${KATEGORI_CONFIG[k].icon} ${KATEGORI_CONFIG[k].label}`}
              tint={KATEGORI_CONFIG[k].tint}
              solid={KATEGORI_CONFIG[k].solid}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Status</p>
        <div className="flex flex-wrap gap-2">
          <ChipButton
            active={status === ""}
            onClick={() => updateParam("status", "")}
            label="Semua"
            tint={ALL_TINT}
            solid={ALL_SOLID}
          />
          {STATUS_ORDER.map((s) => (
            <ChipButton
              key={s}
              active={status === s}
              onClick={() => updateParam("status", s)}
              label={STATUS_CONFIG[s].label}
              tint={STATUS_CONFIG[s].badgeClass}
              solid={STATUS_CONFIG[s].solidClass}
            />
          ))}
        </div>
      </div>

      {(showWilayah || showSort) && (
        <div className="flex flex-wrap items-end gap-4">
          {showWilayah && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Wilayah</span>
              <select
                value={wilayah}
                onChange={(e) => updateParam("wilayah", e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Semua wilayah</option>
                {WILAYAH_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </label>
          )}

          {showSort && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Urutkan</span>
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="terbaru">Terbaru</option>
                <option value="urgensi">Urgensi</option>
              </select>
            </label>
          )}
        </div>
      )}
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  label,
  tint,
  solid,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tint: string;
  solid: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-150",
        active ? `${solid} scale-105 shadow-sm` : `${tint} hover:scale-105`
      )}
    >
      {label}
    </button>
  );
}
