import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client to bypass RLS since user_id in summaries references public.users.id, not auth.users.id
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let { data: publicUser } = await adminSupabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (!publicUser && user.email) {
      const { data: userByEmail } = await adminSupabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
        
      if (userByEmail) {
        // Link them for next time
        await adminSupabase.from('users').update({ auth_id: user.id }).eq('id', userByEmail.id);
        publicUser = userByEmail;
      }
    }

    if (!publicUser) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data: history, error } = await adminSupabase
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
