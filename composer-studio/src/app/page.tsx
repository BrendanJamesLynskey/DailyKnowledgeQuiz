import { COMPOSERS } from "@/lib/composers";
import { ComposerCard } from "@/components/ComposerCard";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Composer Studio
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          A browser studio that composes fresh music in the style of three
          English masters — Thomas Tallis, William Byrd and Henry Purcell. Read
          how each of them wrote, generate a new piece, and hear it played back
          with in-browser instrumental synthesis.
        </p>
      </section>

      <section className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {COMPOSERS.map((composer) => (
          <ComposerCard key={composer.id} composer={composer} />
        ))}
      </section>

      <section className="mx-auto mt-16 max-w-2xl text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Every piece is generated algorithmically from a seed, so the same seed
          always yields the same music. Nothing is pre-recorded — the notes are
          synthesised live using the Web Audio API.
        </p>
      </section>
    </div>
  );
}
