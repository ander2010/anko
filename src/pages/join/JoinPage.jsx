import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { BuildingOffice2Icon, CheckCircleIcon, XCircleIcon, BoltIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import authService from "@/services/authService";
import { useAuth } from "@/context/auth-context";
import { APP_NAME } from "@/config/app";

function Spin() {
  return (
    <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#fff", flexShrink: 0, display: "inline-block" }} className="animate-spin" />
  );
}

const ACCENT = "linear-gradient(135deg, #6366F1, #818CF8)";

export function JoinPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, refreshContext } = useAuth();

  const token = params.get("token");

  const [invitation, setInvitation] = useState(null);
  const [loadingValidate, setLoadingValidate] = useState(true);
  const [validateError, setValidateError] = useState(null);

  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoadingValidate(false);
      setValidateError("No se encontró un token de invitación.");
      return;
    }

    authService.validateInvitation(token)
      .then((data) => {
        setInvitation(data);
        setLoadingValidate(false);
      })
      .catch((err) => {
        setValidateError(err?.detail || err?.error || "La invitación no es válida o ha expirado.");
        setLoadingValidate(false);
      });
  }, [token]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem("pendingInviteToken", token);
      navigate("/auth/sign-in");
      return;
    }

    setAccepting(true);
    setAcceptError(null);
    try {
      await authService.acceptInvitation(token);
      await refreshContext();
      setAccepted(true);
      setTimeout(() => navigate("/enterprise/dashboard"), 1800);
    } catch (err) {
      setAcceptError(err?.detail || err?.error || "No se pudo aceptar la invitación.");
      setAccepting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060D1A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "inherit",
    }}>
      {/* Radial glow */}
      <div style={{
        position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 600,
        background: "radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 460,
        background: "#0F172A",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}>
        {/* Top accent strip */}
        <div style={{ height: 3, background: ACCENT }} />

        <div style={{ padding: "36px 36px 40px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: ACCENT,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 24px rgba(99,102,241,0.4)",
            }}>
              <BoltIcon style={{ width: 18, height: 18, color: "#fff" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#F1F5F9" }}>{APP_NAME || "Ankard"}</span>
          </div>

          {/* Loading */}
          {loadingValidate && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin />
              <p style={{ marginTop: 16, color: "#64748B", fontSize: 14 }}>Validando invitación...</p>
            </div>
          )}

          {/* Error */}
          {!loadingValidate && validateError && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <XCircleIcon style={{ width: 28, height: 28, color: "#EF4444" }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>Invitación inválida</h2>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>{validateError}</p>
            </div>
          )}

          {/* Accepted success */}
          {accepted && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <CheckCircleIcon style={{ width: 28, height: 28, color: "#22C55E" }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>Bienvenido al equipo</h2>
              <p style={{ fontSize: 14, color: "#64748B" }}>Redirigiendo a tu empresa...</p>
            </div>
          )}

          {/* Invitation info */}
          {!loadingValidate && !validateError && !accepted && invitation && (
            <>
              {/* Company card */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "20px",
                marginBottom: 28,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <BuildingOffice2Icon style={{ width: 24, height: 24, color: "#818CF8" }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6366F1", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Empresa</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9" }}>{invitation.company_name || "—"}</div>
                  {invitation.inviter_name && (
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Invitado por {invitation.inviter_name}</div>
                  )}
                </div>
              </div>

              {/* Role badge */}
              {invitation.role && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 28,
                }}>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>Tu rol:</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: "#818CF8",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{invitation.role}</span>
                </div>
              )}

              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>
                Te han invitado
              </h2>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65, marginBottom: 28 }}>
                {isAuthenticated
                  ? "Acepta la invitación para unirte al espacio de trabajo de tu empresa."
                  : "Inicia sesión o crea una cuenta para aceptar la invitación y unirte a tu empresa."}
              </p>

              {/* Accept error */}
              {acceptError && (
                <div style={{
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 10, padding: "10px 14px", marginBottom: 20,
                  fontSize: 13, color: "#F87171",
                }}>
                  {acceptError}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleAccept}
                disabled={accepting}
                style={{
                  width: "100%",
                  padding: "13px 20px",
                  borderRadius: 12,
                  background: accepting ? "rgba(99,102,241,0.4)" : ACCENT,
                  border: "none",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: accepting ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: accepting ? "none" : "0 4px 16px rgba(99,102,241,0.35)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { if (!accepting) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.5)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = accepting ? "none" : "0 4px 16px rgba(99,102,241,0.35)"; }}
              >
                {accepting ? <Spin /> : <ArrowRightIcon style={{ width: 16, height: 16 }} />}
                {isAuthenticated
                  ? (accepting ? "Aceptando..." : "Aceptar invitación")
                  : "Continuar al inicio de sesión"}
              </button>

              {!isAuthenticated && (
                <button
                  onClick={() => { sessionStorage.setItem("pendingInviteToken", token); navigate("/auth/sign-up"); }}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    padding: "12px 20px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#94A3B8",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#F1F5F9"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#94A3B8"; }}
                >
                  Crear cuenta nueva
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default JoinPage;
