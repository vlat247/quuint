'use server'

import { createClient } from '@/lib/supabase/server';
import { createFolderWithChannels, saveChannelAnalysis, ensureUserExistsSafe } from '@/lib/supabase/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://quint-backend-xq3u.onrender.com';

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

    // Fetch summaries for each channel from backend
    const summaries = await Promise.all(
      channels.map(async (c: { channel: string }) => {
        if (token) {
          try {
            const res = await fetch(`${BACKEND_URL}/analyze`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                channel: c.channel,
                email: session.user.email,
                model: 'llama-3.3-70b-versatile'
              }),
            });
            if (res.ok) {
              const data = await res.json();
              const summary = data.result?.summary || data.summary;
              if (summary) return `Channel: ${c.channel}\n${summary}`;
            }
          } catch (e) {
            console.error(`Backend fetch failed for ${c.channel}:`, e);
          }
        }
        return `Channel: ${c.channel}\n- No data available (Backend failed)`;
      })
    );

    const folderContent = summaries.join('\n\n');

    // REMOVED GROQ FALLBACK - Relying on backend only
    // The main digest generation should also come from the backend or be handled differently
    // For now, if we don't have a backend digest, we throw an error.
    if (!token) {
      throw new Error('Not authenticated. Please sign in to generate a digest.');
    }

    const digestRes = await fetch(`${BACKEND_URL}/digest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ folder_id: folderId, folder_content: folderContent }),
    });

    if (!digestRes.ok) {
      const errorBody = await digestRes.text();
      throw new Error(`Backend digest generation failed: ${digestRes.status} - ${errorBody}`);
    }

    const backendData = await digestRes.json();
    const data = backendData.result || backendData;

    // Defensively handle insights — model sometimes returns it as a string
    let insights: string[] = [];
    if (Array.isArray(data.insights)) {
      insights = data.insights;
    } else if (typeof data.insights === 'string') {
      // Try to parse it as JSON array, or split by newlines
      try {
        const parsed = JSON.parse(data.insights);
        insights = Array.isArray(parsed) ? parsed : [data.insights];
      } catch {
        insights = data.insights.split('\n').filter((s: string) => s.trim());
      }
    }

    const finalData = {
      title: data.title || 'Digest',
      summary: data.summary || '',
      insights,
      cached: data.cached ?? false, // Assume backend indicates caching
      readers: Object.keys(data).includes("readers") ? data.readers : undefined
    };

    // Save to history using [Digest] prefix to distinguish it
    if (session && session.user) {
      await saveChannelAnalysis(
          supabase,
          `[Digest] ${folderId}`,
          finalData,
          session.user.id,
          session.user.email
      );
    }

    return {
      success: true,
      data: finalData,
    };
  } catch (error: any) {
    console.error('Generate digest error:', error);
    return { success: false, error: `Failed to generate digest: ${error?.message || error}` };
  }
}

export async function getUserHistory() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return { success: false, error: 'Not logged in' };
    }

    const emailParam = session.user?.email ? `?email=${encodeURIComponent(session.user.email)}` : '';

    const res = await fetch(`${BACKEND_URL}/history${emailParam}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Backend history API error: ${res.status} - ${errorText}`);
      return { success: false, error: `Backend returned ${res.status}` };
    }

    const data = await res.json();
    return { success: true, data: data.history || [], total: data.total || 0 };
  } catch (error: any) {
    console.error('Fetch history error:', error);
    return { success: false, error: 'Failed to fetch history' };
  }
}

export async function searchAnalyses(query: string, limit: number = 10) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return { success: false, error: 'Not logged in' };
    }

    const res = await fetch(`${BACKEND_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ query, limit, email: session.user.email })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Backend search API error: ${res.status} - ${errorText}`);
      // Special handling for 503 (Jina AI down)
      if (res.status === 503) {
        return { success: false, error: 'Search is temporarily unavailable' };
      }
      return { success: false, error: `Search failed: ${res.status}` };
    }

    const data = await res.json();
    return { 
      success: true, 
      results: data.results || [], 
      query: data.query, 
      total: data.total || 0 
    };
  } catch (error: any) {
    console.error('Search error:', error);
    return { success: false, error: 'Failed to perform search' };
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
          body: JSON.stringify({
            channel,
            email: session.user.email,
            model: 'llama-3.3-70b-versatile'
          }),
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
              is_mock: result.is_mock ?? false,
              rating: result.rating,
              rating_feedback: result.rating_feedback,
              core_idea: result.core_idea,
              date_range: result.date_range,
              freshness: result.freshness,
              relevance_score: result.relevance_score,
              concepts: result.concepts,
              tools_and_resources: result.tools_and_resources,
              action_steps: result.action_steps,
              open_questions: result.open_questions,
            };

            // Save individual channel analysis to history
            if (session.user) {
              await saveChannelAnalysis(
                supabase,
                channel,
                data,
                session.user.id,
                session.user.email
              );
            }

            return { success: true, data };
          }
        } else {
          const errorText = await cacheRes.text();
          console.error(`Backend analysis failed: ${cacheRes.status}`, errorText);
          throw new Error(`Analysis failed: Backend returned ${cacheRes.status} - ${errorText}`);
        }
      } catch (e: any) {
        console.error('Backend analysis failed (network/unexpected):', e);
        if (e instanceof Error && e.message.includes('Backend returned')) {
           throw e;
        }
        throw new Error(`Analysis failed: Could not connect to backend server. ${e.message}`);
      }
    } else {
      console.warn('Analysis failed: No session token found.');
      throw new Error('Analysis failed: You must be logged in to analyze a channel.');
    }

    // This part is unreachable if token logic is correct, but safer to keep structured
    throw new Error('Analysis failed: Unknown error.');

    // Removed Groq fallback

  } catch (error: any) {
    console.error('Analysis error:', error);
    return {
      success: false,
      error: `Failed to analyze: ${error?.message || error}`,
    };
  }
}

export async function syncUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await ensureUserExistsSafe(supabase, user);
    return { success: true };
  }
  return { success: false };
}
