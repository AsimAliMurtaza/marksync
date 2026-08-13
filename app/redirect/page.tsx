import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export default async function RedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = session?.user?.role;

  if (role === "ADMIN" || role === "admin") {
    redirect("/admin/dashboard");
  } else if (role === "INSTRUCTOR" || role === "instructor") {
    redirect("/instructor/courses");
  } else {
    redirect("/home");
  }
}
