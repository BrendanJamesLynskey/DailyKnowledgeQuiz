"use client";

import { useState } from "react";
import { QuestionCard } from "./QuestionCard";

interface Question {
  id: string;
  questionText: string;
  subjectArea: string;
  difficulty: number;
  response: {
    userAnswer: string;
    isCorrect: boolean;
  } | null;
}

export function QuestionBatchView({ questions }: { questions: Question[] }) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstUnanswered = questions.findIndex((q) => !q.response);
    return firstUnanswered >= 0 ? firstUnanswered : 0;
  });
  const [answeredCount, setAnsweredCount] = useState(
    questions.filter((q) => q.response).length
  );

  const allDone = answeredCount === questions.length;

  return (
    <div>
      {allDone && (
        <div className="mb-6 rounded-md bg-green-50 p-4 text-center dark:bg-green-950">
          <p className="font-semibold text-green-800 dark:text-green-200">
            All done for today!
          </p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            You answered {questions.filter((q) => q.response?.isCorrect).length}{" "}
            out of {questions.length} correctly.
          </p>
        </div>
      )}

      <QuestionCard
        key={questions[currentIndex].id}
        questionId={questions[currentIndex].id}
        questionText={questions[currentIndex].questionText}
        subjectArea={questions[currentIndex].subjectArea}
        difficulty={questions[currentIndex].difficulty}
        index={currentIndex}
        total={questions.length}
        existingResponse={
          questions[currentIndex].response
            ? {
                userAnswer: questions[currentIndex].response!.userAnswer,
                isCorrect: questions[currentIndex].response!.isCorrect,
              }
            : undefined
        }
        onAnswered={() => setAnsweredCount((c) => c + 1)}
      />

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
        >
          Previous
        </button>
        <div className="flex gap-1">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === currentIndex
                  ? "bg-gray-900 dark:bg-white"
                  : q.response
                    ? "bg-green-400 dark:bg-green-600"
                    : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() =>
            setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
          }
          disabled={currentIndex === questions.length - 1}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
        >
          Next
        </button>
      </div>
    </div>
  );
}
