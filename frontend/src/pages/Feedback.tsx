import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    ChevronDown,
    CheckCircle2,
    AlertTriangle,
    ArrowLeft,
    Lightbulb,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

interface ImprovementArea {
    title: string;
    description: string;
    suggested_answer: string;
    severity: 'high' | 'medium' | 'low';
}

interface FeedbackData {
    session_id: number;
    technical_score: number;
    communication_score: number;
    summary: string;
    improvement_areas: ImprovementArea[];
}

const severityConfig = {
    high: { color: '#F87171', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    medium: { color: '#FBBF24', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    low: { color: '#818CF8', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
};

const ScoreGauge: React.FC<{ score: number; label: string; colorFrom: string; colorTo: string }> = ({
    score,
    label,
    colorFrom,
    colorTo,
}) => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const gradientId = `gauge-gradient-${label.replace(/\s/g, '')}`;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative w-36 h-36">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={colorFrom} />
                            <stop offset="100%" stopColor={colorTo} />
                        </linearGradient>
                    </defs>
                    <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <motion.circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{score}</span>
                    <span className="text-[10px] text-slate-500">/ 100</span>
                </div>
            </div>
            <span className="text-sm font-semibold text-slate-300">{label}</span>
        </div>
    );
};

const AccordionCard: React.FC<{ area: ImprovementArea; index: number }> = ({ area, index }) => {
    const [open, setOpen] = useState(false);
    const config = severityConfig[area.severity] || severityConfig.medium;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
            className="glass-card rounded-2xl overflow-hidden"
        >
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center shrink-0 mt-0.5`}>
                        <AlertTriangle className="w-4 h-4" style={{ color: config.color }} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">{area.title}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{area.description}</p>
                    </div>
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} className="shrink-0">
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                </motion.div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-1">
                            <div className="flex items-start gap-2 bg-indigo-500/8 border border-indigo-500/20 rounded-xl p-4">
                                <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-semibold text-indigo-400 mb-1">Suggested Better Answer</p>
                                    <p className="text-xs text-slate-300 leading-relaxed">{area.suggested_answer}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export const Feedback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');

    const [data, setData] = useState<FeedbackData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setError('No session ID provided.');
            setIsLoading(false);
            return;
        }

        const loadFeedback = async () => {
            try {
                let res = await fetch(`${API_BASE_URL}/session/${sessionId}/feedback`);

                // If report doesn't exist yet, generate it on the fly.
                if (res.status === 404) {
                    res = await fetch(`${API_BASE_URL}/session/${sessionId}/feedback`, { method: 'POST' });
                }

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.detail || 'Failed to load feedback report.');
                }

                const result: FeedbackData = await res.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong.');
            } finally {
                setIsLoading(false);
            }
        };

        loadFeedback();
    }, [sessionId]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#08090D]">
                <p className="text-slate-400 text-sm">Generating your feedback report...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col h-screen w-screen items-center justify-center bg-[#08090D] gap-4">
                <p className="text-red-400 text-sm">{error || 'No feedback data available.'}</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="gradient-button text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#08090D] bg-grid-pattern">
            <div className="border-b border-white/8 px-6 md:px-10 py-4 flex items-center justify-between">
                <a href="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </a>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold text-white">
                        Prep<span className="text-indigo-400">AI</span>
                    </span>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                        Interview Feedback Report
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="glass-card rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-center gap-10 mb-8"
                >
                    <ScoreGauge score={data.technical_score} label="Technical Score" colorFrom="#60A5FA" colorTo="#818CF8" />
                    <ScoreGauge score={data.communication_score} label="Communication Score" colorFrom="#818CF8" colorTo="#C084FC" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="glass-card rounded-2xl p-6 mb-8"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <h2 className="text-sm font-semibold text-white">Overall Summary</h2>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{data.summary}</p>
                </motion.div>

                <div>
                    <h2 className="text-sm font-semibold text-white mb-4">Areas for Improvement</h2>
                    <div className="space-y-3">
                        {data.improvement_areas.map((area, i) => (
                            <AccordionCard key={i} area={area} index={i} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};