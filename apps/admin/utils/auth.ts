import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAuth() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    
    if (!session) {
      redirect("/login");
    }
    
    return session;
  } catch (error) {
    console.error("Auth error:", error);
    redirect("/login");
  }
}
