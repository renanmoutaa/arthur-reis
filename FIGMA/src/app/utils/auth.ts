export interface User {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'viewer';
  email?: string;
  createdAt: string;
}

const USERS_KEY = 'biblioteca_users';
const CURRENT_USER_KEY = 'biblioteca_current_user';

export const authUtils = {
  // Inicializa com usuários padrão
  initDefaultUser: () => {
    const users = localStorage.getItem(USERS_KEY);
    if (!users) {
      const defaultUsers: User[] = [
        {
          username: 'admin',
          password: 'admin123',
          name: 'Administrador',
          role: 'admin',
          email: 'admin@biblioteca.com',
          createdAt: new Date().toISOString()
        },
        {
          username: 'viewer',
          password: 'viewer123',
          name: 'Visitante',
          role: 'viewer',
          email: 'viewer@biblioteca.com',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
  },

  // Faz login
  login: (username: string, password: string): boolean => {
    const usersStr = localStorage.getItem(USERS_KEY);
    if (!usersStr) return false;

    const users: User[] = JSON.parse(usersStr);
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ 
        username: user.username, 
        name: user.name,
        role: user.role,
        email: user.email
      }));
      return true;
    }
    return false;
  },

  // Faz logout
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Verifica se está logado
  isAuthenticated: (): boolean => {
    return localStorage.getItem(CURRENT_USER_KEY) !== null;
  },

  // Retorna usuário atual
  getCurrentUser: (): { username: string; name: string; role: 'admin' | 'viewer'; email?: string } | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verifica se é admin
  isAdmin: (): boolean => {
    const user = authUtils.getCurrentUser();
    return user?.role === 'admin';
  },

  // Registra novo usuário (apenas admin)
  register: (username: string, password: string, name: string, role: 'admin' | 'viewer', email?: string): boolean => {
    if (!authUtils.isAdmin()) return false;

    const usersStr = localStorage.getItem(USERS_KEY);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.find(u => u.username === username)) {
      return false; // Usuário já existe
    }

    users.push({ 
      username, 
      password, 
      name, 
      role,
      email,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  },

  // Lista todos os usuários (apenas admin)
  getAllUsers: (): User[] => {
    if (!authUtils.isAdmin()) return [];
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  // Atualiza usuário
  updateUser: (username: string, updates: Partial<User>): boolean => {
    const currentUser = authUtils.getCurrentUser();
    if (!currentUser) return false;

    // Apenas admin pode atualizar outros usuários
    if (currentUser.username !== username && !authUtils.isAdmin()) {
      return false;
    }

    const usersStr = localStorage.getItem(USERS_KEY);
    if (!usersStr) return false;

    const users: User[] = JSON.parse(usersStr);
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex === -1) return false;

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      username: users[userIndex].username, // Não permite alterar username
      createdAt: users[userIndex].createdAt // Mantém data de criação
    };

    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Atualiza sessão se for o usuário atual
    if (currentUser.username === username) {
      const updatedUser = users[userIndex];
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role,
        email: updatedUser.email
      }));
    }

    return true;
  },

  // Deleta usuário (apenas admin)
  deleteUser: (username: string): boolean => {
    if (!authUtils.isAdmin()) return false;

    const currentUser = authUtils.getCurrentUser();
    if (currentUser?.username === username) {
      return false; // Não pode deletar a si mesmo
    }

    const usersStr = localStorage.getItem(USERS_KEY);
    if (!usersStr) return false;

    const users: User[] = JSON.parse(usersStr);
    const filtered = users.filter(u => u.username !== username);

    if (filtered.length === users.length) return false;

    localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
    return true;
  }
};