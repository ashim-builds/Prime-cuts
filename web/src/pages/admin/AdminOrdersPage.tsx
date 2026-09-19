import React from "react";
import AdminOrdersClient from "../../components/admin/AdminOrdersClient";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-stone-900">Orders</h1>
      <AdminOrdersClient />
    </div>
  );
}
