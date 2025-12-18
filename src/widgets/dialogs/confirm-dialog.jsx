import React from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
} from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
}) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog open={open} handler={onClose} size="sm">
            <DialogHeader className="flex items-center gap-3">
                {variant === "danger" && (
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                )}
                <Typography variant="h5">{title}</Typography>
            </DialogHeader>
            <DialogBody divider>
                <Typography className="font-normal text-blue-gray-600">
                    {message}
                </Typography>
            </DialogBody>
            <DialogFooter className="gap-2">
                <Button variant="text" color="blue-gray" onClick={onClose}>
                    {cancelText}
                </Button>
                <Button
                    variant="gradient"
                    color={variant === "danger" ? "red" : "blue"}
                    onClick={handleConfirm}
                >
                    {confirmText}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

ConfirmDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    variant: PropTypes.oneOf(["danger", "info"]),
};

export default ConfirmDialog;
