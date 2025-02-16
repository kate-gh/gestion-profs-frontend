// app/page.tsx
"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [userType, setUserType] = useState("professeur");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/api/login", {
        email,
        password,
        userType,
      });

      localStorage.setItem("token", res.data.token);
      router.push(res.data.redirect);
    } catch (err) {
      setError("Identifiants incorrects");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Connexion {userType === "admin" ? "Administrateur" : "Professeur"}
        </h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setUserType("professeur")}
            className={`flex-1 p-2 rounded ${
              userType === "professeur"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Professeur
          </button>
          <button
            onClick={() => setUserType("admin")}
            className={`flex-1 p-2 rounded ${
              userType === "admin" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
