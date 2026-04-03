import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/ProfileClient";
import { getValidatedSessionUser } from "@/lib/session-user";

export default async function ProfilePage() {
  const user = await getValidatedSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <ProfileClient
        name={user.name ?? ""}
        email={user.email ?? ""}
      />
    </div>
  );
}
