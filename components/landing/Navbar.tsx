"use client";

import { UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const spring = { type: "spring", stiffness: 400, damping: 25 } as const;

export default function Navbar({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-neutral-200 bg-white/70 backdrop-blur-xl"
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Automata logo" width={30} height={26} />
          <span className="text-lg font-bold tracking-tight text-neutral-900">
            Automata
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {!isSignedIn && (
            <Link
              href="/sign-in"
              className="hidden text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 sm:block"
            >
              Sign In
            </Link>
          )}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={spring}>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center rounded-[var(--radius)] border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              Dashboard
            </Link>
          </motion.div>
          {isSignedIn && <UserButton />}
        </div>
      </nav>
    </motion.header>
  );
}
