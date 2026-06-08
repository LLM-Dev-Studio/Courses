import { render, screen, fireEvent } from "@testing-library/react";

import { PerQuestionQuiz } from "@/components/quiz/PerQuestionQuiz";

const THREE_QUESTIONS = [
  { prompt: "What is 2+2?", options: ["3", "4", "5", "6"], answer: "4" },
  { prompt: "Capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], answer: "Canberra" },
  { prompt: "Colour of the sky?", options: ["Green", "Blue", "Red", "Yellow"], answer: "Blue" },
];

const ONE_QUESTION = [
  { prompt: "What is 1+1?", options: ["1", "2", "3", "4"], answer: "2" },
];

function renderPerQuestion(overrides: Partial<Parameters<typeof PerQuestionQuiz>[0]> = {}) {
  const onAllQuestionsCorrectChange = vi.fn();
  const onFinalQuestionContinue = vi.fn();

  render(
    <PerQuestionQuiz
      courseId="test-course"
      lessonId="test-quiz"
      questions={THREE_QUESTIONS}
      onAllQuestionsCorrectChange={onAllQuestionsCorrectChange}
      onFinalQuestionContinue={onFinalQuestionContinue}
      {...overrides}
    />,
  );

  return { onAllQuestionsCorrectChange, onFinalQuestionContinue };
}

function clickOption(text: string) {
  const btn = screen.getByText(text).closest("button");
  if (!btn) throw new Error(`No button for option "${text}"`);
  fireEvent.click(btn);
}

function clickProceed() {
  fireEvent.click(screen.getByRole("button", { name: /Next Question|Continue/ }));
}

describe("PerQuestionQuiz", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders the first question and count", () => {
    renderPerQuestion();
    expect(screen.getByText("What is 2+2?")).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 3")).toBeInTheDocument();
  });

  it("shows per-question attempt counter", () => {
    renderPerQuestion({ questions: ONE_QUESTION });
    expect(screen.getByText("Attempts: 0/3")).toBeInTheDocument();
  });

  it("shows Correct. feedback and stays visible on last correct answer", () => {
    renderPerQuestion({ questions: ONE_QUESTION });
    clickOption("2");
    clickProceed();
    expect(screen.getByText("Correct.")).toBeInTheDocument();
  });

  it("calls onFinalQuestionContinue when Continue is clicked on last already-correct question", () => {
    const { onFinalQuestionContinue } = renderPerQuestion({ questions: ONE_QUESTION });
    clickOption("2");
    clickProceed();
    clickProceed();
    expect(onFinalQuestionContinue).toHaveBeenCalled();
  });

  it("advances to next question on correct multi-question answer", () => {
    renderPerQuestion();
    clickOption("4");
    clickProceed();
    expect(screen.getByText("Question 2 of 3")).toBeInTheDocument();
  });

  it("stays on same question and shows no Correct. feedback after wrong answer", () => {
    renderPerQuestion({ questions: ONE_QUESTION });
    clickOption("1");
    clickProceed();
    expect(screen.queryByText("Correct.")).not.toBeInTheDocument();
    expect(screen.getByText("What is 1+1?")).toBeInTheDocument();
  });

  it("unlocks and reveals correct answer after 3 wrong attempts", () => {
    renderPerQuestion({ questions: ONE_QUESTION });
    for (let i = 0; i < 3; i++) {
      clickOption("1");
      clickProceed();
    }
    expect(screen.getByText(/Correct answer highlighted/)).toBeInTheDocument();
  });

  it("calls onAllQuestionsCorrectChange(true) after last question is answered correctly", () => {
    const { onAllQuestionsCorrectChange } = renderPerQuestion({ questions: ONE_QUESTION });
    clickOption("2");
    clickProceed();
    expect(onAllQuestionsCorrectChange).toHaveBeenCalledWith(true);
  });

  it("calls onAllQuestionsCorrectChange(true) after max attempts unlock", () => {
    const { onAllQuestionsCorrectChange } = renderPerQuestion({ questions: ONE_QUESTION });
    for (let i = 0; i < 3; i++) {
      clickOption("1");
      clickProceed();
    }
    expect(onAllQuestionsCorrectChange).toHaveBeenCalledWith(true);
  });

  it("requires selecting an option before proceeding", () => {
    renderPerQuestion({ questions: ONE_QUESTION });
    clickProceed();
    expect(screen.getByText("Select an answer before continuing.")).toBeInTheDocument();
  });

  it("does not show Quiz Attempts Used counter", () => {
    renderPerQuestion();
    expect(screen.queryByText(/Quiz Attempts Used/)).not.toBeInTheDocument();
  });
});
