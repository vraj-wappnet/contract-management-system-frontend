import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

// Auth state is defined in the store

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[];
}

export const useAuth = () => {
  const { isAuthenticated, user, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  return {
    isAuthenticated,
    user,
    loading,
    error,
    isAdmin: user?.roles?.includes('ADMIN') || false,
  };
};
