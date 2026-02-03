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
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import authService from "@/services/authService";

export function EditProfileDialog({ open, handler }) {
    const { user, updateUser } = useAuth();
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState("profile");

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
            className="bg-transparent shadow-none"
            size="md"
        >
            <div className="bg-white rounded-[2rem] shadow-2xl border border-zinc-200 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <DialogHeader className="p-0 mb-6 flex flex-col items-start gap-1">
                    <Typography variant="h4" className="font-black text-zinc-900 tracking-tight">
                        {language === 'es' ? 'Editar Perfil' : 'Edit Profile'}
                    </Typography>
                    <Typography className="font-medium text-zinc-500 text-sm">
                        {language === 'es' ? 'Actualiza tu información personal y seguridad.' : 'Update your personal information and security.'}
                    </Typography>
                </DialogHeader>

                <DialogBody className="p-0">
                    <Tabs value={activeTab} className="w-full">
                        <TabsHeader
                            className="rounded-xl bg-zinc-100 p-1"
                            indicatorProps={{
                                className: "bg-white shadow-md rounded-lg",
                            }}
                        >
                            {tabsData.map(({ label, value, icon: Icon }) => (
                                <Tab
                                    key={value}
                                    value={value}
                                    onClick={() => setActiveTab(value)}
                                    className={`font-bold text-xs transition-colors ${activeTab === value ? "text-indigo-600" : "text-zinc-500"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </div>
                                </Tab>
                            ))}
                        </TabsHeader>

                        <TabsBody className="mt-6">
                            {/* PROFILE TAB */}
                            <TabPanel value="profile" className="p-0">
                                <div className="flex flex-col gap-5">
                                    {profileError && (
                                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                                            {profileError}
                                        </div>
                                    )}
                                    {profileSuccess && (
                                        <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                                            {profileSuccess}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="flex flex-col gap-2">
                                            <Typography variant="small" className="font-bold text-zinc-700 ml-1">
                                                {t("global.pages.users.fields.first_name") || (language === 'es' ? 'Nombre' : 'First Name')}
                                            </Typography>
                                            <Input
                                                size="lg"
                                                placeholder="John"
                                                name="first_name"
                                                value={profileData.first_name}
                                                onChange={handleProfileChange}
                                                className="!border-zinc-200 focus:!border-indigo-500 !bg-zinc-50/50 rounded-xl !text-zinc-900 placeholder:text-zinc-400"
                                                labelProps={{
                                                    className: "hidden",
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Typography variant="small" className="font-bold text-zinc-700 ml-1">
                                                {t("global.pages.users.fields.last_name") || (language === 'es' ? 'Apellidos' : 'Last Name')}
                                            </Typography>
                                            <Input
                                                size="lg"
                                                placeholder="Doe"
                                                name="last_name"
                                                value={profileData.last_name}
                                                onChange={handleProfileChange}
                                                className="!border-zinc-200 focus:!border-indigo-500 !bg-zinc-50/50 rounded-xl !text-zinc-900 placeholder:text-zinc-400"
                                                labelProps={{
                                                    className: "hidden",
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Typography variant="small" className="font-bold text-zinc-700 ml-1">
                                            {t("global.pages.users.fields.email") || "Email"}
                                        </Typography>
                                        <Input
                                            size="lg"
                                            placeholder="name@example.com"
                                            type="email"
                                            value={user?.email || ""}
                                            disabled
                                            className="!border-zinc-200 !bg-zinc-100 rounded-xl !text-zinc-500 placeholder:text-zinc-400 cursor-not-allowed"
                                            labelProps={{
                                                className: "hidden",
                                            }}
                                        />
                                        <Typography variant="small" className="text-zinc-400 text-xs ml-1 italic">
                                            {language === 'es' ? 'El correo electrónico no se puede modificar' : 'Email cannot be changed'}
                                        </Typography>
                                    </div>

                                    <Button
                                        variant="gradient"
                                        color="indigo"
                                        onClick={handleProfileSubmit}
                                        loading={profileLoading}
                                        className="mt-4 rounded-xl shadow-lg shadow-indigo-500/20 normal-case font-bold text-sm"
                                        fullWidth
                                    >
                                        {t("global.crud.save") || (language === 'es' ? 'Guardar Cambios' : 'Save Changes')}
                                    </Button>
                                </div>
                            </TabPanel>

                            {/* PASSWORD TAB */}
                            <TabPanel value="password" className="p-0">
                                <div className="flex flex-col gap-5">
                                    {passwordError && (
                                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                                            {passwordError}
                                        </div>
                                    )}
                                    {passwordSuccess && (
                                        <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                                            {passwordSuccess}
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <Typography variant="small" className="font-bold text-zinc-700 ml-1">
                                            {language === 'es' ? 'Contraseña Actual' : 'Current Password'}
                                        </Typography>
                                        <Input
                                            size="lg"
                                            placeholder="••••••••"
                                            name="old_password"
                                            type="password"
                                            value={passwordData.old_password}
                                            onChange={handlePasswordChange}
                                            className="!border-zinc-200 focus:!border-indigo-500 !bg-zinc-50/50 rounded-xl !text-zinc-900 placeholder:text-zinc-400"
                                            labelProps={{
                                                className: "hidden",
                                            }}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Typography variant="small" className="font-bold text-zinc-700 ml-1">
                                            {language === 'es' ? 'Nueva Contraseña' : 'New Password'}
                                        </Typography>
                                        <Input
                                            size="lg"
                                            placeholder="••••••••"
                                            name="new_password"
                                            type="password"
                                            value={passwordData.new_password}
                                            onChange={handlePasswordChange}
                                            className="!border-zinc-200 focus:!border-indigo-500 !bg-zinc-50/50 rounded-xl !text-zinc-900 placeholder:text-zinc-400"
                                            labelProps={{
                                                className: "hidden",
                                            }}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Typography variant="small" className="font-bold text-zinc-700 ml-1">
                                            {language === 'es' ? 'Confirmar Nueva Contraseña' : 'Confirm New Password'}
                                        </Typography>
                                        <Input
                                            size="lg"
                                            placeholder="••••••••"
                                            name="confirm_password"
                                            type="password"
                                            value={passwordData.confirm_password}
                                            onChange={handlePasswordChange}
                                            className="!border-zinc-200 focus:!border-indigo-500 !bg-zinc-50/50 rounded-xl !text-zinc-900 placeholder:text-zinc-400"
                                            labelProps={{
                                                className: "hidden",
                                            }}
                                        />
                                    </div>

                                    <Button
                                        variant="gradient"
                                        color="indigo"
                                        onClick={handlePasswordSubmit}
                                        loading={passwordLoading}
                                        className="mt-4 rounded-xl shadow-lg shadow-indigo-500/20 normal-case font-bold text-sm"
                                        fullWidth
                                    >
                                        {language === 'es' ? 'Cambiar Contraseña' : 'Change Password'}
                                    </Button>
                                </div>
                            </TabPanel>
                        </TabsBody>
                    </Tabs>
                </DialogBody>

                <DialogFooter className="p-0 pt-6 flex gap-3">
                    <Button
                        variant="text"
                        onClick={handler}
                        className="flex-1 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 normal-case font-bold"
                    >
                        {t("global.crud.cancel") || (language === 'es' ? 'Cerrar' : 'Close')}
                    </Button>
                </DialogFooter>
            </div>
        </Dialog>
    );
}

export default EditProfileDialog;
