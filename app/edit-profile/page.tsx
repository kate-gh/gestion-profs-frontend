"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function EditProfile() {
  const router = useRouter();
  const [professor, setProfessor] = useState<any>({});
  const [formData, setFormData] = useState<any>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Fetch professor data when the page loads
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
        setFormData(res.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle photo change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file)); // Ajouter cette ligne
    }
  };

  // Handle form submission to update the profile
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
    if (photo) {
      data.append("photo", photo);
    }

    try {
      await axios.put("http://localhost:3001/api/professeurs/me", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      router.push("/profile"); // Redirect to profile page after update
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Modifier votre profil</CardTitle>
          <CardDescription>
            Modifiez vos informations personnelles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={
                    photoPreview // Priorité à la prévisualisation
                      ? photoPreview
                      : professor.photo
                      ? `http://localhost:3001/uploads/${professor.photo}`
                      : "/default-avatar.png"
                  }
                />
                <AvatarFallback>
                  {professor.nom[0]}
                  {professor.prenom[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="photo">Changer la photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="statut">Statut</Label>
                <Input
                  id="statut"
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="matieres">Matières enseignées</Label>
              <Input
                id="matieres"
                name="matieres"
                value={
                  Array.isArray(formData.matieres)
                    ? formData.matieres.join(", ")
                    : formData.matieres
                }
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button variant="outline" onClick={() => router.push("/profile")}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer les modifications</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
