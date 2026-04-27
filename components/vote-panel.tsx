"use client";

import { useState } from "react";

import type { FactView, Verdict } from "@/lib/types";

const labels: Record<Verdict, string> = {
  true: "Vrai",
  false: "Faux",
  unverifiable: "Inverifiable",
};

export function VotePanel({
  fact,
  blocked,
}: {
  fact: FactView;
  blocked: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function submit(verdict: Verdict) {
    setPending(true);
    setError(false);
    setMessage(null);

    try {
      const response = await fetch(`/api/facts/${fact.slug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verdict }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setError(true);
        setMessage(payload.error ?? "Vote impossible pour le moment.");
        return;
      }

      setMessage(payload.message ?? "Vote enregistre.");
      window.location.reload();
    } catch {
      setError(true);
      setMessage("Erreur reseau, reessayez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card stack-sm">
      <div>
        <p className="eyebrow">Vote visiteur</p>
        <h3>Votre lecture de ce fait</h3>
        <p className="muted">
          Vote anonyme limite par IP, navigateur et cookie sur 24 heures pour ce fait.
        </p>
      </div>

      <div className="vote-actions">
        {(["true", "false", "unverifiable"] as Verdict[]).map((verdict) => (
          <button
            key={verdict}
            type="button"
            className={`button ${
              verdict === "true"
                ? "button-true"
                : verdict === "false"
                  ? "button-false"
                  : "button-secondary"
            }`}
            onClick={() => submit(verdict)}
            disabled={pending || blocked}
          >
            {labels[verdict]}
          </button>
        ))}
      </div>

      {blocked ? (
        <p className="success-text">
          Un vote recent a deja ete detecte pour cet appareil ou cette connexion.
        </p>
      ) : null}
      {message ? <p className={error ? "error-text" : "success-text"}>{message}</p> : null}
    </section>
  );
}
