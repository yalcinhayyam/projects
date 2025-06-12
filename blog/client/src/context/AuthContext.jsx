import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useApolloClient, useQuery } from "@apollo/client";
import { GET_ME } from "../graphql";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
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

  const login = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);

    const fetchAndSetUser = async () => {
      try {
        const { data } = await fetchUserData();
        if (data?.me) {
          setUser(data.me);
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
    localStorage.removeItem("token");
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
