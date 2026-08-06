"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, GitBranchPlus } from "lucide-react";
import Link from "next/link";

const spring = { type: "spring", stiffness: 400, damping: 25 } as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};

export default function Hero() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-20 pb-16 text-center sm:pt-28">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
        whileHover={{ scale: 1.04 }}
        transition={spring}
        className="mb-8 flex cursor-default items-center gap-2 rounded-[var(--radius)] border border-neutral-200 bg-white px-4 py-1.5 text-sm font-medium text-neutral-600 shadow-sm transition-shadow hover:shadow-[0_0_20px_rgba(0,71,193,0.15)]"
      >
        <GitBranchPlus className="h-4 w-4 text-[#0047C1]" />
        Visual AI agent workflows
      </motion.div>

      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
        className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl"
      >
        Build AI Agents with a
        <br className="hidden sm:block" /> Drag &amp; Drop Canvas
      </motion.h1>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={2}
        className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-500"
      >
        Automata lets you design, configure and publish multi-agent AI
        workflows visually. Connect models, tools, APIs and logic — then chat
        with your agent in seconds. No coding required.
      </motion.p>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={3}
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={spring}>
          <Link
            href="/dashboard"
            className="group inline-flex h-12 items-center gap-2 rounded-[var(--radius)] bg-neutral-900 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800"
          >
            Start Building
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={spring}>
          <Link
            href="/dashboard/my-agents"
            className="inline-flex h-12 items-center rounded-[var(--radius)] border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-900 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50"
          >
            View My Agents
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
