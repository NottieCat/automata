"use client";

import { motion } from "framer-motion";
import {
  Bot,
  MousePointerClick,
  Rocket,
  Settings2,
  Share2,
  Workflow,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: MousePointerClick,
    title: "Drag & Drop Builder",
    description:
      "Design agent workflows visually on an infinite canvas. Connect Start, Agent, Logic and API nodes — no code required.",
  },
  {
    icon: Bot,
    title: "Multi-Agent Workflows",
    description:
      "Compose supervisor and specialist agents that hand off tasks to each other, each with its own instructions and model.",
  },
  {
    icon: Share2,
    title: "Connect Any API",
    description:
      "Give your agents real capabilities with API nodes — plug in external endpoints, parameters and API keys in seconds.",
  },
  {
    icon: Settings2,
    title: "Fine-Grained Control",
    description:
      "Configure every node with dedicated setting panels: prompts, models, conditions, loops and user-approval gates.",
  },
  {
    icon: Workflow,
    title: "Logic & Branching",
    description:
      "Add If/Else conditions, While loops and human-in-the-loop approval steps to build workflows that think.",
  },
  {
    icon: Rocket,
    title: "Preview & Publish",
    description:
      "Chat with your agent instantly in the built-in preview, then grab the embed code to ship it anywhere.",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Everything you need to ship an AI agent
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-500">
            From the first node to a published chat agent — all inside one
            visual builder.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: (i % 3) * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              whileHover={{ y: -4 }}
              className="group rounded-[var(--radius)] border border-neutral-200 bg-white p-6 shadow-sm transition-colors duration-300 hover:border-[#0047C1]/50 hover:shadow-[0_4px_24px_rgba(0,71,193,0.08)]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-[#0047C1]/8 text-[#0047C1] transition-colors duration-300 group-hover:bg-[#0047C1]/12">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-neutral-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
