import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import { 
  BarChart3, Package, Users, ShoppingBag, Shield, Settings, 
  Plus, Search, CheckCircle2, XCircle, CreditCard, Download, 
  TrendingUp, Clock, Edit, Trash2, Check, Copy, User, Mail, 
  Phone, Zap, Eye, Filter, Loader2, ExternalLink
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminLicenses, updateLicenseAdmin, createLicenseAdmin } from '@/lib/licenses.functions';
import { deleteExtension, updateExtension, createExtension } from '@/lib/extensions.functions';
import { getAdminOrders, updateOrderStatus, createManualOrder, getEarningsStats } from '@/lib/orders.functions';
import { getAdminUsers, toggleUserStatus, removeUser } from '@/lib/users.functions';
import { getAppSettings, updateAppSetting } from '@/lib/settings.functions';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { FileUpload } from '@/components/admin/FileUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { firestore } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';

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
  const { user, isAdmin, initialized } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [realtimeOrders, setRealtimeOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialized && (!user || !isAdmin)) {
      navigate({ to: '/admin', replace: true });
    }
  }, [user, isAdmin, initialized, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRealtimeOrders(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data()['createdAt']?.toDate?.()?.toISOString() || doc.data()['createdAt'],
        expireDate: doc.data()['expireDate']?.toDate?.()?.toISOString() || doc.data()['expireDate']
      })));
    });
    return () => unsubscribe();
  }, [isAdmin]);

  const { data: earningsData } = useQuery({
    queryKey: ['admin-earnings'],
    queryFn: () => getEarningsStats(),
    enabled: activeTab === 'analytics' || activeTab === 'dashboard',
  });

  const { data: extensions, isLoading: extensionsLoading } = useQuery({
    queryKey: ['admin-extensions'],
    queryFn: async () => {
      const { data } = await supabaseAdmin.from('extensions').select('*').order('created_at', { ascending: false });
      return data || [];
    },
    enabled: activeTab === 'extensions',
  });

  const { data: adminUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAdminUsers(),
    enabled: activeTab === 'users',
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => createManualOrder({ data }),
    onSuccess: (result) => {
      toast.success('অর্ডার সফলভাবে তৈরি হয়েছে');
      window.prompt('অর্ডার আইডি (কপি করুন):', result.orderId);
      setActiveTab('orders');
    },
    onError: (err: any) => toast.error(err.message || 'অর্ডার তৈরি করতে ব্যর্থ হয়েছে')
  });

  const updateOrderMutation = useMutation({
    mutationFn: (data: any) => updateOrderStatus({ data }),
    onSuccess: () => {
      toast.success('অর্ডার আপডেট করা হয়েছে');
      setSelectedOrder(null);
    },
    onError: (err: any) => toast.error(err.message || 'আপডেট ব্যর্থ হয়েছে')
  });

  const deleteExtensionMutation = useMutation({
    mutationFn: (id: string) => deleteExtension({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-extensions'] });
      toast.success('Extension deleted');
    }
  });

  const filteredOrders = useMemo(() => {
    return realtimeOrders.filter(order => {
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = 
        order.orderId?.toLowerCase().includes(searchStr) ||
        order.email?.toLowerCase().includes(searchStr) ||
        order.uid?.toLowerCase().includes(searchStr) ||
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

      <main className="flex-1 p-10 bg-[#050505]">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black uppercase">{activeTab}</h1>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="bg-[#0A0A0A] border border-white/5 rounded-2xl py-3 px-6 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {realtimeOrders.filter(o => o.orderId?.includes(searchQuery)).map(order => (
                <div key={order.id} className="p-6 bg-[#0A0A0A] border border-white/5 rounded-2xl flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{order.orderId} - {order.customerName}</h3>
                    <p className="text-xs text-white/40">{order.productName} | ৳{order.price}</p>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'Approved' })} className="px-4 py-2 bg-green-600 text-xs font-bold rounded-xl">Approve</button>
                     <button onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'Rejected' })} className="px-4 py-2 bg-red-600 text-xs font-bold rounded-xl">Reject</button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'create_order' && (
            <motion.form key="create_order" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createOrderMutation.mutate({
                uid: formData.get('uid'),
                customerName: formData.get('name'),
                email: formData.get('email'),
                whatsapp: formData.get('whatsapp'),
                productName: formData.get('product'),
                category: "General",
                price: Number(formData.get('price')),
                paymentMethod: "Manual"
              });
            }} className="p-8 bg-[#0A0A0A] border border-white/5 rounded-2xl space-y-4 max-w-lg">
              <input name="uid" placeholder="UID" required className="w-full bg-white/5 p-3 rounded-xl" />
              <input name="name" placeholder="Name" required className="w-full bg-white/5 p-3 rounded-xl" />
              <input name="email" placeholder="Email" required className="w-full bg-white/5 p-3 rounded-xl" />
              <input name="whatsapp" placeholder="WhatsApp" required className="w-full bg-white/5 p-3 rounded-xl" />
              <input name="product" placeholder="Product" required className="w-full bg-white/5 p-3 rounded-xl" />
              <input name="price" placeholder="Price" required type="number" className="w-full bg-white/5 p-3 rounded-xl" />
              <button type="submit" className="w-full py-3 bg-red-600 rounded-xl font-bold">Create Order</button>
            </motion.form>
          )}

          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-20 bg-[#0A0A0A] border border-white/5 rounded-2xl">
               <h2 className="text-xl font-bold">Total Earnings: ৳{earningsData?.stats.total || 0}</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}