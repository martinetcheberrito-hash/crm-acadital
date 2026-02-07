
export enum LeadStatus {
  NEW = 'Nuevo',
  CONTACTED = 'Contactado',
  CLOSED = 'Cerrado'
}

export enum LeadOrigin {
  SETTING = 'Setting',
  DIRECT = 'Agenda Directa',
  TIKTOK = 'TikTok',
  REFERRAL = 'Referral',
  INSTAGRAM = 'Instagram',
  YOUTUBE = 'YouTube'
}

export enum Qualification {
  LEVEL_1 = '1',
  LEVEL_2 = '2',
  LEVEL_3 = '3',
  NO_CALIF = 'NoCalif'
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  country?: string;
  qualification?: Qualification;
  call_date?: string;
  
  // Intake Form
  website?: string;
  decision_maker?: string;
  ad_spend?: string;
  monthly_revenue?: string;
  main_problem?: string;
  
  // Tracking
  whatsapp_confirmed?: 'Si' | 'No' | 'Pendiente';
  attended?: 'Si' | 'No' | 'Pendiente';
  no_attend_reason?: string;
  follow_up?: 'Si' | 'No' | 'N/A';
  offer_made?: boolean;
  second_call?: boolean;
  bought?: boolean;
  payment_method?: 'Contado' | 'Cuotas' | 'No';
  
  // Financials
  collected_amount?: number;
  revenue?: number;
  setter_commission?: number;
  closer_commission?: number;
  first_payment_date?: string;
  reservation_date?: string;
  full_payment_date?: string;
  days_to_collect?: number;
  
  // Personnel
  setter?: string;
  closer?: string;
  triager?: string;

  status: LeadStatus;
  origin: LeadOrigin;
  notes: string;
  ai_analysis?: string;
  chat_analysis?: string;
  value: number; // Opportunity value
  created_at: string;
}

export interface DashboardStats {
  totalLeads: number;
  monthlySales: number;
  totalCommissions: number;
  conversionRate: number;
  growth: number;
}
