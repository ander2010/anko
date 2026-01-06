import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Typography,
} from "@material-tailwind/react";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";

export function EditProfileDialog({ open, handler }) {
    const { user, updateUser } = useAuth();
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user && open) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                password: "",
                confirm_password: "",
            });
            setError("");
        }
    }, [user, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setError("");
        if (formData.password && formData.password !== formData.confirm_password) {
            setError(t("auth.passwords_dont_match") || "Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const payload = { ...formData };
            delete payload.confirm_password;
            if (!payload.password) delete payload.password;

            await updateUser(payload);
            handler();
        } catch (err) {
            console.error("Failed to update profile", err);
            setError(err.error || err.detail || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            handler={handler}
            className="bg-transparent shadow-none"
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

                <DialogBody className="p-0 flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                            <Typography variant="small" className="font-bold text-zinc-700 ml-1">
                                {t("global.pages.users.fields.first_name") || "First Name"}
                            </Typography>
                            <Input
                                size="lg"
                                placeholder="John"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="!border-zinc-200 focus:!border-indigo-500 !bg-zinc-50/50 rounded-xl !text-zinc-900 placeholder:text-zinc-400"
                                labelProps={{
                                    className: "hidden",
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Typography variant="small" className="font-bold text-zinc-700 ml-1">
                                {t("global.pages.users.fields.last_name") || "Last Name"}
                            </Typography>
                            <Input
                                size="lg"
                                placeholder="Doe"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
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
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="!border-zinc-200 focus:!border-indigo-500 !bg-zinc-50/50 rounded-xl !text-zinc-900 placeholder:text-zinc-400"
                            labelProps={{
                                className: "hidden",
                            }}
                        />
                    </div>

                    <div className="my-2 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <Typography variant="small" className="font-bold text-indigo-600 mb-4 block uppercase tracking-wider text-[10px]">
                            {language === 'es' ? 'Seguridad' : 'Security'}
                        </Typography>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Typography variant="small" className="font-bold text-zinc-700 ml-1">
                                    {t("global.pages.users.fields.password") || "New Password"}
                                </Typography>
                                <Input
                                    size="lg"
                                    placeholder="••••••••"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="!border-zinc-200 focus:!border-indigo-500 !bg-white rounded-xl !text-zinc-900 placeholder:text-zinc-400"
                                    labelProps={{
                                        className: "hidden",
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Typography variant="small" className="font-bold text-zinc-700 ml-1">
                                    {t("global.pages.users.fields.confirm_password") || "Confirm Password"}
                                </Typography>
                                <Input
                                    size="lg"
                                    placeholder="••••••••"
                                    name="confirm_password"
                                    type="password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    className="!border-zinc-200 focus:!border-indigo-500 !bg-white rounded-xl !text-zinc-900 placeholder:text-zinc-400"
                                    labelProps={{
                                        className: "hidden",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </DialogBody>

                <DialogFooter className="p-0 pt-6 flex gap-3">
                    <Button
                        variant="text"
                        onClick={handler}
                        className="flex-1 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 normal-case font-bold"
                        disabled={loading}
                    >
                        {t("global.crud.cancel") || "Cancel"}
                    </Button>
                    <Button
                        variant="gradient"
                        color="indigo"
                        onClick={handleSubmit}
                        loading={loading}
                        className="flex-1 rounded-xl shadow-lg shadow-indigo-500/20 normal-case font-bold text-sm"
                    >
                        {t("global.crud.save") || "Save Changes"}
                    </Button>
                </DialogFooter>
            </div>
        </Dialog>
    );
}

export default EditProfileDialog;
