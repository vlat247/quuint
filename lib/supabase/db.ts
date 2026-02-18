import { SupabaseClient } from '@supabase/supabase-js';

// ── Real DB schema ──────────────────────────────────────────
// folders:        id, user_id (→ public.users.id), name, icon, email, created_at
// folder_channels: id, folder_id (→ folders.id), channel, created_at
// summaries:      id, user_id (→ public.users.id), channel, summary (jsonb), email, created_at
// users:          id, email, role, username, auth_id (= auth.users.id), created_at
// ────────────────────────────────────────────────────────────

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  icon?: string;
  created_at: string;
  channels?: string[];
}

export interface FolderChannel {
  id: string;
  folder_id: string;
  channel: string;
  created_at: string;
}

/** Resolve public.users.id from auth UUID, auto-creating the row if needed */
async function getPublicUserId(
  supabase: SupabaseClient,
  authId: string,
  email?: string
): Promise<string | null> {
  // Use maybeSingle() — returns null (not error) when no row found
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', authId)
    .maybeSingle();

  if (existing) return existing.id;

  // Auto-create the public.users row for this Supabase Auth user
  // Use upsert to handle race conditions
  const { data: created, error } = await supabase
    .from('users')
    .upsert({ auth_id: authId, email: email ?? '' }, { onConflict: 'auth_id' })
    .select('id')
    .single();

  if (error || !created) {
    console.error('Could not create public user for auth_id:', authId, JSON.stringify(error));
    return null;
  }
  return created.id;
}

export async function getUserFolders(supabase: SupabaseClient, authId: string) {
  // First resolve the public user id
  const publicUserId = await getPublicUserId(supabase, authId);
  if (!publicUserId) return [];

  const { data: folders, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', publicUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching folders:', error);
    return [];
  }

  // Fetch channels for each folder
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
  authId: string,
  name: string,
  icon: string,
  channels: string[],
  email?: string
) {
  // Resolve public user id from auth UUID (auto-creates if missing)
  const publicUserId = await getPublicUserId(supabase, authId, email);
  if (!publicUserId) throw new Error('User not found in public.users. Please contact support.');

  // 1. Create folder
  const { data: folder, error: folderError } = await supabase
    .from('folders')
    .insert({ user_id: publicUserId, name, icon })
    .select()
    .single();

  if (folderError) throw folderError;

  // 2. Create channels in folder_channels
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
  const insertData: any = {
    channel: channelName,
    summary: summaryData,
  };

  if (authId) {
    const publicUserId = await getPublicUserId(supabase, authId);
    if (publicUserId) insertData.user_id = publicUserId;
  }
  if (email) insertData.email = email;

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
    .single();

  if (error) return null;
  return data;
}
