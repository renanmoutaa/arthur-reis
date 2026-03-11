export interface User {
  id?: string;
  username: string;
  password?: string;
  name: string;
  role: 'ADMIN' | 'VIEWER';
  email?: string;
  createdAt?: string;
}

const CURRENT_USER_KEY = 'biblioteca_current_user';
const TOKEN_KEY = 'biblioteca_token';
const API_URL = `http://${window.location.hostname}:3000`;

export const authUtils = {
  // Inicializa com usuários padrão chamando a API caso não existam no banco
  initDefaultUser: async () => {
    try {
      // Tentamos criar o admin padrão caso seja a primeira vez
      await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: 'admin',
          password: 'Bib@2026',
          name: 'Administrador',
          role: 'ADMIN'
        })
      });

      // E o viewer padrão
      await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: 'viewer',
          password: 'viewer123',
          name: 'Visitante',
          role: 'VIEWER'
        })
      });
    } catch (e) {
      // Falha silenciosa se eles já existem (Conflict exceptions)
    }
  },

  // Faz login
  login: async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem(TOKEN_KEY, data.access_token);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  },

  // Faz logout
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  // Pega o token atual
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Verifica se está logado
  isAuthenticated: (): boolean => {
    return localStorage.getItem(TOKEN_KEY) !== null;
  },

  // Retorna usuário atual
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verifica se é admin
  isAdmin: (): boolean => {
    const user = authUtils.getCurrentUser();
    return user?.role === 'ADMIN';
  }
};