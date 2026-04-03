"use client";

type AppErrorStateProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function AppErrorState({
  title = "Something went wrong",
  message,
  actionLabel,
  onAction,
}: AppErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <h2 className="text-lg font-semibold text-wpu-black">{title}</h2>
      <p className="mt-2 text-sm text-red-700">{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 min-h-[44px] rounded-lg bg-wpu-orange px-4 py-2 text-sm font-medium text-white hover:bg-wpu-orange-hover"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
