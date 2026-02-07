
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, trendUp }) => {
  return (
    <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm hover:border-indigo-500/50 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
          <Icon className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
        </div>
        {trend && (
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
             {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 mt-2 font-mono tracking-tighter">{value}</h3>
      </div>
    </div>
  );
};

export default StatsCard;
