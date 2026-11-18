import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Rocket,
  ArrowRight,
  Wallet,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import AuthService from '@/services/AuthService';
import { Link } from 'react-router-dom';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter/PasswordStrengthMeter';
import AlertMessage from '@/components/ui/AlertMessage';
import { ThemeToggle } from '@/components/ThemeToggle';

const authService = new AuthService();

const RegisterPage = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (user.password !== user.confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        name: user.username,
        email: user.email,
        password: user.password,
      });

      setSuccess('Conta criada com sucesso!');

      setUser({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Não foi possível realizar o cadastro.'
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

      <div className="border-border bg-card text-card-foreground grid w-full max-w-[1000px] grid-cols-1 overflow-hidden rounded-none border md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-6 flex items-center gap-2">
            <Wallet className="size-6" />
            <span className="text-lg font-semibold tracking-tight">
              Capital Atelier
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-medium tracking-tight">
              Crie sua conta
            </h1>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="username" className="text-muted-foreground">
                Nome de Usuário
              </Label>

              <div className="relative">
                <User className="text-muted-foreground absolute top-2.5 left-3 size-4" />

                <Input
                  id="username"
                  name="username"
                  value={user.username}
                  onChange={handleChange}
                  placeholder="Digite seu nome de usuário"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-muted-foreground">
                E-mail
              </Label>

              <div className="relative">
                <Mail className="text-muted-foreground absolute top-2.5 left-3 size-4" />

                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-muted-foreground">
                Senha
              </Label>

              <div className="relative">
                <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />

                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={user.password}
                  onChange={handleChange}
                  placeholder="Crie uma senha forte"
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

              <PasswordStrengthMeter password={user.password} />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="confirmPassword"
                className="text-muted-foreground"
              >
                Confirmar Senha
              </Label>

              <div className="relative">
                <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />

                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={user.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => {
                    if (user.password !== user.confirmPassword) {
                      setError('As senhas não conferem.');
                    }
                  }}
                  placeholder="Repita a senha"
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
              className="w-full cursor-pointer font-bold tracking-tight"
            >
              {loading ? 'CRIANDO CONTA...' : 'CRIAR CONTA'}
              {!loading && <ArrowRight data-icon="inline-end" />}
            </Button>
          </form>
        </div>

        <div className="border-border bg-secondary hidden flex-col items-center justify-center border-l p-12 text-center md:flex">
          <div className="relative z-10 flex flex-col items-center">
            <div className="border-border bg-card mb-6 flex size-16 items-center justify-center rounded-none border">
              <Rocket className="text-foreground size-8" />
            </div>

            <h2 className="mb-4 text-2xl font-semibold tracking-tight">
              Já faz parte da
              <br />
              nossa rede?
            </h2>

            <p className="text-muted-foreground max-w-[280px] text-sm leading-relaxed">
              Acesse sua conta para continuar sua jornada financeira e gerenciar
              seus recursos com facilidade.
            </p>

            <Button variant="outline" asChild className="mt-6 px-8">
              <Link to="/login">FAÇA LOGIN</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
