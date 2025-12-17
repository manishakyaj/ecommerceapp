import React from 'react';
import { Link } from 'react-router-dom';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-white shadow p-4">
          <h2 className="text-xl font-bold mb-4">Admin</h2>
          <nav className="flex flex-col gap-2">
            <Link to="/admin/categories" className="text-blue-600">Categories</Link>
            <Link to="/admin/products" className="text-blue-600">Products</Link>
            <Link to="/admin/orders" className="text-blue-600">Orders</Link>
            <Link to="/admin/sales" className="text-blue-600">Sales</Link>
            <Link to="/admin/inventory" className="text-blue-600">Inventory</Link>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
