import { createContext, useContext } from 'react';
import { IAuthUser } from '../components/types';

interface AuthContextType {
  authToken: string | null;
  authUsername: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  login: (data: any) => void;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  isLoading: boolean;
  user: IAuthUser | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
