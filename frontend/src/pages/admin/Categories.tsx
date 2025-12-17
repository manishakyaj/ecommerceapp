import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminService, productService } from '../../services/api';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const load = async () => {
    const res = await productService.getCategories();
    setCategories(res.data);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    await adminService.createCategory(name, desc);
    setName(''); setDesc('');
    load();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <div className="mb-4">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="border p-2 mr-2" />
        <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" className="border p-2 mr-2" />
        <button onClick={create} className="bg-blue-600 text-white px-3 py-2">Create</button>
      </div>

      <ul>
        {categories.map(c => (
          <li key={c.id} className="p-2 border-b flex items-center justify-between">
            <div>
              <strong>{c.name}</strong>
            </div>
            <div className="flex gap-2">
              <button onClick={async ()=>{
                const newName = prompt('New name', c.name);
                if(newName) { await adminService.updateCategory(c.id, { name: newName }); load(); }
              }} className="text-sm text-blue-600">Edit</button>
              <button onClick={async ()=>{ if(confirm('Delete?')){ await adminService.deleteCategory(c.id); load(); } }} className="text-sm text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
};

export default CategoriesPage;
