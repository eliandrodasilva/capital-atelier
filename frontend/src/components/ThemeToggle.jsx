import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle({ className }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label={
        isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'
      }
      title={isDark ? 'Tema claro' : 'Tema escuro'}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
