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
  Chip,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Bars3Icon,
  PowerIcon,
  PencilSquareIcon,
  ChevronDownIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import api, { API_BASE } from "@/services/api";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { useProjects } from "@/context/projects-context";
import { EditProfileDialog } from "@/widgets/dialogs/edit-profile-dialog";
import { UserStatisticsDialog } from "@/widgets/dialogs/user-statistics-dialog";
import { useState, useEffect, useRef } from "react";

const getLevelStyle = (level) => {
  if (level === "success") return { Icon: CheckCircleIcon,         ring: "ring-emerald-100", cls: "text-emerald-500", dot: "bg-emerald-500" };
  if (level === "error")   return { Icon: XCircleIcon,             ring: "ring-red-100",     cls: "text-red-500",     dot: "bg-red-500"     };
  if (level === "warning") return { Icon: ExclamationTriangleIcon, ring: "ring-amber-100",   cls: "text-amber-500",   dot: "bg-amber-500"   };
  return                          { Icon: InformationCircleIcon,   ring: "ring-indigo-100",  cls: "text-indigo-500",  dot: "bg-indigo-500"  };
};

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openStatsDialog, setOpenStatsDialog] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // ── Toasts ──────────────────────────────────────────────
  const addToast = (msg) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...msg, _toastId: id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t._toastId !== id)), 5000);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t._toastId !== id));

  // ── Notifications ────────────────────────────────────────
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await api.get("/user-notifications/");
      setNotifications(res.data?.results || res.data || []);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setNotifLoading(false);
    }
  };

  // Fetch al login para el badge
  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Socket persistente — se abre al login, se cierra al logout
  const wsRef = useRef(null);
  useEffect(() => {
    if (!user) {
      wsRef.current?.close();
      wsRef.current = null;
      return;
    }
    const token = localStorage.getItem("token");
    const wsBase = API_BASE.replace(/^http/, "ws").replace(/\/api\/?$/, "");
    const ws = new WebSocket(`${wsBase}/ws/notifications/?token=${token}`);
    wsRef.current = ws;
    ws.onopen  = () => console.log("[Notifications] WS connected");
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        addToast(msg);
        setNotifications((prev) => [{ ...msg, is_read: false, notification: msg }, ...prev]);
      } catch (_) {}
    };
    ws.onclose = () => console.log("[Notifications] WS closed");
    return () => { ws.close(); wsRef.current = null; };
  }, [user]);

  const markRead = async (id) => {
    try {
      await api.post(`/user-notifications/${id}/read/`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {}
  };

  const dismissNotif = async (id) => {
    try {
      await api.post(`/user-notifications/${id}/dismiss/`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {}
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── Breadcrumbs ──────────────────────────────────────────
  const { projects: allProjects } = useProjects();
  const pathParts = pathname.split("/").filter((el) => el !== "");
  const getBreadcrumbName = (part, index) => {
    if (index === 2 && pathParts[1] === "project") {
      const project = allProjects.find(p => String(p.id) === part);
      return project ? (project.title || project.name) : part;
    }
    return t(`breadcrumbs.${part}`) || part;
  };

  return (
    <>
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
              <Breadcrumbs className="bg-transparent p-0 transition-all">
                {pathParts.map((part, index) => {
                  const isLast = index === pathParts.length - 1;
                  const name = getBreadcrumbName(part, index);
                  const layout = pathParts[0];
                  if (!isLast) {
                    let path = "/" + pathParts.slice(0, index + 1).join("/");
                    if (part === "project" && index === 1) path = `/${layout}/projects`;
                    return (
                      <Link key={path} to={path}>
                        <Typography variant="small" className="font-medium text-zinc-400 transition-all hover:text-indigo-600">
                          {name}
                        </Typography>
                      </Link>
                    );
                  }
                  return (
                    <Typography key={index} variant="small" className="font-semibold text-zinc-900">
                      {name}
                    </Typography>
                  );
                })}
              </Breadcrumbs>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language */}
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

            {/* Notification Bell */}
            <Menu
              placement="bottom-end"
              open={notifOpen}
              handler={(val) => {
                setNotifOpen(val);
                if (val && !notifLoading) fetchNotifications();
              }}
            >
              <MenuHandler>
                <IconButton variant="text" size="sm" className="relative rounded-full text-zinc-600 hover:bg-zinc-100">
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </IconButton>
              </MenuHandler>
              <MenuList className="w-80 p-2 border-zinc-200/60 shadow-xl rounded-xl max-h-96 overflow-y-auto">
                <div className="px-3 py-2 mb-2 flex items-center justify-between">
                  <Typography variant="small" className="font-bold text-zinc-900">
                    {language === "es" ? "Notificaciones" : "Notifications"}
                  </Typography>
                  {unreadCount > 0 && (
                    <Chip value={String(unreadCount)} size="sm" color="indigo" className="rounded-full px-2 py-0.5 text-[10px]" />
                  )}
                </div>
                <hr className="border-zinc-100 mb-2" />

                {notifLoading && (
                  <div className="py-6 text-center">
                    <Typography variant="small" className="text-zinc-400 text-xs">
                      {language === "es" ? "Cargando..." : "Loading..."}
                    </Typography>
                  </div>
                )}

                {!notifLoading && notifications.length === 0 && (
                  <div className="py-6 text-center">
                    <BellIcon className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                    <Typography variant="small" className="text-zinc-400 text-xs">
                      {language === "es" ? "Sin notificaciones" : "No notifications"}
                    </Typography>
                  </div>
                )}

                {!notifLoading && notifications.map((notif) => {
                  const title = notif.notification?.title || notif.title || "";
                  const body  = notif.notification?.body  || notif.body  || notif.message || "";
                  const level = (notif.notification?.level || notif.level || "info").toLowerCase().trim();
                  const date  = notif.created_at || notif.notification?.created_at;
                  const { dot } = getLevelStyle(level);
                  return (
                    <div
                      key={notif.id}
                      className={`group flex items-start gap-3 px-3 py-3 rounded-xl mb-1 cursor-pointer transition-colors ${!notif.is_read ? "bg-indigo-50/70" : "hover:bg-zinc-50"}`}
                      onClick={() => { if (!notif.is_read) markRead(notif.id); }}
                    >
                      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${dot}`} />
                      <div className="flex-1 min-w-0">
                        {title && (
                          <p className={`text-[11px] font-semibold leading-tight ${!notif.is_read ? "text-zinc-900" : "text-zinc-500"}`}>
                            {title}
                          </p>
                        )}
                        {body && (
                          <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">{body}</p>
                        )}
                        {date && (
                          <p className="text-[10px] text-zinc-400 mt-1">
                            {new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                      <IconButton
                        size="sm"
                        variant="text"
                        className="h-6 w-6 rounded-full text-zinc-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={(e) => { e.stopPropagation(); dismissNotif(notif.id); }}
                      >
                        <XMarkIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </IconButton>
                    </div>
                  );
                })}

              </MenuList>
            </Menu>

            {/* User profile */}
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
                  <MenuItem className="flex items-center gap-3 py-2 rounded-lg text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900" onClick={() => setOpenProfileDialog(true)}>
                    <PencilSquareIcon className="h-4 w-4" />
                    <Typography variant="small" className="font-medium">{t("sidenav.profile") || "Profile"}</Typography>
                  </MenuItem>
                  <MenuItem className="flex items-center gap-3 py-2 rounded-lg text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900" onClick={() => setOpenStatsDialog(true)}>
                    <ChartBarIcon className="h-4 w-4" />
                    <Typography variant="small" className="font-medium">{language === "es" ? "Estadística" : "Statistics"}</Typography>
                  </MenuItem>
                  <MenuItem className="flex items-center gap-3 py-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700" onClick={logout}>
                    <PowerIcon className="h-4 w-4" />
                    <Typography variant="small" className="font-medium">{t("sidenav.signout") || "Sign Out"}</Typography>
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Link to="/auth/sign-in">
                <Button variant="gradient" color="indigo" size="sm" className="hidden items-center gap-2 xl:flex normal-case shadow-md shadow-indigo-500/20">
                  <UserCircleIcon className="h-4 w-4" />
                  {t("sidenav.signin")}
                </Button>
              </Link>
            )}

            <EditProfileDialog open={openProfileDialog} handler={() => setOpenProfileDialog(false)} />
            <UserStatisticsDialog open={openStatsDialog} handler={() => setOpenStatsDialog(false)} userId={user?.id} />
          </div>
        </div>
      </Navbar>

      {/* Toast notifications — fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          const title = toast.title || toast.notification?.title || "";
          const body  = toast.body  || toast.notification?.body  || toast.message || "";
          const level = (toast.level || toast.notification?.level || "info").toLowerCase().trim();
          const { Icon, ring, cls } = getLevelStyle(level);
          return (
            <div
              key={toast._toastId}
              className={`pointer-events-auto flex items-start gap-3 w-80 bg-white rounded-2xl shadow-2xl ring-1 ${ring} px-4 py-3.5`}
            >
              <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${cls}`} strokeWidth={2} />
              <div className="flex-1 min-w-0">
                {title && <p className="text-[13px] font-semibold text-zinc-900 leading-tight">{title}</p>}
                {body  && <p className="text-[12px] text-zinc-500 mt-0.5 leading-snug">{body}</p>}
              </div>
              <button
                onClick={() => removeToast(toast._toastId)}
                className="shrink-0 text-zinc-300 hover:text-zinc-500 transition-colors mt-0.5"
              >
                <XMarkIcon className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default DashboardNavbar;
