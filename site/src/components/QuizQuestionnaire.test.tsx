import { render, screen, fireEvent } from "@testing-library/react";

import { QuizQuestionnaire } from "@/components/QuizQuestionnaire";

const THREE_QUESTIONS = [
  { prompt: "What is 2+2?", options: ["3", "4", "5", "6"], answer: "4" },
  { prompt: "Capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], answer: "Canberra" },
  { prompt: "Colour of the sky?", options: ["Green", "Blue", "Red", "Yellow"], answer: "Blue" },
];

const ONE_QUESTION = [
  { prompt: "What is 1+1?", options: ["1", "2", "3", "4"], answer: "2" },
];

function renderQuiz(overrides: Partial<Parameters<typeof QuizQuestionnaire>[0]> = {}) {
  const onAllQuestionsCorrectChange = vi.fn();
  const onFinalQuestionContinue = vi.fn();
  const onThresholdQuizFailed = vi.fn();

  render(
    <QuizQuestionnaire
      courseId="test-course"
      lessonId="test-quiz"
      questions={THREE_QUESTIONS}
      onAllQuestionsCorrectChange={onAllQuestionsCorrectChange}
      onFinalQuestionContinue={onFinalQuestionContinue}
      onThresholdQuizFailed={onThresholdQuizFailed}
      {...overrides}
    />,
  );

  return { onAllQuestionsCorrectChange, onFinalQuestionContinue, onThresholdQuizFailed };
}

function clickOption(optionText: string) {
  const span = screen.getByText(optionText);
  const btn = span.closest("button");
  if (!btn) throw new Error(`No button found containing text "${optionText}"`);
  fireEvent.click(btn);
}

function clickProceed() {
  fireEvent.click(screen.getByRole("button", { name: /Next Question|Continue|Submit Quiz/ }));
}

describe("QuizQuestionnaire — per-question mode", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders the first question", () => {
    renderQuiz();
    expect(screen.getByText("What is 2+2?")).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 3")).toBeInTheDocument();
  });

  it("shows feedback and advances on a correct answer", () => {
    renderQuiz({ questions: ONE_QUESTION });

    clickOption("2");
    clickProceed();

    expect(screen.getByText("Correct.")).toBeInTheDocument();
  });

  it("shows no feedback and stays on wrong answer below max attempts", () => {
    renderQuiz({ questions: ONE_QUESTION });

    clickOption("1");
    clickProceed();

    expect(screen.queryByText("Correct.")).not.toBeInTheDocument();
    expect(screen.getByText("What is 1+1?")).toBeInTheDocument();
  });

  it("unlocks Continue and reveals answer after 3 wrong attempts", () => {
    renderQuiz({ questions: ONE_QUESTION });

    for (let i = 0; i < 3; i++) {
      clickOption("1");
      clickProceed();
    }

    expect(screen.getByText(/Correct answer highlighted/)).toBeInTheDocument();
  });

  it("calls onAllQuestionsCorrectChange(true) when all questions are answered correctly", () => {
    const { onAllQuestionsCorrectChange } = renderQuiz({ questions: ONE_QUESTION });

    clickOption("2");
    clickProceed();

    expect(onAllQuestionsCorrectChange).toHaveBeenCalledWith(true);
  });

  it("requires selecting an option before proceeding", () => {
    renderQuiz({ questions: ONE_QUESTION });

    clickProceed();

    expect(screen.getByText("Select an answer before continuing.")).toBeInTheDocument();
  });
});

describe("QuizQuestionnaire — threshold mode", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders threshold attempt counter", () => {
    renderQuiz({ passThreshold: 80, maxAttempts: 2 });

    expect(screen.getByText(/Quiz Attempts Used: 0\/2/)).toBeInTheDocument();
  });

  it("calls onFinalQuestionContinue when score meets threshold", () => {
    const { onFinalQuestionContinue } = renderQuiz({
      questions: ONE_QUESTION,
      passThreshold: 80,
      maxAttempts: 2,
    });

    clickOption("2");
    clickProceed();

    expect(onFinalQuestionContinue).toHaveBeenCalled();
    expect(screen.getByText(/Passed with 100%/)).toBeInTheDocument();
  });

  it("shows retry message when score is below threshold but attempts remain", () => {
    renderQuiz({
      questions: ONE_QUESTION,
      passThreshold: 80,
      maxAttempts: 2,
    });

    clickOption("1");
    clickProceed();

    expect(screen.getByText(/below required 80%/)).toBeInTheDocument();
    expect(screen.getByText(/Retry 2 of 2/)).toBeInTheDocument();
  });

  it("calls onThresholdQuizFailed after exhausting all attempts", () => {
    const { onThresholdQuizFailed } = renderQuiz({
      questions: ONE_QUESTION,
      passThreshold: 80,
      maxAttempts: 1,
    });

    clickOption("1");
    clickProceed();

    expect(onThresholdQuizFailed).toHaveBeenCalledWith("module");
    expect(screen.getByText(/Failed after 1 attempt/)).toBeInTheDocument();
  });
});
