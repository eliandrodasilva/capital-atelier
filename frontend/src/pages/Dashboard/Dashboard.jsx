import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("app-token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
          >
            Sair
          </Button>
        </header>

        <main className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-semibold">Bem-vindo(a), {usuario.username || "Usuário"}!</h2>
          <p className="text-zinc-400">
            Você está autenticado no <strong>Capital Atelier</strong>.
          </p>
          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 text-sm text-zinc-300">
            <p><strong>E-mail:</strong> {usuario.email}</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
