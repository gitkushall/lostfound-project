import Image from "next/image";
import { StatusBadge } from "./StatusBadge";

type Item = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  category: string;
  locationText: string;
  dateOccurred: string;
  photoUrl: string | null;
  status: string;
  postedBy: { id: string; name: string };
};

export function ItemCard({ item }: { item: Item }) {
  const date = new Date(item.dateOccurred).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const typeClasses =
    item.type === "LOST"
      ? "border-rose-200 bg-rose-50 text-rose-600"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  const description = item.description?.trim() || "No additional description provided yet.";

  return (
    <article className="overflow-hidden rounded-2xl border border-wpu-black/10 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] bg-wpu-gray-light">
        {item.photoUrl ? (
          <Image
            src={item.photoUrl}
            alt={item.title}
            width={640}
            height={480}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-wpu-gray">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </div>
        )}
      </div>
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border px-4 py-1 text-xs font-semibold ${typeClasses}`}>
            {item.type === "LOST" ? "Lost" : "Found"}
          </span>
          <div className="shrink-0">
            <StatusBadge status={item.status} />
          </div>
          <span className="rounded-full border border-wpu-black/10 bg-wpu-gray-light px-4 py-1 text-xs font-semibold text-wpu-black/65">
            {item.category}
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="line-clamp-2 text-2xl font-semibold leading-tight text-wpu-black">
            {item.title}
          </h2>
          <p className="line-clamp-2 text-base text-wpu-black/55">
            {description}
          </p>
        </div>

        <div className="rounded-2xl bg-wpu-orange/5 px-4 py-3 text-wpu-black/65">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-base leading-none text-wpu-orange/80">📍</span>
            <span className="truncate">{item.locationText}</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="text-base leading-none text-wpu-orange/80">📅</span>
            <span>{date}</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="text-base leading-none text-wpu-orange/80">👤</span>
            <span className="truncate">Posted by {item.postedBy.name}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
