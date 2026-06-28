import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Typography, Button } from "@material-tailwind/react";
import { PrinterIcon } from "@heroicons/react/24/outline";
import { certApi } from "../../api/enterpriseApi";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";

function QRCode({ url }) {
  return <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`} alt="QR" className="h-32 w-32 rounded-xl border border-zinc-200 mx-auto" />;
}

export function CertificateDetail() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certApi.getCertData(id).then(setCert).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent" /></div>;
  if (!cert) return <EmptyState title="Certificate not found" />;

  const verifyUrl = `${window.location.origin}/verify/${cert.verification_code}`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-end mb-4">
        <Button variant="outlined" color="zinc" className="normal-case flex items-center gap-2" onClick={() => window.print()}>
          <PrinterIcon className="h-4 w-4" /> Print
        </Button>
      </div>

      {/* Certificate card */}
      <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-xl overflow-hidden print:shadow-none print:border-zinc-300">
        {/* Header */}
        <div className="bg-indigo-600 px-8 py-8 text-center">
          <Typography variant="small" className="text-indigo-200 uppercase tracking-widest text-xs font-bold mb-2">{cert.company_name}</Typography>
          <Typography variant="h4" className="text-white font-extrabold">{cert.header_text || "Certificate of Achievement"}</Typography>
        </div>

        {/* Body */}
        <div className="px-8 py-10 text-center space-y-6">
          <div>
            <Typography variant="small" className="text-zinc-400 uppercase tracking-wide text-xs">This certifies that</Typography>
            <Typography variant="h3" className="font-extrabold text-zinc-900 mt-2">{cert.holder_name}</Typography>
          </div>

          {cert.body_text && (
            <Typography className="text-zinc-600 font-medium leading-relaxed">{cert.body_text}</Typography>
          )}

          <div>
            <Typography variant="h6" className="font-bold text-indigo-700">{cert.template_name}</Typography>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left bg-zinc-50 rounded-xl p-4">
            <div>
              <div className="text-xs text-zinc-400 font-semibold">Issued</div>
              <div className="text-sm font-bold text-zinc-800">{cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : "—"}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-semibold">Expires</div>
              <div className="text-sm font-bold text-zinc-800">{cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : "No expiry"}</div>
            </div>
            {cert.score != null && (
              <div>
                <div className="text-xs text-zinc-400 font-semibold">Score</div>
                <div className="text-sm font-bold text-indigo-600">{cert.score}%</div>
              </div>
            )}
            <div>
              <div className="text-xs text-zinc-400 font-semibold">Status</div>
              <StatusBadge status={cert.status} />
            </div>
          </div>

          {/* Verification code */}
          <div className="space-y-3">
            <div className="p-3 bg-zinc-100 rounded-xl">
              <div className="text-xs text-zinc-400 font-semibold mb-1">Verification Code</div>
              <div className="font-mono font-bold text-zinc-800 text-sm tracking-wider">{cert.verification_code}</div>
            </div>
            <QRCode url={verifyUrl} />
            <Typography variant="small" className="text-zinc-400 text-xs">{verifyUrl}</Typography>
          </div>

          {cert.footer_text && (
            <Typography variant="small" className="text-zinc-400 italic">{cert.footer_text}</Typography>
          )}
        </div>
      </div>
    </div>
  );
}

export default CertificateDetail;
