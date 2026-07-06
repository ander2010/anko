import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BuildingOffice2Icon, BoltIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/auth-context";
import authService from "@/services/authService";
import { APP_NAME } from "@/config/app";

function Spin() {
  return (
    <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid rgba(99,102,241,0.3)", borderTopColor: "#818CF8" }} className="animate-spin" />
  );
}

const ACCENT = "linear-gradient(135deg, #6366F1, #818CF8)";

export function WaitingPage() {
  const { logout, refreshContext } = useAuth();
  const navigate = useNavigate();

  const [silentState, setSilentState] = useState("idle"); // idle | processing | success | error

  useEffect(() => {
    const pendingToken = sessionStorage.getItem("pendingInviteToken");
    if (!pendingToken) return;

    setSilentState("processing");
    authService.acceptInvitation(pendingToken)
      .then(async () => {
        sessionStorage.removeItem("pendingInviteToken");
        await refreshContext();
        setSilentState("success");
        setTimeout(() => navigate("/enterprise/dashboard"), 1500);
      })
      .catch(() => {
        sessionStorage.removeItem("pendingInviteToken");
        setSilentState("error");
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth/sign-in");
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
        background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 420,
        background: "#0F172A",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        textAlign: "center",
      }}>
        {/* Top accent strip */}
        <div style={{ height: 3, background: ACCENT }} />

        <div style={{ padding: "40px 36px 44px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 36 }}>
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

          {/* Processing silent join */}
          {silentState === "processing" && (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <Spin />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>
                Uniéndote a tu empresa...
              </h2>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65 }}>
                Estamos procesando tu invitación. Un momento.
              </p>
            </>
          )}

          {/* Success */}
          {silentState === "success" && (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
              }}>
                <BuildingOffice2Icon style={{ width: 30, height: 30, color: "#22C55E" }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>
                Bienvenido al equipo
              </h2>
              <p style={{ fontSize: 14, color: "#64748B" }}>Redirigiendo a tu empresa...</p>
            </>
          )}

          {/* No pending token or error */}
          {(silentState === "idle" || silentState === "error") && (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
              }}>
                <BuildingOffice2Icon style={{ width: 30, height: 30, color: "#818CF8" }} />
              </div>

              {silentState === "error" && (
                <div style={{
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 10, padding: "10px 14px", marginBottom: 20,
                  fontSize: 13, color: "#F87171",
                }}>
                  No se pudo procesar la invitación. Por favor solicita una nueva.
                </div>
              )}

              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9", marginBottom: 10 }}>
                Bienvenido a {APP_NAME || "Ankard"}
              </h2>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, marginBottom: 32 }}>
                Tu cuenta está lista, pero aún no perteneces a ninguna empresa.
                Contacta al administrador de tu empresa para que te invite a la plataforma.
              </p>

              <div style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 28,
                fontSize: 13,
                color: "#94A3B8",
                lineHeight: 1.6,
                textAlign: "left",
              }}>
                <span style={{ fontWeight: 600, color: "#818CF8" }}>¿Eres administrador? </span>
                Una vez que tu empresa esté configurada, podrás entrar de inmediato con esta cuenta.
              </div>

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94A3B8",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; e.currentTarget.style.color = "#F87171"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#94A3B8"; }}
              >
                <ArrowRightOnRectangleIcon style={{ width: 16, height: 16 }} />
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WaitingPage;
