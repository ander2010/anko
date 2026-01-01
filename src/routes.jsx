import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  // InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  FolderIcon,
  TagIcon,
  ClipboardDocumentCheckIcon,
  BoltIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/solid";
import {
  Home, Projects, GlobalTopics, GlobalRules, GlobalBatteries, GlobalSections, Billing, Faqs, AboutUs, ContactPage,
  GlobalResources, GlobalPermissions, GlobalRoles, GlobalPlans, GlobalPlanLimits, GlobalSubscriptions,
  GlobalBatteryShares, GlobalSavedBatteries, GlobalInvites, GlobalDecks, GlobalFlashcards, GlobalDeckShares, GlobalSavedDecks
} from "@/pages/dashboard";
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
      {
        icon: <TableCellsIcon {...icon} />,
        name: "sections",
        path: "/sections",
        element: <GlobalSections />,
      },
      // Admin / Global CRUD (Nested)
      {
        icon: <ServerStackIcon {...icon} />,
        name: "admin", // Key for translations: sidenav.admin
        children: [
          {
            icon: <ServerStackIcon {...icon} />,
            name: "resources",
            path: "/resources",
            element: <GlobalResources />,
          },
          {
            icon: <TagIcon {...icon} />,
            name: "permissions",
            path: "/permissions",
            element: <GlobalPermissions />,
          },
          {
            icon: <UserCircleIcon {...icon} />,
            name: "roles",
            path: "/roles",
            element: <GlobalRoles />,
          },
          {
            icon: <CreditCardIcon {...icon} />,
            name: "plans",
            path: "/plans",
            element: <GlobalPlans />,
          },
          {
            icon: <ClipboardDocumentCheckIcon {...icon} />,
            name: "plan-limits",
            path: "/plan-limits",
            element: <GlobalPlanLimits />,
          },
          {
            icon: <CreditCardIcon {...icon} />,
            name: "subscriptions",
            path: "/subscriptions",
            element: <GlobalSubscriptions />,
          },
          {
            icon: <BoltIcon {...icon} />,
            name: "battery-shares",
            path: "/battery-shares",
            element: <GlobalBatteryShares />,
          },
          {
            icon: <BoltIcon {...icon} />,
            name: "saved-batteries",
            path: "/saved-batteries",
            element: <GlobalSavedBatteries />,
          },
          {
            icon: <EnvelopeIcon {...icon} />,
            name: "invites",
            path: "/invites",
            element: <GlobalInvites />,
          },
          {
            icon: <RectangleStackIcon {...icon} />,
            name: "decks",
            path: "/decks",
            element: <GlobalDecks />,
          },
          {
            icon: <RectangleStackIcon {...icon} />,
            name: "flashcards",
            path: "/flashcards",
            element: <GlobalFlashcards />,
          },
          {
            icon: <RectangleStackIcon {...icon} />,
            name: "deck-shares",
            path: "/deck-shares",
            element: <GlobalDeckShares />,
          },
          {
            icon: <RectangleStackIcon {...icon} />,
            name: "saved-decks",
            path: "/saved-decks",
            element: <GlobalSavedDecks />,
          },
        ]
      },
      {
        icon: <CreditCardIcon {...icon} />,
        name: "billing",
        path: "/billing",
        element: <Billing />,
      },
      {
        icon: <QuestionMarkCircleIcon {...icon} />,
        name: "faqs",
        path: "/faqs",
        element: <Faqs />,
        hidden: true,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "about-us",
        path: "/about-us",
        element: <AboutUs />,
        hidden: true,
      },
      {
        icon: <EnvelopeIcon {...icon} />,
        name: "contact-us",
        path: "/contact-us",
        element: <ContactPage />,
        hidden: true,
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
