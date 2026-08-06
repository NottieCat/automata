"use client";

import { motion } from "framer-motion";
import {
  Bot,
  CircleCheck,
  GitBranchPlus,
  Play,
  Share2,
  type LucideIcon,
} from "lucide-react";

/**
 * Node anchors live in an 800x400 design space. Cards are positioned with
 * percentages derived from the same coordinates, and the SVG stretches with
 * preserveAspectRatio="none", so edges and cards stay glued together at any
 * container size.
 */
const W = 800;
const H = 400;

type MockNode = {
  id: string;
  x: number;
  y: number;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  float: number; // seconds for one float cycle
};

const nodes: MockNode[] = [
  { id: "start", x: 95, y: 200, icon: Play, title: "Start", subtitle: "User input", float: 5 },
  { id: "agent", x: 300, y: 200, icon: Bot, title: "Weather Agent", subtitle: "gpt · supervisor", float: 6 },
  { id: "api", x: 520, y: 105, icon: Share2, title: "Weather API", subtitle: "GET /forecast", float: 5.5 },
  { id: "logic", x: 520, y: 295, icon: GitBranchPlus, title: "If / Else", subtitle: "condition check", float: 6.5 },
  { id: "end", x: 712, y: 200, icon: CircleCheck, title: "End", subtitle: "Response", float: 5.2 },
];

const edge = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = Math.max(40, (x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
};

const edges = [
  { d: edge(95, 200, 300, 200), begin: "0s" },
  { d: edge(300, 200, 520, 105), begin: "0.9s" },
  { d: edge(300, 200, 520, 295), begin: "1.4s" },
  { d: edge(520, 105, 712, 200), begin: "2.1s" },
  { d: edge(520, 295, 712, 200), begin: "2.6s" },
];

export default function CanvasPreview() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="overflow-hidden rounded-[var(--radius)] border border-neutral-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)]"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50/80 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
          <span className="ml-3 text-xs font-medium text-neutral-400">
            agent-builder / weather-agent
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-[#0047C1]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0047C1] opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0047C1]" />
            </span>
            Running
          </span>
        </div>

        {/* Canvas */}
        <div
          className="relative h-75 sm:h-95 md:h-105"
          style={{
            backgroundImage: "radial-gradient(circle, #e5e5e5 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        >
          {/* Edges + traveling pulses */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {edges.map((e, i) => (
              <g key={i}>
                <path d={e.d} fill="none" stroke="#0047C1" strokeOpacity="0.18" strokeWidth="2" />
                <circle r="7" fill="#0047C1" opacity="0.15">
                  <animateMotion dur="3s" begin={e.begin} repeatCount="indefinite" path={e.d} />
                </circle>
                <circle r="3.5" fill="#0047C1">
                  <animateMotion dur="3s" begin={e.begin} repeatCount="indefinite" path={e.d} />
                </circle>
              </g>
            ))}
          </svg>

          {/* Node cards */}
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: node.float, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(node.x / W) * 100}%`, top: `${(node.y / H) * 100}%` }}
            >
              <motion.div
                whileHover={{ scale: 1.06 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex w-32 items-center gap-2.5 rounded-[var(--radius)] border border-neutral-200 bg-white p-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow hover:border-[#0047C1]/40 hover:shadow-[0_4px_24px_rgba(0,71,193,0.18)] sm:w-40 sm:p-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius)] bg-[#0047C1]/8 text-[#0047C1]">
                  <node.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-neutral-900 sm:text-sm">
                    {node.title}
                  </span>
                  <span className="hidden truncate text-[11px] text-neutral-400 sm:block">
                    {node.subtitle}
                  </span>
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
