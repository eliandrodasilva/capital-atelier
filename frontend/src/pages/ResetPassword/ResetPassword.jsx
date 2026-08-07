import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import AuthService from "@/services/AuthService";
import AlertMessage from "@/components/ui/AlertMessage";

const authService = new AuthService();

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Token de redefinição não encontrado ou inválido na URL.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, newPassword);
      setMessage("Senha redefinida com sucesso! Redirecionando para o login...");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Não foi possível redefinir a senha. O token pode ter expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-50 m-0 absolute inset-0">
      
      <div className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="p-8 md:p-12 flex flex-col justify-center">
          
          <div className="flex items-center gap-2 mb-8 text-zinc-100">
            <Wallet className="w-6 h-6" />
            <span className="font-semibold text-lg tracking-tight">Capital Atelier</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-medium tracking-tight text-zinc-100 mb-3">
              Definir Nova Senha
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Crie uma nova senha forte para acessar sua conta. Ela deve ser diferente das anteriores.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-zinc-400">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                <Input 
                  id="new-password" 
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="pl-10 pr-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-600 hover:text-zinc-400"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-zinc-400">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                <Input 
                  id="confirm-password" 
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="pl-10 pr-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100"
                />
              </div>
            </div>

            <AlertMessage message={error} variant="error" />
            <AlertMessage message={message} variant="success" />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-300 transition-colors font-bold tracking-tight cursor-pointer"
            >
              {loading ? "SALVANDO..." : "SALVAR NOVA SENHA"}
            </Button>
            
            <div className="pt-2 flex items-center justify-start">
              <Link to="/login" className="flex items-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Login
              </Link>
            </div>

          </form>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-zinc-950 border-l border-zinc-800 text-center relative overflow-hidden">
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950/0 to-zinc-950/0 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-zinc-300" />
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-zinc-100 mb-3">
              Segurança em 1º Lugar
            </h2>
            
            <p className="text-sm text-zinc-400 max-w-[260px] leading-relaxed">
              Protegemos seus dados com criptografia de ponta a ponta.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ResetPasswordPage;