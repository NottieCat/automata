"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const spring = { type: "spring", stiffness: 400, damping: 25 } as const;

export default function Cta() {
  return (
    <section className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="flex flex-col items-center rounded-[var(--radius)] border border-neutral-200 bg-neutral-50/60 px-6 py-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Ready to build your first agent?
          </h2>
          <p className="mt-4 max-w-md text-neutral-500">
            Sign up and go from idea to a working, published AI agent in
            minutes.
          </p>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={spring}
            className="mt-8"
          >
            <Link
              href="/dashboard"
              className="group inline-flex h-12 items-center gap-2 rounded-[var(--radius)] bg-neutral-900 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
