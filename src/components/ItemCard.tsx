import Image from "next/image";
import { StatusBadge } from "./StatusBadge";

type Item = {
  id: string;
  type: string;
  title: string;
  category: string;
  locationText: string;
  dateOccurred: string;
  photoUrl: string | null;
  status: string;
};

export function ItemCard({ item }: { item: Item }) {
  const date = new Date(item.dateOccurred).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="overflow-hidden rounded-xl border border-wpu-black/10 bg-white shadow-sm transition-shadow hover:shadow-md">
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
      <div className="space-y-2.5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="min-w-0 flex-1 line-clamp-2 text-sm font-semibold leading-6 text-wpu-black sm:text-base">
            {item.title}
          </h2>
          <div className="shrink-0">
            <StatusBadge status={item.status} />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
          <p className="min-w-0 truncate font-medium text-wpu-black/80">{item.category}</p>
          <p className="shrink-0 text-wpu-black/55">{date}</p>
        </div>
      </div>
    </article>
  );
}
