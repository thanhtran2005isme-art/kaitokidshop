import type { User } from '../types';
import type { TokenResponseDTO, UserInfoDTO } from '../types/api';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const CURRENT_USER_KEY = 'currentUser';

export function mapSessionUser(user: UserInfoDTO): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || undefined,
    avatar: user.avatar || undefined,
    role: user.role.toLowerCase() === 'admin' ? 'admin' : 'user',
    createdAt: user.createdAt,
  };
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  saveSession(token: TokenResponseDTO): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, token.refreshToken);
    this.saveUser(token.user);
  },

  saveUser(userDto: UserInfoDTO): void {
    const user = mapSessionUser(userDto);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userType', user.role);
    localStorage.setItem('username', user.name || user.email);

    if (user.phone) localStorage.setItem('userPhone', user.phone);
    else localStorage.removeItem('userPhone');

    if (user.email) localStorage.setItem('userEmail', user.email);

    if (user.role === 'admin') {
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminUser', user.name || user.email);
    } else {
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminUser');
    }
  },

  clearSession(): void {
    [
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      CURRENT_USER_KEY,
      'userLoggedIn',
      'userType',
      'username',
      'userPhone',
      'userEmail',
      'adminLoggedIn',
      'adminUser',
      'rememberLogin',
    ].forEach(key => localStorage.removeItem(key));
  },
};
