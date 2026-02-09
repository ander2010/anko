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
import { LockClosedIcon, ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import { useLanguage } from "@/context/language-context";
import { useNavigate } from "react-router-dom";

export function UpgradePromptDialog({ open, onClose, featureName, currentCount, limit }) {
    const { language } = useLanguage();
    const navigate = useNavigate();

    const handleUpgrade = () => {
        navigate("/dashboard/memberships");
        onClose();
    };

    return (
        <Dialog
            open={open}
            handler={onClose}
            className="bg-transparent shadow-none"
            size="sm"
        >
            <div className="bg-white rounded-[2rem] shadow-2xl border border-amber-200 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

                <DialogHeader className="p-0 mb-4 flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                        <LockClosedIcon className="h-8 w-8 text-amber-600" />
                    </div>
                    <Typography variant="h4" className="font-black text-zinc-900 tracking-tight text-center">
                        {language === 'es' ? 'Límite Alcanzado' : 'Limit Reached'}
                    </Typography>
                </DialogHeader>

                <DialogBody className="p-0 mb-6 text-center">
                    <Typography className="text-zinc-600 mb-4">
                        {language === 'es'
                            ? `Tu membresía Free está limitada a ${limit} ${featureName}.`
                            : `Your Free membership is limited to ${limit} ${featureName}.`
                        }
                    </Typography>
                    <Typography className="text-zinc-600 font-semibold mb-2">
                        {language === 'es'
                            ? `Actualmente tienes ${currentCount} de ${limit} ${featureName}.`
                            : `You currently have ${currentCount} of ${limit} ${featureName}.`
                        }
                    </Typography>
                    <Typography className="text-zinc-500 text-sm">
                        {language === 'es'
                            ? 'Actualiza tu membresía para continuar subiendo documentos y desbloquear más funciones.'
                            : 'Upgrade your membership to continue uploading documents and unlock more features.'
                        }
                    </Typography>
                </DialogBody>

                <DialogFooter className="p-0 flex gap-3">
                    <Button
                        variant="text"
                        onClick={onClose}
                        className="flex-1 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 normal-case font-bold"
                    >
                        {language === 'es' ? 'Cancelar' : 'Cancel'}
                    </Button>
                    <Button
                        variant="gradient"
                        color="amber"
                        onClick={handleUpgrade}
                        className="flex-1 rounded-xl shadow-lg shadow-amber-500/20 normal-case font-bold flex items-center justify-center gap-2"
                    >
                        <ArrowUpCircleIcon className="h-5 w-5" />
                        {language === 'es' ? 'Mejorar Plan' : 'Upgrade Now'}
                    </Button>
                </DialogFooter>
            </div>
        </Dialog>
    );
}

UpgradePromptDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    featureName: PropTypes.string.isRequired,
    currentCount: PropTypes.number,
    limit: PropTypes.number,
};

UpgradePromptDialog.defaultProps = {
    currentCount: 0,
    limit: 2,
};

export default UpgradePromptDialog;
