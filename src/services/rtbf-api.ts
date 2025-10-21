import { getRandomUUID } from '../utils/helpers';
import { storage } from '../utils/storage';

const GIGYA_API_KEY = '3_kWKuPgcdAybqnqxq_MvHVk0-6PN8Zk8pIIkJM_yXOu-qLPDDsGOtIDFfpGivtbeO';
const IS_DEV = import.meta.env.DEV;
const REDBEE_BASE_URL = IS_DEV ? '/api/redbee' : 'https://exposure.api.redbee.live/v2/customer/RTBF/businessunit/Auvio';
const RTBF_LOGIN_URL = IS_DEV ? '/api/login' : 'https://login.rtbf.be/accounts.login';
const RTBF_GETJWT_URL = IS_DEV ? '/api/getjwt' : 'https://login.rtbf.be/accounts.getJWT';
const AUTH_SERVICE_API_TOKEN = IS_DEV ? '/api/auth-service/oauth/v1/token' : 'https://auth-service.rtbf.be/oauth/v1/token';
const AUVIO_PAGES_URL = IS_DEV ? '/api/auvio/pages' : 'https://bff-service.rtbf.be/auvio/v1.23/pages';
const SEARCH_URL = IS_DEV ? '/api/auvio/search' : 'https://bff-service.rtbf.be/auvio/v1.23/search';
const PARTNER_KEY = '82ed2c5b7df0a9334dfbda21eccd8427';
const PROGRAM_API_URL = IS_DEV ? '/api/partner/generic/media/objectlist' : 'https://www.rtbf.be/api/partner/generic/media/objectlist';
const EPG_BASE_URL = IS_DEV ? '/api/partner' : 'https://www.rtbf.be/api/partner';

function getDeviceId(): string {
  let deviceId = storage.getDeviceId();
  if (!deviceId) {
    deviceId = getRandomUUID();
    storage.setDeviceId(deviceId);
  }
  return deviceId;
}

