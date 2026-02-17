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
          <img
            src={item.photoUrl}
            alt=""
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
      <div className="p-4">
        <div className="mb-2 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
              item.type === "LOST" ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"
            }`}
          >
            {item.type}
          </span>
          <span className="rounded-full border border-wpu-black/20 bg-wpu-gray-light px-2.5 py-1 text-xs font-medium text-wpu-black">
            {item.status}
          </span>
        </div>
        <h2 className="font-semibold text-wpu-black">{item.title}</h2>
        <p className="mt-1 text-sm font-medium text-wpu-black">{item.category}</p>
        <p className="mt-1 text-sm text-wpu-black-light">{item.locationText} · {date}</p>
      </div>
    </article>
  );
}
