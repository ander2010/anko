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
} from "@material-tailwind/react";
import {
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";

export function ExamSimulatorDialog({ open, handler, battery }) {
  const { t, language } = useLanguage();
  if (!battery) return null;

  // -------------------- Attempt state --------------------
  const [attempt, setAttempt] = useState(null);
  const [savingAttempt, setSavingAttempt] = useState(false);

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
    return `${battery.id}-opened`;
  }, [open, battery?.id]);

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

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep((cur) => cur - 1);
      setShowAnswer(false);
    }
  };

  const handleOptionSelect = (questionId, optionId, type) => {
    if (showAnswer) return;

    setUserAnswers((prev) => {
      if (type === "multiSelect") {
        const currentSelected = Array.isArray(prev[questionId]) ? prev[questionId] : [];
        if (currentSelected.includes(optionId)) {
          return { ...prev, [questionId]: currentSelected.filter((id) => id !== optionId) };
        }
        return { ...prev, [questionId]: [...currentSelected, optionId] };
      }
      return { ...prev, [questionId]: optionId };
    });
  };

  const isOptionSelected = (qId, optId, type) => {
    const ans = userAnswers[qId];
    if (ans == null) return false;
    if (type === "multiSelect") return Array.isArray(ans) && ans.includes(optId);
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

      if (q.type === "multiSelect") {
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

          <div className="grid grid-cols-2 gap-4 text-left p-4 bg-gray-50 rounded-lg">
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

        <DialogFooter className="justify-center gap-4">
          <Button variant="outlined" color="blue-gray" onClick={resetExam} disabled={savingAttempt}>
            {language === "es" ? "Reintentar Examen" : "Retry Exam"}
          </Button>
          <Button variant="gradient" color="green" onClick={handler} disabled={savingAttempt}>
            {language === "es" ? "Cerrar" : "Close"}
          </Button>
        </DialogFooter>
      </Dialog>
    );
  }

  // -------------------- Question Screen --------------------
  return (
    <Dialog open={open} handler={handler} size="xl" className="overflow-hidden">
      <DialogHeader className="flex justify-between items-center border-b border-gray-100 p-4">
        <Typography variant="h5" color="blue-gray">
          {language === "es" ? "Pregunta" : "Question"} {activeStep + 1}{" "}
          <span className="text-sm text-gray-500 font-normal">
            {language === "es" ? "de" : "of"} {totalQuestions}
          </span>
        </Typography>

        <div className="flex gap-2 items-center">
          <Typography variant="small" className="font-bold text-blue-600">
            {currentQuestion.points} pts
          </Typography>
          <IconButton variant="text" color="blue-gray" onClick={handler}>
            <XCircleIcon className="h-6 w-6" />
          </IconButton>
        </div>
      </DialogHeader>

      <DialogBody className="h-[60vh] overflow-y-auto p-6 bg-gray-50">
        <div className="mb-6">
          <Progress
            value={totalQuestions > 0 ? ((activeStep + 1) / totalQuestions) * 100 : 0}
            size="sm"
            color="blue"
          />
        </div>

        <Card className="mb-6 shadow-sm border border-gray-200">
          <CardBody>
            <Typography variant="h5" color="blue-gray" className="mb-2">
              {currentQuestion.question}
            </Typography>

            <div className="flex gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-bold">
                {currentQuestion.type === "trueFalse"
                  ? (language === "es" ? "Verdadero / Falso" : "True / False")
                  : currentQuestion.type === "multiSelect"
                    ? (language === "es" ? "Selección Múltiple" : "Multiple Selection")
                    : (language === "es" ? "Opción Única" : "Single Choice")}
              </span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                {language === "es" ? "tema" : "topic"}: {currentQuestion.topicName || battery.name || (language === "es" ? "General" : "General")}
              </span>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-3">
          {(currentQuestion.options || []).map((option) => {
            const isSelected = isOptionSelected(currentQuestion.id, option.id, currentQuestion.type);
            const isCorrect = !!option.correct;

            let cardColor = "white";
            let borderColor = "border-gray-200";

            if (showAnswer) {
              if (isCorrect) {
                cardColor = "bg-green-50";
                borderColor = "border-green-500";
              } else if (isSelected && !isCorrect) {
                cardColor = "bg-red-50";
                borderColor = "border-red-500";
              }
            } else if (isSelected) {
              cardColor = "bg-blue-50";
              borderColor = "border-blue-500";
            }

            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all border ${borderColor} ${cardColor} hover:shadow-md`}
                onClick={() => handleOptionSelect(currentQuestion.id, option.id, currentQuestion.type)}
              >
                <CardBody className="p-4 flex items-center gap-4">
                  <div className="pointer-events-none">
                    {currentQuestion.type === "multiSelect" ? (
                      <Checkbox checked={isSelected} containerProps={{ className: "p-0" }} readOnly />
                    ) : (
                      <Radio checked={isSelected} containerProps={{ className: "p-0" }} readOnly />
                    )}
                  </div>

                  <Typography color="blue-gray" className="font-medium flex-1">
                    {option.text}
                  </Typography>

                  {showAnswer && isCorrect && <CheckCircleIcon className="h-6 w-6 text-green-500" />}
                  {showAnswer && isSelected && !isCorrect && <XCircleIcon className="h-6 w-6 text-red-500" />}
                </CardBody>
              </Card>
            );
          })}
        </div>

        {showAnswer && (
          <Alert
            icon={<LightBulbIcon className="mt-px h-6 w-6 text-yellow-600" />}
            className="mt-6 bg-blue-50 border border-blue-100 text-blue-900"
          >
            <Typography variant="h6" className="mb-1">
              {language === "es" ? "Explicación" : "Explanation"}
            </Typography>
            <Typography variant="small" className="opacity-90">
              {currentQuestion.explanation || (language === "es" ? "No se proporcionó explicación para esta pregunta." : "No explanation provided for this question.")}
            </Typography>
          </Alert>
        )}
      </DialogBody>

      <DialogFooter className="justify-between border-t border-gray-100 p-4">
        <Button
          variant="text"
          onClick={handlePrev}
          disabled={activeStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeftIcon className="h-4 w-4" /> {language === "es" ? "Anterior" : "Previous"}
        </Button>

        <div className="flex gap-2">
          {!showAnswer && (
            <Button
              variant="outlined"
              color="amber"
              onClick={() => setShowAnswer(true)}
              className="flex items-center gap-2"
            >
              <LightBulbIcon className="h-4 w-4" /> {language === "es" ? "Mostrar Respuesta" : "Show Answer"}
            </Button>
          )}

          <Button
            variant="gradient"
            color="blue"
            onClick={handleNext}
            className="flex items-center gap-2"
            disabled={savingAttempt}
          >
            {activeStep === totalQuestions - 1
              ? (language === "es" ? "Finalizar Examen" : "Finish Exam")
              : (language === "es" ? "Siguiente Pregunta" : "Next Question")}
            {activeStep !== totalQuestions - 1 && <ChevronRightIcon className="h-4 w-4" />}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}

export default ExamSimulatorDialog;
