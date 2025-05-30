import { requireAuth } from "../../utils/auth";
import CreateItemForm from "../../components/item/createItemForm";

export default async function CreateItemPage() {
  // Check authentication
  requireAuth();
  
  return <CreateItemForm />;
}
