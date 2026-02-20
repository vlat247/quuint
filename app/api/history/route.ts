import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: publicUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (!publicUser) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data: history, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('user_id', publicUser.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: history || [] });
  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
  }
}
