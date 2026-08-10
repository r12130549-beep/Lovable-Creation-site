import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { 
  adminFirestore, 
  collection, 
  getDocs, 
  query, 
} from "./firebase-admin.server";

export const trackOrder = createServerFn({ method: "POST" })
  .validator((data: any) => {
    const raw = data?.data || data;
    return z.object({
      orderId: z.string().min(1, "Order ID is required"),
      email: z.string().optional().nullable(),
    }).parse(raw);
  })
  .handler(async ({ data }) => {
    try {
      const ordersRef = collection(adminFirestore, "orders");
      const querySnapshot = await getDocs(query(ordersRef));
      
      const orders = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));

      const searchId = data.orderId.trim().toUpperCase();
      const order = orders.find((o: any) => 
        (o.order_id?.toUpperCase() === searchId || o.id === data.orderId)
      );
      
      if (!order) {
        throw new Error("অর্ডারটি পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডি ব্যবহার করুন।");
      }

      if (data.email && order.customer_email?.toLowerCase() !== data.email.toLowerCase()) {
        throw new Error("অর্ডার আইডি এবং ইমেইল ম্যাচ করেনি।");
      }

      const now = new Date();
      const expireDate = order.expire_date ? new Date(order.expire_date) : null;
      const isExpired = !!(expireDate && expireDate < now);

      return {
        id: order.order_id || order.id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        payment_method: order.payment_method,
        payment_status: order.payment_status || order.order_status || order.status,
        transaction_id: order.transaction_id,
        status: order.order_status || order.status || "Pending",
        amount: order.price || order.amount,
        currency: order.currency || "৳",
        admin_note: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at,
        product_name: order.product_name,
        isExpired,
        license: {
          key: isExpired ? null : order.license_key,
          name: order.license_name,
          status: order.license_key ? (isExpired ? 'Expired' : 'Active') : null,
          expires_at: order.expire_date,
          download_url: isExpired ? null : order.download_link
        }
      };
    } catch (error: any) {
      console.error("Error tracking order in Firebase:", error);
      throw error;
    }
  });