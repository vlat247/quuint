import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const earlyAccess = cookieStore.get("quint_early_access");

  if (!earlyAccess) {
    redirect("/#early-access");
  }

  return <>{children}</>;
}
