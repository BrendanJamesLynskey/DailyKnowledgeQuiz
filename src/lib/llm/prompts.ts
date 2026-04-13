interface RepoContext {
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  readmeSnippet: string | null;
}

export function buildQuestionGenerationPrompt(
  repos: RepoContext[],
  count: number
): string {
  const repoDescriptions = repos
    .map((r) => {
      const parts = [`- **${r.name}**`];
      if (r.language) parts.push(`  Language: ${r.language}`);
      if (r.topics.length > 0) parts.push(`  Topics: ${r.topics.join(", ")}`);
      if (r.description) parts.push(`  Description: ${r.description}`);
      if (r.readmeSnippet)
        parts.push(`  README excerpt: ${r.readmeSnippet.slice(0, 300)}`);
      return parts.join("\n");
    })
    .join("\n\n");

  return `You are a technical quiz master. Given the following information about a developer's
GitHub repositories, generate ${count} knowledge-check questions.

Repository context:
${repoDescriptions}

Requirements:
- Each question should test practical knowledge, not trivia
- Cover different subject areas from the repos provided
- Mix difficulty levels (1 easy, 1 medium, 1 hard for a set of 3)
- Each question should be answerable in 2-3 sentences
- Provide a clear, concise model answer for each

Respond in JSON format only, with no other text:
[
  {
    "subjectArea": "string",
    "questionText": "string",
    "answerText": "string",
    "difficulty": 1,
    "repoName": "string"
  }
]`;
}

export function buildAnswerEvaluationPrompt(
  questionText: string,
  answerText: string,
  userAnswer: string
): string {
  return `A developer was asked the following technical question and gave the answer below.
Evaluate whether their answer is substantially correct.

Question: ${questionText}
Model answer: ${answerText}
User's answer: ${userAnswer}

Respond in JSON format only, with no other text:
{
  "isCorrect": true,
  "feedback": "string"
}`;
}
