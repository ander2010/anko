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
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
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
      className={`transition-all ${fixedNavbar
        ? "sticky top-4 z-40 py-2 shadow-premium bg-white/80 backdrop-blur-md border border-zinc-200/50"
        : "px-0 py-1 border-b border-zinc-200/50"
        }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center px-4">
        <div className="capitalize flex items-center gap-4">
          <IconButton
            variant="text"
            className="grid text-zinc-600"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6" />
          </IconButton>
          <div>
            <Breadcrumbs
              className="bg-transparent p-0 transition-all"
            >
              <Link to={`/${layout}`}>
                <Typography
                  variant="small"
                  className="font-medium text-zinc-400 transition-all hover:text-indigo-600"
                >
                  {t(`breadcrumbs.${layout}`) || layout}
                </Typography>
              </Link>
              <Typography
                variant="small"
                className="font-medium text-zinc-500"
              >
                {currentPageName}
              </Typography>
              {detailName && (
                <Typography
                  variant="small"
                  className="font-semibold text-zinc-900"
                >
                  {detailName}
                </Typography>
              )}
            </Breadcrumbs>

          </div>
        </div>
        <div className="flex items-center gap-2">


          <Button
            variant="text"
            className="flex items-center gap-2 px-3 py-2 normal-case text-zinc-600 hover:bg-zinc-100"
            onClick={() => changeLanguage(language === "es" ? "en" : "es")}
          >
            <img
              src={language === "en" ? "https://flagcdn.com/w20/us.png" : "https://flagcdn.com/w20/es.png"}
              alt={language}
              className="h-3.5 w-5 rounded-sm"
            />
            <span className="text-xs font-bold">{language.toUpperCase()}</span>
          </Button>



          {user ? (
            <Menu placement="bottom-end">
              <MenuHandler>
                <button className="flex items-center gap-3 p-1.5 rounded-full hover:bg-zinc-100 transition-all">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs border border-white/20 shadow-sm">
                    {user.first_name?.[0] || user.username?.[0] || "U"}
                  </div>
                  <ChevronDownIcon strokeWidth={3} className="h-3 w-3 text-zinc-400" />
                </button>
              </MenuHandler>
              <MenuList className="w-56 p-2 border-zinc-200/60 shadow-xl rounded-xl">
                <div className="px-3 py-2 mb-2">
                  <Typography variant="small" className="font-bold text-zinc-900">
                    {user.first_name || user.username}
                  </Typography>
                  <Typography variant="small" className="text-[11px] text-zinc-500 truncate">
                    {user.email}
                  </Typography>
                </div>
                <hr className="my-1 border-zinc-100" />
                <MenuItem
                  className="flex items-center gap-3 py-2 rounded-lg text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  onClick={() => setOpenProfileDialog(true)}
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  <Typography variant="small" className="font-medium">
                    {t("sidenav.profile") || "Profile"}
                  </Typography>
                </MenuItem>
                <MenuItem
                  className="flex items-center gap-3 py-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                  onClick={logout}
                >
                  <PowerIcon className="h-4 w-4" />
                  <Typography variant="small" className="font-medium">
                    {t("sidenav.signout") || "Sign Out"}
                  </Typography>
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link to="/auth/sign-in">
              <Button
                variant="gradient"
                color="indigo"
                size="sm"
                className="hidden items-center gap-2 xl:flex normal-case shadow-md shadow-indigo-500/20"
              >
                <UserCircleIcon className="h-4 w-4" />
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
