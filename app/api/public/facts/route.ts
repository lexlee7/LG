import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { submitFactSuggestion } from "@/lib/store";

const schema = z.object({
  personalitySlug: z.string().min(1),
  title: z.string().min(4),
  statement: z.string().min(4),
  context: z.string().min(4),
  category: z.string().min(2),
  sourceLabel: z.string().optional(),
  sourceUrl: z.string().optional(),
  happenedAt: z.string().min(4),
  tags: z.string().optional(),
  submitterLabel: z.string().optional(),
});

export async function POST(request: Request) {
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
    submitterLabel: formData.get("submitterLabel") ?? "",
  });

  if (!parsed.success) {
    redirect("/contribuer?error=fact-invalid");
  }

  await submitFactSuggestion(
    {
      personalityName: parsed.data.personalitySlug,
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
      submitterLabel: parsed.data.submitterLabel || null,
    }
  );

  revalidatePath("/admin");
  revalidatePath("/contribuer");
  redirect("/contribuer?success=fact");
}
