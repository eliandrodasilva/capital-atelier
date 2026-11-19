import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AuthService from '@/services/AuthService';
import AlertMessage from '@/components/ui/AlertMessage';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BrandLogo } from '@/components/BrandLogo';

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
    <div className="bg-background text-foreground relative flex min-h-[100dvh] w-full items-center justify-center p-4 pt-16 font-sans sm:p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="border-border bg-card text-card-foreground w-full max-w-[450px] overflow-hidden rounded-none border">
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-8 flex items-center gap-2">
            <BrandLogo />
            <span className="text-lg font-semibold tracking-tight">
              Capital Atelier
            </span>
          </div>

          <div className="mb-8">
            <h1 className="mb-3 text-2xl font-medium tracking-tight">
              Definir Nova Senha
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Crie uma nova senha forte para acessar sua conta. Ela deve ser
              diferente das anteriores.
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password" className="text-muted-foreground">
                Nova Senha
              </Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10 pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3 cursor-pointer"
                >
                  {showPassword ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="confirm-password"
                className="text-muted-foreground"
              >
                Confirmar Senha
              </Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10 pl-10"
                />
              </div>
            </div>

            <AlertMessage message={error} variant="error" />
            <AlertMessage message={message} variant="success" />

            <Button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer font-bold tracking-tight"
            >
              {loading ? 'SALVANDO...' : 'SALVAR NOVA SENHA'}
            </Button>

            <div className="flex items-center justify-start pt-2">
              <Link
                to="/login"
                className="text-muted-foreground hover:text-foreground flex items-center text-sm"
              >
                <ArrowLeft className="mr-2 size-4" />
                Voltar para Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
