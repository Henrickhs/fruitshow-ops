import { createContext, useContext, useMemo, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('fruitshow_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fruitshow_user');
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, password) {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('fruitshow_token', data.token);
    localStorage.setItem('fruitshow_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('fruitshow_token');
    localStorage.removeItem('fruitshow_user');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
