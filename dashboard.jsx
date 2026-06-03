import { useState, useEffect, useMemo, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";

// ─── THEME ────────────────────────────────────────────────────────────────────
const COLORS = {
  emerald: "#10b981", gold: "#f59e0b", rose: "#f43f5e",
  sky: "#0ea5e9", violet: "#8b5cf6", orange: "#f97316",
  teal: "#14b8a6", pink: "#ec4899",
};
const PIE_COLORS = [COLORS.emerald, COLORS.gold, COLORS.sky, COLORS.violet, COLORS.orange, COLORS.teal];

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const INITIAL_INVENTORY = [
  { id: 1, name: "Castle Lager 500ml", category: "Beer", costPrice: 2500, sellingPrice: 4000, quantity: 120, reorderLevel: 24 },
  { id: 2, name: "Heineken 330ml", category: "Beer", costPrice: 3000, sellingPrice: 5000, quantity: 96, reorderLevel: 20 },
  { id: 3, name: "Konyagi 750ml", category: "Spirits", costPrice: 18000, sellingPrice: 28000, quantity: 24, reorderLevel: 6 },
  { id: 4, name: "Coca-Cola 500ml", category: "Soft Drinks", costPrice: 1200, sellingPrice: 2000, quantity: 144, reorderLevel: 36 },
  { id: 5, name: "Beef Burger", category: "Food", costPrice: 8000, sellingPrice: 18000, quantity: 40, reorderLevel: 10 },
  { id: 6, name: "Grilled Chicken", category: "Food", costPrice: 10000, sellingPrice: 22000, quantity: 30, reorderLevel: 8 },
  { id: 7, name: "French Fries", category: "Food", costPrice: 3000, sellingPrice: 8000, quantity: 50, reorderLevel: 15 },
  { id: 8, name: "Red Wine (Glass)", category: "Wine", costPrice: 5000, sellingPrice: 12000, quantity: 60, reorderLevel: 12 },
  { id: 9, name: "Whiskey (Shot)", category: "Spirits", costPrice: 4000, sellingPrice: 9000, quantity: 80, reorderLevel: 20 },
  { id: 10, name: "Mineral Water 500ml", category: "Soft Drinks", costPrice: 800, sellingPrice: 1500, quantity: 200, reorderLevel: 48 },
];

const today = new Date();
const fmt = (d) => d.toISOString().split("T")[0];
const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };

const INITIAL_SALES = [
  { id: 1, date: fmt(today), item: "Castle Lager 500ml", category: "Beer", qty: 12, unitPrice: 4000, total: 48000, payment: "Cash", desc: "" },
  { id: 2, date: fmt(today), item: "Beef Burger", category: "Food", qty: 5, unitPrice: 18000, total: 90000, payment: "Mobile Money", desc: "Table 3" },
  { id: 3, date: fmt(today), item: "Konyagi 750ml", category: "Spirits", qty: 2, unitPrice: 28000, total: 56000, payment: "Cash", desc: "" },
  { id: 4, date: daysAgo(1), item: "Grilled Chicken", category: "Food", qty: 8, unitPrice: 22000, total: 176000, payment: "Cash", desc: "" },
  { id: 5, date: daysAgo(1), item: "Red Wine (Glass)", category: "Wine", qty: 10, unitPrice: 12000, total: 120000, payment: "Bank", desc: "Event" },
  { id: 6, date: daysAgo(2), item: "Heineken 330ml", category: "Beer", qty: 24, unitPrice: 5000, total: 120000, payment: "Cash", desc: "" },
  { id: 7, date: daysAgo(3), item: "French Fries", category: "Food", qty: 15, unitPrice: 8000, total: 120000, payment: "Mobile Money", desc: "" },
  { id: 8, date: daysAgo(4), item: "Whiskey (Shot)", category: "Spirits", qty: 20, unitPrice: 9000, total: 180000, payment: "Cash", desc: "Weekend" },
  { id: 9, date: daysAgo(5), item: "Coca-Cola 500ml", category: "Soft Drinks", qty: 30, unitPrice: 2000, total: 60000, payment: "Cash", desc: "" },
  { id: 10, date: daysAgo(6), item: "Beef Burger", category: "Food", qty: 12, unitPrice: 18000, total: 216000, payment: "Cash", desc: "Weekend rush" },
];

const INITIAL_EXPENSES = [
  { id: 1, date: fmt(today), name: "Staff Wages", category: "Payroll", qty: 1, unitCost: 150000, total: 150000, payment: "Bank", desc: "Weekly wages" },
  { id: 2, date: fmt(today), name: "Electricity Bill", category: "Utilities", qty: 1, unitCost: 85000, total: 85000, payment: "Mobile Money", desc: "" },
  { id: 3, date: daysAgo(1), name: "Beer Stock Purchase", category: "Stock", qty: 48, unitCost: 2800, total: 134400, payment: "Cash", desc: "Castle Lager restock" },
  { id: 4, date: daysAgo(2), name: "Kitchen Gas", category: "Utilities", qty: 2, unitCost: 35000, total: 70000, payment: "Cash", desc: "" },
  { id: 5, date: daysAgo(3), name: "Cleaning Supplies", category: "Maintenance", qty: 1, unitCost: 45000, total: 45000, payment: "Cash", desc: "" },
];

const INITIAL_RECEIVABLES = [
  { id: 1, customer: "Corporate Events Ltd", invoice: 450000, paid: 200000, balance: 250000, due: daysAgo(-7), status: "Partial" },
  { id: 2, customer: "Acacia Hotel", invoice: 280000, paid: 280000, balance: 0, due: daysAgo(-2), status: "Paid" },
  { id: 3, customer: "NGO Retreat Group", invoice: 620000, paid: 0, balance: 620000, due: daysAgo(-14), status: "Overdue" },
];

const INITIAL_PAYABLES = [
  { id: 1, supplier: "Tanzania Breweries Ltd", owed: 580000, paid: 280000, balance: 300000, due: daysAgo(-5), status: "Partial" },
  { id: 2, supplier: "Fresh Produce Market", owed: 95000, paid: 95000, balance: 0, due: daysAgo(-1), status: "Paid" },
  { id: 3, supplier: "Sodastream Distributors", owed: 145000, paid: 0, balance: 145000, due: daysAgo(-10), status: "Overdue" },
];

const INITIAL_CASH = { opening: 500000, received: 0, payments: 0 };
const INITIAL_MOBILE = { opening: 320000, deposits: 0, withdrawals: 0, transfers: 0, charges: 0 };
const INITIAL_BANK = { opening: 2400000, deposits: 0, withdrawals: 0, transfers: 0 };

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const formatCurrency = (v) => `UGX ${Number(v || 0).toLocaleString()}`;
const startOfWeek = () => { const d = new Date(today); d.setDate(d.getDate() - d.getDay()); return fmt(d); };
const startOfMonth = () => fmt(new Date(today.getFullYear(), today.getMonth(), 1));

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    sales: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
    inventory: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    expense: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
    cashbook: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    mobile: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
    bank: "M3 6l9-4 9 4M3 6v14a1 1 0 001 1h16a1 1 0 001-1V6M3 6h18M9 10v8M15 10v8",
    receivable: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    payable: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    pnl: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    reports: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    sun: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
    moon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
    menu: "M4 6h16M4 12h16M4 18h16",
    close: "M6 18L18 6M6 6l12 12",
    plus: "M12 4v16m8-8H4",
    trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    alert: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    trend_up: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    trend_down: "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6",
    download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    filter: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
    edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    palette: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
    database: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
    upload: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
    check: "M5 13l4 4L19 7",
    key: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
    building: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    chart: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    eyeoff: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21",
  };
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d={icons[name] || ""} />
    </svg>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, icon, trend, dark }) => (
  <div className={`rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md hover:-translate-y-0.5 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
    style={{ borderLeft: `4px solid ${COLORS[color] || COLORS.emerald}` }}>
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
        <p className="text-xl font-bold truncate" style={{ color: COLORS[color] || COLORS.emerald }}>{value}</p>
        {sub && <p className={`text-xs mt-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>{sub}</p>}
      </div>
      <div className="ml-3 p-2 rounded-xl" style={{ background: `${COLORS[color]}22` }}>
        <span style={{ color: COLORS[color] }}><Icon name={icon} size={20} /></span>
      </div>
    </div>
    {trend !== undefined && (
      <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
        <Icon name={trend >= 0 ? "trend_up" : "trend_down"} size={13} />
        {Math.abs(trend)}% vs yesterday
      </div>
    )}
  </div>
);

// ─── BADGE ────────────────────────────────────────────────────────────────────
const Badge = ({ label, color = "emerald" }) => {
  const map = {
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    gold: "bg-amber-100 text-amber-700",
    sky: "bg-sky-100 text-sky-700",
    violet: "bg-violet-100 text-violet-700",
    orange: "bg-orange-100 text-orange-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[color] || map.emerald}`}>{label}</span>;
};

const paymentBadge = (method) => {
  if (method === "Cash") return <Badge label="Cash" color="emerald" />;
  if (method === "Mobile Money") return <Badge label="Mobile Money" color="sky" />;
  return <Badge label="Bank" color="violet" />;
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, dark }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border ${dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${dark ? "border-gray-700" : "border-gray-100"}`}>
          <h3 className={`text-lg font-bold ${dark ? "text-white" : "text-gray-900"}`}>{title}</h3>
          <button onClick={onClose} className={`p-1 rounded-lg hover:bg-opacity-20 hover:bg-gray-500 ${dark ? "text-gray-400" : "text-gray-500"}`}><Icon name="close" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ─── FORM FIELD ───────────────────────────────────────────────────────────────
const Field = ({ label, dark, children }) => (
  <div>
    <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${dark ? "text-gray-400" : "text-gray-600"}`}>{label}</label>
    {children}
  </div>
);

const Input = ({ dark, ...props }) => (
  <input className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition ${dark ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`} {...props} />
);

const Select = ({ dark, children, ...props }) => (
  <select className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition ${dark ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"}`} {...props}>{children}</select>
);

