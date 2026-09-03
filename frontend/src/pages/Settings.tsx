import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LayoutDashboard, MessagesSquare, Settings as SettingsIcon, LogOut } from 'lucide-react';

const SidebarNav: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: MessagesSquare, label: 'Sessions', path: '/sessions' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[220px] lg:w-[240px] shrink-0 h-screen bg-[#07080C] border-r border-white/8 relative z-10">
      <div className="px-5 py-5 border-b border-white/8">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-[1px]">
            <div className="w-full h-full bg-[#0A0B10] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Prep<span className="text-indigo-400">AI</span>
          </span>
        </a>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = window.location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-white'
                  : 'text-slate-500 hover:bg-white/3 hover:text-slate-300'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('user_name') || '';
  const userEmail = localStorage.getItem('user_email') || '';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#08090D] bg-grid-pattern">
      <SidebarNav />

      <main className="flex-1 px-6 md:px-10 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

        <div className="glass-card rounded-2xl p-6 max-w-lg space-y-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Name</p>
            <p className="text-sm text-white">{userName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Email</p>
            <p className="text-sm text-white">{userEmail || '—'}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-4 py-2.5 rounded-xl transition-all mt-4"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
};