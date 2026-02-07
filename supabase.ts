
import { createClient } from '@supabase/supabase-js';

// En este entorno, las variables de entorno se inyectan en process.env.
// Se ha detectado que import.meta.env es undefined, lo que causaba el error.

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uwzgyefsxpzuucsnuwqj.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__oH5BiRHEC0qp4ZNfh3Vqg_lo2t_oOn';

// Verificación de seguridad
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Error crítico: No se pudieron cargar las credenciales de Supabase desde process.env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
