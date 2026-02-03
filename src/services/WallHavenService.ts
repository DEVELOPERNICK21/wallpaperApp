/**
 * WallHaven API Service
 * Documentation: https://wallhaven.cc/help/api
 */

import axios from 'axios';

export interface WallHavenWallpaper {
  id: string;
  url: string;
  short_url: string;
  views: number;
  favorites: number;
  source: string;
  purity: 'sfw' | 'sketchy' | 'nsfw';
  category: 'general' | 'anime' | 'people';
  dimension_x: number;
  dimension_y: number;
  resolution: string;
  ratio: string;
  file_size: number;
  file_type: string;
  created_at: string;
  colors: string[];
  path: string; // Full resolution image URL
  thumbs: {
    large: string;
    original: string;
    small: string;
  };
  tags?: Array<{
    id: number;
    name: string;
    alias: string;
    category_id: number;
    category: string;
    purity: string;
    created_at: string;
  }>;
}

export interface WallHavenSearchParams {
  q?: string; // Search query
  categories?: string; // 100/101/111 (general/anime/people) - 1=on, 0=off
  purity?: string; // 100/110/111 (sfw/sketchy/nsfw) - 1=on, 0=off
  sorting?: 'date_added' | 'relevance' | 'random' | 'views' | 'favorites' | 'toplist';
  order?: 'desc' | 'asc';
  topRange?: '1d' | '3d' | '1w' | '1M' | '3M' | '6M' | '1y';
  atleast?: string; // Minimum resolution (e.g., "1920x1080")
  resolutions?: string; // Comma-separated exact resolutions
  ratios?: string; // Comma-separated aspect ratios (e.g., "16x9,16x10")
  colors?: string; // Color hex codes (e.g., "660000")
  page?: number;
  seed?: string; // For random sorting
  apikey?: string; // Optional API key for NSFW content
}

export interface WallHavenSearchResponse {
  data: WallHavenWallpaper[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    query?: string | null;
    seed?: string | null;
  };
}

const WALLHAVEN_API_BASE = 'https://wallhaven.cc/api/v1';

class WallHavenService {
  private apiKey: string | null = null;

  /**
   * Set API key for accessing NSFW content (optional)
   */
  setApiKey(key: string | null) {
    this.apiKey = key;
  }

  /**
   * Search wallpapers
   */
  async search(params: WallHavenSearchParams = {}): Promise<WallHavenSearchResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Add API key if available
      if (this.apiKey) {
        queryParams.append('apikey', this.apiKey);
      }

      // Add search parameters
      if (params.q) queryParams.append('q', params.q);
      if (params.categories) queryParams.append('categories', params.categories);
      if (params.purity) queryParams.append('purity', params.purity);
      if (params.sorting) queryParams.append('sorting', params.sorting);
      if (params.order) queryParams.append('order', params.order);
      if (params.topRange) queryParams.append('topRange', params.topRange);
      if (params.atleast) queryParams.append('atleast', params.atleast);
      if (params.resolutions) queryParams.append('resolutions', params.resolutions);
      if (params.ratios) queryParams.append('ratios', params.ratios);
      if (params.colors) queryParams.append('colors', params.colors);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.seed) queryParams.append('seed', params.seed);

      const url = `${WALLHAVEN_API_BASE}/search?${queryParams.toString()}`;
      
      console.log('🔍 WallHaven API Request:', url);
      
      const response = await axios.get<WallHavenSearchResponse>(url);
      
      console.log(`✅ WallHaven API Response: ${response.data.data.length} wallpapers found`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ WallHaven API Error:', error);
      
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a minute before trying again.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Invalid API key or NSFW content requires authentication.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch wallpapers');
    }
  }

  /**
   * Get wallpaper details by ID
   */
  async getWallpaper(id: string): Promise<WallHavenWallpaper> {
    try {
      const url = `${WALLHAVEN_API_BASE}/w/${id}${this.apiKey ? `?apikey=${this.apiKey}` : ''}`;
      
      const response = await axios.get<{data: WallHavenWallpaper}>(url);
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ WallHaven API Error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch wallpaper');
    }
  }

  /**
   * Get latest wallpapers (default search with no query)
   */
  async getLatest(params: Omit<WallHavenSearchParams, 'q'> = {}): Promise<WallHavenSearchResponse> {
    return this.search({
      ...params,
      sorting: params.sorting || 'date_added',
      order: params.order || 'desc',
      purity: params.purity || '100', // SFW only by default
      categories: params.categories || '111', // All categories
    });
  }

  /**
   * Get top wallpapers
   */
  async getTop(params: Omit<WallHavenSearchParams, 'q' | 'sorting'> = {}): Promise<WallHavenSearchResponse> {
    return this.search({
      ...params,
      sorting: 'toplist',
      order: params.order || 'desc',
      topRange: params.topRange || '1M',
      purity: params.purity || '100',
      categories: params.categories || '111',
    });
  }

  /**
   * Get random wallpapers
   */
  async getRandom(params: Omit<WallHavenSearchParams, 'q' | 'sorting'> = {}): Promise<WallHavenSearchResponse> {
    return this.search({
      ...params,
      sorting: 'random',
      purity: params.purity || '100',
      categories: params.categories || '111',
    });
  }

  /**
   * Search by category (maps to WallHaven categories)
   */
  async searchByCategory(
    category: 'general' | 'anime' | 'people',
    params: Omit<WallHavenSearchParams, 'categories'> = {}
  ): Promise<WallHavenSearchResponse> {
    const categoryMap = {
      general: '100',
      anime: '010',
      people: '001',
    };

    return this.search({
      ...params,
      categories: categoryMap[category],
      purity: params.purity || '100',
    });
  }
}

export default new WallHavenService();
