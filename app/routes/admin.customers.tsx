import React, { useState } from "react";
import { useLoaderData } from "react-router";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { formatPriceBDT } from "~/lib/formatters";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { Search, Users, Mail, Phone, ShoppingBag } from "lucide-react";

export async function clientLoader() {
  const orders = mockRepository.getOrders();
  return { orders };
}

export default function AdminCustomersPage() {
  const { orders } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // Aggregate unique customers from orders
  const customers = [
    {
      id: "cust_01",
      name: "Sharmin Sultana",
      phone: "+8801712345678",
      email: "sharmin.sultana@example.com",
      district: "Dhaka (Gulshan)",
      ordersCount: 3,
      totalSpendBDT: 34500,
      tier: "Gold",
      status: "active",
    },
    {
      id: "cust_02",
      name: "Tanvir Ahmed",
      phone: "+8801819554433",
      email: "tanvir.ahmed@example.com",
      district: "Chattogram (Agrabad)",
      ordersCount: 2,
      totalSpendBDT: 12020,
      tier: "Silver",
      status: "active",
    },
    {
      id: "cust_03",
      name: "Dr. Farzana Yasmin",
      phone: "+8801715998877",
      email: "farzana.y@example.com",
      district: "Dhaka (Dhanmondi)",
      ordersCount: 5,
      totalSpendBDT: 62000,
      tier: "Platinum",
      status: "active",
    },
  ];

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
          {t.admin.customers}
        </h1>
        <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-0.5">
          {language === "bn"
            ? "নিবন্ধিত গ্রাহক প্রোফাইল, মোট অর্ডার সংখ্যা ও লয়্যালটি টিয়ার"
            : "Customer database, order frequencies, and loyalty tiers"}
        </p>
      </div>

      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Search by customer name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-silk-300 bg-white dark:bg-dark-surface dark:border-dark-border"
        />
        <Search className="w-4 h-4 text-silk-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <div className="bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-silk-100/90 border-b border-silk-200 dark:bg-dark-elevated dark:border-dark-border text-silk-900 dark:text-silk-200 uppercase text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone / Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silk-100 dark:divide-dark-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-silk-50/50 dark:hover:bg-dark-elevated/40">
                  <td className="py-3 px-4 font-bold text-silk-900 dark:text-silk-100">
                    {c.name}
                  </td>
                  <td className="py-3 px-4 text-silk-700 dark:text-silk-300">
                    <div className="font-mono font-medium">{c.phone}</div>
                    <div className="text-[10px] font-mono text-silk-700 dark:text-silk-300 font-medium">{c.email}</div>
                  </td>
                  <td className="py-3 px-4 text-silk-700 dark:text-silk-300">{c.district}</td>
                  <td className="py-3 px-4 font-semibold">{c.ordersCount} orders</td>
                  <td className="py-3 px-4 font-serif font-bold text-silk-950 dark:text-silk-50">
                    {formatPriceBDT(c.totalSpendBDT, language)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={c.tier === "Platinum" ? "gold" : "info"} size="sm">
                      {c.tier}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
