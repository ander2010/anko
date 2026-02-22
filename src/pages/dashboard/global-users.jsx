import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";
import { IconButton } from "@material-tailwind/react";
import { ChartBarIcon } from "@heroicons/react/24/solid";
import { UserStatisticsDialog } from "@/widgets/dialogs/user-statistics-dialog";
import { useState } from "react";

export function GlobalUsers() {
    const { t, language } = useLanguage();
    const [selectedUser, setSelectedUser] = useState(null);
    const [openStats, setOpenStats] = useState(false);

    return (
        <>
            <GlobalCrudPage
                title={t("global.pages.users.title")}
                editTitle={language === "es" ? "Editar Usuario" : "Edit User"}
                createTitle={language === "es" ? "Crear Usuario" : "Create User"}
                resource="users"
                columns={[
                    { header: t("global.pages.users.columns.username"), accessor: "username" },
                    { header: t("global.pages.users.columns.email"), accessor: "email" },
                    { header: t("global.pages.users.columns.first_name"), accessor: "first_name" },
                    { header: t("global.pages.users.columns.last_name"), accessor: "last_name" },
                    {
                        header: t("global.pages.users.columns.is_active"),
                        accessor: (item) => item.is_active ? "✅" : "❌"
                    },
                    {
                        header: t("global.pages.users.columns.is_staff"),
                        accessor: (item) => item.is_staff ? "⭐" : ""
                    },
                    {
                        header: t("global.pages.users.columns.roles"),
                        accessor: (item) => {
                            if (Array.isArray(item.roles)) {
                                return item.roles.map(r => typeof r === 'object' ? r.name : r).join(", ");
                            }
                            return "-";
                        }
                    },
                ]}
                fields={[
                    { name: "username", label: t("global.pages.users.fields.username"), type: "text", excludeOnUpdate: true },
                    { name: "email", label: t("global.pages.users.fields.email"), type: "email" },
                    { name: "first_name", label: t("global.pages.users.fields.first_name"), type: "text" },
                    { name: "last_name", label: t("global.pages.users.fields.last_name"), type: "text" },
                    { name: "is_active", label: t("global.pages.users.fields.is_active"), type: "boolean" },
                    { name: "is_staff", label: t("global.pages.users.fields.is_staff"), type: "boolean" },
                    {
                        name: "roles",
                        label: t("global.pages.users.fields.roles"),
                        type: "select-resource",
                        resource: "roles",
                        labelAccessor: "name",
                        valueAccessor: "id",
                        multiple: true
                    },
                    { name: "avatar", label: t("global.pages.users.fields.avatar"), type: "text", excludeOnUpdate: true },
                    { name: "password", label: t("global.pages.users.fields.password"), type: "password", excludeOnUpdate: true },
                ]}
                extraActions={(item) => (
                    <IconButton
                        variant="text"
                        color="indigo"
                        onClick={() => {
                            setSelectedUser(item);
                            setOpenStats(true);
                        }}
                    >
                        <ChartBarIcon className="h-4 w-4" />
                    </IconButton>
                )}
            />

            <UserStatisticsDialog
                open={openStats}
                handler={() => setOpenStats(false)}
                userId={selectedUser?.id}
            />
        </>
    );
}

export default GlobalUsers;
