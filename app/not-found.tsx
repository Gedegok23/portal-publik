import Link from "next/link";
import { NotFoundIllustration } from "@/components/illustrations/NotFoundIllustration";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <NotFoundIllustration />
      <h1 className="mt-6 text-2xl font-semibold text-gray-900">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-gray-600">
        Laporan yang Anda cari mungkin sudah dihapus atau alamatnya salah.
      </p>
      <Link href="/laporan" className="mt-6 inline-block text-primary hover:underline">
        Kembali ke daftar laporan
      </Link>
    </div>
  );
}
