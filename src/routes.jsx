import {
  HomeIcon,
  // UserCircleIcon,
  // TableCellsIcon,
  // InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  FolderIcon,
  TagIcon,
  ClipboardDocumentCheckIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";
import { Home, Projects, GlobalTopics, GlobalRules, GlobalBatteries } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";


const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <FolderIcon {...icon} />,
        name: "projects",
        path: "/projects",
        element: <Projects />,
      },
      {
        icon: <TagIcon {...icon} />,
        name: "topics",
        path: "/topics",
        element: <GlobalTopics />,
      },
      {
        icon: <ClipboardDocumentCheckIcon {...icon} />,
        name: "rules",
        path: "/rules",
        element: <GlobalRules />,
      },
      {
        icon: <BoltIcon {...icon} />,
        name: "batteries",
        path: "/batteries",
        element: <GlobalBatteries />,
      },
      // Commented out for later use
      // {
      //   icon: <UserCircleIcon {...icon} />,
      //   name: "profile",
      //   path: "/profile",
      //   element: <Profile />,
      // },
      // {
      //   icon: <TableCellsIcon {...icon} />,
      //   name: "tables",
      //   path: "/tables",
      //   element: <Tables />,
      // },
      // {
      //   icon: <InformationCircleIcon {...icon} />,
      //   name: "notifications",
      //   path: "/notifications",
      //   element: <Notifications />,
      // },
    ],
  },
  {
    layout: "auth",
    pages: [
      {
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
