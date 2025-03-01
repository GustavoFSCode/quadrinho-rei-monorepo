/* eslint-disable react/jsx-no-constructed-context-values */
'use client';

import { localStorageKeys } from '@/utils/localStorageKeys';
import { redirect, usePathname } from 'next/navigation';
import {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { login as loginService } from '@/services/authService';

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface ILoginResponse {
  jwt: string;
  refreshToken: string;
  user: User;
}

interface IUserProvider {
  user: User;
  setUser: React.Dispatch<SetStateAction<User>>;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

interface ChildrenProps {
  children: ReactNode;
}

const AuthContext = createContext({} as IUserProvider);

const AuthProvider = ({ children }: ChildrenProps) => {
  const [user, setUser] = useState<User>({} as User);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const dataUser = localStorage.getItem(localStorageKeys.user);
    if (dataUser) {
      setUser(JSON.parse(dataUser));
    }
    setLoading(false);
  }, []);

  const isAuthenticated = !!user.id;

  const login = async (identifier: string, password: string) => {
    try {
      const { jwt, refreshToken = '', user: loginUser } = await loginService(identifier, password);
      // Armazena os tokens e o usuário no localStorage
      localStorage.setItem(localStorageKeys.accessToken, jwt);
      localStorage.setItem(localStorageKeys.refreshToken, refreshToken);
      localStorage.setItem(localStorageKeys.user, JSON.stringify(loginUser));
      // Atualiza o estado do usuário no contexto
      setUser(loginUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(localStorageKeys.user);
    localStorage.removeItem(localStorageKeys.accessToken);
    localStorage.removeItem(localStorageKeys.refreshToken);
    setUser({} as User);
    // Opcional: redirecionar para a tela de login após o logout
    // redirect('/login');
  };

  // Rotas públicas (ex: '/login', '/')
  const publicRoutes = ['/login', '/'];

  if (loading) {
    return null; // ou componente de loading
  }

  // Opcional: redirecionamento se a rota for protegida e o usuário não estiver autenticado
  /*
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    redirect('/login');
  }
  */

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
