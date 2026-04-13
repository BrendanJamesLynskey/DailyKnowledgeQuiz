interface RepoData {
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
}

interface AnalysedRepo {
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
}

export function analyseRepo(repo: RepoData): AnalysedRepo {
  const topics = [...repo.topics];

  if (repo.language && !topics.includes(repo.language.toLowerCase())) {
    topics.push(repo.language.toLowerCase());
  }

  const descriptionTopics = extractTopicsFromDescription(repo.description);
  for (const topic of descriptionTopics) {
    if (!topics.includes(topic)) {
      topics.push(topic);
    }
  }

  return {
    name: repo.name,
    description: repo.description,
    language: repo.language,
    topics,
  };
}

const KNOWN_TECHNOLOGIES = [
  "react",
  "nextjs",
  "next.js",
  "vue",
  "angular",
  "svelte",
  "node",
  "express",
  "django",
  "flask",
  "fastapi",
  "spring",
  "rails",
  "laravel",
  "docker",
  "kubernetes",
  "terraform",
  "aws",
  "gcp",
  "azure",
  "graphql",
  "rest",
  "postgresql",
  "mongodb",
  "redis",
  "elasticsearch",
  "kafka",
  "rabbitmq",
  "typescript",
  "javascript",
  "python",
  "rust",
  "go",
  "java",
  "kotlin",
  "swift",
  "c++",
  "c#",
  "ruby",
  "php",
  "scala",
  "haskell",
  "elixir",
  "vhdl",
  "fpga",
  "dsp",
  "machine-learning",
  "deep-learning",
  "tensorflow",
  "pytorch",
  "tailwindcss",
  "tailwind",
  "prisma",
  "webpack",
  "vite",
];

function extractTopicsFromDescription(
  description: string | null
): string[] {
  if (!description) return [];

  const lower = description.toLowerCase();
  return KNOWN_TECHNOLOGIES.filter((tech) => lower.includes(tech));
}
