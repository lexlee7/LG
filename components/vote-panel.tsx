"use client";

import { useState } from "react";

import type { FactView, VoteAvailability, VoteChallenge, Verdict } from "@/lib/types";

const labels: Record<Verdict, string> = {
  true: "Vrai",
  false: "Faux",
  unverifiable: "Invérifiable",
};

type VotePanelProps = {
  fact: FactView;
  availability: VoteAvailability;
  challenge: VoteChallenge;
};

export function VotePanel({ fact, availability, challenge }: VotePanelProps) {
  const [pending, setPending] = useState(false);
  const [answer, setAnswer] = useState("");
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
        body: JSON.stringify({
          verdict,
          challengeNonce: challenge.nonce,
          challengeAnswer: answer,
        }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setError(true);
        setMessage(payload.error ?? "Vote impossible pour le moment.");
        return;
      }

      setMessage(payload.message ?? "Vote enregistré.");
      window.location.reload();
    } catch {
      setError(true);
      setMessage("Erreur réseau, réessayez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="vote-panel card">
      <div className="vote-panel__header">
        <p className="eyebrow">Vote visiteur</p>
        <h3>Quel est votre verdict sur ce fait&nbsp;?</h3>
        <p className="muted">
          Vote anonyme, limité par appareil, IP et vérification légère côté serveur.
        </p>
      </div>

      <div className="vote-panel__challenge">
        <span className="vote-panel__challenge-label">{challenge.hint}</span>
        <label className="field">
          <span>{challenge.prompt}</span>
          <input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Votre réponse"
            inputMode="numeric"
          />
        </label>
      </div>

      <div className="vote-panel__actions">
        {(["true", "false", "unverifiable"] as Verdict[]).map((verdict) => (
          <button
            key={verdict}
            type="button"
            className={`button vote-button vote-button--${verdict}`}
            onClick={() => submit(verdict)}
            disabled={pending || !availability.allowed || answer.trim().length === 0}
          >
            {labels[verdict]}
          </button>
        ))}
      </div>

      {!availability.allowed && availability.reason ? (
        <p className="error-text">{availability.reason}</p>
      ) : null}
      {message ? <p className={error ? "error-text" : "success-text"}>{message}</p> : null}
    </section>
  );
}
