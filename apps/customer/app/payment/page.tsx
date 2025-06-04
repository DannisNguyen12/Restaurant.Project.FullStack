import { cookies } from 'next/headers';
import Payment from "../../components/payment/payment";

export default async function PaymentPage() {
  // Read cart from cookie on the server
  let cart: { id: number; name: string; price: number; quantity: number }[] = [];
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart")?.value;
  if (cartCookie) {
    try {
      cart = JSON.parse(decodeURIComponent(cartCookie));
    } catch {
      cart = [];
    }
  }
  return <Payment cart={cart} />;
}
