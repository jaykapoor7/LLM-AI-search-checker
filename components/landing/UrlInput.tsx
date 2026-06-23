"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { isValidUrlish } from "@/lib/utils";

const EXAMPLES = ["kapoorjay.com", "vercel.com", "linear.app", "perplexity.ai"];

export function UrlInput({ autoFocus = false, size = "lg" }: { autoFocus?: boolean; size?: "lg" | "md" }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!isValidUrlish(value)) {
      setError("Enter a valid URL (e.g. kapoorjay.com)");
      return;
    }
    setError(null);
    setSubmitting(true);
    router.push(`/analyze?url=${encodeURIComponent(value.trim())}`);
  }

  return (
    <div className="w-full">
      <form
        onSubmit={submit}
        className="group relative flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-900/80 p-2 shadow-glow-sm transition focus-within:border-phosphor/50 focus-within:shadow-glow"
      >
        <span className="pl-3 font-mono text-sm text-phosphor/70 select-none">{">"}</span>
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Enter website URL"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="min-w-0 flex-1 bg-transparent font-mono text-zinc-100 placeholder:text-muted-dim focus:outline-none"
          style={{ fontSize: size === "lg" ? 17 : 15 }}
        />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-phosphor px-4 py-2.5 font-mono text-sm font-semibold text-ink-950 transition hover:bg-phosphor-dim disabled:opacity-70"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Analyze <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {error ? (
          <span className="font-mono text-2xs text-signal-red">! {error}</span>
        ) : (
          <>
            <span className="mono-label">try</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setValue(ex)}
                className="rounded-md border border-ink-700 px-2 py-0.5 font-mono text-2xs text-muted transition hover:border-phosphor/40 hover:text-phosphor"
              >
                {ex}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
