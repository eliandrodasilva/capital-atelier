import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getResolvedTheme, subscribeTheme, toggleTheme } from '@/lib/theme';
import { BrandLogo } from '@/components/BrandLogo';

const ROLE_LABELS = {
  OWNER: 'Proprietário',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador',
};

const Sidebar = ({ wallets = [], activeWallet = null, onSelectWallet }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resolvedTheme, setResolvedTheme] = useState(getResolvedTheme);
  useEffect(() => subscribeTheme(setResolvedTheme), []);
  const isDark = resolvedTheme === 'dark';
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('app-token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('capital-atelier-active-wallet');
    navigate('/login');
  };

  return (
    <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r">
      <div className="border-sidebar-border flex h-20 items-center gap-3 border-b px-6">
        <BrandLogo className="text-sidebar-foreground size-6 shrink-0" />
        <span className="text-sidebar-foreground overflow-hidden text-lg font-semibold tracking-tight whitespace-nowrap">
          Capital Atelier
        </span>
      </div>

      {wallets.length > 0 && (
        <div className="border-sidebar-border border-b px-4 py-3">
          <label
            htmlFor="active-wallet-select"
            className="text-muted-foreground mb-1.5 block text-[10px] font-bold tracking-wider uppercase"
          >
            Carteira ativa
          </label>
          <select
            id="active-wallet-select"
            value={activeWallet?.id ?? ''}
            onChange={(e) => onSelectWallet?.(e.target.value)}
            className="border-sidebar-border bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-none border px-2 text-sm outline-none focus-visible:ring-3"
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          {activeWallet?.role && (
            <p className="text-muted-foreground mt-1 text-[11px]">
              Papel: {ROLE_LABELS[activeWallet.role] || activeWallet.role}
            </p>
          )}
        </div>
      )}

      <div className="custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <nav className="flex flex-col gap-1">
          <NavItem
            icon={<LayoutDashboard />}
            label="Dashboard"
            active={location.pathname === '/'}
            onClick={() => navigate('/')}
          />
          <NavItem
            icon={<ArrowLeftRight />}
            label="Transações"
            active={location.pathname === '/transactions'}
            onClick={() => navigate('/transactions')}
          />
          <NavItem
            icon={<WalletCards />}
            label="Carteiras"
            active={location.pathname === '/wallets'}
            onClick={() => navigate('/wallets')}
          />
        </nav>

        <nav className="border-sidebar-border flex flex-col gap-1 border-t pt-4">
          <NavItem
            icon={<User />}
            label="Perfil"
            active={location.pathname === '/profile'}
            onClick={() => navigate('/profile')}
          />
          <NavItem
            icon={<Settings />}
            label="Configurações"
            active={location.pathname === '/settings'}
            onClick={() => navigate('/settings')}
          />
        </nav>
      </div>

      <div className="border-sidebar-border border-t p-4">
        <div
          className="mb-4 flex cursor-pointer items-center"
          onClick={() => navigate('/profile')}
        >
          <div className="border-sidebar-border bg-secondary flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-none border">
            <img
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${usuario.username || 'User'}`}
              alt="User"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sidebar-foreground max-w-[140px] truncate text-sm font-medium whitespace-nowrap">
              {usuario.username || 'Usuário'}
            </p>
            <p className="text-muted-foreground max-w-[140px] truncate text-xs whitespace-nowrap">
              {usuario.email || 'Sem e-mail'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full cursor-pointer items-center rounded-none p-2"
          >
            {isDark ? (
              <Sun className="size-5 shrink-0" />
            ) : (
              <Moon className="size-5 shrink-0" />
            )}
            <span className="ml-3 text-sm font-medium whitespace-nowrap">
              {isDark ? 'Tema claro' : 'Tema escuro'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full cursor-pointer items-center rounded-none p-2"
          >
            <LogOut className="size-5 shrink-0" />
            <span className="ml-3 text-sm font-medium whitespace-nowrap">
              Sair
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-center rounded-none p-2 text-left ${
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      }`}
    >
      <div
        className={`shrink-0 ${
          active
            ? 'text-sidebar-accent-foreground'
            : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
        }`}
      >
        {React.cloneElement(icon, { className: 'size-5' })}
      </div>

      <span className="ml-3 overflow-hidden text-sm font-medium whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

export default Sidebar;
