"use client";
import { useEffect, useState, useRef } from "react";
import { Trash, FileDown, Link } from "lucide-react";
import JSZip from "jszip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { saveAs } from "file-saver";
import QRCode from "qrcode";

interface Professeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  matieres?: string[];
  statut: string;
  photo?: string;
  departement?: string;
}

export default function DashboardPage() {
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [loading, setLoading] = useState(true);

  // Pour gérer le téléchargement individuel
  const [currentCard, setCurrentCard] = useState<Professeur | null>(null);
  const [downloadType, setDownloadType] = useState<"png" | "pdf" | null>(null);
  const hiddenCardRef = useRef<HTMLDivElement>(null);

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

  // ------------------ Téléchargement individuel (PNG / PDF) ------------------
  useEffect(() => {
    const downloadCard = async () => {
      if (currentCard && downloadType && hiddenCardRef.current) {
        try {
          // Préchargement de la photo
          const imageUrl = currentCard.photo
            ? `http://localhost:3001/uploads/${currentCard.photo}`
            : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

          // Vérifier si l'image est accessible (CORS)
          await new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imageUrl;
            img.onload = resolve;
            img.onerror = resolve;
          });

          // Génération du canvas
          const canvas = await html2canvas(hiddenCardRef.current, {
            scale: 2,
            useCORS: true,
          });

          const fileName = `carte-${currentCard.nom}-${currentCard.prenom}`;

          if (downloadType === "png") {
            // Conversion en PNG
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png", 1.0);
            link.download = `${fileName}.png`;
            link.click();
          } else {
            // Conversion en PDF
            const pdf = new jsPDF("p", "mm", "a4");
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const canvasDataUrl = canvas.toDataURL("image/png", 1.0);
            pdf.addImage(canvasDataUrl, "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save(`${fileName}.pdf`);
          }
        } catch (error) {
          console.error("Erreur de génération:", error);
        } finally {
          setCurrentCard(null);
          setDownloadType(null);
        }
      }
    };

    downloadCard();
  }, [currentCard, downloadType]);

  // ------------------ Téléchargement de toutes les cartes ------------------
  const handleDownloadAllCards = async () => {
    const zip = new JSZip();
    const folder = zip.folder("cartes-professeurs");

    try {
      // Conteneur temporaire (on utilise l'opacité à 0 plutôt que visibility: hidden)
      const container = document.createElement("div");
      Object.assign(container.style, {
        position: "fixed",
        left: "0",
        top: "0",
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        opacity: "0",
        pointerEvents: "none",
        zIndex: "9999",
      });
      document.body.appendChild(container);

      // Préparer les données (QR codes + photos préchargées)
      const cardsData = await Promise.all(
        professeurs.map(async (prof) => {
          // Génération du QR Code
          const qrDataUrl = await QRCode.toDataURL(prof.email, {
            width: 200,
            margin: 2,
            color: { dark: "#1e3a8aff", light: "#ffffffff" },
          });

          // Préchargement de la photo
          const photoUrl = prof.photo
            ? `http://localhost:3001/uploads/${prof.photo}`
            : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

          await new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = photoUrl;
            img.onload = resolve;
            img.onerror = resolve;
          });

          return { prof, qrDataUrl, photoUrl };
        })
      );

      // Génération séquentielle
      for (const { prof, qrDataUrl, photoUrl } of cardsData) {
        const cardDiv = document.createElement("div");
        Object.assign(cardDiv.style, {
          width: "400px",
          margin: "20px auto",
          position: "relative",
          backgroundColor: "white",
        });

        cardDiv.innerHTML = `
          <div style="
            position: relative;
            width: 100%;
            height: 100%;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            border-radius: 0.75rem;
            overflow: hidden;
          ">
            <!-- En-tête -->
            <div style="
              position: relative;
              height: 5rem;
              background-color: #1e3a8a;
            ">
              <div style="
                position: absolute;
                top: 0;
                right: 0;
                width: 50%;
                height: 100%;
                background-color: #0d9488;
                clip-path: polygon(0 0, 100% 0, 100% 100%);
              "></div>
              <div style="
                position: absolute;
                left: 1rem;
                top: 0.5rem;
                color: white;
              ">
                <h2 style="
                  font-size: 1.125rem;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.025em;
                ">UNIVERSITÉ CHOUAIB DOUKKALI</h2>
                <p style="
                  font-size: 0.875rem;
                  font-weight: 600;
                ">Faculté des Sciences - El Jadida</p>
              </div>
            </div>
    
            <!-- Corps de la carte -->
<div style="padding: 1rem;">
  <div style="margin-bottom: 1rem;">
    <h3 style="
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e3a8a;
      margin: 0 0 0.25rem 0;
    ">
      ENSEIGNANT-CHERCHEUR
    </h3>
    <p style="font-size: 0.875rem; color: #374151; margin: 0;">
      Département : ${prof.departement || "Informatique"}
    </p>
  </div>
    
               <div style="
    display: flex;
    align-items: center;
    justify-content: space-between; /* Pousse le QR Code à droite */
    gap: 1rem;
  ">
                <div style="display: flex; gap: 1rem; align-items: center;">
      <div style="
        width: 5rem;
        height: 5rem;
        border: 2px solid #1e3a8a;
        overflow: hidden;
      ">
        <img 
          src="${photoUrl}"
          style="
            width: 100%;
            height: 100%;
            object-fit: cover;
          "
          crossOrigin="anonymous"
                    />
                  </div>
                  <div>
                    <h3 style="
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e3a8a;
          margin: 0;
        ">${prof.prenom} ${prof.nom}</h3>
        <p style="font-size: 0.875rem; color: #4b5563; margin: 0;">
          Email : ${prof.email}
        </p>
        <p style="font-size: 0.875rem; color: #4b5563; margin: 0;">
          Tél : ${prof.telephone || "Non renseigné"}
        </p>
      </div>
    </div>
    
                 <div>
      <img 
        src="${qrDataUrl}" 
        alt="QR Code"
        style="width: 5rem; height: 5rem;"
      />
    </div>
              </div>
            </div>
    
            <!-- Pied de page -->
            <div style="
              height: 2rem;
              background-color: #1e3a8a;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="
                font-size: 0.75rem;
                font-weight: 600;
                color: white;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              ">El Jadida</span>
            </div>
          </div>
        `;

        container.appendChild(cardDiv);

        // Attendre que toutes les images soient chargées
        const allImages = cardDiv.querySelectorAll("img");
        for (const img of allImages) {
          if (!img.complete) {
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          }
        }

        // Capture via html2canvas
        const canvas = await html2canvas(cardDiv, {
          scale: 2,
          useCORS: true,
        });

        // Convertir le canvas en dataURL
        const canvasDataUrl = canvas.toDataURL("image/png");

        // Créer un PDF format A4
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(canvasDataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        folder.file(`carte-${prof.nom}-${prof.prenom}.pdf`, pdf.output("blob"));

        // Nettoyage
        container.removeChild(cardDiv);
      }

      // Génération du ZIP
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "cartes-professeurs.zip");
    } catch (error) {
      console.error("Erreur de génération :", error);
    } finally {
      // Retirer le conteneur caché
      const container = document.querySelector(
        "[style*='pointer-events: none']"
      );
      container?.remove();
    }
  };

  // ------------------ Suppression d'un professeur ------------------
  const deleteProfesseur = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:3001/api/professeurs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfesseurs((prev) => prev.filter((prof) => prof.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // ------------------ Carte cachée pour téléchargement individuel ------------------
  const HiddenCard = ({ professor }: { professor: Professeur }) => {
    return (
      <div
        ref={hiddenCardRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "400px",
          height: "auto",
        }}
      >
        <Card className="relative w-full bg-white shadow-lg rounded-xl overflow-hidden">
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
                <div className="w-20 h-20 border-2 border-blue-900 rounded-none overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      professor.photo
                        ? `http://localhost:3001/uploads/${professor.photo}`
                        : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                    }
                    alt="Avatar"
                    crossOrigin="anonymous"
                  />
                </div>
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
                {/* QR Code */}
                {/* Ici, on pourrait utiliser <QRCodeSVG /> ou l'URL en base64. */}
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
    );
  };

  // ------------------ Affichage principal ------------------
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
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/dashboard/ajouter-professeur">
              Ajouter un Professeur
            </Link>
          </Button>

          <Button onClick={handleDownloadAllCards}>
            <FileDown className="mr-2 h-4 w-4" />
            Télécharger toutes les cartes
          </Button>
        </div>
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
                    <AvatarImage
                      src={
                        prof.photo
                          ? `http://localhost:3001/uploads/${prof.photo}`
                          : "/default-avatar.png"
                      }
                    />
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
                    {(prof.matieres || []).map((m) => (
                      <Badge key={m} variant="outline">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Êtes-vous absolument sûr ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action supprimera définitivement le professeur.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteProfesseur(prof.id)}
                        >
                          Confirmer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <FileDown className="mr-2 h-4 w-4" />
                        Télécharger
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentCard(prof);
                          setDownloadType("png");
                        }}
                      >
                        PNG
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentCard(prof);
                          setDownloadType("pdf");
                        }}
                      >
                        PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {currentCard && <HiddenCard professor={currentCard} />}
    </div>
  );
}
