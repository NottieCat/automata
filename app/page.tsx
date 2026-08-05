import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight,
  Bot,
  GitBranchPlus,
  MousePointerClick,
  Rocket,
  Settings2,
  Share2,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
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

const steps = [
  {
    step: "01",
    title: "Create an Agent",
    description: "Name your agent and open the visual builder canvas.",
  },
  {
    step: "02",
    title: "Design the Workflow",
    description:
      "Drag in agents, tools, conditions and APIs, then wire them together.",
  },
  {
    step: "03",
    title: "Test & Publish",
    description:
      "Chat with your agent in the live preview and publish it when it's ready.",
  },
];

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Automata logo" width={35} height={35} />
            <span className="text-xl font-bold">Automata</span>
          </div>
          <div className="flex items-center gap-3">
            {userId ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-24 pb-20 text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
          <GitBranchPlus className="h-4 w-4" />
          Visual AI agent workflows
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Build AI Agents with a{" "}
          <span className="text-primary">Drag & Drop</span> Canvas
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Automata lets you design, configure and publish multi-agent AI
          workflows visually. Connect models, tools, APIs and logic — then chat
          with your agent in seconds. No coding required.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/dashboard">
            <Button size="lg">
              Start Building Free <ArrowRight />
            </Button>
          </Link>
          <Link href="/dashboard/pricing">
            <Button size="lg" variant="outline">
              View Pricing
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Free plan includes 7 agents. No credit card required.
        </p>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">
            Everything you need to ship an AI agent
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            From the first node to a published chat agent — all inside one
            visual builder.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border bg-background p-6 shadow-sm"
              >
                <feature.icon className="h-8 w-8 rounded-md bg-primary/10 p-1.5 text-primary" />
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold">How it works</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {item.step}
              </div>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold">
            Ready to build your first agent?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Sign up and go from idea to working AI agent in minutes.
          </p>
          <Link href="/dashboard" className="mt-8 inline-block">
            <Button size="lg">
              Get Started <ArrowRight />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Automata logo" width={24} height={24} />
            <span className="font-semibold">Automata</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js, Convex, Clerk & Arcjet
          </p>
        </div>
      </footer>
    </div>
  );
}
