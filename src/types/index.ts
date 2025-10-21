export interface Video {
  id: string;
  assetId?: string;
  title: string;
  subtitle?: string;
  description: string;
  illustration: {
    l: string;
  };
  duration: number;
  publishedFrom?: string;
  publishedTo?: string;
  type: 'VIDEO' | 'LIVE';
  resourceType?: 'MEDIA' | 'PROGRAM';
  programId?: string;
  casting?: Array<{
    firstname: string;
    lastname: string;
    role: string;
    rank?: string;
  }>;
  category?: string;
  channel?: string;
  isAudioOnly?: boolean;
}

export interface Program {
  id: string;
  title: string;
  label?: string;
  illustration?: {
    l: string;
  };
  path?: string;
  contentPath?: string;
}

export interface Channel {
  id: string;
  label: string;
  logo: string;
  description?: string;
}

export interface LiveProgram {
  id: string;
  external_id?: string;
  title: string;
  subtitle?: string;
  description: string;
  channel: {
    label: string;
  } | string;
  start_date: string;
  end_date: string;
  is_live: boolean;
  drm: boolean;
  images: {
    illustration: {
      '16x9': {
        '1248x702': string;
      };
    };
  };
  url_streaming: {
    url_hls?: string;
    url_dash?: string;
  };
  geolock: {
    title: string;
  };
}

export interface Playlist {
  id: string;
  name: string;
  videos: Video[];
  createdAt: string;
}

export interface WatchProgress {
  videoId: string;
  progress: number;
  timestamp: number;
  video: Video;
}

export interface AuthTokens {
  rtbfToken?: string;
  redbeeToken?: string;
  idToken?: string;
  uid?: string;
  expiresAt?: number;
}

export interface UserSettings {
  rtbfEmail?: string;
  rtbfPassword?: string;
}

export interface VideoFormat {
  format: string;
  mediaLocator: string;
  drm?: {
    'com.widevine.alpha'?: {
      licenseServerUrl: string;
      certificateUrl?: string;
    };
  };
}

export interface TVGuideProgram {
  id: string;
  title: string;
  subtitle?: string;
  channel: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  assetId?: string;
  description?: string;
  illustration?: string;
}

export interface Platform {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logo_url?: string;
  requires_auth: boolean;
  is_active: boolean;
  auth_type: 'gigya' | 'oauth' | 'simple' | 'none';
  primary_color: string;
  category: 'national' | 'local' | 'radio';
  created_at: string;
  updated_at: string;
}

export interface UserPlatformAuth {
  id: string;
  user_id: string;
  platform_id: string;
  is_authenticated: boolean;
  auth_data: Record<string, any>;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformFavorite {
  id: string;
  user_id: string;
  platform_id: string;
  content_id: string;
  content_type: 'video' | 'live' | 'program';
  content_data: Record<string, any>;
  created_at: string;
}

export interface PlatformWatchHistory {
  id: string;
  user_id: string;
  platform_id: string;
  content_id: string;
  content_type: 'video' | 'live' | 'program';
  content_data: Record<string, any>;
  progress: number;
  duration: number;
  last_watched_at: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformContent {
  id: string;
  platformSlug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  type: 'video' | 'live' | 'program';
  url?: string;
  publishedAt?: string;
}
