import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Automata logo" width={22} height={19} />
          <span className="font-semibold text-neutral-900">Automata</span>
        </div>
        <p className="text-sm text-neutral-400">
          Built with Next.js, Convex, Clerk &amp; Arcjet
        </p>
      </div>
    </footer>
  );
}
