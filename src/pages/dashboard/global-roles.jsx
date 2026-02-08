import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";
import projectService from "@/services/projectService";

export function GlobalRoles() {
    const { t } = useLanguage();
    const [resourcesMap, setResourcesMap] = React.useState({});

    React.useEffect(() => {
        projectService.getList('resources').then(data => {
            const list = Array.isArray(data) ? data : (data.results || []);
            const map = {};
            list.forEach(r => map[r.id] = r);
            setResourcesMap(map);
        });
    }, []);

    return (
        <GlobalCrudPage
            title={t("global.pages.roles.title")}
            resource="roles"
            editTitle="Editar Rol"
            createTitle="Crear Rol"
            columns={[
                { header: t("global.pages.roles.columns.id"), accessor: "id" },
                { header: t("global.pages.roles.columns.name"), accessor: "name" },
                { header: t("global.pages.roles.columns.description"), accessor: "description" },
            ]}
            fields={[
                { name: "name", label: t("global.pages.roles.fields.name"), type: "text" },
                { name: "description", label: t("global.pages.roles.fields.description"), type: "textarea" },
                {
                    name: "permissions",
                    label: t("global.pages.permissions.title") || "Permissions",
                    type: "select-resource",
                    resource: "permissions", // usa el endpoint /permissions/
                    multiple: true,
                    labelAccessor: (perm) => {
                        // Backend: permission object. resource might be ID or object.
                        // If ID, look up in resourcesMap.
                        const resId = (typeof perm.resource === 'object' && perm.resource !== null) ? perm.resource.id : perm.resource;
                        const res = resourcesMap[resId] || {};
                        const resName = res.name || res.key || `Re: ${resId}`; // Fallback
                        const resDesc = res.description ? ` - ${res.description}` : "";
                        const codeStr = perm.code ? ` (${perm.code})` : "";
                        return `${perm.action} - ${resName}${resDesc}${codeStr}`.trim();
                    },
                    valueAccessor: "id"
                }
            ]}
        />
    );
}

export default GlobalRoles;
