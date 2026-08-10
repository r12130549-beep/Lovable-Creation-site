import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { createServerFn, useServerFn } from '@tanstack/react-start';
import { z } from "zod";
import { 
  adminFirestore as serverFirestore, 
  collection as serverCollection, 
  getDocs as serverGetDocs, 
  doc as serverDoc, 
  updateDoc as serverUpdateDoc, 
  deleteDoc as serverDeleteDoc,
  query as serverQuery, 
  orderBy as serverOrderBy, 
  where as serverWhere,
  limit as serverLimit,
  setDoc as serverSetDoc,
  getDoc as serverGetDoc
} from "../lib/firebase-admin.server";
import { useAuth } from '@/hooks/use-auth';
import { 
  BarChart3, Package, Users, ShoppingBag, Shield, Settings, 
  Plus, Search, CheckCircle2, XCircle, CreditCard, Download, 
  TrendingUp, Clock, Edit, Trash2, Check, Copy, User, Mail, 
  Phone, Zap, Eye, Filter, Loader2, ExternalLink, AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLicenseAdmin } from '@/lib/licenses.functions';
import { createManualOrder, getEarningsStats } from '@/lib/orders.functions';
import { toggleUserStatus, removeUser } from '@/lib/users.functions';
import { getAppSettings, updateAppSetting } from '@/lib/settings.functions';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/admin/FileUpload';
import { motion, AnimatePresence } from 'framer-motion';

import { format } from 'date-fns';

export const getAdminOrdersFast = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const ordersRef = serverCollection(serverFirestore, "orders");
      const querySnapshot = await serverGetDocs(ordersRef);
      
      const orders = querySnapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data.created_at || new Date(0).toISOString(),
          customer_name: data.customer_name || 'Guest',
          customer_email: data.customer_email || 'guest@example.com'
        };
      });

      orders.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      
      return orders.slice(0, 50).map((order: any) => ({
        id: order.id,
        orderId: order.order_id || order.id,
        customerName: order.customer_name,
        email: order.customer_email,
        whatsapp: order.customer_phone || "N/A",
        productName: order.product_name || order.productName || "Extension",
        category: order.category || "Extension",
        price: Number(order.price || order.amount || 0),
        currency: order.currency || "৳",
        quantity: Number(order.quantity || 1),
        paymentMethod: order.payment_method || "Manual",
        paymentStatus: order.payment_status || "Pending",
        orderStatus: order.order_status || "Pending",
        licenseKey: order.license_key || "",
        licenseName: order.license_name || "",
        downloadLink: order.download_link || "",
        expireDate: order.expire_date || null,
        notes: order.notes || "",
        transactionId: order.transaction_id || "N/A",
        screenshotUrl: order.screenshot_url || "",
        isManual: order.payment_method === "Manual",
        createdAt: order.created_at,
        updatedAt: order.updated_at || order.created_at
      }));
    } catch (error: any) {
      console.error("CRITICAL: Error fetching admin orders fast:", error);
      return [];
    }
  });

export const getAdminExtensionsFast = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const extensionsRef = serverCollection(serverFirestore, "extensions");
      const snapshot = await serverGetDocs(extensionsRef);
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    } catch (error: any) {
      console.error("Error fetching extensions fast:", error);
      return [];
    }
  });

