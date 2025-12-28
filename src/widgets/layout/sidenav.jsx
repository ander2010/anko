import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useLanguage } from "@/context/language-context";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { t } = useLanguage();
  const { sidenavColor, sidenavType, openSidenav } = controller;

  // 👉 auth state (simple y efectivo)
  const isAuthenticated = !!localStorage.getItem("token");

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  // Colores válidos para Material Tailwind Button
  const allowedColors = new Set([
    "white", "blue-gray", "gray", "brown", "deep-orange", "orange", "amber", "yellow",
    "lime", "light-green", "green", "teal", "cyan", "light-blue", "blue", "indigo",
    "deep-purple", "purple", "pink", "red",
  ]);

  const activeColor = allowedColors.has(sidenavColor)
    ? sidenavColor
    : "blue-gray";

  // 👉 filtra rutas: oculta auth cuando hay sesión, y oculta las marcadas como hidden
  const visibleRoutes = (routes || [])
    .filter((route) => {
      if (isAuthenticated && route.layout === "auth") return false;
      if (route.hidden) return false;
      return true;
    })
    .map((route) => ({
      ...route,
      pages: (route.pages || []).filter((page) => !page.hidden),
    }))
    .filter((route) => route.pages.length > 0 || route.layout === "auth");

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${openSidenav ? "translate-x-0" : "-translate-x-80"
        } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      {/* Header */}
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

      {/* Routes */}
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

              {(pages || []).map(({ icon, name, path }) => {
                const label = name ?? path ?? "Untitled";
                const pageKey = `${layout || ""}${path || label}`;

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
