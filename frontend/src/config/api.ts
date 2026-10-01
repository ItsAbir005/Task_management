import axios from 'axios';

const localApiUrl = 'http://localhost:3000';
export const API_URL = (import.meta.env.VITE_API_URL || localApiUrl).replace(/\/$/, '');

// Keep existing absolute API calls working while allowing Vercel to target Render.
axios.interceptors.request.use((request) => {
  if (request.url?.startsWith(localApiUrl)) {
    request.url = `${API_URL}${request.url.slice(localApiUrl.length)}`;
  }
  return request;
});
