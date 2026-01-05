import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Bars3Icon,
  PowerIcon,
  PencilSquareIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { useProjects } from "@/context/projects-context";
import { EditProfileDialog } from "@/widgets/dialogs/edit-profile-dialog";
import { useState } from "react";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  // Using useProjects hook instead
  const { projects: allProjects } = useProjects();

  const pathParts = pathname.split("/").filter((el) => el !== "");
  const [layout, page, id] = pathParts;

  const getBreadcrumbName = (part, index) => {
    // If it's an ID and the previous part was 'project'
    if (index === 2 && pathParts[1] === "project") {
      const project = allProjects.find(p => String(p.id) === part);
      return project ? (project.title || project.name) : part;
    }

    // Default translation lookup
    return t(`breadcrumbs.${part}`) || part;
  };

  const currentPageName = getBreadcrumbName(page, 1);
  const detailName = id ? getBreadcrumbName(id, 2) : null;

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${fixedNavbar
        ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
        : "px-0 py-1"
        }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${fixedNavbar ? "mt-1" : ""
              }`}
          >
            <Link to={`/${layout}`}>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
              >
                {t(`breadcrumbs.${layout}`) || layout}
              </Typography>
            </Link>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
              {currentPageName}
            </Typography>
            {detailName && (
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal"
              >
                {detailName}
              </Typography>
            )}
          </Breadcrumbs>
          <Typography variant="h6" color="blue-gray">
            {detailName || currentPageName}
          </Typography>
        </div>
        <div className="flex items-center">

          <Button
            variant="text"
            color="blue-gray"
            className="flex items-center gap-1 px-4 normal-case"
            onClick={() => changeLanguage(language === "es" ? "en" : "es")}
          >
            <span className="text-lg">{language === "es" ? "🇪🇸" : "🇺🇸"}</span>
            {language.toUpperCase()}
          </Button>
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>
          {user ? (
            <Menu>
              <MenuHandler>
                <Button
                  variant="text"
                  color="blue-gray"
                  className="hidden items-center gap-2 px-4 xl:flex normal-case"
                >
                  <Avatar
                    src="/img/bruce-mars.jpeg" // Using existing default image for now
                    alt={user.username}
                    size="xs"
                    variant="circular"
                  />
                  <div className="flex flex-col items-start leading-tight">
                    <Typography variant="small" color="blue-gray" className="font-bold">
                      {user.first_name || user.username}
                    </Typography>
                    <Typography variant="small" color="blue-gray" className="text-[10px] font-normal opacity-50">
                      {user.email}
                    </Typography>
                  </div>
                  <ChevronDownIcon strokeWidth={2.5} className="h-3 w-3 text-blue-gray-500 ml-1" />
                </Button>
              </MenuHandler>
              <MenuList className="w-56">
                <MenuItem
                  className="flex items-center gap-2"
                  onClick={() => setOpenProfileDialog(true)}
                >
                  <PencilSquareIcon className="h-4 w-4 text-blue-gray-500" />
                  <Typography variant="small" className="font-normal">
                    {t("sidenav.profile") || "Profile"}
                  </Typography>
                </MenuItem>
                <hr className="my-2 border-blue-gray-50" />
                <MenuItem
                  className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 focus:bg-red-500/10"
                  onClick={logout}
                >
                  <PowerIcon className="h-4 w-4" />
                  <Typography variant="small" className="font-normal">
                    {t("sidenav.signout") || "Sign Out"}
                  </Typography>
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link to="/auth/sign-in">
              <Button
                variant="text"
                color="blue-gray"
                className="hidden items-center gap-1 px-4 xl:flex normal-case"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                {t("sidenav.signin")}
              </Button>
            </Link>
          )}

          <EditProfileDialog
            open={openProfileDialog}
            handler={() => setOpenProfileDialog(false)}
          />
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
