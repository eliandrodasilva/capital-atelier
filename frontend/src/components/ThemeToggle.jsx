import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getResolvedTheme, subscribeTheme, toggleTheme } from '@/lib/theme';

export function ThemeToggle({ className }) {
  const [resolvedTheme, setResolvedTheme] = useState(getResolvedTheme);

  useEffect(() => subscribeTheme(setResolvedTheme), []);

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
