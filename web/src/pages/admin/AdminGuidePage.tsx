import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogIn,
  Plus,
  Edit,
  ToggleLeft,
  Star,
  Upload,
  Tag,
  Weight,
  Layers,
  Eye,
  CheckCircle2,
  AlertCircle,
  Info,
  Zap,
} from "lucide-react";

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  content: React.ReactNode;
}

function Step({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ffc107] text-black flex items-center justify-center text-sm font-black">
        {number}
      </div>
      <div className="flex-1 text-stone-700 font-medium leading-relaxed pt-1">
        {children}
      </div>
    </div>
  );
}

function Tip({
  type = "tip",
  children,
}: {
  type?: "tip" | "warn" | "info" | "success";
  children: React.ReactNode;
}) {
  const styles = {
    tip: {
      bg: "bg-amber-50 border-amber-200",
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      label: "Tip",
      text: "text-amber-800",
    },
    warn: {
      bg: "bg-red-50 border-red-200",
      icon: <AlertCircle className="w-4 h-4 text-red-500" />,
      label: "Warning",
      text: "text-red-800",
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: <Info className="w-4 h-4 text-blue-500" />,
      label: "Note",
      text: "text-blue-800",
    },
    success: {
      bg: "bg-green-50 border-green-200",
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      label: "Good to know",
      text: "text-green-800",
    },
  };
  const s = styles[type];
  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${s.bg}`}>
      <span className="flex-shrink-0 mt-0.5">{s.icon}</span>
      <p className={`text-sm font-medium ${s.text}`}>
        <strong>{s.label}: </strong>
        {children}
      </p>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-bold ${color}`}
    >
      {label}
    </span>
  );
}

function FieldRow({
  field,
  desc,
  required,
}: {
  field: string;
  desc: string;
  required?: boolean;
}) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-stone-100 last:border-0 items-start">
      <div className="w-40 flex-shrink-0">
        <code className="text-xs font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
          {field}
        </code>
        {required && (
          <span className="ml-1.5 text-[10px] font-bold text-red-500 uppercase">
            req
          </span>
        )}
      </div>
      <p className="text-sm text-stone-600">{desc}</p>
    </div>
  );
}

export default function AdminGuidePage() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const sections: Section[] = [
    {
      id: "login",
      icon: <LogIn className="w-5 h-5" />,
      title: "Logging In",
      color: "blue",
      content: (
        <div className="space-y-6">
          <p className="text-stone-600 leading-relaxed">
            The admin panel is protected behind a password. Only authorised
            staff can access it. Navigate to{" "}
            <code className="bg-stone-100 px-1.5 py-0.5 rounded text-sm font-bold text-stone-800">
              /admin/login
            </code>{" "}
            and enter your credentials.
          </p>

          <div className="space-y-4">
            <Step number={1}>
              Open your browser and go to{" "}
              <strong>/admin/login</strong>.
            </Step>
            <Step number={2}>
              Type the <strong>Admin Password</strong> into the password field.
            </Step>
            <Step number={3}>
              Click <strong>"Login to Dashboard"</strong>. You will be
              redirected to the main dashboard if the password is correct.
            </Step>
          </div>

          <Tip type="warn">
            Never share your admin password. If you suspect the password has
            been compromised, update the{" "}
            <code className="bg-red-100 px-1 rounded text-xs font-bold">
              ADMIN_PASSWORD
            </code>{" "}
            environment variable immediately.
          </Tip>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-2">
            <p className="text-sm font-black text-stone-800">
              How to log out:
            </p>
            <p className="text-sm text-stone-600">
              Click the <strong>Logout</strong> button at the bottom of the
              sidebar (desktop) or inside the mobile menu. You will be returned
              to the login page and your session will be cleared.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      title: "Dashboard Overview",
      color: "purple",
      content: (
        <div className="space-y-6">
          <p className="text-stone-600 leading-relaxed">
            The Dashboard is your command centre. It shows live business metrics
            and a feed of the most recent orders — all updating in real time
            without needing a page refresh.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total Products",
                desc: "All products in the database",
                color: "bg-blue-50 text-blue-600 border-blue-100",
              },
              {
                label: "Available",
                desc: "Products currently in stock",
                color: "bg-green-50 text-green-600 border-green-100",
              },
              {
                label: "Total Orders",
                desc: "All orders ever placed",
                color: "bg-purple-50 text-purple-600 border-purple-100",
              },
              {
                label: "Pending",
                desc: "Orders awaiting action",
                color: "bg-orange-50 text-orange-600 border-orange-100",
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`p-4 rounded-xl border ${card.color}`}
              >
                <p className="text-xs font-black uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="text-xs mt-1 opacity-70">{card.desc}</p>
              </div>
            ))}
          </div>

          <Tip type="info">
            The <strong>Pending Orders</strong> card pulses red when there are
            unprocessed orders. Act on these quickly to keep customers happy!
          </Tip>
        </div>
      ),
    },
    {
      id: "products",
      icon: <Package className="w-5 h-5" />,
      title: "Managing Products",
      color: "green",
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="font-black text-stone-800 text-lg border-b border-stone-100 pb-2">
              📋 Products List
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Navigate to <strong>Products</strong> in the sidebar to see all
              your products. Each row shows the product image, name, category,
              price, stock status, whether it is featured, and an edit button.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-stone-800 text-lg border-b border-stone-100 pb-2">
              <ToggleLeft className="inline w-5 h-5 mr-2 text-[#ffc107]" />
              Quick Stock Toggle
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              You can switch any product between <strong>In Stock</strong> and{" "}
              <strong>Out of Stock</strong> directly from the products list —{" "}
              <em>without opening the edit page</em>. Just click the toggle in
              the <strong>Stock</strong> column. The change takes effect
              instantly.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-stone-800 text-lg border-b border-stone-100 pb-2">
              <Plus className="inline w-5 h-5 mr-2 text-[#ffc107]" />
              Adding a New Product
            </h3>
            <div className="space-y-3">
              <Step number={1}>
                <strong>Basic Information</strong> — Enter product name, description, and category.
              </Step>
              <Step number={2}>
                <strong>Pricing Structure</strong> — Choose Weight (per Kg) or Variants (packs/sizes).
              </Step>
              <Step number={3}>
                <strong>Product Images</strong> — Upload cover photo and optional gallery photos.
              </Step>
              <Step number={4}>
                <strong>Status</strong> — Toggle Availability and Featured flags.
              </Step>
              <Step number={5}>
                Click <strong>"Create Product"</strong> to save to MySQL.
              </Step>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "orders",
      icon: <ShoppingCart className="w-5 h-5" />,
      title: "Managing Orders",
      color: "orange",
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="font-black text-stone-800 text-lg border-b border-stone-100 pb-2">
              📑 Orders List & Management
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              The Orders page shows all customer orders in real time. You can update status to
              Pending, Confirmed, Preparing, Ready, Delivered, or Cancelled, as well as toggle Payment Status (Paid / Pending).
            </p>
          </div>
        </div>
      ),
    },
  ];

  const current = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-black text-stone-900">Admin Guide & Help</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-stone-200">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeSection === section.id
                ? "bg-primary text-black shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            {section.icon}
            {section.title}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-8">
        {current.content}
      </div>
    </div>
  );
}
