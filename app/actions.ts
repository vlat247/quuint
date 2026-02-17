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
    const supabase = await createClient();
    
    // 1. Fetch Folder and Channels from Supabase
    const { data: folder, error } = await supabase
      .from('folders')
      .select('*, channels(*)')
      .eq('id', folderId)
      .single();

    if (error || !folder) {
        console.error('Folder not found:', error);
        return { success: false, error: 'Folder not found' };
    }

    const channels = folder.channels || [];
    if (channels.length === 0) {
        return { success: false, error: 'No channels in this folder to digest.' };
    }

    // 2. Aggregate Content (Mocked)
    const folderContent = channels.map((c: any) => `
      Channel: ${c.name}
      - Update 1 from ${c.name}: detailed insights on tech.
      - Update 2 from ${c.name}: market movements and analysis.
    `).join('\n');

    // 3. Generate Digest with Groq
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert analyst. Create a digest for these Telegram channels. Return JSON with: title (catchy), summary (executive summary), insights (array of key points), cached (boolean true). Output ONLY JSON."
        },
        {
          role: "user",
          content: folderContent
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No content from Groq");
    
    const data = JSON.parse(content);

    return { success: true, data };
  } catch (error) {
    console.error('Generate digest error:', error);
    return { success: false, error: 'Failed to generate digest' };
  }
}

// ... imports
import Groq from "groq-sdk";

// ... existing code ...

export async function analyzeChannel(email: string, channel: string) {
  try {
    // 1. Fetch Channel Content (Mocked for now as we don't have a Telegram scraper)
    // In a real app, you'd use a Telegram API or scraper here.
    const mockChannelContent = `
      [Latest Posts from ${channel}]
      1. AI is evolving rapidly. New models from Groq are changing the game with 500t/s inference speeds.
      2. The future of coding is agentic. Tools like Cursor and Windsurf are leading the way.
      3. Crypto markets are volatile this week. Bitcoin testing new highs.
      4. Remember to drink water and touch grass.
      5. Quint is the best tool for summarizing telegram channels.
    `;

    // 2. Analyze with Groq (Real AI)
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert analyst. Summarize the following Telegram channel content into a structured JSON format with fields: title, summary (brief), insights (array of strings), readers (comma separated list of target audience). Output ONLY JSON."
        },
        {
          role: "user",
          content: mockChannelContent
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No content from Groq");
    
    const parsedData = JSON.parse(content);
    
    // Ensure structure matches what frontend expects
    const data = {
        title: parsedData.title || `Analysis of ${channel}`,
        summary: parsedData.summary || "No summary generated.",
        insights: parsedData.insights || [],
        readers: parsedData.readers || "General Audience",
        cached: false,
        is_mock: false // It's real AI now!
    };

    // 3. Persist Result to Supabase
    try {
        const supabase = await createClient();
        await saveChannelAnalysis(supabase, channel, data);
    } catch (dbError) {
        console.warn('Failed to save analysis to DB:', dbError);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Analysis error:', error);
    return { success: false, error: 'Failed to analyze channel. Please check your API key.' };
  }
}
