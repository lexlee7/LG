import { NextResponse } from "next/server";
import { z } from "zod";

import { prepareVoteSubmission, submitVote } from "@/lib/store";

const schema = z.object({
  verdict: z.enum(["true", "false", "unverifiable"]),
  challengeNonce: z.string().min(1),
  challengeAnswer: z.string().min(1),
});

export async function POST(
  request: Request,
  context: RouteContext<"/api/facts/[slug]/vote">,
) {
  try {
    const { slug } = await context.params;
    const json = await request.json();
    const parsed = schema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Verdict invalide." },
        { status: 400 },
      );
    }

    const prepared = await prepareVoteSubmission(
      slug,
      parsed.data.verdict,
      parsed.data.challengeNonce,
      parsed.data.challengeAnswer,
    );
    await submitVote(prepared);

    return NextResponse.json({
      message: "Votre vote a ete enregistre.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Le vote n'a pas pu etre traite.",
      },
      { status: 400 },
    );
  }
}
