import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Card,
  CardBody,
  Checkbox,
  Radio,
  Progress,
  IconButton,
  Alert,
  Spinner,
} from "@material-tailwind/react";
import {
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentIcon,
} from "@heroicons/react/24/solid";

import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";
import { DocumentViewerDialog } from "./document-viewer-dialog";

const isMultiSelect = (type) => {
  if (!type) return false;
  const t = type.toLowerCase();
  return t === "multiselect" || t === "multiple_choice" || t === "multiple" || t === "checkbox";
};

export function ExamSimulatorDialog({ open, handler, battery: initialBattery }) {
  const { t, language } = useLanguage();
  if (!initialBattery) return null;

  // -------------------- Attempt state --------------------
  const [attempt, setAttempt] = useState(null);
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [battery, setBattery] = useState(initialBattery);
  const [loadingBattery, setLoadingBattery] = useState(false);

  // guards contra doble llamada (StrictMode / re-render)
  const startKeyRef = useRef(null);
  const startingRef = useRef(false);
  const didFinishRef = useRef(false);

  // -------------------- Exam state --------------------
  const [activeStep, setActiveStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const questions = useMemo(() => battery?.questions || [], [battery]);
  const totalQuestions = questions.length;
  const currentQuestion = questions[activeStep];




  // key estable por cada vez que se abre el dialog con esa batería
  const startKey = useMemo(() => {
    if (!open || !battery?.id) return null;
    // 1 attempt por "apertura" del dialog
    return `${battery?.id}-opened`;
  }, [open, battery?.id]);

  // -------------------- Cargar Batería + Preguntas --------------------
  useEffect(() => {
    if (open && initialBattery) {
      setLoadingBattery(true);
      Promise.all([
        projectService.getBattery(initialBattery.id),
        projectService.getBatteryQuestions(initialBattery.id),
      ])
        .then(([fullData, questions]) => {
          const questionList = Array.isArray(questions) ? questions : questions?.results || [];
          setBattery({ ...fullData, questions: questionList });
        })
        .catch(() => setBattery(initialBattery))
        .finally(() => setLoadingBattery(false));
    }
  }, [open, initialBattery, language]);

  // -------------------- Reset cuando se cierra --------------------
  useEffect(() => {
    if (open) return;

    // reset total al cerrar
    setActiveStep(0);
    setUserAnswers({});
    setShowAnswer(false);
    setIsFinished(false);

    setAttempt(null);
    setSavingAttempt(false);

    startKeyRef.current = null;
    startingRef.current = false;
    didFinishRef.current = false;
  }, [open]);

  // -------------------- Start attempt cuando abre (SIN duplicar) --------------------
  useEffect(() => {
    const run = async () => {
      if (!startKey) return;
      if (!battery?.id) return;

      // ya arrancado en esta apertura
      if (startKeyRef.current === startKey) return;

      // evita requests simultáneos
      if (startingRef.current) return;
      startingRef.current = true;

      try {
        const created = await projectService.startBatteryAttempt(battery.id);
        setAttempt(created);

        // marca como arrancado
        startKeyRef.current = startKey;
        // este attempt todavía no está finalizado
        didFinishRef.current = false;
      } catch (e) {
        console.error("start_attempt failed", e);
        setAttempt(null);
        // no marques startKey, para permitir reintento
        startKeyRef.current = null;
      } finally {
        startingRef.current = false;
      }
    };

    run();
  }, [startKey, battery?.id]);

  // -------------------- Helpers --------------------
  const handleNext = () => {
    if (activeStep < totalQuestions - 1) {
      setActiveStep((cur) => cur + 1);
      setShowAnswer(false);
    } else {
      setIsFinished(true);
    }
  };

  const [viewingDocument, setViewingDocument] = useState(null);
  const [viewingPage, setViewingPage] = useState(null);

  const handleOpenViewer = (docId, page) => {
    console.log("handleOpenViewer called with:", docId, page);
    // Si no tenemos un docId específico en la pregunta, intentamos usar el de la batería
    const finalDocId = docId || battery.document_id || (battery.documents && battery.documents[0]?.id);
    if (finalDocId) {
      setViewingDocument({ id: finalDocId });
      setViewingPage(page);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep((cur) => cur - 1);
      setShowAnswer(false);
    }
  };

  const handleOptionSelect = async (questionId, optionId, type) => {
    if (showAnswer) return;
    if (!attempt?.id) return;

    let newVal;
    const currentVal = userAnswers[questionId];

    if (isMultiSelect(type)) {
      const currentSelected = Array.isArray(currentVal) ? currentVal : [];
      if (currentSelected.includes(optionId)) {
        newVal = currentSelected.filter((id) => id !== optionId);
      } else {
        newVal = [...currentSelected, optionId];
      }
    } else {
      newVal = optionId;
    }

    // Update local state
    setUserAnswers((prev) => ({ ...prev, [questionId]: newVal }));

    // Update backend in real-time
    try {
      const payload = {
        attempt_id: attempt.id,
        question_id: questionId,
      };

      if (isMultiSelect(type)) {
        payload.selected_option_ids = newVal;
      } else {
        payload.selected_option_id = newVal;
      }

      await projectService.answerBatteryQuestion(battery.id, payload);
    } catch (err) {
      console.error("Error saving answer in real-time:", err);
    }
  };

  const isOptionSelected = (qId, optId, type) => {
    const ans = userAnswers[qId];
    if (ans == null) return false;
    if (isMultiSelect(type)) return Array.isArray(ans) && ans.includes(optId);
    return ans === optId;
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;

    (questions || []).forEach((q) => {
      const qPoints = Number(q?.points ?? 0);
      maxScore += qPoints;

      const userAnswer = userAnswers[q.id];
      if (userAnswer == null) return;

      if (isMultiSelect(q.type)) {
        const correctOptionIds = (q.options || [])
          .filter((o) => o.correct)
          .map((o) => o.id)
          .slice()
          .sort();

        const userSelectedIds = (Array.isArray(userAnswer) ? userAnswer : [])
          .slice()
          .sort();

        const isCorrect =
          correctOptionIds.length === userSelectedIds.length &&
          correctOptionIds.every((id, idx) => id === userSelectedIds[idx]);

        if (isCorrect) {
          totalScore += qPoints;
          correctCount += 1;
        }
      } else {
        const selectedOption = (q.options || []).find((o) => o.id === userAnswer);
        if (selectedOption?.correct) {
          totalScore += qPoints;
          correctCount += 1;
        }
      }
    });

    totalScore = Number.isFinite(totalScore) ? totalScore : 0;
    maxScore = Number.isFinite(maxScore) ? maxScore : 0;
    correctCount = Number.isFinite(correctCount) ? correctCount : 0;

    return { totalScore, maxScore, correctCount };
  };

  const finishAttempt = async () => {
    if (!battery?.id) return;
    if (!attempt?.id) return;

    const { totalScore, maxScore, correctCount } = calculateScore();

    const payload = {
      attempt_id: attempt.id,
      total_score: totalScore,
      max_score: maxScore,
      correct_count: correctCount,
      total_questions: totalQuestions,
    };

    await projectService.finishBatteryAttempt(battery.id, payload);
  };

  // -------------------- finish_attempt una sola vez al finalizar --------------------
  useEffect(() => {
    const run = async () => {
      if (!open) return;
      if (!isFinished) return;
      if (!attempt?.id) return;

      // evita doble finish
      if (didFinishRef.current) return;
      didFinishRef.current = true;

      setSavingAttempt(true);
      try {
        await finishAttempt();
      } catch (e) {
        console.error("finish_attempt failed", e);
        // si falla y quieres permitir reintentar, descomenta:
        // didFinishRef.current = false;
      } finally {
        setSavingAttempt(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isFinished, attempt?.id]);

  const resetExam = () => {
    setActiveStep(0);
    setUserAnswers({});
    setShowAnswer(false);
    setIsFinished(false);

    // Importante: NO creamos otro attempt en Retry (para no duplicar).
    // Si quieres que Retry cree un attempt NUEVO, hazlo explícito:
    // 1) setAttempt(null)
    // 2) startKeyRef.current = null
    // 3) didFinishRef.current = false
    // y vuelve a abrir/forzar start_attempt
  };

  // -------------------- Guardrail si no hay preguntas --------------------
  if (loadingBattery) {
    return (
      <Dialog open={open} handler={handler} size="lg">
        <DialogBody className="flex flex-col items-center justify-center py-20">
          <Spinner className="h-10 w-10 text-indigo-500 mb-4" />
          <Typography color="blue-gray" className="font-medium">
            {language === "es" ? "Cargando examen..." : "Loading exam..."}
          </Typography>
        </DialogBody>
      </Dialog>
    );
  }

  if (!currentQuestion) {
    return (
      <Dialog open={open} handler={handler} size="lg">
        <DialogHeader className="justify-center">{language === "es" ? "Simulador de Examen" : "Exam Simulator"}</DialogHeader>
        <DialogBody className="text-center">
          <Typography color="blue-gray">{language === "es" ? "Esta batería aún no tiene preguntas." : "This battery has no questions yet."}</Typography>
        </DialogBody>
        <DialogFooter className="justify-center">
          <Button color="blue" onClick={handler}>
            {language === "es" ? "Cerrar" : "Close"}
          </Button>
        </DialogFooter>
      </Dialog>
    );
  }

  // -------------------- Result Screen --------------------
  if (isFinished) {
    const { totalScore, maxScore } = calculateScore();
    const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return (
      <Dialog open={open} handler={handler} size="lg">
        <DialogHeader className="justify-center">{language === "es" ? "Resultados del Examen" : "Exam Results"}</DialogHeader>

        <DialogBody className="text-center">
          <Typography variant="h1" color={percent >= 60 ? "green" : "red"} className="mb-4">
            {percent}%
          </Typography>

          <Typography variant="h5" color="blue-gray" className="mb-2">
            {language === "es" ? "Puntuaste" : "You scored"} {Number(totalScore || 0).toFixed(2)}{" "}
            {language === "es" ? "de" : "out of"} {Number(maxScore || 0).toFixed(2)}{" "}
            {language === "es" ? "puntos" : "points"}
          </Typography>

          <Progress
            value={percent}
            color={percent >= 60 ? "green" : "red"}
            className="h-4 w-full rounded-full bg-blue-gray-50 mb-6"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left p-4 bg-gray-50 rounded-lg">
            <div>
              <Typography variant="small" className="font-bold">
                {language === "es" ? "Nombre de la Batería" : "Battery Name"}:
              </Typography>
              <Typography className="text-sm">{battery.name}</Typography>
            </div>
            <div>
              <Typography variant="small" className="font-bold">
                {language === "es" ? "Preguntas Totales" : "Total Questions"}:
              </Typography>
              <Typography className="text-sm">{totalQuestions}</Typography>
            </div>
          </div>

          <div className="mt-4 text-xs text-blue-gray-500">
            {language === "es" ? "Intento #" : "Attempt #"}{(battery.attempts_count || 0) + 1}{" "}
            {savingAttempt ? `• ${language === "es" ? "Guardando intento..." : "Saving attempt..."}` : ""}
          </div>
        </DialogBody>

        <DialogFooter className="justify-center gap-3 flex-wrap">
          <Button variant="outlined" color="blue-gray" onClick={resetExam} disabled={savingAttempt} className="normal-case">
            {language === "es" ? "Reintentar" : "Retry"}
          </Button>
          <Button variant="gradient" color="green" onClick={handler} disabled={savingAttempt} className="normal-case">
            {language === "es" ? "Cerrar" : "Close"}
          </Button>
        </DialogFooter>
      </Dialog>
    );
  }

  // -------------------- Question Screen --------------------
  const progressPct = totalQuestions > 0 ? ((activeStep + 1) / totalQuestions) * 100 : 0;

  return (
    <Dialog open={open} handler={handler} size="xl"
      className="overflow-hidden !mx-0 !my-0 !rounded-none !max-w-full !w-full !h-[100dvh] md:!mx-auto md:!my-8 md:!rounded-2xl md:!max-w-3xl md:!h-auto md:!w-auto">
      <div className="flex flex-col h-full">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 flex-shrink-0">
          {/* Mobile: back button */}
          <button onClick={handler} className="md:hidden flex items-center gap-1" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ank-purple)", fontSize: "13px", fontWeight: 600 }}>
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="truncate max-w-[120px]">{battery?.name || battery?.title}</span>
          </button>
          {/* Desktop: full title */}
          <Typography variant="h5" color="blue-gray" className="hidden md:block">
            {language === "es" ? "Pregunta" : "Question"} {activeStep + 1}
            <span className="text-sm text-gray-500 font-normal ml-1">{language === "es" ? "de" : "of"} {totalQuestions}</span>
          </Typography>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold md:hidden" style={{ color: "#888" }}>{activeStep + 1}/{totalQuestions}</span>
            <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: "#FAEEDA", color: "#854F0B" }}>
              {currentQuestion.points} pts
            </span>
            <IconButton variant="text" color="blue-gray" onClick={handler} className="hidden md:flex">
              <XCircleIcon className="h-6 w-6" />
            </IconButton>
          </div>
        </div>

        {/* Thin progress strip */}
        <div style={{ height: 3, background: "#f0f0f0", flexShrink: 0 }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: "var(--ank-purple)", borderRadius: 2, transition: "width 0.3s" }} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-white md:bg-gray-50">

          {/* Question card — purple on mobile, white on desktop */}
          <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-xl md:rounded-lg border md:shadow-sm"
            style={{ background: "#EEEDFE", borderColor: "#AFA9EC" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#534AB7" }}>
              {currentQuestion.type === "trueFalse"
                ? (language === "es" ? "Verdadero / Falso" : "True / False")
                : isMultiSelect(currentQuestion.type)
                  ? (language === "es" ? "Selección Múltiple" : "Multiple Selection")
                  : (language === "es" ? "Opción Única" : "Single Choice")}
              {currentQuestion.topicName && (
                <span className="ml-2 normal-case font-medium opacity-70">· {currentQuestion.topicName}</span>
              )}
            </p>
            <p className="text-sm md:text-base font-medium leading-snug" style={{ color: "#3C3489" }}>
              {currentQuestion.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2 md:space-y-3">
            {(currentQuestion.options || []).map((option) => {
              const isSelected = isOptionSelected(currentQuestion.id, option.id, currentQuestion.type);
              const isCorrect = !!option.correct;

              let borderCol = "#e5e7eb";
              let bgCol = "#fff";
              if (showAnswer) {
                if (isCorrect) { borderCol = "#22c55e"; bgCol = "#f0fdf4"; }
                else if (isSelected && !isCorrect) { borderCol = "#ef4444"; bgCol = "#fef2f2"; }
              } else if (isSelected) {
                borderCol = "var(--ank-purple)";
                bgCol = "#EEEDFE";
              }

              return (
                <div
                  key={option.id}
                  onClick={() => handleOptionSelect(currentQuestion.id, option.id, currentQuestion.type)}
                  style={{ border: `1px solid ${borderCol}`, background: bgCol, borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "all 0.15s" }}
                >
                  {/* Custom radio/checkbox dot */}
                  <div style={{
                    width: 16, height: 16, borderRadius: isMultiSelect(currentQuestion.type) ? 4 : "50%",
                    border: `2px solid ${isSelected ? "var(--ank-purple)" : "#ccc"}`,
                    background: isSelected ? "var(--ank-purple)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    {isSelected && <div style={{ width: 6, height: 6, borderRadius: isMultiSelect(currentQuestion.type) ? 2 : "50%", background: "#fff" }} />}
                  </div>
                  <span style={{ fontSize: 13, color: "#1a1a2e", fontWeight: 500, flex: 1 }}>{option.text}</span>
                  {showAnswer && isCorrect && <CheckCircleIcon className="h-5 w-5 flex-shrink-0" style={{ color: "#22c55e" }} />}
                  {showAnswer && isSelected && !isCorrect && <XCircleIcon className="h-5 w-5 flex-shrink-0" style={{ color: "#ef4444" }} />}
                </div>
              );
            })}
          </div>

          {showAnswer && (
            <div className="mt-4 p-3 rounded-xl border" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
              <div className="flex items-center gap-2 mb-1">
                <LightBulbIcon className="h-4 w-4" style={{ color: "#D97706" }} />
                <p className="text-xs font-bold uppercase" style={{ color: "#92400E" }}>{language === "es" ? "Explicación" : "Explanation"}</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#78350F" }}>
                {currentQuestion.explanation || (language === "es" ? "No se proporcionó explicación." : "No explanation provided.")}
              </p>
              {currentQuestion.page_reference && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-bold italic" style={{ color: "#92400E" }}>
                    {language === "es" ? "Pág:" : "Page:"} {currentQuestion.page_reference}
                  </span>
                  {(currentQuestion.source_document_id || currentQuestion.document_id || battery.document_id) && (
                    <IconButton size="sm" variant="text" color="amber"
                      onClick={() => handleOpenViewer(currentQuestion.source_document_id || currentQuestion.document_id || currentQuestion.document, currentQuestion.page_reference)}>
                      <DocumentIcon className="h-3 w-3" />
                    </IconButton>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {/* Mobile footer */}
        <div className="md:hidden flex gap-2 px-3 pt-3 border-t border-gray-100 flex-shrink-0" style={{ background: "#fff", paddingBottom: "max(25px, env(safe-area-inset-bottom, 25px))" }}>
          <button onClick={handlePrev} disabled={activeStep === 0}
            style={{ flex: 1, padding: "10px", borderRadius: 10, background: activeStep === 0 ? "#f5f5f7" : "#EEEDFE", color: activeStep === 0 ? "#ccc" : "var(--ank-purple)", border: "none", fontWeight: 700, fontSize: 13, cursor: activeStep === 0 ? "default" : "pointer" }}>
            ← {language === "es" ? "Anterior" : "Prev"}
          </button>
          {!showAnswer && (
            <button onClick={() => setShowAnswer(true)}
              style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#FAEEDA", color: "#854F0B", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {language === "es" ? "Respuesta" : "Answer"}
            </button>
          )}
          <button onClick={handleNext} disabled={savingAttempt}
            style={{ flex: 2, padding: "10px", borderRadius: 10, background: "var(--ank-purple)", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {activeStep === totalQuestions - 1 ? (language === "es" ? "Finalizar" : "Finish") : (language === "es" ? "Siguiente →" : "Next →")}
          </button>
        </div>

        {/* Desktop footer */}
        <DialogFooter className="hidden md:flex justify-between border-t border-gray-100 p-4 flex-wrap gap-2">
          <Button variant="text" onClick={handlePrev} disabled={activeStep === 0} className="flex items-center gap-1 text-sm normal-case">
            <ChevronLeftIcon className="h-4 w-4" /> {language === "es" ? "Anterior" : "Prev"}
          </Button>
          <div className="flex gap-2">
            {!showAnswer && (
              <Button variant="outlined" color="amber" onClick={() => setShowAnswer(true)} className="flex items-center gap-1 text-sm normal-case">
                <LightBulbIcon className="h-4 w-4" /> {language === "es" ? "Mostrar Respuesta" : "Show Answer"}
              </Button>
            )}
            <Button variant="gradient" color="blue" onClick={handleNext} disabled={savingAttempt} className="flex items-center gap-1 text-sm normal-case">
              {activeStep === totalQuestions - 1 ? (language === "es" ? "Finalizar" : "Finish") : (language === "es" ? "Siguiente" : "Next")}
              {activeStep !== totalQuestions - 1 && <ChevronRightIcon className="h-4 w-4" />}
            </Button>
          </div>
        </DialogFooter>

      </div>

      <DocumentViewerDialog
        open={!!viewingDocument}
        onClose={() => setViewingDocument(null)}
        document={viewingDocument}
        page={viewingPage}
      />
    </Dialog>
  );
}

export default ExamSimulatorDialog;
