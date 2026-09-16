import { STATUS_CONFIG } from "@/lib/constants";
import type { StatusLaporan } from "@/lib/types";
import clsx from "clsx";

const TERMINAL_STATUSES: StatusLaporan[] = ["selesai", "ditolak"];

export function StatusBadge({
  status,
  className,
}: {
  status: StatusLaporan;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  const isActive = !TERMINAL_STATUSES.includes(status);

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
        config.badgeClass,
        className
      )}
    >
      {isActive && (
        <span
          className="h-1.5 w-1.5 animate-pulse-dot rounded-full"
          style={{ backgroundColor: config.hex }}
          aria-hidden
        />
      )}
      {config.label}
    </span>
  );
}
