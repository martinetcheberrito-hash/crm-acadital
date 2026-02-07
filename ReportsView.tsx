
import React, { useMemo, useState } from 'react';
import { Lead, LeadOrigin, Qualification } from './types';
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  Users, 
  Zap, 
  PieChart,
  Activity,
  Wallet,
  Clock,
  ShieldCheck,
  UserCheck,
  Filter,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

interface ReportsViewProps {
  leads: Lead[];
}

type LocalRange = '7days' | 'month' | 'all';

const ReportsView: React.FC<ReportsViewProps> = ({ leads: allLeads }) => {
  const [localRange, setLocalRange] = useState<LocalRange>('all');

  // Filtrado local para los reportes
  const filteredLeads = useMemo(() => {
    const now = new Date();
    return allLeads.filter(lead => {
      const leadDate = new Date(lead.created_at);
      if (localRange === '7days') return (now.getTime() - leadDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      if (localRange === 'month') return leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear();
      return true;
    });
  }, [allLeads, localRange]);

  const metrics = useMemo(() => {
    const totalRevenue = filteredLeads.reduce((acc, l) => acc + (l.revenue || 0), 0);
    const totalCollected = filteredLeads.reduce((acc, l) => acc + (l.collected_amount || 0), 0);
    const totalSetterCommissions = filteredLeads.reduce((acc, l) => acc + (l.setter_commission || 0), 0);
    const totalCloserCommissions = filteredLeads.reduce((acc, l) => acc + (l.closer_commission || 0), 0);
    const totalCommissions = totalSetterCommissions + totalCloserCommissions;
    
    const payingLeads = filteredLeads.filter(l => l.bought).length;
    const avgTicket = payingLeads > 0 ? totalRevenue / payingLeads : 0;
    const collectionEfficiency = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;

    // Funnel Stats
    const totalLeadsCount = filteredLeads.length;
    const attendedCount = filteredLeads.filter(l => l.attended === 'Si').length;
    const offersCount = filteredLeads.filter(l => l.offer_made).length;
    const salesCount = payingLeads;

    // Personnel breakdown (Setters)
    const setterStats = filteredLeads.reduce((acc: any, lead) => {
      const name = lead.setter || 'Sin Asignar';
      if (!acc[name]) acc[name] = { name, count: 0, sales: 0, commissions: 0 };
      acc[name].count++;
      if (lead.bought) acc[name].sales++;
      acc[name].commissions += (lead.setter_commission || 0);
      return acc;
    }, {});

    // Personnel breakdown (Closers)
    const closerStats = filteredLeads.reduce((acc: any, lead) => {
      const name = lead.closer || 'Sin Asignar';
      if (!acc[name]) acc[name] = { name, count: 0, sales: 0, commissions: 0 };
      acc[name].count++;
      if (lead.bought) acc[name].sales++;
      acc[name].commissions += (lead.closer_commission || 0);
      return acc;
    }, {});

    // Qual analysis (Mix de Leads)
    const quals = Object.values(Qualification).map(q => {
      const count = filteredLeads.filter(l => l.qualification === q).length;
      const percentage = totalLeadsCount > 0 ? (count / totalLeadsCount) * 100 : 0;
      return { level: q, count, percentage };
    }).sort((a, b) => a.level === 'NoCalif' ? 1 : b.level === 'NoCalif' ? -1 : a.level.localeCompare(b.level));

    return {
      totalRevenue,
      totalCollected,
      totalCommissions,
      totalSetterCommissions,
      totalCloserCommissions,
      avgTicket,
      collectionEfficiency,
      quals,
      setterStats: Object.values(setterStats).sort((a: any, b: any) => b.commissions - a.commissions),
      closerStats: Object.values(closerStats).sort((a: any, b: any) => b.commissions - a.commissions),
      totalLeadsCount,
      attendedCount,
      offersCount,
      salesCount
    };
  }, [filteredLeads]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header with Local Period Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Acadital Intelligence</h1>
          <p className="text-slate-500 font-medium italic">Visión estratégica y métricas de crecimiento empresarial.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 p-2 rounded-2xl shadow-xl">
           <Filter className="w-4 h-4 text-slate-600 ml-2" />
           <div className="flex bg-slate-950 p-1 rounded-xl">
             {(['7days', 'month', 'all'] as LocalRange[]).map((range) => (
                <button 
                  key={range}
                  onClick={() => setLocalRange(range)}
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${localRange === range ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  {range === '7days' ? '7 Días' : range === 'month' ? 'Este Mes' : 'Histórico'}
                </button>
             ))}
           </div>
        </div>
      </div>

      {/* Main Business Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          label="Caja Neta (Collected)" 
          value={`$${metrics.totalCollected.toLocaleString()}`} 
          subValue={`${metrics.collectionEfficiency.toFixed(1)}% Eficiencia Cobro`} 
          icon={Wallet} 
          color="emerald" 
        />
        <KPICard 
          label="Ticket Promedio" 
          value={`$${metrics.avgTicket.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          subValue="Monto medio por cierre" 
          icon={Zap} 
          color="indigo" 
        />
        <KPICard 
          label="Costo Comisiones" 
          value={`$${metrics.totalCommissions.toLocaleString()}`} 
          subValue={`Margen post-incentivos: $${(metrics.totalCollected - metrics.totalCommissions).toLocaleString()}`} 
          icon={UserCheck} 
          color="blue" 
        />
        <KPICard 
          label="Revenue en Pipeline" 
          value={`$${(metrics.totalRevenue - metrics.totalCollected).toLocaleString()}`} 
          subValue="Pendiente de recaudación" 
          icon={TrendingUp} 
          color="amber" 
        />
      </div>

      {/* Conversion Funnel & Mix de Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Sales Funnel */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity className="w-32 h-32 text-indigo-500" />
          </div>
          <div className="flex items-center justify-between mb-10">
             <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
               <Target className="w-5 h-5 text-indigo-500" /> Embudo de Conversión
             </h3>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ratio Cierre: {((metrics.salesCount / Math.max(metrics.totalLeadsCount, 1)) * 100).toFixed(1)}%</span>
          </div>

          <div className="space-y-6">
             <FunnelStep label="Prospectos Totales" count={metrics.totalLeadsCount} total={metrics.totalLeadsCount} color="bg-slate-800" />
             <FunnelStep label="Llamadas Asistidas" count={metrics.attendedCount} total={metrics.totalLeadsCount} color="bg-indigo-900/40" />
             <FunnelStep label="Ofertas Realizadas" count={metrics.offersCount} total={metrics.totalLeadsCount} color="bg-indigo-700/60" />
             <FunnelStep label="Ventas Cerradas" count={metrics.salesCount} total={metrics.totalLeadsCount} color="bg-emerald-600" />
          </div>
        </div>

        {/* Mix de Leads (BI Analysis) */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <PieChart className="w-5 h-5 text-indigo-500" /> Mix de Cualificación
          </h3>
          <div className="space-y-8">
            {metrics.quals.map(qual => (
              <div key={qual.level} className="space-y-2">
                 <div className="flex justify-between items-end">
                   <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${
                        qual.level === '1' ? 'bg-emerald-500 text-white' :
                        qual.level === '2' ? 'bg-amber-400 text-slate-900' :
                        qual.level === '3' ? 'bg-orange-500 text-white' :
                        'bg-rose-600 text-white'
                     }`}>
                       {qual.level === 'NoCalif' ? 'NC' : qual.level}
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leads Nivel {qual.level === 'NoCalif' ? 'Descartado' : qual.level}</span>
                   </div>
                   <span className="text-xs font-mono font-black text-white">{qual.count} <span className="text-slate-600 ml-1">({qual.percentage.toFixed(0)}%)</span></span>
                 </div>
                 <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                   <div 
                    className={`h-full transition-all duration-1000 ${
                      qual.level === '1' ? 'bg-emerald-500' : 
                      qual.level === '2' ? 'bg-amber-400' : 
                      qual.level === '3' ? 'bg-orange-500' : 
                      'bg-rose-600'
                    }`} 
                    style={{ width: `${qual.percentage}%` }}
                   />
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 space-y-6 shadow-xl">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-indigo-400" /> Rendimiento de Setters
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {metrics.setterStats.map((person: any) => (
              <div key={person.name} className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-xs font-black text-indigo-400">
                     {person.name.substring(0, 2).toUpperCase()}
                   </div>
                   <div>
                     <p className="text-sm font-black text-white uppercase">{person.name}</p>
                     <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Cierres: {person.sales} / Efic: {((person.sales / Math.max(person.count, 1)) * 100).toFixed(0)}%</p>
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-black text-indigo-400">${person.commissions.toLocaleString()}</p>
                  <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest">Comis. Acumulada</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 space-y-6 shadow-xl">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400" /> Rendimiento de Closers
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {metrics.closerStats.map((person: any) => (
              <div key={person.name} className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xs font-black text-slate-400">
                     {person.name.substring(0, 2).toUpperCase()}
                   </div>
                   <div>
                     <p className="text-sm font-black text-white uppercase">{person.name}</p>
                     <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Cierres: {person.sales} / Efic: {((person.sales / Math.max(person.count, 1)) * 100).toFixed(0)}%</p>
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-black text-indigo-400">${person.commissions.toLocaleString()}</p>
                  <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest">Comis. Acumulada</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center p-8 bg-indigo-600/5 border border-indigo-500/10 rounded-[2rem] gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Motor BI Activo</p>
            <p className="text-xs text-slate-500 font-medium max-w-md">
              Datos auditados para el periodo <span className="text-white font-bold">{localRange === 'all' ? 'Histórico' : localRange === 'month' ? 'Mensual' : 'Semanal'}</span>. Todos los valores financieros son en USD.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase py-4 px-8 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
          Exportar Data BI (.CSV) <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const FunnelStep = ({ label, count, total, color }: { label: string, count: number, total: number, color: string }) => {
  const width = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="relative h-14 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
      <div 
        className={`absolute inset-y-0 left-0 ${color} transition-all duration-1000 flex items-center px-6`} 
        style={{ width: `${width}%` }}
      >
        <span className="text-xs font-black text-white uppercase whitespace-nowrap drop-shadow-md">{label}</span>
      </div>
      <div className="absolute inset-y-0 right-6 flex items-center">
        <span className="text-lg font-mono font-black text-white">{count}</span>
      </div>
    </div>
  );
};

const KPICard = ({ label, value, subValue, icon: Icon, color }: { label: string, value: string | number, subValue?: string, icon: any, color: string }) => {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] group hover:border-indigo-500/40 transition-all shadow-xl relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/5 blur-3xl rounded-full"></div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-4 rounded-2xl transition-all ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
          <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">{label}</p>
      <h3 className="text-3xl font-black text-white mt-2 font-mono tracking-tighter relative z-10">{value}</h3>
      <p className="text-[9px] font-bold text-slate-600 uppercase mt-2 relative z-10">{subValue}</p>
    </div>
  );
};

export default ReportsView;
