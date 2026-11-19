import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserService from '@/services/UserService';
import AlertMessage from '@/components/ui/AlertMessage';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter/PasswordStrengthMeter';

const userService = new UserService();

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword) {
      setError('Por favor, digite sua senha atual.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await userService.changePassword(usuario.id, {
        oldPassword,
        newPassword,
      });

      setSuccess('Senha alterada.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Erro ao alterar senha. Verifique se a senha atual está correta.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="border-border flex items-center justify-between border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Redefinir senha</h1>

        <Button
          onClick={() => navigate('/profile')}
          variant="outline"
          className="cursor-pointer"
        >
          <ArrowLeft data-icon="inline-start" />
          Voltar
        </Button>
      </header>

      <main className="border-border bg-card text-card-foreground rounded-none border p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="oldPassword" className="text-muted-foreground">
              Senha atual
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="oldPassword"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="pr-10 pl-10"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3 cursor-pointer"
              >
                {showOldPassword ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="newPassword" className="text-muted-foreground">
              Nova senha
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10 pl-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3 cursor-pointer"
              >
                {showNewPassword ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </button>
            </div>
            <PasswordStrengthMeter password={newPassword} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword" className="text-muted-foreground">
              Confirmar nova senha
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10 pl-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3 cursor-pointer"
              >
                {showConfirmPassword ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </button>
            </div>
          </div>

          <AlertMessage message={error} variant="error" />
          <AlertMessage message={success} variant="success" />

          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer font-bold"
          >
            {loading ? 'Alterando senha...' : 'Salvar nova senha'}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default ChangePasswordPage;
