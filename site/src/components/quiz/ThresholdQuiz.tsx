"use client";

import { useEffect, useMemo, useState } from "react";

import { getQuizAnswersKey } from "@/lib/progress";

import { QuizQuestionCard } from "./QuizQuestionCard";
import type { QuizQuestion } from "./types";
import { buildRenderQuestions } from "./utils";

type SavedState = {
  selectedOptionValues?: Array<string | null>;
  answeredCorrectly?: boolean[];
  currentQuestionIndex?: number;
  quizAttemptCount?: number;
  thresholdPassed?: boolean;
  thresholdFailed?: boolean;
};

export function ThresholdQuiz({
  courseId,
  lessonId,
  questions,
  passThreshold,
  maxAttempts,
  resetScopeOnFail,
  onAllQuestionsCorrectChange,
  onFinalQuestionContinue,
  onThresholdQuizFailed,
}: {
  courseId: string;
  lessonId: string;
  questions: QuizQuestion[];
  passThreshold: number;
  maxAttempts?: number;
  resetScopeOnFail?: "module" | "course";
  onAllQuestionsCorrectChange: (isPassed: boolean) => void;
  onFinalQuestionContinue?: () => void;
  onThresholdQuizFailed?: (scope: "module" | "course") => void;
}) {
  const allowedAttempts = Math.max(1, maxAttempts ?? 2);
  const failureScope = resetScopeOnFail ?? "module";

  const renderQuestions = useMemo(
    () => buildRenderQuestions(questions, lessonId),
    [questions, lessonId],
  );

  const n = renderQuestions.length;
  const falses = () => Array.from({ length: n }, () => false);
  const negs = () => Array.from({ length: n }, () => -1);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>(negs);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean[]>(falses);
  const [quizAttemptCount, setQuizAttemptCount] = useState(0);
  const [thresholdPassed, setThresholdPassed] = useState(false);
  const [thresholdFailed, setThresholdFailed] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    onAllQuestionsCorrectChange(thresholdPassed);
  }, [thresholdPassed, onAllQuestionsCorrectChange]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(getQuizAnswersKey(courseId, lessonId));
      if (!raw) return;
      const saved = JSON.parse(raw) as SavedState;
      /* eslint-disable react-hooks/set-state-in-effect */
      setSelectedIndexes(
        Array.from({ length: n }, (_, idx) => {
          const val = saved.selectedOptionValues?.[idx];
          if (typeof val === "string") {
            return renderQuestions[idx]?.options.findIndex((o) => o === val) ?? -1;
          }
          return -1;
        }),
      );
      setAnsweredCorrectly(Array.from({ length: n }, (_, idx) => saved.answeredCorrectly?.[idx] ?? false));
      const saved_idx = saved.currentQuestionIndex ?? 0;
      setCurrentIndex(Math.max(0, Math.min(n - 1, saved_idx)));
      setQuizAttemptCount(saved.quizAttemptCount ?? 0);
      setThresholdPassed(Boolean(saved.thresholdPassed));
      setThresholdFailed(Boolean(saved.thresholdFailed));
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      // ignore malformed data
    }
  }, [courseId, lessonId, n, renderQuestions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const selectedOptionValues = selectedIndexes.map((si, idx) =>
      si < 0 ? null : (renderQuestions[idx]?.options[si] ?? null),
    );
    window.localStorage.setItem(
      getQuizAnswersKey(courseId, lessonId),
      JSON.stringify({
        selectedOptionValues,
        answeredCorrectly,
        currentQuestionIndex: currentIndex,
        quizAttemptCount,
        thresholdPassed,
        thresholdFailed,
      } satisfies SavedState),
    );
  }, [answeredCorrectly, courseId, currentIndex, lessonId, quizAttemptCount, renderQuestions, selectedIndexes, thresholdFailed, thresholdPassed]);

  const question = renderQuestions[currentIndex];
  const selectedOptionIndex = selectedIndexes[currentIndex] ?? -1;
  const isLastQuestion = currentIndex >= n - 1;

  const resetAttempt = (clearFeedback: boolean) => {
    setCurrentIndex(0);
    setSelectedIndexes(negs);
    setAnsweredCorrectly(falses);
    if (clearFeedback) setFeedback("");
  };

  const handleProceed = () => {
    if (thresholdFailed) return;

    if (selectedOptionIndex < 0) {
      setFeedback("Select an answer before continuing.");
      return;
    }

    const isCorrect = selectedOptionIndex === question.correctOptionIndex;
    setAnsweredCorrectly((prev) => {
      const next = [...prev];
      next[currentIndex] = isCorrect;
      return next;
    });

    if (!isLastQuestion) {
      setCurrentIndex((i) => i + 1);
      setFeedback("");
      return;
    }

    const finalCorrectAnswers = answeredCorrectly.map((v, idx) =>
      idx === currentIndex ? isCorrect : v,
    );
    const correctCount = finalCorrectAnswers.filter(Boolean).length;
    const scorePercent = n > 0 ? Math.round((correctCount / n) * 100) : 0;

    if (scorePercent >= passThreshold) {
      setThresholdPassed(true);
      setFeedback(`Passed with ${scorePercent}% (required ${passThreshold}%).`);
      onFinalQuestionContinue?.();
      return;
    }

    const nextAttempt = quizAttemptCount + 1;
    setQuizAttemptCount(nextAttempt);

    if (nextAttempt < allowedAttempts) {
      resetAttempt(false);
      setFeedback(
        `Score ${scorePercent}% is below required ${passThreshold}%. Retry ${nextAttempt + 1} of ${allowedAttempts}.`,
      );
      return;
    }

    setThresholdFailed(true);
    setFeedback(`Failed after ${allowedAttempts} attempts (${scorePercent}% / required ${passThreshold}%).`);
    onThresholdQuizFailed?.(failureScope);
  };

  const handleSelectOption = (idx: number) => {
    setSelectedIndexes((prev) => {
      const next = [...prev];
      next[currentIndex] = idx;
      return next;
    });
    setFeedback("");
  };

  const correctCount = answeredCorrectly.filter(Boolean).length;
  const scorePercent = n > 0 ? Math.round((correctCount / n) * 100) : 0;

  return (
    <div className="space-y-4">
      <QuizQuestionCard
        lessonId={lessonId}
        question={question}
        questionNumber={currentIndex + 1}
        totalQuestions={n}
        selectedOptionIndex={selectedOptionIndex}
        wrongOptionIndex={-1}
        revealCorrect={thresholdPassed}
        feedbackMessage={feedback}
        proceedLabel={isLastQuestion ? "Submit Quiz" : "Next Question"}
        proceedDisabled={thresholdFailed}
        attemptDisplay={`Quiz Attempts Used: ${quizAttemptCount}/${allowedAttempts}`}
        onSelectOption={handleSelectOption}
        onProceed={handleProceed}
        onBack={() => {
          if (!thresholdFailed) {
            setCurrentIndex((i) => Math.max(0, i - 1));
            setFeedback("");
          }
        }}
      />
      <p className="text-sm font-semibold text-[var(--jjs-green-800)]">
        Score: {correctCount}/{n} ({scorePercent}%)
      </p>
    </div>
  );
}
