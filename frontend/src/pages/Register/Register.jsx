import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Rocket,
  ArrowRight,
  Wallet,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import UserService from "@/services/UserService";
import { Link } from "react-router-dom";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter/PasswordStrengthMeter";

const userService = new UserService();

const RegisterPage = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (user.password !== user.confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);

    try {
      await userService.create({
        username: user.username,
        email: user.email,
        password: user.password,
      });

      setSuccess("Conta criada com sucesso!");

      setUser({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Não foi possível realizar o cadastro."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-50 m-0 absolute inset-0">
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-100">
            <Wallet className="w-6 h-6" />
            <span className="font-semibold text-lg tracking-tight">Capital Atelier</span>
          </div>

          <div>
            <h1 className="text-2xl font-medium tracking-tight text-zinc-100">
              Crie sua conta
            </h1>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-400">
                Nome de Usuário
              </Label>

              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />

                <Input
                  id="username"
                  name="username"
                  value={user.username}
                  onChange={handleChange}
                  placeholder="Digite seu nome de usuário"
                  className="pl-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400">
                E-mail
              </Label>

              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />

                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="pl-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400">
                Senha
              </Label>

              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />

                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={user.password}
                  onChange={handleChange}
                  placeholder="Crie uma senha forte"
                  className="pl-10 pr-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-600 hover:text-zinc-400 cursor-pointer"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <PasswordStrengthMeter password={user.password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-400">
                Confirmar Senha
              </Label>

              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />

                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={user.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repita a senha"
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

            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
                {success}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-zinc-100 text-zinc-900 hover:bg-zinc-300 transition-all font-bold tracking-tight"
            >
              {loading ? "CRIANDO CONTA..." : "CRIAR CONTA"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>
        </div>

        

        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-zinc-950 border-l border-zinc-800 text-center">
         <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-sm">
            <Rocket className="w-8 h-8 text-zinc-300" />
          </div>
        
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 mb-4">
            Já faz parte da<br />nossa rede?
          </h2>

          <p className="text-sm text-zinc-400 max-w-[280px] leading-relaxed">
            Acesse sua conta para continuar sua jornada financeira e gerenciar
            seus recursos com facilidade.
          </p>

          <Button variant="outline" className="mt-6 px-8 cursor-pointer border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:text-zinc-100 text-zinc-300 transition-all rounded-full">
            <Link to="/">FAÇA LOGIN</Link>
          </Button>
        </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;