export const createExtensionFast = createServerFn({ method: "POST" })
  .validator((data: any) => z.object({
    name: z.string(),
    slug: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    category: z.string().optional(),
    icon_url: z.string().optional(),
    zip_url: z.string().optional(),
    version: z.string().optional(),
    status: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    try {
      const extensionsRef = serverCollection(serverFirestore, "extensions");
      const docRef = serverDoc(extensionsRef);
      const payload = {
        ...data,
        id: docRef.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await serverSetDoc(docRef, payload);
      return { success: true, extension: payload };
    } catch (error: any) {
      console.error("Error creating extension fast:", error);
      return { success: false, message: error?.message || "Failed to create extension" };
    }
  });

export const updateExtensionFast = createServerFn({ method: "POST" })
  .validator((data: any) => z.object({ id: z.string(), updates: z.any() }).parse(data))
  .handler(async ({ data }) => {
    try {
      const docRef = serverDoc(serverFirestore, "extensions", data.id);
      await serverUpdateDoc(docRef, { ...data.updates, updated_at: new Date().toISOString() });
      return { success: true };
    } catch (error: any) {
      console.error("Error updating extension fast:", error);
      return { success: false, message: error?.message || "Failed to update extension" };
    }
  });

export const deleteExtensionFast = createServerFn({ method: "POST" })
  .validator((data: any) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    try {
      const docRef = serverDoc(serverFirestore, "extensions", data.id);
      await serverDeleteDoc(docRef);
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting extension fast:", error);
      return { success: false, message: error?.message || "Failed to delete extension" };
    }
  });

export const updateOrderStatusFast = createServerFn({ method: "POST" })
  .validator((data: any) => z.object({ 
    orderId: z.string(), 
    status: z.string(),
    productName: z.string().optional(),
    licenseName: z.string().optional(),
    licenseKey: z.string().optional(),
    downloadLink: z.string().optional(),
    expireDate: z.string().optional().nullable()
  }).parse(data))
  .handler(async ({ data }) => {
    try {
      const orderRef = serverDoc(serverFirestore, "orders", data.orderId);
      const updatePayload: any = { 
        order_status: data.status,
        updated_at: new Date().toISOString()
      };
      if (data.productName) updatePayload.product_name = data.productName;
      if (data.licenseName) updatePayload.license_name = data.licenseName;
      if (data.licenseKey) updatePayload.license_key = data.licenseKey;
      if (data.downloadLink) updatePayload.download_link = data.downloadLink;
      if (data.expireDate) updatePayload.expire_date = data.expireDate;
      await serverUpdateDoc(orderRef, updatePayload);
      return { success: true };
    } catch (error: any) {
      console.error("Error updating order status fast:", error);
      return { success: false, message: error?.message || "Failed to update order status" };
    }
  });

export const getAdminUsersFast = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const usersRef = serverCollection(serverFirestore, "users");
      const snapshot = await serverGetDocs(usersRef);
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
      console.error("Error fetching users fast:", error);
      return [];
    }
  });

export const getAdminLicensesFast = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const licensesRef = serverCollection(serverFirestore, "licenses");
      const snapshot = await serverGetDocs(licensesRef);
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching admin licenses fast:", error);
      return [];
    }
  });

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminPage,
});

const MENU = [
  { icon: BarChart3, label: 'Dashboard', id: 'dashboard' },
  { icon: ShoppingBag, label: 'Orders', id: 'orders' },
  { icon: Plus, label: 'Create Order', id: 'create_order' },
  { icon: Package, label: 'Products', id: 'extensions' },
  { icon: Users, label: 'Customers', id: 'users' },
  { icon: CreditCard, label: 'Payments', id: 'payments' },
  { icon: TrendingUp, label: 'Earnings', id: 'analytics' },
  { icon: Shield, label: 'Licenses', id: 'licenses' },
  { icon: Zap, label: 'Server Status', id: 'server_status' },
  { icon: Settings, label: 'Website Settings', id: 'settings' },
];

