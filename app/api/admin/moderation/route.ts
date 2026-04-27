import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { setFactModeration } from "@/lib/store";
import type { ModerationStatus } from "@/lib/types";

const schema = z.object({
  factId: z.coerce.number().int().positive(),
  moderationStatus: z.enum(["draft", "pending", "approved", "rejected"]),
  moderationNote: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.redirect(new URL("/admin?error=auth", request.url));
  }

  const formData = await request.formData();
  const parsed = schema.safeParse({
    factId: formData.get("factId"),
    moderationStatus: formData.get("moderationStatus") ?? formData.get("status"),
    moderationNote: formData.get("moderationNote") ?? formData.get("note") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/admin?error=moderation", request.url));
  }

  await setFactModeration(
    parsed.data.factId,
    parsed.data.moderationStatus as ModerationStatus,
    parsed.data.moderationNote || null,
  );

  revalidatePath("/");
  revalidatePath("/faits");
  revalidatePath("/admin");
  return NextResponse.redirect(new URL("/admin?updated=moderation", request.url));
}
