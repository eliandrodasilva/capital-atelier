import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserService from '@/services/UserService';
import AlertMessage from '@/components/ui/AlertMessage';
import { Separator } from '@/components/ui/separator';

const userService = new UserService();

const ProfilePage = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const [username, setUsername] = useState(usuario.username || '');
  const [email, setEmail] = useState(usuario.email || '');

  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('O nome de usuário não pode estar em branco.');
      return;
    }

    setLoadingUsername(true);

    try {
      const response = await userService.updateUser(usuario.id, { username });

      const updatedUser = {
        ...usuario,
        username: response.data.username || username,
      };

      localStorage.setItem('usuario', JSON.stringify(updatedUser));
      setSuccess('Nome de usuário atualizado.');
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Erro ao atualizar nome de usuário.'
      );
    } finally {
      setLoadingUsername(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('O e-mail não pode estar em branco.');
      return;
    }

    setLoadingEmail(true);

    try {
      const response = await userService.updateUser(usuario.id, { email });

      const updatedUser = {
        ...usuario,
        email: response.data.email || email,
      };

      localStorage.setItem('usuario', JSON.stringify(updatedUser));
      setSuccess('E-mail atualizado.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao atualizar e-mail.');
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="border-border border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Perfil de usuário</h1>
      </header>

      <main className="flex flex-col gap-6">
        <div className="border-border bg-card text-card-foreground flex items-center gap-4 rounded-none border p-6">
          <div className="border-border bg-secondary flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-none border">
            <img
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${username || 'User'}`}
              alt="User Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <h2 className="truncate text-xl font-semibold">
              {username || 'Usuário'}
            </h2>
            <p className="text-muted-foreground truncate text-sm">
              {email || 'Sem e-mail'}
            </p>
          </div>
        </div>

        <AlertMessage message={error} variant="error" />
        <AlertMessage message={success} variant="success" />

        <div className="border-border bg-card text-card-foreground flex flex-col gap-6 rounded-none border p-6">
          <form onSubmit={handleUpdateUsername} className="flex flex-col gap-2">
            <Label htmlFor="username" className="text-muted-foreground">
              Nome de usuário
            </Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <User className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                type="submit"
                disabled={loadingUsername}
                className="cursor-pointer font-medium"
              >
                {loadingUsername ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>

          <Separator />

          <form onSubmit={handleUpdateEmail} className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-muted-foreground">
              E-mail
            </Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10"
                />
              </div>
              <Button
                type="submit"
                disabled={loadingEmail}
                className="cursor-pointer font-medium"
              >
                {loadingEmail ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>

          <Separator />

          <div className="pt-2">
            <Button
              onClick={() => navigate('/profile/change-password')}
              variant="outline"
              className="w-full cursor-pointer py-5 font-semibold"
            >
              Redefinir senha
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
