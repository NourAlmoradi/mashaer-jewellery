"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Bell as BellRaw,
  Globe as GlobeRaw,
  QrCode as QrCodeRaw,
  Store as StoreRaw,
} from "lucide-react";
import { useT } from "@/lib/useT";
import {
  useAdminSettings,
  type AdminStoreInfo,
  type AdminQrConfig,
  type AdminShipping,
  type AdminNotifications,
} from "@/stores/adminSettings.store";
import { cn } from "@/lib/utils";

type TabId = "store" | "qr" | "shipping" | "notifications";

export default function AdminSettingsPage() {
  const { t } = useT();
  const [tab, setTab] = useState<TabId>("store");

  const tabs: {
    id: TabId;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "store", label: t("admin_tab_store"), Icon: StorefrontIcon },
    { id: "qr", label: t("admin_tab_qr"), Icon: QrCodeIcon },
    { id: "shipping", label: t("admin_tab_shipping"), Icon: GlobeIcon },
    {
      id: "notifications",
      label: t("admin_tab_notifications"),
      Icon: BellIcon,
    },
  ];

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          {t("admin_settings")}
        </h1>
        <p className="mt-1 text-sm text-white/50">{t("admin_settings_sub")}</p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-white/10">
        {tabs.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition",
                active
                  ? "border-[#c9a96e] text-[#c9a96e]"
                  : "border-transparent text-white/50 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tab === "store" && <StoreTab />}
        {tab === "qr" && <QrTab />}
        {tab === "shipping" && <ShippingTab />}
        {tab === "notifications" && <NotificationsTab />}
      </div>
    </>
  );
}

/* ============== STORE TAB ============== */
function StoreTab() {
  const { t } = useT();
  const store = useAdminSettings((s) => s.store);
  const setStore = useAdminSettings((s) => s.setStore);
  const [form, setForm] = useState<AdminStoreInfo>(store);

  const update = <K extends keyof AdminStoreInfo>(k: K, v: AdminStoreInfo[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    setStore(form);
    toast.success(t("admin_settings_saved"));
  };

  return (
    <SettingsCard title={t("admin_store_info")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t("admin_store_name_en")}
          value={form.nameEn}
          onChange={(v) => update("nameEn", v)}
        />
        <Input
          label={t("admin_store_name_ar")}
          value={form.nameAr}
          onChange={(v) => update("nameAr", v)}
          dir="rtl"
        />
        <Input
          label={t("admin_tagline_en")}
          value={form.taglineEn}
          onChange={(v) => update("taglineEn", v)}
        />
        <Input
          label={t("admin_tagline_ar")}
          value={form.taglineAr}
          onChange={(v) => update("taglineAr", v)}
          dir="rtl"
        />
        <Input
          label={t("admin_contact_email")}
          value={form.email}
          onChange={(v) => update("email", v)}
          type="email"
        />
        <Input
          label={t("admin_phone")}
          value={form.phone}
          onChange={(v) => update("phone", v)}
        />
        <Input
          label={t("admin_whatsapp")}
          value={form.whatsapp}
          onChange={(v) => update("whatsapp", v)}
        />
        <Input
          label={t("admin_instagram")}
          value={form.instagram}
          onChange={(v) => update("instagram", v)}
        />
        <div className="sm:col-span-2">
          <Input
            label={t("admin_business_address")}
            value={form.address}
            onChange={(v) => update("address", v)}
          />
        </div>
      </div>
      <SaveButton onClick={save} label={t("admin_save_store")} />
    </SettingsCard>
  );
}

/* ============== QR TAB ============== */
function QrTab() {
  const { t } = useT();
  const qr = useAdminSettings((s) => s.qr);
  const setQr = useAdminSettings((s) => s.setQr);
  const [form, setForm] = useState<AdminQrConfig>(qr);

  const update = <K extends keyof AdminQrConfig>(k: K, v: AdminQrConfig[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    setQr(form);
    toast.success(t("admin_settings_saved"));
  };

  return (
    <SettingsCard title={t("admin_qr_config")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorInput
          label={t("admin_qr_default_color")}
          value={form.defaultColor}
          onChange={(v) => update("defaultColor", v)}
        />
        <ColorInput
          label={t("admin_qr_bg_color")}
          value={form.bgColor}
          onChange={(v) => update("bgColor", v)}
        />
        <div>
          <FieldLabel>{t("admin_qr_max_photos")}</FieldLabel>
          <select
            value={form.maxPhotos}
            onChange={(e) => update("maxPhotos", Number(e.target.value))}
            className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {t("admin_photos_unit")}
              </option>
            ))}
          </select>
        </div>
        <NumberInput
          label={t("admin_qr_max_message")}
          value={form.maxMessageLength}
          onChange={(v) => update("maxMessageLength", v)}
        />
      </div>

      <div className="mt-6 space-y-3">
        <ToggleRow
          label={t("admin_qr_auto")}
          checked={form.autoGenerate}
          onChange={(v) => update("autoGenerate", v)}
        />
        <ToggleRow
          label={t("admin_qr_require_pin")}
          checked={form.requirePin}
          onChange={(v) => update("requirePin", v)}
        />
      </div>

      <SaveButton onClick={save} label={t("admin_save_qr")} />
    </SettingsCard>
  );
}