export const rtbfAPI = {
  async login(email: string, password: string) {
    try {
      const params = new URLSearchParams({
        loginID: email,
        password: password,
        apiKey: GIGYA_API_KEY,
        format: 'json',
        lang: 'fr',
      });

      const response = await fetch(`${RTBF_LOGIN_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const text = await response.text();

      if (!text || text.trim() === '') {
        throw new Error('Réponse vide du serveur');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Erreur de parsing JSON:', text);
        throw new Error('Réponse invalide du serveur');
      }

      if (data.errorCode !== 0) {
        throw new Error(data.errorMessage || 'Login échoué');
      }

      if (data.statusCode !== 200) {
        throw new Error(`Code de statut login: ${data.statusCode}`);
      }

      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async getJWT(loginToken: string) {
    try {
      const params = new URLSearchParams({
        apiKey: GIGYA_API_KEY,
        login_token: loginToken,
        format: 'json',
      });

      const response = await fetch(`${RTBF_GETJWT_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data.errorCode !== 0) {
        throw new Error(data.errorMessage || 'JWT fetch failed');
      }

      if (data.statusCode !== 200) {
        throw new Error(`JWT status code: ${data.statusCode}`);
      }

      return data;
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Erreur lors de la récupération du JWT.');
      }
      throw error;
    }
  },

  async getRedbeeSession(rtbfJWT: string) {
    try {
      const deviceId = getDeviceId();
      const response = await fetch(`${REDBEE_BASE_URL}/auth/gigyaLogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          jwt: rtbfJWT,
          device: {
            deviceId: deviceId,
            name: '',
            type: 'WEB',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Redbee session error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.sessionToken) {
        throw new Error('No session token received from Redbee');
      }

      return data;
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Erreur lors de la création de la session Redbee.');
      }
      throw error;
    }
  },

  async getRTBFToken(idToken: string) {
    try {
      const response = await fetch(AUTH_SERVICE_API_TOKEN, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'gigya',
          client_id: '94efc52c-f55f-4c40-84fc-b4b5bd7de3ca',
          client_secret: 'gVF7hFScJrDGwWu9uzu0mYdlKXxBKASczO2Q6K3y',
          platform: 'WEB',
          device_id: getDeviceId(),
          token: idToken,
          scope: 'visitor',
        }),
      });

      if (!response.ok) {
        throw new Error(`RTBF token error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new Error('No access token received');
      }

      return data;
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Erreur lors de la récupération du token RTBF.');
      }
      throw error;
    }
  },

  async authenticateComplete(email: string, password: string) {
    try {
      const loginData = await this.login(email, password);

      if (!loginData.sessionInfo || !loginData.sessionInfo.cookieValue) {
        throw new Error('Pas de cookie de session reçu');
      }

      const jwtData = await this.getJWT(loginData.sessionInfo.cookieValue);

      if (!jwtData.id_token) {
        throw new Error('Pas de token ID reçu');
      }

      const idToken = jwtData.id_token;

      const [redbeeData, rtbfToken] = await Promise.all([
        this.getRedbeeSession(idToken),
        this.getRTBFToken(idToken)
      ]);

      const tokens = {
        rtbfToken: rtbfToken.access_token,
        redbeeToken: redbeeData.sessionToken,
        idToken: idToken,
        uid: loginData.UID,
        expiresAt: Date.now() + 3600 * 1000,
      };

      storage.setAuthTokens(tokens);
      return tokens;
    } catch (error: any) {
      console.error('Authentication error:', error);
      throw new Error(error.message || 'Erreur d\'authentification');
    }
  },

  async getHomePage() {
    const params = new URLSearchParams({
      userAgent: 'Chrome-web-3.0',
    });

    const response = await fetch(`${AUVIO_PAGES_URL}/home?${params}`);
    const data = await response.json();

    if (data?.data?.widgets) {
      const categoryListWidget = data.data.widgets.find(
        (w: any) => w.type === 'CATEGORY_LIST'
      );

      if (categoryListWidget?.content) {
        const excludedCategories = ['Catégories', 'Sooner, plus de 1.700 films à découvrir'];
        const filteredCategories = categoryListWidget.content.filter(
          (cat: any) => !excludedCategories.includes(cat.title)
        );

        const categoriesWithContent = await Promise.all(
          filteredCategories.slice(0, 10).map(async (category: any) => {
            if (category.contentPath) {
              try {
                const categoryContent = await this.getContentByUrl(category.contentPath);
                return {
                  ...category,
                  loadedContent: categoryContent?.data?.content || [],
                };
              } catch (error) {
                console.error(`Error loading category ${category.title}:`, error);
                return category;
              }
            }
            return category;
          })
        );

        const categoryIndex = data.data.widgets.findIndex(
          (w: any) => w.type === 'CATEGORY_LIST'
        );
        if (categoryIndex !== -1) {
          data.data.widgets[categoryIndex].content = categoriesWithContent;
        }
      }
    }

    return data;
  },

  async getContentByUrl(url: string) {
    const params = new URLSearchParams({
      userAgent: 'Chrome-web-3.0',
    });

    const response = await fetch(`${url}?${params}`);
    return response.json();
  },

  async search(query: string) {
    const tokens = storage.getAuthTokens();
    if (!tokens?.rtbfToken || !tokens?.redbeeToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${SEARCH_URL}?query=${encodeURIComponent(query)}`, {
      headers: {
        'authorization': `Bearer ${tokens.rtbfToken}`,
        'x-rtbf-redbee': `Bearer ${tokens.redbeeToken}`,
        'referrer': 'https://auvio.rtbf.be/',
      },
    });

    return response.json();
  },

  async getVideoStream(assetId: string) {
    const tokens = storage.getAuthTokens();
    if (!tokens?.redbeeToken) {
      throw new Error('Non authentifié');
    }

    const params = new URLSearchParams({
      supportedFormats: 'dash,hls,mss,mp3,aac',
      supportedDrms: 'widevine',
    });

    const response = await fetch(
      `${REDBEE_BASE_URL}/entitlement/${assetId}/play?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${tokens.redbeeToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }

      if (response.status === 403 && errorData.message === 'NOT_ENTITLED') {
        return {
          httpCode: 403,
          message: 'NOT_ENTITLED',
          formats: [],
        };
      }

      throw new Error(`Erreur stream (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (!data.formats || data.formats.length === 0) {
      throw new Error('Aucun format vidéo disponible');
    }

    return data;
  },

  async getLiveChannels() {
    const baseUrl = IS_DEV ? '/api/partner' : 'https://www.rtbf.be/api/partner';
    const url = `${baseUrl}/generic/live/planninglist?target_site=media&origin_site=media&category_id=0&start_date=&offset=0&limit=15&partner_key=${PARTNER_KEY}&v=8`;
    const response = await fetch(url);
    return response.json();
  },

  async getLiveChannelDetails(channelId: string) {
    try {
      const channels = await this.getLiveChannels();
      const channel = channels.find((ch: any) =>
        ch.external_id === channelId || ch.id === channelId
      );
      return channel || null;
    } catch (error) {
      console.error('Error loading channel details:', error);
      return null;
    }
  },

  async getEPGChannelList() {
    try {
      const url = `${EPG_BASE_URL}/generic/epg/channellist?v=7&type=tv&partner_key=${PARTNER_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`EPG channel list error: ${response.status}`);
      }
      const channels = await response.json();
      return channels.filter((ch: any) => ch.type === 'tv');
    } catch (error) {
      console.error('Error loading EPG channel list:', error);
      return [];
    }
  },

  async getChannelSchedule(channelId: string, date: Date) {
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const params = new URLSearchParams({
        partner_key: PARTNER_KEY,
        v: '8',
        channel_id: channelId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      const url = `${EPG_BASE_URL}/generic/epg/programmelist?${params}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Channel schedule error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error loading channel schedule:', error);
      return [];
    }
  },

  async getTVGuide(date: Date = new Date()) {
    try {
      const channels = await this.getEPGChannelList();

      if (!channels || channels.length === 0) {
        return [];
      }

      const schedulePromises = channels.map((channel: any) =>
        this.getChannelSchedule(channel.id.toString(), date)
      );

      const schedules = await Promise.all(schedulePromises);

      const guide: any[] = [];
      channels.forEach((channel: any, index: number) => {
        const programs = schedules[index] || [];
        guide.push({
          channelId: channel.id,
          channelName: channel.name || channel.label || channel.title,
          channelLogo: channel.images?.cover?.['1x1']?.['370x370'],
          programs: programs.map((program: any) => ({
            id: program.id,
            title: program.title,
            subtitle: program.subtitle,
            description: program.description,
            startTime: program.start_date,
            endTime: program.end_date,
            isAvailable: program.is_available || false,
            assetId: program.external_id,
            illustration: program.images?.illustration?.['16x9']?.['1248x702'] || program.images?.illustration?.['16x9']?.['770x433'],
          })),
        });
      });

      return guide;
    } catch (error) {
      console.error('Error loading TV guide:', error);
      return [];
    }
  },

  async getProgramVideos(programId: string) {
    const params = new URLSearchParams({
      v: '8',
      program_id: programId,
      content_type: 'complete',
      type: 'video',
      target_site: 'mediaz',
      limit: '100',
      partner_key: PARTNER_KEY,
    });

    const response = await fetch(`${PROGRAM_API_URL}?${params}`);

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des vidéos du programme');
    }

    return response.json();
  },

  async getProgramDetails(programId: string) {
    const videos = await this.getProgramVideos(programId);

    if (videos.length === 0) {
      return null;
    }

    const firstVideo = videos[0];
    return {
      id: programId,
      title: firstVideo.program_title || firstVideo.title,
      description: firstVideo.program_description || firstVideo.description,
      illustration: firstVideo.images?.illustration?.['16x9']?.['1248x702'],
      videos: videos,
    };
  },

  async ensureAuthentication() {
    const tokens = storage.getAuthTokens();

    if (!tokens || !tokens.expiresAt || tokens.expiresAt < Date.now()) {
      const settings = storage.getUserSettings();

      if (settings?.rtbfEmail && settings?.rtbfPassword) {
        try {
          await this.authenticateComplete(settings.rtbfEmail, settings.rtbfPassword);
          return true;
        } catch (error) {
          console.error('Auto re-authentication failed:', error);
          return false;
        }
      }
      return false;
    }

    return true;
  },

  async getVideoDetails(videoId: string) {
    try {
      const cleanId = videoId.split('_')[0];
      const params = new URLSearchParams({
        v: '8',
        id: cleanId,
        partner_key: PARTNER_KEY,
      });

      const response = await fetch(`${PROGRAM_API_URL}?${params}`);

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des détails de la vidéo');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        return data[0];
      }

      return null;
    } catch (error) {
      console.error('Error loading video details:', error);
      return null;
    }
  },

  async getCategoryVideos(contentPath: string) {
    try {
      const data = await this.getContentByUrl(contentPath);
      return data?.data?.content || [];
    } catch (error) {
      console.error('Error loading category videos:', error);
      return [];
    }
  },
};
