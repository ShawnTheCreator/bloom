import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  userRole: string | null;
  setUserRole: (role: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  userRole: null,
  setUserRole: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};
