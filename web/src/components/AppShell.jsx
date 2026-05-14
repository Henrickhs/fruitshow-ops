import { Outlet, NavLink } from 'react-router-dom';
import { Bell, Building2, CheckSquare, ClipboardList, FolderOpen, Home, LogOut, Megaphone, Rocket, Ticket, Users } from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';
import { BrandLogo } from './BrandLogo.jsx';

const nav = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/unidades', label: 'Unidades', icon: Building2 },
  { to: '/checklist', label: 'Checklist', icon: CheckSquare },
  { to: '/chamados', label: 'Chamados', icon: Ticket },
  { to: '/comunicados', label: 'Comunicados', icon: Megaphone },
  { to: '/projetos', label: 'Projetos', icon: ClipboardList },
  { to: '/implantacao', label: 'Implantação', icon: Rocket },
  { to: '/disco', label: 'Disco Virtual', icon: FolderOpen }
];

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f6f7f2] text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-acai-900 text-white lg:block">
        <div className="flex h-28 flex-col items-center justify-center px-5">
          <BrandLogo showText={false} />
        </div>
        <nav className="px-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `mb-1 flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                  isActive ? 'bg-white text-acai-900' : 'text-acai-100 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <Users className="text-folha" size={20} />
            <div>
              <p className="text-sm font-bold">Operação de campo</p>
              <p className="text-xs text-slate-500">Visão diária para supervisores e gestores</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-600" title="Notificações">
              <Bell size={18} />
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs capitalize text-slate-500">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={logout} className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-600" title="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold ${
                  isActive ? 'bg-acai-700 text-white' : 'bg-slate-100 text-slate-700'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
