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

// Agora o User inclui documentId
export interface User {
  id: number;
  documentId: string;
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
    const data = localStorage.getItem(localStorageKeys.user);
    if (data) {
      setUser(JSON.parse(data));
    }
    setLoading(false);
  }, []);

  const isAuthenticated = !!user.id;

  const login = async (identifier: string, password: string) => {
    try {
      const { jwt, refreshToken = '', user: loginUser } =
        await loginService(identifier, password);

      // salve tokens e user (com documentId) no localStorage
      localStorage.setItem(localStorageKeys.accessToken, jwt);
      localStorage.setItem(localStorageKeys.refreshToken, refreshToken);
      localStorage.setItem(localStorageKeys.user, JSON.stringify(loginUser));
      localStorage.setItem(
        localStorageKeys.userDocumentId,
        loginUser.documentId
      );

      // atualiza o contexto com o objeto completo
      setUser(loginUser);
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(localStorageKeys.user);
    localStorage.removeItem(localStorageKeys.accessToken);
    localStorage.removeItem(localStorageKeys.refreshToken);
    localStorage.removeItem(localStorageKeys.userDocumentId);
    setUser({} as User);
    // redirect('/login');
  };

  // Rotas que não precisam de auth
  const publicRoutes = ['/login', '/'];

  if (loading) return null; // ou um loading spinner

  /*
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    redirect('/login');
  }
  */

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export const useAuth = () => useContext(AuthContext);
