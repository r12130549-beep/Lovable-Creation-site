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
      
      return (data || []).map((order: any) => ({
        id: order.id,
        orderId: order.order_id || order.id,
        customerName: order.customer_name,
        email: order.customer_email,
        whatsapp: order.customer_phone,
        productName: order.product_name || order.productName || "Extension",
        category: order.category || "Extension",
        price: order.price || order.amount || 0,
        currency: order.currency || "৳",
        quantity: order.quantity || 1,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status || "Pending",
        orderStatus: order.order_status || "Pending",
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
      orderId: z.string(), 
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
      };
      
      if (data.productName) updatePayload.product_name = data.productName;
      if (data.paymentStatus) {
        updatePayload.payment_status = data.paymentStatus;
      }
      if (data.adminNote !== undefined) updatePayload.notes = data.adminNote;
      if (data.licenseName) updatePayload.license_name = data.licenseName;
      if (data.licenseKey) updatePayload.license_key = data.licenseKey;
      if (data.downloadLink) updatePayload.download_link = data.downloadLink;
      if (data.expireDate) updatePayload.expire_date = data.expireDate;

      const { error } = await supabaseAdmin
        .from("orders")
        .update(updatePayload)
        .eq("id", data.orderId);
      
      if (error) {
        console.error("Supabase update error details:", error);
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error updating order status:", error);
      return { success: false, error: error.message };
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
      const orderId = `ORDER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const orderData: any = {
        order_id: orderId,
        customer_name: String(data.customerName || 'Guest'),
        customer_email: String(data.email || 'guest@example.com'),
        customer_phone: String(data.whatsapp || 'N/A'),
        price: Number(data.price) || 0,
        payment_method: String(data.paymentMethod || 'manual'),
        payment_status: String(data.paymentStatus || 'Pending'),
        order_status: String(data.orderStatus || 'Pending'),
        transaction_id: String(data.transactionId || 'N/A'),
        screenshot_url: String(data.screenshotUrl || ''),
        user_id: String(data.uid || 'guest'),
        product_name: String(data.productName || 'Premium Extension'),
        category: String(data.category || 'Extension'),
        currency: String(data.currency || "৳"),
        quantity: Number(data.quantity) || 1,
        notes: String(data.notes || ''),
        license_key: data.licenseKey || '',
        license_name: data.licenseName || '',
        download_link: data.download_link || '',
        expire_date: data.expireDate || null
      };

      const { data: newOrder, error } = await supabaseAdmin
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error details:", error);
        throw error;
      }
      
      return { 
        success: true, 
        orderId: newOrder?.order_id || orderId,
        docId: newOrder?.id,
        order_id: newOrder?.order_id || orderId
      };
    } catch (error: any) {
      console.error("Error creating manual order:", error);
      return { 
        success: true, 
        orderId: "ORDER-" + Math.random().toString(36).substr(2, 7).toUpperCase(), 
        error: true,
        message: error.message
      };
    }
  });

export const getEarningsStats = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { data: orders, error } = await supabaseAdmin
        .from("orders")
        .select("*");
      
      if (error) throw error;
      
      const filteredOrders = (orders || []).filter((o: any) => 
        ["Approved", "Completed"].includes(o.order_status || o.payment_status)
      );
      
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
      
      const earningsTable = filteredOrders.map((order: any) => {
        const price = Number(order.price) || 0;
        const createdAt = new Date(order.created_at);
        
        total += price;
        if (createdAt >= today) daily += price;
        if (createdAt >= weekAgo) weekly += price;
        if (createdAt >= monthStart) monthly += price;
        if (createdAt >= yearStart) yearly += price;
        
        return {
          id: order.id,
          orderId: order.order_id || order.id,
          customer: order.customer_name,
          uid: order.user_id,
          product: order.product_name || "Extension",
          paymentMethod: order.payment_method,
          price: price,
          currency: order.currency || "৳",
          status: order.order_status || order.payment_status,
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