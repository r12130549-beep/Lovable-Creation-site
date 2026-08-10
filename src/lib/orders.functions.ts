import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { firestore } from "./firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  orderBy, 
  serverTimestamp, 
  getDoc,
  Timestamp 
} from "firebase/firestore";

export const getAdminOrders = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const ordersRef = collection(firestore, "orders");
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data['createdAt']?.toDate?.()?.toISOString() || data['createdAt'],
          updatedAt: data['updatedAt']?.toDate?.()?.toISOString() || data['updatedAt'],
          expireDate: data['expireDate']?.toDate?.()?.toISOString() || data['expireDate'],
        };
      });
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
      const orderRef = doc(firestore, "orders", data.orderId);
      const updatePayload: any = {
        orderStatus: data.status,
        updatedAt: serverTimestamp(),
      };
      
      if (data.paymentStatus) updatePayload.paymentStatus = data.paymentStatus;
      if (data.adminNote !== undefined) updatePayload.notes = data.adminNote;
      if (data.licenseName) updatePayload.licenseName = data.licenseName;
      if (data.licenseKey) updatePayload.licenseKey = data.licenseKey;
      if (data.downloadLink) updatePayload.downloadLink = data.downloadLink;
      if (data.expireDate) {
        updatePayload.expireDate = Timestamp.fromDate(new Date(data.expireDate));
      }

      await updateDoc(orderRef, updatePayload);
      return { success: true };
    } catch (error: any) {
      console.error("Error updating order status:", error);
      throw error;
    }
  });

export const createManualOrder = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    uid: z.string().optional().default("guest"),
    customerName: z.any(),
    email: z.any(),
    whatsapp: z.any(),
    productName: z.any(),
    category: z.string().optional().default("General"),
    price: z.any().transform(v => Number(v) || 0),
    currency: z.string().optional().default("৳"),
    quantity: z.number().optional().default(1),
    paymentMethod: z.any(),
    paymentStatus: z.string().optional().default("Pending"),
    orderStatus: z.string().optional().default("Pending"),
    licenseKey: z.string().optional(),
    licenseName: z.string().optional(),
    downloadLink: z.string().optional(),
    expireDate: z.string().optional(),
    notes: z.string().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    try {
      const orderId = await generateUniqueOrderId();
      const ordersRef = collection(firestore, "orders");
      
      const newOrder = {
        ...data,
        orderId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expireDate: data.expireDate ? Timestamp.fromDate(new Date(data.expireDate)) : null,
      };

      const docRef = await addDoc(ordersRef, newOrder);
      return { success: true, orderId, docId: docRef.id };
    } catch (error: any) {
      console.error("Error creating manual order:", error);
      throw error;
    }
  });

async function generateUniqueOrderId(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let orderId = '';
  
  while (!isUnique) {
    let randomPart = '';
    for (let i = 0; i < 7; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    orderId = `ORDER-${randomPart}`;
    
    // Check uniqueness in Firestore
    const ordersRef = collection(firestore, "orders");
    const q = query(ordersRef, where("orderId", "==", orderId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      isUnique = true;
    }
  }
  
  return orderId;
}

export const getEarningsStats = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const ordersRef = collection(firestore, "orders");
      // Only count Approved or Completed orders
      const q = query(
        ordersRef, 
        where("orderStatus", "in", ["Approved", "Completed"])
      );
      const querySnapshot = await getDocs(q);
      
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
      
      const earningsTable: any[] = [];
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const price = Number(data['price']) || 0;
        const createdAt = data['createdAt']?.toDate() || new Date();
        
        total += price;
        if (createdAt >= today) daily += price;
        if (createdAt >= weekAgo) weekly += price;
        if (createdAt >= monthStart) monthly += price;
        if (createdAt >= yearStart) yearly += price;
        
        earningsTable.push({
          id: doc.id,
          orderId: data['orderId'],
          customer: data['customerName'],
          uid: data['uid'],
          product: data['productName'],
          paymentMethod: data['paymentMethod'],
          price: price,
          currency: data['currency'] || "৳",
          status: data['orderStatus'],
          date: createdAt.toISOString()
        });
      });
      
      return {
        stats: {
          total,
          daily,
          weekly,
          monthly,
          yearly
        },
        table: earningsTable.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    } catch (error: any) {
      console.error("Error calculating earnings:", error);
      throw error;
    }
  });