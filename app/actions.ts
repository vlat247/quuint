'use server'

import { createClient } from '@supabase/supabase-js';

export async function submitEmail(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables');
    return { success: false, error: 'Server configuration error' };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
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

export async function analyzeChannel(email: string, channel: string) {
  try {
    // Import the API helper dynamically (server action context)
    const { analyzeChannelApi, ApiError } = await import('@/lib/api');

    const data = await analyzeChannelApi(email, channel);
    return { success: true, data };
  } catch (error) {
    // Handle API errors with detailed logging
    if (error instanceof Error && error.name === 'ApiError') {
      const apiError = error as unknown as { status: number; statusText: string; body: string };
      console.error('[analyzeChannel] API Error:', apiError.status, apiError.body);
      
      // User-friendly error message based on status
      let userMessage = 'Analysis failed. Please try again.';
      if (apiError.status === 429) {
        userMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (apiError.status >= 500) {
        userMessage = 'Server error. Please try again later.';
      } else if (apiError.status === 404) {
        userMessage = 'Channel not found or is private.';
      }
      return { success: false, error: userMessage };
    }

    // Network or other errors
    console.error('[analyzeChannel] Unexpected error:', error);
    return { success: false, error: 'Failed to connect to analysis service. Check your network connection.' };
  }
}
