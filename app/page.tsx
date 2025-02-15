// frontend/app/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Erreur lors du login :", error);
      // Afficher plus d'infos si disponibles
      if (error.response) {
        console.error("Données de la réponse d'erreur :", error.response.data);
        setError(error.response.data.error || "Identifiants invalides");
      } else {
        setError("Erreur lors de la connexion. Vérifiez le serveur.");
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {error && <p className="text-red-500">{error}</p>}
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="mt-4" onClick={handleLogin}>
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
