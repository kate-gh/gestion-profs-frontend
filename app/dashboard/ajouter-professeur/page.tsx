// frontend/app/dashboard/ajouter-professeur/page.tsx
"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AjouterProfesseur() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    matieres: "",
    statut: "permanent",
    password: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Gestion du changement des inputs texte et select
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Gestion du changement du fichier image et mise en place de la prévisualisation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Envoi du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const data = new FormData();
    data.append("nom", formData.nom);
    data.append("prenom", formData.prenom);
    data.append("email", formData.email);
    data.append("telephone", formData.telephone);
    data.append("statut", formData.statut);
    data.append("matieres", formData.matieres);
    data.append("password", formData.password);
    if (photo) {
      data.append("photo", photo);
    }

    try {
      await axios.post("http://localhost:3001/api/professeurs", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      router.push("/dashboard");
    } catch (err: any) {
      // Afficher plus d'informations sur l'erreur
      console.error("Erreur lors de l'ajout du professeur:", err.message);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Données:", err.response.data);
        setError(
          err.response.data.error || "Erreur lors de l'ajout du professeur"
        );
      } else {
        setError("Erreur lors de la connexion au serveur");
      }
    }
  };

  return (
    <div className="container max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un Professeur</CardTitle>
          <CardDescription>
            Renseignez les informations du nouveau professeur
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Avatar className="h-24 w-24">
                {photoPreview && <AvatarImage src={photoPreview} />}
                <AvatarFallback>PP</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="photo">Photo de profil</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-[200px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  name="nom"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  name="prenom"
                  required
                  value={formData.prenom}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block mb-2">Mot de passe</label>
              <input
                type="password"
                name="password"
                required
                className="w-full p-2 border rounded"
                value={formData.password} // Ajoute cette ligne
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut">Statut *</Label>
                <Select
                  name="statut"
                  value={formData.statut}
                  onValueChange={(value) =>
                    setFormData({ ...formData, statut: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="vacataire">Vacataire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="matieres">Matières enseignées *</Label>
              <Input
                id="matieres"
                name="matieres"
                placeholder="Séparées par des virgules"
                required
                value={formData.matieres}
                onChange={handleChange}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.matieres.split(",").map(
                  (m, i) =>
                    m.trim() && (
                      <Badge key={i} variant="secondary">
                        {m.trim()}
                      </Badge>
                    )
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
              <Button type="submit">Ajouter le professeur</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
