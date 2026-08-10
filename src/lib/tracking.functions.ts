import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      orderId: z.string().min(1, "Order ID is required"),
      email: z.string().email().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { createAdminClient } = await import("@/integrations/supabase/client.server");
    const supabaseAdmin = createAdminClient();
    try {
      // Search in Supabase orders table
      const { data: orderData, error } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("order_id", data.orderId.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;
      if (!orderData) {
        throw new Error("Order not found");
      }

      const order = orderData as any;

      if (data.email && order.customer_email?.toLowerCase() !== data.email.toLowerCase()) {
        throw new Error("Order not found or invalid credentials");
      }

      const now = new Date();
      const expireDate = order.expire_date ? new Date(order.expire_date) : null;
      const isExpired = !!(expireDate && expireDate < now);

      return {
        id: order.order_id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        payment_method: order.payment_method,
        payment_status: order.payment_status || order.status,
        transaction_id: order.transaction_id,
        status: order.order_status || order.status,
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
      console.error("Error tracking order:", error);
      throw error;
    }
  });
