import React from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "@/context/language-context";

/* ─── Tab icons (inline SVG, matching mockup exactly) ─── */
const IconHome = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
      fill={active ? "var(--ank-purple)" : "#bbb"}
    />
  </svg>
);

const IconProjects = ({ active }) => {
  const c = active ? "var(--ank-purple)" : "#bbb";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3"  y="3"  width="8" height="8" rx="2" fill={c} />
      <rect x="13" y="3"  width="8" height="8" rx="2" fill={c} opacity="0.4" />
      <rect x="3"  y="13" width="8" height="8" rx="2" fill={c} opacity="0.4" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill={c} opacity="0.65" />
    </svg>
  );
};

const IconBatteries = ({ active }) => {
  const c = active ? "var(--ank-purple)" : "#bbb";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="18" height="10" rx="3" fill={c} />
      <rect x="20" y="10" width="2" height="4" rx="1" fill={c} opacity="0.6" />
      {active && <rect x="5" y="11" width="8" height="2" rx="1" fill="#fff" />}
    </svg>
  );
};

const IconStudy = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="6" width="18" height="12" rx="3" fill={active ? "var(--ank-purple)" : "#bbb"} />
    {active && (
      <>
        <rect x="7" y="11" width="10" height="1.5" rx="0.75" fill="#fff" />
        <rect x="7" y="14" width="6"  height="1.5" rx="0.75" fill="#fff" opacity="0.6" />
      </>
    )}
  </svg>
);

const IconProfile = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" fill={active ? "var(--ank-purple)" : "#bbb"} />
    <path
      d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
      stroke={active ? "var(--ank-purple)" : "#bbb"}
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

export function MobileTabBar() {
  const { language } = useLanguage();

  const items = [
    {
      to: "/dashboard/home",
      label: language === "es" ? "Inicio" : "Home",
      Icon: IconHome,
    },
    {
      to: "/dashboard/projects",
      label: language === "es" ? "Proyectos" : "Projects",
      Icon: IconProjects,
    },
    {
      to: "/dashboard/my-batteries",
      label: language === "es" ? "Baterías" : "Batteries",
      Icon: IconBatteries,
    },
    {
      to: "/dashboard/my-decks",
      label: language === "es" ? "Estudiar" : "Study",
      Icon: IconStudy,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[9000] bg-white flex items-center justify-around"
      style={{ height: "56px", borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingBottom: "env(safe-area-inset-bottom, 4px)" }}
    >
      {items.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className="flex flex-col items-center justify-center gap-[3px] flex-1 h-full"
        >
          {({ isActive }) => (
            <>
              <Icon active={isActive} />
              <span
                style={{
                  fontSize: "8px",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--ank-purple)" : "#bbb",
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}

    </nav>
  );
}

export default MobileTabBar;
