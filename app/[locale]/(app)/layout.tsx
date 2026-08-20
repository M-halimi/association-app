import { getAssociation, getSession } from "@/lib/data";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [association, session] = await Promise.all([
    getAssociation(),
    getSession(),
  ]);

  return (
    <AppShell
      associationName={association.name}
      logoUrl={association.logoUrl}
      userName={session?.name ?? ""}
      userEmail={session?.email ?? ""}
      userRole={session?.role ?? "MEMBER"}
    >
      {children}
    </AppShell>
  );
}