const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export function authHeaders() {
  const token = localStorage.getItem('fruitshow_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function api(path, options = {}) {
  const headers = options.body instanceof FormData
    ? authHeaders()
    : { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers || {}) };

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao comunicar com a API.' }));
    throw new Error(error.message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function query(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const value = search.toString();
  return value ? `?${value}` : '';
}
