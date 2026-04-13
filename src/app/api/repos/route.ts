import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchUserRepos, fetchReadme } from "@/lib/github/client";
import { analyseRepo } from "@/lib/github/analyser";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repos = await prisma.repo.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(repos);
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubUsername: true },
  });

  if (!user?.githubUsername) {
    return NextResponse.json(
      { error: "GitHub username not found" },
      { status: 400 }
    );
  }

  const githubRepos = await fetchUserRepos(userId);

  const results = [];
  for (const ghRepo of githubRepos) {
    const analysed = analyseRepo(ghRepo);

    const readmeSnippet = await fetchReadme(
      userId,
      user.githubUsername,
      ghRepo.name
    );

    const repo = await prisma.repo.upsert({
      where: {
        userId_name: { userId, name: analysed.name },
      },
      update: {
        description: analysed.description,
        language: analysed.language,
        topics: analysed.topics,
        readmeSnippet,
        lastSynced: new Date(),
      },
      create: {
        userId,
        name: analysed.name,
        description: analysed.description,
        language: analysed.language,
        topics: analysed.topics,
        readmeSnippet,
      },
    });

    results.push(repo);
  }

  return NextResponse.json(results);
}
