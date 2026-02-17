import { SupabaseClient } from '@supabase/supabase-js';

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  icon?: string;
  created_at: string;
  channels?: Channel[];
}

export interface Channel {
  id: string;
  folder_id: string;
  name: string;
  created_at: string;
}

export async function getUserFolders(supabase: SupabaseClient) {
  const { data: folders, error } = await supabase
    .from('folders')
    .select(`
      *,
      channels (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching folders:', error);
    return [];
  }

  // Transform to match the shape expected by the UI (array of strings for channels)
  return folders.map((folder: any) => ({
    ...folder,
    channels: folder.channels.map((c: any) => c.name) // Map objects to strings
  }));
}

export async function createFolderWithChannels(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  icon: string,
  channels: string[]
) {
  // 1. Create Folder
  const { data: folder, error: folderError } = await supabase
    .from('folders')
    .insert({ user_id: userId, name, icon })
    .select()
    .single();

  if (folderError) throw folderError;

  // 2. Create Channels
  if (channels.length > 0) {
    const channelInserts = channels.map(channelName => ({
      folder_id: folder.id,
      name: channelName
    }));

    const { error: channelsError } = await supabase
      .from('channels')
      .insert(channelInserts);

    if (channelsError) throw channelsError;
  }

  return { ...folder, channels };
}

export async function saveChannelAnalysis(
  supabase: SupabaseClient,
  channelName: string,
  summaryJson: any
) {
  const { error } = await supabase
    .from('channel_summaries')
    .insert({
      channel_name: channelName,
      summary_json: summaryJson
    });
    
  if (error) console.error('Error saving analysis:', error);
}

export async function getChannelAnalysis(supabase: SupabaseClient, channelName: string) {
   const { data, error } = await supabase
    .from('channel_summaries')
    .select('*')
    .eq('channel_name', channelName)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

   if (error) return null;
   return data;
}
