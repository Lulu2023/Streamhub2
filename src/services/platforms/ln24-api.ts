import type { PlatformContent } from '../../types';

const LN24_ROOT = 'https://www.ln24.be';
const LN24_LIVE_URL = `${LN24_ROOT}/live`;

export const ln24API = {
  async getLiveStream(): Promise<{ url: string; type: 'hls' | 'mp4' }> {
    try {
      const response = await fetch(LN24_LIVE_URL);
      const html = await response.text();

      const embedUrlMatch = html.match(/"embedUrl":\s*"([^"]+)"/);

      if (embedUrlMatch && embedUrlMatch[1]) {
        const embedUrl = embedUrlMatch[1];
        const embedResponse = await fetch(embedUrl);
        const embedHtml = await embedResponse.text();

        const m3u8Match = embedHtml.match(/"src":\s*"([^"]*\.m3u8[^"]*)"/);
        if (m3u8Match && m3u8Match[1]) {
          return {
            url: m3u8Match[1].replace(/\\/g, ''),
            type: 'hls',
          };
        }
      }

      throw new Error('Impossible de trouver le flux vidéo');
    } catch (error) {
      console.error('Erreur LN24 live stream:', error);
      throw error;
    }
  },

  async getPrograms(): Promise<PlatformContent[]> {
    try {
      const response = await fetch(`${LN24_ROOT}/emissions`);
      const html = await response.text();

      const programs: PlatformContent[] = [];

      return programs;
    } catch (error) {
      console.error('Erreur LN24 programs:', error);
      return [];
    }
  },

  async searchContent(query: string): Promise<PlatformContent[]> {
    try {
      const response = await fetch(`${LN24_ROOT}/recherche?ft=${encodeURIComponent(query)}`);
      const html = await response.text();

      const results: PlatformContent[] = [];

      return results;
    } catch (error) {
      console.error('Erreur LN24 search:', error);
      return [];
    }
  },
};
