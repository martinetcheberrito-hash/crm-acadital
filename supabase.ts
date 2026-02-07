
import { createClient } from '@supabase/supabase-js';

/**
 * CONFIGURACIÓN DE SUPABASE
 * ------------------------
 */
const supabaseUrl = 'https://uwzgyefsxpzuucsnuwqj.supabase.co';
const supabaseAnonKey = 'sb_publishable__oH5BiRHEC0qp4ZNfh3Vqg_lo2t_oOn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * SCHEMA SQL ACTUALIZADO PARA 'leads':
 * 
 * create table leads (
 *   id text primary key,
 *   name text not null,
 *   email text,
 *   phone text,
 *   country text,
 *   qualification text,
 *   call_date timestamp with time zone,
 *   website text,
 *   monthly_revenue text,
 *   main_problem text,
 *   whatsapp_confirmed text default 'Pendiente',
 *   attended text default 'Pendiente',
 *   no_attend_reason text,
 *   follow_up text default 'N/A',
 *   offer_made boolean default false,
 *   second_call boolean default false,
 *   bought boolean default false,
 *   payment_method text default 'No',
 *   collected_amount numeric default 0,
 *   revenue numeric default 0,
 *   setter_commission numeric default 0,
 *   closer_commission numeric default 0,
 *   first_payment_date timestamp with time zone,
 *   setter text,
 *   closer text,
 *   triager text,
 *   status text default 'Nuevo',
 *   origin text,
 *   notes text,
 *   chat_analysis text,
 *   created_at timestamp with time zone default now()
 * );
 */
