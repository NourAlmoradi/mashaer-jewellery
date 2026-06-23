"use client";

import { useMemo, useState } from "react";
import { Search, Mail, Phone, Package } from "lucide-react";
import { useT } from "@/lib/useT";
import { useOrders } from "@/lib/useOrders";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import type { Order } from "@/types";

type Customer = {
  email: string;
  name: string;
  phone: string;
  city: string;
  emirate: string;
  orderCount: number;
  lastOrderAt: string;
  totalSpent: number;
  ordersByStatus: Record<string, number>;
};

function aggregateCustomers(orders: Order[]): Customer[] {
  const map = new Map<string, Customer>();
  for (const o of orders) {
    const email = (o.email || o.shippingAddress?.email || "").toLowerCase();
    if (!email) continue;
    const existing = map.get(email);
    const status = o.status || "pending";
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += o.total;
      existing.ordersByStatus[status] =
        (existing.ordersByStatus[status] ?? 0) + 1;
      if (o.createdAt > existing.lastOrderAt) {
        existing.lastOrderAt = o.createdAt;
        // Keep the most-recent contact info as the canonical record
        existing.name = o.customerName || existing.name;
        existing.phone = o.shippingAddress?.phone || existing.phone;
        existing.city = o.shippingAddress?.city || existing.city;
        existing.emirate = o.shippingAddress?.emirate || existing.emirate;
      }
    } else {
      map.set(email, {
        email,
        name: o.customerName || "—",
        phone: o.shippingAddress?.phone || "",
        city: o.shippingAddress?.city || "",
        emirate: o.shippingAddress?.emirate || "",
        orderCount: 1,
        lastOrderAt: o.createdAt,
        totalSpent: o.total,
        ordersByStatus: { [status]: 1 },
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

export default function AdminCustomers() {
  const { locale } = useT();
  const orders = useOrders();
  const [query, setQuery] = useState("");

  const customers = useMemo(() => aggregateCustomers(orders), [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.email.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q),
    );
  }, [customers, query]);

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgOrderValue = orders.length === 0 ? 0 : totalRevenue / orders.length;

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          {locale === "ar" ? "العملاء" : "Customers"}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {locale === "ar"
            ? "مستخرجة تلقائياً من الطلبات (لا توجد قاعدة بيانات بعد)."
            : "Aggregated automatically from orders (no users database yet)."}
        </p>
      </div>

      {/* Stat tiles */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label={locale === "ar" ? "إجمالي العملاء" : "Total customers"}
          value={String(customers.length)}
        />
        <Stat
          label={locale === "ar" ? "متوسط قيمة الطلب" : "Avg order value"}
          value={formatPrice(avgOrderValue, locale)}
        />
        <Stat
          label={locale === "ar" ? "إجمالي الإيرادات" : "Total revenue"}
          value={formatPrice(totalRevenue, locale)}
        />
      </div>

      {/* Search */}
      <div className="mt-6 relative w-full max-w-xs">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            locale === "ar"
              ? "ابحث بالاسم أو البريد"
              : "Search by name or email"
          }
          className="w-full rounded-md border border-white/10 bg-[#141414] py-3 ps-10 pe-3 text-sm text-white placeholder:text-white/40 focus:border-[#c9a96e]/40 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-[#141414]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/40">
                <th className="px-4 py-3 font-medium">
                  {locale === "ar" ? "الاسم" : "Customer"}
                </th>
                <th className="px-4 py-3 font-medium">
                  {locale === "ar" ? "تواصل" : "Contact"}
                </th>
                <th className="px-4 py-3 font-medium">
                  {locale === "ar" ? "العنوان" : "Location"}
                </th>
                <th className="px-4 py-3 font-medium text-center">
                  {locale === "ar" ? "الطلبات" : "Orders"}
                </th>
                <th className="px-4 py-3 font-medium text-right">
                  {locale === "ar" ? "الإجمالي" : "Spent"}
                </th>
                <th className="px-4 py-3 font-medium">
                  {locale === "ar" ? "آخر طلب" : "Last order"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-white/40"
                  >
                    {locale === "ar" ? "لا يوجد عملاء بعد" : "No customers yet"}
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr
                  key={c.email}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-[11px] text-white/40">{c.email}</p>
                  </td>
                  <td className="px-4 py-4 text-white/70">
                    <p className="flex items-center gap-1.5 text-xs">
                      <Mail className="h-3 w-3 text-white/40" /> {c.email}
                    </p>
                    {c.phone && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs">
                        <Phone className="h-3 w-3 text-white/40" /> {c.phone}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-white/60">
                    {[c.city, c.emirate].filter(Boolean).join("، ") || "—"}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c9a96e]/15 px-2.5 py-1 text-xs font-semibold text-[#c9a96e] ring-1 ring-[#c9a96e]/30">
                      <Package className="h-3 w-3" /> {c.orderCount}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-white">
                    {formatPrice(c.totalSpent, locale)}
                  </td>
                  <td className="px-4 py-4 text-xs text-white/50">
                    {formatDate(c.lastOrderAt, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-lg border border-white/10 bg-[#141414] p-4")}>
      <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
