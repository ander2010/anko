import { Routes, Route, Navigate } from "react-router-dom";
import { ChatBubbleLeftEllipsisIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  ChatPanel,
  Footer,
} from "@/widgets/layout";
import { MobileTabBar } from "@/widgets/layout/mobile-tab-bar";
import routes from "@/routes";
import { ProjectDetail, ProjectTopics } from "@/pages/dashboard";
import { useMaterialTailwindController, setOpenConfigurator, setOpenSidenav } from "@/context";
import { useAuth } from "@/context/auth-context";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType, openSidenav } = controller;
  const { allowedRoutes, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />

      {/* Sidenav open arrow — hidden on mobile (tab bar handles nav) */}
      <div
        className={`hidden md:block fixed left-0 z-50 transition-all duration-300 ${
          openSidenav ? "invisible opacity-0 -translate-x-full" : "visible opacity-100 translate-x-0"
        }`}
        style={{ position: "fixed", top: "55px" }}
      >
        <IconButton
          size="lg"
          color="white"
          className="rounded-l-none border-l-0 shadow-lg"
          onClick={() => setOpenSidenav(dispatch, true)}
        >
          <ChevronRightIcon className="h-6 w-6 text-blue-gray-900" />
        </IconButton>
      </div>

      <div
        className={`p-4 pb-20 md:pb-4 min-h-screen flex flex-col transition-all duration-300 ${
          openSidenav ? "xl:ml-80" : ""
        }`}
        onClick={() => openSidenav && setOpenSidenav(dispatch, false)}
      >
        {/* Navbar — hidden on mobile, each page owns its mobile header */}
        <div className="hidden md:block">
          <DashboardNavbar />
        </div>

        <ChatPanel />

        {/* AI chat button — above tab bar on mobile */}
        <button
          className="fixed bottom-[72px] right-4 md:bottom-8 md:right-8 z-40 rounded-full shadow-lg flex items-center justify-center md:bg-white md:text-blue-gray-900 md:shadow-blue-gray-900/10"
          style={{ width: 48, height: 48, background: "linear-gradient(135deg, #3949AB, #303F9F)", border: "none", cursor: "pointer" }}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-white md:text-blue-gray-900" />
        </button>

        <div className="flex-grow flex flex-col">
          <Routes>
            {routes.map(({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map((page) => {
                if (page.key && !isAdmin && !allowedRoutes.includes(page.key)) {
                  return null;
                }
                if (page.children) {
                  return page.children.map(({ path, element, key }) => {
                    if (key && !isAdmin && !allowedRoutes.includes(key)) {
                      return null;
                    }
                    return <Route exact path={path} element={element} key={path} />;
                  });
                }
                return <Route exact path={page.path} element={page.element} key={page.path} />;
              })
            )}
            <Route path="/project/:projectId" element={<ProjectDetail />} />
            <Route path="/project/:projectId/topics" element={<ProjectTopics />} />
            <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
          </Routes>
        </div>

        {/* Footer — hidden on mobile */}
        <div className="hidden md:block text-blue-gray-600 mt-auto">
          <Footer />
        </div>
      </div>

      {/* Mobile tab bar */}
      <MobileTabBar />
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