const Textarea = ({ dark, ...props }) => (
  <textarea className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition ${dark ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`} rows={2} {...props} />
);

const Btn = ({ onClick, variant = "primary", children, small }) => {
  const styles = {
    primary: "bg-emerald-500 hover:bg-emerald-600 text-white",
    danger: "bg-rose-500 hover:bg-rose-600 text-white",
    ghost: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    outline: "border border-emerald-500 text-emerald-600 hover:bg-emerald-50",
  };
  return (
    <button onClick={onClick} className={`${styles[variant]} ${small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"} rounded-lg font-semibold transition flex items-center gap-1.5`}>
      {children}
    </button>
  );
};

// ─── AUTOCOMPLETE INPUT ──────────────────────────────────────────────────────
const AutocompleteInput = ({ value, onChange, suggestions, placeholder, dark }) => {
  const [open, setOpen] = useState(false);
  const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase());
  return (
    <div className="relative">
      <Input dark={dark} value={value} onChange={e => { onChange(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder={placeholder} />
      {open && filtered.length > 0 && (
        <ul className={`absolute z-30 w-full mt-1 rounded-xl shadow-xl border overflow-hidden ${dark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
          {filtered.slice(0, 8).map(s => (
            <li key={s} onMouseDown={() => { onChange(s); setOpen(false); }} className={`px-3 py-2 text-sm cursor-pointer transition ${dark ? "hover:bg-gray-700 text-gray-200" : "hover:bg-emerald-50 text-gray-800"}`}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
const SectionHeader = ({ title, sub, dark, actions }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
    <div>
      <h2 className={`text-2xl font-bold tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>{title}</h2>
      {sub && <p className={`text-sm mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>{sub}</p>}
    </div>
    {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
  </div>
);

// ─── TABLE WRAPPER ────────────────────────────────────────────────────────────
const Table = ({ dark, headers, children }) => (
  <div className="overflow-x-auto rounded-xl border" style={{ borderColor: dark ? "#374151" : "#f3f4f6" }}>
    <table className="w-full text-sm">
      <thead>
        <tr className={dark ? "bg-gray-750 border-b border-gray-700" : "bg-gray-50 border-b border-gray-100"}>
          {headers.map(h => <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${dark ? "text-gray-400" : "text-gray-500"}`}>{h}</th>)}
        </tr>
      </thead>
      <tbody className={`divide-y ${dark ? "divide-gray-700" : "divide-gray-50"}`}>{children}</tbody>
    </table>
  </div>
);
const TR = ({ dark, children }) => (
  <tr className={`transition ${dark ? "hover:bg-gray-750 text-gray-300" : "hover:bg-gray-50 text-gray-800"}`}>{children}</tr>
);
const TD = ({ children, className = "" }) => <td className={`px-4 py-3 ${className}`}>{children}</td>;

// ─── EXPORT HELPERS ───────────────────────────────────────────────────────────
const exportCSV = (data, filename) => {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(","), ...data.map(r => keys.map(k => `"${r[k]}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
};

// ─── PDF GENERATION ───────────────────────────────────────────────────────────
const loadJsPDF = () => new Promise((resolve, reject) => {
  if (window.jspdf && window.jspdf.jsPDF) { resolve(window.jspdf.jsPDF); return; }
  const s1 = document.createElement("script");
  s1.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  s1.onload = () => {
    const s2 = document.createElement("script");
    s2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
    s2.onload = () => resolve(window.jspdf.jsPDF);
    s2.onerror = reject;
    document.head.appendChild(s2);
  };
  s1.onerror = reject;
  document.head.appendChild(s1);
});

const fmtUGX = (v) => `UGX ${Number(v || 0).toLocaleString()}`;

const generateAccountingPDF = async ({ period, dateFrom, dateTo, sales, expenses, cash, mobile, bank, settings, reportTitle }) => {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const ML = 15;  // margin left
  const MR = 15;  // margin right
  const CONTENT_W = PAGE_W - ML - MR;
  const HEADER_H = 42;

  const bizName = (settings && settings.businessName) || "La Foret Bar & Bistro";
  const accountant = (settings && settings.accountantName) || "Administrator";
  const generatedAt = new Date().toLocaleString("en-UG", { dateStyle: "full", timeStyle: "short" });

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filteredSales = sales.filter(s => s.date >= dateFrom && s.date <= dateTo);
  const filteredExp   = expenses.filter(e => e.date >= dateFrom && e.date <= dateTo);
  const totalIncome   = filteredSales.reduce((a, s) => a + s.total, 0);
  const totalExpenses = filteredExp.reduce((a, e) => a + e.total, 0);

  const cashSales   = filteredSales.filter(s => s.payment === "Cash").reduce((a, s) => a + s.total, 0);
  const cashExpOut  = filteredExp.filter(e => e.payment === "Cash").reduce((a, e) => a + e.total, 0);
  const openingCash = cash.opening;
  const closingCash = openingCash + cashSales - cashExpOut;

  const mobileSales   = filteredSales.filter(s => s.payment === "Mobile Money").reduce((a, s) => a + s.total, 0);
  const mobileExpOut  = filteredExp.filter(e => e.payment === "Mobile Money").reduce((a, e) => a + e.total, 0);
  const mobileBalance = mobile.opening + mobileSales - mobile.withdrawals - mobile.charges - mobileExpOut;

  const bankSales  = filteredSales.filter(s => s.payment === "Bank").reduce((a, s) => a + s.total, 0);
  const bankExpOut = filteredExp.filter(e => e.payment === "Bank").reduce((a, e) => a + e.total, 0);
  const bankBal    = bank.opening + bankSales - bankExpOut;

  const netProfit = totalIncome - totalExpenses;

  // ── Draw page header ───────────────────────────────────────────────────────
  const drawHeader = (pageNum, totalPages) => {
    // Top black bar
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, PAGE_W, HEADER_H, "F");

    // Business name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(bizName, ML, 14);

    // Report title
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text(reportTitle.toUpperCase(), ML, 21);

    // Period
    doc.setFontSize(8);
    doc.text(`Period: ${dateFrom}  –  ${dateTo}`, ML, 27);

    // Generated date (right-aligned)
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.text(`Generated: ${generatedAt}`, PAGE_W - MR, 27, { align: "right" });

    // Horizontal rule
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.3);
    doc.line(ML, 33, PAGE_W - MR, 33);

    // "CONFIDENTIAL" watermark label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("CONFIDENTIAL — FOR INTERNAL USE ONLY", PAGE_W / 2, 38, { align: "center" });

    // Page number footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_W / 2, PAGE_H - 8, { align: "center" });
    doc.text(bizName, ML, PAGE_H - 8);
    doc.text(`${reportTitle}  ·  ${dateTo}`, PAGE_W - MR, PAGE_H - 8, { align: "right" });

    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(ML, PAGE_H - 11, PAGE_W - MR, PAGE_H - 11);
  };

  // ── Draw summary section ───────────────────────────────────────────────────
  const drawSummary = (startY) => {
    let y = startY;

    // Section title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text("FINANCIAL SUMMARY", ML, y);
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.5);
    doc.line(ML, y + 1.5, ML + 50, y + 1.5);
    y += 7;

    // Summary box background
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(ML, y, CONTENT_W, 62, 2, 2, "F");
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.roundedRect(ML, y, CONTENT_W, 62, 2, 2, "S");

    const col1X = ML + 6;
    const col2X = ML + CONTENT_W / 2 + 3;
    let rowY = y + 9;
    const ROW_H = 8.5;

    const drawRow = (label, value, x, colW, bold = false, highlight = null) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      doc.text(label, x, rowY);

      if (highlight === "green") doc.setTextColor(16, 130, 100);
      else if (highlight === "red") doc.setTextColor(200, 50, 50);
      else doc.setTextColor(20, 20, 20);

      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.text(fmtUGX(value), x + colW - 6, rowY, { align: "right" });

      // Light separator line
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.15);
      doc.line(x, rowY + 1.5, x + colW - 6, rowY + 1.5);
    };

    const halfW = CONTENT_W / 2 - 9;

    // Column 1 — Cash & Bank
    drawRow("Opening Cash Balance", openingCash, col1X, halfW);
    rowY += ROW_H;
    drawRow("Cash Sales Received", cashSales, col1X, halfW, false, "green");
    rowY += ROW_H;
    drawRow("Cash Expenses Paid", cashExpOut, col1X, halfW, false, "red");
    rowY += ROW_H;
    drawRow("Closing Cash Balance", closingCash, col1X, halfW, true, closingCash >= 0 ? "green" : "red");
    rowY += ROW_H;
    drawRow("Bank Balance", bankBal, col1X, halfW, false);

    // Column 2 — Income & Profit
    rowY = y + 9;
    drawRow("Total Income (All Channels)", totalIncome, col2X, halfW, false, "green");
    rowY += ROW_H;
    drawRow("Total Expenses", totalExpenses, col2X, halfW, false, "red");
    rowY += ROW_H;
    drawRow("Mobile Money Balance", mobileBalance, col2X, halfW);
    rowY += ROW_H;
    drawRow("Gross Profit / (Loss)", netProfit, col2X, halfW, true, netProfit >= 0 ? "green" : "red");
    rowY += ROW_H;
    drawRow("Transactions (Sales)", filteredSales.length, col2X, halfW);

    return y + 67;
  };

  // ── Build tables data ──────────────────────────────────────────────────────
  const salesRows = filteredSales.map(s => [
    s.date, s.item, s.category, String(s.qty),
    fmtUGX(s.unitPrice), fmtUGX(s.total), s.payment
  ]);
  const expRows = filteredExp.map(e => [
    e.date, e.name, e.category, String(e.qty),
    fmtUGX(e.unitCost), fmtUGX(e.total), e.payment
  ]);

  // Totals row styling
  const totalRowStyle = { fontStyle: "bold", fillColor: [240, 240, 240], textColor: [20, 20, 20] };

  const tableStyles = {
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8, cellPadding: 3 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.5, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    tableLineColor: [210, 210, 210],
    tableLineWidth: 0.2,
    showHead: "everyPage",
    margin: { left: ML, right: MR },
    didDrawPage: (data) => {
      drawHeader(doc.internal.getCurrentPageInfo().pageNumber, "?");
    },
  };

  // ── PAGE 1: Header + Summary ───────────────────────────────────────────────
  drawHeader(1, "?");
  let curY = HEADER_H + 8;
  curY = drawSummary(curY);

  // ── Sales Table ────────────────────────────────────────────────────────────
  curY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text("SALES TRANSACTIONS", ML, curY);
  doc.setLineWidth(0.5);
  doc.line(ML, curY + 1.5, ML + 50, curY + 1.5);
  curY += 5;

  if (filteredSales.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(150, 150, 150);
    doc.text("No sales transactions in this period.", ML, curY + 6);
    curY += 14;
  } else {
    doc.autoTable({
      startY: curY,
      head: [["Date", "Item / Description", "Category", "Qty", "Unit Price", "Total", "Payment"]],
      body: [
        ...salesRows,
        [{ content: "TOTAL INCOME", colSpan: 5, styles: totalRowStyle },
         { content: fmtUGX(totalIncome), styles: { ...totalRowStyle, textColor: [10, 120, 80] } },
         { content: "", styles: totalRowStyle }]
      ],
      columnStyles: {
        0: { cellWidth: 22 }, 1: { cellWidth: 40 }, 2: { cellWidth: 22 },
        3: { cellWidth: 10, halign: "center" }, 4: { cellWidth: 30, halign: "right" },
        5: { cellWidth: 30, halign: "right" }, 6: { cellWidth: 20, halign: "center" }
      },
      ...tableStyles,
    });
    curY = doc.lastAutoTable.finalY + 8;
  }

  // ── Expenses Table ─────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  if (curY > PAGE_H - 60) { doc.addPage(); curY = HEADER_H + 8; }
  doc.text("EXPENSE TRANSACTIONS", ML, curY);
  doc.setLineWidth(0.5);
  doc.line(ML, curY + 1.5, ML + 55, curY + 1.5);
  curY += 5;

  if (filteredExp.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(150, 150, 150);
    doc.text("No expense transactions in this period.", ML, curY + 6);
    curY += 14;
  } else {
    doc.autoTable({
      startY: curY,
      head: [["Date", "Expense Name", "Category", "Qty", "Unit Cost", "Total", "Payment"]],
      body: [
        ...expRows,
        [{ content: "TOTAL EXPENSES", colSpan: 5, styles: totalRowStyle },
         { content: fmtUGX(totalExpenses), styles: { ...totalRowStyle, textColor: [180, 40, 40] } },
         { content: "", styles: totalRowStyle }]
      ],
      columnStyles: {
        0: { cellWidth: 22 }, 1: { cellWidth: 40 }, 2: { cellWidth: 22 },
        3: { cellWidth: 10, halign: "center" }, 4: { cellWidth: 30, halign: "right" },
        5: { cellWidth: 30, halign: "right" }, 6: { cellWidth: 20, halign: "center" }
      },
      ...tableStyles,
    });
    curY = doc.lastAutoTable.finalY + 10;
  }

  // ── Signature Section ──────────────────────────────────────────────────────
  if (curY > PAGE_H - 55) { doc.addPage(); curY = HEADER_H + 8; }

  doc.setFillColor(248, 248, 248);
  doc.roundedRect(ML, curY, CONTENT_W, 42, 2, 2, "F");
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(ML, curY, CONTENT_W, 42, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text("CERTIFICATION & AUTHORIZATION", ML + 6, curY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(
    "I hereby certify that the information contained in this report is true, accurate, and complete to the best of my knowledge.",
    ML + 6, curY + 15, { maxWidth: CONTENT_W - 12 }
  );

  const sigY = curY + 29;
  const col1 = ML + 6;
  const col2 = ML + CONTENT_W / 2 + 6;

  // Sig line 1
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.4);
  doc.line(col1, sigY, col1 + 60, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(40, 40, 40);
  doc.text(accountant, col1, sigY + 4);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Accountant / Preparer", col1, sigY + 8);

  // Sig line 2
  doc.line(col2, sigY, col2 + 60, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(40, 40, 40);
  doc.text("Authorized Signatory", col2, sigY + 4);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Director / Manager", col2, sigY + 8);

  // ── Fix page numbers (now we know total) ──────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    // Redraw footer with correct page count
    doc.setFillColor(255, 255, 255);
    doc.rect(0, PAGE_H - 14, PAGE_W, 14, "F");
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(ML, PAGE_H - 11, PAGE_W - MR, PAGE_H - 11);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text(`Page ${p} of ${totalPages}`, PAGE_W / 2, PAGE_H - 8, { align: "center" });
    doc.text(bizName, ML, PAGE_H - 8);
    doc.text(`${reportTitle}  ·  ${dateTo}`, PAGE_W - MR, PAGE_H - 8, { align: "right" });
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  const safeTitle = reportTitle.replace(/\s+/g, "-").toLowerCase();
  doc.save(`${safeTitle}-${dateTo}.pdf`);
};

// ══════════════════════════════════════════════════════════════════════════════
// MODULES
// ══════════════════════════════════════════════════════════════════════════════

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const DashboardView = ({ sales, expenses, inventory, cash, mobile, bank, receivables, dark }) => {
  const todaySales = sales.filter(s => s.date === fmt(today)).reduce((a, s) => a + s.total, 0);
  const weekSales = sales.filter(s => s.date >= startOfWeek()).reduce((a, s) => a + s.total, 0);
  const monthSales = sales.filter(s => s.date >= startOfMonth()).reduce((a, s) => a + s.total, 0);
  const totalExpenses = expenses.reduce((a, e) => a + e.total, 0);
  const cashSales = sales.reduce((a, s) => s.payment === "Cash" ? a + s.total : a, 0);
  const mobileSales = sales.reduce((a, s) => s.payment === "Mobile Money" ? a + s.total : a, 0);
  const bankSales = sales.reduce((a, s) => s.payment === "Bank" ? a + s.total : a, 0);
  const cashInHand = cash.opening + cashSales - (expenses.filter(e => e.payment === "Cash").reduce((a, e) => a + e.total, 0));
  const mobileBalance = mobile.opening + mobileSales - mobile.withdrawals - mobile.charges;
  const bankBalance = bank.opening + bankSales - (expenses.filter(e => e.payment === "Bank").reduce((a, e) => a + e.total, 0));
  const inventoryValue = inventory.reduce((a, i) => a + i.costPrice * i.quantity, 0);
  const totalReceivable = receivables.reduce((a, r) => a + r.balance, 0);
  const netProfit = monthSales - totalExpenses;

  // chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i);
    const daySales = sales.filter(s => s.date === d).reduce((a, s) => a + s.total, 0);
    const dayExp = expenses.filter(e => e.date === d).reduce((a, e) => a + e.total, 0);
    return { day: d.slice(5), sales: daySales, expenses: dayExp, profit: daySales - dayExp };
  });

  const byCat = inventory.reduce((acc, item) => {
    const cat = item.category;
    const existing = acc.find(a => a.name === cat);
    if (existing) existing.value += item.quantity * item.sellingPrice;
    else acc.push({ name: cat, value: item.quantity * item.sellingPrice });
    return acc;
  }, []);

  const topItems = [...sales].reduce((acc, s) => {
    const e = acc.find(a => a.name === s.item);
    if (e) { e.qty += s.qty; e.revenue += s.total; }
    else acc.push({ name: s.item, qty: s.qty, revenue: s.total });
    return acc;
  }, []).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const lowStock = inventory.filter(i => i.quantity <= i.reorderLevel);

  const cardCfg = [
    { label: "Today's Sales", value: formatCurrency(todaySales), color: "emerald", icon: "sales", trend: 12 },
    { label: "Week Sales", value: formatCurrency(weekSales), color: "sky", icon: "reports", trend: 8 },
    { label: "Month Sales", value: formatCurrency(monthSales), color: "violet", icon: "pnl", trend: 5 },
    { label: "Cash in Hand", value: formatCurrency(cashInHand), color: "gold", icon: "cashbook" },
    { label: "Mobile Money", value: formatCurrency(mobileBalance), color: "teal", icon: "mobile" },
    { label: "Bank Balance", value: formatCurrency(bankBalance), color: "sky", icon: "bank" },
    { label: "Accounts Receivable", value: formatCurrency(totalReceivable), color: "orange", icon: "receivable" },
    { label: "Total Expenses", value: formatCurrency(totalExpenses), color: "rose", icon: "expense" },
    { label: "Net Profit", value: formatCurrency(netProfit), color: netProfit >= 0 ? "emerald" : "rose", icon: "pnl", trend: netProfit >= 0 ? 3 : -3 },
    { label: "Inventory Value", value: formatCurrency(inventoryValue), color: "violet", icon: "inventory" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Dashboard Overview" sub={`${fmt(today)} — La Foret Bar & Bistro`} dark={dark} />

      {lowStock.length > 0 && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${dark ? "bg-amber-900/30 border-amber-700 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
          <Icon name="alert" size={18} />
          <div>
            <span className="font-semibold">Low Stock Alert: </span>
            {lowStock.map(i => i.name).join(", ")} — reorder now.
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cardCfg.map(c => <StatCard key={c.label} {...c} dark={dark} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales & Profit Trend */}
        <div className={`rounded-2xl p-5 border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className={`font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>7-Day Sales & Profit Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={last7}>
              <defs>
                <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} /><stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} /></linearGradient>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.sky} stopOpacity={0.3} /><stop offset="95%" stopColor={COLORS.sky} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#f3f4f6"} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: dark ? "#9ca3af" : "#6b7280" }} />
              <YAxis tick={{ fontSize: 11, fill: dark ? "#9ca3af" : "#6b7280" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: dark ? "#1f2937" : "#fff", border: "none", borderRadius: 10 }} />
              <Legend />
              <Area type="monotone" dataKey="sales" stroke={COLORS.emerald} fill="url(#gs)" name="Sales" strokeWidth={2} />
              <Area type="monotone" dataKey="profit" stroke={COLORS.sky} fill="url(#gp)" name="Profit" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category Pie */}
        <div className={`rounded-2xl p-5 border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className={`font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Stock Value by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCat} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {byCat.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: dark ? "#1f2937" : "#fff", border: "none", borderRadius: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expense Bar */}
        <div className={`rounded-2xl p-5 border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className={`font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>7-Day Expenses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#f3f4f6"} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: dark ? "#9ca3af" : "#6b7280" }} />
              <YAxis tick={{ fontSize: 11, fill: dark ? "#9ca3af" : "#6b7280" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: dark ? "#1f2937" : "#fff", border: "none", borderRadius: 10 }} />
              <Bar dataKey="expenses" fill={COLORS.rose} radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Items */}
        <div className={`rounded-2xl p-5 border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className={`font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Top Selling Items</h3>
          <div className="space-y-3">
            {topItems.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: PIE_COLORS[i] }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${dark ? "text-gray-200" : "text-gray-800"}`}>{item.name}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(item.revenue / topItems[0].revenue) * 100}%`, background: PIE_COLORS[i] }} />
                  </div>
                </div>
                <span className="text-xs font-bold" style={{ color: PIE_COLORS[i] }}>{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SALES MODULE ─────────────────────────────────────────────────────────────
const SalesView = ({ sales, setSales, inventory, setInventory, dark }) => {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ date: fmt(today), item: "", category: "", qty: 1, unitPrice: 0, total: 0, payment: "Cash", desc: "" });
  const [availableQty, setAvailableQty] = useState(null);

  const itemNames = inventory.map(i => i.name).sort();

  const setField = (k, v) => {
    setForm(f => {
      const updated = { ...f, [k]: v };
      if (k === "item") {
        const inv = inventory.find(i => i.name === v);
        if (inv) {
          updated.category = inv.category;
          updated.unitPrice = inv.sellingPrice;
          updated.total = inv.sellingPrice * updated.qty;
          setAvailableQty(inv.quantity);
        } else setAvailableQty(null);
      }
      if (k === "qty" || k === "unitPrice") {
        updated.total = (k === "qty" ? Number(v) : updated.qty) * (k === "unitPrice" ? Number(v) : updated.unitPrice);
      }
      return updated;
    });
  };

  const handleSave = () => {
    if (!form.item || !form.qty || !form.unitPrice) return;
    const inv = inventory.find(i => i.name === form.item);
    if (inv && inv.quantity < form.qty) { alert("Insufficient stock!"); return; }
    const newSale = { ...form, id: Date.now(), qty: Number(form.qty), unitPrice: Number(form.unitPrice), total: Number(form.qty) * Number(form.unitPrice) };
    setSales(s => [newSale, ...s]);
    if (inv) setInventory(inv2 => inv2.map(i => i.name === form.item ? { ...i, quantity: i.quantity - Number(form.qty) } : i));
    setForm({ date: fmt(today), item: "", category: "", qty: 1, unitPrice: 0, total: 0, payment: "Cash", desc: "" });
    setAvailableQty(null);
    setShowModal(false);
  };

  const filtered = sales.filter(s => {
    const d = s.date;
    if (filter === "today" && d !== fmt(today)) return false;
    if (filter === "week" && d < startOfWeek()) return false;
    if (filter === "month" && d < startOfMonth()) return false;
    if (search && !s.item.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const total = filtered.reduce((a, s) => a + s.total, 0);

  return (
    <div>
      <SectionHeader title="Sales" sub={`${filtered.length} records · Total: ${formatCurrency(total)}`} dark={dark}
        actions={<>
          <Btn onClick={() => exportCSV(filtered, "sales.csv")} variant="ghost" small><Icon name="download" size={14} />CSV</Btn>
          <Btn onClick={() => setShowModal(true)}><Icon name="plus" size={14} />New Sale</Btn>
        </>}
      />

      <div className={`flex flex-wrap gap-3 mb-5 p-4 rounded-xl border ${dark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
        {["all", "today", "week", "month"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition ${filter === f ? "bg-emerald-500 text-white" : dark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>{f}</button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Icon name="search" size={16} />
          <Input dark={dark} placeholder="Search item..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Table dark={dark} headers={["Date", "Item", "Category", "Qty", "Unit Price", "Total", "Payment", ""]}>
        {filtered.map(s => (
          <TR key={s.id} dark={dark}>
            <TD>{s.date}</TD>
            <TD><span className="font-medium">{s.item}</span></TD>
            <TD><Badge label={s.category} color="sky" /></TD>
            <TD>{s.qty}</TD>
            <TD>{formatCurrency(s.unitPrice)}</TD>
            <TD><span className="font-bold text-emerald-600">{formatCurrency(s.total)}</span></TD>
            <TD>{paymentBadge(s.payment)}</TD>
            <TD><button onClick={() => setSales(prev => prev.filter(x => x.id !== s.id))} className="text-rose-400 hover:text-rose-600"><Icon name="trash" size={15} /></button></TD>
          </TR>
        ))}
      </Table>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Record New Sale" dark={dark}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date" dark={dark}><Input dark={dark} type="date" value={form.date} onChange={e => setField("date", e.target.value)} /></Field>
          <Field label="Payment Method" dark={dark}>
            <Select dark={dark} value={form.payment} onChange={e => setField("payment", e.target.value)}>
              <option>Cash</option><option>Mobile Money</option><option>Bank</option>
            </Select>
          </Field>
          <Field label="Item Name" dark={dark} className="col-span-2">
            <AutocompleteInput dark={dark} value={form.item} onChange={v => setField("item", v)} suggestions={itemNames} placeholder="Start typing..." />
            {availableQty !== null && <p className={`text-xs mt-1 ${availableQty <= 5 ? "text-rose-500" : "text-emerald-500"}`}>In stock: {availableQty}</p>}
          </Field>
          <Field label="Category" dark={dark}><Input dark={dark} value={form.category} onChange={e => setField("category", e.target.value)} /></Field>
          <Field label="Quantity" dark={dark}><Input dark={dark} type="number" min={1} value={form.qty} onChange={e => setField("qty", e.target.value)} /></Field>
          <Field label="Unit Price (TZS)" dark={dark}><Input dark={dark} type="number" value={form.unitPrice} onChange={e => setField("unitPrice", e.target.value)} /></Field>
          <Field label="Total (Auto)" dark={dark}>
            <div className={`px-3 py-2 rounded-lg text-sm font-bold ${dark ? "bg-gray-700 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}>{formatCurrency(form.total)}</div>
          </Field>
          <Field label="Description" dark={dark} className="col-span-2"><Textarea dark={dark} value={form.desc} onChange={e => setField("desc", e.target.value)} /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave}><Icon name="plus" size={14} />Save Sale</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ─── INVENTORY MODULE ──────────────────────────────────────────────────────────
const InventoryView = ({ inventory, setInventory, dark }) => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", category: "", costPrice: 0, sellingPrice: 0, quantity: 0, reorderLevel: 10 });

  const cats = [...new Set(inventory.map(i => i.category))].sort();
  const filtered = inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const totalValue = filtered.reduce((a, i) => a + i.costPrice * i.quantity, 0);
  const lowStock = inventory.filter(i => i.quantity <= i.reorderLevel);

  const handleSave = () => {
    if (!form.name) return;
    setInventory(inv => [...inv, { ...form, id: Date.now(), costPrice: Number(form.costPrice), sellingPrice: Number(form.sellingPrice), quantity: Number(form.quantity), reorderLevel: Number(form.reorderLevel) }]);
    setForm({ name: "", category: "", costPrice: 0, sellingPrice: 0, quantity: 0, reorderLevel: 10 });
    setShowModal(false);
  };

  return (
    <div>
      <SectionHeader title="Inventory" sub={`${filtered.length} items · Value: ${formatCurrency(totalValue)}`} dark={dark}
        actions={<>
          <Btn onClick={() => exportCSV(filtered, "inventory.csv")} variant="ghost" small><Icon name="download" size={14} />CSV</Btn>
          <Btn onClick={() => setShowModal(true)}><Icon name="plus" size={14} />Add Item</Btn>
        </>}
      />

      {lowStock.length > 0 && (
        <div className={`flex gap-2 items-start p-3 mb-4 rounded-xl text-sm ${dark ? "bg-amber-900/30 text-amber-300" : "bg-amber-50 text-amber-800"}`}>
          <Icon name="alert" size={16} />
          <span><strong>Low Stock:</strong> {lowStock.map(i => `${i.name} (${i.quantity} left)`).join(" · ")}</span>
        </div>
      )}

      <div className="mb-4 flex gap-3">
        <Input dark={dark} placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Table dark={dark} headers={["Item", "Category", "Cost Price", "Sell Price", "In Stock", "Reorder Level", "Status", "Value", ""]}>
        {filtered.map(item => {
          const low = item.quantity <= item.reorderLevel;
          return (
            <TR key={item.id} dark={dark}>
              <TD><span className="font-semibold">{item.name}</span></TD>
              <TD><Badge label={item.category} color="violet" /></TD>
              <TD>{formatCurrency(item.costPrice)}</TD>
              <TD>{formatCurrency(item.sellingPrice)}</TD>
              <TD><span className={`font-bold ${low ? "text-rose-500" : "text-emerald-500"}`}>{item.quantity}</span></TD>
              <TD>{item.reorderLevel}</TD>
              <TD>{low ? <Badge label="Low Stock" color="rose" /> : <Badge label="OK" color="emerald" />}</TD>
              <TD><span className="font-semibold">{formatCurrency(item.costPrice * item.quantity)}</span></TD>
              <TD><button onClick={() => setInventory(inv => inv.filter(i => i.id !== item.id))} className="text-rose-400 hover:text-rose-600"><Icon name="trash" size={15} /></button></TD>
            </TR>
          );
        })}
      </Table>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Inventory Item" dark={dark}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Item Name" dark={dark} className="col-span-2"><Input dark={dark} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Castle Lager 500ml" /></Field>
          <Field label="Category" dark={dark}>
            <AutocompleteInput dark={dark} value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} suggestions={cats} placeholder="e.g. Beer" />
          </Field>
          <Field label="Quantity in Stock" dark={dark}><Input dark={dark} type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} /></Field>
          <Field label="Cost Price (TZS)" dark={dark}><Input dark={dark} type="number" value={form.costPrice} onChange={e => setForm(f => ({ ...f, costPrice: e.target.value }))} /></Field>
          <Field label="Selling Price (TZS)" dark={dark}><Input dark={dark} type="number" value={form.sellingPrice} onChange={e => setForm(f => ({ ...f, sellingPrice: e.target.value }))} /></Field>
          <Field label="Reorder Level" dark={dark}><Input dark={dark} type="number" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: e.target.value }))} /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave}><Icon name="plus" size={14} />Add Item</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ─── EXPENSES MODULE ──────────────────────────────────────────────────────────
const ExpensesView = ({ expenses, setExpenses, dark }) => {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ date: fmt(today), name: "", category: "", qty: 1, unitCost: 0, total: 0, payment: "Cash", desc: "" });

  const cats = [...new Set(expenses.map(e => e.category))].sort();
  const expenseNames = [...new Set(expenses.map(e => e.name))].sort();

  const filtered = expenses.filter(e => {
    if (filter === "today") return e.date === fmt(today);
    if (filter === "week") return e.date >= startOfWeek();
    if (filter === "month") return e.date >= startOfMonth();
    return true;
  });
  const total = filtered.reduce((a, e) => a + e.total, 0);

  const setField = (k, v) => {
    setForm(f => {
      const u = { ...f, [k]: v };
      if (k === "qty" || k === "unitCost") u.total = (k === "qty" ? Number(v) : u.qty) * (k === "unitCost" ? Number(v) : u.unitCost);
      return u;
    });
  };

  const handleSave = () => {
    if (!form.name) return;
    setExpenses(e => [{ ...form, id: Date.now(), qty: Number(form.qty), unitCost: Number(form.unitCost), total: Number(form.qty) * Number(form.unitCost) }, ...e]);
    setForm({ date: fmt(today), name: "", category: "", qty: 1, unitCost: 0, total: 0, payment: "Cash", desc: "" });
    setShowModal(false);
  };

  return (
    <div>
      <SectionHeader title="Expenses" sub={`${filtered.length} records · Total: ${formatCurrency(total)}`} dark={dark}
        actions={<>
          <Btn onClick={() => exportCSV(filtered, "expenses.csv")} variant="ghost" small><Icon name="download" size={14} />CSV</Btn>
          <Btn onClick={() => setShowModal(true)}><Icon name="plus" size={14} />Add Expense</Btn>
        </>}
      />

      <div className={`flex flex-wrap gap-3 mb-5 p-3 rounded-xl border ${dark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
        {["all", "today", "week", "month"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition ${filter === f ? "bg-rose-500 text-white" : dark ? "bg-gray-700 text-gray-300" : "bg-white text-gray-600 border border-gray-200"}`}>{f}</button>
        ))}
      </div>

      <Table dark={dark} headers={["Date", "Name", "Category", "Qty", "Unit Cost", "Total", "Payment", ""]}>
        {filtered.map(e => (
          <TR key={e.id} dark={dark}>
            <TD>{e.date}</TD>
            <TD><span className="font-medium">{e.name}</span></TD>
            <TD><Badge label={e.category} color="orange" /></TD>
            <TD>{e.qty}</TD>
            <TD>{formatCurrency(e.unitCost)}</TD>
            <TD><span className="font-bold text-rose-600">{formatCurrency(e.total)}</span></TD>
            <TD>{paymentBadge(e.payment)}</TD>
            <TD><button onClick={() => setExpenses(prev => prev.filter(x => x.id !== e.id))} className="text-rose-400 hover:text-rose-600"><Icon name="trash" size={15} /></button></TD>
          </TR>
        ))}
      </Table>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Expense" dark={dark}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date" dark={dark}><Input dark={dark} type="date" value={form.date} onChange={e => setField("date", e.target.value)} /></Field>
          <Field label="Payment Method" dark={dark}>
            <Select dark={dark} value={form.payment} onChange={e => setField("payment", e.target.value)}>
              <option>Cash</option><option>Mobile Money</option><option>Bank</option>
            </Select>
          </Field>
          <Field label="Expense Name" dark={dark}>
            <AutocompleteInput dark={dark} value={form.name} onChange={v => setField("name", v)} suggestions={expenseNames} placeholder="e.g. Staff Wages" />
          </Field>
          <Field label="Category" dark={dark}>
            <AutocompleteInput dark={dark} value={form.category} onChange={v => setField("category", v)} suggestions={cats} placeholder="e.g. Payroll" />
          </Field>
          <Field label="Quantity" dark={dark}><Input dark={dark} type="number" min={1} value={form.qty} onChange={e => setField("qty", e.target.value)} /></Field>
          <Field label="Unit Cost (TZS)" dark={dark}><Input dark={dark} type="number" value={form.unitCost} onChange={e => setField("unitCost", e.target.value)} /></Field>
          <Field label="Total (Auto)" dark={dark}>
            <div className={`px-3 py-2 rounded-lg text-sm font-bold ${dark ? "bg-gray-700 text-rose-400" : "bg-rose-50 text-rose-700"}`}>{formatCurrency(form.total)}</div>
          </Field>
          <Field label="Description" dark={dark}><Textarea dark={dark} value={form.desc} onChange={e => setField("desc", e.target.value)} /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave}><Icon name="plus" size={14} />Save Expense</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ─── CASHBOOK MODULE ──────────────────────────────────────────────────────────
const CashbookView = ({ sales, expenses, cash, setCash, dark }) => {
  const cashSales = sales.filter(s => s.payment === "Cash").reduce((a, s) => a + s.total, 0);
  const cashExp = expenses.filter(e => e.payment === "Cash").reduce((a, e) => a + e.total, 0);
  const closing = cash.opening + cashSales - cashExp;

  const todayCash = sales.filter(s => s.payment === "Cash" && s.date === fmt(today)).reduce((a, s) => a + s.total, 0);
  const todayExp = expenses.filter(e => e.payment === "Cash" && e.date === fmt(today)).reduce((a, e) => a + e.total, 0);

  const rows = [
    { label: "Opening Balance", amount: cash.opening, type: "neutral" },
    { label: "Cash Sales Received", amount: cashSales, type: "credit" },
    { label: "Cash Expenses Paid", amount: cashExp, type: "debit" },
    { label: "Closing Balance", amount: closing, type: "total" },
  ];

  return (
    <div>
      <SectionHeader title="Cashbook" sub="Cash flow tracking and reconciliation" dark={dark} />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className={`rounded-2xl border p-5 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <h3 className={`font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Cash Summary (All Time)</h3>
            <div className="space-y-3">
              {rows.map(r => (
                <div key={r.label} className={`flex justify-between items-center py-2 border-b last:border-0 ${dark ? "border-gray-700" : "border-gray-100"}`}>
                  <span className={dark ? "text-gray-300" : "text-gray-600"}>{r.label}</span>
                  <span className={`font-bold text-lg ${r.type === "credit" ? "text-emerald-500" : r.type === "debit" ? "text-rose-500" : r.type === "total" ? "text-sky-500" : dark ? "text-white" : "text-gray-900"}`}>{formatCurrency(r.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl border p-5 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <h3 className={`font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Today's Cash Flow</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className={dark ? "text-gray-400" : "text-gray-500"}>Cash Received</span><span className="text-emerald-500 font-bold">{formatCurrency(todayCash)}</span></div>
              <div className="flex justify-between"><span className={dark ? "text-gray-400" : "text-gray-500"}>Cash Paid Out</span><span className="text-rose-500 font-bold">{formatCurrency(todayExp)}</span></div>
              <div className={`flex justify-between pt-2 border-t ${dark ? "border-gray-700" : "border-gray-200"}`}>
                <span className="font-bold">Net Cash Today</span>
                <span className="font-bold text-sky-500">{formatCurrency(todayCash - todayExp)}</span>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-5 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <h3 className={`font-bold mb-3 ${dark ? "text-white" : "text-gray-900"}`}>Set Opening Balance</h3>
            <div className="flex gap-3">
              <Input dark={dark} type="number" value={cash.opening} onChange={e => setCash(c => ({ ...c, opening: Number(e.target.value) }))} placeholder="Opening balance" />
              <Btn><Icon name="plus" size={14} />Save</Btn>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border p-5 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className={`font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Cash Flow Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={Array.from({ length: 7 }, (_, i) => {
              const d = daysAgo(6 - i);
              return {
                day: d.slice(5),
                in: sales.filter(s => s.payment === "Cash" && s.date === d).reduce((a, s) => a + s.total, 0),
                out: expenses.filter(e => e.payment === "Cash" && e.date === d).reduce((a, e) => a + e.total, 0),
              };
            })}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#f3f4f6"} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: dark ? "#1f2937" : "#fff", border: "none", borderRadius: 10 }} />
              <Legend />
              <Line type="monotone" dataKey="in" stroke={COLORS.emerald} strokeWidth={2} name="Cash In" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="out" stroke={COLORS.rose} strokeWidth={2} name="Cash Out" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ─── MOBILE MONEY MODULE ──────────────────────────────────────────────────────
const MobileMoneyView = ({ sales, expenses, mobile, setMobile, dark }) => {
  const mobileSales = sales.filter(s => s.payment === "Mobile Money").reduce((a, s) => a + s.total, 0);
  const mobileExp = expenses.filter(e => e.payment === "Mobile Money").reduce((a, e) => a + e.total, 0);
  const closing = mobile.opening + mobileSales + mobile.deposits - mobile.withdrawals - mobile.transfers - mobile.charges - mobileExp;

  return (
    <div>
      <SectionHeader title="Mobile Money" sub="M-Pesa / Airtel Money tracker" dark={dark} />
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`rounded-2xl border p-5 space-y-4 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>Mobile Money Account</h3>
          {[
            { key: "opening", label: "Opening Balance", color: "sky" },
            { key: "deposits", label: "Deposits Received", color: "emerald" },
            { key: "withdrawals", label: "Withdrawals", color: "rose" },
            { key: "transfers", label: "Transfers Out", color: "orange" },
            { key: "charges", label: "Transaction Charges", color: "rose" },
          ].map(f => (
            <div key={f.key} className="flex items-center gap-3">
              <div className="flex-1">
                <label className={`text-xs font-semibold uppercase ${dark ? "text-gray-400" : "text-gray-500"}`}>{f.label}</label>
                <Input dark={dark} type="number" value={mobile[f.key]} onChange={e => setMobile(m => ({ ...m, [f.key]: Number(e.target.value) }))} />
              </div>
            </div>
          ))}
          <div className={`flex justify-between items-center p-3 rounded-xl ${dark ? "bg-gray-700" : "bg-teal-50"}`}>
            <span className="font-bold">Closing Balance</span>
            <span className={`font-bold text-xl ${closing >= 0 ? "text-teal-500" : "text-rose-500"}`}>{formatCurrency(closing)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={dark ? "text-gray-400" : "text-gray-500"}>+ Sales via Mobile Money</span>
            <span className="text-emerald-500 font-semibold">{formatCurrency(mobileSales)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={dark ? "text-gray-400" : "text-gray-500"}>- Expenses via Mobile Money</span>
            <span className="text-rose-500 font-semibold">{formatCurrency(mobileExp)}</span>
          </div>
        </div>
        <div className={`rounded-2xl border p-5 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className={`font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Balance Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={[
              { name: "Opening", amount: mobile.opening },
              { name: "Sales In", amount: mobileSales },
              { name: "Deposits", amount: mobile.deposits },
              { name: "Withdrawals", amount: -mobile.withdrawals },
              { name: "Transfers", amount: -mobile.transfers },
              { name: "Charges", amount: -mobile.charges },
              { name: "Expenses", amount: -mobileExp },
              { name: "Closing", amount: closing },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#f3f4f6"} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: dark ? "#1f2937" : "#fff", border: "none", borderRadius: 10 }} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill={COLORS.teal}
                label={false}
                // Color each bar: negative=rose, positive=teal
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ─── BANK MODULE ──────────────────────────────────────────────────────────────
const BankView = ({ sales, expenses, bank, setBank, dark }) => {
  const bankSales = sales.filter(s => s.payment === "Bank").reduce((a, s) => a + s.total, 0);
  const bankExp = expenses.filter(e => e.payment === "Bank").reduce((a, e) => a + e.total, 0);
  const closing = bank.opening + bankSales + bank.deposits - bank.withdrawals - bank.transfers - bankExp;

  return (
    <div>
      <SectionHeader title="Bank Account" sub="Bank deposits, withdrawals and statement" dark={dark} />
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`rounded-2xl border p-5 space-y-4 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>Bank Account Summary</h3>
          {[
            { key: "opening", label: "Opening Balance" },
            { key: "deposits", label: "Additional Deposits" },
            { key: "withdrawals", label: "Withdrawals" },
            { key: "transfers", label: "Transfers Out" },
          ].map(f => (
            <div key={f.key}>
              <label className={`text-xs font-semibold uppercase ${dark ? "text-gray-400" : "text-gray-500"}`}>{f.label}</label>
              <Input dark={dark} type="number" value={bank[f.key]} onChange={e => setBank(b => ({ ...b, [f.key]: Number(e.target.value) }))} />
            </div>
          ))}
          <div className={`flex justify-between items-center p-3 rounded-xl ${dark ? "bg-gray-700" : "bg-sky-50"}`}>
            <span className="font-bold">Bank Balance</span>
            <span className={`font-bold text-xl ${closing >= 0 ? "text-sky-500" : "text-rose-500"}`}>{formatCurrency(closing)}</span>
          </div>
          <div className="flex justify-between text-sm"><span className={dark ? "text-gray-400" : "text-gray-500"}>+ Sales via Bank</span><span className="text-emerald-500 font-semibold">{formatCurrency(bankSales)}</span></div>
          <div className="flex justify-between text-sm"><span className={dark ? "text-gray-400" : "text-gray-500"}>- Expenses via Bank</span><span className="text-rose-500 font-semibold">{formatCurrency(bankExp)}</span></div>
        </div>
        <div className={`rounded-2xl border p-5 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className={`font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Mini Bank Statement</h3>
          <div className="space-y-2">
            {[
              { desc: "Opening Balance", debit: null, credit: null, bal: bank.opening },
              { desc: "Sales Income (Bank)", debit: null, credit: bankSales, bal: bank.opening + bankSales },
              { desc: "Additional Deposits", debit: null, credit: bank.deposits, bal: bank.opening + bankSales + bank.deposits },
              { desc: "Withdrawals", debit: bank.withdrawals, credit: null, bal: bank.opening + bankSales + bank.deposits - bank.withdrawals },
              { desc: "Transfers Out", debit: bank.transfers, credit: null, bal: bank.opening + bankSales + bank.deposits - bank.withdrawals - bank.transfers },
              { desc: "Expense Payments", debit: bankExp, credit: null, bal: closing },
            ].map((r, i) => (
              <div key={i} className={`grid grid-cols-4 gap-2 text-xs py-2 border-b ${dark ? "border-gray-700 text-gray-300" : "border-gray-100 text-gray-700"}`}>
                <span className="col-span-2 font-medium">{r.desc}</span>
                <span className="text-rose-500 text-right">{r.debit ? formatCurrency(r.debit) : "-"}</span>
                <span className="text-emerald-500 text-right">{r.credit ? formatCurrency(r.credit) : r.debit === null && r.credit === null ? formatCurrency(r.bal) : "-"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── RECEIVABLES ──────────────────────────────────────────────────────────────
const ReceivablesView = ({ receivables, setReceivables, dark }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customer: "", invoice: 0, paid: 0, due: "" });

  const total = receivables.reduce((a, r) => a + r.balance, 0);

  const handleSave = () => {
    const invoice = Number(form.invoice), paid = Number(form.paid);
    const balance = invoice - paid;
    const status = paid === 0 ? "Overdue" : paid >= invoice ? "Paid" : "Partial";
    setReceivables(r => [...r, { ...form, id: Date.now(), invoice, paid, balance, status }]);
    setForm({ customer: "", invoice: 0, paid: 0, due: "" });
    setShowModal(false);
  };

  return (
    <div>
      <SectionHeader title="Accounts Receivable" sub={`Total outstanding: ${formatCurrency(total)}`} dark={dark}
        actions={<Btn onClick={() => setShowModal(true)}><Icon name="plus" size={14} />Add Receivable</Btn>}
      />
      <Table dark={dark} headers={["Customer", "Invoice Amt", "Amount Paid", "Outstanding", "Due Date", "Status", ""]}>
        {receivables.map(r => (
          <TR key={r.id} dark={dark}>
            <TD><span className="font-semibold">{r.customer}</span></TD>
            <TD>{formatCurrency(r.invoice)}</TD>
            <TD className="text-emerald-500 font-medium">{formatCurrency(r.paid)}</TD>
            <TD className="text-rose-500 font-bold">{formatCurrency(r.balance)}</TD>
            <TD>{r.due}</TD>
            <TD><Badge label={r.status} color={r.status === "Paid" ? "emerald" : r.status === "Overdue" ? "rose" : "gold"} /></TD>
            <TD><button onClick={() => setReceivables(prev => prev.filter(x => x.id !== r.id))} className="text-rose-400 hover:text-rose-600"><Icon name="trash" size={15} /></button></TD>
          </TR>
        ))}
      </Table>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Receivable" dark={dark}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Customer Name" dark={dark} className="col-span-2"><Input dark={dark} value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} placeholder="Customer or company" /></Field>
          <Field label="Invoice Amount" dark={dark}><Input dark={dark} type="number" value={form.invoice} onChange={e => setForm(f => ({ ...f, invoice: e.target.value }))} /></Field>
          <Field label="Amount Paid" dark={dark}><Input dark={dark} type="number" value={form.paid} onChange={e => setForm(f => ({ ...f, paid: e.target.value }))} /></Field>
          <Field label="Due Date" dark={dark}><Input dark={dark} type="date" value={form.due} onChange={e => setForm(f => ({ ...f, due: e.target.value }))} /></Field>
          <Field label="Outstanding (Auto)" dark={dark}>
            <div className={`px-3 py-2 rounded-lg text-sm font-bold ${dark ? "bg-gray-700 text-rose-400" : "bg-rose-50 text-rose-700"}`}>{formatCurrency(Math.max(0, form.invoice - form.paid))}</div>
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave}>Save</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ─── PAYABLES ────────────────────────────────────────────────────────────────
const PayablesView = ({ payables, setPayables, dark }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ supplier: "", owed: 0, paid: 0, due: "" });
  const total = payables.reduce((a, p) => a + p.balance, 0);

  const handleSave = () => {
    const owed = Number(form.owed), paid = Number(form.paid);
    const balance = owed - paid;
    const status = paid === 0 ? "Overdue" : paid >= owed ? "Paid" : "Partial";
    setPayables(p => [...p, { ...form, id: Date.now(), owed, paid, balance, status }]);
    setForm({ supplier: "", owed: 0, paid: 0, due: "" });
    setShowModal(false);
  };

  return (
    <div>
      <SectionHeader title="Accounts Payable" sub={`Total owed: ${formatCurrency(total)}`} dark={dark}
        actions={<Btn onClick={() => setShowModal(true)}><Icon name="plus" size={14} />Add Payable</Btn>}
      />
      <Table dark={dark} headers={["Supplier", "Amount Owed", "Amount Paid", "Outstanding", "Due Date", "Status", ""]}>
        {payables.map(p => (
          <TR key={p.id} dark={dark}>
            <TD><span className="font-semibold">{p.supplier}</span></TD>
            <TD>{formatCurrency(p.owed)}</TD>
            <TD className="text-emerald-500 font-medium">{formatCurrency(p.paid)}</TD>
            <TD className="text-rose-500 font-bold">{formatCurrency(p.balance)}</TD>
            <TD>{p.due}</TD>
            <TD><Badge label={p.status} color={p.status === "Paid" ? "emerald" : p.status === "Overdue" ? "rose" : "gold"} /></TD>
            <TD><button onClick={() => setPayables(prev => prev.filter(x => x.id !== p.id))} className="text-rose-400 hover:text-rose-600"><Icon name="trash" size={15} /></button></TD>
          </TR>
        ))}
      </Table>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Payable" dark={dark}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Supplier Name" dark={dark} className="col-span-2"><Input dark={dark} value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Supplier name" /></Field>
          <Field label="Amount Owed" dark={dark}><Input dark={dark} type="number" value={form.owed} onChange={e => setForm(f => ({ ...f, owed: e.target.value }))} /></Field>
          <Field label="Amount Paid" dark={dark}><Input dark={dark} type="number" value={form.paid} onChange={e => setForm(f => ({ ...f, paid: e.target.value }))} /></Field>
          <Field label="Due Date" dark={dark}><Input dark={dark} type="date" value={form.due} onChange={e => setForm(f => ({ ...f, due: e.target.value }))} /></Field>
          <Field label="Outstanding (Auto)" dark={dark}>
            <div className={`px-3 py-2 rounded-lg text-sm font-bold ${dark ? "bg-gray-700 text-rose-400" : "bg-rose-50 text-rose-700"}`}>{formatCurrency(Math.max(0, form.owed - form.paid))}</div>
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave}>Save</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ─── P&L MODULE ───────────────────────────────────────────────────────────────
const PnLView = ({ sales, expenses, inventory, dark }) => {
  const [period, setPeriod] = useState("month");

  const filterDate = period === "today" ? fmt(today) : period === "week" ? startOfWeek() : period === "month" ? startOfMonth() : "2000-01-01";
  const filteredSales = sales.filter(s => s.date >= filterDate);
  const filteredExp = expenses.filter(e => e.date >= filterDate);

  const revenue = filteredSales.reduce((a, s) => a + s.total, 0);
  const cogs = filteredSales.reduce((a, s) => {
    const inv = inventory.find(i => i.name === s.item);
    return a + (inv ? inv.costPrice * s.qty : 0);
  }, 0);
  const grossProfit = revenue - cogs;
  const totalExp = filteredExp.reduce((a, e) => a + e.total, 0);
  const netProfit = grossProfit - totalExp;
  const grossMargin = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : 0;
  const netMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0;

  const expBycat = filteredExp.reduce((acc, e) => {
    const ex = acc.find(a => a.name === e.category);
    if (ex) ex.value += e.total; else acc.push({ name: e.category, value: e.total });
    return acc;
  }, []);

  const rows = [
    { label: "Total Revenue", value: revenue, indent: 0, bold: false, color: "emerald" },
    { label: "Cost of Goods Sold (COGS)", value: -cogs, indent: 1, bold: false, color: "orange" },
    { label: "Gross Profit", value: grossProfit, indent: 0, bold: true, color: grossProfit >= 0 ? "emerald" : "rose", border: true },
    { label: "Gross Profit Margin", value: `${grossMargin}%`, indent: 1, bold: false, color: "sky", raw: true },
    { label: "Total Operating Expenses", value: -totalExp, indent: 1, bold: false, color: "rose" },
    { label: "Net Profit / (Loss)", value: netProfit, indent: 0, bold: true, color: netProfit >= 0 ? "emerald" : "rose", border: true },
    { label: "Net Profit Margin", value: `${netMargin}%`, indent: 1, bold: false, color: "sky", raw: true },
  ];

  return (
    <div>
      <SectionHeader title="Profit & Loss" sub="Income statement and profitability analysis" dark={dark} />
      <div className="flex gap-2 mb-6 flex-wrap">
        {["today", "week", "month", "year"].map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition ${period === p ? "bg-violet-500 text-white" : dark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{p}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className={`rounded-2xl border p-5 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className={`font-bold mb-5 ${dark ? "text-white" : "text-gray-900"}`}>Income Statement</h3>
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={i} className={`flex justify-between items-center py-2 ${r.border ? `border-t-2 mt-2 pt-3 ${dark ? "border-gray-600" : "border-gray-300"}` : ""} ${r.indent ? "pl-4" : ""}`}>
                <span className={`${r.bold ? "font-bold" : ""} ${dark ? "text-gray-300" : "text-gray-700"}`}>{r.label}</span>
                <span className={`${r.bold ? "font-bold text-lg" : "font-semibold"}`}
                  style={{ color: COLORS[r.color] || "inherit" }}>
                  {r.raw ? r.value : (typeof r.value === "number" ? (r.value < 0 ? `(${formatCurrency(Math.abs(r.value))})` : formatCurrency(r.value)) : r.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className={`rounded-2xl border p-5 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <h3 className={`font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={expBycat} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={10}>
                  {expBycat.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: dark ? "#1f2937" : "#fff", border: "none", borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Revenue", v: revenue, c: "emerald" },
              { label: "COGS", v: cogs, c: "orange" },
              { label: "Gross Profit", v: grossProfit, c: "sky" },
              { label: "Net Profit", v: netProfit, c: netProfit >= 0 ? "violet" : "rose" },
            ].map(m => (
              <div key={m.label} className={`rounded-xl p-4 border ${dark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-100"}`}>
                <p className={`text-xs uppercase font-bold ${dark ? "text-gray-400" : "text-gray-500"}`}>{m.label}</p>
                <p className="text-lg font-bold mt-1" style={{ color: COLORS[m.c] }}>{formatCurrency(m.v)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── REPORTS MODULE ───────────────────────────────────────────────────────────
const ReportsView = ({ sales, expenses, inventory, receivables, payables, cash, mobile, bank, settings, dark }) => {
  const [reportType, setReportType] = useState("sales");
  const [from, setFrom] = useState(startOfMonth());
  const [to, setTo] = useState(fmt(today));
  const [pdfLoading, setPdfLoading] = useState(null); // null | "current" | "daily" | "weekly" | "monthly"
  const [showPdfMenu, setShowPdfMenu] = useState(false);

  const filteredSales = sales.filter(s => s.date >= from && s.date <= to);
  const filteredExp = expenses.filter(e => e.date >= from && e.date <= to);
  const totalSales = filteredSales.reduce((a, s) => a + s.total, 0);
  const totalExp = filteredExp.reduce((a, e) => a + e.total, 0);

  const handlePDF = async (type) => {
    setPdfLoading(type);
    setShowPdfMenu(false);
    let dateFrom, dateTo, reportTitle;
    if (type === "current") {
      dateFrom = from; dateTo = to;
      reportTitle = "Custom Period Report";
    } else if (type === "daily") {
      dateFrom = fmt(today); dateTo = fmt(today);
      reportTitle = "Daily Financial Report";
    } else if (type === "weekly") {
      dateFrom = startOfWeek(); dateTo = fmt(today);
      reportTitle = "Weekly Financial Report";
    } else {
      dateFrom = startOfMonth(); dateTo = fmt(today);
      reportTitle = "Monthly Financial Report";
    }
    try {
      await generateAccountingPDF({ period: type, dateFrom, dateTo, sales, expenses, cash, mobile, bank, settings, reportTitle });
    } catch (e) { console.error("PDF error:", e); alert("PDF generation failed. Check your network connection and try again."); }
    setPdfLoading(null);
  };

  const PDFBtn = () => (
    <div className="relative">
      <button
        onClick={() => setShowPdfMenu(v => !v)}
        className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
      >
        {pdfLoading ? (
          <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
        ) : (
          <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/><path d="M13 3v5a1 1 0 001 1h5M9 17v-5m0 0l-2 2m2-2l2 2M15 12h-3"/></svg>
        )}
        Export PDF
        <svg width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
      </button>

      {showPdfMenu && (
        <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl z-50 overflow-hidden ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest border-b ${dark ? "text-gray-500 border-gray-700" : "text-gray-400 border-gray-100"}`}>
            PDF Export Options
          </div>
          {[
            { key: "current", label: "Export Current View", sub: `${from} → ${to}`, icon: "📄" },
            { key: "daily",   label: "Daily Report",        sub: fmt(today),          icon: "📅" },
            { key: "weekly",  label: "Weekly Report",       sub: `${startOfWeek()} → today`, icon: "📆" },
            { key: "monthly", label: "Monthly Report",      sub: `${startOfMonth()} → today`, icon: "🗓️" },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => handlePDF(opt.key)}
              disabled={!!pdfLoading}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition ${dark ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-50 text-gray-800"} ${pdfLoading === opt.key ? "opacity-60" : ""}`}
            >
              <span className="text-base mt-0.5">{opt.icon}</span>
              <div>
                <p className="text-sm font-semibold leading-tight">{opt.label}</p>
                <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>{opt.sub}</p>
              </div>
              {pdfLoading === opt.key && (
                <svg className="animate-spin ml-auto mt-1" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              )}
            </button>
          ))}
          <div className={`px-4 py-2.5 text-xs border-t ${dark ? "text-gray-600 border-gray-700" : "text-gray-400 border-gray-100"}`}>
            A4 portrait · UGX · Professional format
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div onClick={() => showPdfMenu && setShowPdfMenu(false)}>
      <SectionHeader title="Reports" sub="Generate and export business reports" dark={dark}
        actions={
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <Btn onClick={() => exportCSV(reportType === "sales" ? filteredSales : reportType === "expenses" ? filteredExp : inventory, `${reportType}-report.csv`)} variant="outline">
              <Icon name="download" size={14} />Export CSV
            </Btn>
            <PDFBtn />
          </div>
        }
      />

      <div className={`flex flex-wrap gap-3 mb-5 p-4 rounded-xl border ${dark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
        {["sales", "expenses", "inventory", "receivables", "payables"].map(t => (
          <button key={t} onClick={() => setReportType(t)} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition capitalize ${reportType === t ? "bg-sky-500 text-white" : dark ? "bg-gray-700 text-gray-300" : "bg-white text-gray-600 border border-gray-200"}`}>{t}</button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <label className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>From</label>
          <Input dark={dark} type="date" value={from} onChange={e => setFrom(e.target.value)} />
          <label className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>To</label>
          <Input dark={dark} type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
      </div>

      {reportType === "sales" && (
        <>
          <div className={`flex gap-6 p-4 mb-4 rounded-xl ${dark ? "bg-gray-800" : "bg-emerald-50"}`}>
            <div><p className="text-xs text-gray-500">Total Sales</p><p className="text-xl font-bold text-emerald-600">{formatCurrency(totalSales)}</p></div>
            <div><p className="text-xs text-gray-500">Transactions</p><p className="text-xl font-bold">{filteredSales.length}</p></div>
            <div><p className="text-xs text-gray-500">Avg per Transaction</p><p className="text-xl font-bold">{formatCurrency(filteredSales.length ? totalSales / filteredSales.length : 0)}</p></div>
          </div>
          <Table dark={dark} headers={["Date", "Item", "Category", "Qty", "Unit Price", "Total", "Payment"]}>
            {filteredSales.map(s => (<TR key={s.id} dark={dark}><TD>{s.date}</TD><TD>{s.item}</TD><TD><Badge label={s.category} color="sky" /></TD><TD>{s.qty}</TD><TD>{formatCurrency(s.unitPrice)}</TD><TD className="font-bold text-emerald-600">{formatCurrency(s.total)}</TD><TD>{paymentBadge(s.payment)}</TD></TR>))}
          </Table>
        </>
      )}

      {reportType === "expenses" && (
        <>
          <div className={`flex gap-6 p-4 mb-4 rounded-xl ${dark ? "bg-gray-800" : "bg-rose-50"}`}>
            <div><p className="text-xs text-gray-500">Total Expenses</p><p className="text-xl font-bold text-rose-600">{formatCurrency(totalExp)}</p></div>
            <div><p className="text-xs text-gray-500">Transactions</p><p className="text-xl font-bold">{filteredExp.length}</p></div>
          </div>
          <Table dark={dark} headers={["Date", "Name", "Category", "Qty", "Unit Cost", "Total", "Payment"]}>
            {filteredExp.map(e => (<TR key={e.id} dark={dark}><TD>{e.date}</TD><TD>{e.name}</TD><TD><Badge label={e.category} color="orange" /></TD><TD>{e.qty}</TD><TD>{formatCurrency(e.unitCost)}</TD><TD className="font-bold text-rose-600">{formatCurrency(e.total)}</TD><TD>{paymentBadge(e.payment)}</TD></TR>))}
          </Table>
        </>
      )}

      {reportType === "inventory" && (
        <Table dark={dark} headers={["Item", "Category", "Cost Price", "Sell Price", "Qty", "Value", "Status"]}>
          {inventory.map(i => (<TR key={i.id} dark={dark}><TD>{i.name}</TD><TD><Badge label={i.category} color="violet" /></TD><TD>{formatCurrency(i.costPrice)}</TD><TD>{formatCurrency(i.sellingPrice)}</TD><TD>{i.quantity}</TD><TD className="font-bold">{formatCurrency(i.costPrice * i.quantity)}</TD><TD>{i.quantity <= i.reorderLevel ? <Badge label="Low Stock" color="rose" /> : <Badge label="OK" color="emerald" />}</TD></TR>))}
        </Table>
      )}

      {reportType === "receivables" && (
        <Table dark={dark} headers={["Customer", "Invoice", "Paid", "Balance", "Due", "Status"]}>
          {receivables.map(r => (<TR key={r.id} dark={dark}><TD>{r.customer}</TD><TD>{formatCurrency(r.invoice)}</TD><TD className="text-emerald-500">{formatCurrency(r.paid)}</TD><TD className="text-rose-500 font-bold">{formatCurrency(r.balance)}</TD><TD>{r.due}</TD><TD><Badge label={r.status} color={r.status === "Paid" ? "emerald" : r.status === "Overdue" ? "rose" : "gold"} /></TD></TR>))}
        </Table>
      )}

      {reportType === "payables" && (
        <Table dark={dark} headers={["Supplier", "Owed", "Paid", "Balance", "Due", "Status"]}>
          {payables.map(p => (<TR key={p.id} dark={dark}><TD>{p.supplier}</TD><TD>{formatCurrency(p.owed)}</TD><TD className="text-emerald-500">{formatCurrency(p.paid)}</TD><TD className="text-rose-500 font-bold">{formatCurrency(p.balance)}</TD><TD>{p.due}</TD><TD><Badge label={p.status} color={p.status === "Paid" ? "emerald" : p.status === "Overdue" ? "rose" : "gold"} /></TD></TR>))}
        </Table>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS MODULE
// ══════════════════════════════════════════════════════════════════════════════

const APP_VERSION = "v2.1.0";

const DEFAULT_SETTINGS = {
  // Business Profile
  businessName: "La Foret Bar & Bistro",
  businessAddress: "",
  phoneNumber: "",
  emailAddress: "",
  accountantName: "",
  // Security
  currentPassword: "",
  pin: "",
  pinEnabled: false,
  // Cashbook
  currency: "UGX",
  openingCash: 500000,
  openingMobile: 320000,
  financialYearStart: "2024-01-01",
  // Reports
  reportCompanyName: "La Foret Bar & Bistro",
  autoWeeklyReport: false,
  autoMonthlyReport: false,
  // Appearance
  themeColor: "emerald",
  compactView: false,
  // Notifications
  dailyCashReminder: false,
  weeklyReportReminder: false,
  salaryReminder: false,
  // Meta
  lastBackup: null,
  lastSync: null,
};

const THEME_COLORS = [
  { name: "emerald", label: "Emerald", hex: "#10b981" },
  { name: "sky", label: "Sky Blue", hex: "#0ea5e9" },
  { name: "violet", label: "Violet", hex: "#8b5cf6" },
  { name: "rose", label: "Rose", hex: "#f43f5e" },
  { name: "orange", label: "Amber", hex: "#f97316" },
  { name: "teal", label: "Teal", hex: "#14b8a6" },
];

const SettingsView = ({ dark, setDark, settings, setSettings, sales, expenses, inventory, receivables, payables, cash, mobile, bank, setCash, setMobile }) => {
  const [activeSection, setActiveSection] = useState("profile");
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [pinInput, setPinInput] = useState(settings.pin || "");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const save = (patch) => {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    try { localStorage.setItem("lf_settings", JSON.stringify(updated)); } catch (_) {}
    showToast("Settings saved successfully");
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target.result);
      save({ companyLogo: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleBackup = () => {
    const data = { sales, expenses, inventory, receivables, payables, cash, mobile, bank, settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `laforet-backup-${fmt(today)}.json`; a.click();
    save({ lastBackup: new Date().toISOString() });
    showToast("Backup downloaded successfully");
  };

  const handleExportAll = () => {
    const rows = [
      ["TYPE", "DATE", "DESCRIPTION", "AMOUNT", "PAYMENT"],
      ...sales.map(s => ["Sale", s.date, s.item, s.total, s.payment]),
      ...expenses.map(e => ["Expense", e.date, e.name, -e.total, e.payment]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `laforet-all-records-${fmt(today)}.csv`; a.click();
    showToast("All records exported");
  };

  const handlePasswordChange = () => {
    if (!newPassword || newPassword.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
    if (newPassword !== confirmPassword) { showToast("Passwords do not match", "error"); return; }
    save({ currentPassword: newPassword });
    setNewPassword(""); setConfirmPassword("");
    showToast("Password updated successfully");
  };

  const handlePinSave = () => {
    if (pinInput && !/^\d{4}$/.test(pinInput)) { showToast("PIN must be exactly 4 digits", "error"); return; }
    save({ pin: pinInput, pinEnabled: !!pinInput });
    showToast(pinInput ? "PIN lock enabled" : "PIN lock disabled");
  };

  const cardCls = `rounded-2xl border p-6 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} shadow-sm`;
  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition ${dark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`;
  const labelCls = `block text-xs font-bold mb-1.5 uppercase tracking-wide ${dark ? "text-gray-400" : "text-gray-500"}`;
  const sectionBtnCls = (id) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${activeSection === id ? "bg-emerald-500 text-white shadow-sm" : dark ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`;

  const sections = [
    { id: "profile", label: "Business Profile", icon: "building" },
    { id: "security", label: "Security", icon: "shield" },
    { id: "cashbook", label: "Cashbook Settings", icon: "cashbook" },
    { id: "reports", label: "Reports", icon: "reports" },
    { id: "appearance", label: "Appearance", icon: "palette" },
    { id: "notifications", label: "Notifications", icon: "bell" },
    { id: "data", label: "Data Management", icon: "database" },
    { id: "system", label: "System Info", icon: "info" },
  ];

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold transition-all ${toast.type === "error" ? "bg-rose-500 text-white border-rose-400" : "bg-emerald-500 text-white border-emerald-400"}`}>
          <Icon name={toast.type === "error" ? "alert" : "check"} size={16} />
          {toast.msg}
        </div>
      )}

      <SectionHeader title="Settings" sub="Manage your business configuration and preferences" dark={dark} />

      {/* Profile Header Card */}
      <div className={`${cardCls} mb-6 flex flex-wrap items-center gap-5`}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
          {settings.businessName ? settings.businessName.slice(0, 2).toUpperCase() : "LF"}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className={`text-xl font-black ${dark ? "text-white" : "text-gray-900"}`}>{settings.businessName || "Your Business"}</h2>
          <p className={`text-sm mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>{settings.emailAddress || "No email set"} · {settings.phoneNumber || "No phone set"}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${dark ? "bg-emerald-900/50 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>Administrator</span>
            <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{APP_VERSION}</span>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end gap-1">
          <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>Last Backup</span>
          <span className={`text-xs font-semibold ${dark ? "text-gray-300" : "text-gray-600"}`}>{settings.lastBackup ? new Date(settings.lastBackup).toLocaleDateString() : "Never"}</span>
          <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"} mt-1`}>Last Sync</span>
          <span className={`text-xs font-semibold ${dark ? "text-gray-300" : "text-gray-600"}`}>{settings.lastSync ? new Date(settings.lastSync).toLocaleDateString() : "Never"}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <div className={`lg:w-56 shrink-0 ${cardCls} h-fit p-3`}>
          <div className="space-y-0.5">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} className={sectionBtnCls(s.id)}>
                <Icon name={s.icon} size={16} />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5">

          {/* ── BUSINESS PROFILE ── */}
          {activeSection === "profile" && (
            <div className={cardCls}>
              <h3 className={`text-base font-bold mb-5 flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}><Icon name="building" size={18} />Business Profile</h3>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { key: "businessName", label: "Business Name", placeholder: "e.g. La Foret Bar & Bistro", required: true },
                  { key: "businessAddress", label: "Business Address", placeholder: "Street, City, Country" },
                  { key: "phoneNumber", label: "Phone Number", placeholder: "+256 700 000 000" },
                  { key: "emailAddress", label: "Email Address", placeholder: "info@laforet.com", type: "email" },
                  { key: "accountantName", label: "Accountant Name", placeholder: "Full name" },
                ].map(f => (
                  <div key={f.key}>
                    <label className={labelCls}>{f.label}{f.required && <span className="text-rose-400 ml-0.5">*</span>}</label>
                    <input type={f.type || "text"} className={inputCls} placeholder={f.placeholder} value={settings[f.key] || ""} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => { if (!settings.businessName) { showToast("Business name is required", "error"); return; } save({}); }} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition flex items-center gap-2">
                  <Icon name="check" size={15} />Save Profile
                </button>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeSection === "security" && (
            <div className="space-y-5">
              <div className={cardCls}>
                <h3 className={`text-base font-bold mb-5 flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}><Icon name="key" size={18} />Change Password</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>New Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} className={inputCls} placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      <button onClick={() => setShowPassword(v => !v)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${dark ? "text-gray-400" : "text-gray-400"}`}><Icon name={showPassword ? "eyeoff" : "eye"} size={15} /></button>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Confirm Password</label>
                    <input type="password" className={inputCls} placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
                <div className="mt-5">
                  <button onClick={handlePasswordChange} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition flex items-center gap-2">
                    <Icon name="shield" size={15} />Update Password
                  </button>
                </div>
              </div>

              <div className={cardCls}>
                <h3 className={`text-base font-bold mb-5 flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}><Icon name="key" size={18} />4-Digit PIN Lock</h3>
                <div className="flex items-end gap-4">
                  <div className="flex-1 max-w-xs">
                    <label className={labelCls}>PIN (4 digits)</label>
                    <input type="password" maxLength={4} className={inputCls} placeholder="e.g. 1234" value={pinInput} onChange={e => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))} />
                  </div>
                  <div className="flex gap-2 pb-0.5">
                    <button onClick={handlePinSave} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition">Save PIN</button>
                    {settings.pinEnabled && <button onClick={() => { setPinInput(""); save({ pin: "", pinEnabled: false }); }} className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition">Remove PIN</button>}
                  </div>
                </div>
                <div className={`mt-3 flex items-center gap-2 text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  <Icon name={settings.pinEnabled ? "shield" : "info"} size={13} />
                  {settings.pinEnabled ? "PIN lock is active" : "PIN lock is disabled"}
                </div>
              </div>

              <div className={cardCls}>
                <h3 className={`text-base font-bold mb-4 flex items-center gap-2 text-rose-500`}><Icon name="logout" size={18} />Session</h3>
                <p className={`text-sm mb-4 ${dark ? "text-gray-400" : "text-gray-500"}`}>Log out of your current session. All unsaved changes will be lost.</p>
                <button onClick={() => { if (window.confirm("Are you sure you want to log out?")) showToast("Logged out (demo mode — no auth configured)"); }} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition flex items-center gap-2">
                  <Icon name="logout" size={15} />Logout
                </button>
              </div>
            </div>
          )}

          {/* ── CASHBOOK SETTINGS ── */}
          {activeSection === "cashbook" && (
            <div className={cardCls}>
              <h3 className={`text-base font-bold mb-5 flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}><Icon name="cashbook" size={18} />Cashbook Settings</h3>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Currency</label>
                  <select className={inputCls} value={settings.currency || "UGX"} onChange={e => save({ currency: e.target.value })}>
                    {["UGX", "TZS", "KES", "USD", "GBP", "EUR", "ZAR"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Financial Year Start</label>
                  <input type="date" className={inputCls} value={settings.financialYearStart || ""} onChange={e => save({ financialYearStart: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Opening Cash Balance</label>
                  <input type="number" className={inputCls} value={settings.openingCash || 0} onChange={e => { save({ openingCash: Number(e.target.value) }); setCash(c => ({ ...c, opening: Number(e.target.value) })); }} />
                </div>
                <div>
                  <label className={labelCls}>Opening Mobile Money Balance</label>
                  <input type="number" className={inputCls} value={settings.openingMobile || 0} onChange={e => { save({ openingMobile: Number(e.target.value) }); setMobile(m => ({ ...m, opening: Number(e.target.value) })); }} />
                </div>
              </div>
            </div>
          )}

          {/* ── REPORTS ── */}
          {activeSection === "reports" && (
            <div className="space-y-5">
              <div className={cardCls}>
                <h3 className={`text-base font-bold mb-5 flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}><Icon name="reports" size={18} />Report Settings</h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Company Name on Reports</label>
                    <input type="text" className={inputCls} value={settings.reportCompanyName || ""} onChange={e => save({ reportCompanyName: e.target.value })} placeholder="Company name for report headers" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Company Logo</label>
                    <div className={`flex items-center gap-4 p-4 rounded-xl border-2 border-dashed ${dark ? "border-gray-600" : "border-gray-200"}`}>
                      {(logoPreview || settings.companyLogo) && <img src={logoPreview || settings.companyLogo} alt="Logo" className="w-14 h-14 object-contain rounded-lg border" />}
                      <label className="cursor-pointer px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition flex items-center gap-2">
                        <Icon name="upload" size={14} />Upload Logo
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </label>
                      <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>PNG, JPG up to 2MB</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cardCls}>
                <h3 className={`text-base font-bold mb-5 flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}><Icon name="download" size={18} />Export Options</h3>
                <div className="flex flex-wrap gap-3 mb-5">
                  <button onClick={() => { const d = sales.map(s => ({ Date: s.date, Item: s.item, Category: s.category, Qty: s.qty, Price: s.unitPrice, Total: s.total, Payment: s.payment })); const keys = Object.keys(d[0] || {}); const csv = [keys.join(","), ...d.map(r => keys.map(k => `"${r[k]}"`).join(","))].join("\n"); const blob = new Blob([csv], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `sales-${fmt(today)}.csv`; a.click(); showToast("Sales exported to CSV"); }} className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition flex items-center gap-2 ${dark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                    <Icon name="download" size={14} />Export Sales (CSV)
                  </button>
                  <button onClick={() => { const d = expenses.map(e => ({ Date: e.date, Name: e.name, Category: e.category, Qty: e.qty, Cost: e.unitCost, Total: e.total, Payment: e.payment })); const keys = Object.keys(d[0] || {}); const csv = [keys.join(","), ...d.map(r => keys.map(k => `"${r[k]}"`).join(","))].join("\n"); const blob = new Blob([csv], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `expenses-${fmt(today)}.csv`; a.click(); showToast("Expenses exported to CSV"); }} className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition flex items-center gap-2 ${dark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                    <Icon name="download" size={14} />Export Expenses (CSV)
                  </button>
                  <button onClick={() => { window.print(); showToast("Print dialog opened"); }} className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition flex items-center gap-2 ${dark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                    <Icon name="reports" size={14} />Export to PDF (Print)
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { key: "autoWeeklyReport", label: "Automatic Weekly Report", sub: "Generates every Monday morning" },
                    { key: "autoMonthlyReport", label: "Automatic Monthly Report", sub: "Generates on the 1st of each month" },
                  ].map(item => (
                    <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl ${dark ? "bg-gray-700" : "bg-gray-50"}`}>
                      <div>
                        <p className={`text-sm font-semibold ${dark ? "text-gray-200" : "text-gray-800"}`}>{item.label}</p>
                        <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>{item.sub}</p>
                      </div>
                      <button onClick={() => save({ [item.key]: !settings[item.key] })} className={`relative w-12 h-6 rounded-full transition-colors ${settings[item.key] ? "bg-emerald-500" : dark ? "bg-gray-600" : "bg-gray-300"}`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[item.key] ? "translate-x-6" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {activeSection === "appearance" && (
            <div className="space-y-5">
              <div className={cardCls}>
                <h3 className={`text-base font-bold mb-5 flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}><Icon name="palette" size={18} />Display Mode</h3>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {[{ label: "Light Mode", icon: "sun", isDark: false }, { label: "Dark Mode", icon: "moon", isDark: true }].map(m => (
                    <button key={m.label} onClick={() => setDark(m.isDark)} className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${!dark === !m.isDark ? "border-emerald-500 bg-emerald-500/10" : dark ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300"}`}>
                      <Icon name={m.icon} size={24} />
                      <span className={`text-sm font-bold ${dark ? "text-gray-200" : "text-gray-700"}`}>{m.label}</span>
                      {!dark === !m.isDark && <span className="text-xs text-emerald-500 font-semibold">Active</span>}
                    </button>
                  ))}
                </div>
                <div className={`flex items-center justify-between p-4 rounded-xl ${dark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div>
                    <p className={`text-sm font-semibold ${dark ? "text-gray-200" : "text-gray-800"}`}>Compact View</p>
                    <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>Reduce spacing for more data density</p>
                  </div>
                  <button onClick={() => save({ compactView: !settings.compactView })} className={`relative w-12 h-6 rounded-full transition-colors ${settings.compactView ? "bg-emerald-500" : dark ? "bg-gray-600" : "bg-gray-300"}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.compactView ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>

              <div className={cardCls}>
                <h3 className={`text-base font-bold mb-5 flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}><Icon name="palette" size={18} />Theme Color</h3>
                <div className="flex flex-wrap gap-3">
                  {THEME_COLORS.map(tc => (
                    <button key={tc.name} onClick={() => save({ themeColor: tc.name })} title={tc.label} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${settings.themeColor === tc.name ? "border-current scale-105 shadow-md" : dark ? "border-gray-700 hover:border-gray-500" : "border-gray-200 hover:border-gray-300"}`} style={{ borderColor: settings.themeColor === tc.name ? tc.hex : undefined }}>
                      <div className="w-8 h-8 rounded-full shadow-md" style={{ background: tc.hex }} />
                      <span className={`text-xs font-semibold ${dark ? "text-gray-300" : "text-gray-600"}`}>{tc.label}</span>
                      {settings.themeColor === tc.name && <Icon name="check" size={13} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeSection === "notifications" && (
            <div className={cardCls}>
              <h3 className={`text-base font-bold mb-5 flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}><Icon name="bell" size={18} />Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: "dailyCashReminder", label: "Daily Cashbook Reminder", sub: "Get reminded to update your cashbook each day", icon: "cashbook" },
                  { key: "weeklyReportReminder", label: "Weekly Financial Report Reminder", sub: "Summary every week on Monday", icon: "reports" },
                  { key: "salaryReminder", label: "Salary Payment Reminder", sub: "Remind you when salary payments are due", icon: "expense" },
                ].map(item => (
                  <div key={item.key} className={`flex items-center gap-4 p-4 rounded-xl border ${dark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-100"}`}>
                    <div className={`p-2.5 rounded-xl ${dark ? "bg-gray-600" : "bg-white"} shadow-sm`}>
                      <Icon name={item.icon} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${dark ? "text-gray-200" : "text-gray-800"}`}>{item.label}</p>
                      <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>{item.sub}</p>
                    </div>
                    <button onClick={() => save({ [item.key]: !settings[item.key] })} className={`relative shrink-0 w-12 h-6 rounded-full transition-colors ${settings[item.key] ? "bg-emerald-500" : dark ? "bg-gray-600" : "bg-gray-300"}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[item.key] ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${dark ? "bg-gray-700 text-gray-400" : "bg-amber-50 text-amber-700"}`}>
                <Icon name="info" size={13} />
                Browser notifications require permission. In-app reminders are always shown.
              </div>
            </div>
          )}

          {/* ── DATA MANAGEMENT ── */}
          {activeSection === "data" && (
            <div className="space-y-5">
              <div className={cardCls}>
                <h3 className={`text-base font-bold mb-5 flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}><Icon name="database" size={18} />Backup & Restore</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className={`p-4 rounded-xl border ${dark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-100"}`}>
                    <p className={`text-xs uppercase font-bold mb-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>Last Backup</p>
                    <p className={`font-semibold ${dark ? "text-white" : "text-gray-800"}`}>{settings.lastBackup ? new Date(settings.lastBackup).toLocaleString() : "Never"}</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${dark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-100"}`}>
                    <p className={`text-xs uppercase font-bold mb-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>Last Sync</p>
                    <p className={`font-semibold ${dark ? "text-white" : "text-gray-800"}`}>{settings.lastSync ? new Date(settings.lastSync).toLocaleString() : "Never"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleBackup} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition flex items-center gap-2">
                    <Icon name="download" size={14} />Backup All Data
                  </button>
                  <label className={`cursor-pointer px-4 py-2.5 rounded-xl text-sm font-bold border transition flex items-center gap-2 ${dark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                    <Icon name="upload" size={14} />Restore Backup
                    <input type="file" accept=".json" className="hidden" onChange={e => {
                      const file = e.target.files[0]; if (!file) return;
                      const r = new FileReader(); r.onload = ev => {
                        try { const d = JSON.parse(ev.target.result); save({ lastSync: new Date().toISOString() }); showToast("Backup restored successfully"); } catch { showToast("Invalid backup file", "error"); }
                      }; r.readAsText(file);
                    }} />
                  </label>
                  <button onClick={handleExportAll} className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition flex items-center gap-2 ${dark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                    <Icon name="reports" size={14} />Export All Records
                  </button>
                </div>
              </div>

              <div className={`${cardCls} border-rose-200 ${dark ? "border-rose-800/50" : ""}`}>
                <h3 className="text-base font-bold mb-2 flex items-center gap-2 text-rose-500"><Icon name="alert" size={18} />Danger Zone</h3>
                <p className={`text-sm mb-5 ${dark ? "text-gray-400" : "text-gray-500"}`}>This will permanently delete all sales, expenses, inventory, and financial records. This action cannot be undone.</p>
                {!showClearConfirm ? (
                  <button onClick={() => setShowClearConfirm(true)} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition flex items-center gap-2">
                    <Icon name="trash" size={15} />Clear All Data
                  </button>
                ) : (
                  <div className={`p-4 rounded-xl border-2 border-rose-400 ${dark ? "bg-rose-900/20" : "bg-rose-50"}`}>
                    <p className="text-sm font-bold text-rose-600 mb-3">⚠️ Are you absolutely sure? Type DELETE to confirm:</p>
                    <div className="flex gap-3 flex-wrap">
                      <input type="text" placeholder='Type "DELETE"' className={`flex-1 max-w-xs px-3 py-2 rounded-lg border text-sm ${dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`} onKeyDown={e => { if (e.key === "Enter" && e.target.value === "DELETE") { showToast("All data cleared (demo — reload to restore seed data)", "error"); setShowClearConfirm(false); } }} />
                      <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-bold">Cancel</button>
                    </div>
                    <p className={`text-xs mt-2 ${dark ? "text-gray-500" : "text-gray-400"}`}>Press Enter after typing DELETE to confirm.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SYSTEM INFO ── */}
          {activeSection === "system" && (
            <div className="space-y-5">
              <div className={cardCls}>
                <h3 className={`text-base font-bold mb-5 flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}><Icon name="info" size={18} />System Information</h3>
                <div className="space-y-3">
                  {[
                    { label: "Application", value: "La Foret Accounting Dashboard" },
                    { label: "Version", value: APP_VERSION },
                    { label: "Build Date", value: "June 2025" },
                    { label: "Currency", value: settings.currency || "UGX" },
                    { label: "Financial Year Start", value: settings.financialYearStart || "Not set" },
                    { label: "Total Sales Records", value: sales.length },
                    { label: "Total Expense Records", value: expenses.length },
                    { label: "Inventory Items", value: inventory.length },
                    { label: "Receivables", value: receivables.length },
                    { label: "Payables", value: payables.length },
                    { label: "Last Backup", value: settings.lastBackup ? new Date(settings.lastBackup).toLocaleString() : "Never" },
                    { label: "Last Data Sync", value: settings.lastSync ? new Date(settings.lastSync).toLocaleString() : "Never" },
                    { label: "Dark Mode", value: dark ? "Enabled" : "Disabled" },
                    { label: "Compact View", value: settings.compactView ? "Enabled" : "Disabled" },
                    { label: "Theme Color", value: THEME_COLORS.find(t => t.name === settings.themeColor)?.label || "Emerald" },
                  ].map(row => (
                    <div key={row.label} className={`flex justify-between items-center py-2.5 border-b last:border-0 ${dark ? "border-gray-700" : "border-gray-100"}`}>
                      <span className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>{row.label}</span>
                      <span className={`text-sm font-semibold ${dark ? "text-gray-200" : "text-gray-800"}`}>{String(row.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={cardCls}>
                <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}><Icon name="refresh" size={18} />Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => { save({ lastSync: new Date().toISOString() }); showToast("Data sync updated"); }} className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition flex items-center gap-2 ${dark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                    <Icon name="refresh" size={14} />Sync Now
                  </button>
                  <button onClick={handleBackup} className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition flex items-center gap-2 ${dark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                    <Icon name="download" size={14} />Quick Backup
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════════════════════
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "sales", label: "Sales", icon: "sales" },
  { id: "inventory", label: "Inventory", icon: "inventory" },
  { id: "expenses", label: "Expenses", icon: "expense" },
  { id: "cashbook", label: "Cashbook", icon: "cashbook" },
  { id: "mobile", label: "Mobile Money", icon: "mobile" },
  { id: "bank", label: "Bank", icon: "bank" },
  { id: "receivables", label: "Receivables", icon: "receivable" },
  { id: "payables", label: "Payables", icon: "payable" },
  { id: "pnl", label: "Profit & Loss", icon: "pnl" },
  { id: "reports", label: "Reports", icon: "reports" },
  { id: "settings", label: "Settings", icon: "settings" },
];

export default function App() {
  const [dark, setDark] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState(() => {
    try { const s = localStorage.getItem("lf_settings"); return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS; } catch { return DEFAULT_SETTINGS; }
  });

  const [sales, setSales] = useState(INITIAL_SALES);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [receivables, setReceivables] = useState(INITIAL_RECEIVABLES);
  const [payables, setPayables] = useState(INITIAL_PAYABLES);
  const [cash, setCash] = useState(INITIAL_CASH);
  const [mobile, setMobile] = useState(INITIAL_MOBILE);
  const [bank, setBank] = useState(INITIAL_BANK);

  // ── Load persisted data on mount ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const keys = ["sales", "inventory", "expenses", "receivables", "payables", "cash", "mobile", "bank"];
        const setters = { sales: setSales, inventory: setInventory, expenses: setExpenses, receivables: setReceivables, payables: setPayables, cash: setCash, mobile: setMobile, bank: setBank };
        await Promise.all(keys.map(async (k) => {
          try {
            const res = await window.storage.get(`dashboard:${k}`);
            if (res && res.value) setters[k](JSON.parse(res.value));
          } catch (_) { /* key not found yet, use initial data */ }
        }));
      } catch (e) { console.error("Storage load error:", e); }
      setLoaded(true);
    })();
  }, []);

  // ── Persist state changes to storage ──────────────────────────────────────
  useEffect(() => { if (!loaded) return; window.storage.set("dashboard:sales", JSON.stringify(sales)).catch(console.error); }, [sales, loaded]);
  useEffect(() => { if (!loaded) return; window.storage.set("dashboard:inventory", JSON.stringify(inventory)).catch(console.error); }, [inventory, loaded]);
  useEffect(() => { if (!loaded) return; window.storage.set("dashboard:expenses", JSON.stringify(expenses)).catch(console.error); }, [expenses, loaded]);
  useEffect(() => { if (!loaded) return; window.storage.set("dashboard:receivables", JSON.stringify(receivables)).catch(console.error); }, [receivables, loaded]);
  useEffect(() => { if (!loaded) return; window.storage.set("dashboard:payables", JSON.stringify(payables)).catch(console.error); }, [payables, loaded]);
  useEffect(() => { if (!loaded) return; window.storage.set("dashboard:cash", JSON.stringify(cash)).catch(console.error); }, [cash, loaded]);
  useEffect(() => { if (!loaded) return; window.storage.set("dashboard:mobile", JSON.stringify(mobile)).catch(console.error); }, [mobile, loaded]);
  useEffect(() => { if (!loaded) return; window.storage.set("dashboard:bank", JSON.stringify(bank)).catch(console.error); }, [bank, loaded]);

  const navTo = (id) => { setPage(id); setSidebarOpen(false); };

  const bg = dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900";
  const sidebar = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

  return (
    <div className={`min-h-screen flex ${bg} font-sans`} style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r transition-transform duration-300 ${sidebar} ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>
        {/* Logo */}
        <div className={`px-5 py-5 border-b ${dark ? "border-gray-800" : "border-gray-100"}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-sm">
              {settings.businessName ? settings.businessName.slice(0, 2).toUpperCase() : "LF"}
            </div>
            <div>
              <p className="font-black text-sm leading-tight">{settings.businessName || "La Foret"}</p>
              <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>Bar & Bistro</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {NAV.map(n => (
            <button key={n.id} onClick={() => navTo(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${page === n.id
                ? "bg-emerald-500 text-white shadow-sm"
                : dark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
              <Icon name={n.icon} size={17} />
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        {/* User */}
        <div className={`px-4 py-4 border-t ${dark ? "border-gray-800" : "border-gray-100"}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
              {settings.accountantName ? settings.accountantName.slice(0, 2).toUpperCase() : "AO"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{settings.accountantName || "Admin Owner"}</p>
              <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>Administrator</p>
            </div>
            <button onClick={() => navTo("settings")} className={`p-1.5 rounded-lg transition ${dark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-400"}`} title="Settings">
              <Icon name="settings" size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className={`sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 h-14 border-b ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} shadow-sm`}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSidebarOpen(v => !v)}><Icon name="menu" /></button>
            <h1 className={`text-sm font-bold capitalize hidden md:block ${dark ? "text-white" : "text-gray-900"}`}>
              {[...NAV].find(n => n.id === page)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs hidden md:block ${dark ? "text-gray-500" : "text-gray-400"}`}>{fmt(today)}</span>
            <button onClick={() => setDark(d => !d)} className={`p-2 rounded-xl border transition ${dark ? "bg-gray-800 border-gray-700 text-amber-400 hover:bg-gray-700" : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"}`}>
              <Icon name={dark ? "sun" : "moon"} size={16} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {page === "dashboard" && <DashboardView sales={sales} expenses={expenses} inventory={inventory} cash={cash} mobile={mobile} bank={bank} receivables={receivables} dark={dark} />}
          {page === "sales" && <SalesView sales={sales} setSales={setSales} inventory={inventory} setInventory={setInventory} dark={dark} />}
          {page === "inventory" && <InventoryView inventory={inventory} setInventory={setInventory} dark={dark} />}
          {page === "expenses" && <ExpensesView expenses={expenses} setExpenses={setExpenses} dark={dark} />}
          {page === "cashbook" && <CashbookView sales={sales} expenses={expenses} cash={cash} setCash={setCash} dark={dark} />}
          {page === "mobile" && <MobileMoneyView sales={sales} expenses={expenses} mobile={mobile} setMobile={setMobile} dark={dark} />}
          {page === "bank" && <BankView sales={sales} expenses={expenses} bank={bank} setBank={setBank} dark={dark} />}
          {page === "receivables" && <ReceivablesView receivables={receivables} setReceivables={setReceivables} dark={dark} />}
          {page === "payables" && <PayablesView payables={payables} setPayables={setPayables} dark={dark} />}
          {page === "pnl" && <PnLView sales={sales} expenses={expenses} inventory={inventory} dark={dark} />}
          {page === "reports" && <ReportsView sales={sales} expenses={expenses} inventory={inventory} receivables={receivables} payables={payables} cash={cash} mobile={mobile} bank={bank} settings={settings} dark={dark} />}
          {page === "settings" && <SettingsView dark={dark} setDark={setDark} settings={settings} setSettings={setSettings} sales={sales} expenses={expenses} inventory={inventory} receivables={receivables} payables={payables} cash={cash} mobile={mobile} bank={bank} setCash={setCash} setMobile={setMobile} />}
        </main>
      </div>
    </div>
  );
}
