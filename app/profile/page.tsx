"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const router = useRouter();
  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "http://localhost:3001/api/professeurs/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfessor(res.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleDownloadCard = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/generate-card/${professor.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carte_${professor.nom}_${professor.prenom}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur de téléchargement:", error);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token"); // Supprime le token
    router.push("/"); // Redirige vers la page d'accueil
  };
  // Ajouter le style CSS inline pour la carte
  const cardStyle = {
    background: "linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)",
    borderRadius: "15px",
    border: "2px solid #3b82f6",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    position: "relative",
    overflow: "hidden",
  };
  if (loading)
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Card>
          <CardHeader className="items-center">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-6 w-48 mt-4" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">
          Université Chouaib Doukkali
        </h1>
        <p className="text-muted-foreground mt-2">Bienvenue</p>
      </div>

      <Card>
        <CardHeader className="items-center">
          <Avatar className="h-32 w-32">
            <AvatarImage
              src={
                professor.photo
                  ? `http://localhost:3001/uploads/${professor.photo}`
                  : "/default-avatar.png"
              }
            />
            <AvatarFallback className="text-3xl">
              {professor.nom[0]}
              {professor.prenom[0]}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">
            {professor.prenom} {professor.nom}
          </CardTitle>
          <CardDescription className="flex gap-2 items-center">
            <Badge variant="secondary">{professor.statut}</Badge>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{professor.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Téléphone</p>
              <p className="font-medium">
                {professor.telephone || "Non renseigné"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Matières enseignées
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {professor.matieres.map((matiere, index) => (
                  <Badge key={index} variant="outline">
                    {matiere}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <p className="font-medium">{professor.statut}</p>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => router.push("/edit-profile")}
            >
              Modifier Profil
            </Button>
            <Button onClick={handleDownloadCard}>Télécharger ma carte</Button>

            <Button variant="destructive" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="text-center p-6 relative" style={cardStyle}>
        <div className="absolute top-4 right-4">
          <QRCodeSVG
            value={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/professeurs/${professor.id}`}
            size={80}
            bgColor="#ffffff"
            fgColor="#2563eb"
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-2">
            Université Chouaib Doukkali
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            Carte d'Enseignant
          </p>
        </div>

        <div className="flex items-center justify-start gap-6 mb-6">
          <Avatar className="h-24 w-24 border-2 border-blue-500 shadow-lg">
            <AvatarImage
              src={
                professor.photo
                  ? `http://localhost:3001/uploads/${professor.photo}`
                  : "/default-avatar.png"
              }
            />
            <AvatarFallback className="text-2xl bg-blue-100">
              {professor.nom[0]}
              {professor.prenom[0]}
            </AvatarFallback>
          </Avatar>

          <div className="text-left space-y-1">
            <p className="text-lg font-bold text-gray-800">
              {professor.prenom} {professor.nom}
            </p>
            <p className="text-sm text-blue-600 font-medium">
              {professor.statut}
            </p>
            <p className="text-sm text-gray-600">{professor.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {professor.matieres.map((matiere, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                >
                  {matiere}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-xs text-gray-500 font-medium">
            Valide jusqu'au {new Date().getFullYear() + 1} |
            <span className="ml-2 text-blue-600">www.ucd.ac.ma</span>
          </p>
        </div>
      </Card>
    </div>
  );
}
