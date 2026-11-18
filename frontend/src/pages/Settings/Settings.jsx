import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

const THEME_OPTIONS = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
];

const SettingsPage = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="border-border border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
      </header>

      <main className="border-border bg-card text-card-foreground flex flex-col gap-6 rounded-none border p-6">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium tracking-tight">Aparência</h2>
            <p className="text-muted-foreground text-sm">
              Escolha o tema da interface ou siga a preferência do sistema
              operacional.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;

              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  aria-pressed={isActive}
                  onClick={() => setTheme(option.value)}
                  className="cursor-pointer"
                >
                  <Icon data-icon="inline-start" />
                  {option.label}
                </Button>
              );
            })}
          </div>

          {theme === 'system' && (
            <p className="text-muted-foreground text-xs">
              Tema efetivo no momento:{' '}
              {resolvedTheme === 'dark' ? 'Escuro' : 'Claro'}.
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
