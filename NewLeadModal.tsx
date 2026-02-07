
import React, { useState } from 'react';
import { X, Save, ChevronDown, Globe, MapPin, Calendar } from 'lucide-react';
import { Lead, LeadStatus, LeadOrigin, Qualification } from './types';

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
      whatsapp_confirmed: 'Pendiente',
      offer_made: false,
      bought: false
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/20">
          <h2 className="text-xl font-bold text-white">Introducir información</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre y Apellido *</label>
              <input 
                required
                placeholder="Nombre completo"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha de Agenda *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  required
                  type="date"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 pl-10 text-sm text-white focus:border-indigo-500 outline-none"
                  value={formData.call_date}
                  onChange={e => setFormData({...formData, call_date: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email *</label>
              <input 
                required
                type="email"
                placeholder="email@ejemplo.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">País *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  required
                  placeholder="País de residencia"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 pl-10 text-sm text-white focus:border-indigo-500 outline-none"
                  value={formData.country}
                  onChange={e => setFormData({...formData, country: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teléfono *</label>
              <input 
                required
                placeholder="+54 9..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cualificación Inicial</label>
              <div className="relative">
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-indigo-500 outline-none appearance-none"
                  value={formData.qualification}
                  onChange={e => setFormData({...formData, qualification: e.target.value as Qualification})}
                >
                  <option value={Qualification.LEVEL_1}>Nivel 1 (Top)</option>
                  <option value={Qualification.LEVEL_2}>Nivel 2 (Medio)</option>
                  <option value={Qualification.LEVEL_3}>Nivel 3 (Bajo)</option>
                  <option value={Qualification.NO_CALIF}>No Calif</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Página Web / Redes</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                placeholder="URL de negocio"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 pl-10 text-sm text-white focus:border-indigo-500 outline-none"
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Origen LEAD</label>
              <div className="relative">
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-indigo-500 outline-none appearance-none"
                  value={formData.origin}
                  onChange={e => setFormData({...formData, origin: e.target.value as LeadOrigin})}
                >
                  {Object.values(LeadOrigin).map(origin => (
                    <option key={origin} value={origin}>{origin}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notas Iniciales</label>
            <textarea 
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-indigo-500 outline-none resize-none"
              placeholder="Contexto relevante del lead..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Agendar y Registrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewLeadModal;
