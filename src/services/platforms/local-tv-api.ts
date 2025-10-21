import type { PlatformContent } from '../../types';

const FREECASTER_PLAYER = 'https://tvlocales-player.freecaster.com/embed/';

interface LocalTVConfig {
  name: string;
  rootUrl: string;
  liveUrl: string;
  hasReplay: boolean;
}

const LOCAL_TV_CONFIGS: Record<string, LocalTVConfig> = {
  antennecentre: {
    name: 'Antenne Centre',
    rootUrl: 'https://www.antennecentre.tv',
    liveUrl: 'https://www.antennecentre.tv/direct',
    hasReplay: false,
  },
  bouke: {
    name: 'Bouke',
    rootUrl: 'https://www.bouke.media',
    liveUrl: 'https://www.bouke.media/direct',
    hasReplay: true,
  },
  canalzoom: {
    name: 'Canal Zoom',
    rootUrl: 'https://www.canalzoom.be',
    liveUrl: 'https://www.canalzoom.be/direct',
    hasReplay: false,
  },
  matele: {
    name: 'Ma Télé',
    rootUrl: 'https://www.matele.be',
    liveUrl: 'https://live.matele.be/hls/live.m3u8',
    hasReplay: false,
  },
  notele: {
    name: 'No Télé',
    rootUrl: 'https://www.notele.be',
    liveUrl: 'https://www.notele.be/it105-md5-direct.html',
    hasReplay: false,
  },
  telesambre: {
    name: 'Télé Sambre',
    rootUrl: 'https://www.telesambre.be',
    liveUrl: 'https://www.telesambre.be/direct',
    hasReplay: true,
  },
  telemb: {
    name: 'Télé MB',
    rootUrl: 'https://www.telemb.be',
    liveUrl: 'https://www.telemb.be/direct',
    hasReplay: true,
  },
  tvlux: {
    name: 'TV Lux',
    rootUrl: 'https://www.tvlux.be',
    liveUrl: 'https://www.tvlux.be/live',
    hasReplay: true,
  },
};

async function extractLiveToken(html: string): Promise<string | null> {
  const tokenMatch = html.match(/"live_token":\s*"([^"]+)"/);
  return tokenMatch ? tokenMatch[1] : null;
}

async function getFreecasterStream(token: string): Promise<string | null> {
  try {
    const response = await fetch(`${FREECASTER_PLAYER}${token}.json`);
    const data = await response.json();
    return data?.video?.src?.[0]?.src || null;
  } catch (error) {
    console.error('Erreur Freecaster stream:', error);
    return null;
  }
}

export const localTVAPI = {
  async getLiveStream(platformSlug: string): Promise<{ url: string; type: 'hls' }> {
    const config = LOCAL_TV_CONFIGS[platformSlug];
    if (!config) {
      throw new Error(`Plateforme inconnue: ${platformSlug}`);
    }

    try {
      if (platformSlug === 'matele') {
        return {
          url: config.liveUrl,
          type: 'hls',
        };
      }

      const response = await fetch(config.liveUrl);
      const html = await response.text();

      if (platformSlug === 'notele') {
        const videoMatch = html.match(/<video[^>]+id="live"[^>]*>[\s\S]*?<source[^>]+src="([^"]+)"/);
        if (videoMatch && videoMatch[1]) {
          return {
            url: videoMatch[1],
            type: 'hls',
          };
        }
      } else {
        const token = await extractLiveToken(html);
        if (token) {
          const streamUrl = await getFreecasterStream(token);
          if (streamUrl) {
            return {
              url: streamUrl,
              type: 'hls',
            };
          }
        }
      }

      throw new Error('Impossible de trouver le flux vidéo');
    } catch (error) {
      console.error(`Erreur ${config.name} live stream:`, error);
      throw error;
    }
  },

  async getPrograms(platformSlug: string): Promise<PlatformContent[]> {
    const config = LOCAL_TV_CONFIGS[platformSlug];
    if (!config || !config.hasReplay) {
      return [];
    }

    try {
      const response = await fetch(config.rootUrl);
      const html = await response.text();

      return [];
    } catch (error) {
      console.error(`Erreur ${config.name} programs:`, error);
      return [];
    }
  },

  getSupportedPlatforms(): string[] {
    return Object.keys(LOCAL_TV_CONFIGS);
  },

  getPlatformConfig(platformSlug: string): LocalTVConfig | null {
    return LOCAL_TV_CONFIGS[platformSlug] || null;
  },
};
