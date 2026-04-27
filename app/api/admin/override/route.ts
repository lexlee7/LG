import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/auth";
import { setFactOverride } from "@/lib/store";
import type { Verdict } from "@/lib/types";

const schema = z.object({
  factId: z.coerce.number().int().positive(),
  outcome: z.enum(["true", "false", "unverifiable"]).or(z.literal("")),
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin?error=auth", request.url));
  }

  const formData = await request.formData();
  const parsed = schema.safeParse({
    factId: formData.get("factId"),
    outcome: formData.get("outcome"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/admin?error=override", request.url));
  }

  await setFactOverride(
    parsed.data.factId,
    parsed.data.outcome === "" ? null : (parsed.data.outcome as Verdict),
  );

  revalidatePath("/");
  revalidatePath("/faits");
  revalidatePath("/admin");
  revalidatePath("/personnalites");

  return NextResponse.redirect(new URL("/admin?saved=override", request.url));
}
