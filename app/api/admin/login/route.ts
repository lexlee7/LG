import { redirect } from "next/navigation";

import { createAdminSession, validateAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!validateAdminPassword(password)) {
    redirect("/admin?error=Mot-de-passe-invalide");
  }

  await createAdminSession();
  redirect("/admin");
}
