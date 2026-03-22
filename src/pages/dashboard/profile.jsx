import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Switch,
  Tooltip,
  Button,
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
  ArrowUpCircleIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards/index";
import { platformSettingsData, conversationsData, projectsData } from "@/data";
import projectService from "@/services/projectService";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { EditProfileDialog } from "@/widgets/dialogs/edit-profile-dialog";
import { UserStatisticsDialog } from "@/widgets/dialogs/user-statistics-dialog";

export function Profile() {
  const { user, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const [membership, setMembership] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    async function fetchMembership() {
      try {
        const data = await projectService.getMembershipStatus();
        setMembership(data);
      } catch (err) {
        console.error("Failed to fetch membership", err);
      }
    }
    fetchMembership();
  }, []);

  return (
    <>
      {/* ═══ MOBILE PROFILE — full page, hidden on desktop ═══ */}
      <div className="md:hidden min-h-screen bg-zinc-50 pb-24">
        {/* Top: avatar + name */}
        <div className="flex flex-col items-center pt-10 pb-6 px-4">
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--ank-purple), #534AB7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "26px", fontWeight: 800,
            boxShadow: "0 4px 16px rgba(127,119,221,0.35)",
          }}>
            {(user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase()}
          </div>
          <p style={{ fontSize: "17px", fontWeight: 700, color: "#1a1a2e", marginTop: "12px" }}>
            {user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user?.username || ""}
          </p>
          <p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{user?.email || ""}</p>
          {membership?.tier && (
            <span style={{ marginTop: "8px", background: "#FAEEDA", color: "#854F0B", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "10px" }}>
              {membership.tier}
            </span>
          )}
        </div>

        {/* Language toggle */}
        <div className="flex justify-center gap-2 mb-6">
          {["es", "en"].map(lang => (
            <button key={lang} onClick={() => changeLanguage(lang)} style={{
              padding: "6px 18px", borderRadius: "10px", fontSize: "12px", fontWeight: 600,
              background: language === lang ? "var(--ank-purple)" : "#fff",
              color: language === lang ? "#fff" : "#888",
              border: `1px solid ${language === lang ? "var(--ank-purple)" : "#e5e7eb"}`,
              cursor: "pointer",
            }}>
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Menu items */}
        <div className="mx-4 bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
          <button
            onClick={() => setShowEditProfile(true)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", background: "none", border: "none", borderBottom: "1px solid #f5f5f5", cursor: "pointer", textAlign: "left" }}
          >
            <span style={{ width: 36, height: 36, borderRadius: "10px", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>👤</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a2e" }}>{language === "es" ? "Mi Perfil" : "My Profile"}</p>
              <p style={{ fontSize: "10px", color: "#888" }}>{language === "es" ? "Editar nombre y contraseña" : "Edit name and password"}</p>
            </div>
            <span style={{ color: "#ccc", fontSize: "16px" }}>›</span>
          </button>

          <button
            onClick={() => setShowStats(true)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", background: "none", border: "none", borderBottom: "1px solid #f5f5f5", cursor: "pointer", textAlign: "left" }}
          >
            <span style={{ width: 36, height: 36, borderRadius: "10px", background: "#E6F5F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>📊</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a2e" }}>{language === "es" ? "Estadísticas" : "Statistics"}</p>
              <p style={{ fontSize: "10px", color: "#888" }}>{language === "es" ? "Tu progreso de estudio" : "Your study progress"}</p>
            </div>
            <span style={{ color: "#ccc", fontSize: "16px" }}>›</span>
          </button>

          <button
            onClick={logout}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            <span style={{ width: 36, height: 36, borderRadius: "10px", background: "#FFF5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>🚪</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#e53e3e" }}>{language === "es" ? "Cerrar Sesión" : "Sign Out"}</p>
              <p style={{ fontSize: "10px", color: "#888" }}>{language === "es" ? "Salir de tu cuenta" : "Log out of your account"}</p>
            </div>
            <span style={{ color: "#ccc", fontSize: "16px" }}>›</span>
          </button>
        </div>

        <EditProfileDialog open={showEditProfile} handler={() => setShowEditProfile(false)} />
        <UserStatisticsDialog open={showStats} handler={() => setShowStats(false)} userId={user?.id} />
      </div>

      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover	bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <Avatar
                src={user?.avatar || "/img/bruce-mars.jpeg"}
                alt="bruce-mars"
                size="xl"
                variant="rounded"
                className="rounded-lg shadow-lg shadow-blue-gray-500/40"
              />
              <div>
                <Typography variant="h5" color="blue-gray" className="mb-1">
                  {user?.name || user?.username || "Richard Davis"}
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-600"
                >
                  {user?.email || "CEO / Co-Founder"}
                </Typography>
              </div>
            </div>
            <div className="w-96">
              <Tabs value="app">
                <TabsHeader>
                  <Tab value="app">
                    <HomeIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                    App
                  </Tab>
                  <Tab value="message">
                    <ChatBubbleLeftEllipsisIcon className="-mt-0.5 mr-2 inline-block h-5 w-5" />
                    Message
                  </Tab>
                  <Tab value="settings">
                    <Cog6ToothIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                    Settings
                  </Tab>
                </TabsHeader>
              </Tabs>
            </div>
          </div>
          <div className="gird-cols-1 mb-12 grid gap-12 px-4 lg:grid-cols-2 xl:grid-cols-3">
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-3">
                Platform Settings
              </Typography>
              <div className="flex flex-col gap-12">
                {platformSettingsData.map(({ title, options }) => (
                  <div key={title}>
                    <Typography className="mb-4 block text-xs font-semibold uppercase text-blue-gray-500">
                      {title}
                    </Typography>
                    <div className="flex flex-col gap-6">
                      {options.map(({ checked, label }) => (
                        <Switch
                          key={label}
                          id={label}
                          label={label}
                          defaultChecked={checked}
                          labelProps={{
                            className: "text-sm font-normal text-blue-gray-500",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <ProfileInfoCard
              title="Profile Information"
              description="Hi, I'm Alec Thompson, Decisions: If you can't decide, the answer is no. If two equally difficult paths, choose the one more painful in the short term (pain avoidance is creating an illusion of equality)."
              details={{
                "first name": user?.name || "Alec M. Thompson",
                mobile: user?.phone || "(44) 123 1234 123",
                email: user?.email || "alecthompson@mail.com",
                location: user?.location || "USA",
                social: (
                  <div className="flex items-center gap-4">
                    <i className="fa-brands fa-facebook text-blue-700" />
                    <i className="fa-brands fa-twitter text-blue-400" />
                    <i className="fa-brands fa-instagram text-purple-500" />
                  </div>
                ),
                membership: (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-gray-700">
                      {membership?.tier || "Free"}
                    </span>
                    {membership?.tier === "Free" && (
                      <Link to="/dashboard/memberships">
                        <Button
                          size="sm"
                          color="amber"
                          className="flex items-center gap-2 py-1 px-2 capitalize"
                        >
                          <ArrowUpCircleIcon className="h-4 w-4" />
                          Upgrade
                        </Button>
                      </Link>
                    )}
                  </div>
                ),
              }}
              action={
                <Tooltip content="Edit Profile">
                  <PencilIcon className="h-4 w-4 cursor-pointer text-blue-gray-500" />
                </Tooltip>
              }
            />
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-3">
                Platform Settings
              </Typography>
              <ul className="flex flex-col gap-6">
                {conversationsData.map((props) => (
                  <MessageCard
                    key={props.name}
                    {...props}
                    action={
                      <Button variant="text" size="sm">
                        reply
                      </Button>
                    }
                  />
                ))}
              </ul>
            </div>
          </div>
          <div className="px-4 pb-4">
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Projects
            </Typography>
            <Typography
              variant="small"
              className="font-normal text-blue-gray-500"
            >
              Architects design houses
            </Typography>
            <div className="mt-6 grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-4">
              {projectsData.map(
                ({ img, title, description, tag, route, members }) => (
                  <Card key={title} color="transparent" shadow={false}>
                    <CardHeader
                      floated={false}
                      color="gray"
                      className="mx-0 mt-0 mb-4 h-64 xl:h-40"
                    >
                      <img
                        src={img}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                    </CardHeader>
                    <CardBody className="py-0 px-1">
                      <Typography
                        variant="small"
                        className="font-normal text-blue-gray-500"
                      >
                        {tag}
                      </Typography>
                      <Typography
                        variant="h5"
                        color="blue-gray"
                        className="mt-1 mb-2"
                      >
                        {title}
                      </Typography>
                      <Typography
                        variant="small"
                        className="font-normal text-blue-gray-500"
                      >
                        {description}
                      </Typography>
                    </CardBody>
                    <CardFooter className="mt-6 flex items-center justify-between py-0 px-1">
                      <Link to={route}>
                        <Button variant="outlined" size="sm">
                          view project
                        </Button>
                      </Link>
                      <div>
                        {members.map(({ img, name }, key) => (
                          <Tooltip key={name} content={name}>
                            <Avatar
                              src={img}
                              alt={name}
                              size="xs"
                              variant="circular"
                              className={`cursor-pointer border-2 border-white ${key === 0 ? "" : "-ml-2.5"
                                }`}
                            />
                          </Tooltip>
                        ))}
                      </div>
                    </CardFooter>
                  </Card>
                )
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;
