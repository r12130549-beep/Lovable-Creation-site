import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { 
  adminFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where
} from "./firebase-admin.server";

export const getAdminUsers = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const usersRef = collection(adminFirestore, "users");
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  });

export const toggleUserStatus = createServerFn({ method: "POST" })
  .validator((data: any) => {
    const raw = data?.data || (typeof data === 'string' ? JSON.parse(data) : data);

    return z.object({
      userId: z.string(),
      isSuspended: z.boolean()
    }).parse(raw);
  })
  .handler(async ({ data }) => {
    try {
      const userRef = doc(adminFirestore, "users", data.userId);
      await updateDoc(userRef, { is_suspended: data.isSuspended });
      return { success: true };
    } catch (error) {
      console.error("Error toggling user status:", error);
      return { success: false };
    }
  });

export const removeUser = createServerFn({ method: "POST" })
  .validator((data: any) => {
    const raw = data?.data || (typeof data === 'string' ? JSON.parse(data) : data);

    return z.object({
      userId: z.string()
    }).parse(raw);
  })
  .handler(async ({ data }) => {
    try {
      const userRef = doc(adminFirestore, "users", data.userId);
      await deleteDoc(userRef);
      return { success: true };
    } catch (error) {
      console.error("Error removing user:", error);
      return { success: false };
    }
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .validator((data: any) => {
    const raw = data?.data || (typeof data === 'string' ? JSON.parse(data) : data);

    return z.object({
      userId: z.string(),
      role: z.string()
    }).parse(raw);
  })
  .handler(async ({ data }) => {
    try {
      const userRef = doc(adminFirestore, "users", data.userId);
      await updateDoc(userRef, { role: data.role });
      return { success: true };
    } catch (error) {
      console.error("Error updating user role:", error);
      return { success: false };
    }
  });

export const checkAdminStatus = createServerFn({ method: "POST" })
  .validator((data: any) => {
    const raw = data?.data || (typeof data === 'string' ? JSON.parse(data) : data);
    return z.object({
      email: z.string().email(),
      uid: z.string()
    }).parse(raw);
  })
  .handler(async ({ data }) => {
    const allowedEmails = ['admin@gmail.com', 'gmail@gmail.com', 'r12130549@gmail.com', 'kivabe@gmail.com', 'popykhanum2255@gmail.com', 'ashik97355@gmail.com', 'emon@gmail.com', 'admin@vibex.com', 'ak2688469@gmail.com'];
    
    // Check whitelist first
    if (allowedEmails.includes(data.email)) {
      return { isAdmin: true };
    }
    
    try {
      // Direct Admin access check using admin SDK bypasses client RLS issues
      const userRef = doc(adminFirestore, "users", data.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return { isAdmin: userData['role'] === 'admin' || userData['isAdmin'] === true };
      }
    } catch (error) {
      console.error("Error checking admin status on server:", error);
    }
    
    return { isAdmin: false };
  });
