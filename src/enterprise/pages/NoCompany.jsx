import React from "react";
import { Typography, Button } from "@material-tailwind/react";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "../../context/language-context";

export function NoCompany() {
  const { logout } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto">
          <BuildingOffice2Icon className="h-10 w-10 text-indigo-500" />
        </div>

        <div className="space-y-2">
          <Typography variant="h4" className="font-extrabold text-zinc-900">
            {t("enterprise.noCompany.welcome")}
          </Typography>
          <Typography className="text-zinc-500 leading-relaxed">
            {t("enterprise.noCompany.notYetInCompany")}
          </Typography>
          <Typography variant="small" className="text-zinc-400 leading-relaxed">
            {t("enterprise.noCompany.contactAdmin")}
          </Typography>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
          <Typography variant="small" className="text-indigo-700">
            <strong>{t("enterprise.noCompany.areYouAdmin")}</strong> {t("enterprise.noCompany.staffLoginHint")}
          </Typography>
        </div>

        <Button
          variant="outlined"
          color="blue-gray"
          fullWidth
          className="normal-case"
          onClick={logout}
        >
          {t("enterprise.noCompany.logout")}
        </Button>
      </div>
    </div>
  );
}

export default NoCompany;
