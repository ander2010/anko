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
import { CheckBadgeIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";

export function AccessRequestSuccessDialog({ open, handler }) {
    const { t } = useLanguage();

    return (
        <Dialog
            open={open}
            handler={handler}
            size="xs"
            className="rounded-[2rem] border border-zinc-200/50 shadow-2xl overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
            <DialogBody className="flex flex-col items-center justify-center p-10 text-center">
                <div className="relative mb-6">
                    <div className="h-20 w-20 bg-green-50 rounded-3xl flex items-center justify-center ring-8 ring-green-50/50 animate-bounce-subtle">
                        <CheckBadgeIcon className="h-10 w-10 text-green-500" />
                    </div>
                    <SparklesIcon className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
                </div>

                <Typography variant="h4" className="text-zinc-900 font-black mb-3 tracking-tight">
                    {t("global.action.access_request_success.title")}
                </Typography>

                <Typography className="text-zinc-500 font-medium leading-relaxed">
                    {t("global.action.access_request_success.description")}
                </Typography>
            </DialogBody>
            <DialogFooter className="px-10 pb-10 pt-0">
                <Button
                    variant="gradient"
                    color="green"
                    fullWidth
                    onClick={handler}
                    className="rounded-2xl py-4 normal-case font-black text-sm shadow-lg shadow-green-200 transition-all hover:shadow-green-300 active:scale-95"
                >
                    {t("global.crud.select") || "OK"}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

AccessRequestSuccessDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    handler: PropTypes.func.isRequired,
};

export default AccessRequestSuccessDialog;
