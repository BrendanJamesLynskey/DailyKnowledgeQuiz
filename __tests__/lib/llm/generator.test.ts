import { describe, it, expect, vi } from "vitest";

vi.mock("../../../src/lib/llm/client", () => ({
  generateCompletion: vi.fn(),
}));

import { generateQuestions } from "../../../src/lib/llm/generator";
import { generateCompletion } from "../../../src/lib/llm/client";

const mockGenerateCompletion = vi.mocked(generateCompletion);

const sampleRepos = [
  {
    name: "my-app",
    description: "A Next.js web app",
    language: "TypeScript",
    topics: ["react", "nextjs"],
    readmeSnippet: "# My App\nA sample application",
  },
];

describe("generateQuestions", () => {
  it("parses valid LLM response into questions", async () => {
    const mockResponse = JSON.stringify([
      {
        subjectArea: "React",
        questionText: "What is a React hook?",
        answerText: "A hook is a function that lets you use state in functional components.",
        difficulty: 1,
        repoName: "my-app",
      },
      {
        subjectArea: "TypeScript",
        questionText: "What is a union type?",
        answerText: "A union type allows a value to be one of several types.",
        difficulty: 2,
        repoName: "my-app",
      },
      {
        subjectArea: "Next.js",
        questionText: "Explain server components in Next.js.",
        answerText: "Server components render on the server and send HTML to the client.",
        difficulty: 3,
        repoName: "my-app",
      },
    ]);

    mockGenerateCompletion.mockResolvedValue(mockResponse);

    const questions = await generateQuestions(sampleRepos, 3);

    expect(questions).toHaveLength(3);
    expect(questions[0].subjectArea).toBe("React");
    expect(questions[0].difficulty).toBe(1);
    expect(questions[1].difficulty).toBe(2);
    expect(questions[2].difficulty).toBe(3);
  });

  it("handles LLM response with surrounding text", async () => {
    const mockResponse = `Here are the questions:
[
  {
    "subjectArea": "React",
    "questionText": "What is JSX?",
    "answerText": "JSX is a syntax extension for JavaScript.",
    "difficulty": 1,
    "repoName": "my-app"
  }
]
Hope that helps!`;

    mockGenerateCompletion.mockResolvedValue(mockResponse);

    const questions = await generateQuestions(sampleRepos, 1);

    expect(questions).toHaveLength(1);
    expect(questions[0].questionText).toBe("What is JSX?");
  });

  it("clamps difficulty to 1-3 range", async () => {
    const mockResponse = JSON.stringify([
      {
        subjectArea: "React",
        questionText: "What is React?",
        answerText: "A UI library.",
        difficulty: 5,
        repoName: "my-app",
      },
      {
        subjectArea: "React",
        questionText: "What is JSX?",
        answerText: "A syntax extension.",
        difficulty: 0,
        repoName: "my-app",
      },
    ]);

    mockGenerateCompletion.mockResolvedValue(mockResponse);

    const questions = await generateQuestions(sampleRepos, 2);

    expect(questions[0].difficulty).toBe(3);
    expect(questions[1].difficulty).toBe(1);
  });

  it("throws when LLM returns no JSON array", async () => {
    mockGenerateCompletion.mockResolvedValue("Sorry, I cannot generate questions.");

    await expect(generateQuestions(sampleRepos, 3)).rejects.toThrow(
      "Failed to parse JSON array from LLM response"
    );
  });
});
