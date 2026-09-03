import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Plus,
    LayoutDashboard,
    MessagesSquare,
    Settings,
    Code2,
    MessageCircle,
    Crown,
    ChevronRight,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

interface SessionCard {
    session_id: number;
    target_role: string;
    status: string;
    started_at: string;
    technical_score: number | null;
    communication_score: number | null;
}

const ScoreRing: React.FC<{ score: number; label: string; color: string }> = ({
    score,
    label,
    color,
}) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                    <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{score}</span>
                </div>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">{label}</span>
        </div>
    );
};

const SidebarNav: React.FC = () => {
    const navigate = useNavigate();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: MessagesSquare, label: 'Sessions', path: '/sessions' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="hidden md:flex flex-col w-[220px] lg:w-[240px] shrink-0 h-screen bg-[#07080C] border-r border-white/8 relative z-10">
            <div className="px-5 py-5 border-b border-white/8">
                <a href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-[1px] shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
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

            <div className="px-4 py-4 border-t border-white/8">
                <div className="glass-card rounded-2xl p-4 text-center">
                    <Crown className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-white mb-1">Upgrade to Pro</p>
                    <p className="text-[10px] text-slate-500 mb-3">Unlock unlimited interviews</p>
                    <button className="gradient-button w-full text-xs font-semibold text-white py-2 rounded-lg">
                        Upgrade
                    </button>
                </div>
            </div>
        </aside>
    );
};

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<SessionCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const userName = localStorage.getItem('user_name') || 'there';
    const userId = localStorage.getItem('user_id');

    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

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
    }, [userId]);

    const completedSessions = sessions.filter((s) => s.technical_score !== null);
    const avgTechnical = completedSessions.length
        ? Math.round(
            completedSessions.reduce((sum, s) => sum + (s.technical_score || 0), 0) / completedSessions.length
        )
        : 0;
    const avgCommunication = completedSessions.length
        ? Math.round(
            completedSessions.reduce((sum, s) => sum + (s.communication_score || 0), 0) / completedSessions.length
        )
        : 0;

    return (
        <div className="flex min-h-screen bg-[#08090D] bg-grid-pattern">
            <SidebarNav />

            <main className="flex-1 px-6 md:px-10 py-8 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                            Welcome back, {userName} <span className="inline-block">👋</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Here's how your interview prep is going.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/onboarding')}
                        className="gradient-button flex items-center gap-2 text-sm font-semibold text-white px-5 py-3 rounded-xl w-fit"
                    >
                        <Plus className="w-4 h-4" />
                        Start New Interview
                    </button>
                </motion.div>

                {/* Stat Summary Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="glass-card rounded-2xl p-5 flex items-center gap-4"
                    >
                        <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
                            <Code2 className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Avg. Technical Score</p>
                            <p className="text-xl font-bold text-white">{avgTechnical || '—'}/100</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="glass-card rounded-2xl p-5 flex items-center gap-4"
                    >
                        <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0">
                            <MessageCircle className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Avg. Communication Score</p>
                            <p className="text-xl font-bold text-white">{avgCommunication || '—'}/100</p>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Sessions */}
                <div>
                    <h2 className="text-sm font-semibold text-white mb-4">Recent Interview Sessions</h2>

                    {isLoading && <p className="text-sm text-slate-500">Loading your sessions...</p>}

                    {error && (
                        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                            {error}
                        </p>
                    )}

                    {!isLoading && !error && sessions.length === 0 && (
                        <div className="glass-card rounded-2xl p-10 text-center">
                            <p className="text-sm text-slate-400 mb-4">
                                You haven't done any mock interviews yet.
                            </p>
                            <button
                                onClick={() => navigate('/onboarding')}
                                className="gradient-button text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
                            >
                                Start Your First Interview
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sessions.map((session, i) => (
                            <motion.div
                                key={session.session_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
                                className="glass-card-interactive rounded-2xl p-5"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{session.target_role}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            {new Date(session.started_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                            {' · '}
                                            <span
                                                className={
                                                    session.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'
                                                }
                                            >
                                                {session.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {session.technical_score !== null && session.communication_score !== null ? (
                                    <>
                                        <div className="flex items-center justify-around py-2">
                                            <ScoreRing score={session.technical_score} label="Technical" color="#818CF8" />
                                            <ScoreRing score={session.communication_score} label="Communication" color="#C084FC" />
                                        </div>
                                        <button
                                            onClick={() => navigate(`/feedback?session_id=${session.session_id}`)}
                                            className="w-full mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 py-2.5 rounded-xl border border-indigo-500/20 hover:bg-indigo-500/10 transition-all"
                                        >
                                            View Report
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => navigate(`/interview?session_id=${session.session_id}`)}
                                        className="w-full mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 py-2.5 rounded-xl border border-amber-500/20 hover:bg-amber-500/10 transition-all"
                                    >
                                        Resume Interview
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};