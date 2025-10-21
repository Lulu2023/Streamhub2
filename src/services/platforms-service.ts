import { supabase } from './supabase';
import type { Platform, UserPlatformAuth, PlatformFavorite, PlatformWatchHistory } from '../types';

export const platformsService = {
  async getAllPlatforms(): Promise<Platform[]> {
    const { data, error } = await supabase
      .from('platforms')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching platforms:', error);
      throw error;
    }

    return data || [];
  },

  async getPlatformBySlug(slug: string): Promise<Platform | null> {
    const { data, error } = await supabase
      .from('platforms')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching platform:', error);
      throw error;
    }

    return data;
  },

  async getUserAuthForPlatform(userId: string, platformId: string): Promise<UserPlatformAuth | null> {
    const { data, error } = await supabase
      .from('user_platform_auth')
      .select('*')
      .eq('user_id', userId)
      .eq('platform_id', platformId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user platform auth:', error);
      throw error;
    }

    return data;
  },

  async setUserAuthForPlatform(
    userId: string,
    platformId: string,
    authData: Record<string, any>,
    expiresAt?: string
  ): Promise<UserPlatformAuth> {
    const { data, error } = await supabase
      .from('user_platform_auth')
      .upsert({
        user_id: userId,
        platform_id: platformId,
        is_authenticated: true,
        auth_data: authData,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error setting user platform auth:', error);
      throw error;
    }

    return data;
  },

  async removeUserAuthForPlatform(userId: string, platformId: string): Promise<void> {
    const { error } = await supabase
      .from('user_platform_auth')
      .delete()
      .eq('user_id', userId)
      .eq('platform_id', platformId);

    if (error) {
      console.error('Error removing user platform auth:', error);
      throw error;
    }
  },

  async getUserAuthenticatedPlatforms(userId: string): Promise<(Platform & { auth: UserPlatformAuth })[]> {
    const { data, error } = await supabase
      .from('user_platform_auth')
      .select(`
        *,
        platform:platforms(*)
      `)
      .eq('user_id', userId)
      .eq('is_authenticated', true);

    if (error) {
      console.error('Error fetching authenticated platforms:', error);
      throw error;
    }

    return (data || []).map((item: any) => ({
      ...item.platform,
      auth: item
    }));
  },

  async addFavorite(
    userId: string,
    platformId: string,
    contentId: string,
    contentType: 'video' | 'live' | 'program',
    contentData: Record<string, any>
  ): Promise<PlatformFavorite> {
    const { data, error } = await supabase
      .from('platform_favorites')
      .insert({
        user_id: userId,
        platform_id: platformId,
        content_id: contentId,
        content_type: contentType,
        content_data: contentData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }

    return data;
  },

  async removeFavorite(userId: string, platformId: string, contentId: string): Promise<void> {
    const { error } = await supabase
      .from('platform_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('platform_id', platformId)
      .eq('content_id', contentId);

    if (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  },

  async getUserFavorites(userId: string, platformId?: string): Promise<PlatformFavorite[]> {
    let query = supabase
      .from('platform_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (platformId) {
      query = query.eq('platform_id', platformId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }

    return data || [];
  },

  async isFavorite(userId: string, platformId: string, contentId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('platform_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('platform_id', platformId)
      .eq('content_id', contentId)
      .maybeSingle();

    if (error) {
      console.error('Error checking favorite:', error);
      return false;
    }

    return !!data;
  },

  async updateWatchProgress(
    userId: string,
    platformId: string,
    contentId: string,
    contentType: 'video' | 'live' | 'program',
    progress: number,
    duration: number,
    contentData: Record<string, any>
  ): Promise<PlatformWatchHistory> {
    const { data, error } = await supabase
      .from('platform_watch_history')
      .upsert({
        user_id: userId,
        platform_id: platformId,
        content_id: contentId,
        content_type: contentType,
        progress,
        duration,
        content_data: contentData,
        last_watched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating watch progress:', error);
      throw error;
    }

    return data;
  },

  async getWatchHistory(userId: string, platformId?: string, limit: number = 50): Promise<PlatformWatchHistory[]> {
    let query = supabase
      .from('platform_watch_history')
      .select('*')
      .eq('user_id', userId)
      .order('last_watched_at', { ascending: false })
      .limit(limit);

    if (platformId) {
      query = query.eq('platform_id', platformId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching watch history:', error);
      throw error;
    }

    return data || [];
  },

  async getWatchProgress(userId: string, platformId: string, contentId: string): Promise<PlatformWatchHistory | null> {
    const { data, error } = await supabase
      .from('platform_watch_history')
      .select('*')
      .eq('user_id', userId)
      .eq('platform_id', platformId)
      .eq('content_id', contentId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching watch progress:', error);
      throw error;
    }

    return data;
  },

  async clearWatchHistory(userId: string, platformId?: string): Promise<void> {
    let query = supabase
      .from('platform_watch_history')
      .delete()
      .eq('user_id', userId);

    if (platformId) {
      query = query.eq('platform_id', platformId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error clearing watch history:', error);
      throw error;
    }
  },
};
