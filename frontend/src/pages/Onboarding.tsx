import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sparkles,
    UploadCloud,
    FileText,
    X,
    ArrowRight,
    Loader2,
} from 'lucide-react';

const ROLE_SUGGESTIONS = [
    'AI Backend Developer',
    'Full Stack Engineer',
    'Frontend Developer',
    'Data Analyst',
    'Machine Learning Engineer',
    'DevOps Engineer',
    'Product Manager',
    'Backend Developer',
];

const API_BASE_URL = 'http://localhost:8000';

export const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [targetRole, setTargetRole] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredSuggestions = ROLE_SUGGESTIONS.filter((r) =>
        r.toLowerCase().includes(targetRole.toLowerCase())
    );

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
            setError(null);
        } else {
            setError('Please upload a PDF file.');
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setError('Please upload a PDF file.');
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleStartInterview = async () => {
        if (!file || !targetRole.trim()) return;
        setIsSubmitting(true);
        setError(null);

        try {
            // Step 1: Upload resume
            const formData = new FormData();
            formData.append('user_id', '1'); // TODO: replace with real authenticated user id
            formData.append('file', file);

            const uploadRes = await fetch(`${API_BASE_URL}/resume/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                const errData = await uploadRes.json();
                throw new Error(errData.detail || 'Resume upload failed.');
            }

            const resumeData = await uploadRes.json();

            // Step 2: Create interview session
            const sessionRes = await fetch(`${API_BASE_URL}/sessions/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 1,
                    resume_id: resumeData.id,
                    target_role: targetRole,
                }),
            });

            if (!sessionRes.ok) {
                const errData = await sessionRes.json();
                throw new Error(errData.detail || 'Failed to create interview session.');
            }

            const sessionData = await sessionRes.json();

            // Navigate to interview page with session id
            navigate(`/interview?session_id=${sessionData.session_id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canStart = !!file && targetRole.trim().length > 0 && !isSubmitting;

    return (
        <div className="min-h-screen bg-[#08090D] bg-grid-pattern flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
            {/* Ambient gradient */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2 mb-8 relative z-10"
            >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-[1px] shadow-md shadow-indigo-500/20">
                    <div className="w-full h-full bg-[#0A0B10] rounded-[11px] flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                </div>
                <span className="text-lg font-bold tracking-tight text-white">
                    Prep<span className="text-indigo-400">AI</span>
                </span>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass-card rounded-3xl p-8 w-full max-w-lg relative z-10"
            >
                <h1 className="text-xl font-bold text-white text-center mb-1">
                    Let's set up your mock interview
                </h1>
                <p className="text-sm text-slate-500 text-center mb-8">
                    Upload your resume so PrepAI can ask questions tailored to you.
                </p>

                {/* Upload Zone */}
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${isDragging
                            ? 'border-indigo-500/60 bg-indigo-500/5'
                            : file
                                ? 'border-emerald-500/40 bg-emerald-500/5'
                                : 'border-white/15 hover:border-indigo-500/40 hover:bg-white/3'
                        }`}
                >
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />

                    {file ? (
                        <div className="flex items-center justify-center gap-3">
                            <FileText className="w-6 h-6 text-emerald-400" />
                            <div className="text-left">
                                <p className="text-sm font-medium text-white truncate max-w-[220px]">
                                    {file.name}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    {(file.size / 1024).toFixed(0)} KB
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                }}
                                className="relative z-10 w-6 h-6 rounded-full bg-white/8 flex items-center justify-center hover:bg-white/15 transition-colors"
                            >
                                <X className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-1">
                                <UploadCloud className="w-6 h-6 text-indigo-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-300">
                                Drag & drop your resume or click to browse
                            </p>
                            <p className="text-xs text-slate-600">PDF only, up to 5MB</p>
                        </div>
                    )}
                </div>

                {/* Target Role Input */}
                <div className="mt-6 relative">
                    <label className="text-xs font-medium text-slate-400 mb-2 block">
                        Target Role
                    </label>
                    <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        placeholder="e.g. AI Backend Developer"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
                    />

                    {showSuggestions && targetRole && filteredSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl overflow-hidden z-20">
                            {filteredSuggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onMouseDown={() => {
                                        setTargetRole(suggestion);
                                        setShowSuggestions(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-white transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="mt-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                {/* Start Button */}
                <button
                    onClick={handleStartInterview}
                    disabled={!canStart}
                    className={`w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all ${canStart
                            ? 'gradient-button text-white'
                            : 'bg-white/5 text-slate-600 cursor-not-allowed'
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Setting up your interview...
                        </>
                    ) : (
                        <>
                            Start Interview
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </motion.div>
        </div>
    );
};