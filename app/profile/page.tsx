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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

  const cardRef = useRef(null);

  const CARD_WIDTH = 400; // Largeur fixe en pixels
  const CARD_HEIGHT = 150;

  // 📌 Capture et Télécharge en PNG
  const handleDownloadPNG = async () => {
    if (cardRef.current) {
      const card = cardRef.current;
      const canvas = await html2canvas(card, {
        scale: 2,
        useCORS: true,
      });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `carte-${professor.nom}-${professor.prenom}.png`;
      link.click();
    }
  };

  const handleDownloadPDF = async () => {
    if (cardRef.current) {
      const card = cardRef.current;
      const canvas = await html2canvas(card, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png", 1.0);

      // Récupérer les dimensions réelles de la carte en pixels
      const cardWidth = card.offsetWidth;
      const cardHeight = card.offsetHeight;

      // Conversion de pixels en millimètres (1px ≈ 0.264583mm)
      const pdfWidth = cardWidth * 0.264583;
      const pdfHeight = cardHeight * 0.264583;

      // Création du PDF avec les dimensions exactes
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`carte-${professor.nom}-${professor.prenom}.pdf`);
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
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-blue-800">
          Université Chouaib Doukkali
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenue à la faculté des sciences
        </p>
      </div>

      {/* Card Professeur */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="items-center">
          <Avatar className="h-32 w-32 ring-4 ring-blue-800">
            <AvatarImage
              src={
                professor.photo
                  ? `http://localhost:3001/uploads/${professor.photo}`
                  : "/default-avatar.png"
              }
            />
            <AvatarFallback className="text-3xl bg-gray-200">
              {professor.nom[0]}
              {professor.prenom[0]}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-bold mt-4">
            {professor.prenom} {professor.nom}
          </CardTitle>
          <CardDescription className="flex gap-2 items-center">
            <Badge variant="secondary">{professor.statut}</Badge>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{professor.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Téléphone</p>
              <p className="font-medium">
                {professor.telephone || "Non renseigné"}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500">Matières enseignées</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {professor.matieres.map((matiere, index) => (
              <Badge key={index} variant="outline">
                {matiere}
              </Badge>
            ))}
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              variant="outline"
              className="hover:bg-blue-100 transition-colors duration-300"
              onClick={() => router.push("/edit-profile")}
            >
              Modifier Profil
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="hover:bg-blue-600 hover:text-white transition-colors duration-300">
                  Télécharger la carte
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDownloadPNG}>
                  Télécharger en PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  Télécharger en PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="destructive"
              className="hover:bg-red-600 transition-colors duration-300"
              onClick={handleLogout}
            >
              Déconnexion
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Carte Téléchargeable */}

      <div ref={cardRef}>
        <Card className="relative w-full max-w-md h-auto bg-white shadow-lg rounded-xl overflow-hidden transition-transform transform hover:scale-105 duration-300">
          <div className="relative h-20 bg-blue-900">
            <div
              className="absolute top-0 right-0 w-1/2 h-full bg-teal-600"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}
            ></div>
            <div className="absolute left-4 top-2 text-white">
              <h2 className="text-lg font-bold uppercase tracking-wide">
                UNIVERSITÉ CHOUAIB DOUKKALI
              </h2>
              <p className="text-sm font-semibold">
                Faculté des Sciences - El Jadida
              </p>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-blue-900">
                ENSEIGNANT-CHERCHEUR
              </h3>
              <p className="text-sm text-gray-700">
                Département : {professor.departement || "Informatique"}
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex-1 flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-blue-900 rounded-none overflow-hidden">
                  <AvatarImage
                    src={
                      professor.photo
                        ? `http://localhost:3001/uploads/${professor.photo}`
                        : "/default-avatar.png"
                    }
                    alt={`${professor.nom} ${professor.prenom}`}
                  />
                  <AvatarFallback className="bg-gray-200 text-xl font-semibold flex items-center justify-center">
                    {professor.nom?.[0]}
                    {professor.prenom?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">
                    {professor.prenom} {professor.nom}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Email : {professor.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tél : {professor.telephone || "Non renseigné"}
                  </p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0">
                <QRCodeSVG
                  value={professor.email}
                  size={80}
                  bgColor="#ffffff"
                  fgColor="#1e3a8a"
                />
              </div>
            </div>
          </CardContent>

          <div className="h-8 bg-blue-900 flex items-center justify-center">
            <span className="text-xs font-semibold text-white tracking-widest uppercase">
              El Jadida
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
