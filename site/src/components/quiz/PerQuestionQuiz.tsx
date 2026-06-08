"use client";

import { useEffect, useMemo, useState } from "react";

import { getQuizAnswersKey } from "@/lib/progress";

import { QuizQuestionCard } from "./QuizQuestionCard";
import type { QuizQuestion } from "./types";
import { buildRenderQuestions } from "./utils";

type SavedState = {
  selectedOptionValues?: Array<string | null>;
  selectedOptionIndexes?: number[];
  answeredCorrectly?: boolean[];
  attemptCounts?: number[];
  unlockedAfterMaxAttempts?: boolean[];
  currentQuestionIndex?: number;
};

export function PerQuestionQuiz({
  courseId,
  lessonId,
  questions,
  onAllQuestionsCorrectChange,
  onFinalQuestionContinue,
}: {
  courseId: string;
  lessonId: string;
  questions: QuizQuestion[];
  onAllQuestionsCorrectChange: (isPassed: boolean) => void;
  onFinalQuestionContinue?: () => void;
}) {
  const renderQuestions = useMemo(
    () => buildRenderQuestions(questions, lessonId),
    [questions, lessonId],
  );

  const n = renderQuestions.length;
  const zeros = () => Array.from({ length: n }, () => 0);
  const falses = () => Array.from({ length: n }, () => false);
  const negs = () => Array.from({ length: n }, () => -1);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>(negs);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean[]>(falses);
  const [attemptCounts, setAttemptCounts] = useState<number[]>(zeros);
  const [unlocked, setUnlocked] = useState<boolean[]>(falses);
  const [wrongIndexes, setWrongIndexes] = useState<number[]>(negs);
  const [feedback, setFeedback] = useState("");

  const canProceed = useMemo(
    () => renderQuestions.map((_, idx) => (answeredCorrectly[idx] ?? false) || (unlocked[idx] ?? false)),
    [answeredCorrectly, renderQuestions, unlocked],
  );

  useEffect(() => {
    onAllQuestionsCorrectChange(n > 0 && canProceed.every(Boolean));
  }, [canProceed, n, onAllQuestionsCorrectChange]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(getQuizAnswersKey(courseId, lessonId));
      if (!raw) return;
      const saved = JSON.parse(raw) as SavedState;
      const fallback = saved.selectedOptionIndexes ?? [];
      /* eslint-disable react-hooks/set-state-in-effect */
      setSelectedIndexes(
        Array.from({ length: n }, (_, idx) => {
          const val = saved.selectedOptionValues?.[idx];
          if (typeof val === "string") {
            return renderQuestions[idx]?.options.findIndex((o) => o === val) ?? -1;
          }
          return fallback[idx] ?? -1;
        }),
      );
      setAnsweredCorrectly(Array.from({ length: n }, (_, idx) => saved.answeredCorrectly?.[idx] ?? false));
      setAttemptCounts(Array.from({ length: n }, (_, idx) => saved.attemptCounts?.[idx] ?? 0));
      setUnlocked(Array.from({ length: n }, (_, idx) => saved.unlockedAfterMaxAttempts?.[idx] ?? false));
      const saved_idx = saved.currentQuestionIndex ?? 0;
      setCurrentIndex(Math.max(0, Math.min(n - 1, saved_idx)));
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
        attemptCounts,
        unlockedAfterMaxAttempts: unlocked,
        currentQuestionIndex: currentIndex,
      } satisfies SavedState),
    );
  }, [answeredCorrectly, attemptCounts, courseId, currentIndex, lessonId, renderQuestions, selectedIndexes, unlocked]);

  const question = renderQuestions[currentIndex];
  const selectedOptionIndex = selectedIndexes[currentIndex] ?? -1;
  const isLastQuestion = currentIndex >= n - 1;
  const currentCanProceed = canProceed[currentIndex] ?? false;
  const currentAttempts = attemptCounts[currentIndex] ?? 0;
  const revealCorrect = unlocked[currentIndex] ?? false;

  const handleProceed = () => {
    if (currentCanProceed) {
      if (isLastQuestion) {
        onFinalQuestionContinue?.();
      } else {
        setCurrentIndex((i) => i + 1);
        setFeedback("");
      }
      return;
    }

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

    if (isCorrect) {
      setWrongIndexes((prev) => {
        const next = [...prev];
        next[currentIndex] = -1;
        return next;
      });
      setFeedback("Correct.");
      if (!isLastQuestion) {
        setCurrentIndex((i) => i + 1);
      }
      return;
    }

    const updatedAttempts = currentAttempts + 1;
    setWrongIndexes((prev) => {
      const next = [...prev];
      next[currentIndex] = selectedOptionIndex;
      return next;
    });
    setAttemptCounts((prev) => {
      const next = [...prev];
      next[currentIndex] = updatedAttempts;
      return next;
    });

    if (updatedAttempts >= 3) {
      setUnlocked((prev) => {
        const next = [...prev];
        next[currentIndex] = true;
        return next;
      });
      const exp = question.explanation?.trim();
      setFeedback(exp ? `Correct answer highlighted. ${exp}` : "Correct answer highlighted. You can continue.");
      return;
    }

    setFeedback("");
  };

  const handleSelectOption = (idx: number) => {
    setSelectedIndexes((prev) => {
      const next = [...prev];
      next[currentIndex] = idx;
      return next;
    });
    setWrongIndexes((prev) => {
      const next = [...prev];
      next[currentIndex] = -1;
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
        wrongOptionIndex={wrongIndexes[currentIndex] ?? -1}
        revealCorrect={revealCorrect}
        feedbackMessage={feedback}
        proceedLabel={isLastQuestion ? "Continue" : "Next Question"}
        proceedDisabled={false}
        attemptDisplay={`Attempts: ${currentAttempts}/3`}
        onSelectOption={handleSelectOption}
        onProceed={handleProceed}
        onBack={() => {
          setCurrentIndex((i) => Math.max(0, i - 1));
          setFeedback("");
        }}
      />
      <p className="text-sm font-semibold text-[var(--jjs-green-800)]">
        Score: {correctCount}/{n} ({scorePercent}%)
      </p>
    </div>
  );
}
