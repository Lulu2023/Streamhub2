import { rtbfAPI } from './rtbf-api';
import { rtlplayAPI } from './platforms/rtlplay-api';
import { ln24API } from './platforms/ln24-api';
import { localTVAPI } from './platforms/local-tv-api';
import { platformsService } from './platforms-service';
import type { Platform, PlatformContent } from '../types';

export interface UnifiedStream {
  url: string;
  type: 'hls' | 'dash' | 'mp4';
  drm?: {
    licenseUrl: string;
    type: 'widevine';
  };
}

export const unifiedPlatformsAPI = {
  async getLiveStream(platformSlug: string, channelId?: string): Promise<UnifiedStream> {
    switch (platformSlug) {
      case 'rtbf': {
        if (!channelId) throw new Error('Channel ID required for RTBF');
        const streamData = await rtbfAPI.getVideoStream(channelId);
        const dashFormat = streamData.formats.find((f: any) => f.format === 'dash');
        if (!dashFormat) throw new Error('No DASH format available');

        return {
          url: dashFormat.mediaLocator,
          type: 'dash',
          drm: dashFormat.drm?.['com.widevine.alpha'] ? {
            licenseUrl: dashFormat.drm['com.widevine.alpha'].licenseServerUrl,
            type: 'widevine',
          } : undefined,
        };
      }

      case 'ln24': {
        const stream = await ln24API.getLiveStream();
        return {
          url: stream.url,
          type: stream.type,
        };
      }

      case 'rtlplay': {
        throw new Error('RTL Play nécessite une authentification');
      }

      default: {
        if (localTVAPI.getSupportedPlatforms().includes(platformSlug)) {
          const stream = await localTVAPI.getLiveStream(platformSlug);
          return {
            url: stream.url,
            type: stream.type,
          };
        }
        throw new Error(`Plateforme non supportée: ${platformSlug}`);
      }
    }
  },

  async searchContent(platformSlug: string, query: string): Promise<PlatformContent[]> {
    try {
      switch (platformSlug) {
        case 'rtbf':
          const rtbfResults = await rtbfAPI.search(query);
          return this.convertRTBFResults(rtbfResults);

        case 'rtlplay':
          return await rtlplayAPI.searchContent(query);

        case 'ln24':
          return await ln24API.searchContent(query);

        default:
          return [];
      }
    } catch (error) {
      console.error(`Erreur recherche ${platformSlug}:`, error);
      return [];
    }
  },

  async getPlatformContent(platformSlug: string, category?: string): Promise<PlatformContent[]> {
    try {
      switch (platformSlug) {
        case 'rtbf': {
          const homeData = await rtbfAPI.getHomePage();
          return this.convertRTBFHomeData(homeData);
        }

        case 'rtlplay': {
          const categories = await rtlplayAPI.getCategories();
          if (category) {
            return await rtlplayAPI.getCategoryContent(category);
          }
          return this.convertRTLPlayCategories(categories);
        }

        case 'ln24': {
          return await ln24API.getPrograms();
        }

        default: {
          if (localTVAPI.getSupportedPlatforms().includes(platformSlug)) {
            return await localTVAPI.getPrograms(platformSlug);
          }
          return [];
        }
      }
    } catch (error) {
      console.error(`Erreur contenu ${platformSlug}:`, error);
      return [];
    }
  },

  async getAllAvailablePlatforms(): Promise<Platform[]> {
    return await platformsService.getAllPlatforms();
  },

  async getPlatformBySlug(slug: string): Promise<Platform | null> {
    return await platformsService.getPlatformBySlug(slug);
  },

  convertRTBFResults(results: any): PlatformContent[] {
    const content: PlatformContent[] = [];

    if (results?.data?.results) {
      for (const item of results.data.results) {
        if (item.type === 'VIDEO' || item.type === 'MEDIA') {
          content.push({
            id: item.id,
            platformSlug: 'rtbf',
            title: item.title,
            description: item.description,
            thumbnail: item.illustration?.l,
            duration: item.duration,
            type: 'video',
          });
        } else if (item.type === 'PROGRAM') {
          content.push({
            id: item.id,
            platformSlug: 'rtbf',
            title: item.title || item.label,
            description: item.description,
            thumbnail: item.illustration?.l,
            type: 'program',
          });
        }
      }
    }

    return content;
  },

  convertRTBFHomeData(homeData: any): PlatformContent[] {
    const content: PlatformContent[] = [];

    if (homeData?.data?.widgets) {
      for (const widget of homeData.data.widgets) {
        if (widget.type === 'CATEGORY_LIST' && widget.content) {
          for (const category of widget.content.slice(0, 5)) {
            if (category.loadedContent) {
              for (const item of category.loadedContent.slice(0, 6)) {
                content.push({
                  id: item.id,
                  platformSlug: 'rtbf',
                  title: item.title,
                  description: item.description,
                  thumbnail: item.illustration?.l,
                  type: item.type === 'PROGRAM' ? 'program' : 'video',
                });
              }
            }
          }
        }
      }
    }

    return content;
  },

  convertRTLPlayCategories(categories: any[]): PlatformContent[] {
    const content: PlatformContent[] = [];

    for (const category of categories.slice(0, 5)) {
      for (const teaser of (category.teasers || []).slice(0, 6)) {
        content.push({
          id: teaser.detailId,
          platformSlug: 'rtlplay',
          title: teaser.title,
          description: teaser.description,
          thumbnail: teaser.imageUrl,
          type: 'program',
        });
      }
    }

    return content;
  },
};
