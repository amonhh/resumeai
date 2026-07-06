import React, { createContext, useContext, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/react';
import { setAuthToken } from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isSignedIn, isLoaded: isAuthLoaded, signOut, getToken } = useClerkAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      getToken().then(token => {
        if (token) setAuthToken(token);
      });
    } else {
      setAuthToken(null);
    }
  }, [isSignedIn, getToken]);

  const isLoadingAuth = !isAuthLoaded || !isUserLoaded;

  const value = {
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName,
      role: 'user',
    } : null,
    isAuthenticated: !!isSignedIn,
    isLoadingAuth,
    isLoadingPublicSettings: false,
    authError: null,
    appPublicSettings: null,
    logout: (shouldRedirect = true) => {
      signOut();
      if (shouldRedirect) window.location.href = '/';
    },
    navigateToLogin: () => {
      window.location.href = '/';
    },
    checkAppState: () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
