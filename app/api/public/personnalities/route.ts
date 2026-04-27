import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { submitPersonalitySuggestion } from "@/lib/store";

const schema = z.object({
  name: z.string().min(3),
  role: z.string().min(3),
  summary: z.string().min(20),
  country: z.string().min(2).default("France"),
  party: z.string().optional(),
  wikipediaUrl: z.string().url().optional().or(z.literal("")),
  sourceLabel: z.string().optional(),
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
    sourceLabel: formData.get("sourceLabel") || "",
  });

  if (!parsed.success) {
    redirect("/contribuer?error=personality");
  }

  await submitPersonalitySuggestion({
    ...parsed.data,
    wikipediaUrl: parsed.data.wikipediaUrl || null,
    party: parsed.data.party || null,
    sourceLabel: parsed.data.sourceLabel || null,
  });

  revalidatePath("/contribuer");
  revalidatePath("/admin");
  revalidatePath("/personnalites");
  redirect("/contribuer?success=personality");
}
