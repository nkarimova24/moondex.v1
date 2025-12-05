import axios from 'axios';
import Cookies from 'js-cookie';

// API URLs and keys
export const POKEMON_TCG_API_URL = 'https://api.pokemontcg.io/v2';
export const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api';
export const API_KEY = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY;

interface CacheEntry {
  data: any;
  timestamp: number;
}

const apiCache: Record<string, CacheEntry> = {};

export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000,
  MEDIUM: 30 * 60 * 1000,
  LONG: 60 * 60 * 1000,
  VERY_LONG: 24 * 60 * 60 * 1000,
};

//function to cache API responses
export const cacheRequest = async (
  url: string,
  fetchFunction: () => Promise<any>,
  duration: number = CACHE_DURATIONS.MEDIUM,
  forceRefresh: boolean = false
): Promise<any> => {
  const cacheKey = url;
  const now = Date.now();

  //if we have a cached response that hasn't expired and we're not forcing a refresh
  if (
    !forceRefresh &&
    apiCache[cacheKey] &&
    now - apiCache[cacheKey].timestamp < duration
  ) {
    console.log(`Using cached response for: ${url}`);
    return apiCache[cacheKey].data;
  }

  try {
    const result = await fetchFunction();

    apiCache[cacheKey] = {
      data: result,
      timestamp: now
    };

    return result;
  } catch (error) {
    //if we have a cached response and there's an error fetching, use the cached data
    if (apiCache[cacheKey]) {
      console.warn(`Error fetching fresh data for ${url}, using stale cache`);
      return apiCache[cacheKey].data;
    }
    throw error;
  }
};

//function to clear the entire cache or specific keys
export const clearCache = (keys?: string[]) => {
  if (keys && keys.length > 0) {
    keys.forEach(key => {
      delete apiCache[key];
    });
  } else {
    Object.keys(apiCache).forEach(key => {
      delete apiCache[key];
    });
  }
};

//laravel Auth API Client
export const authApiClient = axios.create({
  baseURL: LARAVEL_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

authApiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => Promise.reject(error)
);

authApiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.statusText, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error Response:', error.response?.status, error.response?.data, error.config?.url);
    console.error('Error details:', {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
      headers: error.config?.headers,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      validationErrors: error.response?.data?.errors,
      errorMessage: error.response?.data?.message
    });

    if (error.response?.status === 422 && error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }

    return Promise.reject(error);
  }
);

export const fetchWithAuth = async (url: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers['X-Api-Key'] = API_KEY;
  }

  return fetch(url, { headers });
};