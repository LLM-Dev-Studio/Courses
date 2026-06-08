import type { QuizQuestion, RenderQuizQuestion } from "./types";

function seededHash(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function deterministicShuffle<T>(input: T[], seedText: string): T[] {
  const clone = [...input];
  let seed = seededHash(seedText);

  const nextRandom = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

export function buildRenderQuestions(questions: QuizQuestion[], lessonId: string): RenderQuizQuestion[] {
  return questions.map((question, index) => {
    const shuffledOptions = deterministicShuffle(
      question.options,
      `${lessonId}::${index}::${question.prompt}`,
    );
    return {
      prompt: question.prompt,
      options: shuffledOptions,
      correctOptionIndex: shuffledOptions.findIndex((option) => option === question.answer),
      explanation: question.explanation,
    };
  });
}
