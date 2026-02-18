import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserFolders, createFolderWithChannels } from '@/lib/supabase/db';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const folders = await getUserFolders(supabase, user.id);
  return NextResponse.json({ folders });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, channels, icon } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const folder = await createFolderWithChannels(
      supabase,
      user.id,
      name,
      icon || 'Folder',
      channels || []
    );

    return NextResponse.json({ folder });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
