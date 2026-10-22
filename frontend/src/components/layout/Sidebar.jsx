import React from 'react';
import { Wallet, LayoutDashboard, Settings, User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('app-token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-20 items-center justify-between gap-3 border-b border-zinc-800/50 px-6">
        <div className="flex items-center gap-3 overflow-hidden">
          <Wallet className="h-6 w-6 flex-shrink-0 text-zinc-100" />
          <span className="overflow-hidden text-lg font-semibold tracking-tight whitespace-nowrap text-zinc-100">
            Capital Atelier
          </span>
        </div>
        <ThemeToggle />
      </div>

      <div className="custom-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto py-6">
        <div className="px-4">
          <span className="mb-3 block px-2 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
            Menu
          </span>

          <nav className="space-y-1">
            <NavItem
              icon={<LayoutDashboard />}
              label="Dashboard"
              active={location.pathname === '/'}
              onClick={() => navigate('/')}
            />
          </nav>
        </div>

        <div className="px-4">
          <span className="mb-3 block px-2 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
            Sistema
          </span>

          <nav className="space-y-1">
            <NavItem
              icon={<User />}
              label="Perfil"
              active={location.pathname === '/profile'}
              onClick={() => navigate('/profile')}
            />
          </nav>

          <nav className="space-y-1">
            <NavItem
              icon={<Settings />}
              label="Configurações"
              active={location.pathname === '/settings'}
              onClick={() => navigate('/settings')}
            />
          </nav>
        </div>
      </div>

      <div className="border-t border-zinc-800/50 p-4">
        <div
          className="mb-4 flex cursor-pointer items-center"
          onClick={() => navigate('/profile')}
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
            <img
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${usuario.username || 'User'}`}
              alt="User"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="max-w-[140px] truncate text-sm font-medium whitespace-nowrap text-zinc-100">
              {usuario.username || 'Usuário'}
            </p>
            <p className="max-w-[140px] truncate text-xs whitespace-nowrap text-zinc-500">
              {usuario.email || 'Sem e-mail'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="ml-3 text-sm font-medium whitespace-nowrap">
            Sair
          </span>
        </button>
      </div>
    </aside>
  );
};

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-center rounded-lg p-2 text-left ${
        active
          ? 'bg-zinc-800 text-zinc-100'
          : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-100'
      } `}
    >
      <div
        className={`flex-shrink-0 ${active ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-100'}`}
      >
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
      </div>

      <span className="ml-3 overflow-hidden text-sm font-medium whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

export default Sidebar;
