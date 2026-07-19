import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import { certApi, learningApi, complianceApi } from "../../api/enterpriseApi";
import { useLanguage } from "../../../context/language-context";

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

const INPUT = {
  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#F1F5F9", outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};
const LABEL = { fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 5 };

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 38, height: 22, borderRadius: 20, flexShrink: 0, position: "relative", cursor: "pointer",
        background: checked ? "#6366F1" : "rgba(255,255,255,0.12)", border: "none", transition: "background 150ms",
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: checked ? 18 : 2, width: 18, height: 18, borderRadius: "50%",
        background: "#fff", transition: "left 150ms",
      }} />
    </button>
  );
}

// ─── Requirements — what auto-issues this certificate ─────────────────────────
// Needs an existing template id (CertificationRequirement.template is required),
// so this section only renders in edit mode, after the template has been saved once.

function RequirementsSection({ templateId }) {
  const { t } = useLanguage();
  const [requirements, setRequirements] = useState([]);
  const [paths, setPaths] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState("learning_path");
  const [refId, setRefId] = useState("");
  const [minScore, setMinScore] = useState("");
  const [mandatory, setMandatory] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      certApi.getRequirements(templateId).then((d) => d.results || d || []),
      learningApi.getPaths().then((d) => d.results || d || []),
      complianceApi.getPrograms().then((d) => d.results || d || []),
    ]).then(([reqs, lp, cp]) => {
      setRequirements(reqs); setPaths(lp); setPrograms(cp);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [templateId]);

  const addRequirement = async () => {
    if (!refId) { setError(t("enterprise.certifications.templateForm.requirements.selectRef")); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        template: templateId,
        is_mandatory: mandatory,
        minimum_score: minScore !== "" ? minScore : null,
        learning_path: kind === "learning_path" ? refId : null,
        compliance_program: kind === "compliance_program" ? refId : null,
      };
      await certApi.createRequirement(payload);
      setRefId(""); setMinScore(""); setMandatory(true);
      load();
    } catch (err) {
      setError(err?.detail || t("enterprise.certifications.templateForm.requirements.addError"));
    } finally { setSaving(false); }
  };

  const removeRequirement = async (reqId) => {
    await certApi.deleteRequirement(reqId);
    load();
  };

  const options = kind === "learning_path" ? paths : programs;

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 22, marginTop: 20 }} className="space-y-4">
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{t("enterprise.certifications.templateForm.requirements.title")}</p>
        <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
          {t("enterprise.certifications.templateForm.requirements.hint")}
        </p>
      </div>

      {loading ? (
        <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{t("enterprise.certifications.templateForm.requirements.loading")}</p>
      ) : (
        <>
          {requirements.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{t("enterprise.certifications.templateForm.requirements.empty")}</p>
          ) : (
            <div className="space-y-2">
              {requirements.map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: r.learning_path ? "rgba(99,102,241,0.12)" : "rgba(192,132,252,0.12)", color: r.learning_path ? "#818CF8" : "#C084FC", flexShrink: 0 }}>
                    {r.learning_path ? t("enterprise.certifications.templateForm.requirements.learningPath") : t("enterprise.certifications.templateForm.requirements.compliance")}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>
                    {r.learning_path_name || r.compliance_program_name}
                  </span>
                  {r.minimum_score != null && (
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{t("enterprise.certifications.templateForm.requirements.minScore", { n: r.minimum_score })}</span>
                  )}
                  {!r.is_mandatory && (
                    <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{t("enterprise.certifications.templateForm.requirements.optional")}</span>
                  )}
                  <button onClick={() => removeRequirement(r.id)} title={t("enterprise.certifications.templateForm.requirements.removeTitle")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", padding: 4, display: "flex" }}>
                    <TrashIcon style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }} className="space-y-3">
            <div className="flex gap-2">
              {[["learning_path", t("enterprise.certifications.templateForm.requirements.learningPath")], ["compliance_program", t("enterprise.certifications.templateForm.requirements.complianceProgram")]].map(([k, label]) => (
                <button key={k} type="button" onClick={() => { setKind(k); setRefId(""); }}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 6, cursor: "pointer",
                    background: kind === k ? "var(--accent)" : "var(--bg-elevated)",
                    color: kind === k ? "#fff" : "var(--text-secondary)",
                    border: `1px solid ${kind === k ? "var(--accent)" : "var(--border)"}`,
                  }}>
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select style={INPUT_SM} value={refId} onChange={(e) => setRefId(e.target.value)}>
                <option value="">{t("enterprise.certifications.templateForm.requirements.selectPlaceholder")}</option>
                {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <input style={INPUT_SM} type="number" min="0" max="100" placeholder={t("enterprise.certifications.templateForm.requirements.minScorePlaceholder")} value={minScore} onChange={(e) => setMinScore(e.target.value)} />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--text-secondary)", cursor: "pointer" }}>
                <input type="checkbox" checked={mandatory} onChange={(e) => setMandatory(e.target.checked)} />
                {t("enterprise.certifications.templateForm.requirements.mandatory")}
              </label>
              <button type="button" onClick={addRequirement} disabled={saving} className="ank-btn-accent text-xs" style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? t("enterprise.certifications.templateForm.requirements.adding") : t("enterprise.certifications.templateForm.requirements.add")}
              </button>
            </div>
            {error && <p style={{ fontSize: 12, color: "#f87171" }}>{error}</p>}
          </div>
        </>
      )}
    </div>
  );
}

