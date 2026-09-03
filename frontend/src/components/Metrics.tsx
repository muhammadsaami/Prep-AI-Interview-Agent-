import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Award } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

interface PublicStats {
  interviews_completed: number;
  total_users: number;
  avg_score: number | null;
}

export const Metrics: React.FC = () => {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/stats/public`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data: PublicStats = await res.json();
        if (isMounted) setStats(data);
      } catch {
        if (isMounted) setStats(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || !stats) return null;

  const metricsData = [
    {
      stat: stats.interviews_completed.toLocaleString(),
      label: 'Interviews Completed',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      stat: stats.total_users.toLocaleString(),
      label: 'Candidates Practicing',
      icon: TrendingUp,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
    {
      stat: stats.avg_score !== null ? `${stats.avg_score}/100` : '—',
      label: 'Average Feedback Score',
      icon: Award,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  return (
    <section className="relative py-12 border-y border-white/5 bg-[#08090D]/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {metricsData.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card-interactive rounded-2xl p-6 flex items-center gap-5 border border-white/5"
              >
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} border ${item.borderColor} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white tracking-tight font-sans">
                    {item.stat}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                    {item.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};