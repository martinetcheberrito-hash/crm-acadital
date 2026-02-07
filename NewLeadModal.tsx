
import React, { useState } from 'react';
import { X, Save, Globe, MapPin, Calendar, Phone, Briefcase, Users, DollarSign } from 'lucide-react';
import { Lead, LeadStatus, LeadOrigin, Qualification } from '../types';

interface NewLeadModalProps {
  onClose: () => void;
  onSave: (lead: Omit<Lead, 'id' | 'created_at'>) => void;
}

const NewLeadModal: React.FC<NewLeadModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'Argentina',
    website: '',
    decision_maker: 'No necesito a nadie para tomar decisiones.',
    ad_spend: '',
    monthly_revenue: '',
    main_problem: '',
    qualification: Qualification.LEVEL_1,
    value: 0,
    origin: LeadOrigin.TIKTOK,
    notes: '',
    call_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      call_date: new Date(formData.call_date).toISOString(),
      status: LeadStatus.NEW,
      attended: 'Pendiente',
      whatsapp_confirmed: 'Si',
      offer_made: false,
      bought: false
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Nuevo Prospecto</h2>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Acadital Inteligencia de Negocios</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors p-3 hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 shadow-sm">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo *</label>
              <input 
                required
                placeholder="Ej. Lautaro Freres"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:border-indigo-600 outline-none transition-all shadow-inner"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Agenda *</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pl-12 text-sm font-bold text-slate-900 focus:border-indigo-600 outline-none transition-all shadow-inner"
                  value={formData.call_date}
                  onChange={e => setFormData({...formData, call_date: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email *</label>
              <input 
                required
                type="email"
                placeholder="email@negocio.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:border-indigo-600 outline-none shadow-inner"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono / WhatsApp *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  placeholder="+54 9..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pl-12 text-sm font-bold text-slate-900 focus:border-indigo-600 outline-none shadow-inner"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facturación Mensual</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  placeholder="Ej: $5k"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pl-12 text-sm font-bold text-slate-900 focus:border-indigo-600 outline-none shadow-inner"
                  value={formData.monthly_revenue}
                  onChange={e => setFormData({...formData, monthly_revenue: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inversión Ads</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  placeholder="Ej: $1k"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pl-12 text-sm font-bold text-slate-900 focus:border-indigo-600 outline-none shadow-inner"
                  value={formData.ad_spend}
                  onChange={e => setFormData({...formData, ad_spend: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toma Decisiones</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  placeholder="¿Sí o No?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pl-12 text-sm font-bold text-slate-900 focus:border-indigo-600 outline-none shadow-inner"
                  value={formData.decision_maker}
                  onChange={e => setFormData({...formData, decision_maker: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">País *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  placeholder="Ej. Argentina"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pl-12 text-sm font-bold text-slate-900 focus:border-indigo-600 outline-none shadow-inner"
                  value={formData.country}
                  onChange={e => setFormData({...formData, country: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origen Acadital</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:border-indigo-600 outline-none appearance-none shadow-inner"
                value={formData.origin}
                onChange={e => setFormData({...formData, origin: e.target.value as LeadOrigin})}
              >
                {Object.values(LeadOrigin).map(origin => (
                  <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sitio Web / LinkedIn / RRSS</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pl-12 text-sm font-bold text-slate-900 focus:border-indigo-600 outline-none shadow-inner"
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] active:scale-95"
          >
            <Save className="w-5 h-5" /> AGENDAR NUEVO PROSPECTO
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewLeadModal;
