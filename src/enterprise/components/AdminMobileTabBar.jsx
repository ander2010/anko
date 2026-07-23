import React from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  DocumentTextIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  RectangleStackIcon as RectangleStackIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from "@heroicons/react/24/solid";
import { useLanguage } from "@/context/language-context";

// Bottom tab bar for company owner/admin/manager/trainer/auditor roles on
// mobile — mirrors the icons already used for these destinations in the
// desktop Sidenav (src/routes.jsx), so the same page always has the same
// icon on both surfaces. Reuses the existing sidenav.* translation keys
// instead of adding new ones, since these labels already exist there.
const ITEMS = [
  { to: "/enterprise/dashboard", end: true, key: "ent-dashboard", outline: HomeIcon, solid: HomeIconSolid },
  { to: "/enterprise/knowledge", key: "ent-knowledge", outline: DocumentTextIcon, solid: DocumentTextIconSolid },
  { to: "/enterprise/learning/paths", key: "ent-paths", outline: RectangleStackIcon, solid: RectangleStackIconSolid },
  { to: "/enterprise/compliance/programs", key: "ent-compliance-programs", outline: ShieldCheckIcon, solid: ShieldCheckIconSolid },
  { to: "/enterprise/settings", key: "ent-settings", outline: Cog6ToothIcon, solid: Cog6ToothIconSolid },
];

export function AdminMobileTabBar() {
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
                  {t(`sidenav.${key}`)}
                </span>
              </>
            );
          }}
        </NavLink>
      ))}
    </nav>
  );
}

export default AdminMobileTabBar;
