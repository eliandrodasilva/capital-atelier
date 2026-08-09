import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, KeyRound, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserService from "@/services/UserService";
import AlertMessage from "@/components/ui/AlertMessage";

const userService = new UserService();

const ProfilePage = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [username, setUsername] = useState(usuario.username || "");
  const [email, setEmail] = useState(usuario.email || "");

  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("O nome de usuário não pode estar em branco.");
      return;
    }

    setLoadingUsername(true);

    try {
      const response = await userService.updateUser(usuario.id, { username });
      
      const updatedUser = {
        ...usuario,
        username: response.data.username || username,
      };

      localStorage.setItem("usuario", JSON.stringify(updatedUser));
      setSuccess("Nome de usuário atualizado com sucesso!");
    } catch (err) {
      setError(err?.response?.data?.message || "Erro ao atualizar nome de usuário.");
    } finally {
      setLoadingUsername(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("O e-mail não pode estar em branco.");
      return;
    }

    setLoadingEmail(true);

    try {
      const response = await userService.updateUser(usuario.id, { email });

      const updatedUser = {
        ...usuario,
        email: response.data.email || email,
      };

      localStorage.setItem("usuario", JSON.stringify(updatedUser));
      setSuccess("E-mail atualizado com sucesso!");
    } catch (err) {
      setError(err?.response?.data?.message || "Erro ao atualizar e-mail.");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <header className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Perfil de Usuário</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Gerencie suas informações pessoais e credenciais da conta.
        </p>
      </header>

      <main className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${username || "User"}`}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xl font-semibold text-zinc-100 truncate">
              {username || "Usuário"}
            </h2>
            <p className="text-sm text-zinc-400 truncate">{email || "Sem e-mail"}</p>
          </div>
        </div>

        <AlertMessage message={error} variant="error" />
        <AlertMessage message={success} variant="success" />

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-6">
          
          <form onSubmit={handleUpdateUsername} className="space-y-2">
            <Label htmlFor="username" className="text-zinc-400">
              Nome de Usuário
            </Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <User className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu nome de usuário"
                  className="pl-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100"
                />
              </div>
              <Button
                type="submit"
                disabled={loadingUsername}
                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-300 font-medium cursor-pointer"
              >
                <Save className="w-4 h-4 mr-2" />
                {loadingUsername ? "SALVANDO..." : "SALVAR"}
              </Button>
            </div>
          </form>

          <hr className="border-zinc-800" />

          <form onSubmit={handleUpdateEmail} className="space-y-2">
            <Label htmlFor="email" className="text-zinc-400">
              E-mail
            </Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100"
                />
              </div>
              <Button
                type="submit"
                disabled={loadingEmail}
                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-300 font-medium cursor-pointer"
              >
                <Save className="w-4 h-4 mr-2" />
                {loadingEmail ? "SALVANDO..." : "SALVAR"}
              </Button>
            </div>
          </form>

          <hr className="border-zinc-800" />

          <div className="pt-2">
            <Button
              onClick={() => navigate("/profile/change-password")}
              variant="outline"
              className="w-full border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 font-semibold cursor-pointer py-5"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              REDEFINIR SENHA
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ProfilePage;