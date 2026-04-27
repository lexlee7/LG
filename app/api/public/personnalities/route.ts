import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createPersonality } from "@/lib/store";

const schema = z.object({
  name: z.string().min(3),
  role: z.string().min(3),
  summary: z.string().min(20),
  country: z.string().min(2).default("France"),
  party: z.string().optional(),
  wikipediaUrl: z.string().url().optional().or(z.literal("")),
  accent: z.string().min(4).default("linear-gradient(135deg, #4f75ff, #1d2740)"),
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = schema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    summary: formData.get("summary"),
    country: formData.get("country") || "France",
    party: formData.get("party") || undefined,
    wikipediaUrl: formData.get("wikipediaUrl") || "",
    accent:
      formData.get("accent") || "linear-gradient(135deg, #4f75ff, #1d2740)",
  });

  if (!parsed.success) {
    redirect("/contribuer?error=personality");
  }

  await createPersonality(
    {
      ...parsed.data,
      wikipediaUrl: parsed.data.wikipediaUrl || null,
      party: parsed.data.party || null,
      highlightNote: "Soumis par la communaute",
      isFeatured: false,
    },
    "community",
  );

  revalidatePath("/contribuer");
  revalidatePath("/admin");
  revalidatePath("/personnalites");
  redirect("/contribuer?success=personality");
}
