import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "../../components/login/loginForm";

export default async function LoginPage() {
  // If already authenticated, redirect to home
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  
  if (session) {
    redirect("/");
  }

  return <LoginForm />;
}