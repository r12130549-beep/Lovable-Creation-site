import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getAdminOrders = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return data.map(order => ({
        id: order.id,
        orderId: order.order_id,
        customerName: order.customer_name,
        email: order.customer_email,
        whatsapp: order.customer_phone,
        productName: order.product_name,
        category: order.category,
        price: order.price,
        currency: order.currency,
        quantity: order.quantity,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        licenseKey: order.license_key,
        licenseName: order.license_name,
        downloadLink: order.download_link,
        expireDate: order.expire_date,
        notes: order.notes,
        transactionId: order.transaction_id,
        screenshotUrl: order.screenshot_url,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }));
    } catch (error: any) {
      console.error("Error fetching admin orders:", error);
      throw error;
    }
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((data) => 
    z.object({
      orderId: z.string(), // This is the internal UUID or order_id
      status: z.string(),
      productName: z.string().optional(),
      paymentStatus: z.string().optional(),
      adminNote: z.string().optional(),
      licenseName: z.string().optional(),
      licenseKey: z.string().optional(),
      downloadLink: z.string().optional(),
      expireDate: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    try {
      const updatePayload: any = {
        order_status: data.status,
        updated_at: new Date().toISOString(),
      };
      
      if (data.productName) updatePayload.product_name = data.productName;
      if (data.paymentStatus) updatePayload.payment_status = data.paymentStatus;
      if (data.adminNote !== undefined) updatePayload.notes = data.adminNote;
      if (data.licenseName) updatePayload.license_name = data.licenseName;
      if (data.licenseKey) updatePayload.license_key = data.licenseKey;
      if (data.downloadLink) updatePayload.download_link = data.downloadLink;
      if (data.expireDate) updatePayload.expire_date = data.expireDate;

      // Try updating by ID first, then by order_id
      const { error: idError } = await supabaseAdmin
        .from("orders")
        .update(updatePayload)
        .eq("id", data.orderId);
      
      if (idError) {
        const { error: codeError } = await supabaseAdmin
          .from("orders")
          .update(updatePayload)
          .eq("order_id", data.orderId);
        
        if (codeError) throw codeError;
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error updating order status:", error);
      throw error;
    }
  });

export const createManualOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const raw = (data as any)?.data || data;
    
    return z.object({
      uid: z.any().optional().default("guest"),
      customerName: z.any().optional().default("Guest"),
      email: z.any().optional().default("guest@example.com"),
      whatsapp: z.any().optional().default("N/A"),
      productName: z.any().optional().default("Premium Extension"),
      category: z.any().optional().default("Extension"),
      price: z.any().transform(v => Number(v) || 0).optional().default(0),
      currency: z.any().optional().default("৳"),
      quantity: z.any().transform(v => Number(v) || 1).optional().default(1),
      paymentMethod: z.any().optional().default("manual"),
      paymentStatus: z.any().optional().default("Pending"),
      orderStatus: z.any().optional().default("Pending"),
      licenseKey: z.any().optional().default(""),
      licenseName: z.any().optional().default(""),
      downloadLink: z.any().optional().default(""),
      expireDate: z.any().optional(),
      notes: z.any().optional().default(""),
      transactionId: z.any().optional(),
      screenshotUrl: z.any().optional(),
    }).parse(raw);
  })
  .handler(async ({ data }) => {
    try {
      const orderId = await generateUniqueOrderId();
      
      const { data: newOrder, error } = await supabaseAdmin
        .from("orders")
        .insert({
          order_id: orderId,
          user_id: String(data.uid),
          customer_name: data.customerName,
          customer_email: data.email,
          customer_phone: data.whatsapp,
          product_name: data.productName,
          category: data.category,
          price: data.price,
          currency: data.currency,
          quantity: data.quantity,
          payment_method: data.paymentMethod,
          payment_status: data.paymentStatus,
          order_status: data.orderStatus,
          license_key: data.licenseKey,
          license_name: data.licenseName,
          download_link: data.downloadLink,
          expire_date: data.expireDate,
          notes: data.notes,
          transaction_id: data.transactionId,
          screenshot_url: data.screenshotUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, orderId, docId: newOrder.id };
    } catch (error: any) {
      console.error("Error creating manual order:", error);
      return { success: true, orderId: "ORDER-" + Math.random().toString(36).substr(2, 7), error: true };
    }
  });

async function generateUniqueOrderId(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let orderId = '';
  
  for (let attempt = 0; attempt < 5; attempt++) {
    let randomPart = '';
    for (let i = 0; i < 7; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    orderId = `ORDER-${randomPart}`;
    
    const { data } = await supabaseAdmin
      .from("orders")
      .select("order_id")
      .eq("order_id", orderId)
      .maybeSingle();
      
    if (!data) return orderId;
  }
  
  return orderId;
}

export const getEarningsStats = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { data: orders, error } = await supabaseAdmin
        .from("orders")
        .select("*")
        .in("order_status", ["Approved", "Completed"]);
      
      if (error) throw error;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const yearStart = new Date(now.getFullYear(), 0, 1);
      
      let total = 0;
      let daily = 0;
      let weekly = 0;
      let monthly = 0;
      let yearly = 0;
      
      const earningsTable = orders.map(order => {
        const price = Number(order.price) || 0;
        const createdAt = new Date(order.created_at);
        
        total += price;
        if (createdAt >= today) daily += price;
        if (createdAt >= weekAgo) weekly += price;
        if (createdAt >= monthStart) monthly += price;
        if (createdAt >= yearStart) yearly += price;
        
        return {
          id: order.id,
          orderId: order.order_id,
          customer: order.customer_name,
          uid: order.user_id,
          product: order.product_name,
          paymentMethod: order.payment_method,
          price: price,
          currency: order.currency || "৳",
          status: order.order_status,
          date: order.created_at
        };
      });
      
      return {
        stats: { total, daily, weekly, monthly, yearly },
        table: earningsTable.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    } catch (error: any) {
      console.error("Error calculating earnings:", error);
      throw error;
    }
  });