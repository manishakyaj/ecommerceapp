import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { productService } from '../../services/api';

const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const load = async () => {
    const res = await productService.getProducts({ per_page: 100 });
    setProducts(res.data.products || []);
  };
  useEffect(()=>{ load(); }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>
      <table className="w-full table-auto">
        <thead><tr><th>Name</th><th>Stock</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}><td>{p.name}</td><td>{p.stock}</td></tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default InventoryPage;
