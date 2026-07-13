import Link from "next/link";
import type { ComposerProfile } from "@/lib/composers";

interface ComposerCardProps {
  composer: ComposerProfile;
}

export function ComposerCard({ composer }: ComposerCardProps) {
  return (
    <Link
      href={`/composers/${composer.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
    >
      <div
        className="mb-4 h-1.5 w-12 rounded-full"
        style={{ backgroundColor: composer.accent }}
      />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {composer.name}
      </h2>
      <p className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
        {composer.lifespan} · {composer.era}
      </p>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
        {composer.tagline}
      </p>
      <span
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors"
        style={{ color: composer.accent }}
      >
        Open the studio
        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}