function AdminPage() {
  const { user, isAdmin: checkIsAdmin, initialized } = useAuth();
  const isAdmin = checkIsAdmin || (user && ['admin@gmail.com', 'gmail@gmail.com', 'r12130549@gmail.com', 'kivabe@gmail.com', 'popykhanum2255@gmail.com', 'ashik97355@gmail.com', 'emon@gmail.com', 'admin@vibex.com'].includes(user.email || ''));
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [realtimeOrders, setRealtimeOrders] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isAddingExtension, setIsAddingExtension] = useState(false);
  const queryClient = useQueryClient();
  const getAdminOrdersFn = useServerFn(getAdminOrdersFast);
  const createManualOrderFn = useServerFn(createManualOrder);
  const updateOrderStatusFn = useServerFn(updateOrderStatusFast);
  const createExtensionFn = useServerFn(createExtensionFast);
  const deleteExtensionFn = useServerFn(deleteExtensionFast);
  const getExtensionsFn = useServerFn(getAdminExtensionsFast);
  const getAdminUsersFn = useServerFn(getAdminUsersFast);
  const getAdminLicensesFn = useServerFn(getAdminLicensesFast);

  useEffect(() => {
    if (initialized && (!user || !isAdmin)) {
      navigate({ to: '/admin', replace: true });
    }
  }, [user, isAdmin, initialized, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchOrders = async (silent = false) => {
      try {
        if (!silent) setIsRefreshing(true);
        const orders = await getAdminOrdersFn();
        if (orders) setRealtimeOrders(orders);
      } catch (err) {
        console.error("Error fetching admin orders:", err);
      } finally {
        if (!silent) setIsRefreshing(false);
      }
    };

    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 15000); // Poll every 15s silently
    
    return () => clearInterval(interval);
  }, [isAdmin, getAdminOrdersFn]);

  const { data: earningsData } = useQuery({
    queryKey: ['admin-earnings'],
    queryFn: () => getEarningsStats(),
    enabled: activeTab === 'analytics' || activeTab === 'dashboard',
  });

  const { data: extensions, isLoading: extensionsLoading } = useQuery({
    queryKey: ['admin-extensions'],
    queryFn: async () => {
      const data = await getExtensionsFn();
      return data;
    },
    enabled: activeTab === 'extensions',
  });

  const { data: adminUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAdminUsersFn(),
    enabled: activeTab === 'users',
  });

  const { data: settings } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => getAppSettings(),
    enabled: activeTab === 'settings' || activeTab === 'server_status',
  });

  const { data: licenses } = useQuery({
    queryKey: ['admin-licenses'],
    queryFn: () => getAdminLicensesFn(),
    enabled: activeTab === 'licenses',
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => createManualOrderFn({ data }),
    onSuccess: (result) => {
      if (!result.success || (!result.order_id && !result.orderId)) {
        toast.error(result.message || 'অর্ডার তৈরি করতে ব্যর্থ হয়েছে');
        return;
      }
      toast.success('অর্ডার সফল হয়েছে');
      const orderIdToCopy = result.order_id || result.orderId;
      if (orderIdToCopy) {
        window.prompt('অর্ডার আইডি (কপি করুন):', orderIdToCopy);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-earnings'] });
      // Refresh the orders list immediately
      getAdminOrdersFn().then(orders => setRealtimeOrders(orders || []));
      setActiveTab('orders');
    },
    onError: (err: any) => toast.error(err.message || 'অর্ডার তৈরি করতে ব্যর্থ হয়েছে')
  });

  const updateOrderMutation = useMutation({
    mutationFn: (data: any) => updateOrderStatusFn({ data } as any),
    onSuccess: () => {
      toast.success('অর্ডার আপডেট করা হয়েছে');

      setSelectedOrder(null);
      // Refresh list
      getAdminOrdersFn().then(orders => setRealtimeOrders(orders || []));
    },
    onError: (err: any) => toast.error(err.message || 'আপডেট ব্যর্থ হয়েছে')
  });

  const deleteExtensionMutation = useMutation({
    mutationFn: (id: string) => deleteExtensionFn({ data: { id } } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-extensions'] });
      toast.success('প্রোডাক্ট ডিলিট করা হয়েছে');
    }
  });

  const createExtensionMutation = useMutation({
    mutationFn: (data: any) => createExtensionFn({ data } as any),
    onSuccess: (res: any) => {
      if (res && res.success === false) {
        toast.error(res.message || 'Failed to create extension');
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['admin-extensions'] });
      toast.success('প্রোডাক্ট সফলভাবে অ্যাড হয়েছে');
      setIsAddingExtension(false);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create extension')
  });

  const filteredOrders = useMemo(() => {
    return realtimeOrders.filter(order => {
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = 
        order.orderId?.toLowerCase().includes(searchStr) ||
        order.email?.toLowerCase().includes(searchStr) ||
        order.customerName?.toLowerCase().includes(searchStr);
      
      const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [realtimeOrders, searchQuery, statusFilter]);


  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <aside className="w-72 border-r border-white/5 bg-[#0A0A0A] p-6 flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-12 px-2">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 shadow-lg shadow-red-500/20 flex items-center justify-center">
             <Shield className="w-6 h-6 text-white" />
           </div>
           <span className="text-xl font-black uppercase">VIBEX ADMIN</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {MENU.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-white/40 hover:bg-white/5'}`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-10 bg-[#050505] relative">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black uppercase">{activeTab}</h1>
            {activeTab === 'orders' && (
              <button 
                onClick={() => {
                  const fetchOrders = async () => {
                    try {
                      setIsRefreshing(true);
                      const orders = await getAdminOrdersFn();
                      setRealtimeOrders(orders || []);
                    } catch (err) {
                      console.error("Error fetching admin orders:", err);
                    } finally {
                      setIsRefreshing(false);
                    }
                  };
                  fetchOrders();
                }}
                disabled={isRefreshing}
                className="p-2 hover:bg-white/5 rounded-xl transition-all"
                title="Refresh Orders"
              >
                <Clock className={`w-4 h-4 text-white/40 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-6">


            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-[#0A0A0A] border border-white/5 rounded-2xl py-3 px-6 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {realtimeOrders.filter(o => (o.orderId || o.id)?.toLowerCase().includes(searchQuery.toLowerCase()) || o.customerName?.toLowerCase().includes(searchQuery.toLowerCase())).map(order => (
                <div key={order.id} className="p-6 bg-[#0A0A0A] border border-white/5 rounded-2xl flex justify-between items-center group hover:border-red-500/30 transition-all cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold flex items-center gap-2">
                        {order.orderId || order.id}
                        <span className={`text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest ${
                          ['Approved', 'Completed'].includes(order.orderStatus || order.status) ? 'bg-green-500/10 text-green-500' : 
                          ['Rejected', 'Failed', 'Cancelled'].includes(order.orderStatus || order.status) ? 'bg-red-500/10 text-red-500' : 
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {order.orderStatus || order.status}
                        </span>
                      </h3>
                      <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1 group/edit">
                        <Edit className="w-3 h-3 text-white/20 group-hover/edit:text-red-500" />
                        <input 
                          defaultValue={order.productName}
                          onBlur={async (e) => {
                            if (e.target.value !== order.productName) {
                              try {
                                await updateOrderMutation.mutateAsync({ orderId: order.id, productName: e.target.value, status: order.orderStatus || order.status });
                                toast.success('Product name updated');
                              } catch (err) {
                                e.target.value = order.productName;
                              }
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-transparent border-none outline-none text-xs font-bold text-white w-40 focus:ring-0"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-white/40">{order.customerName} | ৳{order.price} | {order.email}</p>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={(e) => { e.stopPropagation(); updateOrderMutation.mutate({ orderId: order.id, status: 'Approved' }); }} className="px-4 py-2 bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Approve</button>
                     <button onClick={(e) => { e.stopPropagation(); updateOrderMutation.mutate({ orderId: order.id, status: 'Rejected' }); }} className="px-4 py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Reject</button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'create_order' && (
            <div key="create_order_container" className="space-y-8">
              <motion.form key="create_order" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createOrderMutation.mutate({
                  uid: "guest",
                  customerName: formData.get('customerName')?.toString() || '',
                  email: formData.get('email')?.toString() || '',
                  whatsapp: formData.get('whatsapp')?.toString() || '',
                  productName: formData.get('product')?.toString() || '',
                  category: "General",
                  price: Number(formData.get('price')),
                  paymentMethod: "Manual",
                  licenseKey: formData.get('licenseKey')?.toString() || '',
                  licenseName: formData.get('licenseName')?.toString() || '',
                  downloadLink: formData.get('downloadLink')?.toString() || '',
                  expireDate: formData.get('expireDate')?.toString() || null,
                });
              }} className="p-8 bg-[#0A0A0A] border border-white/5 rounded-2xl space-y-4 max-w-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Customer Name</label>
                    <input name="customerName" placeholder="Name" required className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-red-500/50 outline-none text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Email</label>
                    <input name="email" placeholder="Email" type="email" required className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-red-500/50 outline-none text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">WhatsApp</label>
                    <input name="whatsapp" placeholder="WhatsApp" required className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-red-500/50 outline-none text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Price (৳)</label>
                    <input name="price" placeholder="Price" required type="number" className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-red-500/50 outline-none text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Product Name</label>
                  <input name="product" placeholder="Product" required className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-red-500/50 outline-none text-sm" />
                </div>
                
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500">License & Delivery Details</p>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">License Name</label>
                    <input name="licenseName" placeholder="License Name (e.g. Lifetime)" className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-red-500/50 outline-none text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">License Key</label>
                    <input name="licenseKey" placeholder="License Key" className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-red-500/50 outline-none text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Download Link</label>
                    <input name="downloadLink" placeholder="Download URL" className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-red-500/50 outline-none text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Expire Date</label>
                    <input name="expireDate" type="datetime-local" className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-red-500/50 outline-none text-sm" />
                  </div>
                </div>

                <button type="submit" disabled={createOrderMutation.isPending} className="w-full py-4 bg-red-600 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2 mt-4">
                  {createOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Order & Save"}
                </button>
              </motion.form>

              <div className="space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest text-white/40">Recently Created Manual Orders</h3>
                <div className="space-y-4">
                  {realtimeOrders.filter(o => o.isManual || o.paymentMethod === 'Manual').slice(0, 10).map(order => (
                    <div key={order.id} className="p-6 bg-[#0A0A0A] border border-white/5 rounded-2xl flex justify-between items-center group hover:border-red-500/30 transition-all cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <div>
                        <h4 className="font-bold text-red-500">{order.orderId}</h4>
                        <p className="text-xs text-white/40">{order.productName} - {order.customerName}</p>
                      </div>
                      <div className="flex gap-2">
                         <span className={`text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest ${['Approved', 'Completed'].includes(order.orderStatus) ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                           {order.orderStatus}
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'extensions' && (
            <motion.div key="extensions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Extensions</h2>
                <button 
                  onClick={() => setIsAddingExtension(true)}
                  className="bg-red-600 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-red-700 active:scale-95"
                >
                  + Add Extension
                </button>
              </div>

              {isAddingExtension && (
                <motion.form 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    createExtensionMutation.mutate({
                      name: (formData.get('name') as string) || '',
                      slug: ((formData.get('name') as string) || 'extension').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                      price: Number(formData.get('price')) || 0,
                      description: (formData.get('description') as string) || '',
                      category: (formData.get('category') as string) || '',
                      icon_url: (formData.get('icon_url') as string) || '',
                      status: 'published'
                    });
                  }}
                  className="p-6 bg-[#0A0A0A] border border-white/10 rounded-3xl space-y-4 mb-8"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Extension Icon</label>
                      <FileUpload 
                        bucket="extensions"
                        path="icons"
                        label="Icon"
                        onUploadComplete={(url) => {
                          const form = document.querySelector('form') as HTMLFormElement;
                          const iconInput = form.querySelector('input[name="icon_url"]') as HTMLInputElement;
                          if (iconInput) iconInput.value = url;
                        }}
                      />
                      <input type="hidden" name="icon_url" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Name</label>
                        <input name="name" placeholder="Extension Name" required className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-red-500/50 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Category</label>
                        <input name="category" placeholder="Category" required className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-red-500/50 outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Price (৳)</label>
                    <input name="price" placeholder="Price" type="number" required className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-red-500/50 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Description</label>
                    <textarea name="description" placeholder="Description" required className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-red-500/50 outline-none h-24" />
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setIsAddingExtension(false)} className="flex-1 py-3 bg-white/5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/10">Cancel</button>
                    <button type="submit" disabled={createExtensionMutation.isPending} className="flex-[2] py-3 bg-red-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-red-700 flex items-center justify-center gap-2">
                      {createExtensionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Extension"}
                    </button>
                  </div>
                </motion.form>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {extensions?.map((ext: any) => (
                  <div key={ext.id} className="p-6 bg-[#0A0A0A] border border-white/5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl">
                        {ext.icon_url ? <img src={ext.icon_url} className="w-8 h-8 object-contain" /> : '⚡'}
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteExtensionMutation.mutate(ext.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold">{ext.name}</h3>
                      <p className="text-xs text-white/40 line-clamp-2 mt-1">{ext.description}</p>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-sm font-black">৳{ext.price}</span>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{ext.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">User</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Role</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Joined</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {adminUsers?.map((user: any) => (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold overflow-hidden">
                              {user.avatar_url ? <img src={user.avatar_url} /> : user.full_name?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{user.full_name || 'No Name'}</p>
                              <p className="text-[10px] text-white/40">{user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white/40'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-white/40">
                          {user.created_at ? format(new Date(user.created_at), 'PP') : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-red-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Earnings', value: `৳${earningsData?.stats.total || 0}`, icon: TrendingUp, color: 'text-green-500' },
                  { label: 'Daily', value: `৳${earningsData?.stats.daily || 0}`, icon: Clock, color: 'text-blue-500' },
                  { label: 'Monthly', value: `৳${earningsData?.stats.monthly || 0}`, icon: ShoppingBag, color: 'text-purple-500' },
                  { label: 'Yearly', value: `৳${earningsData?.stats.yearly || 0}`, icon: BarChart3, color: 'text-red-500' },
                ].map((stat, i) => (
                  <div key={i} className="p-6 bg-[#0A0A0A] border border-white/5 rounded-3xl space-y-4">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{stat.label}</p>
                      <p className="text-2xl font-black">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h3 className="text-sm font-black uppercase tracking-widest">Earnings Breakdown</h3>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Order ID</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Customer</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {earningsData?.table.map((row: any) => (
                      <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-red-500">{row.orderId}</td>
                        <td className="px-6 py-4 text-xs font-bold">{row.customer}</td>
                        <td className="px-6 py-4 text-xs font-black">৳{row.price}</td>
                        <td className="px-6 py-4 text-xs text-white/40">{format(new Date(row.date), 'PP')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'licenses' && (
            <motion.div key="licenses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Product</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">License Key</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">User ID</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {licenses?.map((license: any) => (
                      <tr key={license.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-xs font-bold">{license.product_name}</td>
                        <td className="px-6 py-4">
                          <code className="text-[10px] bg-white/5 px-2 py-1 rounded text-red-500">{license.license_key}</code>
                        </td>
                        <td className="px-6 py-4 text-[10px] text-white/40">{license.user_id}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${license.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {license.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-20 text-center bg-[#0A0A0A] border border-white/5 rounded-3xl">
              <CreditCard className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h2 className="text-xl font-bold">Payment Methods</h2>
              <p className="text-white/40 text-sm mt-2">Manage your gateway configurations in Website Settings.</p>
            </motion.div>
          )}

          {activeTab === 'server_status' && (
            <motion.div key="server_status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md p-8 bg-[#0A0A0A] border border-white/5 rounded-3xl space-y-8">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                   <Zap className="w-6 h-6 text-red-500" />
                 </div>
                 <div>
                   <h2 className="text-xl font-black uppercase tracking-tight">Server Control</h2>
                   <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Manage site availability</p>
                 </div>
               </div>
               
               <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-xs font-bold uppercase tracking-widest">Status</span>
                    <select 
                      value={(queryClient.getQueryData(['app-settings']) as any)?.['server_status'] || 'Online'}
                      onChange={async (e) => {
                        try {
                          await updateAppSetting({ data: { key: 'server_status', value: e.target.value } } as any);
                          queryClient.invalidateQueries({ queryKey: ['app-settings'] });
                          toast.success('Server status updated');
                        } catch (err: any) {
                          console.error('Error updating server status:', err);
                          toast.error('Failed to update server status');
                        }
                      }}
                      className="bg-black border border-white/10 rounded-lg px-3 py-1 text-xs outline-none"
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Offline Message</label>
                    <textarea 
                      placeholder="Show this message when offline..."
                      defaultValue={(queryClient.getQueryData(['app-settings']) as any)?.['offline_message']}
                      onBlur={async (e) => {
                        const val = e.target.value;
                        const currentVal = (queryClient.getQueryData(['app-settings']) as any)?.['offline_message'];
                        if (val === currentVal) return;
                        
                        try {
                          await updateAppSetting({ data: { key: 'offline_message', value: val } } as any);
                          queryClient.invalidateQueries({ queryKey: ['app-settings'] });
                          toast.success('Offline message saved');
                        } catch (err: any) {
                          console.error('Error updating offline message:', err);
                          toast.error('Failed to save offline message');
                        }
                      }}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-medium focus:border-red-500/50 outline-none h-32 resize-none"
                    />
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Binance ID (Pay ID)', key: 'binance_id' },
                  { label: 'Binance Address (USDT)', key: 'binance_address' },
                  { label: 'Binance Network (e.g. BEP20)', key: 'binance_network' },
                  { label: 'bKash Number', key: 'bkash_number' },
                  { label: 'Nagad Number', key: 'nagad_number' },
                  { label: 'USDT Rate', key: 'usdt_rate' },
                ].map((field) => (
                  <div key={field.key} className="p-6 bg-[#0A0A0A] border border-white/5 rounded-3xl space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">{field.label}</label>
                    <input 
                      placeholder={`Enter ${field.label}`}
                      defaultValue={(queryClient.getQueryData(['app-settings']) as any)?.[field.key]}
                      onBlur={async (e) => {
                        const val = e.target.value;
                        const currentVal = (queryClient.getQueryData(['app-settings']) as any)?.[field.key];
                        if (val === currentVal) return;
                        
                        try {
                          await updateAppSetting({ data: { key: field.key, value: val } } as any);
                          queryClient.invalidateQueries({ queryKey: ['app-settings'] });
                          toast.success(`${field.label} updated`);
                        } catch (err: any) {
                          console.error(`Error updating ${field.key}:`, err);
                          toast.error(`Failed to update ${field.label}`);
                        }
                      }}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-red-500/50 outline-none"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 space-y-8 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tight">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/5 rounded-full"><XCircle className="w-6 h-6 text-white/40" /></button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Customer</label>
                  <p className="font-bold">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Product</label>
                  <p className="font-bold">{selectedOrder.productName}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Price</label>
                  <p className="font-bold">৳{selectedOrder.price}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Email</label>
                  <p className="font-bold">{selectedOrder.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">WhatsApp</label>
                  <p className="font-bold">{selectedOrder.whatsapp}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Payment Method</label>
                  <p className="font-bold uppercase">{selectedOrder.paymentMethod}</p>
                </div>
              </div>
            </div>

            {(selectedOrder.transaction_id || selectedOrder.transactionId) && (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Transaction ID</label>
                <p className="font-mono text-sm text-red-500 font-bold">{selectedOrder.transaction_id || selectedOrder.transactionId}</p>
              </div>
            )}

            {(selectedOrder.screenshot_url || selectedOrder.screenshotUrl) && (
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2 block">Payment Proof</label>
                <div className="relative group overflow-hidden rounded-2xl border border-white/10">
                  <img 
                    src={(selectedOrder.screenshot_url || selectedOrder.screenshotUrl)} 
                    className="w-full object-cover" 
                    alt="Payment Screenshot" 
                  />
                  <a 
                    href={(selectedOrder.screenshot_url || selectedOrder.screenshotUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                  >
                    <Eye className="w-4 h-4" /> View Full Image
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20">License Name</label>
                  <input 
                    defaultValue={selectedOrder.licenseName} 
                    onBlur={(e) => {
                      if (e.target.value !== selectedOrder.licenseName) {
                        updateOrderMutation.mutate({ orderId: selectedOrder.id, licenseName: e.target.value, status: selectedOrder.orderStatus || selectedOrder.status });
                      }
                    }}
                    placeholder="e.g. Lifetime"
                    className="w-full bg-white/5 border border-white/5 p-3 rounded-xl outline-none text-xs" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20">License Key</label>
                  <input 
                    defaultValue={selectedOrder.licenseKey} 
                    onBlur={(e) => {
                      if (e.target.value !== selectedOrder.licenseKey) {
                        updateOrderMutation.mutate({ orderId: selectedOrder.id, licenseKey: e.target.value, status: selectedOrder.orderStatus || selectedOrder.status });
                      }
                    }}
                    className="w-full bg-white/5 border border-white/5 p-3 rounded-xl outline-none text-xs" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Download Link</label>
                <input 
                  defaultValue={selectedOrder.downloadLink} 
                  onBlur={(e) => {
                    if (e.target.value !== selectedOrder.downloadLink) {
                      updateOrderMutation.mutate({ orderId: selectedOrder.id, downloadLink: e.target.value, status: selectedOrder.orderStatus || selectedOrder.status });
                    }
                  }}
                  className="w-full bg-white/5 border border-white/5 p-3 rounded-xl outline-none text-xs" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Expire Date</label>
                <input 
                  type="datetime-local"
                  defaultValue={selectedOrder.expireDate ? new Date(selectedOrder.expireDate).toISOString().slice(0, 16) : ''}
                  onBlur={(e) => {
                    if (e.target.value !== (selectedOrder.expireDate ? new Date(selectedOrder.expireDate).toISOString().slice(0, 16) : '')) {
                      updateOrderMutation.mutate({ orderId: selectedOrder.id, expireDate: e.target.value, status: selectedOrder.orderStatus || selectedOrder.status });
                    }
                  }}
                  className="w-full bg-white/5 border border-white/5 p-3 rounded-xl outline-none text-xs" 
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => updateOrderMutation.mutate({ orderId: selectedOrder.id, status: 'Approved' })} 
                  className="flex-1 py-4 bg-green-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-700 transition-all shadow-xl shadow-green-600/20"
                >
                  Approve Order
                </button>
                <button 
                  onClick={() => updateOrderMutation.mutate({ orderId: selectedOrder.id, status: 'Rejected' })} 
                  className="flex-1 py-4 bg-red-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
                >
                  Reject Order
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}