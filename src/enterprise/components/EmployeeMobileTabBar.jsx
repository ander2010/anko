import React from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  BookOpenIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  ArrowTrendingUpIcon as ArrowTrendingUpIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
} from "@heroicons/react/24/solid";
import { useLanguage } from "@/context/language-context";

// Bottom tab bar for the Employee role on mobile — mirrors the icons already
// used for these destinations in the desktop sidebar (routes.jsx), so the
// same page always has the same icon on both surfaces.
const ITEMS = [
  { to: "/enterprise/dashboard", end: true, key: "home", outline: HomeIcon, solid: HomeIconSolid },
  { to: "/enterprise/learning/assignments", key: "assignments", outline: BookOpenIcon, solid: BookOpenIconSolid },
  { to: "/enterprise/retention/me", key: "retention", outline: ArrowTrendingUpIcon, solid: ArrowTrendingUpIconSolid },
  { to: "/enterprise/compliance/me", key: "compliance", outline: ShieldCheckIcon, solid: ShieldCheckIconSolid },
  { to: "/enterprise/certifications", key: "certificates", outline: AcademicCapIcon, solid: AcademicCapIconSolid },
];

export function EmployeeMobileTabBar() {
  const { t } = useLanguage();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[9000] flex items-center justify-around"
      style={{
        height: 58,
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {ITEMS.map(({ to, end, key, outline: Icon, solid: IconSolid }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 transition-colors duration-150"
        >
          {({ isActive }) => {
            const ActiveIcon = isActive ? IconSolid : Icon;
            return (
              <>
                <ActiveIcon
                  style={{ width: 22, height: 22, color: isActive ? "var(--accent)" : "var(--text-tertiary)" }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--accent)" : "var(--text-tertiary)",
                    lineHeight: 1,
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    padding: "0 2px",
                  }}
                >
                  {t(`enterprise.dashboard.mobileNav.${key}`)}
                </span>
              </>
            );
          }}
        </NavLink>
      ))}
    </nav>
  );
}

export default EmployeeMobileTabBar;
