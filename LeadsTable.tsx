
import React from 'react';
import { User, ChevronRight, Globe, Calendar, Trash2, Clock } from 'lucide-react';
import { Lead, Qualification } from './types';

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onSelectLead, onDeleteLead }) => {
  const getQualColor = (qual?: Qualification) => {
    switch (qual) {
      case Qualification.LEVEL_1: return 'bg-emerald-500 text-white';
      case Qualification.LEVEL_2: return 'bg-amber-400 text-slate-900';
      case Qualification.LEVEL_3: return 'bg-orange-500 text-white';
      case Qualification.NO_CALIF: return 'bg-rose-600 text-white';
      default: return 'bg-slate-200 text-slate-600';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Pendiente';
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest">Qual</th>
              <th className="px-6 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest">Prospecto</th>
              <th className="px-6 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest">Reunión</th>
              <th className="px-6 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest">Origen</th>
              <th className="px-6 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest text-right">Venta ($)</th>
              <th className="px-6 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr 
                key={lead.id} 
                className="hover:bg-slate-50 transition-all group cursor-pointer" 
              >
                <td className="px-6 py-4" onClick={() => onSelectLead(lead)}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${getQualColor(lead.qualification)}`}>
                    {lead.qualification || '?'}
                  </div>
                </td>
                <td className="px-6 py-4" onClick={() => onSelectLead(lead)}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                      <User className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <div>
                      <p className="text-slate-900 text-sm font-bold">{lead.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{lead.email || 'Sin email'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4" onClick={() => onSelectLead(lead)}>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-indigo-600 text-[11px] font-black uppercase">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(lead.call_date)}
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{lead.country || 'S/D'}</span>
                  </div>
                </td>
                <td className="px-6 py-4" onClick={() => onSelectLead(lead)}>
                   <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-tighter">
                     {lead.origin}
                   </span>
                </td>
                <td className="px-6 py-4 text-right" onClick={() => onSelectLead(lead)}>
                   <div className="flex flex-col">
                      <span className="text-sm font-mono font-black text-slate-900">${lead.revenue?.toLocaleString() || '0'}</span>
                      <span className="text-[9px] text-slate-400 uppercase font-black">Cobrado: ${lead.collected_amount?.toLocaleString() || '0'}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteLead(lead.id); }}
                      className="p-2 text-slate-300 hover:text-rose-600 transition-all rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onSelectLead(lead)}
                      className="p-2 text-slate-300 hover:text-indigo-600 transition-all rounded-lg hover:bg-indigo-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsTable;
