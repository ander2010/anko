import React from "react";
import { Typography, Button } from "@material-tailwind/react";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/auth-context";

export function NoCompany() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto">
          <BuildingOffice2Icon className="h-10 w-10 text-indigo-500" />
        </div>

        <div className="space-y-2">
          <Typography variant="h4" className="font-extrabold text-zinc-900">
            Bienvenido a Ankard Enterprise
          </Typography>
          <Typography className="text-zinc-500 leading-relaxed">
            Tu cuenta está lista, pero aún no perteneces a ninguna empresa.
          </Typography>
          <Typography variant="small" className="text-zinc-400 leading-relaxed">
            Contacta al administrador de tu empresa para que te agregue a la plataforma.
            Una vez que lo hagan, podrás entrar inmediatamente con tu cuenta actual.
          </Typography>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
          <Typography variant="small" className="text-indigo-700">
            <strong>¿Eres administrador?</strong> Inicia sesión con tu cuenta de staff para
            gestionar empresas y usuarios.
          </Typography>
        </div>

        <Button
          variant="outlined"
          color="blue-gray"
          fullWidth
          className="normal-case"
          onClick={logout}
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}

export default NoCompany;