/* ============== SHIPPING TAB ============== */
function ShippingTab() {
  const { t } = useT();
  const shipping = useAdminSettings((s) => s.shipping);
  const setShipping = useAdminSettings((s) => s.setShipping);
  const [form, setForm] = useState<AdminShipping>(shipping);

  const update = <K extends keyof AdminShipping>(k: K, v: AdminShipping[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    setShipping(form);
    toast.success(t("admin_settings_saved"));
  };

  return (
    <SettingsCard title={t("admin_shipping_rates")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          suffix={t("admin_aed")}
          label={t("admin_shipping_dubai")}
          value={form.dubai}
          onChange={(v) => update("dubai", v)}
        />
        <NumberInput
          suffix={t("admin_aed")}
          label={t("admin_shipping_abudhabi")}
          value={form.abuDhabi}
          onChange={(v) => update("abuDhabi", v)}
        />
        <NumberInput
          suffix={t("admin_aed")}
          label={t("admin_shipping_sharjah")}
          value={form.sharjah}
          onChange={(v) => update("sharjah", v)}
        />
        <NumberInput
          suffix={t("admin_aed")}
          label={t("admin_shipping_other")}
          value={form.otherEmirates}
          onChange={(v) => update("otherEmirates", v)}
        />
        <NumberInput
          suffix={t("admin_aed")}
          label={t("admin_shipping_gcc")}
          value={form.gcc}
          onChange={(v) => update("gcc", v)}
        />
        <NumberInput
          suffix={t("admin_days")}
          label={t("admin_shipping_processing_days")}
          value={form.processingDays}
          onChange={(v) => update("processingDays", v)}
        />
      </div>
      <SaveButton onClick={save} label={t("admin_save_shipping")} />
    </SettingsCard>
  );
}

/* ============== NOTIFICATIONS TAB ============== */
function NotificationsTab() {
  const { t } = useT();
  const notif = useAdminSettings((s) => s.notifications);
  const setNotif = useAdminSettings((s) => s.setNotifications);
  const [form, setForm] = useState<AdminNotifications>(notif);

  const update = <K extends keyof AdminNotifications>(
    k: K,
    v: AdminNotifications[K],
  ) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    setNotif(form);
    toast.success(t("admin_settings_saved"));
  };

  const rows: { key: keyof AdminNotifications; label: string; desc: string }[] =
    [
      {
        key: "newOrder",
        label: t("admin_notif_new_order"),
        desc: t("admin_notif_new_order_d"),
      },
      {
        key: "qrCreated",
        label: t("admin_notif_qr_created"),
        desc: t("admin_notif_qr_created_d"),
      },
      {
        key: "lowStock",
        label: t("admin_notif_low_stock"),
        desc: t("admin_notif_low_stock_d"),
      },
      {
        key: "customerMessage",
        label: t("admin_notif_customer_msg"),
        desc: t("admin_notif_customer_msg_d"),
      },
      {
        key: "weeklyReport",
        label: t("admin_notif_weekly"),
        desc: t("admin_notif_weekly_d"),
      },
    ];

  return (
    <SettingsCard title={t("admin_email_notifications")}>
      <div className="space-y-3">
        {rows.map((r) => (
          <ToggleRow
            key={r.key}
            label={r.label}
            description={r.desc}
            checked={form[r.key]}
            onChange={(v) => update(r.key, v)}
          />
        ))}
      </div>
      <SaveButton onClick={save} label={t("admin_save_notifications")} />
    </SettingsCard>
  );
}

/* ============== UI HELPERS ============== */
function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#141414] p-6">
      <h2 className="mb-4 font-display text-xl font-semibold text-white">
        {title}
      </h2>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
      {children}
    </label>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        dir={dir}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#c9a96e]/40 focus:outline-none"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none",
            suffix && "pe-14",
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium uppercase tracking-wider text-white/40">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-10 w-12 cursor-pointer rounded-md border border-white/10 bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="flex-1 rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 font-mono text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
        />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-[#0a0a0a] px-4 py-3 ring-1 ring-white/5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-white/50">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-emerald-500" : "bg-white/10",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
            checked ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function SaveButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <div className="mt-6 flex justify-end">
      <button
        onClick={onClick}
        className="rounded-md bg-[#c9a96e] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#b8985d]"
      >
        {label}
      </button>
    </div>
  );
}

function StorefrontIcon(p: { className?: string }) {
  return <StoreRaw {...p} />;
}
function QrCodeIcon(p: { className?: string }) {
  return <QrCodeRaw {...p} />;
}
function GlobeIcon(p: { className?: string }) {
  return <GlobeRaw {...p} />;
}
function BellIcon(p: { className?: string }) {
  return <BellRaw {...p} />;
}
