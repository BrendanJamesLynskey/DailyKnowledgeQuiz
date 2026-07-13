import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COMPOSERS, getComposer } from "@/lib/composers";
import { ComposerStudio } from "@/components/ComposerStudio";

export function generateStaticParams() {
  return COMPOSERS.map((c) => ({ id: c.id }));
}

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const composer = getComposer(params.id);
  if (!composer) return { title: "Composer Studio" };
  return {
    title: `${composer.name} · Composer Studio`,
    description: composer.tagline,
  };
}

/** A stable per-composer starting seed so the first render matches on server
 *  and client (no Math.random, so no hydration mismatch). */
function seedFor(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 1_000_000;
}

export default function ComposerPage({ params }: { params: { id: string } }) {
  const composer = getComposer(params.id);
  if (!composer) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/"
        className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        ← All composers
      </Link>

      <header className="mt-6">
        <div
          className="mb-4 h-1.5 w-16 rounded-full"
          style={{ backgroundColor: composer.accent }}
        />
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {composer.name}
        </h1>
        <p className="mt-2 font-mono text-sm text-gray-500 dark:text-gray-400">
          {composer.lifespan} · {composer.era}
        </p>
      </header>

      <section className="mt-8 space-y-4 text-[15px] leading-7 text-gray-700 dark:text-gray-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          History
        </h2>
        {composer.history.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Compositional style
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {composer.styleNotes.map((note, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden style={{ color: composer.accent }}>
                  ●
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Signature works
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {composer.signatureWorks.map((work, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="text-gray-400">
                  ♪
                </span>
                <span>{work}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          The studio
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          The engine below writes a short piece using the techniques listed
          above, then plays it with synthesised instruments. Press{" "}
          <em>New variation</em> for a different piece in the same style.
        </p>
        <ComposerStudio
          composerId={composer.id}
          accent={composer.accent}
          initialSeed={seedFor(composer.id)}
        />
      </section>
    </div>
  );
}
