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
  GlobalBatteryShares, GlobalSavedBatteries, GlobalInvites, GlobalDecks, GlobalFlashcards, GlobalDeckShares, GlobalSavedDecks,
  GlobalUsers, GlobalProjects, GlobalSupportRequests, MyDecks, MyBatteries, PublicDecks, PublicBatteries
} from "@/pages/dashboard";
import { SignIn, SignUp, EmailVerification, ForgotPassword, ResetPassword } from "@/pages/auth";


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
        key: "dashboard.home",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <FolderIcon {...icon} />,
        name: "projects",
        key: "dashboard.projects",
        path: "/projects",
        element: <Projects />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "my-decks",
        key: "dashboard.my-decks",
        path: "/my-decks",
        element: <MyDecks />,
      },
      {
        icon: <BoltIcon {...icon} />,
        name: "my-batteries",
        key: "dashboard.my-batteries",
        path: "/my-batteries",
        element: <MyBatteries />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "public-decks",
        key: "dashboard.public-decks",
        path: "/public-decks",
        element: <PublicDecks />,
      },
      {
        icon: <BoltIcon {...icon} />,
        name: "public-batteries",
        key: "dashboard.public-batteries",
        path: "/public-batteries",
        element: <PublicBatteries />,
      },
      {
        icon: <TagIcon {...icon} />,
        name: "topics",
        key: "dashboard.topics",
        path: "/topics",
        element: <GlobalTopics />,
      },
      {
        icon: <ClipboardDocumentCheckIcon {...icon} />,
        name: "rules",
        key: "dashboard.rules",
        path: "/rules",
        element: <GlobalRules />,
      },
      {
        icon: <BoltIcon {...icon} />,
        name: "batteries",
        key: "dashboard.batteries",
        path: "/batteries",
        element: <GlobalBatteries />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "sections",
        key: "dashboard.sections",
        path: "/sections",
        element: <GlobalSections />,
      },
      // Admin / Global CRUD (Nested)
      {
        icon: <ServerStackIcon {...icon} />,
        name: "admin", // Key for translations: sidenav.admin
        key: "dashboard.admin",
        children: [
          {
            icon: <UserCircleIcon {...icon} />,
            name: "users",
            key: "dashboard.admin.users",
            path: "/users",
            element: <GlobalUsers />,
          },
          {
            icon: <ServerStackIcon {...icon} />,
            name: "resources",
            key: "dashboard.admin.resources",
            path: "/resources",
            element: <GlobalResources />,
          },
          {
            icon: <TagIcon {...icon} />,
            name: "permissions",
            key: "dashboard.admin.permissions",
            path: "/permissions",
            element: <GlobalPermissions />,
          },
          {
            icon: <UserCircleIcon {...icon} />,
            name: "roles",
            key: "dashboard.admin.roles",
            path: "/roles",
            element: <GlobalRoles />,
          },
          {
            icon: <CreditCardIcon {...icon} />,
            name: "plans",
            key: "dashboard.admin.plans",
            path: "/plans",
            element: <GlobalPlans />,
          },
          {
            icon: <ClipboardDocumentCheckIcon {...icon} />,
            name: "plan-limits",
            key: "dashboard.admin.plan-limits",
            path: "/plan-limits",
            element: <GlobalPlanLimits />,
          },
          {
            icon: <CreditCardIcon {...icon} />,
            name: "subscriptions",
            key: "dashboard.admin.subscriptions",
            path: "/subscriptions",
            element: <GlobalSubscriptions />,
          },
          {
            icon: <BoltIcon {...icon} />,
            name: "battery-shares",
            key: "dashboard.admin.battery-shares",
            path: "/battery-shares",
            element: <GlobalBatteryShares />,
          },
          {
            icon: <BoltIcon {...icon} />,
            name: "saved-batteries",
            key: "dashboard.admin.saved-batteries",
            path: "/saved-batteries",
            element: <GlobalSavedBatteries />,
          },
          {
            icon: <EnvelopeIcon {...icon} />,
            name: "invites",
            key: "dashboard.admin.invites",
            path: "/invites",
            element: <GlobalInvites />,
          },
          {
            icon: <RectangleStackIcon {...icon} />,
            name: "decks",
            key: "dashboard.admin.decks",
            path: "/decks",
            element: <GlobalDecks />,
          },
          {
            icon: <RectangleStackIcon {...icon} />,
            name: "flashcards",
            key: "dashboard.admin.flashcards",
            path: "/flashcards",
            element: <GlobalFlashcards />,
          },
          {
            icon: <RectangleStackIcon {...icon} />,
            name: "deck-shares",
            key: "dashboard.admin.deck-shares",
            path: "/deck-shares",
            element: <GlobalDeckShares />,
          },
          {
            icon: <RectangleStackIcon {...icon} />,
            name: "saved-decks",
            key: "dashboard.admin.saved-decks",
            path: "/saved-decks",
            element: <GlobalSavedDecks />,
          },
          {
            icon: <FolderIcon {...icon} />,
            name: "global-projects",
            key: "dashboard.admin.projects",
            path: "/global-projects",
            element: <GlobalProjects />,
          },
          {
            icon: <EnvelopeIcon {...icon} />,
            name: "support-requests",
            key: "dashboard.admin.support-requests",
            path: "/support-requests",
            element: <GlobalSupportRequests />,
          },
        ]
      },
      {
        icon: <CreditCardIcon {...icon} />,
        name: "billing",
        key: "dashboard.billing",
        path: "/billing",
        element: <Billing />,
      },
      {
        icon: <QuestionMarkCircleIcon {...icon} />,
        name: "faqs",
        key: "dashboard.faqs",
        path: "/faqs",
        element: <Faqs />,
        hidden: true,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "about-us",
        key: "dashboard.about-us",
        path: "/about-us",
        element: <AboutUs />,
        hidden: true,
      },
      {
        icon: <EnvelopeIcon {...icon} />,
        name: "contact-us",
        key: "dashboard.contact-us",
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
      {
        path: "/email-verification",
        element: <EmailVerification />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password/:uid/:token",
        element: <ResetPassword />,
      },
    ],
  },
];

export default routes;
