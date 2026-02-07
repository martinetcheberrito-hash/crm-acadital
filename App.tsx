
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, TrendingUp, BarChart3, Plus, Search, Bell, LayoutDashboard, 
  Settings, ShieldCheck, DollarSign, Loader2, AlertCircle, RefreshCw, Trash2, Target, Calendar
} from 'lucide-react';
import { Lead, LeadStatus, LeadOrigin, DashboardStats, Qualification } from './types';
import { supabase } from './supabase';
import StatsCard from './StatsCard';
import LeadsTable from './LeadsTable';
import LeadDetailModal from './LeadDetailModal';
import NewLeadModal from './NewLeadModal';
import ReportsView from './ReportsView';

type View = 'dashboard' | 'leads' | 'reports' | 'settings';
type DateRange = '7days' | 'month' | 'all';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('month');

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

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return;
    setLeads(prevLeads => prevLeads.filter(l => l.id !== leadId));
    if (selectedLead?.id === leadId) setSelectedLead(null);
    try {
      const { error: delError } = await supabase.from('leads').delete().eq('id', leadId);
      if (delError) throw delError;
    } catch (err) {
      setError('Error al eliminar.');
      fetchLeads();
    }
  };

  // Lógica de filtrado centralizada por Agendas y Pagos
  const stats = useMemo(() => {
    const now = new Date();
    const startOfRange = new Date();
    if (dateRange === '7days') startOfRange.setDate(now.getDate() - 7);
    else if (dateRange === 'month') startOfRange.setDate(1);
    startOfRange.setHours(0, 0, 0, 0);

    // 1. Agendas programadas en el periodo (Base: call_date)
    const agendasInPeriod = leads.filter(l => {
      if (!l.call_date) return false;
      if (dateRange === 'all') return true;
      const callDate = new Date(l.call_date);
      return callDate >= startOfRange && callDate <= now;
    });

    // 2. Ventas cerradas en el periodo (Base: first_payment_date)
    const salesInPeriod = leads.filter(l => {
      if (!l.bought || !l.first_payment_date) return false;
      if (dateRange === 'all') return true;
      const payDate = new Date(l.first_payment_date);
      return payDate >= startOfRange && payDate <= now;
    });

    // 3. Ofertas presentadas sobre las agendas del periodo
    const offersInPeriod = agendasInPeriod.filter(l => l.offer_made);

    const totalCollected = salesInPeriod.reduce((acc, l) => acc + (l.collected_amount || 0), 0);
    const totalRevenue = salesInPeriod.reduce((acc, l) => acc + (l.revenue || 0), 0);
    const closureRateOnOffers = offersInPeriod.length > 0 ? (salesInPeriod.length / offersInPeriod.length) * 100 : 0;

    return {
      totalAgendas: agendasInPeriod.length,
      totalClosures: salesInPeriod.length,
      monthlySales: totalCollected,
      grossRevenue: totalRevenue,
      closureRateOnOffers: closureRateOnOffers,
      conversionRate: (salesInPeriod.length / Math.max(agendasInPeriod.length, 1)) * 100,
    };
  }, [leads, dateRange]);

  const finalFilteredLeads = useMemo(() => {
    const now = new Date();
    const startOfRange = new Date();
    if (dateRange === '7days') startOfRange.setDate(now.getDate() - 7);
    else if (dateRange === 'month') startOfRange.setDate(1);
    startOfRange.setHours(0, 0, 0, 0);

    return leads.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // La tabla principal muestra Agendas si hay rango seleccionado
      if (dateRange === 'all') return matchesSearch;
      
      if (!l.call_date) return false;
      const callDate = new Date(l.call_date);
      const matchesDate = callDate >= startOfRange && callDate <= now;
      return matchesSearch && matchesDate;
    });
  }, [leads, dateRange, searchQuery]);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      <aside className="w-72 border-r border-slate-200 bg-white flex flex-col hidden md:flex sticky top-0 h-screen shadow-sm z-40">
        <div className="p-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-100">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Acadital</span>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Management</span>
          </div>
        </div>
        <nav className="flex-1 px-6 py-8 space-y-2">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <NavItem icon={Users} label="Prospectos" active={activeView === 'leads'} onClick={() => setActiveView('leads')} />
          <NavItem icon={BarChart3} label="BI Inteligencia" active={activeView === 'reports'} onClick={() => setActiveView('reports')} />
          <div className="pt-8 mt-8 border-t border-slate-100">
            <NavItem icon={Settings} label="Ajustes" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-30">
          <div className="relative w-[450px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o email..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-medium" 
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {(['7days', 'month', 'all'] as const).map(range => (
                <button 
                  key={range}
                  onClick={() => setDateRange(range)} 
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dateRange === range ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  {range === '7days' ? '7D' : range === 'month' ? 'MES' : 'TODO'}
                </button>
              ))}
            </div>
            <button onClick={() => setShowNewLeadModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase py-3 px-6 rounded-2xl transition-all shadow-lg active:scale-95">
              <Plus className="w-4 h-4" /> AGENDAR
            </button>
          </div>
        </header>

        <main className="flex-1 p-10 max-w-[1500px] mx-auto w-full overflow-y-auto">
          {activeView === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Vista Directiva</h1>
                <p className="text-slate-500 font-medium">Análisis basado en fecha de cita (Agenda) y fecha de pago.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Agendas" value={stats.totalAgendas} icon={Calendar} trend="Citas" trendUp={true} />
                <StatsCard title="Cierres Totales" value={stats.totalClosures} icon={Target} trend="Pagos" trendUp={true} />
                <StatsCard title="Cash Collected" value={`$${stats.monthlySales.toLocaleString()}`} icon={DollarSign} trend="Caja" trendUp={true} />
                <StatsCard title="Tasa Cierre/Oferta" value={`${stats.closureRateOnOffers.toFixed(1)}%`} icon={BarChart3} trend="Eficiencia" trendUp={true} />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Prospectos con Cita en Periodo</h2>
                <LeadsTable leads={finalFilteredLeads.slice(0, 15)} onSelectLead={setSelectedLead} onDeleteLead={handleDeleteLead} />
              </div>
            </div>
          )}

          {activeView === 'leads' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Trackboard Maestro</h1>
                  <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Total: {finalFilteredLeads.length} registros en vista</p>
               </div>
               <LeadsTable leads={finalFilteredLeads} onSelectLead={setSelectedLead} onDeleteLead={handleDeleteLead} />
            </div>
          )}

          {activeView === 'reports' && <ReportsView leads={leads} currentPeriod={dateRange} />}
        </main>
      </div>

      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={handleUpdateLead} onDelete={handleDeleteLead} />}
      {showNewLeadModal && <NewLeadModal onClose={() => setShowNewLeadModal(false)} onSave={handleAddLead} />}
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>
    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
    {label}
  </button>
);

export default App;
