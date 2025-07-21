import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useApolloClient, useQuery, gql } from "@apollo/client";
import { SessionStorage } from "../utils/session-storage";

export interface AuthContextType {
  user: {
    id: string;
    username: string;
    email: string;
    role: "admin" | "user";
  } | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
    }
  }
`;

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const client = useApolloClient();

  const { refetch: fetchUserData } = useQuery(GET_ME, {
    skip: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const loadUser = async () => {
        try {
          const { data } = await fetchUserData();
          if (data?.me) {
            setUser(data.me);
            setIsAuthenticated(true);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          logout();
        }
      };

      loadUser();
    }
  }, []);

  const login = (token: string) => {
    SessionStorage.set("token", token);
    setIsAuthenticated(true);

    const fetchAndSetUser = async () => {
      try {
        const { data } = await fetchUserData();
        if (data?.me) {
          setUser({ ...data.me, role: "user" });
          navigate("/");
        } else {
          logout();
        }
      } catch (error) {
        console.error("Error fetching user data after login:", error);
        logout();
      }
    };

    fetchAndSetUser();
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    client.resetStore();
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
