import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span aria-hidden className="text-lg">
            ♪
          </span>
          <span>Composer Studio</span>
        </Link>
        <a
          href="https://github.com/BrendanJamesLynskey/DSP_and_Music"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          DSP &amp; Music
        </a>
      </nav>
    </header>
  );
}
