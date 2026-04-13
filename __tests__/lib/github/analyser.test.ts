import { describe, it, expect } from "vitest";
import { analyseRepo } from "../../../src/lib/github/analyser";

describe("analyseRepo", () => {
  it("returns repo data with existing topics", () => {
    const result = analyseRepo({
      name: "my-app",
      description: "A web application",
      language: "TypeScript",
      topics: ["react", "nextjs"],
    });

    expect(result.name).toBe("my-app");
    expect(result.language).toBe("TypeScript");
    expect(result.topics).toContain("react");
    expect(result.topics).toContain("nextjs");
  });

  it("adds language as a topic if not already present", () => {
    const result = analyseRepo({
      name: "my-app",
      description: null,
      language: "Python",
      topics: ["django"],
    });

    expect(result.topics).toContain("python");
    expect(result.topics).toContain("django");
  });

  it("does not duplicate language in topics", () => {
    const result = analyseRepo({
      name: "my-app",
      description: null,
      language: "Python",
      topics: ["python", "flask"],
    });

    const pythonCount = result.topics.filter((t) => t === "python").length;
    expect(pythonCount).toBe(1);
  });

  it("extracts known technologies from description", () => {
    const result = analyseRepo({
      name: "my-api",
      description: "A REST API built with express and mongodb",
      language: "JavaScript",
      topics: [],
    });

    expect(result.topics).toContain("rest");
    expect(result.topics).toContain("express");
    expect(result.topics).toContain("mongodb");
    expect(result.topics).toContain("javascript");
  });

  it("handles null description and language", () => {
    const result = analyseRepo({
      name: "empty-repo",
      description: null,
      language: null,
      topics: [],
    });

    expect(result.name).toBe("empty-repo");
    expect(result.topics).toEqual([]);
  });

  it("handles repo with only topics from GitHub", () => {
    const result = analyseRepo({
      name: "tagged-repo",
      description: null,
      language: null,
      topics: ["machine-learning", "tensorflow"],
    });

    expect(result.topics).toContain("machine-learning");
    expect(result.topics).toContain("tensorflow");
  });
});
