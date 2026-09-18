import React from "react";
import ProductForm from "../../components/admin/ProductForm";

export default function AdminNewProductPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-black text-stone-900">Add New Product</h1>
      <ProductForm isEdit={false} />
    </div>
  );
}
