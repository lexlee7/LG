import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/auth";
import { createPersonality } from "@/lib/store";

const personalitySchema = z.object({
  name: z.string().min(3),
  role: z.string().min(3),
  summary: z.string().min(20),
  accent: z.string().min(4).default("#6d5efc"),
  highlightNote: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin?error=auth");
  }

  const formData = await request.formData();
  const parsed = personalitySchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    summary: formData.get("summary"),
    accent: formData.get("accent") || "#6d5efc",
    highlightNote: formData.get("highlightNote") || undefined,
    isFeatured: formData.get("isFeatured") === "on",
  });

  if (!parsed.success) {
    redirect("/admin?error=personality-invalid");
  }

  await createPersonality(parsed.data);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/personnalites");
  redirect("/admin?success=personality-created");
}
