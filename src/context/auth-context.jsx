import React, { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import authService from "../services/authService";
import rbacService from "../services/rbacService";
import { setAuthToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // ensure header is set
        setAuthToken(token);
        const me = await authService.me();

        // Fetch RBAC info
        try {
          const rbac = await rbacService.fetchAllowedRoutes();
          if (mounted) {
            setAllowedRoutes(rbac.allowed_routes || []);
            setIsAdmin(rbac.is_admin || false);
            setRoles(rbac.roles || []);
          }
        } catch (err) {
          console.error("RBAC init failed", err);
        }

        if (mounted) setUser(me);
      } catch (err) {
        // token invalid -> clear
        localStorage.removeItem("token");
        setAuthToken(null);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const { token, user: u } = await authService.login(credentials);
    window.localStorage.setItem("token", token);
    setAuthToken(token);

    // Fetch RBAC info after login
    try {
      const rbac = await rbacService.fetchAllowedRoutes();
      setAllowedRoutes(rbac.allowed_routes || []);
      setIsAdmin(rbac.is_admin || false);
      setRoles(rbac.roles || []);
    } catch (err) {
      console.error("RBAC login fetch failed", err);
    }

    setUser(u);
    return u;
  };

  const register = async (payload) => {
    const { user: u } = await authService.register(payload);
    setUser(u);
    return u;
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem("token");
    setUser(null);
    setAllowedRoutes([]);
    setIsAdmin(false);
    setRoles([]);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    allowedRoutes,
    isAdmin,
    roles,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthProvider;
