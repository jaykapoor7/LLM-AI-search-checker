"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/analyze", label: "Analyze" },
  { href: "/compare", label: "Compare" },
  { href: "/profile/demo", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export function TopBar() {
  const pathname = usePathname();
  return (
    <header className="no-print sticky top-0 z-50 border-b border-ink-700/70 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-6 w-6 items-center justify-center">
            <span className="absolute inset-0 rounded-md bg-phosphor/20 blur-[6px] transition group-hover:bg-phosphor/40" />
            <span className="relative h-2.5 w-2.5 rounded-[3px] bg-phosphor shadow-[0_0_10px_rgba(94,234,212,0.8)]" />
          </span>
          <span className="font-mono text-[13px] font-semibold tracking-tight text-zinc-100">
            LLM<span className="text-phosphor">·</span>Visibility<span className="text-muted">Lab</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("/").slice(0, 2).join("/")));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 font-mono text-2xs uppercase tracking-wider transition",
                  active ? "bg-ink-800 text-phosphor" : "text-muted hover:text-zinc-200"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="ml-2 hidden rounded-md border border-ink-700 px-3 py-1.5 font-mono text-2xs uppercase tracking-wider text-zinc-300 transition hover:border-phosphor/40 hover:text-phosphor sm:block"
          >
            ★ Star
          </a>
        </nav>
      </div>
    </header>
  );
}
