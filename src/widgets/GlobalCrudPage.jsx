import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    IconButton,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Textarea,
    Select,
    Option,
    Spinner,
    Checkbox,
} from "@material-tailwind/react";
import { PencilSquareIcon, TrashIcon, PlusIcon, TableCellsIcon } from "@heroicons/react/24/outline";
import projectService from "@/services/projectService";
import { ConfirmDialog } from "@/widgets/dialogs/confirm-dialog";
import { useLanguage } from "@/context/language-context";

export function GlobalCrudPage({
    resource,
    title,
    columns = [], // [{ header: "Name", accessor: "name" }]
    fields = [],  // [{ name: "name", label: "Name", type: "text" }]
}) {
    const { t, language } = useLanguage();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dialogs
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState({});

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await projectService.getList(resource);
            // Handle pagination results vs list
            const list = Array.isArray(result) ? result : (result.results || []);
            setData(list);
        } catch (err) {
            console.error(err);
            setError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resource]);

    const handleCreate = () => {
        setIsEditing(false);
        // Initialize defaults
        const defaults = {};
        fields.forEach(f => {
            defaults[f.name] = f.defaultValue !== undefined ? f.defaultValue : "";
            if (f.type === "boolean") defaults[f.name] = false;
        });
        setCurrentItem(defaults);
        setOpenDialog(true);
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setCurrentItem({ ...item }); // Clone
        setOpenDialog(true);
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setConfirmDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await projectService.deleteItem(resource, itemToDelete.id);
            setConfirmDialogOpen(false);
            setItemToDelete(null);
            fetchData();
        } catch (err) {
            alert("Failed to delete item");
        }
    };

    const handleSave = async () => {
        try {
            if (isEditing) {
                await projectService.updateItem(resource, currentItem.id, currentItem);
            } else {
                await projectService.createItem(resource, currentItem);
            }
            setOpenDialog(false);
            fetchData();
        } catch (err) {
            alert("Failed to save item");
            console.error(err);
        }
    };

    const renderField = (field) => {
        const value = currentItem[field.name];

        if (field.type === "select") {
            return (
                <div key={field.name} className="mb-4">
                    <Select
                        label={field.label}
                        value={value ? String(value) : ""}
                        onChange={(val) => setCurrentItem(prev => ({ ...prev, [field.name]: val }))}
                    >
                        {field.options && field.options.map(opt => (
                            <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                        ))}
                    </Select>
                </div>
            );
        }

        if (field.type === "textarea") {
            return (
                <div key={field.name} className="mb-4">
                    <Textarea
                        label={field.label}
                        value={value || ""}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, [field.name]: e.target.value }))}
                    />
                </div>
            );
        }

        if (field.type === "boolean") {
            return (
                <div key={field.name} className="mb-4">
                    <Checkbox
                        label={field.label}
                        checked={!!value}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, [field.name]: e.target.checked }))}
                    />
                </div>
            );
        }

        // Default text/number
        return (
            <div key={field.name} className="mb-4">
                <Input
                    type={field.type || "text"}
                    label={field.label}
                    value={value || ""}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, [field.name]: e.target.value }))}
                />
            </div>
        );
    };

    if (loading) {
        return (
            <div className="mt-12 flex flex-col items-center justify-center">
                <Spinner className="h-10 w-10 text-blue-500" />
            </div>
        );
    }

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="blue-gray" className="mb-8 p-6 flex items-center justify-between">
                    <div>
                        <Typography variant="h6" color="white">
                            {title}
                        </Typography>
                        <Typography variant="small" color="white" className="font-normal opacity-80">
                            {data.length} records found
                        </Typography>
                    </div>
                    <Button size="sm" color="white" variant="text" onClick={handleCreate} className="flex items-center gap-2">
                        <PlusIcon className="h-4 w-4" /> Add New
                    </Button>
                </CardHeader>

                <CardBody className="px-0 pb-2">
                    {error && <div className="px-6 mb-4 text-red-500">{error}</div>}

                    {data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <TableCellsIcon className="h-12 w-12 text-gray-400 mb-2" />
                            <Typography color="gray">No data found</Typography>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[70vh]">
                            <table className="w-full min-w-[640px] table-auto text-left">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr>
                                        {columns.map(col => (
                                            <th key={col.header} className="border-b border-blue-gray-50 py-3 px-5">
                                                <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                                                    {col.header}
                                                </Typography>
                                            </th>
                                        ))}
                                        <th className="border-b border-blue-gray-50 py-3 px-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, key) => {
                                        const className = `py-3 px-5 ${key === data.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                                        return (
                                            <tr key={item.id} className="hover:bg-blue-gray-50/50">
                                                {columns.map(col => (
                                                    <td key={col.header} className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                                            {String(item[col.accessor] !== undefined && item[col.accessor] !== null ? item[col.accessor] : "")}
                                                        </Typography>
                                                    </td>
                                                ))}
                                                <td className={className}>
                                                    <div className="flex justify-end gap-2">
                                                        <IconButton variant="text" color="blue-gray" onClick={() => handleEdit(item)}>
                                                            <PencilSquareIcon className="h-4 w-4" />
                                                        </IconButton>
                                                        <IconButton variant="text" color="red" onClick={() => handleDelete(item)}>
                                                            <TrashIcon className="h-4 w-4" />
                                                        </IconButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} handler={() => setOpenDialog(!openDialog)}>
                <DialogHeader>{isEditing ? "Edit Item" : "Create Item"}</DialogHeader>
                <DialogBody divider className="max-h-[60vh] overflow-y-auto">
                    <div className="flex flex-col gap-4">
                        {fields.map(field => renderField(field))}
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={() => setOpenDialog(false)} className="mr-1">
                        Cancel
                    </Button>
                    <Button variant="gradient" color="green" onClick={handleSave}>
                        {isEditing ? "Update" : "Create"}
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Item"
                message="Are you sure you want to delete this item?"
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}

export default GlobalCrudPage;
