import { generateCompletion } from "./client";
import { buildQuestionGenerationPrompt } from "./prompts";

interface RepoContext {
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  readmeSnippet: string | null;
}

interface GeneratedQuestion {
  subjectArea: string;
  questionText: string;
  answerText: string;
  difficulty: number;
  repoName: string;
}

export async function generateQuestions(
  repos: RepoContext[],
  count: number
): Promise<GeneratedQuestion[]> {
  const prompt = buildQuestionGenerationPrompt(repos, count);
  const response = await generateCompletion(prompt);

  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse JSON array from LLM response");
  }

  const questions: GeneratedQuestion[] = JSON.parse(jsonMatch[0]);

  return questions.map((q) => ({
    subjectArea: String(q.subjectArea),
    questionText: String(q.questionText),
    answerText: String(q.answerText),
    difficulty: Math.min(3, Math.max(1, Number.isFinite(Number(q.difficulty)) ? Number(q.difficulty) : 2)),
    repoName: String(q.repoName),
  }));
}
