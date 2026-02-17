import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProfileClient } from "@/components/ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <ProfileClient
        name={session.user?.name ?? ""}
        email={session.user?.email ?? ""}
      />
    </div>
  );
}
