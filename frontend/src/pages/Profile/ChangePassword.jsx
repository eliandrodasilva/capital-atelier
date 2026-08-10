import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserService from "@/services/UserService";
import AlertMessage from "@/components/ui/AlertMessage";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter/PasswordStrengthMeter";

const userService = new UserService();

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword) {
      setError("Por favor, digite sua senha atual.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await userService.changePassword(usuario.id, {
        oldPassword,
        newPassword,
      });

      setSuccess("Senha alterada com sucesso!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Erro ao alterar senha. Verifique se a senha atual está correta."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <header className="border-b border-zinc-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Redefinir Senha</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Digite sua senha atual e escolha uma nova senha segura.
          </p>
        </div>

        <Button
          onClick={() => navigate("/profile")}
          variant="outline"
          className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </header>

      <main className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-2">
            <Label htmlFor="oldPassword" className="text-zinc-400">
              Senha Atual
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
              <Input
                id="oldPassword"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-3 text-zinc-600 hover:text-zinc-400 cursor-pointer"
              >
                {showOldPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-zinc-400">
              Nova Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha forte"
                className="pl-10 pr-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3 text-zinc-600 hover:text-zinc-400 cursor-pointer"
              >
                {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrengthMeter password={newPassword} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-zinc-400">
              Confirmar Nova Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="pl-10 pr-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-zinc-600 hover:text-zinc-400 cursor-pointer"
              >
                {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <AlertMessage message={error} variant="error" />
          <AlertMessage message={success} variant="success" />

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-300 font-bold cursor-pointer"
          >
            <KeyRound className="w-4 h-4 mr-2" />
            {loading ? "ALTERANDO SENHA..." : "SALVAR NOVA SENHA"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default ChangePasswordPage;
