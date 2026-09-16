import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Logo } from "@/components/Logo";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_TAGLINE,
};

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/laporan", label: "Daftar Laporan" },
  { href: "/peta", label: "Peta" },
  { href: "/scorecard", label: "Scorecard" },
  { href: "/tren", label: "Tren & Statistik" },
  { href: "/cek-status", label: "Cek Status" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
        >
          Lewati ke konten
        </a>

        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Logo />
              {SITE_NAME}
            </Link>
            <nav aria-label="Navigasi utama">
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-gray-600">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="relative py-1 transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        <main id="main-content">{children}</main>

        <footer className="mt-16 border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500">
            <p>{SITE_NAME} — {SITE_TAGLINE}</p>
            <p className="mt-1">Data laporan diperbarui secara berkala dari sistem pengaduan warga.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
