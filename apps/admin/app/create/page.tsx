import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CreateItemForm from "../../components/item/createItemForm";

export default async function CreateItemPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) {
    redirect("/login");
  }
  return <CreateItemForm />;
}
