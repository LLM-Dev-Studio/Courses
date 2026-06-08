"use client";

import { PerQuestionQuiz } from "./quiz/PerQuestionQuiz";
import { ThresholdQuiz } from "./quiz/ThresholdQuiz";
import type { QuizQuestion } from "./quiz/types";

export type { QuizQuestion };

export function QuizQuestionnaire({
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
  passThreshold?: number;
  maxAttempts?: number;
  resetScopeOnFail?: "module" | "course";
  onAllQuestionsCorrectChange: (isPassed: boolean) => void;
  onFinalQuestionContinue?: () => void;
  onThresholdQuizFailed?: (scope: "module" | "course") => void;
}) {
  if (typeof passThreshold === "number") {
    return (
      <ThresholdQuiz
        courseId={courseId}
        lessonId={lessonId}
        questions={questions}
        passThreshold={passThreshold}
        maxAttempts={maxAttempts}
        resetScopeOnFail={resetScopeOnFail}
        onAllQuestionsCorrectChange={onAllQuestionsCorrectChange}
        onFinalQuestionContinue={onFinalQuestionContinue}
        onThresholdQuizFailed={onThresholdQuizFailed}
      />
    );
  }

  return (
    <PerQuestionQuiz
      courseId={courseId}
      lessonId={lessonId}
      questions={questions}
      onAllQuestionsCorrectChange={onAllQuestionsCorrectChange}
      onFinalQuestionContinue={onFinalQuestionContinue}
    />
  );
}
