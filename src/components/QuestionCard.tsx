"use client";

import { useState } from "react";

interface QuestionCardProps {
  questionId: string;
  questionText: string;
  subjectArea: string;
  difficulty: number;
  index: number;
  total: number;
  existingResponse?: {
    userAnswer: string;
    isCorrect: boolean;
    feedback?: string;
  };
  onAnswered: () => void;
}

export function QuestionCard({
  questionId,
  questionText,
  subjectArea,
  difficulty,
  index,
  total,
  existingResponse,
  onAnswered,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState(existingResponse?.userAnswer ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    feedback: string;
    modelAnswer: string;
  } | null>(
    existingResponse
      ? {
          isCorrect: existingResponse.isCorrect,
          feedback: existingResponse.feedback ?? "",
          modelAnswer: "",
        }
      : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || submitting || result) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, userAnswer: answer }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult({
          isCorrect: data.isCorrect,
          feedback: data.feedback,
          modelAnswer: data.modelAnswer,
        });
        onAnswered();
      }
    } finally {
      setSubmitting(false);
    }
  }

  const difficultyLabel = ["Easy", "Medium", "Hard"][difficulty - 1] ?? "Medium";
  const difficultyColor = {
    1: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    2: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    3: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }[difficulty] ?? "bg-yellow-100 text-yellow-800";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Question {index + 1} of {total}
        </span>
        <div className="flex gap-2">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {subjectArea}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColor}`}
          >
            {difficultyLabel}
          </span>
        </div>
      </div>

      <p className="mb-4 text-lg text-gray-900 dark:text-white">
        {questionText}
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={!!result}
          placeholder="Type your answer here..."
          rows={3}
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:disabled:bg-gray-900"
        />

        {!result && (
          <button
            type="submit"
            disabled={!answer.trim() || submitting}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            {submitting ? "Evaluating..." : "Submit answer"}
          </button>
        )}
      </form>

      {result && (
        <div
          className={`mt-4 rounded-md p-4 ${
            result.isCorrect
              ? "bg-green-50 dark:bg-green-950"
              : "bg-red-50 dark:bg-red-950"
          }`}
        >
          <p
            className={`font-semibold ${
              result.isCorrect
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }`}
          >
            {result.isCorrect ? "Correct!" : "Not quite right"}
          </p>
          {result.feedback && (
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {result.feedback}
            </p>
          )}
          {result.modelAnswer && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Model answer:
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {result.modelAnswer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
