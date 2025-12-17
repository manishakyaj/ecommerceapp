import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminService } from '../../services/api';

const SalesPage: React.FC = () => {
  const [summary, setSummary] = useState<any>({});
  const load = async () => {
    const res = await adminService.getSales();
    setSummary(res.data || {});
  };
  useEffect(()=>{ load(); }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Sales</h1>
      <div>Total sales: ${summary.total_sales || 0}</div>
      <div>Order count: {summary.order_count || 0}</div>
    </AdminLayout>
  );
};

export default SalesPage;
