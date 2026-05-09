import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@presentation/components/ui/Button';
import { Input } from '@presentation/components/ui/Input';
import { Logo } from '@presentation/components/layout/Logo';
import { useAuthStore } from '@application/auth/auth-store';
import { signInWithCredentials } from '@application/auth/use-validate-api-key';
import { useTheme } from '@presentation/theme/ThemeProvider';

const schema = z.object({
  email: z.string().trim().min(1, 'Email requis').email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginValues = z.infer<typeof schema>;

export default function LoginPage() {
  const authed = useAuthStore((s) => s.authed);
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (authed) navigate('/', { replace: true });
  }, [authed, navigate]);

  if (authed) return <Navigate to="/" replace />;

  const onSubmit = async (values: LoginValues) => {
    setPending(true);
    const result = await signInWithCredentials(values);
    setPending(false);
    if (!result.ok) {
      setError('password', { message: result.error.message });
      toast.error(result.error.message);
      return;
    }
    signIn(values.email.trim());
    toast.success('Bienvenue dans le backoffice Quizz+');
    const from = (location.state as { from?: string } | null)?.from || '/';
    navigate(from, { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute top-1/2 -left-32 h-96 w-96 rounded-full bg-accent-300/30 blur-3xl" />
      </div>

      <div className="absolute right-4 top-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Changer le thème"
          className="rounded-lg border border-border bg-surface p-2 text-muted hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-2">
        {/* Visuel marketing */}
        <div className="hidden lg:flex flex-col gap-8">
          <Logo size={48} />
          <div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl">
              Pilotez l'univers <span className="quizz-gradient-text">Quizz+</span>
              <br />
              avec puissance & élégance.
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted">
              Une console premium pour gérer vos quiz, vos défis, vos compétitions et votre
              communauté en quelques clics.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-3 max-w-md">
            {[
              { icon: Sparkles, label: 'Catalogue centralisé' },
              { icon: ShieldCheck, label: 'Modération robuste' },
              { icon: Lock, label: 'Accès sécurisé' },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-surface/70 px-3 py-2 backdrop-blur"
              >
                <span className="quizz-gradient inline-flex h-7 w-7 items-center justify-center rounded-lg text-white">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-semibold text-foreground">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Formulaire */}
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden mb-6 flex justify-center">
            <Logo size={42} />
          </div>
          <div className="rounded-2xl border border-border bg-surface/80 p-8 shadow-card backdrop-blur">
            <h2 className="text-2xl font-black text-foreground">Connexion administrateur</h2>
            <p className="mt-1 text-sm text-muted">
              Saisissez vos identifiants pour accéder à la console.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <Input
                {...register('email')}
                type="email"
                label="Email"
                placeholder="admin@example.com"
                autoComplete="email"
                autoFocus
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
              />

              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                placeholder="••••••••"
                autoComplete="current-password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="rounded-md p-1 text-muted hover:text-foreground"
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
              />

              <Button type="submit" variant="gradient" size="lg" fullWidth loading={pending}>
                Se connecter
              </Button>
            </form>

            <p className="mt-5 text-center text-2xs text-muted">
              Identifiants gérés via les variables <code>VITE_ADMIN_EMAIL</code> /{' '}
              <code>VITE_ADMIN_PASSWORD</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
