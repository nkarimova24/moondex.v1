// API client setup for both Pokemon TCG API and Laravel backend
import axios from 'axios';
import Cookies from 'js-cookie';

// API URLs and keys
export const POKEMON_TCG_API_URL = 'https://api.pokemontcg.io/v2';
export const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api';
export const API_KEY = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY;

// Laravel Auth API Client
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
      console.log('Using auth token:', token.substring(0, 10) + '...');
      
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No auth token found');
    }
    return config;
  },
  (error) => Promise.reject(error)
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