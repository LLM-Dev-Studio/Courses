import type { RenderQuizQuestion } from "./types";

export function QuizQuestionCard({
  lessonId,
  question,
  questionNumber,
  totalQuestions,
  selectedOptionIndex,
  wrongOptionIndex,
  revealCorrect,
  feedbackMessage,
  proceedLabel,
  proceedDisabled,
  attemptDisplay,
  onSelectOption,
  onProceed,
  onBack,
}: {
  lessonId: string;
  question: RenderQuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionIndex: number;
  wrongOptionIndex: number;
  revealCorrect: boolean;
  feedbackMessage: string;
  proceedLabel: string;
  proceedDisabled: boolean;
  attemptDisplay: string;
  onSelectOption: (index: number) => void;
  onProceed: () => void;
  onBack: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--jjs-sand-300)] bg-[var(--jjs-sand-50)] p-4">
      <p className="mb-2 text-sm font-semibold text-[var(--jjs-green-900)]">
        Question {questionNumber} of {totalQuestions}
      </p>
      <p className="mb-3 text-sm text-[var(--jjs-green-800)]">{question.prompt}</p>

      <div className="space-y-2">
        {question.options.map((option, optionIdx) => {
          const isSelected = selectedOptionIndex === optionIdx;
          const isCorrectOption = optionIdx === question.correctOptionIndex;
          const showCorrectHighlight = revealCorrect && isCorrectOption;
          const showWrongSelection =
            isSelected && wrongOptionIndex === optionIdx && !showCorrectHighlight && !isCorrectOption;

          return (
            <button
              key={`${lessonId}-q-${questionNumber}-opt-${optionIdx}`}
              type="button"
              onClick={() => onSelectOption(optionIdx)}
              className={`flex w-full items-start justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                showCorrectHighlight
                  ? "border-[var(--jjs-green-700)] bg-[#eaf4ed] text-[var(--jjs-green-900)]"
                  : showWrongSelection
                    ? "border-[#b83e3e] bg-[#fdecec] text-[#7a1f1f]"
                    : isSelected
                      ? "border-[var(--jjs-green-700)] bg-white text-[var(--jjs-green-900)]"
                      : "border-[var(--jjs-sand-300)] bg-white text-[var(--jjs-green-800)] hover:border-[var(--jjs-sand-400)]"
              }`}
            >
              <span className="flex min-w-0 flex-1 items-start gap-2">
                <span
                  className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                    showCorrectHighlight
                      ? "border-[var(--jjs-green-700)] bg-[var(--jjs-green-700)] text-white"
                      : showWrongSelection
                        ? "border-[#b83e3e] bg-[#b83e3e] text-white"
                        : isSelected
                          ? "border-[var(--jjs-green-700)] bg-[var(--jjs-green-700)] text-white"
                          : "border-[var(--jjs-sand-400)]"
                  }`}
                >
                  {showCorrectHighlight ? "✓" : showWrongSelection ? "✕" : isSelected ? "✓" : ""}
                </span>
                <span>{option}</span>
              </span>
              {showWrongSelection ? (
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#b83e3e] text-xs font-bold text-[#b83e3e]">
                  ✕
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {feedbackMessage ? (
        <div className="mt-4">
          <p className="text-sm text-[var(--jjs-green-800)]">{feedbackMessage}</p>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={questionNumber === 1}
          className="rounded-lg border border-[var(--jjs-sand-400)] px-3 py-1.5 text-sm font-semibold text-[var(--jjs-green-800)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous Question
        </button>

        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-[var(--jjs-green-700)]">{attemptDisplay}</p>
          <button
            type="button"
            onClick={onProceed}
            disabled={proceedDisabled}
            className="rounded-lg bg-[var(--jjs-green-800)] px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[var(--jjs-green-700)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {proceedLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
