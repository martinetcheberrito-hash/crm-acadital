
import React, { useMemo, useState, useEffect } from 'react';
import { Lead, LeadOrigin, Qualification } from '../types';
import { 
  BarChart3, Target, TrendingUp, DollarSign, ArrowUpRight, Users, Zap, PieChart, Activity, Wallet, Clock, Filter, Calendar, Percent, UserCheck, ChevronDown
} from 'lucide-react';

interface ReportsViewProps {
  leads: Lead[];
  currentPeriod: '7days' | 'month' | 'all' | 'custom';
}

const ReportsView: React.FC<ReportsViewProps> = ({ leads, currentPeriod }) => {
  const [localRange, setLocalRange] = useState<'7days' | 'month' | 'all' | 'custom'>(currentPeriod);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    if (currentPeriod !== 'custom') {
      setLocalRange(currentPeriod);
    }
  }, [currentPeriod]);

  const metrics = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();
    
    if (localRange === '7days') {
      start.setDate(now.getDate() - 7);
    } else if (localRange === 'month') {
      start.setDate(1);
    } else if (localRange === 'custom' && startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // 'all' logic
      start = new Date(0);
    }
    
    start.setHours(0, 0, 0, 0);
    if (localRange !== 'custom') {
      end = now;
    }

    // Filtrar leads por agenda en el periodo
    const agendasInPeriod = leads.filter(l => {
      if (!l.call_date) return false;
      if (localRange === 'all') return true;
      const callDate = new Date(l.call_date);
      return callDate >= start && callDate <= end;
    });

    // Filtrar ventas por fecha de pago en el periodo
    const salesInPeriod = leads.filter(l => {
      if (!l.bought || !l.first_payment_date) return false;
      if (localRange === 'all') return true;
      const payDate = new Date(l.first_payment_date);
      return payDate >= start && payDate <= end;
    });

    const totalRevenue = salesInPeriod.reduce((acc, l) => acc + (l.revenue || 0), 0);
    const totalCollected = salesInPeriod.reduce((acc, l) => acc + (l.collected_amount || 0), 0);
    const setterCommissions = salesInPeriod.reduce((acc, l) => acc + (l.setter_commission || 0), 0);
    const closerCommissions = salesInPeriod.reduce((acc, l) => acc + (l.closer_commission || 0), 0);
    
    const offersCount = agendasInPeriod.filter(l => l.offer_made).length;
    const closureRateOnOffers = offersCount > 0 ? (salesInPeriod.length / offersCount) * 100 : 0;

    // Timeline de agendas (Agrupado por día)
    const timelineData = agendasInPeriod.reduce((acc: any, lead) => {
      const dateKey = new Date(lead.call_date!).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});

    const sortedTimeline = Object.entries(timelineData).map(([date, count]) => ({ date, count: count as number }));

    // Distribución por Origen
    const originDistribution = agendasInPeriod.reduce((acc: any, lead) => {
      acc[lead.origin] = (acc[lead.origin] || 0) + 1;
      return acc;
    }, {});

    const sortedOrigins = Object.entries(originDistribution)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);

    return {
      totalRevenue,
      totalCollected,
      setterCommissions,
      closerCommissions,
      totalAgendas: agendasInPeriod.length,
      offersCount,
      closureRateOnOffers,
      sortedTimeline,
      sortedOrigins
    };
  }, [leads, localRange, startDate, endDate]);

  const maxAgendas = Math.max(...metrics.sortedTimeline.map(t => t.count), 1);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">BI Inteligencia</h1>
          <p className="text-slate-500 font-medium">Análisis avanzado de performance y flujo de caja.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
           {localRange === 'custom' && (
             <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm animate-in slide-in-from-right-4 duration-300">
                <input 
                  type="date" 
                  className="bg-transparent text-[10px] font-black uppercase outline-none px-2 text-slate-600"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <div className="w-px h-4 bg-slate-200"></div>
                <input 
                  type="date" 
                  className="bg-transparent text-[10px] font-black uppercase outline-none px-2 text-slate-600"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
             </div>
           )}
           <div className="flex items-center gap-3 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
              <div className="flex bg-slate-50 p-1 rounded-xl">
                {(['7days', 'month', 'all', 'custom'] as const).map((range) => (
                   <button 
                     key={range}
                     onClick={() => setLocalRange(range)}
                     className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${localRange === range ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                   >
                     {range === '7days' ? 'Semana' : range === 'month' ? 'Mes' : range === 'all' ? 'Todo' : 'Personalizado'}
                   </button>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* Grid de KPIs con Revenue incluido */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard label="Cash Collected" value={`$${metrics.totalCollected.toLocaleString()}`} icon={Wallet} color="text-emerald-600" />
        <KPICard label="Revenue Bruto" value={`$${metrics.totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-indigo-600" />
        <KPICard label="Tasa s/ Ofertas" value={`${metrics.closureRateOnOffers.toFixed(1)}%`} icon={Target} color="text-amber-500" />
        <KPICard label="Comis. Setter" value={`$${metrics.setterCommissions.toLocaleString()}`} icon={UserCheck} color="text-sky-500" />
        <KPICard label="Comis. Closer" value={`$${metrics.closerCommissions.toLocaleString()}`} icon={Zap} color="text-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative group">
          <div className="flex items-center justify-between mb-12">
             <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <Activity className="w-5 h-5 text-indigo-600" /> Flujo de Agendas
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight ml-8">Actividad cronológica en el periodo seleccionado</p>
             </div>
             <div className="bg-indigo-50 px-4 py-2 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse shadow-sm shadow-indigo-300"></div>
                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Total: {metrics.totalAgendas}</span>
             </div>
          </div>
          
          <div className="relative h-72">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="w-full border-b border-slate-100 h-0"></div>
               ))}
            </div>

            <div className="relative h-full flex items-end gap-3 z-10 px-2">
               {metrics.sortedTimeline.length > 0 ? metrics.sortedTimeline.map((item, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group/bar">
                    <div 
                      className="w-full relative transition-all duration-500 ease-out group-hover/bar:scale-x-105"
                      style={{ height: `${(item.count / maxAgendas) * 100}%` }}
                    >
                       <div className="w-full h-full bg-gradient-to-t from-indigo-700 via-indigo-500 to-sky-400 rounded-t-2xl shadow-lg shadow-indigo-100 transition-all duration-300 group-hover/bar:brightness-110"></div>
                       <div className="absolute top-0 left-0 w-full h-1 bg-white/30 rounded-t-full"></div>
                       <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 scale-90 group-hover/bar:scale-100 pointer-events-none z-20">
                          <div className="bg-slate-900 text-white text-[10px] font-black px-3 py-2 rounded-xl whitespace-nowrap shadow-2xl relative">
                            {item.count} Agendas
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                          </div>
                       </div>
                    </div>
                    <div className="mt-4 flex flex-col items-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover/bar:text-indigo-600 transition-colors whitespace-nowrap">
                         {item.date}
                       </span>
                    </div>
                 </div>
               )) : (
                 <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30 gap-4">
                    <Calendar className="w-8 h-8 text-slate-200" />
                    <span className="text-slate-300 font-black text-[10px] uppercase tracking-widest">Sin agendas registradas</span>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center gap-3">
            <PieChart className="w-5 h-5 text-indigo-600" /> Orígenes de Leads
          </h3>
          <div className="space-y-6">
            {metrics.sortedOrigins.map((origin, i) => (
              <div key={i} className="space-y-2">
                 <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{origin.name}</span>
                   <span className="text-xs font-mono font-black text-slate-900">{origin.count}</span>
                 </div>
                 <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                   <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000 ease-out shadow-sm" 
                    style={{ width: `${(origin.count / (metrics.totalAgendas || 1)) * 100}%` }}
                   />
                 </div>
              </div>
            ))}
            {metrics.sortedOrigins.length === 0 && (
              <p className="text-center text-slate-300 text-[10px] font-black uppercase py-10">No hay orígenes registrados</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
         
         <div className="space-y-3 relative z-10">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Liquidación Total del Equipo</h4>
            <div className="flex items-end gap-3">
               <p className="text-5xl font-mono font-black italic tracking-tighter text-white">
                 ${(metrics.setterCommissions + metrics.closerCommissions).toLocaleString()}
               </p>
               <span className="text-xs font-black text-emerald-400 mb-2 uppercase tracking-widest flex items-center gap-1">
                 <TrendingUp className="w-3 h-3" /> Payout
               </span>
            </div>
         </div>

         <div className="flex gap-12 border-l border-slate-800 pl-12 relative z-10">
            <div className="text-center group/comis">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover/comis:text-indigo-400 transition-colors">Setter Profit</p>
               <p className="text-2xl font-mono font-black text-white group-hover/comis:scale-105 transition-transform">${metrics.setterCommissions.toLocaleString()}</p>
            </div>
            <div className="text-center group/comis">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover/comis:text-indigo-400 transition-colors">Closer Profit</p>
               <p className="text-2xl font-mono font-black text-white group-hover/comis:scale-105 transition-transform">${metrics.closerCommissions.toLocaleString()}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

const KPICard = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color?: string }) => {
  return (
    <div className="bg-white border border-slate-200 p-8 rounded-[2rem] group hover:border-indigo-600 transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-50/50">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors`}>
          <Icon className={`w-5 h-5 ${color || 'text-indigo-600'} transition-transform group-hover:scale-110`} />
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-600" />
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-500 transition-colors">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono tracking-tighter">{value}</h3>
    </div>
  );
};

export default ReportsView;
