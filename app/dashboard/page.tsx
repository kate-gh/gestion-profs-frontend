// frontend/app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FileDown, Link } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Professeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  matieres?: string;
  statut: string;
  photo?: string;
}

export default function DashboardPage() {
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfesseurs = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:3001/api/professeurs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfesseurs(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfesseurs();
  }, []);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[73px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Liste des Professeurs</h1>
        <Button asChild>
          <Link href="/dashboard/ajouter-professeur">
            Ajouter un Professeur
          </Link>
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Matières</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professeurs.map((prof) => (
              <TableRow key={prof.id}>
                <TableCell>
                  <Avatar className="h-12 w-12">
                    {prof.photo && (
                      <AvatarImage src={`/uploads/${prof.photo}`} />
                    )}
                    <AvatarFallback>
                      {prof.nom[0]}
                      {prof.prenom[0]}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  {prof.nom} {prof.prenom}
                </TableCell>
                <TableCell>{prof.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {(prof.matieres && Array.isArray(prof.matieres)
                      ? prof.matieres
                      : []
                    ).map((m: string) => (
                      <Badge key={m} variant="outline">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={`http://localhost:3001/api/generate-card/${prof.id}`}
                      target="_blank"
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      PDF
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
