import React from "react";
import ProductForm from "../../components/admin/ProductForm";

export default function AdminNewProductPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <ProductForm isEdit={false} />
    </div>
  );
}

