
import React, { useState, useRef } from 'react';
import { X, BrainCircuit, Calendar, DollarSign, Loader2, Zap, Target, Image as ImageIcon, MessageSquare, Globe, BarChart, Users, CheckCircle2, XCircle, MapPin, TrendingUp, Clock, UserCheck, ShieldCheck, Trash2, Phone, Briefcase, Eye } from 'lucide-react';
import { Lead, LeadOrigin, Qualification, LeadStatus } from '../types';
import { generateLeadStrategy, analyzeChatScreenshot } from '../services/geminiService';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate?: (updatedLead: Lead) => void;
  onDelete?: (id: string) => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose, onUpdate, onDelete }) => {
  const [strategy, setStrategy] = useState<string | null>(null);
  const [chatAnalysis, setChatAnalysis] = useState<string | null>(lead.chat_analysis || null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateField = (field: keyof Lead, value: any) => {
    if (onUpdate) onUpdate({ ...lead, [field]: value });
  };

  const handleGenerateStrategy = async () => {
    setLoadingStrategy(true);
    try {
      const result = await generateLeadStrategy(lead);
      setStrategy(result);
    } catch (err) { console.error(err); } finally { setLoadingStrategy(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingAnalysis(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const result = await analyzeChatScreenshot(base64String, lead);
        setChatAnalysis(result);
        if (onUpdate) onUpdate({ ...lead, chat_analysis: result });
      } catch (err) { console.error(err); } finally { setLoadingAnalysis(false); }
    };
    reader.readAsDataURL(file);
  };

  const formatAIDeliverable = (text: string) => {
    return text.split('\n').map((line, i) => (
      <p key={i} className={`${line.trim().startsWith('•') ? 'ml-2 mb-1' : line.trim() === '' ? 'h-4' : 'font-bold text-indigo-600 mt-4 mb-2'}`}>
        {line}
      </p>
    ));
  };

  const qualStyles = {
    [Qualification.LEVEL_1]: 'bg-emerald-500 text-white',
    [Qualification.LEVEL_2]: 'bg-amber-400 text-slate-900',
    [Qualification.LEVEL_3]: 'bg-orange-500 text-white',
    [Qualification.NO_CALIF]: 'bg-rose-600 text-white',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white border border-slate-200 w-full max-w-[90vw] lg:max-w-7xl max-h-[95vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Superior Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-lg ${qualStyles[lead.qualification || Qualification.LEVEL_1]}`}>
              <span className="text-2xl font-black">{lead.qualification || '?'}</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 leading-none">
                {lead.name}
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <MapPin className="w-3.5 h-3.5" /> {lead.country || 'S/D'}
                </div>
                <div className="flex items-center gap-1.5 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                  <Target className="w-3.5 h-3.5" /> {lead.origin}
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
                  <Phone className="w-3.5 h-3.5" /> {lead.phone || 'N/A'}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 text-right">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">REVENUE PROYECTADO</p>
                <p className="text-xl font-mono font-black text-slate-900">${lead.revenue?.toLocaleString() || '0'}</p>
             </div>
             {onDelete && (
                <button 
                  onClick={() => { onDelete(lead.id); onClose(); }}
                  className="p-4 hover:bg-rose-50 text-rose-600 rounded-2xl transition-all border border-transparent hover:border-rose-100 shadow-sm"
                  title="Borrar Lead"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
             )}
             <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm">
                <X className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Dynamic Content Grid */}
        <div className="flex-1 overflow-y-auto p-10 bg-white grid grid-cols-1 lg:grid-cols-12 gap-10 custom-scrollbar">
          
          {/* COL 1: Control & Perfil */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
              <h4 className="text-slate-900 text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                <Clock className="w-4 h-4 text-indigo-600" /> Control Operativo
              </h4>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Cualificación</label>
                  <select 
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600"
                    value={lead.qualification}
                    onChange={(e) => handleUpdateField('qualification', e.target.value)}
                  >
                    <option value={Qualification.LEVEL_1}>Nivel 1 (Top)</option>
                    <option value={Qualification.LEVEL_2}>Nivel 2 (Medio)</option>
                    <option value={Qualification.LEVEL_3}>Nivel 3 (Bajo)</option>
                    <option value={Qualification.NO_CALIF}>No Calif</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Origen del Lead</label>
                  <select 
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600"
                    value={lead.origin}
                    onChange={(e) => handleUpdateField('origin', e.target.value)}
                  >
                    {Object.values(LeadOrigin).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Fecha Agenda</label>
                  <input 
                    type="date"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600"
                    value={lead.call_date?.split('T')[0] || ''}
                    onChange={(e) => handleUpdateField('call_date', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Asistencia Llamada</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleUpdateField('attended', 'Si')}
                      className={`py-2.5 rounded-xl text-[10px] font-black border transition-all ${lead.attended === 'Si' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                    >SÍ ASISTIÓ</button>
                    <button 
                      onClick={() => handleUpdateField('attended', 'No')}
                      className={`py-2.5 rounded-xl text-[10px] font-black border transition-all ${lead.attended === 'No' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                    >NO ASISTIÓ</button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Oferta Enviada</label>
                  <button 
                    onClick={() => handleUpdateField('offer_made', !lead.offer_made)}
                    className={`w-10 h-6 rounded-full transition-all relative ${lead.offer_made ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${lead.offer_made ? 'left-5' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/40 p-8 rounded-[2rem] border border-indigo-100 space-y-5">
              <h4 className="text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                <Briefcase className="w-5 h-5" /> Información de Negocio
              </h4>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-black uppercase">Facturación Mensual</p>
                    <input 
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-900 outline-none"
                      value={lead.monthly_revenue || ''}
                      onChange={e => handleUpdateField('monthly_revenue', e.target.value)}
                      placeholder="Ej: $5k/mo"
                    />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-black uppercase">Inversión Publicidad</p>
                    <input 
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-900 outline-none"
                      value={lead.ad_spend || ''}
                      onChange={e => handleUpdateField('ad_spend', e.target.value)}
                      placeholder="Ej: $1k/mo"
                    />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-black uppercase">Toma de Decisiones</p>
                    <textarea 
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-900 outline-none resize-none"
                      value={lead.decision_maker || ''}
                      onChange={e => handleUpdateField('decision_maker', e.target.value)}
                      rows={2}
                    />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-black uppercase">Teléfono / WhatsApp</p>
                    <input 
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-indigo-600 outline-none"
                      value={lead.phone || ''}
                      onChange={e => handleUpdateField('phone', e.target.value)}
                    />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-black uppercase">Sitio Web / RRSS</p>
                    <input 
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-900 outline-none"
                      value={lead.website || ''}
                      onChange={e => handleUpdateField('website', e.target.value)}
                    />
                 </div>
              </div>
            </div>
          </div>

          {/* COL 2: Liquidación & Ventas */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
               <div className="flex items-center justify-between">
                  <h4 className="text-slate-900 text-sm font-black uppercase tracking-widest flex items-center gap-4">
                    <TrendingUp className="w-6 h-6 text-emerald-500" /> Gestión de Liquidación
                  </h4>
                  <button 
                    onClick={() => handleUpdateField('bought', !lead.bought)}
                    className={`px-8 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-all ${lead.bought ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-600'}`}
                  >
                    {lead.bought ? 'VENTA REGISTRADA' : 'CERRAR VENTA'}
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Pago Recibido ($ Collected)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                      <input 
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 text-2xl font-mono font-black text-slate-900 outline-none focus:border-indigo-600 shadow-sm"
                        value={lead.collected_amount || 0}
                        onChange={(e) => handleUpdateField('collected_amount', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Revenue Bruto ($ Total)</label>
                    <div className="relative">
                      <BarChart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                      <input 
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 text-2xl font-mono font-black text-slate-900 outline-none focus:border-indigo-600 shadow-sm"
                        value={lead.revenue || 0}
                        onChange={(e) => handleUpdateField('revenue', Number(e.target.value))}
                      />
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8 pt-4">
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Método de Pago</label>
                    <select 
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600"
                      value={lead.payment_method}
                      onChange={(e) => handleUpdateField('payment_method', e.target.value)}
                    >
                      <option value="No">No vendió</option>
                      <option value="Contado">Contado</option>
                      <option value="Cuotas">Cuotas</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-indigo-600 font-black uppercase tracking-widest underline">Fecha Efectiva del Pago *</label>
                    <input 
                      type="date"
                      className="w-full bg-white border border-indigo-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 shadow-indigo-50 shadow-inner"
                      value={lead.first_payment_date?.split('T')[0] || ''}
                      onChange={(e) => handleUpdateField('first_payment_date', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                    />
                    <p className="text-[8px] text-slate-400 italic">Mueve las métricas de BI a esta fecha.</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Comis. Setter ($)</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono font-bold text-indigo-600 outline-none focus:border-indigo-600"
                      value={lead.setter_commission || 0}
                      onChange={(e) => handleUpdateField('setter_commission', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Comis. Closer ($)</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono font-bold text-indigo-600 outline-none focus:border-indigo-600"
                      value={lead.closer_commission || 0}
                      onChange={(e) => handleUpdateField('closer_commission', Number(e.target.value))}
                    />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">SETTER</span>
                    <input 
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none" 
                      placeholder="Nombre Setter"
                      value={lead.setter || ''}
                      onChange={(e) => handleUpdateField('setter', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">CLOSER</span>
                    <input 
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none" 
                      placeholder="Nombre Closer"
                      value={lead.closer || ''}
                      onChange={(e) => handleUpdateField('closer', e.target.value)}
                    />
                  </div>
               </div>
            </div>

            {/* AI Assistant */}
            <div className="grid grid-cols-2 gap-4">
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 disabled={loadingAnalysis}
                 className="bg-white border border-slate-200 p-8 rounded-[2rem] transition-all flex flex-col items-center gap-3 group hover:border-indigo-600 hover:bg-indigo-50/30"
               >
                 {loadingAnalysis ? <Loader2 className="w-8 h-8 animate-spin text-indigo-600" /> : <ImageIcon className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform" />}
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600">Analizar Captura</span>
                 <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
               </button>
               <button 
                 onClick={handleGenerateStrategy}
                 disabled={loadingStrategy}
                 className="bg-indigo-600 p-8 rounded-[2rem] transition-all flex flex-col items-center gap-3 group hover:bg-indigo-700 shadow-lg shadow-indigo-100"
               >
                 {loadingStrategy ? <Loader2 className="w-8 h-8 animate-spin text-white" /> : <BrainCircuit className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />}
                 <span className="text-[10px] font-black uppercase tracking-widest text-white">Estrategia Acadital</span>
               </button>
            </div>
          </div>

          {/* COL 3: Insights IA */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col h-[45%] shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-white">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Findings IA (Chat)</span>
               </div>
               <div className="p-8 overflow-y-auto flex-1 text-[12px] text-slate-600 leading-relaxed italic custom-scrollbar">
                  {loadingAnalysis ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                      <div className="w-16 h-1 bg-indigo-100 rounded overflow-hidden"><div className="w-full h-full bg-indigo-600 animate-progress origin-left"></div></div>
                      <span className="text-[10px] uppercase font-black text-indigo-600 tracking-widest">Analizando...</span>
                    </div>
                  ) : chatAnalysis ? formatAIDeliverable(chatAnalysis) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 gap-4 text-center">
                       <ImageIcon className="w-12 h-12" />
                       <p className="font-bold uppercase tracking-widest">Sube un chat para ver findings</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col h-[45%] shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-white">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Plan de Acción Acadital</span>
               </div>
               <div className="p-8 overflow-y-auto flex-1 text-[12px] text-slate-700 leading-relaxed custom-scrollbar">
                  {loadingStrategy ? (
                    <div className="flex items-center justify-center h-full gap-3">
                       <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce"></div>
                       <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                       <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                  ) : strategy ? formatAIDeliverable(strategy) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 gap-4 text-center">
                       <Target className="w-12 h-12" />
                       <p className="font-bold uppercase tracking-widest">Generar estrategia de cierre</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[2.5rem] space-y-4 shadow-xl">
               <h4 className="text-white text-[10px] font-black uppercase tracking-widest">Notas Internas</h4>
               <textarea 
                 className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-xs text-slate-200 outline-none focus:border-indigo-500 resize-none font-medium"
                 rows={5}
                 value={lead.notes || ''}
                 onChange={(e) => handleUpdateField('notes', e.target.value)}
                 placeholder="Ej: Tiene objeciones por el precio, volver a llamar el lunes."
               />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
