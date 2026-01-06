import { Routes, Route, Navigate } from "react-router-dom";
import { ChatBubbleLeftEllipsisIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  ChatPanel,
  Footer,
} from "@/widgets/layout";
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


      {/* Blinking Arrow Trigger - Visible when sidenav is closed */}
      {!openSidenav && (
        <IconButton
          size="lg"
          color="white"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 rounded-l-none border-l-0 shadow-lg animate-pulse"
          onClick={() => setOpenSidenav(dispatch, true)}
        >
          <ChevronRightIcon className="h-6 w-6 text-blue-gray-900" />
        </IconButton>
      )}
      <div
        className={`p-4 min-h-screen transition-all duration-300 ${openSidenav ? "xl:ml-80" : ""}`}
        onClick={() => openSidenav && setOpenSidenav(dispatch, false)}
      >
        <DashboardNavbar />
        <ChatPanel />
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
        </IconButton>
        <Routes>
          {routes.map(({ layout, pages }) =>
            layout === "dashboard" &&
            pages.map((page) => {
              // RBAC Check for page
              if (page.key && !isAdmin && !allowedRoutes.includes(page.key)) {
                return null;
              }

              if (page.children) {
                return page.children.map(({ path, element, key }) => {
                  // RBAC Check for child
                  if (key && !isAdmin && !allowedRoutes.includes(key)) {
                    return null;
                  }
                  return <Route exact path={path} element={element} key={path} />;
                });
              }
              return <Route exact path={page.path} element={page.element} key={page.path} />;
            })
          )}
          {/* Dynamic routes for project detail and topics - usually open to everyone who can see dashboard */}
          <Route path="/project/:projectId" element={<ProjectDetail />} />
          <Route path="/project/:projectId/topics" element={<ProjectTopics />} />

          {/* Fallback for unauthorized/not found dashboard routes */}
          <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
        </Routes>
        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
