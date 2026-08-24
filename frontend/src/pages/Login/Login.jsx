import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, ArrowRight, Wallet, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import AuthService from "@/services/AuthService";
import AlertMessage from "@/components/ui/AlertMessage";

const authService = new AuthService();

const LoginPage = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("app-token");

  if (token) {
    return <Navigate to="/" replace />;
  }

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await authService.login(credentials);

      const token = response.data?.accessToken || response.data?.token;
      if (token) {
        localStorage.setItem("app-token", token);
        localStorage.setItem("usuario", JSON.stringify(response.data));
      }

      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "E-mail ou senha inválidos."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-zinc-950 p-4 font-sans m-0 absolute inset-0">
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-100">
            <Wallet className="w-6 h-6" />
            <span className="font-semibold text-lg tracking-tight">Capital Atelier</span>
          </div>

          <div>
            <h1 className="text-2xl font-medium tracking-tight text-white">
              Entrar na Sua Conta
            </h1>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="pl-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-400">
                  Senha
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />

                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
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
            </div>

            <AlertMessage message={error} variant="error" />

            <Button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-zinc-100 text-zinc-900 hover:bg-zinc-300 transition-all font-bold tracking-tight"
            >
              {loading ? "ENTRANDO..." : "ENTRAR"}
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
              Ainda não conhece o<br />Capital Atelier?
            </h2>

            <p className="text-sm text-zinc-400 max-w-[280px] leading-relaxed">
              Descubra uma nova dimensão de gestão financeira com nossa plataforma moderna e inteligente.
            </p>

            <Button
              variant="outline"
              className="mt-6 px-8 cursor-pointer border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:text-zinc-100 text-zinc-300 transition-all rounded-full"
            >
              <Link to="/register">CADASTRE-SE</Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;