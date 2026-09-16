"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/illustrations/EmptyState";
import { getCekStatus } from "@/lib/api";
import { KATEGORI_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import type { CekStatusResponse } from "@/lib/types";

function formatTanggal(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default function CekStatusPage() {
  const [kode, setKode] = useState("");
  const [result, setResult] = useState<CekStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!kode.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await getCekStatus(kode);
      setResult(res);
    } catch {
      setError("Terjadi kesalahan saat memeriksa status. Coba lagi beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Cek Status Laporan</h1>
      <p className="mt-1 text-gray-600">
        Masukkan kode lacak yang Anda terima saat membuat laporan (via Telegram atau kanal lain).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
        <label htmlFor="kode" className="sr-only">
          Kode lacak
        </label>
        <input
          id="kode"
          value={kode}
          onChange={(e) => setKode(e.target.value)}
          placeholder="Contoh: LP-1001"
          className="w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm"
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
          {loading ? "Memeriksa…" : "Cek"}
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {result && !result.ditemukan && (
        <div className="mt-6">
          <EmptyState
            title="Kode lacak tidak ditemukan"
            description="Pastikan kode yang dimasukkan sudah benar, lalu coba lagi."
          />
        </div>
      )}

      {result?.ditemukan && result.status && (
        <div className="mt-6 animate-fade-in-up rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              {result.kategori && `${KATEGORI_CONFIG[result.kategori].icon} ${KATEGORI_CONFIG[result.kategori].label}`}
            </span>
            <StatusBadge status={result.status} />
          </div>

          {result.status_log && result.status_log.length > 0 && (
            <ol className="mt-6 space-y-4 border-l-2 border-gray-200 pl-5">
              {result.status_log.map((entry, i) => (
                <li key={i} className="relative">
                  <span
                    className="absolute -left-[27px] top-1 h-3 w-3 rounded-full"
                    style={{ backgroundColor: STATUS_CONFIG[entry.status].hex }}
                    aria-hidden
                  />
                  <p className="font-medium text-gray-900">{STATUS_CONFIG[entry.status].label}</p>
                  <p className="text-sm text-gray-500">{formatTanggal(entry.tanggal)}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
