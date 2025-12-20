import React, { useState } from "react";
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
    Alert
} from "@material-tailwind/react";
import {
    CheckCircleIcon,
    XCircleIcon,
    LightBulbIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FlagIcon
} from "@heroicons/react/24/solid";

export function ExamSimulatorDialog({ open, handler, battery }) {
    if (!battery) return null;

    const [activeStep, setActiveStep] = useState(0);
    const [userAnswers, setUserAnswers] = useState({}); // { questionId: selectedOptionId | [selectedOptionIds] }
    const [showAnswer, setShowAnswer] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const totalQuestions = battery.questions.length;
    const currentQuestion = battery.questions[activeStep];

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
            setShowAnswer(false); // Reset state or keep per question? MVP: reset/hide
            // Ideally we remember the "showAnswer" state per question, but simple toggle is fine for MVP
        }
    };

    const handleOptionSelect = (questionId, optionId, type) => {
        if (showAnswer) return; // Freeze if answer shown

        setUserAnswers((prev) => {
            if (type === "multiSelect") {
                const currentSelected = prev[questionId] || [];
                if (currentSelected.includes(optionId)) {
                    return { ...prev, [questionId]: currentSelected.filter((id) => id !== optionId) };
                } else {
                    return { ...prev, [questionId]: [...currentSelected, optionId] };
                }
            } else {
                return { ...prev, [questionId]: optionId };
            }
        });
    };

const calculateScore = () => {
  let totalScore = 0;
  let maxScore = 0;

  (battery?.questions || []).forEach((q) => {
    const qPoints = Number(q?.points ?? 0); // <- fuerza número SIEMPRE
    maxScore += qPoints;

    const userAnswer = userAnswers[q.id];
    if (userAnswer == null) return;

    if (q.type === "multiSelect") {
      const correctOptionIds = (q.options || [])
        .filter((o) => o.correct)
        .map((o) => o.id)
        .sort();

      const userSelectedIds = (Array.isArray(userAnswer) ? userAnswer : [])
        .slice()
        .sort();

      const isCorrect =
        correctOptionIds.length === userSelectedIds.length &&
        correctOptionIds.every((id, idx) => id === userSelectedIds[idx]);

      if (isCorrect) totalScore += qPoints;
    } else {
      const selectedOption = (q.options || []).find((o) => o.id === userAnswer);
      if (selectedOption?.correct) totalScore += qPoints;
    }
  });

  // seguridad extra por si algo raro llega:
  totalScore = Number.isFinite(totalScore) ? totalScore : 0;
  maxScore = Number.isFinite(maxScore) ? maxScore : 0;

  return { totalScore, maxScore };
};


    const resetExam = () => {
        setActiveStep(0);
        setUserAnswers({});
        setShowAnswer(false);
        setIsFinished(false);
    };

    const isOptionSelected = (qId, optId, type) => {
        const ans = userAnswers[qId];
        if (!ans) return false;
        if (type === "multiSelect") return ans.includes(optId);
        return ans === optId;
    };

    // Render Result Screen
    if (isFinished) {
        const { totalScore, maxScore } = calculateScore();
        const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

        return (
            <Dialog open={open} handler={handler} size="lg">
                <DialogHeader className="justify-center">Exam Results</DialogHeader>
                <DialogBody className="text-center">
                    <Typography variant="h1" color={percent >= 60 ? "green" : "red"} className="mb-4">
                        {percent}%
                    </Typography>
                    <Typography variant="h5" color="blue-gray" className="mb-2">
                   You scored {Number(totalScore || 0).toFixed(2)} out of {Number(maxScore || 0).toFixed(2)} points

                    </Typography>
                    <Progress value={percent} color={percent >= 60 ? "green" : "red"} className="h-4 w-full rounded-full bg-blue-gray-50 mb-6" />

                    <div className="grid grid-cols-2 gap-4 text-left p-4 bg-gray-50 rounded-lg">
                        <div>
                            <Typography variant="small" className="font-bold">Battery Name:</Typography>
                            <Typography className="text-sm">{battery.name}</Typography>

                        </div>
                        <div>
                            <Typography variant="small" className="font-bold">Total Questions:</Typography>
                            <Typography class="text-sm">{totalQuestions}</Typography>
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter className="justify-center gap-4">
                    <Button variant="outlined" color="blue-gray" onClick={resetExam}>
                        Retry Exam
                    </Button>
                    <Button variant="gradient" color="green" onClick={handler}>
                        Close
                    </Button>
                </DialogFooter>
            </Dialog>
        );
    }

    // Render Question Screen
    return (
        <Dialog open={open} handler={handler} size="xl" className="overflow-hidden">
            <DialogHeader className="flex justify-between items-center border-b border-gray-100 p-4">
                <Typography variant="h5" color="blue-gray">
                    Question {activeStep + 1} <span className="text-sm text-gray-500 font-normal">of {totalQuestions}</span>
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
                {/* Progress Bar */}
                <div className="mb-6">
                    <Progress value={((activeStep + 1) / totalQuestions) * 100} size="sm" color="blue" />
                </div>

                {/* Question Text */}
                <Card className="mb-6 shadow-sm border border-gray-200">
                    <CardBody>
                        <Typography variant="h5" color="blue-gray" className="mb-2">
                            {currentQuestion.question}
                        </Typography>
                        <div className="flex gap-2">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-bold">
                                {currentQuestion.type === "trueFalse" ? "True / False" :
                                    currentQuestion.type === "multiSelect" ? "Multiple Selection" : "Single Choice"}
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                topic: {currentQuestion.topicName || "General"}
                            </span>
                        </div>
                    </CardBody>
                </Card>

                {/* Options */}
                <div className="space-y-3">
                    {currentQuestion.options.map((option) => {
                        const isSelected = isOptionSelected(currentQuestion.id, option.id, currentQuestion.type);
                        const isCorrect = option.correct;

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

                                    {showAnswer && isCorrect && (
                                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                    )}
                                    {showAnswer && isSelected && !isCorrect && (
                                        <XCircleIcon className="h-6 w-6 text-red-500" />
                                    )}
                                </CardBody>
                            </Card>
                        );
                    })}
                </div>

                {/* Explanation Box */}
                {showAnswer && (
                    <Alert
                        icon={<LightBulbIcon className="mt-px h-6 w-6" />}
                        className="mt-6 bg-blue-50 border border-blue-100 text-blue-900"
                    >
                        <Typography variant="h6" className="mb-1">
                            Explanation
                        </Typography>
                        <Typography variant="small" className="opacity-90">
                            {currentQuestion.explanation || "No explanation provided for this question."}
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
                    <ChevronLeftIcon className="h-4 w-4" /> Previous
                </Button>

                <div className="flex gap-2">
                    {!showAnswer && (
                        <Button
                            variant="outlined"
                            color="amber"
                            onClick={() => setShowAnswer(true)}
                            className="flex items-center gap-2"
                        >
                            <LightBulbIcon className="h-4 w-4" /> Show Answer
                        </Button>
                    )}

                    <Button
                        variant="gradient"
                        color="blue"
                        onClick={handleNext}
                        className="flex items-center gap-2"
                    >
                        {activeStep === totalQuestions - 1 ? "Finish Exam" : "Next Question"}
                        {activeStep !== totalQuestions - 1 && <ChevronRightIcon className="h-4 w-4" />}
                    </Button>
                </div>
            </DialogFooter>
        </Dialog>
    );
}

export default ExamSimulatorDialog;
