import { db } from "@/lib/db";
import RecentPurchasePopup from "./RecentPurchasePopup";

export default async function RecentPurchasePopupWrapper() {
  let products: Array<{ title: string }> = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products = await (db.product.findMany as any)({
      where: { isActive: true },
      take: 20,
      select: { title: true },
    }) as Array<{ title: string }>;
  } catch (error) {
    console.warn("Could not fetch recent products during build", error);
  }

  if (products.length === 0) return null;

  return <RecentPurchasePopup products={products} enabled={true} />;
}