const INPUT_SM = {
  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "#F1F5F9", outline: "none", boxSizing: "border-box",
};

export function CertificateTemplateForm() {
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    certApi.getTemplate(id).then((tpl) => setForm({ ...EMPTY, ...tpl })).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

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
      setError(err?.detail || err?.message || t("enterprise.certifications.templateForm.saveFailed"));
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} className="animate-spin h-8 w-8 rounded-full border-2" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800, marginBottom: 20 }}>
        {isEdit ? t("enterprise.certifications.templateForm.editTitle") : t("enterprise.certifications.templateForm.newTitle")}
      </h1>

      {error && (
        <div style={{ marginBottom: 16, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontSize: 13, padding: "10px 14px", borderRadius: 10 }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 22 }} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={LABEL}>{t("enterprise.certifications.templateForm.fields.code")}</label>
            <input style={{ ...INPUT, opacity: isEdit ? 0.6 : 1 }} value={form.code} onChange={setInput("code")} required disabled={isEdit} />
          </div>
          <div>
            <label style={LABEL}>{t("enterprise.certifications.templateForm.fields.name")}</label>
            <input style={INPUT} value={form.name} onChange={setInput("name")} required />
          </div>
        </div>

        <div>
          <label style={LABEL}>{t("enterprise.certifications.templateForm.fields.type")}</label>
          <select style={{ ...INPUT, cursor: "pointer" }} value={form.certificate_type} onChange={setInput("certificate_type")}>
            {TYPES.map((ty) => <option key={ty} value={ty}>{ty.replace(/_/g, " ")}</option>)}
          </select>
        </div>

        <div>
          <label style={LABEL}>{t("enterprise.certifications.templateForm.fields.validity")}</label>
          <input style={INPUT} type="number" min="0" value={form.validity_days} onChange={setInput("validity_days")} />
        </div>

        <div className="flex items-center gap-3">
          <ToggleSwitch checked={form.requires_score} onChange={(v) => setForm((f) => ({ ...f, requires_score: v }))} />
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t("enterprise.certifications.templateForm.fields.requiresScore")}</span>
        </div>

        {form.requires_score && (
          <div>
            <label style={LABEL}>{t("enterprise.certifications.templateForm.fields.minimumScore")}</label>
            <input style={INPUT} type="number" min="0" max="100" value={form.minimum_score} onChange={setInput("minimum_score")} />
          </div>
        )}

        <div>
          <label style={LABEL}>{t("enterprise.certifications.templateForm.fields.headerText")}</label>
          <input style={INPUT} value={form.header_text} onChange={setInput("header_text")} />
        </div>

        <div>
          <label style={LABEL}>{t("enterprise.certifications.templateForm.fields.bodyText")}</label>
          <textarea
            style={{ ...INPUT, resize: "vertical" }}
            rows={3}
            value={form.body_text}
            onChange={setInput("body_text")}
            placeholder={t("enterprise.certifications.templateForm.fields.bodyTextPlaceholder")}
          />
        </div>

        <div>
          <label style={LABEL}>{t("enterprise.certifications.templateForm.fields.footerText")}</label>
          <input style={INPUT} value={form.footer_text} onChange={setInput("footer_text")} />
        </div>

        <div className="flex items-center gap-3">
          <ToggleSwitch checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t("enterprise.certifications.templateForm.fields.active")}</span>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={saving} className="ank-btn-accent text-xs" style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? t("enterprise.certifications.templateForm.saving") : isEdit ? t("enterprise.certifications.templateForm.saveChanges") : t("enterprise.certifications.templateForm.createTemplate")}
          </button>
          <button type="button" onClick={() => navigate("/enterprise/certifications/templates")} className="ank-btn-ghost text-xs">
            {t("enterprise.compliance.programs.cancel")}
          </button>
        </div>
      </form>

      {isEdit && <RequirementsSection templateId={id} />}
    </div>
  );
}

export default CertificateTemplateForm;
