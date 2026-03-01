import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://quint-backend-xq3u.onrender.com';
    const emailParam = session.user?.email ? `?email=${encodeURIComponent(session.user.email)}` : '';

    // Fetch history from the new Python backend endpoint
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
      
      // If token expired, might return 401. Let the frontend handle refresh if necessary
      return NextResponse.json(
        { success: false, error: `Backend returned ${res.status}` }, 
        { status: res.status }
      );
    }

    const data = await res.json();
    
    // The backend returns { history: HistoryItem[], total: number }
    return NextResponse.json({ 
      success: true, 
      data: data.history || [], 
      total: data.total || 0 
    });

  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
  }
}
