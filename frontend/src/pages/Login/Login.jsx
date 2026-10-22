import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Rocket,
  ArrowRight,
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import AuthService from '@/services/AuthService';
import AlertMessage from '@/components/ui/AlertMessage';

const authService = new AuthService();

const LoginPage = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('app-token');

  if (token) {
    return <Navigate to="/" replace />;
  }

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await authService.login(credentials);

      const token = response.data?.accessToken || response.data?.token;
      if (token) {
        localStorage.setItem('app-token', token);
        localStorage.setItem('usuario', JSON.stringify(response.data));
      }

      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 m-0 flex min-h-[100dvh] w-full items-center justify-center bg-zinc-950 p-4 font-sans">
      <div className="grid w-full max-w-[1000px] grid-cols-1 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="flex items-center gap-2 text-zinc-100">
            <Wallet className="h-6 w-6" />
            <span className="text-lg font-semibold tracking-tight">
              Capital Atelier
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-medium tracking-tight text-zinc-100">
              Entrar na Sua Conta
            </h1>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400">
                E-mail
              </Label>

              <div className="relative">
                <Mail className="absolute top-3 left-3 h-4 w-4 text-zinc-600" />

                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="border-zinc-800 bg-zinc-950/50 pl-10 text-zinc-100 focus-visible:ring-zinc-700"
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
                  className="text-sm text-zinc-500 hover:text-zinc-300"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-zinc-600" />

                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="border-zinc-800 bg-zinc-950/50 pr-10 pl-10 text-zinc-100 focus-visible:ring-zinc-700"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3 cursor-pointer text-zinc-600 hover:text-zinc-400"
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <AlertMessage message={error} variant="error" />

            <Button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-zinc-100 font-bold tracking-tight text-zinc-900 hover:bg-zinc-300"
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </div>

        <div className="hidden flex-col items-center justify-center border-l border-zinc-800 bg-zinc-950 p-12 text-center md:flex">
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 shadow-sm">
              <Rocket className="h-8 w-8 text-zinc-300" />
            </div>

            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-zinc-100">
              Ainda não conhece o<br />
              Capital Atelier?
            </h2>

            <p className="max-w-[280px] text-sm leading-relaxed text-zinc-400">
              Descubra uma nova dimensão de gestão financeira com nossa
              plataforma moderna e inteligente.
            </p>

            <Button
              variant="outline"
              className="mt-6 cursor-pointer rounded-full border-zinc-700 bg-zinc-900 px-8 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
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
