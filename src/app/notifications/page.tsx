import { redirect } from "next/navigation";
import { NotificationsClient } from "@/components/NotificationsClient";
import { getValidatedSessionUser } from "@/lib/session-user";

export default async function NotificationsPage() {
  const user = await getValidatedSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
      <NotificationsClient />
    </div>
  );
}
