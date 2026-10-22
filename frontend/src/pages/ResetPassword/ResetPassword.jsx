import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Wallet,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AuthService from '@/services/AuthService';
import AlertMessage from '@/components/ui/AlertMessage';

const authService = new AuthService();

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!token) {
      setError('Token de redefinição não encontrado ou inválido na URL.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, newPassword);
      setMessage(
        'Senha redefinida com sucesso! Redirecionando para o login...'
      );
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Não foi possível redefinir a senha. O token pode ter expirado.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 m-0 flex min-h-[100dvh] w-full items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-50">
      <div className="grid w-full max-w-[900px] grid-cols-1 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-8 flex items-center gap-2 text-zinc-100">
            <Wallet className="h-6 w-6" />
            <span className="text-lg font-semibold tracking-tight">
              Capital Atelier
            </span>
          </div>

          <div className="mb-8">
            <h1 className="mb-3 text-2xl font-medium tracking-tight text-zinc-100">
              Definir Nova Senha
            </h1>
            <p className="text-sm leading-relaxed text-zinc-400">
              Crie uma nova senha forte para acessar sua conta. Ela deve ser
              diferente das anteriores.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-zinc-400">
                Nova Senha
              </Label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-zinc-600" />
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-zinc-800 bg-zinc-950/50 pr-10 pl-10 text-zinc-100 focus-visible:ring-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3 text-zinc-600 hover:text-zinc-400"
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-zinc-400">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-zinc-600" />
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-zinc-800 bg-zinc-950/50 pr-10 pl-10 text-zinc-100 focus-visible:ring-zinc-700"
                />
              </div>
            </div>

            <AlertMessage message={error} variant="error" />
            <AlertMessage message={message} variant="success" />

            <Button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-zinc-100 font-bold tracking-tight text-zinc-900 hover:bg-zinc-300"
            >
              {loading ? 'SALVANDO...' : 'SALVAR NOVA SENHA'}
            </Button>

            <div className="flex items-center justify-start pt-2">
              <Link
                to="/login"
                className="flex items-center text-sm text-zinc-500 hover:text-zinc-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Login
              </Link>
            </div>
          </form>
        </div>

        <div className="relative hidden flex-col items-center justify-center overflow-hidden border-l border-zinc-800 bg-zinc-950 p-12 text-center md:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950/0 to-zinc-950/0"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-zinc-300" />
            </div>

            <h2 className="mb-3 text-xl font-semibold tracking-tight text-zinc-100">
              Segurança em 1º Lugar
            </h2>

            <p className="max-w-[260px] text-sm leading-relaxed text-zinc-400">
              Protegemos seus dados com criptografia de ponta a ponta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
