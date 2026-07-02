import { authOptions } from "@/lib/auth";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;

  if (role === "admin") {
    redirect("/admin");
  }

  if (role === "teacher") {
    redirect("/dashboard");
  }

  redirect("/login");
}
