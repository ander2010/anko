import { Navigate } from "react-router-dom";
// Company creation is restricted to platform admins only.
// Platform admins create companies from /platform-admin/companies.
export default function OnboardingCompany() {
  return <Navigate to="/platform-admin/companies" replace />;
}
