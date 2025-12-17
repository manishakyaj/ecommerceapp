import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminService } from '../../services/api';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const load = async () => {
    const res = await adminService.getOrders();
    setOrders(res.data || []);
  };
  useEffect(()=>{ load(); }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <ul>
        {orders.map(o => (
          <li key={o.id} className="p-2 border-b">Order #{o.id} - ${o.total_amount} - {o.status}</li>
        ))}
      </ul>
    </AdminLayout>
  );
};

export default OrdersPage;
