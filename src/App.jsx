import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { LandingPage } from "@/pages/landing-page";
import { PublicFaq } from "@/pages/faq";
import { Privacidad } from "@/pages/privacidad";
import { Terminos } from "@/pages/terminos";
import RequireAuth from "@/components/RequireAuth";
import { ForgotPassword, ResetPassword, EmailVerification } from "@/pages/auth";
import { AccessAction } from "@/pages/dashboard";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/faq" element={<PublicFaq />} />
      <Route path="/privacidad" element={<Privacidad />} />
      <Route path="/terminos" element={<Terminos />} />
      <Route path="/dashboard/*" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/access/:action" element={<RequireAuth><AccessAction /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
