
import React, { useState, useRef } from 'react';
import { X, BrainCircuit, Mail, Phone, Calendar, DollarSign, FileText, Loader2, Zap, Target, Image as ImageIcon, MessageSquare, ChevronDown, Globe, BarChart, AlertCircle, Users, CheckCircle2, XCircle, MapPin, TrendingUp, Clock, UserCheck, ShieldCheck } from 'lucide-react';
import { Lead, LeadOrigin, Qualification, LeadStatus } from '../types';
import { generateLeadStrategy, analyzeChatScreenshot } from '../services/geminiService';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate?: (updatedLead: Lead) => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose, onUpdate }) => {
  const [strategy, setStrategy] = useState<string | null>(null);
  const [chatAnalysis, setChatAnalysis] = useState<string | null>(lead.chat_analysis || null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateField = (field: keyof Lead, value: any) => {
    if (onUpdate) {
      onUpdate({ ...lead, [field]: value });
    }
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
      <p key={i} className={`${line.trim().startsWith('•') ? 'ml-2 mb-1' : line.trim() === '' ? 'h-4' : 'font-bold text-indigo-300 mt-4 mb-2'}`}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-[90vw] lg:max-w-7xl max-h-[95vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Superior Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-white/10 shadow-lg ${qualStyles[lead.qualification || Qualification.LEVEL_1]}`}>
              <span className="text-2xl font-black">{lead.qualification || '?'}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {lead.name}
                <span className="text-xs font-mono text-slate-500 opacity-50">#{lead.id}</span>
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <MapPin className="w-3.5 h-3.5" /> {lead.country || 'Sin país'}
                </div>
                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5" /> {lead.origin}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Revenue Actual</p>
                <p className="text-lg font-mono font-bold text-white">${lead.revenue?.toLocaleString() || '0'}</p>
             </div>
             <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Dynamic Content Grid */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-900 grid grid-cols-1 lg:grid-cols-12 gap-8 custom-scrollbar">
          
          {/* COL 1: Tracking & Qualifications (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 space-y-6">
              <h4 className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock className="w-4 h-4" /> Tracking de Agenda
              </h4>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Cualificación</label>
                    <select 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
                      value={lead.qualification}
                      onChange={(e) => handleUpdateField('qualification', e.target.value)}
                    >
                      <option value={Qualification.LEVEL_1}>Nivel 1 (Top)</option>
                      <option value={Qualification.LEVEL_2}>Nivel 2 (Medio)</option>
                      <option value={Qualification.LEVEL_3}>Nivel 3 (Bajo)</option>
                      <option value={Qualification.NO_CALIF}>No Calif</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Fecha Agenda</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input 
                        type="date"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-indigo-500"
                        value={lead.call_date?.split('T')[0] || ''}
                        onChange={(e) => handleUpdateField('call_date', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Origen LEAD</label>
                    <select 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
                      value={lead.origin}
                      onChange={(e) => handleUpdateField('origin', e.target.value)}
                    >
                      {Object.values(LeadOrigin).map(origin => (
                        <option key={origin} value={origin}>{origin}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Confirmación WhatsApp</label>
                  <select 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:border-indigo-500 outline-none"
                    value={lead.whatsapp_confirmed}
                    onChange={(e) => handleUpdateField('whatsapp_confirmed', e.target.value)}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Si">Si</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Asistencia Llamada</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleUpdateField('attended', 'Si')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${lead.attended === 'Si' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                    >SI</button>
                    <button 
                      onClick={() => handleUpdateField('attended', 'No')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${lead.attended === 'No' ? 'bg-rose-500 border-rose-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                    >NO</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">País</label>
                  <input 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                    placeholder="País"
                    value={lead.country || ''}
                    onChange={(e) => handleUpdateField('country', e.target.value)}
                  />
                </div>

                {lead.attended === 'No' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">¿Por qué no asistió?</label>
                    <input 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white"
                      placeholder="Ej: Canceló, Reagendó..."
                      value={lead.no_attend_reason}
                      onChange={(e) => handleUpdateField('no_attend_reason', e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Seguimiento</label>
                  <select 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:border-indigo-500 outline-none"
                    value={lead.follow_up}
                    onChange={(e) => handleUpdateField('follow_up', e.target.value)}
                  >
                    <option value="N/A">N/A</option>
                    <option value="Si">Si</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-700/30 space-y-4">
              <h4 className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">Cierre & Oferta</h4>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleUpdateField('offer_made', !lead.offer_made)}
                  className={`w-full py-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-2 ${lead.offer_made ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-slate-800/50 border-slate-700 text-slate-600'}`}
                >
                  <Zap className="w-4 h-4" /> OFERTA HECHA: {lead.offer_made ? 'SÍ' : 'NO'}
                </button>
                <button 
                  onClick={() => handleUpdateField('second_call', !lead.second_call)}
                  className={`w-full py-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-2 ${lead.second_call ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-slate-800/50 border-slate-700 text-slate-600'}`}
                >
                  <UserCheck className="w-4 h-4" /> 2DA LLAMADA ASISTIDA: {lead.second_call ? 'SÍ' : 'NO'}
                </button>
              </div>
            </div>
          </div>

          {/* COL 2: Sales & Financials (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-8 shadow-inner">
               <div className="flex items-center justify-between">
                  <h4 className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-emerald-400" /> Liquidación del Lead
                  </h4>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${lead.bought ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    {lead.bought ? 'COMPRÓ' : 'SIN CIERRE'}
                  </span>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase">Monto Recaudado ($ Collected)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                      <input 
                        type="number"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 text-lg font-mono text-white outline-none focus:border-indigo-500"
                        value={lead.collected_amount || 0}
                        onChange={(e) => handleUpdateField('collected_amount', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase">Revenue Total ($)</label>
                    <div className="relative">
                      <BarChart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                      <input 
                        type="number"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 text-lg font-mono text-white outline-none focus:border-indigo-500"
                        value={lead.revenue || 0}
                        onChange={(e) => handleUpdateField('revenue', Number(e.target.value))}
                      />
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                      <UserCheck className="w-3 h-3 text-indigo-400" /> Comis. Setter ($)
                    </label>
                    <input 
                      type="number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-indigo-300 outline-none focus:border-indigo-500"
                      value={lead.setter_commission || 0}
                      onChange={(e) => handleUpdateField('setter_commission', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3 text-indigo-400" /> Comis. Closer ($)
                    </label>
                    <input 
                      type="number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-indigo-300 outline-none focus:border-indigo-500"
                      value={lead.closer_commission || 0}
                      onChange={(e) => handleUpdateField('closer_commission', Number(e.target.value))}
                    />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Metodo de Pago</label>
                    <select 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white outline-none focus:border-indigo-500"
                      value={lead.payment_method}
                      onChange={(e) => handleUpdateField('payment_method', e.target.value)}
                    >
                      <option value="No">Sin venta</option>
                      <option value="Contado">Contado</option>
                      <option value="Cuotas">Cuotas</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Fecha Primer Pago</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input 
                        type="date"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-indigo-500"
                        value={lead.first_payment_date?.split('T')[0] || ''}
                        onChange={(e) => handleUpdateField('first_payment_date', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                      />
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-600 font-bold uppercase">Setter</span>
                    <input 
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 outline-none focus:border-indigo-500" 
                      placeholder="Setter"
                      value={lead.setter || ''}
                      onChange={(e) => handleUpdateField('setter', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-600 font-bold uppercase">Closer</span>
                    <input 
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 outline-none focus:border-indigo-500" 
                      placeholder="Closer"
                      value={lead.closer || ''}
                      onChange={(e) => handleUpdateField('closer', e.target.value)}
                    />
                  </div>
               </div>

               <button 
                  onClick={() => handleUpdateField('bought', !lead.bought)}
                  className={`w-full py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-3 shadow-xl ${lead.bought ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40' : 'bg-slate-800 text-slate-500 hover:text-white'}`}
               >
                  {lead.bought ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {lead.bought ? 'VENTA REGISTRADA EXITOSAMENTE' : 'REGISTRAR CIERRE DE VENTA'}
               </button>
            </div>

            {/* AI Assistant Reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 disabled={loadingAnalysis}
                 className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 p-4 rounded-2xl transition-all flex flex-col items-center gap-2 group"
               >
                 {loadingAnalysis ? <Loader2 className="w-6 h-6 animate-spin text-indigo-500" /> : <ImageIcon className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />}
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analizar Chat</span>
                 <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
               </button>
               <button 
                 onClick={handleGenerateStrategy}
                 disabled={loadingStrategy}
                 className="bg-indigo-900/20 hover:bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-2xl transition-all flex flex-col items-center gap-2 group"
               >
                 {loadingStrategy ? <Loader2 className="w-6 h-6 animate-spin text-indigo-400" /> : <BrainCircuit className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />}
                 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Generar Estrategia</span>
               </button>
            </div>
          </div>

          {/* COL 3: Insights & Intelligence (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-950/40 border border-slate-800 rounded-3xl flex flex-col h-[50%] shadow-inner overflow-hidden">
               <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-900/40">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Findings del Chat</span>
               </div>
               <div className="p-6 overflow-y-auto flex-1 text-[11px] text-slate-300 leading-relaxed italic">
                  {loadingAnalysis ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                      <div className="w-12 h-1 bg-indigo-500/20 rounded overflow-hidden"><div className="w-full h-full bg-indigo-500 animate-progress origin-left"></div></div>
                      <span className="text-[9px] uppercase font-bold text-indigo-400">Escaneando...</span>
                    </div>
                  ) : chatAnalysis ? formatAIDeliverable(chatAnalysis) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 gap-3 text-center">
                       <ImageIcon className="w-10 h-10" />
                       <p>Sin capturas de chat procesadas</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800 rounded-3xl flex flex-col h-[50%] shadow-inner overflow-hidden">
               <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-900/40">
                  <BrainCircuit className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan de Ataque IA</span>
               </div>
               <div className="p-6 overflow-y-auto flex-1 text-[11px] text-slate-200 leading-relaxed">
                  {loadingStrategy ? (
                    <div className="flex items-center justify-center h-full gap-3">
                       <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                       <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                  ) : strategy ? formatAIDeliverable(strategy) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 gap-3 text-center">
                       <Target className="w-10 h-10" />
                       <p>Genera el plan de cierre basado en el chat</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Ficha Intake */}
            <div className="bg-slate-800/10 p-5 rounded-2xl border border-slate-700/20 space-y-4">
               <h4 className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Datos del Formulario</h4>
               <div className="grid grid-cols-1 gap-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Facturación</span>
                    <span className="text-xs text-white">{lead.monthly_revenue || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Problema Principal</span>
                    <span className="text-xs text-rose-400 italic">"{lead.main_problem || 'N/A'}"</span>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
