'use server'

import { createClient } from '@/lib/supabase/server';
import { createFolderWithChannels, saveChannelAnalysis } from '@/lib/supabase/db';

export async function submitEmail(email: string) {
  try {
    const { earlyAccessApi, ApiError } = await import('@/lib/api');
    await earlyAccessApi(email);
    
    // Set cookie on success (even if backend handles it, we set it here for middleware/client checks if needed)
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.set('quint_early_access', 'true', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', 
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });

    return { success: true };
  } catch (error) {
     if (error instanceof Error && error.name === 'ApiError') {
      const apiError = error as unknown as { status: number; body: string };
      // Try to parse the error body if it's JSON
      let errorMessage = 'Invalid email';
      try {
        const parsed = JSON.parse(apiError.body);
        if (parsed.detail) errorMessage = parsed.detail;
      } catch {
         // fallback
      }
      return { success: false, error: errorMessage };
    }
    console.error('Submission error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function createFolder(name: string, channels: string[], icon: string) {
   try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const folder = await createFolderWithChannels(
        supabase, 
        user.id, 
        name, 
        icon || 'Folder', 
        channels
    );
    
    return { success: true, data: folder };
  } catch (error) {
    console.error('Create folder error:', error);
    return { success: false, error: 'Failed to create folder' };
  }
}

export async function generateDigest(folderId: string) {
  try {
    // Note: The external API might expect the folder to exist in its own DB.
    // For now, we are just calling it as before, but since we are migrating to Supabase,
    // this might fail if the external API is stateful and doesn't know about our Supabase IDs.
    // TODO: Update external API to accept channel list or sync folders.
    
    const { generateDigestApi } = await import('@/lib/api');
    const data = await generateDigestApi(folderId);
    return { success: true, data };
  } catch (error) {
    console.error('Generate digest error:', error);
    return { success: false, error: 'Failed to generate digest' };
  }
}

export async function analyzeChannel(email: string, channel: string) {
  try {
    // 1. Call External API for Analysis
    const { analyzeChannelApi, ApiError } = await import('@/lib/api');
    // Using a default email if not provided to avoid API errors if email is required
    const data = await analyzeChannelApi(email || 'demo@quint.com', channel);

    // 2. Persist Result to Supabase (Best Effort)
    try {
        const supabase = await createClient();
        await saveChannelAnalysis(supabase, channel, data);
    } catch (dbError) {
        console.warn('Failed to save analysis to DB:', dbError);
        // Continue, don't fail the request just because save failed
    }

    return { success: true, data };
  } catch (error) {
    if (error instanceof Error && error.name === 'ApiError') {
      const apiError = error as unknown as { status: number; statusText: string; body: string };
      console.error('[analyzeChannel] API Error:', apiError.status, apiError.body);
      
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

    console.error('[analyzeChannel] Unexpected error:', error);
    return { success: false, error: 'Failed to connect to analysis service. Check your network connection.' };
  }
}
