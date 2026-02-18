'use server'

import Groq from 'groq-sdk';
import { createClient } from '@/lib/supabase/server';
import { createFolderWithChannels, saveChannelAnalysis } from '@/lib/supabase/db';

const BACKEND_URL = 'https://quint-backend-xq3u.onrender.com';

export async function submitEmail(email: string) {
  try {
    const { earlyAccessApi, ApiError } = await import('@/lib/api');
    await earlyAccessApi(email);

    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.set('quint_early_access', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.name === 'ApiError') {
      const apiError = error as unknown as { status: number; body: string };
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
      return { success: false, error: 'Not logged in. Please sign in and try again.' };
    }

    // Pass auth UUID — db.ts resolves to public.users.id internally (auto-creates if missing)
    const folder = await createFolderWithChannels(
      supabase,
      user.id,
      name,
      icon || 'Folder',
      channels,
      user.email
    );

    return { success: true, data: folder };
  } catch (error: any) {
    console.error('Create folder error:', error);
    const message = error?.message || error?.details || JSON.stringify(error);
    return { success: false, error: `Failed to create folder: ${message}` };
  }
}

export async function generateDigest(folderId: string) {
  try {
    const supabase = await createClient();

    // Fetch folder
    const { data: folder, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .single();

    if (error || !folder) {
      return { success: false, error: `Folder not found: ${error?.message || 'unknown error'}` };
    }

    // Fetch channels from folder_channels (real table name)
    const { data: folderChannels, error: chError } = await supabase
      .from('folder_channels')
      .select('channel')
      .eq('folder_id', folderId);

    if (chError) {
      return { success: false, error: `Failed to fetch channels: ${chError.message}` };
    }

    const channels = folderChannels ?? [];
    if (channels.length === 0) {
      return { success: false, error: 'No channels in this folder to digest.' };
    }

    // Get the user's session token to authenticate with the backend
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    // Fetch real summaries from the backend for each channel
    const summaries = await Promise.all(
      channels.map(async (c: { channel: string }) => {
        try {
          const res = await fetch(`${BACKEND_URL}/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ channel: c.channel }),
          });
          if (!res.ok) return `Channel: ${c.channel}\n- No data available.`;
          const data = await res.json();
          const summary = data.result?.summary || data.summary || 'No summary available.';
          return `Channel: ${c.channel}\n${summary}`;
        } catch {
          return `Channel: ${c.channel}\n- Could not fetch data.`;
        }
      })
    );

    const folderContent = summaries.join('\n\n');

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert analyst. Create a digest for these Telegram channels. Return JSON with exactly these fields: title (string, catchy headline), summary (string, 2-3 sentence executive summary), insights (array of strings, 3-5 key points), cached (boolean, always false). Output ONLY valid JSON, no extra text.',
        },
        {
          role: 'user',
          content: folderContent,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No content from Groq');

    const data = JSON.parse(content);

    return {
      success: true,
      data: {
        title: data.title || 'Digest',
        summary: data.summary || '',
        insights: Array.isArray(data.insights) ? data.insights : [],
        cached: false,
      },
    };
  } catch (error: any) {
    console.error('Generate digest error:', error);
    return { success: false, error: `Failed to generate digest: ${error?.message || error}` };
  }
}

export async function analyzeChannel(channel: string) {
  try {
    const supabase = await createClient();

    // Check backend cache first (don't fail if it errors)
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (token) {
      try {
        const cacheRes = await fetch(`${BACKEND_URL}/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ channel }),
        });
        if (cacheRes.ok) {
          const backendData = await cacheRes.json();
          const result = backendData.result || backendData;
          if (result.summary) {
            const data = {
              title: result.title || `Analysis of ${channel}`,
              summary: result.summary,
              insights: Array.isArray(result.insights) ? result.insights : [],
              readers: result.readers || result.audience || 'General Audience',
              cached: backendData.cached ?? true,
              is_mock: false,
            };
            return { success: true, data };
          }
        }
      } catch {
        // Backend unavailable or user not registered — fall through to Groq
      }
    }

    // Analyze directly with Groq
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert analyst. Summarize the following Telegram channel into a structured JSON with exactly these fields: title (string), summary (string, 2-3 sentences), insights (array of 3-5 strings), readers (string, comma-separated target audience). Output ONLY valid JSON.',
        },
        {
          role: 'user',
          content: `Analyze the Telegram channel: ${channel}. Based on the channel name, infer its likely content and audience.`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No content from Groq');

    const parsedData = JSON.parse(content);

    const data = {
      title: parsedData.title || `Analysis of ${channel}`,
      summary: parsedData.summary || 'No summary generated.',
      insights: Array.isArray(parsedData.insights) ? parsedData.insights : [],
      readers: parsedData.readers || 'General Audience',
      cached: false,
      is_mock: false,
    };

    // Persist to Supabase (non-blocking)
    try {
      await saveChannelAnalysis(supabase, channel, data, session?.user?.id, session?.user?.email ?? undefined);
    } catch (dbError) {
      console.warn('Failed to save analysis to DB:', dbError);
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Analysis error:', error);
    return {
      success: false,
      error: `Failed to analyze: ${error?.message || error}`,
    };
  }
}
