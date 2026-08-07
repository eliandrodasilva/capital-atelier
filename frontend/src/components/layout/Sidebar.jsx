import React from "react";
import { 
  Wallet, 
  LayoutDashboard, 
  Settings,
  User, 
  LogOut 
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("app-token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col flex-shrink-0 sticky top-0">
      
      <div className="h-20 flex items-center px-6 border-b border-zinc-800/50 gap-3">
        <Wallet className="w-6 h-6 text-zinc-100 flex-shrink-0" />
        <span className="font-semibold text-lg text-zinc-100 tracking-tight whitespace-nowrap overflow-hidden">
          Capital Atelier
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 custom-scrollbar">
        
        <div className="px-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3 block px-2">
            Menu
          </span>
          
          <nav className="space-y-1">
            <NavItem 
              icon={<LayoutDashboard />} 
              label="Dashboard" 
              active={location.pathname === "/"}
              onClick={() => navigate("/")}
            />
          </nav>
        </div>

        <div className="px-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3 block px-2">
            System
          </span>

          <nav className="space-y-1">
            <NavItem 
              icon={<User />} 
              label="Profile" 
              active={location.pathname === "/profile"} 
              onClick={() => navigate("/profile")} 
            />
          </nav>
          
          <nav className="space-y-1">
            <NavItem 
              icon={<Settings />} 
              label="Settings" 
              active={location.pathname === "/settings"} 
              onClick={() => navigate("/settings")} 
            />
          </nav>
        </div>

      </div>

      <div className="border-t border-zinc-800/50 p-4">
        <div className="flex items-center mb-4 cursor-pointer" onClick={() => navigate("/profile")}>
          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
            <img 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${usuario.username || 'User'}`} 
              alt="User" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-zinc-100 whitespace-nowrap truncate max-w-[140px]">
              {usuario.username || "Usuário"}
            </p>
            <p className="text-xs text-zinc-500 whitespace-nowrap truncate max-w-[140px]">
              {usuario.email || "Sem e-mail"}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="ml-3 text-sm font-medium whitespace-nowrap">Log out</span>
        </button>
      </div>

    </aside>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center p-2 rounded-lg transition-colors cursor-pointer group text-left
        ${active 
          ? 'bg-zinc-800 text-zinc-100' 
          : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-100'
        }
      `}
    >
      <div className={`flex-shrink-0 ${active ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-100'}`}>
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
      </div>
      
      <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden">
        {label}
      </span>
    </button>
  );
}

export default Sidebar;