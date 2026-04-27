import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/auth";
import { createFact } from "@/lib/store";

const schema = z.object({
  personalitySlug: z.string().min(1),
  title: z.string().min(4),
  statement: z.string().min(8),
  context: z.string().min(8),
  category: z.string().min(2),
  sourceLabel: z.string().optional(),
  sourceUrl: z.string().optional(),
  happenedAt: z.string().min(4),
  tags: z.string().optional(),
  highlightNote: z.string().optional(),
  moderationStatus: z.enum(["draft", "pending", "approved", "rejected"]).optional(),
  moderationNote: z.string().optional(),
  isFeatured: z.enum(["on"]).optional(),
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin?error=auth");
  }

  const formData = await request.formData();

  const parsed = schema.safeParse({
    personalitySlug: formData.get("personalitySlug"),
    title: formData.get("title"),
    statement: formData.get("statement"),
    context: formData.get("context"),
    category: formData.get("category"),
    sourceLabel: formData.get("sourceLabel") ?? "",
    sourceUrl: formData.get("sourceUrl") ?? "",
    happenedAt: formData.get("happenedAt") ?? "",
    tags: formData.get("tags") ?? "",
    highlightNote: formData.get("highlightNote") ?? "",
    moderationStatus: formData.get("moderationStatus") ?? "pending",
    moderationNote: formData.get("moderationNote") ?? "",
    isFeatured: formData.get("isFeatured") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json(
      { error: "Le formulaire du fait contient des champs invalides." },
      { status: 400 },
    );
  }

  await createFact({
    personalitySlug: parsed.data.personalitySlug,
    title: parsed.data.title,
    statement: parsed.data.statement,
    context: parsed.data.context,
    category: parsed.data.category,
    sourceLabel: parsed.data.sourceLabel || null,
    sourceUrl: parsed.data.sourceUrl || null,
    happenedAt: parsed.data.happenedAt,
    tags: parsed.data.tags
      ? parsed.data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
    highlightNote: parsed.data.highlightNote || null,
    moderationStatus: parsed.data.moderationStatus ?? "pending",
    moderationNote: parsed.data.moderationNote || null,
    isFeatured: parsed.data.isFeatured === "on",
  });

  revalidatePath("/");
  revalidatePath("/faits");
  revalidatePath("/admin");
  redirect("/admin");
}
