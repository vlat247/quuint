'use server'

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase with Service Role Key for secure server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function submitEmail(email: string) {
  try {
    // Basic validation
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Invalid email address' };
    }

    const { error } = await supabase
      .from('early_access_emails')
      .insert([{ email }]);

    if (error) {
      // Handle unique constraint violation (PGRST116 or 23505)
      if (error.code === '23505') {
        return { success: true, message: 'Email already registered' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Submission error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
