import React, { useEffect, useState } from "react";
import { Typography, Input, Button, Card, CardBody } from "@material-tailwind/react";
import { useEnterprise } from "../../context/enterprise-context";
import { withCompany } from "../../api/enterpriseApi";

export function EnterpriseProfile() {
  const { membership, role } = useEnterprise();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ bio: "", department: "", position: "" });

  useEffect(() => {
    withCompany().get("/enterprise/my-profile/").then((r) => {
      setProfile(r.data);
      setForm({ bio: r.data.bio || "", department: r.data.department || "", position: r.data.position || "" });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const setInput = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await withCompany().patch("/enterprise/my-profile/", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent" /></div>;

  return (
    <div className="max-w-xl space-y-6">
      <Typography variant="h5" className="font-extrabold text-zinc-900">Enterprise Profile</Typography>

      {/* Role & membership summary */}
      <Card className="border border-indigo-200/60 shadow-sm bg-indigo-50">
        <CardBody className="p-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Role", value: <span className="font-bold text-indigo-700 capitalize">{role || "—"}</span> },
              { label: "Company", value: <span className="font-semibold text-zinc-800">{membership?.company_name || "—"}</span> },
              { label: "Status", value: <span className={`font-bold capitalize ${membership?.status === "active" ? "text-green-600" : "text-zinc-500"}`}>{membership?.status || "—"}</span> },
              { label: "Joined", value: <span className="text-zinc-600">{membership?.joined_at ? new Date(membership.joined_at).toLocaleDateString() : "—"}</span> },
            ].map((row) => (
              <div key={row.label}>
                <div className="text-xs font-semibold text-zinc-400">{row.label}</div>
                <div className="text-sm mt-0.5">{row.value}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {saved && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">Profile updated.</div>}

      <form onSubmit={save} className="space-y-4">
        <Input label="Position / Job Title" value={form.position} onChange={setInput("position")} />
        <Input label="Department" value={form.department} onChange={setInput("department")} />
        <div>
          <label className="block text-xs font-semibold text-zinc-500 mb-1">Bio</label>
          <textarea
            className="w-full border border-zinc-300 rounded-xl p-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            rows={4}
            value={form.bio}
            onChange={setInput("bio")}
            placeholder="Tell your team a bit about yourself..."
          />
        </div>
        <Button type="submit" color="indigo" className="normal-case" loading={saving}>Save Profile</Button>
      </form>
    </div>
  );
}

export default EnterpriseProfile;
