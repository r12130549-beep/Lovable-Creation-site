import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// --- Coupons ---
export const getCoupons = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase.from('coupons' as any).select('*');
    if (error) throw new Error(error.message);
    return data as any[];
  });

export const validateCoupon = createServerFn({ method: "POST" })
  .inputValidator(z.object({ code: z.string(), extensionId: z.string().optional() }))
  .handler(async ({ data }) => {
    const { data: coupon, error } = await supabase
      .from('coupons' as any)
      .select('*')
      .eq('code', data.code)
      .single();
    
    if (error || !coupon) throw new Error("Invalid coupon code");
    const c = coupon as any;
    if (c.expiry_date && new Date(c.expiry_date) < new Date()) throw new Error("Coupon expired");
    if (c.usage_limit && c.used_count >= c.usage_limit) throw new Error("Usage limit reached");
    if (c.extension_id && data.extensionId && c.extension_id !== data.extensionId) throw new Error("Coupon not valid for this product");
    
    return c;
  });

// --- Reviews ---
export const getExtensionReviews = createServerFn({ method: "GET" })
  .inputValidator(z.object({ extensionId: z.string() }))
  .handler(async ({ data }) => {
    const { data: reviews, error } = await supabase
      .from('reviews' as any)
      .select('*, profiles(full_name, avatar_url)')
      .eq('extension_id', data.extensionId)
      .eq('status', 'approved');
    if (error) throw new Error(error.message);
    return reviews as any[];
  });

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    extensionId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional()
  }))
  .handler(async ({ data }) => {
    const { data: review, error } = await supabase
      .from('reviews' as any)
      .insert({
        extension_id: data.extensionId,
        rating: data.rating,
        comment: data.comment,
        status: 'pending' 
      });
    if (error) throw new Error(error.message);
    return review;
  });

// --- Support ---
export const createTicket = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    subject: z.string(),
    message: z.string(),
    attachmentUrl: z.string().optional()
  }))
  .handler(async ({ data }) => {
    const { data: ticket, error } = await supabase
      .from('support_tickets' as any)
      .insert({
        subject: data.subject,
        message: data.message,
        attachment_url: data.attachmentUrl,
        status: 'open'
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return ticket;
  });

export const getMyTickets = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('support_tickets' as any)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as any[];
  });
