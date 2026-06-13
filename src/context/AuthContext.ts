import { createContext, useContext } from 'react';
import { IAuthUser, ILoginResponse, IUser } from '../components/types';

interface AuthContextType {
  authToken: string | null;
  userData: IUser | null;
  login: (data: ILoginResponse) => void;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  isLoading: boolean;
  authUser: IAuthUser | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
