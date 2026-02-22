import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Textarea,
    Select,
    Option,
    IconButton,
    Checkbox,
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";

export function GlobalCrudPage({ title, resource, columns, fields, extraParams = {}, extraActions = null, editTitle, createTitle }) {
    const languageContext = useLanguage();

    if (!languageContext) {
        return <div className="p-4 text-red-500">Error: Language Context is null. Check Provider wrapping.</div>;
    }

    const { t } = languageContext;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [selectOptions, setSelectOptions] = useState({});

    useEffect(() => {
        fetchItems();
        fetchSelectOptions();
    }, [resource]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await projectService.getList(resource, extraParams);
            if (Array.isArray(data)) {
                setItems(data);
            } else if (data && Array.isArray(data.results)) {
                setItems(data.results);
            } else {
                console.error(`Expected array for ${resource} but got:`, data);
                setItems([]);
            }
        } catch (error) {
            console.error(`Failed to fetch ${resource}`, error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSelectOptions = async () => {
        const selectFields = fields.filter((f) => f.type === "select-resource");
        const options = {};

        await Promise.all(
            selectFields.map(async (field) => {
                try {
                    if (field.resource) {
                        const data = await projectService.getList(field.resource);
                        if (Array.isArray(data)) {
                            options[field.name] = data;
                        } else if (data && Array.isArray(data.results)) {
                            options[field.name] = data.results;
                        } else {
                            options[field.name] = [];
                        }
                    }
                } catch (err) {
                    console.error(`Failed to fetch options for ${field.name}`, err);
                    options[field.name] = [];
                }
            })
        );
        setSelectOptions(options);
    };

    const handleOpenDialog = (item = null) => {
        setCurrentItem(item);
        if (item) {
            const initialData = { ...item };
            // Normalize multi-select fields (convert objects to IDs)
            fields.forEach(f => {
                if (f.type === "select-resource" && f.multiple && Array.isArray(initialData[f.name])) {
                    initialData[f.name] = initialData[f.name].map(val =>
                        (typeof val === 'object' && val !== null) ? val[f.valueAccessor || 'id'] : val
                    );
                }
            });
            setFormData(initialData);
        } else {
            const initial = {};
            fields.forEach((f) => {
                if (f.defaultValue !== undefined) initial[f.name] = f.defaultValue;
                else if (f.type === "boolean") initial[f.name] = false;
                else if (f.multiple) initial[f.name] = [];
                else initial[f.name] = "";
            });
            setFormData(initial);
        }
        setOpenDialog(true);
    };

    const handleSave = async () => {
        try {
            if (currentItem) {
                // Filter payload to exclude fields marked with excludeOnUpdate
                const updatePayload = {};
                Object.keys(formData).forEach(key => {
                    const fieldConfig = fields.find(f => f.name === key);
                    if (!fieldConfig || !fieldConfig.excludeOnUpdate) {
                        updatePayload[key] = formData[key];
                    }
                });
                await projectService.updateItem(resource, currentItem.id, updatePayload);
            } else {
                await projectService.createItem(resource, formData);
            }
            setOpenDialog(false);
            fetchItems();
        } catch (error) {
            console.error("Failed to save item", error);
            let msg = error.detail || error.message || JSON.stringify(error);
            if (error.response && error.response.data) {
                msg = JSON.stringify(error.response.data);
            }
            alert(`Error saving item: ${msg}`);
        }
    };

    const handleDelete = async () => {
        try {
            if (currentItem) {
                await projectService.deleteItem(resource, currentItem.id);
                setOpenDeleteDialog(false);
                fetchItems();
            }
        } catch (error) {
            console.error("Failed to delete item", error);
        }
    };

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const getCellValue = (item, accessor) => {
        if (typeof accessor === "function") return accessor(item);
        return item[accessor];
    };

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between items-center">
                    <Typography variant="h6" color="white">
                        {title}
                    </Typography>
                    <Button size="sm" color="white" className="flex items-center gap-2 text-gray-900" onClick={() => handleOpenDialog()}>
                        <PlusIcon strokeWidth={2} className="h-4 w-4" /> {t("global.crud.add_new")}
                    </Button>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.header} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                        <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                                            {col.header}
                                        </Typography>
                                    </th>
                                ))}
                                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                                        {t("global.crud.actions")}
                                    </Typography>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, key) => {
                                const className = `py-3 px-5 ${key === items.length - 1 ? "" : "border-b border-blue-gray-50"}`;

                                return (
                                    <tr key={item.id || key}>
                                        {columns.map((col) => (
                                            <td key={col.header} className={className}>
                                                <div className="text-xs font-semibold text-blue-gray-600">
                                                    {getCellValue(item, col.accessor)}
                                                </div>
                                            </td>
                                        ))}
                                        <td className={className}>
                                            <div className="flex gap-2">
                                                <IconButton variant="text" color="blue-gray" onClick={() => handleOpenDialog(item)}>
                                                    <PencilIcon className="h-4 w-4" />
                                                </IconButton>
                                                {extraActions && extraActions(item)}
                                                <IconButton variant="text" color="red" onClick={() => { setCurrentItem(item); setOpenDeleteDialog(true); }}>
                                                    <TrashIcon className="h-4 w-4" />
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {items.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={columns.length + 1} className="py-6 text-center text-sm text-gray-500">
                                        {t("global.crud.no_items")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            <Dialog open={openDialog} handler={() => setOpenDialog(!openDialog)}>
                <DialogHeader>{currentItem ? (editTitle || t("global.crud.edit_item")) : (createTitle || t("global.crud.create_item"))}</DialogHeader>
                <DialogBody divider className="flex flex-col gap-4">
                    {fields.map((field) => {
                        if (field.type === "select-resource") {
                            const opts = selectOptions[field.name] || [];
                            const labelKey = field.labelAccessor || 'name';
                            const valueKey = field.valueAccessor || 'id';

                            if (field.multiple) {
                                return (
                                    <div key={field.name} className="flex flex-col gap-2 border border-blue-gray-50 p-2 rounded-lg">
                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                            {field.label}
                                        </Typography>
                                        <div className="max-h-40 overflow-y-auto flex flex-col gap-1 p-1">
                                            {opts.map(opt => {
                                                const val = opt[valueKey];
                                                const currentVals = Array.isArray(formData[field.name]) ? formData[field.name] : [];
                                                const isChecked = currentVals.some(v => String(v) === String(val));

                                                return (
                                                    <div key={val} className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={`${field.name}-${val}`}
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                const newVals = e.target.checked
                                                                    ? [...currentVals, val]
                                                                    : currentVals.filter(v => String(v) !== String(val));
                                                                handleChange(field.name, newVals);
                                                            }}
                                                        />
                                                        <label htmlFor={`${field.name}-${val}`} className="text-xs text-blue-gray-600 cursor-pointer">
                                                            {typeof labelKey === 'function' ? labelKey(opt) : (opt[labelKey] || opt.title || opt.email || "Unknown")}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={field.name} className="flex flex-col gap-2">
                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                        {field.label}
                                    </Typography>
                                    <Select
                                        label={`${t("global.crud.select")} ${field.label}`}
                                        value={String(formData[field.name] || "")}
                                        onChange={(val) => handleChange(field.name, val)}
                                        animate={{
                                            mount: { y: 0 },
                                            unmount: { y: 25 },
                                        }}
                                    >
                                        {opts.map(opt => (
                                            <Option key={opt[valueKey]} value={String(opt[valueKey])}>
                                                {typeof labelKey === 'function' ? labelKey(opt) : (opt[labelKey] || opt.title || opt.email || "Unknown")}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            );
                        } else if (field.type === "select") {
                            return (
                                <div key={field.name} className="flex flex-col gap-2">
                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                        {field.label}
                                    </Typography>
                                    <Select
                                        label={`${t("global.crud.select")} ${field.label}`}
                                        value={String(formData[field.name] || "")}
                                        onChange={(val) => handleChange(field.name, val)}
                                        animate={{
                                            mount: { y: 0 },
                                            unmount: { y: 25 },
                                        }}
                                    >
                                        {(field.options || []).map(opt => (
                                            <Option key={opt.value} value={String(opt.value)}>
                                                {opt.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            );
                        } else if (field.type === "textarea") {
                            return (
                                <Textarea
                                    key={field.name}
                                    label={field.label}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                />
                            )
                        } else if (field.type === "boolean") {
                            return (
                                <div key={field.name} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={!!formData[field.name]}
                                        onChange={(e) => handleChange(field.name, e.target.checked)}
                                    />
                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                        {field.label}
                                    </Typography>
                                </div>
                            )
                        } else {
                            return (
                                <Input
                                    key={field.name}
                                    type={field.type || "text"}
                                    label={field.label}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                />
                            );
                        }
                    })}
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={() => setOpenDialog(false)} className="mr-1">
                        {t("global.crud.cancel")}
                    </Button>
                    <Button variant="gradient" color="green" onClick={handleSave}>
                        {t("global.crud.save")}
                    </Button>
                </DialogFooter>
            </Dialog>

            <Dialog open={openDeleteDialog} handler={() => setOpenDeleteDialog(!openDeleteDialog)}>
                <DialogHeader>{t("global.crud.delete_title")}</DialogHeader>
                <DialogBody>
                    {t("global.crud.delete_message")}
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="blue-gray" onClick={() => setOpenDeleteDialog(false)} className="mr-1">
                        {t("global.crud.cancel")}
                    </Button>
                    <Button variant="gradient" color="red" onClick={handleDelete}>
                        {t("global.crud.delete")}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}

export default GlobalCrudPage;
