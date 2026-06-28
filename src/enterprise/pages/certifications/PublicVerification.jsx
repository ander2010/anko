import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Typography, Button, Input } from "@material-tailwind/react";
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { certApi } from "../../api/enterpriseApi";
import { APP_NAME } from "@/config/app";

function QRCodeDisplay({ url }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  return <img src={qrUrl} alt="QR Code" className="h-32 w-32 rounded-xl border border-zinc-200" />;
}

export function PublicVerification() {
  const { identifier } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(!!identifier);
  const [searchCode, setSearchCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | valid | invalid | not_found

  const verify = async (code) => {
    if (!code) return;
    setLoading(true);
    try {
      const data = await certApi.verifyPublic(code);
      setResult(data);
      setStatus(data.is_valid ? "valid" : data.status === "revoked" ? "invalid" : "invalid");
    } catch (err) {
      if (err?.status === 404 || err?.detail?.includes("not found")) setStatus("not_found");
      else setStatus("invalid");
      setResult(null);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (identifier) verify(identifier); }, [identifier]);

  const handleSearch = (e) => { e.preventDefault(); verify(searchCode); };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Typography variant="h4" className="font-extrabold text-zinc-900">{APP_NAME}</Typography>
          <Typography variant="small" className="text-zinc-400 font-medium">Certificate Verification Portal</Typography>
        </div>

        {/* Search box */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <div className="flex-1">
            <Input
              label="Enter verification code"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="e.g. CERT-XXXX-XXXX"
            />
          </div>
          <Button type="submit" color="indigo" className="normal-case flex-shrink-0">Verify</Button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-10 w-10 rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        )}

        {/* Valid certificate */}
        {!loading && status === "valid" && result && (
          <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
            <div className="bg-green-600 px-6 py-4 flex items-center gap-3">
              <CheckCircleIcon className="h-8 w-8 text-white flex-shrink-0" />
              <Typography variant="h6" className="text-white font-extrabold">Valid Certificate</Typography>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: "Holder", value: result.holder_name },
                { label: "Template", value: result.template_name },
                { label: "Company", value: result.company_name },
                { label: "Issued", value: result.issued_at ? new Date(result.issued_at).toLocaleDateString() : "—" },
                { label: "Expires", value: result.expires_at ? new Date(result.expires_at).toLocaleDateString() : "No expiry" },
                { label: "Score", value: result.score != null ? `${result.score}%` : "—" },
                { label: "Certificate #", value: result.certificate_number },
                { label: "Verification Code", value: result.verification_code },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase w-32 flex-shrink-0 pt-0.5">{row.label}</span>
                  <span className="text-sm font-semibold text-zinc-800 font-mono">{row.value}</span>
                </div>
              ))}
              {result.verification_code && (
                <div className="pt-4 flex justify-center">
                  <QRCodeDisplay url={`${window.location.origin}/verify/${result.verification_code}`} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invalid / revoked */}
        {!loading && status === "invalid" && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
              <XCircleIcon className="h-8 w-8 text-white flex-shrink-0" />
              <Typography variant="h6" className="text-white font-extrabold">Invalid Certificate</Typography>
            </div>
            <div className="p-6">
              <Typography className="text-zinc-600 font-medium">
                Status: <span className="font-bold text-red-600 capitalize">{result?.status || "invalid"}</span>
              </Typography>
              <Typography variant="small" className="text-zinc-400 mt-2">This certificate is no longer valid.</Typography>
            </div>
          </div>
        )}

        {/* Not found */}
        {!loading && status === "not_found" && (
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="bg-amber-500 px-6 py-4 flex items-center gap-3">
              <ExclamationCircleIcon className="h-8 w-8 text-white flex-shrink-0" />
              <Typography variant="h6" className="text-white font-extrabold">Certificate Not Found</Typography>
            </div>
            <div className="p-6">
              <Typography className="text-zinc-600 font-medium">The code entered is not valid.</Typography>
              <Typography variant="small" className="text-zinc-400 mt-2">Please double-check the verification code and try again.</Typography>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicVerification;
