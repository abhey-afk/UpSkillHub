import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';

const AppInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { token, logout, login } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (token) {
          // Verify the token is still valid by getting user profile
          const response = await authAPI.getProfile();
          const user = response.data.data.user;
          
          // Update user data in case it changed
          login(user, token);
        }
      } catch (error) {
        console.log('Token validation failed:', error);
        // Token is invalid, clear auth state
        logout();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [token, login, logout]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AppInitializer;
