import { render, screen, fireEvent } from "@testing-library/react";

import { ThresholdQuiz } from "@/components/quiz/ThresholdQuiz";

const ONE_QUESTION = [
  { prompt: "What is 1+1?", options: ["1", "2", "3", "4"], answer: "2" },
];

const TWO_QUESTIONS = [
  { prompt: "What is 1+1?", options: ["1", "2", "3", "4"], answer: "2" },
  { prompt: "What is 2+2?", options: ["3", "4", "5", "6"], answer: "4" },
];

function renderThreshold(overrides: Partial<Parameters<typeof ThresholdQuiz>[0]> = {}) {
  const onAllQuestionsCorrectChange = vi.fn();
  const onFinalQuestionContinue = vi.fn();
  const onThresholdQuizFailed = vi.fn();

  render(
    <ThresholdQuiz
      courseId="test-course"
      lessonId="test-quiz"
      questions={ONE_QUESTION}
      passThreshold={80}
      maxAttempts={2}
      onAllQuestionsCorrectChange={onAllQuestionsCorrectChange}
      onFinalQuestionContinue={onFinalQuestionContinue}
      onThresholdQuizFailed={onThresholdQuizFailed}
      {...overrides}
    />,
  );

  return { onAllQuestionsCorrectChange, onFinalQuestionContinue, onThresholdQuizFailed };
}

function clickOption(text: string) {
  const btn = screen.getByText(text).closest("button");
  if (!btn) throw new Error(`No button for option "${text}"`);
  fireEvent.click(btn);
}

function clickProceed() {
  fireEvent.click(screen.getByRole("button", { name: /Next Question|Submit Quiz/ }));
}

describe("ThresholdQuiz", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders the first question and count", () => {
    renderThreshold();
    expect(screen.getByText("What is 1+1?")).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 1")).toBeInTheDocument();
  });

  it("shows Quiz Attempts Used counter", () => {
    renderThreshold();
    expect(screen.getByText(/Quiz Attempts Used: 0\/2/)).toBeInTheDocument();
  });

  it("shows Submit Quiz on last question", () => {
    renderThreshold();
    expect(screen.getByRole("button", { name: "Submit Quiz" })).toBeInTheDocument();
  });

  it("shows Next Question (not Submit) on non-last questions", () => {
    renderThreshold({ questions: TWO_QUESTIONS });
    expect(screen.getByRole("button", { name: "Next Question" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit Quiz" })).not.toBeInTheDocument();
  });

  it("advances through questions without scoring until Submit", () => {
    renderThreshold({ questions: TWO_QUESTIONS });
    clickOption("2");
    clickProceed();
    expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();
  });

  it("calls onFinalQuestionContinue and shows Passed message when score meets threshold", () => {
    const { onFinalQuestionContinue } = renderThreshold();
    clickOption("2");
    clickProceed();
    expect(onFinalQuestionContinue).toHaveBeenCalled();
    expect(screen.getByText(/Passed with 100%/)).toBeInTheDocument();
  });

  it("calls onAllQuestionsCorrectChange(true) when threshold is passed", () => {
    const { onAllQuestionsCorrectChange } = renderThreshold();
    clickOption("2");
    clickProceed();
    expect(onAllQuestionsCorrectChange).toHaveBeenCalledWith(true);
  });

  it("shows retry message and resets to Q1 when score is below threshold with attempts remaining", () => {
    renderThreshold();
    clickOption("1");
    clickProceed();
    expect(screen.getByText(/below required 80%/)).toBeInTheDocument();
    expect(screen.getByText(/Retry 2 of 2/)).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 1")).toBeInTheDocument();
  });

  it("calls onThresholdQuizFailed with scope after exhausting all attempts", () => {
    const { onThresholdQuizFailed } = renderThreshold({ maxAttempts: 1 });
    clickOption("1");
    clickProceed();
    expect(onThresholdQuizFailed).toHaveBeenCalledWith("module");
    expect(screen.getByText(/Failed after 1 attempt/)).toBeInTheDocument();
  });

  it("calls onThresholdQuizFailed with course scope when configured", () => {
    const { onThresholdQuizFailed } = renderThreshold({
      maxAttempts: 1,
      resetScopeOnFail: "course",
    });
    clickOption("1");
    clickProceed();
    expect(onThresholdQuizFailed).toHaveBeenCalledWith("course");
  });

  it("disables Submit Quiz button after final failure", () => {
    renderThreshold({ maxAttempts: 1 });
    clickOption("1");
    clickProceed();
    expect(screen.getByRole("button", { name: "Submit Quiz" })).toBeDisabled();
  });

  it("requires selecting an option before proceeding", () => {
    renderThreshold();
    clickProceed();
    expect(screen.getByText("Select an answer before continuing.")).toBeInTheDocument();
  });

  it("does not show per-question attempt counter", () => {
    renderThreshold();
    expect(screen.queryByText(/Attempts: \d+\/3/)).not.toBeInTheDocument();
  });
});
