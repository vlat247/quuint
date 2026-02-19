import { SupabaseClient } from '@supabase/supabase-js';

// ── Real DB schema ──────────────────────────────────────────
// folders:         id, user_id (→ auth.users.id), name, icon, email, created_at
// folder_channels: id, folder_id (→ folders.id), channel, created_at
// summaries:       id, user_id (→ public.users.id), channel, summary (jsonb), email, created_at
// users (public):  id, email, role, username, auth_id (= auth.users.id), created_at
// ────────────────────────────────────────────────────────────

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  icon?: string;
  created_at: string;
  channels?: string[];
}

export async function getUserFolders(supabase: SupabaseClient, authId: string) {
  const { data: folders, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', authId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching folders:', error);
    return [];
  }

  if (!folders || folders.length === 0) return [];

  // Fetch channels for each folder from folder_channels table
  const folderIds = folders.map((f: any) => f.id);
  const { data: folderChannels } = await supabase
    .from('folder_channels')
    .select('folder_id, channel')
    .in('folder_id', folderIds);

  return folders.map((folder: any) => ({
    ...folder,
    channels: (folderChannels ?? [])
      .filter((fc: any) => fc.folder_id === folder.id)
      .map((fc: any) => fc.channel),
  }));
}

export async function createFolderWithChannels(
  supabase: SupabaseClient,
  authId: string,   // auth.users.id — used directly as folders.user_id
  name: string,
  icon: string,
  channels: string[],
  _email?: string   // kept for API compatibility, not used
) {
  // Insert folder — user_id is the Supabase auth UUID (FK → auth.users.id)
  const { data: folder, error: folderError } = await supabase
    .from('folders')
    .insert({ user_id: authId, name, icon })
    .select()
    .single();

  if (folderError) throw folderError;

  // Insert channels into folder_channels
  if (channels.length > 0) {
    const channelInserts = channels.map((channel) => ({
      folder_id: folder.id,
      channel,
    }));

    const { error: channelsError } = await supabase
      .from('folder_channels')
      .insert(channelInserts);

    if (channelsError) throw channelsError;
  }

  return { ...folder, channels };
}

export async function saveChannelAnalysis(
  supabase: SupabaseClient,
  channelName: string,
  summaryData: any,
  authId?: string,
  email?: string
) {
  // summaries.user_id references public.users.id — look it up if we have authId
  const insertData: any = {
    channel: channelName,
    summary: summaryData,
  };

  if (email) insertData.email = email;

  if (authId) {
    const { data: publicUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', authId)
      .maybeSingle();

    if (publicUser) insertData.user_id = publicUser.id;
  }

  const { error } = await supabase.from('summaries').insert(insertData);
  if (error) console.error('Error saving analysis:', error);
}

export async function getChannelAnalysis(supabase: SupabaseClient, channelName: string) {
  const { data, error } = await supabase
    .from('summaries')
    .select('*')
    .eq('channel', channelName)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function ensureUserExists(supabase: SupabaseClient, user: { id: string; email?: string; user_metadata?: any }) {
  if (!user || !user.id || !user.email) return;

  const { error } = await supabase
    .from('users')
    .insert({
      id: user.id,
      email: user.email,
      auth_id: user.id,
      role: 'user',
      username: user.user_metadata?.display_name || user.email.split('@')[0],
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  // "23505" is Postgres error code for unique_violation (already exists).
  // We can ignore it, or relies on 'on conflict do nothing' if we used upsert/conflict syntax.
  // Using .insert() without returning might throw, so let's use upsert with ignoreDuplicates: true
  // actually, let's use explicit upsert for safety
}

// Re-implementing with upsert for robustness
export async function ensureUserExistsSafe(supabase: SupabaseClient, user: { id: string; email?: string; user_metadata?: any }) {
    if (!user || !user.id || !user.email) return;

    try {
        const { error } = await supabase
            .from('users')
            .upsert({
                id: user.id,
                email: user.email,
                auth_id: user.id,
                role: 'user',
                username: user.user_metadata?.display_name || user.email.split('@')[0],
                // created_at: undefined // Let DB handle default or preserve existing
            }, { onConflict: 'id', ignoreDuplicates: true }); // Don't overwrite existing data

        if (error) {
             console.error('ensureUserExists error:', error);
        }
    } catch (e) {
        console.error('ensureUserExists exception:', e);
    }
}
