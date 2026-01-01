import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { t } = useLanguage();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const { allowedRoutes, isAdmin } = useAuth();

  // State for expanded groups
  const [expanded, setExpanded] = useState({});

  // Auth check
  const isAuthenticated = !!localStorage.getItem("token");

  const toggleGroup = (name) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  const allowedColors = new Set([
    "white", "blue-gray", "gray", "brown", "deep-orange", "orange", "amber", "yellow", "lime", "light-green", "green", "teal", "cyan", "light-blue", "blue", "indigo", "deep-purple", "purple", "pink", "red",
  ]);

  const activeColor = allowedColors.has(sidenavColor) ? sidenavColor : "blue-gray";

  // Filter routes based on RBAC
  const visibleRoutes = (routes || [])
    .filter((route) => {
      if (isAuthenticated && route.layout === "auth") return false;
      if (route.hidden) return false;
      return true;
    })
    .map((route) => ({
      ...route,
      pages: (route.pages || []).filter((page) => {
        if (page.hidden) return false;
        // If it has a key, check allowedRoutes
        if (page.key) {
          if (isAdmin) return true;
          return allowedRoutes.includes(page.key);
        }
        return true;
      }).map(page => {
        // Also filter children if any
        if (page.children) {
          return {
            ...page,
            children: page.children.filter(child => {
              if (child.key) {
                if (isAdmin) return true;
                return allowedRoutes.includes(child.key);
              }
              return true;
            })
          };
        }
        return page;
      }).filter(page => {
        // Hide parent if it has children and all are filtered out
        if (page.children && page.children.length === 0) return false;
        return true;
      }),
    }))
    .filter((route) => route.pages.length > 0 || route.layout === "auth");

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${openSidenav ? "translate-x-0" : "-translate-x-80"
        } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100 overflow-y-auto`}
    >
      <div className="relative">
        <Link to="/dashboard/home" className="py-1 px-8 text-center block">
          <img
            src="/img/logoanko.png"
            alt={t("sidenav.brand")}
            className="h-32 w-auto mx-auto object-contain"
          />
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>

      <div className="mx-4 mb-4 mt-0">
        {visibleRoutes.map(({ layout, title, pages }) => {
          const groupKey = `${layout || "layout"}-${title || "group"}`;

          return (
            <ul key={groupKey} className="mb-4 flex flex-col gap-1">
              {title && (
                <li className="mx-3.5 mt-4 mb-2">
                  <Typography
                    variant="small"
                    color={sidenavType === "dark" ? "white" : "blue-gray"}
                    className="font-black uppercase opacity-75"
                  >
                    {title}
                  </Typography>
                </li>
              )}

              {(pages || []).map(({ icon, name, path, children }) => {
                const label = name ?? path ?? "Untitled";
                const pageKey = `${layout || ""}${path || label}`;
                const hasChildren = children && children.length > 0;
                const isExpanded = !!expanded[name];

                if (hasChildren) {
                  return (
                    <li key={pageKey}>
                      <Button
                        variant="text"
                        color={sidenavType === "dark" ? "white" : "blue-gray"}
                        className="flex items-center justify-between gap-4 px-4 capitalize w-full"
                        fullWidth
                        onClick={() => toggleGroup(name)}
                      >
                        <div className="flex items-center gap-4">
                          {icon}
                          <Typography color="inherit" className="font-medium capitalize">
                            {t(`sidenav.${label}`) || label}
                          </Typography>
                        </div>
                        {isExpanded ? (
                          <ChevronDownIcon strokeWidth={2.5} className="h-3 w-3" />
                        ) : (
                          <ChevronRightIcon strokeWidth={2.5} className="h-3 w-3" />
                        )}
                      </Button>
                      {isExpanded && (
                        <ul className="ml-8 mt-1 flex flex-col gap-1 border-l border-blue-gray-100 pl-2">
                          {children.map((child) => (
                            <li key={`${pageKey}-${child.path}`}>
                              <NavLink to={`/${layout}${child.path}`}>
                                {({ isActive }) => (
                                  <Button
                                    variant={isActive ? "gradient" : "text"}
                                    color={isActive ? activeColor : (sidenavType === "dark" ? "white" : "blue-gray")}
                                    className="flex items-center gap-4 px-4 capitalize"
                                    fullWidth
                                    size="sm"
                                  >
                                    {child.icon}
                                    <Typography color="inherit" className="font-medium capitalize text-sm">
                                      {t(`sidenav.${child.name}`) || child.name}
                                    </Typography>
                                  </Button>
                                )}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={pageKey}>
                    <NavLink to={`/${layout}${path || ""}`}>
                      {({ isActive }) => (
                        <Button
                          variant={isActive ? "gradient" : "text"}
                          color={
                            isActive
                              ? activeColor
                              : sidenavType === "dark"
                                ? "white"
                                : "blue-gray"
                          }
                          className="flex items-center gap-4 px-4 capitalize"
                          fullWidth
                        >
                          {icon}
                          <Typography
                            color="inherit"
                            className="font-medium capitalize"
                          >
                            {t(`sidenav.${label}`)}
                          </Typography>
                        </Button>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          );
        })}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "ANKO Studio",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
