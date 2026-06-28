import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, DocumentArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { learningApi } from "../../api/enterpriseApi";
import { useEnterprise } from "../../context/enterprise-context";

// ─── Constants ───────────────────────────────────────────────────────────────

const PROCESS_TYPES = [
  {
    value: "course",
    label: "Course",
    desc: "Structured learning path with multiple modules, assessments and progression tracking.",
  },
  {
    value: "tutorial",
    label: "Tutorial",
    desc: "Step-by-step guide focused on a specific skill or task.",
  },
  {
    value: "study_material",
    label: "Study Material",
    desc: "Reference document or reading material without a fixed structure.",
  },
];

const DIFFICULTIES = [
  { value: "easy",   label: "Easy",   color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  { value: "medium", label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  { value: "hard",   label: "Hard",   color: "#f87171", bg: "rgba(239,68,68,0.1)"  },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepBar({ current, steps }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;
        return (
          <React.Fragment key={n}>
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: done ? "#4ade80" : active ? "var(--accent)" : "var(--bg-elevated)",
                  border: `1px solid ${done ? "#4ade80" : active ? "var(--accent)" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 200ms",
                }}
              >
                {done
                  ? <CheckIcon style={{ width: 13, height: 13, color: "#fff", strokeWidth: 3 }} />
                  : <span style={{ fontSize: 11, fontWeight: 700, color: active ? "#fff" : "var(--text-tertiary)" }}>{n}</span>
                }
              </div>
              <span style={{
                fontSize: 12, fontWeight: active ? 600 : 400,
                color: active ? "var(--text-primary)" : done ? "var(--text-secondary)" : "var(--text-tertiary)",
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, background: done ? "rgba(74,222,128,0.4)" : "var(--border)", margin: "0 10px" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────

function Step1({ form, onChange, onNext, onCancel }) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!form.name.trim()) { setError("El nombre es obligatorio."); return; }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <p style={{ color: "var(--text-primary)" }} className="text-sm font-semibold mb-0.5">Nombre del Proceso *</p>
        <input
          autoFocus
          placeholder="ej. Inducción general, Manual de seguridad…"
          value={form.name}
          onChange={(e) => { onChange("name", e.target.value); setError(""); }}
          style={{
            width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
            borderRadius: 6, padding: "9px 12px", color: "var(--text-primary)",
            fontSize: 13, outline: "none", transition: "border-color 150ms",
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
        />
        {error && <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{error}</p>}
      </div>

      <div>
        <p style={{ color: "var(--text-primary)" }} className="text-sm font-semibold mb-0.5">
          Descripción <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(opcional)</span>
        </p>
        <textarea
          rows={3}
          placeholder="Describe brevemente de qué trata este proceso…"
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          style={{
            width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
            borderRadius: 6, padding: "9px 12px", color: "var(--text-primary)",
            fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.6,
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
        />
      </div>

      <div className="flex justify-between gap-3 pt-2">
        <button onClick={onCancel} className="ank-btn-ghost text-xs">Cancelar</button>
        <button onClick={handleNext} className="ank-btn-accent text-xs">
          Siguiente <ArrowRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Documents (optional) ────────────────────────────────────────────

function Step2({ files, onFilesChange, onNext, onBack }) {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    onFilesChange((prev) => [...prev, ...dropped]);
    onNext(); // auto-advance when files dropped
  }, [onFilesChange, onNext]);

  const handleFileInput = (e) => {
    const selected = Array.from(e.target.files);
    onFilesChange((prev) => [...prev, ...selected]);
    onNext(); // auto-advance
  };

  const removeFile = (i) => onFilesChange((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-5">
      <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6 }}>
        Adjunta documentos a este Proceso. Puedes subir PDFs, manuales o cualquier archivo de referencia.
        Si adjuntas archivos ahora, pasarás directamente a la configuración.
      </p>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("file-input-wizard").click()}
        style={{
          border: "2px dashed var(--border)", borderRadius: 8, padding: "32px 24px",
          textAlign: "center", cursor: "pointer", transition: "border-color 150ms, background 150ms",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--bg-accent)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "transparent"; }}
      >
        <input id="file-input-wizard" type="file" multiple className="hidden" onChange={handleFileInput} />
        <DocumentArrowUpIcon style={{ width: 32, height: 32, color: "var(--text-tertiary)", margin: "0 auto 8px" }} />
        <p style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }}>
          Arrastra archivos aquí o <span style={{ color: "var(--accent)" }}>selecciona desde tu equipo</span>
        </p>
        <p style={{ color: "var(--text-tertiary)", fontSize: 11, marginTop: 4 }}>PDF, DOCX, TXT, imágenes</p>
      </div>

      {/* Files list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6 }}
              className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <DocumentArrowUpIcon style={{ width: 14, height: 14, color: "var(--accent)" }} />
                <span style={{ fontSize: 12, color: "var(--text-primary)" }}>{f.name}</span>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>({(f.size / 1024).toFixed(0)} KB)</span>
              </div>
              <button onClick={() => removeFile(i)} style={{ color: "var(--text-tertiary)" }}
                className="hover:text-red-400 transition-colors p-0.5">
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between gap-3 pt-2">
        <button onClick={onBack} className="ank-btn-ghost text-xs">
          <ArrowLeftIcon className="h-3.5 w-3.5" /> Atrás
        </button>
        <div className="flex gap-2">
          <button onClick={onNext} className="ank-btn-ghost text-xs">
            Omitir este paso
          </button>
          {files.length > 0 && (
            <button onClick={onNext} className="ank-btn-accent text-xs">
              Continuar ({files.length} archivo{files.length !== 1 ? "s" : ""}) <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Configuration ────────────────────────────────────────────────────

function Step3({ form, onChange, onBack, onSubmit, saving, error }) {
  return (
    <div className="space-y-6">
      {/* process_type */}
      <div>
        <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Tipo de Proceso</p>
        <div className="grid grid-cols-1 gap-2">
          {PROCESS_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange("process_type", t.value)}
              style={{
                background: form.process_type === t.value ? "var(--bg-accent)" : "var(--bg-elevated)",
                border: `1px solid ${form.process_type === t.value ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 6, padding: "10px 14px", textAlign: "left", cursor: "pointer",
                transition: "all 150ms",
              }}
            >
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 13, fontWeight: 600, color: form.process_type === t.value ? "var(--accent)" : "var(--text-primary)" }}>
                  {t.label}
                </span>
                {form.process_type === t.value && (
                  <CheckCircleIcon style={{ width: 16, height: 16, color: "var(--accent)" }} />
                )}
              </div>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* difficulty */}
      <div>
        <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Dificultad</p>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onChange("difficulty", d.value)}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 6, cursor: "pointer",
                background: form.difficulty === d.value ? d.bg : "var(--bg-elevated)",
                border: `1px solid ${form.difficulty === d.value ? d.color : "var(--border)"}`,
                color: form.difficulty === d.value ? d.color : "var(--text-secondary)",
                fontSize: 13, fontWeight: 600, transition: "all 150ms",
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* numeric fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
            Puntaje mínimo (%)
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number" min="0" max="100"
              value={form.minimum_passing_score}
              onChange={(e) => onChange("minimum_passing_score", parseInt(e.target.value) || 0)}
              style={{
                width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 6, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13, outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
            />
            <span style={{ color: "var(--text-tertiary)", fontSize: 13, flexShrink: 0 }}>%</span>
          </div>
        </div>
        <div>
          <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
            Duración estimada
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number" min="1"
              placeholder="ej. 60"
              value={form.estimated_duration_minutes || ""}
              onChange={(e) => onChange("estimated_duration_minutes", e.target.value ? parseInt(e.target.value) : null)}
              style={{
                width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 6, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13, outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
            />
            <span style={{ color: "var(--text-tertiary)", fontSize: 13, flexShrink: 0 }}>min</span>
          </div>
        </div>
      </div>

      {/* order */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Orden</p>
          <input
            type="number" min="1"
            value={form.order}
            onChange={(e) => onChange("order", parseInt(e.target.value) || 1)}
            style={{
              width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13, outline: "none",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
          />
        </div>
        <div className="flex flex-col justify-end pb-0.5">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => onChange("is_required", !form.is_required)}
              style={{
                width: 36, height: 20, borderRadius: 10, cursor: "pointer", flexShrink: 0,
                background: form.is_required ? "var(--accent)" : "var(--bg-elevated)",
                border: `1px solid ${form.is_required ? "var(--accent)" : "var(--border)"}`,
                position: "relative", transition: "all 200ms",
              }}
            >
              <div style={{
                width: 14, height: 14, borderRadius: "50%", background: "#fff",
                position: "absolute", top: 2,
                left: form.is_required ? 19 : 2,
                transition: "left 200ms",
              }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Obligatorio</p>
              <p style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Requerido para completar el path</p>
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "10px 14px" }}>
          <p style={{ color: "#f87171", fontSize: 12 }}>{error}</p>
        </div>
      )}

      <div className="flex justify-between gap-3 pt-2">
        <button onClick={onBack} className="ank-btn-ghost text-xs">
          <ArrowLeftIcon className="h-3.5 w-3.5" /> Atrás
        </button>
        <button onClick={onSubmit} disabled={saving} className="ank-btn-accent text-xs"
          style={{ opacity: saving ? 0.7 : 1 }}>
          {saving ? "Creando…" : "Crear Proceso"}
          {!saving && <CheckIcon className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export function KnowledgeSourceNew() {
  const navigate = useNavigate();
  const { activeCompanyId } = useEnterprise();

  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    process_type: "course",
    difficulty: "medium",
    minimum_passing_score: 70,
    estimated_duration_minutes: null,
    is_required: true,
    order: 1,
  });

  const onChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Nombre es obligatorio."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        company: parseInt(activeCompanyId),
        name: form.name.trim(),
        ...(form.description.trim() && { description: form.description.trim() }),
        process_type: form.process_type,
        difficulty: form.difficulty,
        minimum_passing_score: form.minimum_passing_score,
        is_required: form.is_required,
        order: form.order,
        ...(form.estimated_duration_minutes && { estimated_duration_minutes: form.estimated_duration_minutes }),
      };
      await learningApi.createModule(payload);
      navigate("/enterprise/knowledge");
    } catch (err) {
      setError(
        err?.name?.[0] || err?.company?.[0] || err?.detail ||
        "No se pudo crear el proceso. Verifica los datos e intenta de nuevo."
      );
    } finally { setSaving(false); }
  };

  const STEP_LABELS = ["Información básica", "Documentos", "Configuración"];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/enterprise/knowledge")}
          className="flex items-center gap-1.5 text-xs mb-4 cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: "var(--text-secondary)" }}>
          <ArrowLeftIcon className="h-3.5 w-3.5" /> Volver a Knowledge Sources
        </button>
        <h1 style={{ color: "var(--text-primary)" }} className="text-xl font-bold">Nuevo Proceso</h1>
        <p style={{ color: "var(--text-secondary)" }} className="text-sm mt-0.5">
          Crea un proceso de aprendizaje para tu empresa
        </p>
      </div>

      {/* Step bar */}
      <StepBar current={step} steps={STEP_LABELS} />

      {/* Card */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
        <p style={{ color: "var(--text-tertiary)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 16 }}>
          Paso {step} — {STEP_LABELS[step - 1]}
        </p>

        {step === 1 && (
          <Step1 form={form} onChange={onChange}
            onNext={() => setStep(2)}
            onCancel={() => navigate("/enterprise/knowledge")} />
        )}
        {step === 2 && (
          <Step2 files={files} onFilesChange={setFiles}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <Step3 form={form} onChange={onChange}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            saving={saving}
            error={error} />
        )}
      </div>

      {/* Context info */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 14px" }}
        className="flex items-center justify-between">
        <p style={{ color: "var(--text-tertiary)", fontSize: 11 }}>
          Empresa: <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>ID {activeCompanyId}</span>
        </p>
        {files.length > 0 && (
          <p style={{ color: "var(--text-tertiary)", fontSize: 11 }}>
            {files.length} documento{files.length !== 1 ? "s" : ""} adjunto{files.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

export default KnowledgeSourceNew;
