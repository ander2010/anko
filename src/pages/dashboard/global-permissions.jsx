import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";
import projectService from "@/services/projectService";

export function GlobalPermissions() {
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
            title={t("global.pages.permissions.title")}
            resource="permissions"
            columns={[
                {
                    header: t("global.pages.permissions.columns.resource"),
                    accessor: (perm) => {
                        const resId = (typeof perm.resource === 'object' && perm.resource !== null) ? perm.resource.id : perm.resource;
                        const res = resourcesMap[resId];
                        return res ? (res.name || res.key) : resId;
                    }
                },
                { header: t("global.pages.permissions.columns.action"), accessor: "action" },
                { header: t("global.pages.permissions.columns.code"), accessor: "code" },
            ]}
            fields={[
                {
                    name: "resource",
                    label: t("global.pages.permissions.fields.resource"),
                    type: "select-resource",
                    resource: "resources",
                    labelAccessor: "name", // Muestra el nombre del recurso en el dropdown
                    valueAccessor: "id"
                },
                { name: "action", label: t("global.pages.permissions.fields.action"), type: "text" },
                { name: "code", label: t("global.pages.permissions.fields.code"), type: "text" },
            ]}
        />
    );
}

export default GlobalPermissions;
