import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
    Card,
    CardBody,
    Typography,
    Button,
    Spinner,
} from "@material-tailwind/react";
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";

export function AccessAction() {
    const { action } = useParams(); // approve or reject
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const { language } = useLanguage();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError(language === "es" ? "Token no proporcionado" : "Token not provided");
            setLoading(false);
            return;
        }

        processAction();
    }, [token, action]);

    const processAction = async () => {
        try {
            setLoading(true);
            setError(null);

            if (action === "approve") {
                await projectService.approveAccessRequest(token);
            } else if (action === "reject") {
                await projectService.rejectAccessRequest(token);
            } else {
                throw new Error("Invalid action");
            }

            setSuccess(true);
        } catch (err) {
            console.error("Access action error:", err);
            setError(err?.error || err?.detail || (language === "es" ? "Error al procesar la solicitud" : "Failed to process request"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
            <Card className="w-full max-w-md shadow-premium border border-zinc-200">
                <CardBody className="p-8 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-8 mx-auto">
                        <span className="text-white font-bold text-2xl">A</span>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            <Spinner className="h-10 w-10 mx-auto text-indigo-500" />
                            <Typography variant="h5" className="font-bold text-zinc-900">
                                {language === "es" ? "Procesando solicitud..." : "Processing request..."}
                            </Typography>
                        </div>
                    ) : error ? (
                        <div className="space-y-6">
                            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                                <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
                            </div>
                            <div>
                                <Typography variant="h5" className="font-bold text-zinc-900 mb-2">
                                    {language === "es" ? "Ups! Algo salió mal" : "Oops! Something went wrong"}
                                </Typography>
                                <Typography className="text-zinc-500">
                                    {error}
                                </Typography>
                            </div>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="zinc"
                                className="rounded-xl normal-case"
                                onClick={() => navigate("/dashboard/home")}
                            >
                                {language === "es" ? "Ir al Dashboard" : "Go to Dashboard"}
                            </Button>
                        </div>
                    ) : success ? (
                        <div className="space-y-6">
                            <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                {action === "approve" ? (
                                    <CheckCircleIcon className="h-10 w-10 text-green-500" />
                                ) : (
                                    <XCircleIcon className="h-10 w-10 text-red-500" />
                                )}
                            </div>
                            <div>
                                <Typography variant="h5" className="font-bold text-zinc-900 mb-2">
                                    {action === "approve"
                                        ? (language === "es" ? "Solicitud Aprobada" : "Request Approved")
                                        : (language === "es" ? "Solicitud Rechazada" : "Request Rejected")
                                    }
                                </Typography>
                                <Typography className="text-zinc-500">
                                    {action === "approve"
                                        ? (language === "es" ? "El usuario ahora tiene acceso al recurso." : "The user now has access to the resource.")
                                        : (language === "es" ? "La solicitud ha sido rechazada exitosamente." : "The request has been rejected successfully.")
                                    }
                                </Typography>
                            </div>
                            <Button
                                fullWidth
                                className="bg-indigo-600 rounded-xl normal-case py-3"
                                onClick={() => navigate("/dashboard/home")}
                            >
                                {language === "es" ? "Ir a mi Dashboard" : "Go to my Dashboard"}
                            </Button>
                        </div>
                    ) : null}
                </CardBody>
            </Card>
        </div>
    );
}

export default AccessAction;
