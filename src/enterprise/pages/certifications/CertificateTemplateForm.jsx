import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Typography, Input, Button, Switch, Select, Option } from "@material-tailwind/react";
import { certApi } from "../../api/enterpriseApi";

const TYPES = ["learning_completion", "assessment", "compliance", "custom"];

const EMPTY = {
  code: "", name: "", description: "",
  certificate_type: "learning_completion",
  validity_days: 365,
  requires_score: false,
  minimum_score: 70,
  header_text: "Certificate of Achievement",
  body_text: "",
  footer_text: "",
  is_active: true,
};

export function CertificateTemplateForm() {
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    certApi.getTemplate(id).then((t) => setForm({ ...EMPTY, ...t })).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const set = (field) => (val) => setForm((f) => ({ ...f, [field]: val }));
  const setInput = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isEdit) await certApi.updateTemplate(id, form);
      else await certApi.createTemplate(form);
      navigate("/enterprise/certifications/templates");
    } catch (err) {
      setError(err?.detail || err?.message || "Save failed.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent" /></div>;

  return (
      <div className="max-w-2xl mx-auto">
        <Typography variant="h5" className="font-extrabold text-zinc-900 mb-6">{isEdit ? "Edit Template" : "New Certificate Template"}</Typography>
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Code" value={form.code} onChange={setInput("code")} required disabled={isEdit} />
            <Input label="Name" value={form.name} onChange={setInput("name")} required />
          </div>
          <div>
            <Select label="Type" value={form.certificate_type} onChange={set("certificate_type")}>
              {TYPES.map((t) => <Option key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</Option>)}
            </Select>
          </div>
          <Input label="Validity (days, 0 = no expiry)" type="number" min="0" value={form.validity_days} onChange={setInput("validity_days")} />
          <div className="flex items-center gap-3">
            <Switch checked={form.requires_score} onChange={(e) => setForm((f) => ({ ...f, requires_score: e.target.checked }))} />
            <span className="text-sm text-zinc-700">Requires minimum score</span>
          </div>
          {form.requires_score && (
            <Input label="Minimum Score (%)" type="number" min="0" max="100" value={form.minimum_score} onChange={setInput("minimum_score")} />
          )}
          <Input label="Header Text" value={form.header_text} onChange={setInput("header_text")} />
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1">Body Text</label>
            <textarea
              className="w-full border border-zinc-300 rounded-xl p-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              rows={3}
              value={form.body_text}
              onChange={setInput("body_text")}
              placeholder="Successfully completed..."
            />
          </div>
          <Input label="Footer Text" value={form.footer_text} onChange={setInput("footer_text")} />
          <div className="flex items-center gap-3">
            <Switch checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
            <span className="text-sm text-zinc-700">Active</span>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" color="indigo" className="normal-case" loading={saving}>{isEdit ? "Save Changes" : "Create Template"}</Button>
            <Button type="button" variant="outlined" color="zinc" className="normal-case" onClick={() => navigate("/enterprise/certifications/templates")}>Cancel</Button>
          </div>
        </form>
      </div>
  );
}

export default CertificateTemplateForm;
