import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseService = {
  async syncWatchHistory(videoId: string, progress: number, videoData: any) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .upsert({
          video_id: videoId,
          progress,
          video_data: videoData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'video_id',
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error syncing watch history:', error);
      return null;
    }
  },

  async getWatchHistory(limit: number = 50) {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading watch history:', error);
      return [];
    }
  },

  async removeWatchHistory(videoId: string) {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('video_id', videoId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing watch history:', error);
      return false;
    }
  },

  async createPlaylist(name: string) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating playlist:', error);
      return null;
    }
  },

  async getPlaylists() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*, playlist_videos(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading playlists:', error);
      return [];
    }
  },

  async deletePlaylist(playlistId: string) {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      return false;
    }
  },

  async addVideoToPlaylist(playlistId: string, videoData: any) {
    if (!supabase) return null;
    try {
      const { data: existingVideos } = await supabase
        .from('playlist_videos')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = existingVideos && existingVideos.length > 0
        ? existingVideos[0].position + 1
        : 0;

      const { data, error } = await supabase
        .from('playlist_videos')
        .insert({
          playlist_id: playlistId,
          video_data: videoData,
          added_at: new Date().toISOString(),
          position: nextPosition,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      await supabase
        .from('playlists')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', playlistId);

      return data;
    } catch (error) {
      console.error('Error adding video to playlist:', error);
      return null;
    }
  },

  async removeVideoFromPlaylist(playlistId: string, videoId: string) {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('playlist_videos')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('video_data->>id', videoId);

      if (error) throw error;

      await supabase
        .from('playlists')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', playlistId);

      return true;
    } catch (error) {
      console.error('Error removing video from playlist:', error);
      return false;
    }
  },

  async getPlaylistVideos(playlistId: string) {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('playlist_videos')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading playlist videos:', error);
      return [];
    }
  },
};
