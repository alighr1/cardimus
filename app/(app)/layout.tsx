import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { UserBar } from "@/components/UserBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");
  return (
    <>
      <UserBar userId={user.id} name={`${user.firstName} ${user.lastName}`} />
      {children}
    </>
  );
}
