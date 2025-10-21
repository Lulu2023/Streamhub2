import type { PlatformContent } from '../../types';

const RTLPLAY_BASE = 'https://www.rtlplay.be';
const LFVP_API = 'https://lfvp-api.dpgmedia.net';

interface RTLPlayCategory {
  id: string;
  title: string;
  teasers: Array<{
    detailId: string;
    title: string;
    description?: string;
    imageUrl: string;
  }>;
}

export const rtlplayAPI = {
  requiresAuth: true,

  async getCategories(): Promise<RTLPlayCategory[]> {
    try {
      const params = new URLSearchParams({
        itemsPerSwimlane: '20',
        defaultImageOrientation: 'landscape',
        hideBannerRow: 'true',
      });

      const response = await fetch(`${LFVP_API}/RTL_PLAY/storefronts/accueil?${params}`, {
        headers: {
          'User-Agent': 'RTL_PLAY/22.251009',
          'Accept': '*/*',
        },
      });

      const data = await response.json();
      const categories: RTLPlayCategory[] = [];

      for (const row of data.rows || []) {
        if (['SWIMLANE_DEFAULT', 'SWIMLANE_PORTRAIT', 'SWIMLANE_LANDSCAPE'].includes(row.rowType)) {
          categories.push({
            id: row.id.toString(),
            title: row.title.trim(),
            teasers: row.teasers || [],
          });
        }
      }

      return categories;
    } catch (error) {
      console.error('Erreur RTLPlay categories:', error);
      return [];
    }
  },

  async getCategoryContent(categoryId: string): Promise<PlatformContent[]> {
    try {
      const response = await fetch(`${LFVP_API}/RTL_PLAY/storefronts/accueil/detail/${categoryId}`, {
        headers: {
          'User-Agent': 'RTL_PLAY/22.251009',
          'Accept': '*/*',
        },
      });

      const data = await response.json();
      const teasers = data.row?.teasers || [];

      return teasers.map((teaser: any) => ({
        id: teaser.detailId,
        platformSlug: 'rtlplay',
        title: teaser.title,
        description: teaser.description,
        thumbnail: teaser.imageUrl,
        type: 'program' as const,
      }));
    } catch (error) {
      console.error('Erreur RTLPlay category content:', error);
      return [];
    }
  },

  async searchContent(query: string): Promise<PlatformContent[]> {
    try {
      const response = await fetch(`${LFVP_API}/RTL_PLAY/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'RTL_PLAY/22.251009',
          'Accept': '*/*',
        },
      });

      const data = await response.json();
      const results: PlatformContent[] = [];

      for (const result of data.results || []) {
        if (result.type === 'exact') {
          for (const teaser of result.teasers || []) {
            results.push({
              id: teaser.detailId,
              platformSlug: 'rtlplay',
              title: teaser.title,
              description: teaser.description,
              thumbnail: teaser.imageUrl,
              type: 'program' as const,
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Erreur RTLPlay search:', error);
      return [];
    }
  },

  async getLiveChannels(): Promise<PlatformContent[]> {
    const channels = [
      { id: 'tvi', name: 'RTL-TVI', logo: '/logos/rtl-tvi.png' },
      { id: 'club', name: 'Club RTL', logo: '/logos/club-rtl.png' },
      { id: 'plug', name: 'Plug RTL', logo: '/logos/plug-rtl.png' },
      { id: 'rtl_info', name: 'RTL Info', logo: '/logos/rtl-info.png' },
      { id: 'rtl_sport', name: 'RTL Sport', logo: '/logos/rtl-sport.png' },
    ];

    return channels.map(channel => ({
      id: channel.id,
      platformSlug: 'rtlplay',
      title: channel.name,
      thumbnail: channel.logo,
      type: 'live' as const,
    }));
  },
};
