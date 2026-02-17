import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HomeFeed } from "@/components/HomeFeed";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <HomeFeed />
    </div>
  );
}
