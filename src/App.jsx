import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { LandingPage } from "@/pages/landing-page";
import RequireAuth from "@/components/RequireAuth";
import { ForgotPassword, ResetPassword, EmailVerification } from "@/pages/auth";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard/*" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
