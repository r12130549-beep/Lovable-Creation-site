import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { firestore } from "./firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      orderId: z.string().min(1, "Order ID is required"),
      email: z.string().email().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    try {
      const ordersRef = collection(firestore, "orders");
      const q = query(ordersRef, where("orderId", "==", data.orderId), limit(1));
      const querySnapshot = await getDocs(q);

      const doc = querySnapshot.docs[0];
      if (!doc) {
        throw new Error("Order not found");
      }

      const orderData = doc.data();

      if (data.email && orderData['email']?.toLowerCase() !== data.email.toLowerCase()) {
        throw new Error("Order not found or invalid credentials");
      }

      // Convert timestamps to strings for client-side serialization
      return {
        id: orderData['orderId'],
        customer_name: orderData['customerName'],
        customer_email: orderData['email'],
        payment_method: orderData['paymentMethod'],
        payment_status: orderData['paymentStatus'],
        transaction_id: orderData['txid'],
        status: orderData['orderStatus'],
        amount: orderData['price'],
        currency: orderData['currency'] || "৳",
        admin_note: orderData['notes'],
        created_at: orderData['createdAt']?.toDate?.()?.toISOString() || orderData['createdAt'],
        updated_at: orderData['updatedAt']?.toDate?.()?.toISOString() || orderData['updatedAt'],
        license: {
          key: orderData['licenseKey'],
          name: orderData['licenseName'],
          status: orderData['licenseKey'] ? (orderData['expireDate']?.toDate() < new Date() ? 'Expired' : 'Active') : null,
          expires_at: orderData['expireDate']?.toDate?.()?.toISOString() || orderData['expireDate'],
          download_url: orderData['downloadLink']
        }
      };
    } catch (error: any) {
      console.error("Error tracking order:", error);
      throw error;
    }
  });
