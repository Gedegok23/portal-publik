import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { StatusBadge } from "@/components/StatusBadge";
import { getLaporanDetail } from "@/lib/api";
import { KATEGORI_CONFIG, STATUS_CONFIG } from "@/lib/constants";

function formatTanggal(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function DetailLaporanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const laporan = await getLaporanDetail(id);
  if (!laporan) notFound();

  const kategori = KATEGORI_CONFIG[laporan.kategori];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/laporan" className="text-sm font-medium text-primary hover:underline">
        &larr; Kembali ke daftar laporan
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600">
            <span aria-hidden>{kategori.icon}</span>
            {kategori.label}
          </span>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">{laporan.ringkasan}</h1>
          <p className="mt-1 text-gray-500">{laporan.lokasi_umum}</p>
        </div>
        <StatusBadge status={laporan.status} />
      </div>

      {laporan.duplicate_of && (
        <p className="mt-4 rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-800">
          Laporan ini serupa dengan{" "}
          <Link href={`/laporan/${laporan.duplicate_of}`} className="font-medium underline">
            {laporan.duplicate_of}
          </Link>
          .
        </p>
      )}

      {laporan.jumlah_serupa > 0 && (
        <p className="mt-4 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
          {laporan.jumlah_serupa} laporan serupa dari warga lain
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Riwayat Status</h2>
        <ol className="mt-4 space-y-4 border-l-2 border-gray-200 pl-5">
          {laporan.status_log.map((entry, i) => (
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
      </section>

      {laporan.status === "selesai" && laporan.foto_sebelum && laporan.foto_sesudah && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Foto Sebelum &amp; Sesudah</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <figure>
              <div className="relative h-56 w-full overflow-hidden rounded-lg bg-gray-100">
                <Image src={laporan.foto_sebelum} alt="Kondisi sebelum ditangani" fill className="object-cover" unoptimized />
              </div>
              <figcaption className="mt-2 text-sm text-gray-500">Sebelum</figcaption>
            </figure>
            <figure>
              <div className="relative h-56 w-full overflow-hidden rounded-lg bg-gray-100">
                <Image src={laporan.foto_sesudah} alt="Kondisi setelah ditangani" fill className="object-cover" unoptimized />
              </div>
              <figcaption className="mt-2 text-sm text-gray-500">Sesudah</figcaption>
            </figure>
          </div>
        </section>
      )}
    </div>
  );
}
