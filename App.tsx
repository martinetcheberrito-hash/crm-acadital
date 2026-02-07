
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, TrendingUp, BarChart3, Plus, Search, Bell, LayoutDashboard, UserCircle, Briefcase, 
  Settings, ShieldCheck, Filter, ArrowRight, Target, Zap, DollarSign, Calendar as CalendarIcon, 
  ArrowRightLeft, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import { Lead, LeadStatus, LeadOrigin, DashboardStats, Qualification } from './types';
import { supabase } from './supabase';
import StatsCard from './StatsCard';
import LeadsTable from './LeadsTable';
import LeadDetailModal from './LeadDetailModal';
import NewLeadModal from './NewLeadModal';
import ReportsView from './ReportsView';

type View = 'dashboard' | 'leads' | 'deals' | 'reports' | 'settings';
type DateRange = '7days' | 'month' | 'all' | 'custom';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStartDate, setCustomStartDate] = useState<string>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // FETCH LEADS FROM SUPABASE
  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbError) throw sbError;
      setLeads(data || []);
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      setError('Error de conexión con Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAddLead = async (newLeadData: Omit<Lead, 'id' | 'created_at'>) => {
    const tempId = `L-${Math.random().toString(36).substr(2, 9)}`;
    const newLead: Lead = {
      ...newLeadData,
      id: tempId,
      created_at: new Date().toISOString()
    };

    setLeads([newLead, ...leads]);
    setShowNewLeadModal(false);

    try {
      const { error: insError } = await supabase.from('leads').insert([newLead]);
      if (insError) throw insError;
    } catch (err) {
      console.error('Error saving lead:', err);
      setError('Error al guardar en la base de datos.');
    }
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
    setSelectedLead(updatedLead);

    try {
      const { error: updError } = await supabase
        .from('leads')
        .update(updatedLead)
        .eq('id', updatedLead.id);
      
      if (updError) throw updError;
    } catch (err) {
      console.error('Error updating lead:', err);
      setError('Error al actualizar en la base de datos.');
    }
  };

  const filteredLeadsByDate = useMemo(() => {
    const now = new Date();
    return leads.filter(lead => {
      const leadDate = new Date(lead.created_at);
      
      if (dateRange === '7days') {
        const diff = now.getTime() - leadDate.getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000;
      } else if (dateRange === 'month') {
        return leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear();
      } else if (dateRange === 'custom') {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return leadDate >= start && leadDate <= end;
      }
      return true;
    });
  }, [leads, dateRange, customStartDate, customEndDate]);

  const stats: DashboardStats = useMemo(() => {
    const totalCollected = filteredLeadsByDate.reduce((acc, l) => acc + (l.collected_amount || 0), 0);
    const totalCommissions = filteredLeadsByDate.reduce((acc, l) => acc + (l.setter_commission || 0) + (l.closer_commission || 0), 0);
    return {
      totalLeads: filteredLeadsByDate.length,
      monthlySales: totalCollected,
      totalCommissions: totalCommissions,
      conversionRate: (filteredLeadsByDate.filter(l => l.bought).length / Math.max(filteredLeadsByDate.length, 1)) * 100,
      growth: 22.4
    };
  }, [filteredLeadsByDate]);

  const totalRevenue = filteredLeadsByDate.reduce((acc, l) => acc + (l.revenue || 0), 0);

  const finalFilteredLeads = filteredLeadsByDate.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (l.country && l.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderContent = () => {
    if (loading && leads.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Sincronizando con Supabase...</p>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">Dashboard Directivo</h1>
                <p className="text-slate-500 font-medium">Control financiero y operativo en tiempo real.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                <div className="flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-xl">
                  <button onClick={() => setDateRange('7days')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dateRange === '7days' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-500 hover:text-slate-300'}`}>7 Días</button>
                  <button onClick={() => setDateRange('month')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dateRange === 'month' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-500 hover:text-slate-300'}`}>Este Mes</button>
                  <button onClick={() => setDateRange('all')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dateRange === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-500 hover:text-slate-300'}`}>Todo</button>
                </div>
                <button onClick={fetchLeads} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard title="Total Leads" value={stats.totalLeads} icon={Users} trend="Periodo" trendUp={true} />
              <StatsCard title="Cash Collected" value={`$${stats.monthlySales.toLocaleString()}`} icon={DollarSign} trend="Neto" trendUp={true} />
              <StatsCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={TrendingUp} trend="Bruto" trendUp={true} />
              <StatsCard title="Tasa de Cierre" value={`${stats.conversionRate.toFixed(1)}%`} icon={BarChart3} trend="Ratio" trendUp={true} />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Últimos Agendados</h2>
              <LeadsTable leads={finalFilteredLeads.slice(0, 10)} onSelectLead={setSelectedLead} />
            </div>
          </div>
        );

      case 'leads':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Trackboard de Ventas</h1>
                <p className="text-slate-500 font-medium">Gestiona y cualifica a tus prospectos.</p>
              </div>
              <button onClick={() => setShowNewLeadModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-6 rounded-2xl text-xs font-black uppercase shadow-xl transition-all active:scale-95">
                <Plus className="w-4 h-4" /> Nuevo Lead
              </button>
            </div>
            <LeadsTable leads={finalFilteredLeads} onSelectLead={setSelectedLead} />
          </div>
        );

      case 'deals':
        return (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Pipeline de Ofertas</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
              {['Prospectos', 'Ofertas Pendientes', 'Cerrado (Vendido)'].map((stage, i) => (
                <div key={stage} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 min-w-[340px] flex flex-col min-h-[600px] shadow-2xl">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center justify-between px-2">
                    {stage}
                    <span className="bg-indigo-600/20 text-indigo-400 text-[10px] px-3 py-1 rounded-full border border-indigo-500/20">
                      {filteredLeadsByDate.filter(l => (i === 0 && !l.offer_made && !l.bought) || (i === 1 && l.offer_made && !l.bought) || (i === 2 && l.bought)).length}
                    </span>
                  </h3>
                  <div className="space-y-4 flex-1">
                    {filteredLeadsByDate
                      .filter(l => (i === 0 && !l.offer_made && !l.bought) || (i === 1 && l.offer_made && !l.bought) || (i === 2 && l.bought))
                      .map(lead => (
                        <div key={lead.id} onClick={() => setSelectedLead(lead)} className="bg-slate-800/80 border border-slate-700/50 p-5 rounded-2xl shadow-lg hover:border-indigo-500/50 transition-all cursor-pointer group hover:translate-y-[-2px]">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-white font-bold group-hover:text-indigo-300 transition-colors text-sm">{lead.name}</span>
                            <span className="text-xs text-indigo-400 font-mono font-black tracking-tighter">${lead.revenue?.toLocaleString() || '0'}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 italic line-clamp-2 leading-relaxed opacity-70">"{lead.notes || 'Sin notas'}"</p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reports':
        return <ReportsView leads={filteredLeadsByDate} />;

      default:
        return <div className="flex items-center justify-center h-[60vh] text-slate-600 uppercase font-black italic">En construcción...</div>;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-200">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-800 bg-slate-950 flex flex-col hidden md:flex sticky top-0 h-screen shadow-2xl z-40">
        <div className="p-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-indigo-500/10">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">Acadital</span>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Management</span>
          </div>
        </div>
        <nav className="flex-1 px-6 py-8 space-y-2">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <NavItem icon={Users} label="Trackboard" active={activeView === 'leads'} onClick={() => setActiveView('leads')} />
          <NavItem icon={Briefcase} label="Pipeline" active={activeView === 'deals'} onClick={() => setActiveView('deals')} />
          <NavItem icon={BarChart3} label="Reportes" active={activeView === 'reports'} onClick={() => setActiveView('reports')} />
          <div className="pt-8 mt-8 border-t border-slate-900/50">
            <NavItem icon={Settings} label="Ajustes" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-20 border-b border-slate-800 bg-slate-950/40 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-30">
          <div className="relative w-[450px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, email o país..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" 
            />
          </div>
          <div className="flex items-center gap-6">
            {error && (
              <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            <button className="p-2 text-slate-600 hover:text-indigo-400 transition-all relative group">
              <Bell className="w-5 h-5 group-hover:scale-110" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-4 ring-slate-950 animate-pulse"></span>
            </button>
            <div className="h-10 w-px bg-slate-800/50"></div>
            <button onClick={() => setShowNewLeadModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase py-3 px-7 rounded-2xl transition-all shadow-xl active:scale-95">
              <Plus className="w-4 h-4" /> AGENDAR LEAD
            </button>
          </div>
        </header>

        <main className="flex-1 p-10 max-w-[1500px] mx-auto w-full overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={handleUpdateLead} />}
      {showNewLeadModal && <NewLeadModal onClose={() => setShowNewLeadModal(false)} onSave={handleAddLead} />}
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-200 hover:bg-slate-900/50'}`}>
    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-700'}`} />
    {label}
  </button>
);

export default App;
