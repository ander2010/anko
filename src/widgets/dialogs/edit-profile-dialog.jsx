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
    const { t } = useLanguage();
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
        <Dialog open={open} handler={handler}>
            <DialogHeader divider>
                <Typography variant="h5" color="blue-gray">
                    {t("global.crud.edit_item") || "Edit Profile"}
                </Typography>
            </DialogHeader>
            <DialogBody divider className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                {error && (
                    <Typography variant="small" color="red" className="font-medium">
                        {error}
                    </Typography>
                )}
                <div className="flex flex-col gap-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">
                        {t("global.pages.users.fields.first_name") || "First Name"}
                    </Typography>
                    <Input
                        label={t("global.pages.users.fields.first_name") || "First Name"}
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">
                        {t("global.pages.users.fields.last_name") || "Last Name"}
                    </Typography>
                    <Input
                        label={t("global.pages.users.fields.last_name") || "Last Name"}
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">
                        {t("global.pages.users.fields.email") || "Email"}
                    </Typography>
                    <Input
                        label={t("global.pages.users.fields.email") || "Email"}
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <hr className="my-2 border-blue-gray-50" />
                <div className="flex flex-col gap-2">
                    <Typography variant="small" color="blue-gray" className="font-medium text-blue-500">
                        {t("global.pages.users.fields.password") || "Password (leave blank to keep)"}
                    </Typography>
                    <Input
                        label={t("global.pages.users.fields.password") || "Password"}
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">
                        {t("global.pages.users.fields.confirm_password") || "Confirm Password"}
                    </Typography>
                    <Input
                        label={t("global.pages.users.fields.confirm_password") || "Confirm Password"}
                        name="confirm_password"
                        type="password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                    />
                </div>
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="red" onClick={handler} className="mr-1" disabled={loading}>
                    {t("global.crud.cancel") || "Cancel"}
                </Button>
                <Button variant="gradient" color="green" onClick={handleSubmit} loading={loading}>
                    {t("global.crud.save") || "Save"}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

export default EditProfileDialog;
