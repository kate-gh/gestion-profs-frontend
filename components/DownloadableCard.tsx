// components/DownloadableCard.tsx
"use client";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
// ... (imports similaires au profil)

export default function DownloadableCard({ professor }) {
  return (
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
              <p className="text-sm text-gray-600">Email : {professor.email}</p>
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
  );
}
