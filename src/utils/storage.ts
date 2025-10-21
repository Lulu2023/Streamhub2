import { Playlist, WatchProgress, AuthTokens, UserSettings } from '../types';
import { supabaseService } from '../services/supabase';

const STORAGE_KEYS = {
  AUTH_TOKENS: 'rtbf_auth_tokens',
  USER_SETTINGS: 'rtbf_user_settings',
  PLAYLISTS: 'rtbf_playlists',
  WATCH_PROGRESS: 'rtbf_watch_progress',
  DEVICE_ID: 'rtbf_device_id',
};

export const storage = {
  getAuthTokens(): AuthTokens | null {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
    return data ? JSON.parse(data) : null;
  },

  setAuthTokens(tokens: AuthTokens): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens));
  },

  clearAuthTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
  },

  getUserSettings(): UserSettings | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    return data ? JSON.parse(data) : null;
  },

  setUserSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
  },

  getPlaylists(): Playlist[] {
    const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    return data ? JSON.parse(data) : [];
  },

  setPlaylists(playlists: Playlist[]): void {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  },

  addPlaylist(name: string): Playlist {
    const playlists = this.getPlaylists();
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      videos: [],
      createdAt: new Date().toISOString(),
    };
    playlists.push(newPlaylist);
    this.setPlaylists(playlists);
    return newPlaylist;
  },

  deletePlaylist(id: string): void {
    const playlists = this.getPlaylists().filter((p) => p.id !== id);
    this.setPlaylists(playlists);
  },

  addVideoToPlaylist(playlistId: string, video: any): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist) {
      if (!playlist.videos.find((v) => v.id === video.id)) {
        playlist.videos.unshift(video);
        this.setPlaylists(playlists);
      }
    }
  },

  removeVideoFromPlaylist(playlistId: string, videoId: string): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist) {
      playlist.videos = playlist.videos.filter((v) => v.id !== videoId);
      this.setPlaylists(playlists);
    }
  },

  getWatchProgress(): WatchProgress[] {
    const data = localStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS);
    return data ? JSON.parse(data) : [];
  },

  setWatchProgress(progress: WatchProgress[]): void {
    localStorage.setItem(STORAGE_KEYS.WATCH_PROGRESS, JSON.stringify(progress));
  },

  updateWatchProgress(videoId: string, progress: number, video: any): void {
    let progressList = this.getWatchProgress();
    const existingIndex = progressList.findIndex((p) => p.videoId === videoId);

    if (progress > 0.95) {
      if (existingIndex !== -1) {
        progressList.splice(existingIndex, 1);
      }
      supabaseService.removeWatchHistory(videoId);
    } else {
      const watchProgress: WatchProgress = {
        videoId,
        progress,
        timestamp: Date.now(),
        video,
      };

      if (existingIndex !== -1) {
        progressList[existingIndex] = watchProgress;
      } else {
        progressList.unshift(watchProgress);
      }

      progressList = progressList.slice(0, 20);

      supabaseService.syncWatchHistory(videoId, progress, video);
    }

    this.setWatchProgress(progressList);
  },

  removeWatchProgress(videoId: string): void {
    const progressList = this.getWatchProgress().filter((p) => p.videoId !== videoId);
    this.setWatchProgress(progressList);
    supabaseService.removeWatchHistory(videoId);
  },

  getDeviceId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  },

  setDeviceId(deviceId: string): void {
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  },
};
