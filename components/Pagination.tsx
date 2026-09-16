"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Controlled mode (SWR-driven /laporan list): handle the page change yourself. */
  onPageChange?: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(target: number) {
    if (onPageChange) {
      onPageChange(target);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(target));
    router.push(`${pathname}?${params.toString()}`);
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Navigasi halaman">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
        className="h-auto px-4 py-1.5"
      >
        Sebelumnya
      </Button>

      <div className="flex gap-1">
        {pages.map((p) => (
          <Button
            key={p}
            variant="ghost"
            size="sm"
            onClick={() => goTo(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(p === page && "bg-primary text-white shadow-sm hover:bg-blue-700")}
          >
            {p}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => goTo(page + 1)}
        className="h-auto px-4 py-1.5"
      >
        Berikutnya
      </Button>
    </nav>
  );
}
