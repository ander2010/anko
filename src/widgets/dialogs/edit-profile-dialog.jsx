import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Typography,
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
} from "@material-tailwind/react";
import { UserCircleIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import authService from "@/services/authService";
import projectService from "@/services/projectService";

export function EditProfileDialog({ open, handler }) {
    const { user, updateUser } = useAuth();
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState("profile");
    const [membership, setMembership] = useState(null);

    // Profile form state
    const [profileData, setProfileData] = useState({
        first_name: "",
        last_name: "",
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");

    // Password form state
    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    useEffect(() => {
        if (user && open) {
            setProfileData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
            });
            setProfileError("");
            setProfileSuccess("");
            setPasswordData({
                old_password: "",
                new_password: "",
                confirm_password: "",
            });
            setPasswordError("");
            setPasswordSuccess("");
            setActiveTab("profile");

            // Fetch membership
            const fetchMembership = async () => {
                try {
                    const data = await projectService.getMembershipStatus();
                    setMembership(data);
                } catch (error) {
                    console.error("Failed to fetch membership", error);
                }
            };
            fetchMembership();
        }
    }, [user, open]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async () => {
        setProfileError("");
        setProfileSuccess("");
        setProfileLoading(true);
        try {
            await updateUser(profileData);
            setProfileSuccess(language === 'es' ? 'Perfil actualizado correctamente' : 'Profile updated successfully');
        } catch (err) {
            console.error("Failed to update profile", err);
            setProfileError(err.error || err.detail || (language === 'es' ? 'Error al actualizar perfil' : 'Failed to update profile'));
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordError(t("auth.passwords_dont_match") || (language === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match'));
            return;
        }

        if (!passwordData.old_password || !passwordData.new_password) {
            setPasswordError(language === 'es' ? 'Por favor completa todos los campos' : 'Please fill all fields');
            return;
        }

        setPasswordLoading(true);
        try {
            await authService.changePassword({
                old_password: passwordData.old_password,
                new_password: passwordData.new_password,
            });
            setPasswordSuccess(language === 'es' ? 'Contraseña cambiada correctamente' : 'Password changed successfully');
            setPasswordData({
                old_password: "",
                new_password: "",
                confirm_password: "",
            });
        } catch (err) {
            console.error("Failed to change password", err);
            setPasswordError(err.detail || err.error || (language === 'es' ? 'Error al cambiar contraseña' : 'Failed to change password'));
        } finally {
            setPasswordLoading(false);
        }
    };

    const tabsData = [
        {
            label: language === 'es' ? 'Datos Personales' : 'Personal Info',
            value: "profile",
            icon: UserCircleIcon,
        },
        {
            label: language === 'es' ? 'Cambiar Contraseña' : 'Change Password',
            value: "password",
            icon: LockClosedIcon,
        },
    ];

    return (
        <Dialog
            open={open}
            handler={handler}
            className="bg-transparent shadow-none !mx-3 md:!mx-auto"
            size="md"
        >
            <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-2xl border border-zinc-200 p-4 md:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                {/* Header */}
                <DialogHeader className="p-0 mb-3 md:mb-6 flex flex-col items-start gap-0.5">
                    <p className="font-black text-zinc-900 tracking-tight" style={{ fontSize: "15px" }}>
                        {language === 'es' ? 'Editar Perfil' : 'Edit Profile'}
                    </p>
                    <p className="font-medium text-zinc-500" style={{ fontSize: "11px" }}>
                        {language === 'es' ? 'Actualiza tu información personal y seguridad.' : 'Update your personal information and security.'}
                    </p>
                </DialogHeader>

                <DialogBody className="p-0">
                    <Tabs value={activeTab} className="w-full">
                        <TabsHeader
                            className="rounded-xl bg-zinc-100 p-1"
                            indicatorProps={{ className: "bg-white shadow-md rounded-lg" }}
                        >
                            {tabsData.map(({ label, value, icon: Icon }) => (
                                <Tab
                                    key={value}
                                    value={value}
                                    onClick={() => setActiveTab(value)}
                                    className={`font-bold transition-colors ${activeTab === value ? "text-indigo-600" : "text-zinc-500"}`}
                                    style={{ fontSize: "11px" }}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        <span className="hidden md:inline">{label}</span>
                                        <span className="md:hidden">{label.split(" ")[0]}</span>
                                    </div>
                                </Tab>
                            ))}
                        </TabsHeader>

                        <TabsBody className="mt-3 md:mt-6">
                            {/* PROFILE TAB */}
                            <TabPanel value="profile" className="p-0">
                                <div className="flex flex-col gap-3 md:gap-5">
                                    {profileError && (
                                        <div className="p-2.5 md:p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold" style={{ fontSize: "11px" }}>
                                            {profileError}
                                        </div>
                                    )}
                                    {profileSuccess && (
                                        <div className="p-2.5 md:p-4 rounded-xl bg-green-50 border border-green-100 text-green-600 font-bold" style={{ fontSize: "11px" }}>
                                            {profileSuccess}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
                                        <div className="flex flex-col gap-1">
                                            <p className="font-bold text-zinc-700 ml-1" style={{ fontSize: "11px" }}>
                                                {t("global.pages.users.fields.first_name") || (language === 'es' ? 'Nombre' : 'First Name')}
                                            </p>
                                            <Input
                                                size="md"
                                                placeholder="John"
                                                name="first_name"
                                                value={profileData.first_name}
                                                onChange={handleProfileChange}
                                                className="!border-zinc-200 focus:!border-indigo-500 !bg-zinc-50/50 rounded-xl !text-zinc-900 placeholder:text-zinc-400"
                                                labelProps={{ className: "hidden" }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-bold text-zinc-700 ml-1" style={{ fontSize: "11px" }}>
                                                {t("global.pages.users.fields.last_name") || (language === 'es' ? 'Apellidos' : 'Last Name')}
                                            </p>
                                            <Input
                                                size="md"
                                                placeholder=""
                                                name="last_name"
                                                value={profileData.last_name}
                                                onChange={handleProfileChange}
                                                className="!border-zinc-200 focus:!border-indigo-500 !bg-zinc-50/50 rounded-xl !text-zinc-900 placeholder:text-zinc-400"
                                                labelProps={{ className: "hidden" }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold text-zinc-700 ml-1" style={{ fontSize: "11px" }}>
                                            {t("global.pages.users.fields.email") || "Email"}
                                        </p>
                                        <Input
                                            size="md"
                                            placeholder="name@example.com"
                                            type="email"
                                            value={user?.email || ""}
                                            disabled
                                            className="!border-zinc-200 !bg-zinc-100 rounded-xl !text-zinc-500 placeholder:text-zinc-400 cursor-not-allowed"
                                            labelProps={{ className: "hidden" }}
                                        />
                                        <p className="text-zinc-400 ml-1 italic" style={{ fontSize: "10px" }}>
                                            {language === 'es' ? 'El correo no se puede modificar' : 'Email cannot be changed'}
                                        </p>
                                    </div>

                                    {/* Membership — compact on mobile */}
                                    <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-3 md:p-6 shadow-lg">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                                        <div className="relative z-10 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                </svg>
                                                <div>
                                                    <p className="font-black text-white uppercase tracking-wide" style={{ fontSize: "9px" }}>
                                                        {language === 'es' ? 'Membresía' : 'Membership'}
                                                    </p>
                                                    <p className="font-black text-white uppercase" style={{ fontSize: "14px", lineHeight: 1 }}>
                                                        {membership?.tier || "Free"}
                                                    </p>
                                                    {membership?.remaining_days && (
                                                        <p className="text-white/80" style={{ fontSize: "9px" }}>
                                                            {membership.remaining_days} {language === 'es' ? 'días' : 'days'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {(membership?.tier === "Free" || !membership?.tier) && (
                                                <button
                                                    onClick={() => window.location.href = '/dashboard/billing'}
                                                    style={{ background: "#fff", color: "#ea580c", borderRadius: "10px", padding: "5px 12px", fontSize: "11px", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                    {language === 'es' ? 'Mejorar' : 'Upgrade'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleProfileSubmit}
                                        disabled={profileLoading}
                                        style={{ width: "100%", padding: "10px", borderRadius: "12px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: "12px", fontWeight: 700, border: "none", cursor: profileLoading ? "not-allowed" : "pointer", opacity: profileLoading ? 0.7 : 1 }}
                                    >
                                        {profileLoading ? "..." : (t("global.crud.save") || (language === 'es' ? 'Guardar Cambios' : 'Save Changes'))}
                                    </button>
                                </div>
                            </TabPanel>

                            {/* PASSWORD TAB */}
                            <TabPanel value="password" className="p-0">
                                <div className="flex flex-col gap-3 md:gap-5">
                                    {passwordError && (
                                        <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold" style={{ fontSize: "11px" }}>
                                            {passwordError}
                                        </div>
                                    )}
                                    {passwordSuccess && (
                                        <div className="p-2.5 rounded-xl bg-green-50 border border-green-100 text-green-600 font-bold" style={{ fontSize: "11px" }}>
                                            {passwordSuccess}
                                        </div>
                                    )}

                                    {[
                                        { label: language === 'es' ? 'Contraseña Actual' : 'Current Password', name: "old_password", show: showOldPassword, setShow: setShowOldPassword },
                                        { label: language === 'es' ? 'Nueva Contraseña' : 'New Password', name: "new_password", show: showNewPassword, setShow: setShowNewPassword },
                                        { label: language === 'es' ? 'Confirmar Nueva' : 'Confirm New', name: "confirm_password", show: showConfirmPassword, setShow: setShowConfirmPassword },
                                    ].map(({ label, name, show, setShow }) => (
                                        <div key={name} className="flex flex-col gap-1">
                                            <p className="font-bold text-zinc-700 ml-1" style={{ fontSize: "11px" }}>{label}</p>
                                            <div className="relative">
                                                <Input
                                                    size="md"
                                                    placeholder="••••••••"
                                                    name={name}
                                                    type={show ? "text" : "password"}
                                                    value={passwordData[name]}
                                                    onChange={handlePasswordChange}
                                                    className="!border-zinc-200 focus:!border-indigo-500 !bg-zinc-50/50 rounded-xl !text-zinc-900 pr-10"
                                                    labelProps={{ className: "hidden" }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShow(!show)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                                    tabIndex={-1}
                                                >
                                                    {show ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {name === "confirm_password" && passwordData.confirm_password && passwordData.new_password && passwordData.confirm_password !== passwordData.new_password && (
                                                <p className="text-red-500 ml-1" style={{ fontSize: "10px" }}>
                                                    {language === 'es' ? 'Las contraseñas no coinciden' : 'Passwords must match'}
                                                </p>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        onClick={handlePasswordSubmit}
                                        disabled={passwordLoading}
                                        style={{ width: "100%", padding: "10px", borderRadius: "12px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: "12px", fontWeight: 700, border: "none", cursor: passwordLoading ? "not-allowed" : "pointer", opacity: passwordLoading ? 0.7 : 1 }}
                                    >
                                        {passwordLoading ? "..." : (language === 'es' ? 'Cambiar Contraseña' : 'Change Password')}
                                    </button>
                                </div>
                            </TabPanel>
                        </TabsBody>
                    </Tabs>
                </DialogBody>

                <DialogFooter className="p-0 pt-3 md:pt-6 flex gap-3">
                    <button
                        onClick={handler}
                        style={{ flex: 1, padding: "9px", borderRadius: "12px", background: "#f5f5f5", color: "#888", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer" }}
                    >
                        {t("global.crud.cancel") || (language === 'es' ? 'Cerrar' : 'Close')}
                    </button>
                </DialogFooter>
            </div>
        </Dialog>
    );
}

export default EditProfileDialog;
