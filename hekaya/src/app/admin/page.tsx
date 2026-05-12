"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  DollarSign,
  QrCode,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import { useT } from "@/lib/useT";
import { useDataStore } from "@/stores/data.store";
import { mockOrders } from "@/data/products";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#d4a437",
  paid: "#8b7cf6",
  processing: "#3b82f6",
  shipped: "#a78bfa",
  delivered: "#5e7c5e",
  cancelled: "#c45b5b",
};

const STATUS_PILL: Record<OrderStatus, string> = {
  pending: "bg-amber-200/15 text-amber-300 ring-amber-300/30",
  paid: "bg-violet-300/15 text-violet-300 ring-violet-300/30",
  processing: "bg-blue-300/15 text-blue-300 ring-blue-300/30",
  shipped: "bg-purple-300/15 text-purple-300 ring-purple-300/30",
  delivered: "bg-emerald-300/15 text-emerald-300 ring-emerald-300/30",
  cancelled: "bg-rose-300/15 text-rose-300 ring-rose-300/30",
};

export default function AdminDashboard() {
  const { t, locale } = useT();
  const storeOrders = useDataStore((s) => s.orders);
  const memories = useDataStore((s) => s.memories);

  const allOrders = [...storeOrders, ...mockOrders];
  const totalRevenue =
    allOrders.reduce((s, o) => s + o.total, 0) +
    // Add baseline mock revenue so dashboard has realistic numbers
    24600;
  const totalOrders = allOrders.length + 140;
  const activeQr = Object.keys(memories).length + 87;
  const newCustomers = 23;

  const stats = [
    {
      label: t("admin_total_orders"),
      value: totalOrders.toLocaleString(),
      delta: 12,
      Icon: Package,
    },
    {
      label: t("admin_total_revenue"),
      value: formatPrice(totalRevenue, locale),
      delta: 18,
      Icon: DollarSign,
    },
    {
      label: t("admin_active_qr"),
      value: activeQr.toLocaleString(),
      delta: 7,
      Icon: QrCode,
    },
    {
      label: t("admin_new_customers"),
      value: newCustomers.toLocaleString(),
      delta: -3,
      Icon: Users,
    },
  ];

  // Orders-by-status data (real counts + mocked baseline so chart isn't empty)
  const statusData = useMemo(() => {
    const baseline: Record<string, number> = {
      Pending: 8,
      Processing: 27,
      Shipped: 45,
      Delivered: 60,
    };
    const labels: Record<string, OrderStatus> = {
      Pending: "pending",
      Processing: "processing",
      Shipped: "shipped",
      Delivered: "delivered",
    };
    for (const o of allOrders) {
      const key = Object.keys(labels).find((k) => labels[k] === o.status);
      if (key) baseline[key] = (baseline[key] ?? 0) + 1;
    }
    return Object.entries(baseline).map(([name, value]) => ({
      name,
      value,
      fill: STATUS_COLORS[labels[name]],
    }));
  }, [allOrders]);

  // Revenue trend: 12-month curve
  const revenueData = useMemo(() => {
    const months =
      locale === "ar"
        ? [
            "يناير",
            "فبراير",
            "مارس",
            "أبريل",
            "مايو",
            "يونيو",
            "يوليو",
            "أغسطس",
            "سبتمبر",
            "أكتوبر",
            "نوفمبر",
            "ديسمبر",
          ]
        : [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
    const baseline = [
      3200, 3800, 4100, 5200, 4700, 5600, 7100, 7800, 6500, 8200, 9100, 8700,
    ];
    return months.map((m, i) => ({ month: m, revenue: baseline[i] }));
  }, [locale]);

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          {t("admin_dashboard")}
        </h1>
        <p className="mt-1 text-sm text-white/50">{t("admin_subtitle")}</p>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => {
          const positive = s.delta >= 0;
          const TrendIcon = positive ? TrendingUp : TrendingDown;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/5 bg-[#141414] p-5"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-white/[0.04] text-[#c9a96e]">
                  <s.Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-semibold",
                    positive ? "text-emerald-400" : "text-rose-400",
                  )}
                >
                  <TrendIcon className="h-3.5 w-3.5" />
                  {positive ? "+" : ""}
                  {s.delta}%
                </span>
              </div>
              <p className="mt-5 font-display text-3xl font-semibold text-white">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-white/50">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-white/5 bg-[#141414] p-5">
          <h2 className="font-display text-lg font-semibold text-white">
            {t("admin_orders_by_status")}
          </h2>
          <p className="mt-1 text-sm text-white/50">
            {t("admin_orders_by_status_sub")}
          </p>
          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                data={statusData}
                margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{
                    background: "#0a0a0a",
                    border: "1px solid rgba(201,169,110,0.3)",
                    borderRadius: 8,
                    color: "#c9a96e",
                  }}
                  labelStyle={{ color: "#fff", fontWeight: 600 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-white/5 bg-[#141414] p-5">
          <h2 className="font-display text-lg font-semibold text-white">
            {t("admin_revenue_trend")}
          </h2>
          <p className="mt-1 text-sm text-white/50">
            {t("admin_revenue_trend_sub")}
          </p>
          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
              >
                <defs>
                  <linearGradient id="revGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9a96e" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#c9a96e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(201,169,110,0.4)" }}
                  contentStyle={{
                    background: "#0a0a0a",
                    border: "1px solid rgba(201,169,110,0.3)",
                    borderRadius: 8,
                    color: "#c9a96e",
                  }}
                  labelStyle={{ color: "#fff", fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c9a96e"
                  strokeWidth={2}
                  fill="url(#revGold)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-6 rounded-xl border border-white/5 bg-[#141414] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">
            {t("admin_recent_orders")}
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-[#c9a96e] hover:underline"
          >
            {t("view_all")}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-3 py-3 text-start font-medium">
                  {t("order")}
                </th>
                <th className="px-3 py-3 text-start font-medium">
                  {t("date")}
                </th>
                <th className="px-3 py-3 text-start font-medium">
                  {t("items")}
                </th>
                <th className="px-3 py-3 text-start font-medium">
                  {t("total")}
                </th>
                <th className="px-3 py-3 text-start font-medium">
                  {t("status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allOrders.slice(0, 5).map((o) => {
                const itemsCount = o.items.reduce((s, i) => s + i.qty, 0);
                return (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-4 font-mono text-sm font-bold text-white">
                      {o.id}
                    </td>
                    <td className="px-3 py-4 text-white/60">
                      {formatDate(o.createdAt, locale)}
                    </td>
                    <td className="px-3 py-4 text-white/80">{itemsCount}</td>
                    <td className="px-3 py-4 font-semibold text-white">
                      {formatPrice(o.total, locale)}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
                          STATUS_PILL[o.status],
                        )}
                      >
                        {t(`status_${o.status}` as never)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
