import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthService from '@/services/AuthService';
import AlertMessage from '@/components/ui/AlertMessage';
import { ThemeToggle } from '@/components/ThemeToggle';

const authService = new AuthService();

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Por favor, digite seu e-mail.');
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setMessage('Link de redefinição enviado para o e-mail informado!');
      setEmail('');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Não foi possível enviar o e-mail de recuperação.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground flex min-h-[100dvh] w-full items-center justify-center p-4 font-sans">
      <div className="border-border bg-card text-card-foreground grid w-full max-w-[900px] grid-cols-1 overflow-hidden rounded-none border md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-8 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wallet className="size-6" />
              <span className="text-lg font-semibold tracking-tight">
                Capital Atelier
              </span>
            </div>
            <ThemeToggle />
          </div>

          <div className="mb-8">
            <h1 className="mb-3 text-2xl font-medium tracking-tight">
              Recuperar Senha
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Esqueceu sua senha? Não se preocupe. Digite o e-mail associado à
              sua conta e enviaremos um link para redefini-la.
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-muted-foreground">
                E-mail
              </Label>
              <div className="relative">
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
            </div>

            <AlertMessage message={error} variant="error" />
            <AlertMessage message={message} variant="success" />

            <Button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer font-bold tracking-tight"
            >
              {loading ? 'ENVIANDO...' : 'ENVIAR LINK'}
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

        <div className="border-border bg-secondary hidden flex-col items-center justify-center border-l p-12 text-center md:flex">
          <div className="flex flex-col items-center">
            <div className="border-border bg-card mb-6 flex size-16 items-center justify-center rounded-none border">
              <ShieldCheck className="text-foreground size-8" />
            </div>

            <h2 className="mb-3 text-xl font-semibold tracking-tight">
              Segurança em 1º Lugar
            </h2>

            <p className="text-muted-foreground max-w-[260px] text-sm leading-relaxed">
              Protegemos seus dados com criptografia de ponta a ponta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
