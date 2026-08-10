import { createFileRoute } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  PlusCircle, 
  Package, 
  Users, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  Server, 
  Settings 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    title: "Admin Dashboard - Cloud Site",
    meta: [
      { name: "description", content: "Manage your site, orders, products, and more from one central dashboard." },
      { property: "og:title", content: "Admin Dashboard" },
      { property: "og:description", content: "Full-featured site management dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [orderName, setOrderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Orders", icon: ShoppingCart },
    { name: "Create Order", icon: PlusCircle },
    { name: "Products", icon: Package },
    { name: "Customers", icon: Users },
    { name: "Payments", icon: CreditCard },
    { name: "Earnings", icon: TrendingUp },
    { name: "Licenses", icon: CheckCircle2 },
    { name: "Server Status", icon: Server },
    { name: "Website Settings", icon: Settings },
  ];

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderName.trim()) {
      toast.error("Please enter a name for the order");
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Order created successfully!");
      setOrderName("");
      setIsSubmitting(false);
    }, 1000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Create Order":
        return (
          <div className="max-w-md mx-auto mt-10">
            <Card>
              <CardHeader>
                <CardTitle>Create New Order</CardTitle>
                <CardDescription>Enter the details below to place a new order.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOrder} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Customer Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter customer name" 
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Create Order"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        );
      case "Dashboard":
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Revenue", value: "$45,231.89", trend: "+20.1% from last month" },
              { label: "Orders", value: "+2350", trend: "+180.1% from last month" },
              { label: "Active Users", value: "+12,234", trend: "+19% from last month" },
              { label: "Active Licenses", value: "573", trend: "+201 since last hour" },
            ].map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.trend}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
            <p className="text-xl font-medium">{activeTab} Section</p>
            <p>This content is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 py-6 text-lg font-bold text-primary">Cloud Site Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        onClick={() => setActiveTab(item.name)}
                        isActive={activeTab === item.name}
                        tooltip={item.name}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-lg font-semibold">{activeTab}</h1>
            </div>
          </header>
          <main className="p-4 md:p-6 lg:p-8">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}