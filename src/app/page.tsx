import { redirect } from "next/navigation";
import { HomeFeed } from "@/components/HomeFeed";
import { getValidatedSessionUser } from "@/lib/session-user";

export default async function HomePage() {
  const user = await getValidatedSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <HomeFeed />
    </div>
  );
}
