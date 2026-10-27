import { useState } from 'react';
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
import { ThemeToggle } from '@/components/ThemeToggle';

const authService = new AuthService();

const LoginPage = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('app-token');

  if (token) {
    return <Navigate to="/" replace />;
  }

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
    <div className="bg-background text-foreground flex min-h-[100dvh] w-full items-center justify-center p-4 font-sans">
      <div className="border-border bg-card text-card-foreground grid w-full max-w-[1000px] grid-cols-1 overflow-hidden rounded-none border md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-6 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wallet className="size-6" />
              <span className="text-lg font-semibold tracking-tight">
                Capital Atelier
              </span>
            </div>
            <ThemeToggle />
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-medium tracking-tight">
              Entrar na Sua Conta
            </h1>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
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
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-muted-foreground">
                  Senha
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <div className="relative">
                <Lock className="text-muted-foreground absolute top-2.5 left-3 size-4" />

                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleChange}
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

            <AlertMessage message={error} variant="error" />

            <Button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer font-bold tracking-tight"
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
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
              Ainda não conhece o<br />
              Capital Atelier?
            </h2>

            <p className="text-muted-foreground max-w-[280px] text-sm leading-relaxed">
              Descubra uma nova dimensão de gestão financeira com nossa
              plataforma moderna e inteligente.
            </p>

            <Button variant="outline" asChild className="mt-6 px-8">
              <Link to="/register">CADASTRE-SE</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
