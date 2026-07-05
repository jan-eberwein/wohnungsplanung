"use client";

import { useRef, useState, useTransition } from "react";
import { ArrowLeft, LoaderCircle, LockKeyhole } from "lucide-react";
import { login } from "@/lib/actions/auth";

type LoginUser = {
  username: string;
  displayName: string;
  color: string;
};

const USERS: LoginUser[] = [
  { username: "jan", displayName: "Jan", color: "#0A84FF" },
  { username: "sophie", displayName: "Sophie", color: "#FF2D8A" },
];

export function LoginCards() {
  const [selected, setSelected] = useState<LoginUser | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function choose(user: LoginUser) {
    setSelected(user);
    setPassword("");
    setError(null);
    setShake(false);
  }

  function back() {
    if (isPending) return;
    setSelected(null);
    setPassword("");
    setError(null);
    setShake(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || password.length === 0 || isPending) return;
    setError(null);
    const user = selected;
    startTransition(async () => {
      const result = await login(user.username, password);
      // Bei Erfolg leitet die Action per redirect() weiter — hier landen wir nur im Fehlerfall.
      if (result?.error) {
        setError(result.error);
        setShake(true);
        setPassword("");
        inputRef.current?.focus();
      }
    });
  }

  return (
    <div>
      <style>{`
        @keyframes login-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .login-shake { animation: login-shake 0.35s ease; }
      `}</style>

      {selected === null ? (
        <div className="animate-fade-in">
          <p className="mb-4 text-center text-sm font-medium text-muted">
            Wer bist du?
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            {USERS.map((user) => (
              <button
                key={user.username}
                type="button"
                onClick={() => choose(user)}
                className="glass flex flex-1 flex-col items-center gap-4 rounded-3xl px-6 py-8 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97]"
              >
                <span
                  aria-hidden
                  className="flex size-16 items-center justify-center rounded-full text-2xl font-bold text-white"
                  style={{
                    backgroundColor: user.color,
                    boxShadow: `0 0 0 4px ${user.color}33`,
                  }}
                >
                  {user.displayName.charAt(0)}
                </span>
                <span className="text-base font-semibold">
                  Ich bin {user.displayName}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{ "--accent": selected.color } as React.CSSProperties}
          className="animate-slide-up"
        >
          <div
            className={`glass rounded-3xl p-6 ${shake ? "login-shake" : ""}`}
            onAnimationEnd={(event) => {
              if (event.animationName === "login-shake") setShake(false);
            }}
          >
            <div className="mb-6 flex items-center gap-3">
              <span
                aria-hidden
                className="flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{
                  backgroundColor: selected.color,
                  boxShadow: `0 0 0 3px ${selected.color}33`,
                }}
              >
                {selected.displayName.charAt(0)}
              </span>
              <div>
                <p className="text-base font-semibold">
                  Hallo, {selected.displayName}!
                </p>
                <p className="text-sm text-muted">
                  Gib dein Passwort ein, um loszulegen.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-password"
                  className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"
                >
                  <LockKeyhole className="size-4 text-accent" aria-hidden />
                  Passwort
                </label>
                <input
                  ref={inputRef}
                  id="login-password"
                  type="password"
                  autoFocus
                  autoComplete="current-password"
                  value={password}
                  disabled={isPending}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") back();
                  }}
                  placeholder="Dein Passwort"
                  className={`w-full rounded-2xl border bg-surface px-4 py-3 outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60 ${
                    error ? "border-danger" : "border-line"
                  }`}
                />
                {error && (
                  <p className="mt-2 animate-fade-in text-sm text-danger" role="alert">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending || password.length === 0}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 font-semibold text-accent-contrast transition-opacity active:opacity-85 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <LoaderCircle className="size-5 animate-spin" aria-hidden />
                    Einen Moment …
                  </>
                ) : (
                  "Anmelden"
                )}
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={back}
            disabled={isPending}
            className="mx-auto mt-5 flex min-h-11 items-center gap-1.5 px-3 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Zurück zur Auswahl
          </button>
        </div>
      )}
    </div>
  );
}
