
import React from 'react';
import { User, ChevronRight, Zap, Target, Globe, CheckCircle2, XCircle, Calendar, Clock } from 'lucide-react';
import { Lead, Qualification } from './types';

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onSelectLead }) => {
  const getQualColor = (qual?: Qualification) => {
    switch (qual) {
      case Qualification.LEVEL_1: return 'bg-emerald-500 text-white';
      case Qualification.LEVEL_2: return 'bg-amber-400 text-slate-900';
      case Qualification.LEVEL_3: return 'bg-orange-500 text-white';
      case Qualification.NO_CALIF: return 'bg-rose-600 text-white';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const getAttendanceDisplay = (lead: Lead) => {
    if (lead.attended === 'Si') {
      return (
        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase">
          <CheckCircle2 className="w-3.5 h-3.5" /> Asistió
        </div>
      );
    }
    
    if (lead.attended === 'No') {
      return (
        <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-black uppercase">
          <XCircle className="w-3.5 h-3.5" /> No Asistió
        </div>
      );
    }

    // Logic for "Pendiente" with relative dates
    if (lead.call_date) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const callDate = new Date(lead.call_date);
      callDate.setHours(0, 0, 0, 0);
      
      const diffTime = callDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return (
          <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-black uppercase animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Hoy
          </div>
        );
      } else if (diffDays === 1) {
        return (
          <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] font-black uppercase">
            <Clock className="w-3.5 h-3.5" /> Mañana
          </div>
        );
      } else if (diffDays > 1) {
        return (
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase">
            <Clock className="w-3.5 h-3.5" /> En {diffDays} días
          </div>
        );
      }
    }

    return (
      <div className="text-slate-600 text-[10px] font-black uppercase tracking-tighter">
        Pendiente
      </div>
    );
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800">
              <th className="px-6 py-5 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Cualificación</th>
              <th className="px-6 py-5 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Cliente / Agenda</th>
              <th className="px-6 py-5 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">País</th>
              <th className="px-6 py-5 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Origen</th>
              <th className="px-6 py-5 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Asistencia</th>
              <th className="px-6 py-5 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Venta ($)</th>
              <th className="px-6 py-5 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {leads.map((lead) => (
              <tr 
                key={lead.id} 
                className="hover:bg-indigo-600/5 transition-all group cursor-pointer" 
                onClick={() => onSelectLead(lead)}
              >
                <td className="px-6 py-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-lg ${getQualColor(lead.qualification)}`}>
                    {lead.qualification || '?'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                      <User className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold group-hover:text-indigo-300 transition-colors">{lead.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        <p className="text-[10px] text-slate-500 font-mono">Agenda: {formatDate(lead.call_date)}</p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <Globe className="w-3.5 h-3.5" /> {lead.country || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                     {lead.origin}
                   </span>
                </td>
                <td className="px-6 py-4">
                   {getAttendanceDisplay(lead)}
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col">
                      <span className="text-sm font-mono font-black text-white">${lead.revenue?.toLocaleString() || '0'}</span>
                      <span className="text-[9px] text-slate-500">Collected: ${lead.collected_amount?.toLocaleString() || '0'}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
                    <ChevronRight className="w-4 h-4" />
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
