"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, UserPlus, Table2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Supprime le token
    router.push("/login"); // Redirige vers la page de connexion
  };
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r fixed h-full p-4 bg-background">
        <nav className="space-y-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl">Professeurs Manager</span>
          </Link>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Liste des Professeurs
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/dashboard/ajouter-professeur">
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un Professeur
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/dashboard/import-excel">
                <Table2 className="mr-2 h-4 w-4" />
                Importer Excel
              </Link>
            </Button>
          </div>
          <div className="mt-8">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
              asChild
            >
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Link>
            </Button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-4 ml-64">{children}</main>
    </div>
  );
}
