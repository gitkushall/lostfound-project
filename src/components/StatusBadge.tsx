import { ITEM_STATUS_LABELS, type ItemStatus } from "@/lib/item-options";

const statusClasses: Record<ItemStatus, string> = {
  OPEN: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CLAIM_PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CLAIMED: "bg-sky-100 text-sky-800 border-sky-200",
  RETURNED: "bg-slate-200 text-slate-700 border-slate-300",
};

export function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = (status in ITEM_STATUS_LABELS ? status : "OPEN") as ItemStatus;

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[normalizedStatus]}`}
    >
      {ITEM_STATUS_LABELS[normalizedStatus]}
    </span>
  );
}
