'use server'

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function submitEmail(email: string) {
  try {
    const { earlyAccessApi, ApiError } = await import('@/lib/api');
    await earlyAccessApi(email);
    
    // Set cookie on success (even if backend handles it, we set it here for middleware/client checks if needed)
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

export async function createFolder(name: string, channels: string[]) {
   try {
    const { createFolderApi } = await import('@/lib/api');
    const data = await createFolderApi(name, channels);
    return { success: true, data };
  } catch (error) {
    console.error('Create folder error:', error);
    return { success: false, error: 'Failed to create folder' };
  }
}

export async function generateDigest(folderId: string) {
  try {
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
