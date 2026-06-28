import { useEnterprise } from "../context/enterprise-context";

export function useCompanyRole() {
  const { role, hasRole, hasMinRole, membership, activeCompanyId } = useEnterprise();
  return { role, hasRole, hasMinRole, membership, activeCompanyId };
}

export default useCompanyRole;
