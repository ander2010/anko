import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useCompanyRole } from "../hooks/useCompanyRole";
import { CompanySelector } from "../components/CompanySelector";
import { useEnterprise } from "../context/enterprise-context";
import { useAuth } from "@/context/auth-context";
import {
  HomeIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { Typography, IconButton } from "@material-tailwind/react";
import { APP_NAME } from "@/config/app";

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          isActive
            ? "bg-indigo-600 text-white"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        }`
      }
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {label}
    </NavLink>
  );
}

export function EnterpriseLayout() {
  const { role, hasRole, hasMinRole } = useCompanyRole();
  const { isEnterpriseMember } = useEnterprise();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: "/enterprise/dashboard", icon: HomeIcon, label: "Dashboard", show: true },
    {
      to: "/enterprise/learning",
      icon: BookOpenIcon,
      label: "Learning",
      show: true,
    },
    {
      to: "/enterprise/retention",
      icon: ChartBarIcon,
      label: "Retention",
      show: true,
    },
    {
      to: "/enterprise/compliance",
      icon: ShieldCheckIcon,
      label: "Compliance",
      show: true,
    },
    {
      to: "/enterprise/certifications",
      icon: AcademicCapIcon,
      label: "Certifications",
      show: true,
    },
    {
      to: "/enterprise/analytics",
      icon: ChartBarIcon,
      label: "Analytics",
      show: hasMinRole("auditor"),
    },
    {
      to: "/enterprise/team",
      icon: UsersIcon,
      label: "Team",
      show: hasMinRole("manager"),
    },
    {
      to: "/enterprise/settings",
      icon: Cog6ToothIcon,
      label: "Settings",
      show: hasMinRole("admin"),
    },
  ].filter((item) => item.show);

  const closeSidebar = () => setSidebarOpen(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-zinc-100">
        <NavLink to="/enterprise/dashboard" onClick={closeSidebar}>
          <Typography variant="h6" className="font-extrabold text-zinc-900">
            {APP_NAME}
            <span className="ml-1.5 text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              Enterprise
            </span>
          </Typography>
        </NavLink>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} onClick={closeSidebar} />
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-zinc-100 p-3 space-y-1">
        <NavItem to="/enterprise/profile" icon={UserCircleIcon} label="My Profile" onClick={closeSidebar} />
        <NavLink
          to="/dashboard/home"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          onClick={closeSidebar}
        >
          <BriefcaseIcon className="h-5 w-5" />
          Personal Workspace
        </NavLink>
        <button
          onClick={() => { logout(); navigate("/auth/sign-in"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-zinc-200 fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={closeSidebar} />
          <aside className="fixed left-0 top-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col">
            <div className="flex justify-end p-3">
              <IconButton variant="text" onClick={closeSidebar}>
                <XMarkIcon className="h-5 w-5 text-zinc-600" />
              </IconButton>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Nav */}
        <header className="sticky top-0 z-20 bg-white border-b border-zinc-200 px-4 md:px-6 h-14 flex items-center gap-3">
          <IconButton variant="text" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="h-5 w-5 text-zinc-600" />
          </IconButton>

          <div className="flex-1" />

          <CompanySelector />

          <button className="relative p-2 rounded-xl hover:bg-zinc-100 text-zinc-500">
            <BellIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 px-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
              {(user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase()}
            </div>
            <div className="hidden md:block">
              <Typography variant="small" className="text-zinc-900 font-bold text-xs leading-none">
                {user?.first_name || user?.username}
              </Typography>
              <Typography variant="small" className="text-zinc-400 text-xs capitalize">
                {role || "member"}
              </Typography>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default EnterpriseLayout;
