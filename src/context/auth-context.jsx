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
  const [companies, setCompanies] = useState([]);
  const [hasCompany, setHasCompany] = useState(false);
  const [companyRole, setCompanyRole] = useState(null);
  const [enterprisePermissions, setEnterprisePermissions] = useState(null);

  const applyContext = (ctx) => {
    const list = ctx?.companies || [];
    setCompanies(list);
    setHasCompany(ctx?.has_company ?? list.length > 0);
    setCompanyRole(list[0]?.role || null);
  };

  useEffect(() => {
    let mounted = true;

    async function init() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setAuthToken(token);
        const me = await authService.me();

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

        try {
          const ctx = await authService.meContext();
          if (mounted) {
            applyContext(ctx);
            const role = ctx?.companies?.[0]?.role;
            if (role) {
              try {
                const keys = await rbacService.fetchRolePermissions(`enterprise.${role}`);
                if (mounted) setEnterprisePermissions(keys);
              } catch (err) {
                console.error("fetchRolePermissions init failed", err);
                if (mounted) setEnterprisePermissions(new Set());
              }
            } else {
              setEnterprisePermissions(new Set());
            }
          }
        } catch (err) {
          console.error("meContext init failed", err);
          if (mounted) setEnterprisePermissions(new Set());
        }

        if (mounted) setUser(me);
      } catch (err) {
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

    try {
      const rbac = await rbacService.fetchAllowedRoutes();
      setAllowedRoutes(rbac.allowed_routes || []);
      setIsAdmin(rbac.is_admin || false);
      setRoles(rbac.roles || []);
    } catch (err) {
      console.error("RBAC login fetch failed", err);
    }

    try {
      const ctx = await authService.meContext();
      applyContext(ctx);
      const role = ctx?.companies?.[0]?.role;
      if (role) {
        try {
          const keys = await rbacService.fetchRolePermissions(`enterprise.${role}`);
          setEnterprisePermissions(keys);
        } catch (err) {
          console.error("fetchRolePermissions login failed", err);
          setEnterprisePermissions(new Set());
        }
      } else {
        setEnterprisePermissions(new Set());
      }
    } catch (err) {
      console.error("meContext login fetch failed", err);
      setEnterprisePermissions(new Set());
    }

    setUser(u);
    return u;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    const { token, user: u } = response;

    if (token) {
      window.localStorage.setItem("token", token);
      setAuthToken(token);

      try {
        const rbac = await rbacService.fetchAllowedRoutes();
        setAllowedRoutes(rbac.allowed_routes || []);
        setIsAdmin(rbac.is_admin || false);
        setRoles(rbac.roles || []);
      } catch (err) {
        console.error("RBAC register fetch failed", err);
      }

      try {
        const ctx = await authService.meContext();
        applyContext(ctx);
        const role = ctx?.companies?.[0]?.role;
        if (role) {
          try {
            const keys = await rbacService.fetchRolePermissions(`enterprise.${role}`);
            setEnterprisePermissions(keys);
          } catch (err) {
            console.error("fetchRolePermissions register failed", err);
            setEnterprisePermissions(new Set());
          }
        } else {
          setEnterprisePermissions(new Set());
        }
      } catch (err) {
        console.error("meContext register fetch failed", err);
        setEnterprisePermissions(new Set());
      }

      setUser(u);
    }

    return { ...response, user: u || null };
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem("token");
    setUser(null);
    setAllowedRoutes([]);
    setIsAdmin(false);
    setRoles([]);
    setCompanies([]);
    setHasCompany(false);
    setCompanyRole(null);
    setEnterprisePermissions(null);
  };

  const refreshContext = async () => {
    try {
      const ctx = await authService.meContext();
      applyContext(ctx);
      const role = ctx?.companies?.[0]?.role;
      if (role) {
        try {
          const keys = await rbacService.fetchRolePermissions(`enterprise.${role}`);
          setEnterprisePermissions(keys);
        } catch (err) {
          console.error("fetchRolePermissions refresh failed", err);
          setEnterprisePermissions(new Set());
        }
      } else {
        setEnterprisePermissions(new Set());
      }
    } catch (err) {
      console.error("refreshContext failed", err);
    }
  };

  const updateUser = async (data) => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
    return updatedUser;
  };

  const socialLogin = async (provider, token) => {
    const { token: jwtToken, user: u } = await authService.socialLogin(provider, token);
    window.localStorage.setItem("token", jwtToken);
    setAuthToken(jwtToken);

    try {
      const rbac = await rbacService.fetchAllowedRoutes();
      setAllowedRoutes(rbac.allowed_routes || []);
      setIsAdmin(rbac.is_admin || false);
      setRoles(rbac.roles || []);
    } catch (err) {
      console.error("RBAC social login fetch failed", err);
    }

    try {
      const ctx = await authService.meContext();
      applyContext(ctx);
      const role = ctx?.companies?.[0]?.role;
      if (role) {
        try {
          const keys = await rbacService.fetchRolePermissions(`enterprise.${role}`);
          setEnterprisePermissions(keys);
        } catch (err) {
          console.error("fetchRolePermissions socialLogin failed", err);
          setEnterprisePermissions(new Set());
        }
      } else {
        setEnterprisePermissions(new Set());
      }
    } catch (err) {
      console.error("meContext social login fetch failed", err);
      setEnterprisePermissions(new Set());
    }

    setUser(u);
    return u;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    allowedRoutes,
    isAdmin,
    roles,
    companies,
    hasCompany,
    companyRole,
    enterprisePermissions,
    login,
    register,
    logout,
    updateUser,
    socialLogin,
    refreshContext,
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
