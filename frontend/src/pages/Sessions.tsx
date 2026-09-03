import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, LayoutDashboard, MessagesSquare, Settings as SettingsIcon, ChevronRight } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

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

interface SessionCard {
  session_id: number;
  target_role: string;
  status: string;
  started_at: string;
  technical_score: number | null;
  communication_score: number | null;
}

export const Sessions: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    const loadSessions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/sessions/user/${userId}`);
        if (!res.ok) throw new Error('Failed to load your sessions.');
        const data: SessionCard[] = await res.json();
        setSessions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      } finally {
        setIsLoading(false);
      }
    };
    loadSessions();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#08090D] bg-grid-pattern">
      <SidebarNav />

      <main className="flex-1 px-6 md:px-10 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">All Sessions</h1>

        {isLoading && <p className="text-sm text-slate-500">Loading your sessions...</p>}
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {!isLoading && !error && sessions.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center max-w-lg">
            <p className="text-sm text-slate-400">You haven't done any mock interviews yet.</p>
          </div>
        )}

        <div className="space-y-3 max-w-2xl">
          {sessions.map((session, i) => (
            <motion.div
              key={session.session_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="glass-card-interactive rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-white">{session.target_role}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {new Date(session.started_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {' · '}
                  <span className={session.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}>
                    {session.status}
                  </span>
                </p>
              </div>
              <button
                onClick={() =>
                  navigate(
                    session.status === 'completed'
                      ? `/feedback?session_id=${session.session_id}`
                      : `/interview?session_id=${session.session_id}`
                  )
                }
                className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                {session.status === 'completed' ? 'View Report' : 'Resume'}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};