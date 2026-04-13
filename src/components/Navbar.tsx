"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { AuthButton } from "./AuthButton";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href={session ? "/dashboard" : "/"}
            className="text-lg font-bold text-gray-900 dark:text-white"
          >
            Daily Quiz
          </Link>
          {session && (
            <div className="hidden items-center gap-4 sm:flex">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/history"
                className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                History
              </Link>
              <Link
                href="/settings"
                className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Settings
              </Link>
            </div>
          )}
        </div>
        <AuthButton />
      </div>
    </nav>
  );
}
